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

/**
 * Nguồn vào có hợp lệ không — gương `taxonomy.IsValidEntrySource` bên BE.
 * Tám id ở đây khớp đúng danh sách đó; lệch một cái là `PUT` trả 422 mà màn
 * hình không hề báo trước.
 */
export const isEntrySource = (id: string | undefined): boolean =>
  Boolean(id) && ENTRY_SOURCES.some(s => s.id === id);

export type JourneySegment = {
  id: string;
  n: string;
  /**
   * Tỉ lệ traffic ĐO ĐƯỢC, 0..1. Bằng 0 nghĩa là chưa đo được lượt nào — đừng
   * nhân nó vào số phiên rồi vẽ ra một cái phễu bằng không.
   */
  share: number;
  /** Số phiên của phân khúc trong cửa sổ đo. */
  sessions: number;
  want: string;
};

/**
 * Phân khúc hành vi — dữ liệu THẬT từ `GET /v1/intel/segments`.
 *
 * Bản trước là một mảng cứng chép lại chính endpoint đó rồi đóng băng `share`
 * lại: `s1` ghi 0.07 trong khi API trả `share` ĐO ĐƯỢC từ `shopper_profiles`.
 * Con số đóng băng ấy không nằm yên — nó nhân vào số phiên có thật trong
 * `walkJourney`, nên màn Simulate hiện "7% của N phiên" với N thật và 7% bịa.
 *
 * `all` là góc nhìn không thu hẹp, KHÔNG phải một phân khúc — đó là sự vắng
 * mặt của phân khúc.
 */
export const JOURNEY_SEGMENTS: JourneySegment[] = [];

export const segmentById = (
  segments: JourneySegment[],
  id: string
): JourneySegment | null => segments.find(s => s.id === id) ?? null;

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
