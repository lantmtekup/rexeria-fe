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

/** Detail modal tabs. The prototype's Architect (AI) tab is phase 2. */
export type JourneyDetailTab = 'over' | 'canvas' | 'walk' | 'ready';

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
  /** Signal coverage of the linked experience, 0–100. 0 ⇒ untracked. */
  xCoverage?: number;
  /** Measured in this journey's campaign. `null`/absent ⇒ never run. */
  stats?: JourneyNodeStats | null;
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
  /** Primary audience — a `JOURNEY_SEGMENTS` id, or 'all'. */
  seg: string;
  updated: string;
  tagline: string;
  summary: string;
  nodes: JourneyNode[];
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

export type JourneyFilters = {
  state: JourneyStateFilter;
  q: string;
};

/** The New-journey form — prototype `JFIELDS` (~L23258). */
export type JourneyDraftInput = {
  name: string;
  obj: ExperienceObjective;
  seg: string;
};
