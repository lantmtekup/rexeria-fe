/**
 * Portal V2 — Experiences view types.
 *
 * The library is backed by TWO real sources, kept strictly apart by `kind`:
 * - `page`  ← `GET /v1/pages?type=landing&status=published` (what
 *   `/admin/landing-pages` reads)
 * - `block` ← `GET /v1/blocks?status=published` (what `/admin/blocks` reads)
 *
 * The analytics half (coverage, stats, evidence, funnel layers) has no backend
 * yet, so it is SEEDED from the record's id via the prototype's own hash. See
 * `ExperienceView` below for which half is which, and `seed.ts` for the hash.
 *
 * Vocabulary (roles, objectives, vehicles, evidence tiers) is ported from the
 * `plan-v2/rexer-platform-v2.html` prototype and lines up with
 * `@/services/rexer-v2/types/experience` (`RxExperience`), so when
 * `/v1/experiences` lands the seeded half can be swapped for measured values
 * field-for-field rather than restructured.
 */

import type { BlockCategory } from '@/components/modules/block-editor/types';
import type { BlockScope, BlockSurface } from '@/services/rexer/types';

/**
 * WHAT this record is — a whole post-click page, or one reusable section.
 *
 * Replaces the old `ExperienceCategory` axis, which had the same two values,
 * lived in the Refine drawer, and never matched a row because
 * `mapPageToExperience` hard-coded `'collection'`.
 */
export type ExperienceKind = 'page' | 'block';

/**
 * THE NAVIGATION — one tab row, one axis, no nesting.
 *
 * `plan-v2/index.html` module 5 defines Experiences as the library of pages AND
 * blocks ("thư viện trang / block"). Rather than stack a kind row above the
 * ownership row, both live on the same row: `all` is the whole library, the
 * three ownership values narrow to pages, and `block` is the block half.
 *
 * That works because the two axes are mutually exclusive in practice — a block
 * has no template-vs-copy lineage, so no tab ever has to express both.
 */
export type ExperienceTab = 'all' | ExperienceState | 'block';

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
 *
 * PAGES ONLY. A block has no template-vs-copy lineage, so `ExperienceView.state`
 * is `null` for blocks rather than a fabricated value.
 */
export type ExperienceState = 'template' | 'product' | 'topic';

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
 * One row of the library — a landing page or a block, told apart by `kind`.
 *
 * Split deliberately into REAL and SEEDED halves. The real half comes straight
 * off the `Page` / `Block` record; the seeded half is derived from that
 * record's id through the prototype's own hash so the analytics surfaces have
 * something to render until the measurement pipeline exists.
 *
 * This mirrors what Exchange already does — `mapLandingPageToListing` and
 * `mapBlockToListing` (`@/lib/portal-v2/exchange/*`) attach a seeded preset to
 * a real record the same way. Seeded values are stable per id, never random.
 *
 * ONE SHAPE FOR BOTH KINDS is deliberate: the card, the detail modal, the
 * preview shell and the evidence pills stay shared, so a block behaves exactly
 * like a page. Only the kind-specific fields below differ, and each one names
 * which kind carries it.
 */
export type ExperienceView = {
  // ── REAL · straight off the `Page` / `Block` record ──────────────────────
  /** Page or Block UUID. Also the seed for every derived figure below. */
  id: string;
  kind: ExperienceKind;
  name: string;
  /** PAGE only — public slug for `/p/{slug}`. Always null for a block. */
  slug: string | null;
  /** PAGE only — seed version id, what a future "install this" flow forks. */
  templateVersionId: string | null;
  thumbnailUrl: string | null;
  /** PAGE only — set ⇒ no canvas of ours; Edit must be blocked. */
  externalUrl: string | null;
  status: PageStatusView;
  summary: string;
  /** Absolute UTC date. Never a relative string — see `formatUpdated`. */
  updatedLabel: string;

  // ── REAL · BLOCK only · undefined on a page ──────────────────────────────
  /** `Block.type_code`, e.g. `hero_split`. */
  typeCode?: string;
  /** Human label for `typeCode` — `resolveTypeMeta().adminLabel`. */
  typeLabel?: string;
  /** Catalog category for `typeCode` — undefined when the code is unmapped. */
  blockCategory?: BlockCategory;
  tags?: string[];
  scope?: BlockScope;
  supportedSurfaces?: BlockSurface[];
  /** How many canvases have inserted this block. */
  usageCount?: number;
  /**
   * `Block.settings` parses as an editor block, so the cover can render the
   * real thing instead of generated artwork. Same check Exchange runs —
   * `canLivePreview` from `@/lib/portal-v2/exchange/parseEditorBlock`.
   */
  canLivePreview?: boolean;

  // ── SEEDED from `id` · stable, deterministic, not measured ───────────────
  /**
   * Ownership axis — prototype `expState`. Seeded until lineage exists.
   * `null` for blocks: template-vs-copy is a page concept.
   */
  state: ExperienceState | null;
  vehicle: ExperienceVehicle;
  objective: ExperienceObjective;
  /** The one funnel role the objective serves — `OBJECTIVE_ROLE`. */
  role: FunnelRole;
  interactions: ExperienceInteraction[];
  proven: boolean;
  tagline: string;
  /** A page is a stack of layers; a block is exactly one. */
  layers: ExperienceLayer[];
  features: string[];
  benefits: string[];
  coverage: SignalCoverage;
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

/**
 * Every axis at once, but only some apply at a time: `tab` picks which half of
 * this record `filterExperiences` reads. Keeping both halves resident (rather
 * than a discriminated union) means switching tabs preserves what the user had
 * narrowed on the other side.
 */
export type ExperienceFilters = {
  q: string;
  /** THE primary axis — the one tab row. */
  tab: ExperienceTab;

  // ── SHARED axes · applied on every tab except `block` ────────────────────
  vehicle: ExperienceVehicle | 'all';
  objective: ExperienceObjective | 'all';
  ev: EvidenceTier | 'all';

  // ── BLOCK axes · real data only, applied on the `block` tab ──────────────
  blockCat: BlockCategory | 'all';
  surface: BlockSurface | 'all';
};

export type ExperienceDetailTab = 'details' | 'signals' | 'perf';
