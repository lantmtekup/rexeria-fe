/**
 * Portal V2 — Experiences view types.
 *
 * The library is backed by REAL published landing pages — `GET /v1/pages?
 * type=landing&status=published`, the same source `/admin/landing-pages` reads.
 * The analytics half (coverage, stats, evidence, funnel layers) has no backend
 * yet, so it is SEEDED from `page.id` via the prototype's own hash. See
 * `ExperienceView` below for which half is which, and `seed.ts` for the hash.
 *
 * Vocabulary (roles, objectives, vehicles, evidence tiers) is ported from the
 * `plan-v2/rexer-platform-v2.html` prototype and lines up with
 * `@/services/rexer-v2/types/experience` (`RxExperience`), so when
 * `/v1/experiences` lands the seeded half can be swapped for measured values
 * field-for-field rather than restructured.
 */

/** `DATA.expCategories` (~L5480) → `RxExperience.category`. */
export type ExperienceCategory = 'blocks' | 'collection';

/** `DATA.expCats` (~L5497) — the vehicle → `RxExperience.vehicle`. */
export type ExperienceVehicle = 'curated' | 'ads' | 'showcase' | 'microsite';

/** `DATA.expObjs` (~L5511) → `RxExperience.objective`. */
export type ExperienceObjective = 'insight' | 'lead' | 'cta' | 'convert';

/** `ROLES` (~L5382) → `RxExperience.role`, and every layer's `r`. */
export type FunnelRole = 'ATT' | 'EDU' | 'EXP' | 'TRU' | 'CON';

/** `DATA.expInteractions` (~L5521) → `RxExperience.interactions[]`. */
export type ExperienceInteraction = 'hotspot' | 'swipe' | 'pan' | '360' | 'vr';

/** `EV_OPTS` minus 'all' → `RxExperience.ev`. The wire says 'unmeasured'. */
export type EvidenceTier = 'high' | 'directional' | 'early' | 'unmeasured';

/**
 * Prototype `expState` / `XSTATES` (~L15927) — the ownership axis.
 * A template belongs to nobody; a copy is about a product or a topic.
 */
export type ExperienceState = 'template' | 'product' | 'topic' | 'block';

/** Every component a block can offer — prototype `compsOf(l)` (~L12493). */
export type LayerComponentKey = 'n' | 'h' | 'b' | 'media' | 'product' | 'cta';

/**
 * One block in the stack.
 *
 * `tracked` / `components` / `trackedComponents` are DERIVED at build time by
 * the `normalizeLayers` port (~L11868) — they are absent from the authored
 * literal, exactly as in the prototype.
 */
export type ExperienceLayer = {
  role: FunnelRole;
  name: string;
  description: string;
  /** Media asset id from the prototype ('a5'). Not resolved in P0. */
  mediaRef: string | null;
  /** Synthesized for `CON` layers by normalizeLayers, else null. */
  cta: string | null;
  tracked: boolean;
  components: LayerComponentKey[];
  trackedComponents: LayerComponentKey[];
};

/** Prototype `signalCoverage(e)` (~L12566). `pct` is COMPONENT coverage. */
export type SignalCoverage = {
  blocks: number;
  trackedBlocks: number;
  components: number;
  trackedComponents: number;
  /** trackedComponents / components, rounded. */
  pct: number;
};

/**
 * Prototype `xStats(e)` (~L12532). NULL when the record has no fact rows behind
 * it — never a zero. Cards read `stats === null` as "Not yet run" (rule R5).
 */
export type ExperienceStats = {
  sessions: number;
  engaged: number;
  explored: number;
  convinced: number;
  converted: number;
  leads: number;
  revenue: number;
  /** 0..1 */
  cvr: number;
  /** Signed fraction, e.g. 0.18 → +18%. */
  lift: number;
  campaigns: number;
  campaignNames: string[];
  channels: string[];
};

/**
 * Prototype `engShelfRead(e)` (~L15258) — the CONCEPT read, keyed on
 * `originId ?? id`, so a template and every copy of it always agree on tier.
 */
export type ExperienceEvidence = {
  tier: EvidenceTier;
  /** null when nothing in the lineage has ever run. */
  lineage: ExperienceStats | null;
};

/**
 * One row of the library.
 *
 * Split deliberately into REAL and SEEDED halves. The real half comes straight
 * off the `Page` record from `GET /v1/pages`; the seeded half is derived from
 * `page.id` through the prototype's own hash so the analytics surfaces have
 * something to render until the measurement pipeline exists.
 *
 * This mirrors what Exchange already does — `mapLandingPageToListing`
 * (`@/lib/portal-v2/exchange/mapPage`) attaches `pageMetaPreset(page.id)` to a
 * real page the same way. Seeded values are stable per page id, never random.
 */
export type ExperienceView = {
  // ── REAL · straight off the `Page` record ────────────────────────────────
  /** Page UUID. Also the seed for every derived figure below. */
  id: string;
  name: string;
  /** Public slug for `/p/{slug}`. Empty on pages created without one. */
  slug: string | null;
  /** Seed version id — what a future "install this" flow would fork. */
  templateVersionId: string | null;
  thumbnailUrl: string | null;
  /** Set ⇒ the page has no canvas; Edit must be blocked. */
  externalUrl: string | null;
  status: PageStatusView;
  summary: string;
  /** Absolute UTC date. Never a relative string — see `formatUpdated`. */
  updatedLabel: string;

  // ── SEEDED from `id` · stable, deterministic, not measured ───────────────
  /** Ownership axis — prototype `expState`. Seeded until lineage exists. */
  state: ExperienceState;
  category: ExperienceCategory;
  vehicle: ExperienceVehicle;
  objective: ExperienceObjective;
  /** The one funnel role the objective serves — `OBJECTIVE_ROLE`. */
  role: FunnelRole;
  interactions: ExperienceInteraction[];
  proven: boolean;
  tagline: string;
  layers: ExperienceLayer[];
  features: string[];
  benefits: string[];
  /**
   * null = CHƯA ĐO. BE cố ý bỏ qua `signal_coverage` với loại không đo được
   * ("nil = not measurable for this kind, and is omitted rather than reported
   * as 0%"), nên quy về 0% ở đây là dựng lại đúng lời nói dối vừa gỡ.
   */
  coverage: SignalCoverage | null;
  /** null when the seed says this has never run — never a zero. */
  stats: ExperienceStats | null;
  evidence: ExperienceEvidence;

  /**
   * Locale-independent haystack: name + slug + description. Precomputed so the
   * client-side chip filter stays a pure function with no `t` dependency and a
   * search means the same thing under en and vi.
   */
  searchText: string;
};

export type PageStatusView = 'draft' | 'published' | 'archived';

export type ExperienceFilters = {
  q: string;
  /** Ownership tab — prototype `F.state`. */
  state: ExperienceState | 'all';
  category: ExperienceCategory | 'all';
  vehicle: ExperienceVehicle | 'all';
  objective: ExperienceObjective | 'all';
  ev: EvidenceTier | 'all';
};

export type ExperienceDetailTab = 'details' | 'signals' | 'perf';
