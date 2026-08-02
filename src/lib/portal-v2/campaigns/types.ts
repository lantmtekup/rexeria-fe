/**
 * The Campaigns model — one view type over TWO v1 endpoints.
 *
 * `/v1/campaigns` is the canonical home (product-scoped, the store behind the
 * old `/portal/marketing`), but it is still mounted on the BE `internal` group
 * and answers 403 to brand users — see
 * `docs/be-gap-campaigns-brand-access-2026-06-14.md`. `/v1/portal/ads/campaigns`
 * is brand-scoped and works today. `CampaignSource` records which one a given
 * board was read from, so writes go back to the same store.
 *
 * Fields split in two: everything the wire already has is a real column;
 * `type` / `owner` / `brief` / `items` have no v1 column and live inside
 * `notes` as JSON — the convention the BE gap doc already names ("Marketing
 * brief của portal sống trong `campaign.notes` (JSON)"). See `./notes.ts`.
 */

/** Which v1 endpoint a board was read from — writes must follow reads. */
export type CampaignSource = 'campaigns' | 'ads';

/** Prototype taxonomy (rexer-platform-v2.html :9401). Lives in `notes.pv2`. */
export type CampaignType =
  | 'launch'
  | 'seasonal'
  | 'sale'
  | 'always'
  | 'retention';

/** `Campaign.objective` — a real v1 column, distinct from `brief.objective`. */
export type CampaignGoal = 'awareness' | 'traffic' | 'conversion' | 'retention';

/** The only statuses v1 persists. */
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

/**
 * What the UI shows. `building` is DERIVED, never stored: a `draft` campaign
 * whose items have started moving reads as "In build" (prototype
 * `syncCampaignStage`), which is the status axis the plan says is missing.
 */
export type CampaignStage =
  | 'planning'
  | 'building'
  | 'live'
  | 'paused'
  | 'done';

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
  /** Set when `kind === 'product'` — a `/v1/products` id. */
  productId?: string;
  /** Set when `kind === 'topic'` — free text, no SKU behind it. */
  name?: string;
  /** Landing page ids from `/v1/pages` (the Experiences library). */
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

/** The `pv2` envelope inside `campaign.notes`. */
export type CampaignNotesPayload = {
  v: 1;
  type: CampaignType;
  owner: string;
  brief: CampaignBrief;
  items: CampaignItem[];
};

export type CampaignView = {
  id: string;
  /** Which endpoint this row came from — carried so writes land in the same store. */
  source: CampaignSource;

  /* ── real v1 columns ─────────────────────────────────────────────────── */
  name: string;
  status: CampaignStatus;
  goal: CampaignGoal | null;
  channels: string[];
  budgetAmount: number | null;
  budgetCurrency: string;
  /** Normalised to `YYYY-MM-DD` on read; v1 hands dates back wrapped. */
  startDate: string | null;
  endDate: string | null;
  productId: string | null;
  landingPageId: string | null;
  trackedUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;

  /* ── carried in `notes.pv2` ──────────────────────────────────────────── */
  type: CampaignType;
  owner: string;
  brief: CampaignBrief;
  items: CampaignItem[];

  /**
   * Every other key found in `notes` (`insight_report_id`, `insight_summary`,
   * `insight_handoff`, …). Round-tripped verbatim so saving here never eats
   * data the old `/portal/marketing` screen still reads.
   */
  notesRest: Record<string, unknown>;
};

/** The draft a create/edit form hands back — no ids, no server-owned fields. */
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
};

export type CampaignViewMode = 'grid' | 'table';

export type CampaignFilters = {
  stage: CampaignStage | 'all';
  q: string;
  view: CampaignViewMode;
};
