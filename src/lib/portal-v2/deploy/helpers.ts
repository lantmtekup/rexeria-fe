/**
 * Portal V2 — Deploy derivations.
 *
 * Every figure on this route is a pure function of what the BE returned.
 * Nothing is cached, so a deploy or a pause can never leave a stale roll-up
 * behind — the same rule Journeys keeps.
 *
 * FORMATTING IS HAND-ROLLED ON PURPOSE. `toLocaleString()` resolves against
 * the runtime's ICU data, which differs between the Node render and the
 * browser rehydration and throws a hydration mismatch on every number. These
 * render identically in both.
 */

import type {
  RxChannel,
  RxDeployKPIsResponse,
  RxLiveItemView,
  RxReadyItemView,
} from '@/services/rexer-v2/types/deploy';
import type { BrandDomain, BrandDomainDnsRecord } from '@/services/rexer/types';
import type {
  DeployBrandDomain,
  DeployCampaignGroup,
  DeployChannel,
  DeployChannelHealth,
  DeployDomainStatus,
  DeployHealth,
  DeployTotals,
  LiveDeployRow,
  ReadyDeployRow,
} from '@/lib/portal-v2/deploy/types';

/* ── formatting ─────────────────────────────────────────────────────────── */

/** `12345 → '12,345'`. Hydration-safe. */
export const formatCount = (n: number): string => {
  const sign = n < 0 ? '-' : '';
  const digits = String(Math.abs(Math.round(n)));
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/** `12345 → '$12,345'`. */
export const formatMoney = (n: number): string => `$${formatCount(n)}`;

/* ── BE → FE mapping ────────────────────────────────────────────────────── */

export const mapChannel = (ch: RxChannel): DeployChannel => ({
  id: ch.id,
  kind: ch.kind,
  name: ch.name,
  status: ch.status,
  connected: ch.status === 'connected',
  live: ch.live,
  domainId:
    ch.kind === 'web' && typeof ch.config.domain_id === 'string'
      ? ch.config.domain_id
      : null,
});

const SLUG_FROM_PUBLIC_URL = /\/p\/([^/?#]+)\/?$/;
const EXPERIENCE_HOST_SUFFIX = '.rexerstudio.com';

/** BE hands back `<publicBase>/p/<slug>` — the pretty, shareable form is
 *  `https://<slug>.rexerstudio.com`. Shared by `mapLiveRow` (the Live row's
 *  `public_url`) and `deployBoard.ts`'s `deployCampaignItem` (the deploy
 *  response's `public_url`) so both surfaces show the same address for the
 *  same page — the row detail modal used to show the raw `<base>/p/<slug>`
 *  form because only the deploy-click response went through this. */
export const brandedExperienceUrl = (publicUrl: string): string => {
  const slug = publicUrl.match(SLUG_FROM_PUBLIC_URL)?.[1];
  return slug ? `https://${slug}${EXPERIENCE_HOST_SUFFIX}` : publicUrl;
};

/** An item's subject name — from the first experience's own subject (the BE
 *  resolves `product_id → name` there), falling back to `topic_name` for a
 *  topic item with no experience built yet. Never renders a raw uuid as if
 *  it were a name. */
const subjectNameOf = (
  item: RxLiveItemView['item'] | RxReadyItemView['item']
): string | null =>
  item.experiences?.[0]?.subject?.name ?? item.topic_name ?? null;

const experiencesOf = (
  item: RxLiveItemView['item'] | RxReadyItemView['item']
) =>
  (item.experiences ?? []).map(e => ({
    id: e.id,
    name: e.name,
    thumbnailUrl: e.thumbnail_url,
  }));

export const mapLiveRow = (view: RxLiveItemView): LiveDeployRow => ({
  id: view.item.id,
  campaignId: view.item.campaign_id,
  campaign: view.campaign,
  kind: view.item.kind,
  subjectName: subjectNameOf(view.item),
  experiences: experiencesOf(view.item),
  ownerId: view.item.owner_id,
  channels: view.channels.map(
    (c): DeployChannelHealth => ({
      channelId: c.channel_id,
      kind: c.kind,
      name: c.name,
      deploymentId: c.deployment_id,
      health: c.health,
      reason: c.health_reason,
    })
  ),
  publicUrl: view.public_url ? brandedExperienceUrl(view.public_url) : null,
  productId: view.item.product_id,
});

export const mapReadyRow = (view: RxReadyItemView): ReadyDeployRow => ({
  id: view.item.id,
  campaignId: view.item.campaign_id,
  campaign: view.campaign,
  kind: view.item.kind,
  subjectName: subjectNameOf(view.item),
  experiences: experiencesOf(view.item),
  ownerId: view.item.owner_id,
  blockers: view.blockers ?? [],
});

/* ── health ─────────────────────────────────────────────────────────────── */

/** Precedence when a row carries several channels — most-actionable first,
 *  mirroring `core.DeploymentHealth`'s own precedence order. */
const HEALTH_RANK: Record<DeployHealth, number> = {
  broken: 0,
  stale: 1,
  quiet: 2,
  ok: 3,
};

/** The worst health across a row's channels — what a summary cell shows. */
export const worstHealth = (states: DeployHealth[]): DeployHealth =>
  states.reduce<DeployHealth>(
    (worst, s) => (HEALTH_RANK[s] < HEALTH_RANK[worst] ? s : worst),
    'ok'
  );

/* ── selection / lookup ─────────────────────────────────────────────────── */

export const findChannel = (
  channels: DeployChannel[],
  id: string
): DeployChannel | null => channels.find(c => c.id === id) ?? null;

export const resolveChannel = (
  channels: DeployChannel[],
  id: string
): DeployChannel | null => findChannel(channels, id);

/**
 * The Deploy button's client-side gate. It intentionally checks less than
 * the BE does — `core.CheckDeployPreconditions` also requires an active
 * release and resolved journeys, neither of which is knowable from this
 * screen without attempting the call. What IS knowable client-side: at least
 * one channel picked, every picked channel connected, and no precomputed
 * media-rights blocker. Anything else fails as a 409 with the real reason.
 */
export const canDeploySelection = (
  selectedChannelIds: string[],
  channels: DeployChannel[],
  blockers: string[] = []
): boolean =>
  selectedChannelIds.length > 0 &&
  blockers.length === 0 &&
  selectedChannelIds.every(id => findChannel(channels, id)?.connected);

/* ── domain ─────────────────────────────────────────────────────────────── */

/** RFC-1035-ish — enough to catch a typo without becoming its own bug. Ported
 *  from the legacy `/portal/profile/domains` validator so the two routes
 *  agree on what a domain looks like. */
const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export const isValidDomain = (value: string): boolean =>
  DOMAIN_RE.test(value.trim());

/** `BrandDomain` → what this route reads — the same job `beDomainToLocal`
 *  does for `/portal/profile/domains`. `tls_status` is deliberately not read
 *  here: `DeployDomainStatus` only distinguishes what this route shows, and
 *  TLS finishing is not something the connect flow blocks on. */
export const mapBrandDomain = (
  d: BrandDomain,
  dnsRecords?: BrandDomainDnsRecord[]
): DeployBrandDomain => {
  const status: DeployDomainStatus =
    d.status === 'verifying'
      ? 'verifying'
      : d.status === 'verified'
        ? 'connected'
        : d.status === 'failed'
          ? 'error'
          : 'pending';

  return {
    id: d.id,
    domain: d.domain,
    status,
    verificationToken: d.verification_token,
    failureReason: d.failure_reason,
    // Chỉ create trả `dns_records`; list không → để undefined, UI fallback.
    ...(dnsRecords?.length
      ? {
          dnsRecords: dnsRecords.map(r => ({
            type: r.type,
            name: r.name,
            value: r.value,
          })),
        }
      : {}),
  };
};

export const findDomain = (
  domains: DeployBrandDomain[],
  id: string
): DeployBrandDomain | null => domains.find(d => d.id === id) ?? null;

/* ── domain, fallback-only ──────────────────────────────────────────────────
   Everything below this line exists for exactly one situation: brandId could
   not be resolved, or `rexerApi.brands.domains.*` is unreachable (no BE in
   local dev, network down). The domain connect flow is the only caller, and
   only on that branch. */

/** A short, stable string — never re-derived from the typed domain. */
const seed = (input: string): number => {
  let h = 0;
  for (const ch of input) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return h;
};

/** A fake but stable id/token pair for a domain created while offline. */
export const fakeDomainId = (domain: string): string =>
  `fake-${seed(domain.trim().toLowerCase()).toString(16)}`;

export const fakeVerificationToken = (domain: string): string =>
  `rxr_verify_${seed(domain.trim().toLowerCase()).toString(16).padStart(4, '0')}`;

/** Stands in for the DNS check when there is no BE to ask. Deterministic so
 *  it never flips on a re-render or after hydration. */
export const simulateDomainStatus = (value: string): 'connected' | 'error' => {
  const s = seed(value.trim().toLowerCase());
  return s % 6 === 0 ? 'error' : 'connected';
};

/* ── roll-ups ───────────────────────────────────────────────────────────── */

/**
 * The header band's numbers. `kpis` is `null` while `/deploy/kpis` is still
 * loading or failed — `sessions`/`revenue` stay `null` rather than reading as
 * a measured zero.
 */
export const deployTotals = (
  live: LiveDeployRow[],
  ready: ReadyDeployRow[],
  channels: DeployChannel[],
  kpis: RxDeployKPIsResponse | null
): DeployTotals => {
  const issues = live.filter(
    r => worstHealth(r.channels.map(c => c.health)) !== 'ok'
  ).length;

  const cvr =
    kpis && kpis.sessions > 0
      ? `${((kpis.converted / kpis.sessions) * 100).toFixed(1)}%`
      : '—';

  return {
    live: live.length,
    ready: ready.length,
    sessions: kpis?.sessions ?? null,
    revenue: kpis ? Math.round(kpis.revenue_cents / 100) : null,
    cvr,
    issues,
    channels: channels.filter(c => c.live).length,
  };
};

/** Groups the Live tab by campaign, because that is how the work is owned —
 *  a person answers for a campaign, never for a row. */
export const groupByCampaign = (
  rows: LiveDeployRow[]
): DeployCampaignGroup[] => {
  const order: string[] = [];
  const byId = new Map<string, DeployCampaignGroup>();

  for (const row of rows) {
    const existing = byId.get(row.campaignId);
    const rowIssue = worstHealth(row.channels.map(c => c.health)) !== 'ok';
    if (existing) {
      existing.rows.push(row);
      if (rowIssue) existing.issues += 1;
      continue;
    }
    order.push(row.campaignId);
    byId.set(row.campaignId, {
      campaign: row.campaign,
      rows: [row],
      issues: rowIssue ? 1 : 0,
    });
  }

  return order.flatMap(id => {
    const group = byId.get(id);
    return group ? [group] : [];
  });
};

/** What one channel is carrying, right now — the channel card + list. No
 *  sessions here: the flat live list carries none. `ChannelDetailModal`
 *  fetches `GET /channels/:id` separately for the real per-campaign figure. */
export const channelStats = (
  channelId: string,
  live: LiveDeployRow[]
): { rows: LiveDeployRow[]; issues: number } => {
  const rows = live.filter(r =>
    r.channels.some(c => c.channelId === channelId)
  );
  return {
    rows,
    issues: rows.filter(
      r =>
        worstHealth(
          r.channels.filter(c => c.channelId === channelId).map(c => c.health)
        ) !== 'ok'
    ).length,
  };
};
