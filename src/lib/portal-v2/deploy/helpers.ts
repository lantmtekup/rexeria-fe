/**
 * Portal V2 — Deploy derivations.
 *
 * Every figure on this route is a pure function of the board. Nothing is
 * cached, so a deploy or a pause can never leave a stale roll-up behind —
 * the same rule Journeys keeps.
 *
 * FORMATTING IS HAND-ROLLED ON PURPOSE. `toLocaleString()` resolves against
 * the runtime's ICU data, which differs between the Node render and the
 * browser rehydration and throws a hydration mismatch on every number. These
 * render identically in both.
 */

import { DEPLOY_DOMAIN_CHANNEL_ID } from '@/lib/portal-v2/deploy/constants';
import type {
  DeployBoard,
  DeployBrandDomain,
  DeployCampaignGroup,
  DeployChannel,
  DeployChannelStats,
  DeployDomainStatus,
  DeployStatus,
  DeployTotals,
  Deployment,
} from '@/lib/portal-v2/deploy/types';
import type { BrandDomain } from '@/services/rexer/types';

/* ── formatting ─────────────────────────────────────────────────────────── */

/** `12345 → '12,345'`. Hydration-safe. */
export const formatCount = (n: number): string => {
  const sign = n < 0 ? '-' : '';
  const digits = String(Math.abs(Math.round(n)));
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/** `12345 → '$12,345'`. */
export const formatMoney = (n: number): string => `$${formatCount(n)}`;

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** `'2026-06-12' → '12 Jun 2026'`. Null-safe, and never parses a Date. */
export const formatDate = (iso: string | null): string | null => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-');
  const month = MONTHS[Number(m) - 1];
  if (!y || !month || !d) return iso;
  return `${Number(d)} ${month} ${y}`;
};

/** `fmtRange` — `'1 Nov 2026 → 26 Dec 2026'`, `ongoing` when open-ended. */
export const formatRange = (
  start: string,
  end: string | null,
  ongoingLabel: string
): string => `${formatDate(start) ?? '—'} → ${formatDate(end) ?? ongoingLabel}`;

/* ── selection ──────────────────────────────────────────────────────────── */

export const deploymentsByStatus = (
  board: DeployBoard,
  status: DeployStatus
): Deployment[] => board.deployments.filter(d => d.status === status);

export const findChannel = (
  channels: DeployChannel[],
  id: string
): DeployChannel | null => channels.find(c => c.id === id) ?? null;

export const connectedChannels = (channels: DeployChannel[]): DeployChannel[] =>
  channels.filter(c => c.connected);

/** Resolve ids to records, dropping any the registry no longer carries. */
export const resolveChannels = (
  channels: DeployChannel[],
  ids: string[]
): DeployChannel[] =>
  ids.flatMap(id => {
    const found = findChannel(channels, id);
    return found ? [found] : [];
  });

/* ── domain ─────────────────────────────────────────────────────────────── */

/**
 * RFC-1035-ish — enough to catch a typo without becoming its own bug. Ported
 * from the legacy `/portal/profile/domains` validator so the two routes agree
 * on what a domain looks like, and so a bad domain never reaches
 * `rexerApi.brands.domains.create`.
 */
const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export const isValidDomain = (value: string): boolean =>
  DOMAIN_RE.test(value.trim());

/**
 * `BrandDomain` → what this route reads — the same job `beDomainToLocal` does
 * for `/portal/profile/domains`. `tls_status` is deliberately not read here:
 * `DeployDomainStatus` only distinguishes what this route gates on, and TLS
 * finishing is not something Deploy blocks on (see `types.ts`).
 */
export const mapBrandDomain = (d: BrandDomain): DeployBrandDomain => {
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
  };
};

export const findDomain = (
  domains: DeployBrandDomain[],
  id: string
): DeployBrandDomain | null => domains.find(d => d.id === id) ?? null;

/**
 * Only `ch1` (Web microsite) is hosted on a domain of its own — the other
 * five pipes serve through a platform that already has one.
 */
export const rowNeedsDomain = (channelIds: string[]): boolean =>
  channelIds.includes(DEPLOY_DOMAIN_CHANNEL_ID);

/* ── domain, fallback-only ──────────────────────────────────────────────────
   Everything below this line exists for exactly one situation: brandId could
   not be resolved, or `rexerApi.brands.domains.*` is unreachable (no BE in
   local dev, network down). `DeployWorkspace` is the only caller, and only on
   that branch — the live path never touches this. */

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

/**
 * Stands in for the DNS check when there is no BE to ask. Deterministic so it
 * never flips on a re-render or after hydration — it exists to demo the two
 * outcomes a real check would return, not to check anything.
 */
export const simulateDomainStatus = (value: string): 'connected' | 'error' => {
  const s = seed(value.trim().toLowerCase());
  return s % 6 === 0 ? 'error' : 'connected';
};

/* ── roll-ups ───────────────────────────────────────────────────────────── */

/** `deployTotals` — the five numbers the header band states. */
export const deployTotals = (board: DeployBoard): DeployTotals => {
  const live = deploymentsByStatus(board, 'live');
  const ready = deploymentsByStatus(board, 'ready');

  const sessions = live.reduce((n, r) => n + r.ops.sessions, 0);
  const revenue = live.reduce((n, r) => n + r.ops.revenue, 0);
  const issues = live.filter(r => r.ops.health !== 'ok').length;
  const channels = new Set(live.flatMap(r => r.channels)).size;

  /**
   * Only rows that have actually reported. A just-published row carries
   * `cvr: '—'`, and averaging it in as a zero would drag the mean down with a
   * measurement nobody took.
   */
  const measured = live
    .map(r => parseFloat(r.ops.cvr))
    .filter(n => Number.isFinite(n));
  const cvr = measured.length
    ? `${(measured.reduce((n, x) => n + x, 0) / measured.length).toFixed(1)}%`
    : '—';

  return {
    live: live.length,
    ready: ready.length,
    sessions,
    revenue,
    issues,
    channels,
    cvr,
  };
};

/**
 * `dLive` groups by campaign, because that is how the work is owned — a person
 * answers for a campaign, never for a row.
 */
export const groupByCampaign = (rows: Deployment[]): DeployCampaignGroup[] => {
  const order: string[] = [];
  const byId = new Map<string, DeployCampaignGroup>();

  for (const row of rows) {
    const existing = byId.get(row.campaign.id);
    if (existing) {
      existing.rows.push(row);
      existing.sessions += row.ops.sessions;
      if (row.ops.health !== 'ok') existing.issues += 1;
      continue;
    }
    order.push(row.campaign.id);
    byId.set(row.campaign.id, {
      campaign: row.campaign,
      rows: [row],
      sessions: row.ops.sessions,
      issues: row.ops.health === 'ok' ? 0 : 1,
    });
  }

  return order.flatMap(id => {
    const group = byId.get(id);
    return group ? [group] : [];
  });
};

/** What one channel is carrying, right now. */
export const channelStats = (
  channelId: string,
  live: Deployment[]
): DeployChannelStats => {
  const rows = live.filter(r => r.channels.includes(channelId));
  return {
    rows,
    sessions: rows.reduce((n, r) => n + r.ops.sessions, 0),
    issues: rows.filter(r => r.ops.health !== 'ok').length,
    campaigns: new Set(rows.map(r => r.campaign.id)).size,
  };
};

/* ── transitions ────────────────────────────────────────────────────────── */

/**
 * Toggle one channel on a ready row's selection.
 *
 * A row with no channels cannot be deployed, so the caller can trust that an
 * empty selection means the Deploy button is disabled — not that it will
 * publish to everything.
 */
export const toggleRowChannel = (
  deployments: Deployment[],
  rowId: string,
  channelId: string
): Deployment[] =>
  deployments.map(row => {
    if (row.id !== rowId) return row;
    const on = row.channels.includes(channelId);
    return {
      ...row,
      channels: on
        ? row.channels.filter(id => id !== channelId)
        : [...row.channels, channelId],
    };
  });

/**
 * Point a ready row at one of the brand's domains — or clear the selection.
 * The domain itself is not copied onto the row; only its id is, the same way
 * `channels` holds ids rather than `DeployChannel` records.
 */
export const setRowDomainId = (
  deployments: Deployment[],
  rowId: string,
  domainId: string | null
): Deployment[] =>
  deployments.map(row => (row.id === rowId ? { ...row, domainId } : row));

/**
 * The Deploy button's gate. A channel is always required; `ch1` additionally
 * needs its selected domain to have actually cleared verification —
 * `pending`, `verifying` and `error` all block. A domain that has never been
 * checked, or was checked and failed, is not a fact this route gets to
 * publish as if it were.
 */
export const canDeployRow = (
  row: Deployment,
  domains: DeployBrandDomain[]
): boolean => {
  if (!row.channels.length) return false;
  if (!rowNeedsDomain(row.channels)) return true;
  const domain = row.domainId ? findDomain(domains, row.domainId) : null;
  return domain?.status === 'connected';
};

/**
 * Ready → Live. `since` is stamped by the caller: this route runs the clock
 * only inside an event handler, never during a render.
 */
export const markLive = (
  deployments: Deployment[],
  rowId: string,
  since: string
): Deployment[] =>
  deployments.map(row =>
    row.id === rowId ? { ...row, status: 'live' as const, since } : row
  );

/**
 * Live → Ready. The channel selection survives the pause — pausing is not
 * unpicking, and re-deploying should not mean choosing again.
 */
export const markReady = (
  deployments: Deployment[],
  rowId: string
): Deployment[] =>
  deployments.map(row =>
    row.id === rowId ? { ...row, status: 'ready' as const, since: null } : row
  );

/**
 * Connect or disconnect a pipe.
 *
 * Disconnecting drops the channel from every ready selection — leaving a dead
 * channel picked would let Deploy claim a surface that cannot serve. Live rows
 * keep it: what is already out there is a fact, and the issue counter is where
 * that shows up, not a silent rewrite of history.
 */
export const toggleChannel = (
  board: DeployBoard,
  channelId: string
): DeployBoard => {
  const channels = board.channels.map(c =>
    c.id === channelId ? { ...c, connected: !c.connected } : c
  );
  const nowOff = channels.some(c => c.id === channelId && !c.connected);

  return {
    channels,
    deployments: nowOff
      ? board.deployments.map(row =>
          row.status === 'ready' && row.channels.includes(channelId)
            ? { ...row, channels: row.channels.filter(id => id !== channelId) }
            : row
        )
      : board.deployments,
  };
};
