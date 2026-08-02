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

import type {
  DeployBoard,
  DeployCampaignGroup,
  DeployChannel,
  DeployChannelStats,
  DeployStatus,
  DeployTotals,
  Deployment,
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
