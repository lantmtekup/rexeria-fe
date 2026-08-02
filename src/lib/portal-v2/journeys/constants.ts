/**
 * Portal V2 — Journey Builder vocabulary.
 *
 * Every table here is business content ported verbatim from the prototype.
 * Long-form copy stays in English by design: it is the same decision Brand and
 * Experiences made — chrome is translated, the vocabulary of the model is not.
 */

import { MOCK_COMMAND } from '@/lib/portal-v2/command/mock';
import type { ExperienceObjective } from '@/lib/portal-v2/experiences/types';
import type {
  JourneyDetailTab,
  JourneyNodeKind,
  JourneyStateFilter,
} from '@/lib/portal-v2/journeys/types';

/** `DATA.journeyKinds` (~L6300) — the plan's five node types. */
export const JOURNEY_KINDS: Record<
  JourneyNodeKind,
  { name: string; d: string }
> = {
  entry: { name: 'Entry', d: 'Where the click comes from.' },
  experience: {
    name: 'Experience',
    d: 'A ReXeR experience the shopper lands in.',
  },
  decision: {
    name: 'Decision',
    d: 'The path splits on what the journey knows.',
  },
  action: {
    name: 'Action',
    d: 'A system does something with what was learned.',
  },
  outcome: {
    name: 'Outcome',
    d: 'The business result the journey exists for.',
  },
};

export const JOURNEY_KIND_ORDER: JourneyNodeKind[] = [
  'entry',
  'experience',
  'decision',
  'action',
  'outcome',
];

export type JourneyKindStyle = {
  /** Node body fill. */
  bg: string;
  /** Label colour, accessible on `bg`. */
  fg: string;
  /** The solid dot / stroke accent. */
  dot: string;
};

/**
 * Prototype `JKC` (~L19208) remapped onto the Studio palette, using the same
 * `color-mix` formula as `@/lib/portal-v2/experiences/roleStyles`. The `fg`
 * hexes are the accessible text variants already used across the repo — there
 * is no `--pv2-*-fg` family in `tokens.css`.
 *
 * Entry and outcome are the journey's book-ends; the coloured middle is where
 * design actually happens.
 */
export const JOURNEY_KIND_STYLE: Record<JourneyNodeKind, JourneyKindStyle> = {
  entry: {
    bg: 'var(--pv2-canvas)',
    fg: 'var(--pv2-mut)',
    dot: 'var(--pv2-faint)',
  },
  experience: {
    bg: 'color-mix(in srgb, var(--pv2-violet) 12%, transparent)',
    fg: 'var(--pv2-violet)',
    dot: 'var(--pv2-violet)',
  },
  decision: {
    bg: 'color-mix(in srgb, var(--pv2-warning) 18%, transparent)',
    fg: '#b45309',
    dot: 'var(--pv2-warning)',
  },
  action: {
    bg: 'color-mix(in srgb, var(--pv2-electric) 12%, transparent)',
    fg: 'var(--pv2-blue-500)',
    dot: 'var(--pv2-electric)',
  },
  outcome: {
    bg: 'color-mix(in srgb, var(--pv2-success) 14%, transparent)',
    fg: '#0e9d6e',
    dot: 'var(--pv2-success)',
  },
};

export type EntrySource = {
  id: string;
  name: string;
  d: string;
  /** How the platform recognises this front door. */
  sig: string;
  /** The system it usually arrives through. */
  via: string;
};

/** `DATA.entrySources` (~L6324) — every kind of front door. */
export const ENTRY_SOURCES: EntrySource[] = [
  {
    id: 'paid',
    name: 'Paid advertising',
    d: 'A bought click — the journey has to earn it back.',
    sig: 'UTM + platform click ID',
    via: 'Meta · Google',
  },
  {
    id: 'social',
    name: 'Social post',
    d: 'Organic reach from the brand’s own feed.',
    sig: 'UTM source tag',
    via: 'Instagram · TikTok',
  },
  {
    id: 'influencer',
    name: 'Influencer link',
    d: 'A creator’s audience, borrowed with their trust attached.',
    sig: 'Affiliate / creator code',
    via: 'Creator link-in-bio',
  },
  {
    id: 'search',
    name: 'Search',
    d: 'Intent that typed itself — the highest-signal entry there is.',
    sig: 'Query + landing path',
    via: 'Google Search',
  },
  {
    id: 'email',
    name: 'Email',
    d: 'A shopper the brand already knows, coming back.',
    sig: 'Subscriber ID',
    via: 'Klaviyo',
  },
  {
    id: 'website',
    name: 'Website',
    d: 'In-flow from the brand’s own pages.',
    sig: 'Referrer path',
    via: 'Brand site',
  },
  {
    id: 'qr',
    name: 'Retail QR',
    d: 'A shelf in the physical world, opening a screen.',
    sig: 'Store + shelf code',
    via: 'Retail packaging',
  },
  {
    id: 'sms',
    name: 'SMS',
    d: 'The shortest path from a phone’s lock screen.',
    sig: 'Subscriber ID',
    via: 'Attentive',
  },
];

export const entrySourceById = (id: string | undefined): EntrySource | null =>
  id ? (ENTRY_SOURCES.find(s => s.id === id) ?? null) : null;

export type JourneySegment = {
  id: string;
  n: string;
  /** Behavioural share of traffic — scales the walk-through. */
  share: number;
  want: string;
};

/**
 * `SEGMENTS` (~L8108), trimmed to the fields the walk-through reads. `all` is
 * the unscaled perspective and is not a segment — it is the absence of one.
 */
export const JOURNEY_SEGMENTS: JourneySegment[] = [
  {
    id: 's1',
    n: 'High Intent',
    share: 0.07,
    want: 'They have decided. They are checking they are not wrong.',
  },
  {
    id: 's2',
    n: 'Active Comparator',
    share: 0.14,
    want: 'They want to know why yours, not the one they already own.',
  },
  {
    id: 's3',
    n: 'Trust Seeker',
    share: 0.17,
    want: 'They believe the product might work. They do not yet believe you.',
  },
  {
    id: 's4',
    n: 'Product Researcher',
    share: 0.12,
    want: 'They want to understand it fully before they care what it costs.',
  },
  {
    id: 's5',
    n: 'Price Sensitive',
    share: 0.11,
    want: 'They want permission to spend.',
  },
];

export const segmentById = (id: string): JourneySegment | null =>
  JOURNEY_SEGMENTS.find(s => s.id === id) ?? null;

/**
 * `J_OUTCOME` (~L23319) — a new journey is never empty. The objective decides
 * which business result the draft already ends in.
 */
export const OUTCOME_FOR_OBJECTIVE: Record<
  ExperienceObjective,
  { name: string; d: string; via: string }
> = {
  lead: {
    name: 'Qualified lead',
    d: 'A person, with consent, in the CRM.',
    via: 'CRM sync',
  },
  convert: {
    name: 'Purchase',
    d: 'Checkout, carrying the profile the journey built.',
    via: 'Shopify checkout',
  },
  insight: {
    name: 'Known shopper',
    d: 'A first-party profile the brand can act on.',
    via: 'CDP profile',
  },
  cta: {
    name: 'Click-through',
    d: 'The shopper arrives where the campaign sends them.',
    via: 'Destination handoff',
  },
};

export const JOURNEY_OBJECTIVES: {
  id: ExperienceObjective;
  labelKey: string;
}[] = [
  { id: 'insight', labelKey: 'objInsight' },
  { id: 'lead', labelKey: 'objLead' },
  { id: 'cta', labelKey: 'objCta' },
  { id: 'convert', labelKey: 'objConvert' },
];

export const JOURNEY_STATE_TABS: {
  id: JourneyStateFilter;
  labelKey: string;
}[] = [
  { id: 'all', labelKey: 'tabAll' },
  { id: 'blueprint', labelKey: 'tabBlueprints' },
  { id: 'copy', labelKey: 'tabCopies' },
];

export const JOURNEY_DETAIL_TABS: {
  id: JourneyDetailTab;
  labelKey: string;
}[] = [
  { id: 'over', labelKey: 'tabOver' },
  { id: 'canvas', labelKey: 'tabCanvas' },
  { id: 'walk', labelKey: 'tabWalk' },
  { id: 'ready', labelKey: 'tabReady' },
];

export const JOURNEY_DEFAULT_FILTERS = { state: 'all' as const, q: '' };

/** Readiness bands — the score's colour, prototype `jReadyTab` (~L23135). */
export const READINESS_BANDS = { ok: 80, warn: 50 };

/**
 * The campaigns a blueprint can be forked into. Sourced from the Command
 * snapshot rather than a fourth copy of the same list — the ids (`m1`, `m3`)
 * are the prototype's own, so the seeded copies line up with it.
 */
export const FORK_CAMPAIGNS = MOCK_COMMAND.campaigns.map(c => ({
  id: c.id,
  name: c.name,
  status: c.status,
  owner: c.owner,
}));
