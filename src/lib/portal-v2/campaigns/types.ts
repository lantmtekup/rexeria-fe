/**
 * The Campaigns model.
 *
 * A CAMPAIGN is a business moment with a brief, a budget, dates and an owner.
 * An ITEM is one SUBJECT in that campaign — a product (a SKU) or a topic (no
 * SKU behind it: a gift guide, a brand film) — plus the experiences built for
 * it. A campaign is a plan; an item is a piece of work.
 *
 * Nothing here is stored: the module reads `MOCK_CAMPAIGNS` and every mutation
 * is a pure function over the list, the same contract Journeys and Brand use.
 */

/** Prototype `CAMP_TYPES` (rexer-demo-v3.html :15610). */
export type CampaignType =
  | 'launch'
  | 'seasonal'
  | 'sale'
  | 'always'
  | 'retention';

/** The commercial intent — distinct from `brief.objective`, which is prose. */
export type CampaignGoal = 'awareness' | 'traffic' | 'conversion' | 'retention';

/** The persisted statuses. `building` is not one of them — see `CampaignStage`. */
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

/**
 * What the UI shows. `building` is DERIVED, never stored: a `draft` campaign
 * whose items have started moving reads as "In build" (prototype
 * `syncCampaignStage`).
 */
export type CampaignStage =
  | 'planning'
  | 'building'
  | 'live'
  | 'paused'
  | 'done';

/**
 * The lifecycle the campaign screen is organised around (`CAMP_PHASES`,
 * rexer-demo-v3.html :20619). Derived from the stage, overridable by the user
 * for the length of a visit.
 */
export type CampaignPhase = 'plan' | 'build' | 'run' | 'learn';

/** Plan §mod-campaigns: "Not started → In build → In review → Ready → Live". */
export type CampaignItemStatus =
  | 'todo'
  | 'building'
  | 'review'
  | 'ready'
  | 'live';

/** "hạng mục theo sản phẩm hoặc chủ đề" — a SKU or a topic with no SKU behind it. */
export type CampaignSubjectKind = 'product' | 'topic';

export type CampaignItem = {
  id: string;
  kind: CampaignSubjectKind;
  /** Set when `kind === 'product'`. */
  productId?: string;
  /** Set when `kind === 'topic'` — free text, no SKU behind it. */
  name?: string;
  /** Experience ids — always campaign copies, never templates (Rule R1). */
  expIds: string[];
  status: CampaignItemStatus;
  owner: string;
  /** `YYYY-MM-DD`, or null for "no deadline / shipped". */
  due: string | null;
  note: string;
};

/** The four things everyone building the campaign has to agree on first. */
export type CampaignBrief = {
  objective: string;
  audience: string;
  message: string;
  offer: string;
};

export type CampaignView = {
  id: string;
  name: string;
  status: CampaignStatus;
  type: CampaignType;
  goal: CampaignGoal | null;
  owner: string;
  channels: string[];
  budgetAmount: number | null;
  budgetCurrency: string;
  /** `YYYY-MM-DD`. */
  startDate: string | null;
  /** `YYYY-MM-DD`, or null for an always-on campaign. */
  endDate: string | null;
  productId: string | null;
  brief: CampaignBrief;
  items: CampaignItem[];
  /**
   * The journey fork this campaign runs on — `j-{origin}-{campaignId}`. One
   * campaign, one journey; null until a blueprint is routed onto it.
   */
  journeyId: string | null;
  /** True once the campaign's journey has been promoted back to a blueprint. */
  promoted?: boolean;
};

/** The draft a create/edit form hands back — no id, no derived fields. */
export type CampaignDraft = {
  name: string;
  type: CampaignType;
  goal: CampaignGoal | null;
  owner: string;
  status: CampaignStatus;
  channels: string[];
  budgetAmount: number | null;
  budgetCurrency: string;
  startDate: string | null;
  endDate: string | null;
  productId: string | null;
  brief: CampaignBrief;
  items: CampaignItem[];
  journeyId: string | null;
};

/* ── experiences ────────────────────────────────────────────────────────── */

/**
 * An experience as Campaigns needs it. The library itself is a separate module
 * with its own richer view type; the ship gate only needs to know four things:
 * what it is called, how much of it is tracked, which product its master was
 * authored for, and whether a copy has been adapted to the subject it now
 * speaks to.
 */
export type CampaignExperience = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  /** Share of blocks and components carrying a signal, 0–1. */
  coverage: number;
  /** The product this was authored for, or null for a subject-agnostic master. */
  productId: string | null;
  /** True ⇒ a library master, forked on use. */
  template: boolean;
  /** Copies only — the master this was forked from. */
  origin: string | null;
  /** Copies only — the campaign that owns it. */
  campaign: string | null;
  /** Copies only — its words were rewritten for the subject it is filed under. */
  adapted?: boolean;
};

/* ── the plan gate ──────────────────────────────────────────────────────── */

/** Where a gap sends the user to fix it. */
export type CampaignGapFix =
  | { kind: 'brief' }
  | { kind: 'journey' }
  | { kind: 'addItem' }
  | { kind: 'item'; index: number };

export type CampaignGap = {
  id: string;
  /** An i18n key under `portalV2.campaigns`. */
  messageKey: string;
  /** Values for that key — a subject name, a count. */
  values?: Record<string, string | number>;
  fix: CampaignGapFix;
};

export type CampaignReadiness = {
  /** 0–100 — how much of the plan is answered. */
  score: number;
  ok: number;
  total: number;
  gaps: CampaignGap[];
};

/* ── the ship gate ──────────────────────────────────────────────────────── */

export type ShipCheckId = 'built' | 'words' | 'tracked' | 'dated';

export type ShipCheck = {
  id: ShipCheckId;
  ok: boolean;
};

export type ShipGate = {
  ok: boolean;
  checks: ShipCheck[];
  /** The checks that failed, in order. */
  missing: ShipCheckId[];
};

/* ── what the numbers say ───────────────────────────────────────────────── */

export type CampaignVerdict = {
  sessions: number;
  converted: number;
  leads: number;
  revenue: number;
  spend: number;
  cvr: number;
  /** Conversion rate against the control, as a ratio: 0.31 ⇒ 31% above. */
  lift: number;
  roas: number;
  roi: number;
  cac: number;
  /** Session-weighted signal coverage, 0–1. */
  trust: number;
  best: { name: string; lift: number } | null;
  worst: { name: string; lift: number } | null;
};

export type CampaignHealthState =
  | 'healthy'
  | 'valuable'
  | 'delayed'
  | 'risk'
  | 'complete';

export type CampaignHealth = {
  state: CampaignHealthState;
  /** An i18n key explaining the state in one line. */
  whyKey: string;
  values?: Record<string, string | number>;
};

/* ── the create wizard ──────────────────────────────────────────────────── */

export type CampaignWizard = {
  /** 1–4: the moment, the brief, the journey, the merchandise. */
  step: number;
  type: CampaignType | null;
  name: string;
  owner: string;
  startDate: string;
  endDate: string;
  budget: string;
  channels: string[];
  goal: CampaignGoal | null;
  objective: string;
  audience: string;
  message: string;
  offer: string;
  /** The blueprint journey to fork onto this campaign, or null when skipped. */
  journeyId: string | null;
  skipJourney: boolean;
  /** Product ids carried by this campaign. */
  subjects: string[];
  /** Free-text topics carried by this campaign. */
  topics: string[];
};

/* ── list narrowing ─────────────────────────────────────────────────────── */

export type CampaignViewMode = 'grid' | 'table';

export type CampaignFilters = {
  stage: CampaignStage | 'all';
  q: string;
  view: CampaignViewMode;
};
