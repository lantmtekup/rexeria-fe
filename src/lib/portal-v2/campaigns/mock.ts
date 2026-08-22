import { MOCK_PRODUCTS } from '@/lib/portal-v2/product/mock';
import type {
  CampaignExperience,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';

/**
 * The Campaigns seed — the four campaigns of `plan-v2/rexer-demo-v3.html`
 * (:15694), one per lifecycle phase so every screen has something true to show:
 *
 *   m2 Spring Sale        planning  → the plan gate, with real gaps
 *   m3 Christmas 2026     building  → the work, with a ship gate that refuses
 *   m1 Super Serum Launch live      → in-market numbers
 *   m4 Clean Beauty '26   done      → the verdict, and a journey worth promoting
 *
 * Ids match the media folders and the fact table (`MOCK_FACT_ROWS`), so a
 * campaign's assets stay filed and its numbers reconcile.
 */

/**
 * The catalogue, as a campaign needs it: an id and a name. Campaigns never
 * reach for the rest of a product — the subject rows only have to be nameable.
 */
export const CAMPAIGN_PRODUCTS: { id: string; name: string }[] =
  MOCK_PRODUCTS.filter(p => p.status === 'active').map(p => ({
    id: p.id,
    name: p.title,
  }));

export const CAMPAIGN_PRODUCT_NAMES: Record<string, string> =
  Object.fromEntries(MOCK_PRODUCTS.map(p => [p.id, p.title]));

const productTitle = (id: string): string => CAMPAIGN_PRODUCT_NAMES[id] ?? id;

/* ── the experience library ─────────────────────────────────────────────── */

/**
 * The masters. `productId` records who a master was authored to speak about —
 * null means it is subject-agnostic and fits anything. `coverage` is the share
 * of its blocks and components carrying a signal, which is what decides whether
 * shipping it would teach us anything (`SHIP_TRACK_FLOOR`).
 */
const MASTERS: CampaignExperience[] = [
  {
    id: 'e1',
    name: 'Shade Finder',
    slug: 'shade-finder',
    summary: 'Four questions, one match, and the shade stops being a guess.',
    coverage: 0.42,
    productId: 'p1',
    template: true,
    origin: null,
    campaign: null,
  },
  {
    id: 'e2',
    name: 'Super Serum 360°',
    slug: 'super-serum-360',
    summary: 'The bottle, turned. Every angle, every claim on the label.',
    coverage: 0.68,
    productId: 'p1',
    template: true,
    origin: null,
    campaign: null,
  },
  {
    id: 'e3',
    name: 'Holiday Gift Edit',
    slug: 'holiday-gift-edit',
    summary: 'A shoppable edit built to be given, not kept.',
    coverage: 0.55,
    productId: null,
    template: true,
    origin: null,
    campaign: null,
  },
  {
    id: 'e4',
    name: 'The Clean Edit',
    slug: 'the-clean-edit',
    summary: 'What clean means here, ingredient by ingredient.',
    coverage: 0.34,
    productId: 'p4',
    template: true,
    origin: null,
    campaign: null,
  },
  {
    id: 'e5',
    name: 'Which Finish Are You?',
    slug: 'which-finish-are-you',
    summary: 'A finish quiz that ends on a product, not a personality.',
    coverage: 0.26,
    productId: null,
    template: true,
    origin: null,
    campaign: null,
  },
  {
    id: 'e6',
    name: 'Tint vs. Foundation',
    slug: 'tint-vs-foundation',
    summary: 'The comparison the category never makes honestly.',
    coverage: 0.47,
    productId: 'p1',
    template: true,
    origin: null,
    campaign: null,
  },
  {
    id: 'e7',
    name: 'Ingredient Deep Dive',
    slug: 'ingredient-deep-dive',
    summary: 'The long read. Almost none of it is measured yet.',
    coverage: 0.11,
    productId: 'p4',
    template: true,
    origin: null,
    campaign: null,
  },
  {
    id: 'e8',
    name: "Founder's Note",
    slug: 'founders-note',
    summary: 'Why this exists, from the person who made it.',
    coverage: 0.29,
    productId: null,
    template: true,
    origin: null,
    campaign: null,
  },
  {
    id: 'e9',
    name: '360 Serum Reveal',
    slug: '360-serum-reveal',
    summary: 'A reveal built for the feed, not the shelf.',
    coverage: 0.36,
    productId: 'p1',
    template: true,
    origin: null,
    campaign: null,
  },
];

/** `x-{origin}-{campaign}-{subject}` — origin × campaign × subject IS the copy. */
export const experienceCopyId = (
  origin: string,
  campaignId: string,
  subjectRef: string
): string => `x-${origin}-${campaignId}-${subjectRef}`;

/**
 * Fork a master onto one subject of one campaign — the prototype's
 * `copyForCampaign` (:20100). A copy inherits the master's words, so it also
 * inherits whichever product those words were written for: that is exactly what
 * the ship gate's "right words" check reads.
 */
export const forkExperience = (
  master: CampaignExperience,
  campaignId: string,
  campaignName: string,
  subjectRef: string,
  subjectName: string,
  patch: Partial<CampaignExperience> = {}
): CampaignExperience => ({
  ...master,
  id: experienceCopyId(master.id, campaignId, subjectRef),
  name: `${master.name} — ${subjectName} · ${campaignName}`,
  template: false,
  origin: master.id,
  campaign: campaignId,
  ...patch,
});

const master = (id: string): CampaignExperience => {
  const found = MASTERS.find(m => m.id === id);
  if (!found) throw new Error(`Unknown experience master: ${id}`);
  return found;
};

/** One campaign's copies, forked from masters onto a single subject. */
const copies = (
  campaignId: string,
  campaignName: string,
  subjectRef: string,
  subjectName: string,
  origins: string[],
  patch: Partial<CampaignExperience> = {}
): CampaignExperience[] =>
  origins.map(origin =>
    forkExperience(
      master(origin),
      campaignId,
      campaignName,
      subjectRef,
      subjectName,
      patch
    )
  );

const CHRISTMAS = 'Christmas 2026';
const SPRING = 'Spring Sale';
const LAUNCH = 'Super Serum Launch';
const CLEAN = "Clean Beauty '26";

const COPIES: CampaignExperience[] = [
  /* m3 — the gift bundle leans on the edit, which speaks about no product in
     particular and therefore fits the hero without a rewrite. */
  ...copies('m3', CHRISTMAS, 'p1', productTitle('p1'), ['e3']),
  /* The blush showcase runs the serum's 360°: authored for p1, filed under p2,
     never adapted. The ship gate refuses to let it reach Ready — the prototype's
     "right words" check, and the reason it exists. */
  ...copies('m3', CHRISTMAS, 'p2', productTitle('p2'), ['e2']),
  ...copies('m3', CHRISTMAS, 'p4', productTitle('p4'), ['e1', 'e3', 'e4']),
  /* The gift guide is a topic: it speaks for itself, so nothing to adapt. */
  ...copies('m3', CHRISTMAS, 'i4', 'The Gift Guide', ['e1', 'e3', 'e4']),

  /* m2 — the shade finder lost most of its tracking in the rebuild. Built and
     dated, but nowhere near the floor: Ready stays out of reach. */
  ...copies('m2', SPRING, 'p1', productTitle('p1'), ['e1'], {
    coverage: 0.14,
  }),

  /* m1 — the full Product Launch route, all of it live and measured. */
  ...copies('m1', LAUNCH, 'p1', productTitle('p1'), ['e2', 'e1', 'e6', 'e8']),

  /* m4 — one editorial page, and the highest email opt-in of anything we run. */
  ...copies('m4', CLEAN, 'p4', productTitle('p4'), ['e4']),
];

export const MOCK_CAMPAIGN_EXPERIENCES: CampaignExperience[] = [
  ...MASTERS,
  ...COPIES,
];

const expIds = (
  campaignId: string,
  subjectRef: string,
  origins: string[]
): string[] =>
  origins.map(origin => experienceCopyId(origin, campaignId, subjectRef));

/* ── the campaigns ──────────────────────────────────────────────────────── */

export const MOCK_CAMPAIGNS: CampaignView[] = [
  {
    id: 'm3',
    name: CHRISTMAS,
    status: 'planning',
    type: 'seasonal',
    goal: 'conversion',
    owner: 'Maya Okonjo',
    channels: ['Web microsite', 'Instagram', 'Email'],
    budgetAmount: 240_000,
    budgetCurrency: 'USD',
    startDate: '2026-11-01',
    endDate: '2026-12-26',
    productId: 'p1',
    journeyId: 'j-j2-m3',
    brief: {
      objective:
        'Sell gift sets, not products. Lift AOV through the season without discounting the hero.',
      audience:
        'Gift buyers who do not use the products themselves, and repeat buyers stocking up.',
      message: 'The edit they will actually use.',
      offer:
        'Curated three-piece sets, limited edition, free gift wrap over $75.',
    },
    items: [
      {
        id: 'i1',
        kind: 'product',
        productId: 'p1',
        expIds: expIds('m3', 'p1', ['e3']),
        status: 'ready',
        owner: 'Maya Okonjo',
        due: '2026-10-28',
        note: 'Bundle builder with the hero serum as the anchor.',
      },
      {
        id: 'i2',
        kind: 'product',
        productId: 'p2',
        expIds: expIds('m3', 'p2', ['e2']),
        status: 'building',
        owner: 'Toan Nguyen',
        due: '2026-11-02',
        note: 'Showcase for the blush — swatches on four skin tones.',
      },
      {
        id: 'i3',
        kind: 'product',
        productId: 'p4',
        expIds: expIds('m3', 'p4', ['e1', 'e3', 'e4']),
        status: 'building',
        owner: 'Maya Okonjo',
        due: '2026-11-05',
        note: 'Carried from the Gift Season Journey — three source experiences, yours to adapt.',
      },
      {
        id: 'i4',
        kind: 'topic',
        name: 'The Gift Guide',
        expIds: expIds('m3', 'i4', ['e1', 'e3', 'e4']),
        status: 'live',
        owner: 'Maya Okonjo',
        due: '2026-11-12',
        note: 'Editorial gift guide. Shoppable, but it is not one product — it runs the full Gift Season Journey.',
      },
    ],
  },
  {
    id: 'm2',
    name: SPRING,
    status: 'planning',
    type: 'sale',
    goal: 'traffic',
    owner: 'Toan Nguyen',
    channels: ['Instagram', 'Email'],
    budgetAmount: 95_000,
    budgetCurrency: 'USD',
    startDate: '2027-03-03',
    endDate: '2027-03-17',
    productId: 'p1',
    /* No route yet — the plan gate says so, and says where to fix it. */
    journeyId: null,
    brief: {
      objective:
        'Clear Q4 inventory on four SKUs without training the customer to wait for a discount.',
      audience: 'Price-sensitive first-time buyers and lapsed customers.',
      message: 'Two weeks. Then it goes back.',
      offer: '20% off four selected products. No sitewide discount.',
    },
    items: [
      {
        id: 'i5',
        kind: 'product',
        productId: 'p1',
        expIds: expIds('m2', 'p1', ['e1']),
        status: 'building',
        owner: 'Maya Okonjo',
        due: '2027-02-20',
        note: 'Shade finder, with the sale price shown after the match.',
      },
      {
        id: 'i6',
        kind: 'product',
        productId: 'p2',
        expIds: [],
        status: 'todo',
        owner: 'Toan Nguyen',
        due: '2027-02-22',
        note: '',
      },
      {
        id: 'i7',
        kind: 'product',
        productId: 'p3',
        expIds: [],
        status: 'todo',
        owner: '',
        due: '2027-02-24',
        note: '',
      },
      {
        id: 'i8',
        kind: 'product',
        productId: 'p5',
        expIds: [],
        status: 'todo',
        owner: '',
        due: null,
        note: '',
      },
    ],
  },
  {
    id: 'm1',
    name: LAUNCH,
    status: 'live',
    type: 'launch',
    goal: 'awareness',
    owner: 'Toan Nguyen',
    channels: ['Web microsite', 'Instagram', 'Email'],
    budgetAmount: 180_000,
    budgetCurrency: 'USD',
    startDate: '2026-06-12',
    endDate: null,
    productId: 'p1',
    journeyId: 'j-j1-m1',
    brief: {
      objective:
        'Establish tinted SPF as a category, not a product. Acquire at or below $22 CAC.',
      audience: 'Skincare-first shoppers who do not currently wear foundation.',
      message: 'Skin first. Colour second.',
      offer: 'Full price. No launch discount — the product is the offer.',
    },
    items: [
      {
        id: 'i9',
        kind: 'product',
        productId: 'p1',
        expIds: expIds('m1', 'p1', ['e2', 'e1', 'e6', 'e8']),
        status: 'live',
        owner: 'Toan Nguyen',
        due: null,
        note: "Runs the full Product Launch Journey: 360° reveal, the tint-vs-foundation inspect, the founder's proof page — and the shade finder for retargeting.",
      },
    ],
  },
  {
    id: 'm4',
    name: CLEAN,
    status: 'done',
    type: 'always',
    goal: 'retention',
    owner: 'Maya Okonjo',
    channels: ['Web microsite', 'Email'],
    budgetAmount: 120_000,
    budgetCurrency: 'USD',
    startDate: '2026-01-08',
    endDate: '2026-04-30',
    productId: 'p4',
    /* One editorial page, no blueprint route — neither library journey is about
       ingredient education, and pretending otherwise would flatter the seed. */
    journeyId: null,
    brief: {
      objective:
        'Own the ingredient conversation. Educate, then convert on the second visit.',
      audience: 'Ingredient-literate shoppers researching before they buy.',
      message: 'What clean actually means.',
      offer: 'None. Email capture only.',
    },
    items: [
      {
        id: 'i10',
        kind: 'product',
        productId: 'p4',
        expIds: expIds('m4', 'p4', ['e4']),
        status: 'live',
        owner: 'Maya Okonjo',
        due: null,
        note: 'Editorial. Highest email opt-in of anything we run.',
      },
    ],
  },
];

/** A fresh copy — the seed is module-level, so state must never alias it. */
export const cloneCampaigns = (list: CampaignView[]): CampaignView[] =>
  structuredClone(list);

export const cloneExperiences = (
  list: CampaignExperience[]
): CampaignExperience[] => structuredClone(list);
