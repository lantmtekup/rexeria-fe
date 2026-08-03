/**
 * Portal V2 — Deploy seed.
 *
 * The prototype derives Deploy's rows from `CAMPAIGNS` (~L9481): every item at
 * `live` or `ready`, crossed with the experiences on it. That join is
 * reproduced here row for row — three live campaigns, one ready queue — with
 * the experience records from `DATA.experiences` (~L5542) and the six
 * publishing surfaces of `DATA.channels` (~L7778).
 *
 * TWO DELIBERATE DIVERGENCES FROM THE PROTOTYPE.
 *
 * 1. `ops` is written out, not seeded from a hash. There, the figures came
 *    from `opsFor()` over a fact table Portal V2 does not have; hashing the id
 *    instead produced eight healthy rows and an Issues counter stuck on zero —
 *    which hides the three states the Live tab exists to surface. These are
 *    hand-authored so `broken`, `quiet` and `stale` each appear once, and they
 *    are constants: identical during SSR and after hydration, by construction.
 *
 * 2. Spring Sale's shade-finder item is `ready` here; the prototype has it at
 *    `building`. With prototype fidelity the queue holds exactly one card,
 *    which demonstrates neither the channel picker nor the "deploy to N
 *    channels" count. Nothing else about the row is invented.
 *
 * A row waiting in the queue reports nothing, and `cvr: '—'` says so — zero is
 * a measurement, and no measurement has been taken. It keeps saying so after
 * it goes live, until traffic actually arrives.
 */

import type {
  DeployBoard,
  DeployChannel,
  Deployment,
} from '@/lib/portal-v2/deploy/types';

/** `DATA.channels` — six surfaces, three of them connected. */
export const MOCK_CHANNELS: DeployChannel[] = [
  {
    id: 'ch1',
    name: 'Web microsite',
    abbr: 'W',
    connected: true,
    tint: 'var(--pv2-violet)',
    body: 'Hosted on rexer.link with your domain. Instant publish, no rebuild.',
  },
  {
    id: 'ch2',
    name: 'Instagram',
    abbr: 'IG',
    connected: true,
    tint: 'var(--pv2-error)',
    body: 'Story and Reels entry points feed straight into the journey.',
  },
  {
    id: 'ch3',
    name: 'Email',
    abbr: '@',
    connected: true,
    tint: 'var(--pv2-warning)',
    body: 'Blocks render as email-safe HTML. Same content, same tracking.',
  },
  {
    id: 'ch4',
    name: 'Retail QR',
    abbr: 'QR',
    connected: false,
    tint: 'var(--pv2-blue-500)',
    body: 'In-store code that opens the AR showcase on the shopper’s phone.',
  },
  {
    id: 'ch5',
    name: 'Paid social',
    abbr: 'PS',
    connected: false,
    tint: 'var(--pv2-success)',
    body: 'Push a block as a Smart Ad. Creative stays in sync with the journey.',
  },
  {
    id: 'ch6',
    name: 'Shopify',
    abbr: 'S',
    connected: false,
    tint: 'var(--pv2-slate-500)',
    body: 'Sync products and push completed journeys onto product pages.',
  },
];

/* ── the campaigns behind the rows ──────────────────────────────────────── */

const LAUNCH = {
  id: 'm1',
  name: 'Super Serum Launch',
  type: 'launch' as const,
  owner: 'Toan Nguyen',
  start: '2026-06-12',
  end: null,
};

const CHRISTMAS = {
  id: 'm3',
  name: 'Christmas 2026',
  type: 'seasonal' as const,
  owner: 'Maya Okonjo',
  start: '2026-11-01',
  end: '2026-12-26',
};

const CLEAN = {
  id: 'm4',
  name: 'Clean Beauty ’26',
  type: 'always' as const,
  owner: 'Maya Okonjo',
  start: '2026-01-08',
  end: '2026-04-30',
};

const SPRING = {
  id: 'm2',
  name: 'Spring Sale',
  type: 'sale' as const,
  owner: 'Toan Nguyen',
  start: '2027-03-03',
  end: '2027-03-17',
};

/* ── the experiences on them ────────────────────────────────────────────── */

const SHADE_FINDER = {
  id: 'e1',
  name: 'Shade Finder',
  category: 'microsite',
  grad: 'linear-gradient(135deg,#6C4CF1,#9B7DF8)',
};

const SERUM_360 = {
  id: 'e2',
  name: 'Super Serum 360°',
  category: 'showcase',
  grad: 'linear-gradient(135deg,#3B82D6,#6FA8E5)',
};

const GIFT_EDIT = {
  id: 'e3',
  name: 'Holiday Gift Edit',
  category: 'showcase',
  grad: 'linear-gradient(135deg,#13B57F,#3ED2A0)',
};

const CLEAN_EDIT = {
  id: 'e4',
  name: 'The Clean Edit',
  category: 'curated',
  grad: 'linear-gradient(135deg,#E89A3C,#F2BE7C)',
};

const TINT_VS_FOUNDATION = {
  id: 'e6',
  name: 'Tint vs. Foundation',
  category: 'curated',
  grad: 'linear-gradient(135deg,#5334D6,#8B6BF5)',
};

const FOUNDERS_NOTE = {
  id: 'e8',
  name: 'Founder’s Note',
  category: 'curated',
  grad: 'linear-gradient(135deg,#1E1930,#3D3950)',
};

/* ── the subjects the work is about ─────────────────────────────────────── */

const SKIN_TINT = { name: 'Super Serum Skin Tint', kind: 'product' as const };
const FACE_MILK = { name: 'The Base Face Milk', kind: 'product' as const };
const GIFT_GUIDE = { name: 'The Gift Guide', kind: 'topic' as const };

/** Nothing has reported yet — not the same as nothing happened. */
const NO_SIGNAL_YET = {
  sessions: 0,
  cvr: '—',
  trend: 0,
  errors: 0,
  health: 'ok' as const,
  revenue: 0,
};

export const MOCK_DEPLOYMENTS: Deployment[] = [
  /* ── m1 · Super Serum Launch — the full launch journey, out since June ── */
  {
    id: 'd-m1-i9-e2',
    status: 'live',
    experience: SERUM_360,
    campaign: LAUNCH,
    subject: SKIN_TINT,
    owner: 'Toan Nguyen',
    channels: ['ch1', 'ch2', 'ch3'],
    since: '2026-06-12',
    ops: {
      sessions: 412,
      cvr: '5.2%',
      trend: 8,
      errors: 0,
      health: 'ok',
      revenue: 1840,
    },
  },
  {
    id: 'd-m1-i9-e1',
    status: 'live',
    experience: SHADE_FINDER,
    campaign: LAUNCH,
    subject: SKIN_TINT,
    owner: 'Toan Nguyen',
    channels: ['ch1', 'ch2', 'ch3'],
    since: '2026-06-12',
    ops: {
      sessions: 268,
      cvr: '6.4%',
      trend: 3,
      errors: 0,
      health: 'ok',
      revenue: 1490,
    },
  },
  {
    /* serving fine, reporting badly — the failure Deploy is meant to catch */
    id: 'd-m1-i9-e6',
    status: 'live',
    experience: TINT_VS_FOUNDATION,
    campaign: LAUNCH,
    subject: SKIN_TINT,
    owner: 'Toan Nguyen',
    channels: ['ch1', 'ch2', 'ch3'],
    since: '2026-06-20',
    ops: {
      sessions: 154,
      cvr: '4.1%',
      trend: -6,
      errors: 2,
      health: 'broken',
      revenue: 610,
    },
  },
  {
    /* live for months, reporting almost nothing: nobody is arriving */
    id: 'd-m1-i9-e8',
    status: 'live',
    experience: FOUNDERS_NOTE,
    campaign: LAUNCH,
    subject: SKIN_TINT,
    owner: 'Toan Nguyen',
    channels: ['ch1', 'ch3'],
    since: '2026-07-04',
    ops: {
      sessions: 41,
      cvr: '1.9%',
      trend: -2,
      errors: 0,
      health: 'quiet',
      revenue: 120,
    },
  },

  /* ── m3 · Christmas 2026 — a topic, not a SKU, running the gift journey ── */
  {
    id: 'd-m3-i4-e3',
    status: 'live',
    experience: GIFT_EDIT,
    campaign: CHRISTMAS,
    subject: GIFT_GUIDE,
    owner: 'Maya Okonjo',
    channels: ['ch1', 'ch3'],
    since: '2026-11-01',
    ops: {
      sessions: 508,
      cvr: '7.1%',
      trend: 21,
      errors: 0,
      health: 'ok',
      revenue: 4380,
    },
  },
  {
    id: 'd-m3-i4-e1',
    status: 'live',
    experience: SHADE_FINDER,
    campaign: CHRISTMAS,
    subject: GIFT_GUIDE,
    owner: 'Maya Okonjo',
    channels: ['ch1', 'ch3'],
    since: '2026-11-01',
    ops: {
      sessions: 336,
      cvr: '4.8%',
      trend: 12,
      errors: 0,
      health: 'ok',
      revenue: 2210,
    },
  },
  {
    id: 'd-m3-i4-e4',
    status: 'live',
    experience: CLEAN_EDIT,
    campaign: CHRISTMAS,
    subject: GIFT_GUIDE,
    owner: 'Maya Okonjo',
    channels: ['ch1'],
    since: '2026-11-04',
    ops: {
      sessions: 122,
      cvr: '3.2%',
      trend: -4,
      errors: 0,
      health: 'ok',
      revenue: 540,
    },
  },

  /* ── m4 · Clean Beauty ’26 — the campaign ended, the page never came down ── */
  {
    id: 'd-m4-i10-e4',
    status: 'live',
    experience: CLEAN_EDIT,
    campaign: CLEAN,
    subject: FACE_MILK,
    owner: 'Maya Okonjo',
    channels: ['ch1'],
    since: '2026-01-08',
    ops: {
      sessions: 87,
      cvr: '2.4%',
      trend: -9,
      errors: 0,
      health: 'stale',
      revenue: 210,
    },
  },

  /* ── the queue — finished by a campaign, waiting on a person here ──────── */
  {
    id: 'd-m3-i1-e3',
    status: 'ready',
    experience: GIFT_EDIT,
    campaign: CHRISTMAS,
    subject: SKIN_TINT,
    owner: 'Maya Okonjo',
    channels: ['ch1', 'ch3'],
    since: null,
    ops: NO_SIGNAL_YET,
  },
  {
    id: 'd-m2-i5-e1',
    status: 'ready',
    experience: SHADE_FINDER,
    campaign: SPRING,
    subject: SKIN_TINT,
    owner: 'Maya Okonjo',
    channels: ['ch1', 'ch2'],
    since: null,
    ops: NO_SIGNAL_YET,
  },
];

export const MOCK_DEPLOY_BOARD: DeployBoard = {
  channels: MOCK_CHANNELS,
  deployments: MOCK_DEPLOYMENTS,
};

/** A fresh copy — the seed is module-level, so state must never alias it. */
export const cloneDeployBoard = (board: DeployBoard): DeployBoard => ({
  channels: board.channels.map(c => ({ ...c })),
  deployments: board.deployments.map(d => ({
    ...d,
    channels: [...d.channels],
    ops: { ...d.ops },
  })),
});
