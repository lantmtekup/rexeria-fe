/**
 * Portal V2 — Journey Builder types.
 *
 * Ported from `plan-v2/rexer-platform-v2.html` (`DATA.journeys` ~L6383,
 * `VIEWS.journeys` ~L19577) against `plan-v2/index.html` §`#mod-journey`.
 *
 * THE GRAPH IS THE ONLY STORED THING. Layout, validation, readiness and every
 * funnel figure are pure functions of it — see `helpers.ts`. Nothing here is
 * cached, so a graph edit can never leave a stale verdict behind.
 *
 * ONE DELIBERATE DIVERGENCE FROM THE PROTOTYPE. There, every number is derived
 * from `facts()` — a fact table joined across experiences × campaigns. Portal
 * V2 has no such table yet, so a measured experience node carries its own
 * `stats` and the rollups read from those. The behaviour the prototype cares
 * about is preserved: a journey that never ran has NO numbers (`null`, never
 * zero), a blueprint's numbers are the sum of its copies', and the walk-through
 * stays monotonic. When `/v1/journeys` lands, `stats` is the field that gets
 * swapped for a join — the shape around it does not move.
 */

import type { ExperienceObjective } from '@/lib/portal-v2/experiences/types';

/** `DATA.journeyKinds` (~L6300) — the five node types the plan names. */
export type JourneyNodeKind =
  | 'entry'
  | 'experience'
  | 'decision'
  | 'action'
  | 'outcome';

/** The ownership axis — prototype `jState` (~L19197). */
export type JourneyState = 'blueprint' | 'copy';

/** The list's tab rail: ownership, plus All. */
export type JourneyStateFilter = JourneyState | 'all';

/**
 * Detail modal tabs. `plan` is the canvas editor's own tab (renamed from
 * `canvas`); `pulse` is the walk-through + verdict ("Performance"); `insights`
 * merges readiness with the Architect read (renamed from `ready`).
 */
export type JourneyDetailTab = 'over' | 'plan' | 'pulse' | 'insights';

/** What one experience node measured, in its own campaign. */
export type JourneyNodeStats = {
  sessions: number;
  /** Signed fraction against control. 0.18 → +18%. */
  lift: number;
};

/** Rolled up across a journey's measured nodes — `jStats` (~L19398). */
export type JourneyStats = {
  sessions: number;
  lift: number;
};

/**
 * One phase column on the editor floor.
 *
 * A journey is not a free drawing: it runs left to right through the stages of
 * a funnel, and a node's phase is WHERE IT SITS. Stored, not derived — the
 * planner drags a card across a border and that is the edit. Graph depth still
 * decides the drawing order inside `orderNodes`; phases give the picture a
 * geography, they do not add a rule.
 *
 * `kind` is measurement semantics, not styling: the `convert` phase speaks in
 * conversion rate, every other phase speaks in reach. Exactly one phase in a
 * set is the convert one.
 */
export type JourneyStage = {
  id: string;
  /** The brand's own word for this phase. Renamed in place, never translated. */
  name: string;
  kind: 'flow' | 'convert';
  /** One line, shown while the phase is still empty. */
  hint: string;
};

export type JourneyNode = {
  id: string;
  kind: JourneyNodeKind;
  name: string;
  /**
   * The customer purpose — prototype `n.d`. Empty fails the "every node states
   * its customer purpose" check, which is why it is required, not optional.
   */
  d: string;
  /** Outgoing edges, by node id. */
  to: string[];
  /** Entry nodes only — an `ENTRY_SOURCES` id. */
  src?: string;
  /** Entry / action / outcome — the system this node hands to. */
  via?: string;
  /** Experience nodes only — the linked experience id. */
  x?: string;
  /**
   * Resolved experience name. The prototype walks `DATA.experiences` through
   * origin lineage; P0 has no experience store on this route, so the link
   * carries its own label. Absent ⇒ the link is dangling.
   */
  xName?: string;
  /**
   * Public slug of the linked experience — what `/p/{slug}` needs to render the
   * shopper view. Carried on the link for the same reason `xName` is: the node
   * has to stay previewable without a second trip to the library. Absent ⇒ the
   * link predates the picker carrying one, or the page has no public slug.
   */
  xSlug?: string;
  /** Signal coverage of the linked experience, 0–100. 0 ⇒ untracked. */
  xCoverage?: number;
  /** Measured in this journey's campaign. `null`/absent ⇒ never run. */
  stats?: JourneyNodeStats | null;
  /**
   * Which phase column this node lives in — an index into the journey's stage
   * list. Absent ⇒ nobody has said yet, and `ensureStages` infers it once from
   * what the graph already claims.
   */
  stage?: number;
  /**
   * Where the author put this node on the editor floor — prototype `n.px/n.py`.
   * Absent ⇒ nobody has placed it, so the layered layout decides. Read-only
   * surfaces fall back to `orderNodes` for exactly that reason.
   */
  px?: number;
  py?: number;
};

export type Journey = {
  id: string;
  name: string;
  /** True ⇒ blueprint: belongs to nobody, forked on use. */
  template: boolean;
  /** Copies only — the campaign that owns this fork. */
  campaign: string | null;
  campaignName: string | null;
  /** Copies only — the blueprint this was forked from. */
  origin: string | null;
  obj: ExperienceObjective;
  /**
   * Chân dung khách mà hành trình này NHẮM tới — `brand_profiles.audience[].id`,
   * lưu ở `journeys.persona_id` và được BE kiểm bằng `PersonaExists`.
   *
   * Bản trước để ở đây một id PHÂN KHÚC (`s1`…) — thứ khác hẳn: phân khúc là
   * cách khách hành xử, đo được từ `shopper_profiles`; chân dung là lựa chọn
   * lúc thiết kế. Chúng nối nhau qua `ProfilePersona.behaves`, không thay thế
   * được cho nhau, và id `s1` gửi vào một cột uuid thì chỉ bị vứt.
   */
  personaId: string | null;
  updated: string;
  tagline: string;
  summary: string;
  /**
   * This journey's own phase vocabulary. Absent ⇒ it reads the house set; the
   * first rename, add or template materialises a private copy onto the draft.
   * A brand that maps its customers' journey owns the words for it.
   */
  stages?: JourneyStage[];
  nodes: JourneyNode[];
  /**
   * Tỉ lệ chuyển đổi mục tiêu (0..1) cho chặng convert — kế hoạch của tác giả,
   * không phải số đo được. Vắng ⇒ chưa lập kế hoạch, khác 0.
   */
  target?: number;
  /** id chặng (không phải chặng convert) → % lượt tới mục tiêu. */
  stageTargets?: Record<string, number>;
};

/** One node placed on the layered canvas — `jOrder` (~L19249). */
export type JourneyLayoutNode = {
  node: JourneyNode;
  col: number;
  row: number;
};

/** One rule from the journey contract, and whether this graph keeps it. */
export type JourneyCheck = {
  ok: boolean;
  msg: string;
};

export type JourneyReadiness = {
  /** Percentage of checks passing, rounded. */
  score: number;
  checks: JourneyCheck[];
  missing: string[];
};

/** One stage of the walk-through — `jWalk` (~L19409). */
export type JourneyWalkStage = {
  node: JourneyNode;
  col: number;
  /** What this stage measured on its own, scaled by the segment share. */
  stats: JourneyNodeStats | null;
  /** Min-chained against what arrived. `null` ⇒ this stage never ran. */
  reached: number | null;
};

/**
 * The Architect read — `GET /journeys/{id}/review`. BE scores it
 * (`core.JourneyReviewScore`/`core.DecideNextBest`); this is a pure display
 * shape, nothing here is computed on the client.
 */
export type JourneyReviewParts = {
  contract: number;
  evidence: number;
  structure: number;
};

export type JourneyStageRead = {
  nodeKey: string;
  role: string;
  sessions: number;
  lift: number | null;
  tier: string;
};

export type JourneyNextBestDetail = {
  role: string;
  experienceId?: string;
  experienceName?: string;
  /** 0..100. Vắng ⇒ BE không trả mức phủ tín hiệu cho trải nghiệm này. */
  experienceCoverage?: number;
  reason: string;
  nodeKey?: string;
};

export type JourneyNextBestMode = 'add' | 'strengthen' | 'none';

export type JourneyNextBest = {
  mode: JourneyNextBestMode;
  detail: JourneyNextBestDetail | null;
  noneReason: string | null;
};

export type JourneyReview = {
  score: number;
  parts: JourneyReviewParts;
  weights: JourneyReviewParts;
  confidenceTier: string;
  stageReads: JourneyStageRead[];
  nextBest: JourneyNextBest;
};

/** One side of a `GET /journeys/compare` result. */
export type JourneyCompareSide = {
  measured: boolean;
  reason: string | null;
  sessions: number;
  completed: number;
  completionRate: number;
  confidenceTier: string;
};

export type JourneyStageDelta = {
  key: string;
  aSessions: number;
  bSessions: number;
  delta: number;
};

export type JourneyCompareResult = {
  a: JourneyCompareSide;
  b: JourneyCompareSide;
  stages: JourneyStageDelta[];
};

/** Real-stats rollup across a blueprint's campaign copies — `jBenchmark`. */
export type JourneyBenchmark = {
  cvr: number;
  sessions: number;
  runs: number;
  maturity: 'established' | 'early';
};

export type JourneyFilters = {
  state: JourneyStateFilter;
  q: string;
};

/** The New-journey form — prototype `JFIELDS` (~L23258). */
export type JourneyDraftInput = {
  name: string;
  obj: ExperienceObjective;
  personaId: string | null;
  /** Blank ⇒ createJourney() falls back to the objective-drafted default. */
  tagline?: string;
  summary?: string;
};

/* ── editor ────────────────────────────────────────────────────────────── */

/** The node fields the inspector can type into. Routing has its own verbs. */
export type JourneyNodePatch = Partial<
  Pick<JourneyNode, 'name' | 'd' | 'src' | 'via'>
>;

/** Journey-level fields the editor's meta panel owns. */
export type JourneyMetaPatch = Partial<
  Pick<Journey, 'name' | 'tagline' | 'summary' | 'obj' | 'personaId'>
>;

/**
 * What an experience node stores about its link. The picker resolves a real
 * library row down to these four fields — the node never holds a page record.
 */
export type JourneyExperienceLink = {
  id: string;
  name: string;
  /** Component coverage, 0–100. */
  coverage: number;
  /** Public slug, when the page has one — the node's preview reads it. */
  slug?: string;
};

/** What the editor has selected: one node, one edge, or nothing. */
export type JourneyEditorSelection =
  | { kind: 'node'; id: string }
  | { kind: 'edge'; from: string; to: string }
  | null;

/**
 * The Architect card's Apply action, carried from the detail modal's
 * Insights tab through to the editor — applied once on mount there.
 */
export type JourneyEditorPendingAction =
  | { type: 'add'; link: JourneyExperienceLink }
  | { type: 'swap'; nodeId: string; link: JourneyExperienceLink };
