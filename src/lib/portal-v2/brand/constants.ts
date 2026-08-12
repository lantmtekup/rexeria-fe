export const INDUSTRIES: Record<string, { n: string }> = {
  beauty: { n: 'Beauty & personal care' },
  fashion: { n: 'Fashion & apparel' },
  electronics: { n: 'Consumer electronics' },
  home: { n: 'Home & furniture' },
  food: { n: 'Food & beverage' },
  health: { n: 'Health & wellness' },
  auto: { n: 'Automotive' },
  finance: { n: 'Financial services' },
  saas: { n: 'B2B software' },
  travel: { n: 'Travel & hospitality' },
  sport: { n: 'Sport & outdoor' },
  luxury: { n: 'Luxury' },
  other: { n: 'Other' },
};

export const TONES = [
  'Direct',
  'Warm',
  'Playful',
  'Authoritative',
  'Minimal',
  'Bold',
  'Technical',
  'Editorial',
] as const;

export const TRAITS = [
  'Precise',
  'Warm',
  'Unfussy',
  'Confident',
  'Playful',
  'Rigorous',
  'Generous',
  'Understated',
  'Bold',
  'Curious',
  'Patient',
  'Irreverent',
] as const;

export const BUY_STAGES: Record<string, { n: string; d: string }> = {
  discovery: {
    n: 'Discovery',
    d: 'Meeting the category for the first time',
  },
  consideration: {
    n: 'Consideration',
    d: 'Weighing options, including doing nothing',
  },
  decision: {
    n: 'Decision',
    d: 'Choosing between you and one named rival',
  },
  loyalty: {
    n: 'Loyalty',
    d: 'Already bought. Deciding whether to again',
  },
};

export const AWARENESS: Record<string, { n: string; r: string; d: string }> = {
  unaware: {
    n: 'Unaware',
    r: 'ATT',
    d: 'Does not know the problem exists',
  },
  problem: {
    n: 'Problem aware',
    r: 'EDU',
    d: 'Feels the problem, does not know the solution',
  },
  solution: {
    n: 'Solution aware',
    r: 'EXP',
    d: 'Knows the solution, not that you exist',
  },
  product: {
    n: 'Product aware',
    r: 'TRU',
    d: 'Knows you. Not yet convinced',
  },
  most: {
    n: 'Most aware',
    r: 'CON',
    d: 'Convinced. Waiting for a reason to act now',
  },
};

export const ROLE_STYLES: Record<
  string,
  { name: string; bg: string; fg: string }
> = {
  ATT: {
    name: 'Attention',
    bg: 'bg-amber-50',
    fg: 'text-amber-800',
  },
  EDU: {
    name: 'Educate',
    bg: 'bg-[var(--pv2-electric-soft)]',
    fg: 'text-[var(--pv2-electric)]',
  },
  EXP: {
    name: 'Explore',
    bg: 'bg-sky-50',
    fg: 'text-sky-800',
  },
  TRU: {
    name: 'Trust',
    bg: 'bg-rose-50',
    fg: 'text-rose-800',
  },
  CON: {
    name: 'Convert',
    bg: 'bg-emerald-50',
    fg: 'text-emerald-800',
  },
};

export const MARKET_CATEGORIES = [
  'Complexion',
  'Colour cosmetics',
  'Skincare',
  'Suncare',
  'Haircare',
  'Fragrance',
  'Wellness',
  'Tools & devices',
  'Accessories',
  'Apparel',
  'Home',
  'Food & drink',
] as const;

export const BRAND_TABS = [
  {
    id: 'identity' as const,
    labelKey: 'tabIdentity',
    descKey: 'tabIdentityDesc',
  },
  {
    id: 'essence' as const,
    labelKey: 'tabEssence',
    descKey: 'tabEssenceDesc',
  },
  {
    id: 'audience' as const,
    labelKey: 'tabAudience',
    descKey: 'tabAudienceDesc',
  },
  {
    id: 'visual' as const,
    labelKey: 'tabVisual',
    descKey: 'tabVisualDesc',
  },
];

/**
 * Từ vựng BE bắt buộc cho một persona. Đây là BẢN SAO của luật bên
 * `internal/core/brand_profile_validator.go` — đổi bên đó thì phải sửa cả đây.
 *
 * Bản sao này bắt buộc vì form phải dựng dropdown TRƯỚC khi hỏi server, và một
 * ô nhập tự do ở ba trường dưới đây chỉ dẫn tới `PUT` trả 400 cho CẢ lượt lưu —
 * kể cả những section người dùng không đụng tới.
 */

/** `tier` — chữ THƯỜNG. `taxonomy.PersonaTiers`. */
export const PERSONA_TIERS: { id: string; n: string }[] = [
  { id: 'primary', n: 'Primary' },
  { id: 'secondary', n: 'Secondary' },
  { id: 'retention', n: 'Retention' },
];

/**
 * `behaves` — MỘT trong tám phân khúc hành vi `s1`..`s8` (spec §8.6,
 * `core/segment.go`). KHÔNG phải chữ tự do: chuỗi nào khác cũng bị
 * `ValidatePersonas` từ chối.
 *
 * `s7` là phân khúc bắt-tất của BE (`AssignSegment` rơi về Casual explorer),
 * nên nó là mặc định an toàn cho một persona vừa tạo.
 */
export const BEHAVE_SEGMENTS: { id: string; n: string }[] = [
  { id: 's1', n: 'High intent' },
  { id: 's2', n: 'Active comparator' },
  { id: 's3', n: 'Trust seeker' },
  { id: 's4', n: 'Product researcher' },
  { id: 's5', n: 'Price sensitive' },
  { id: 's6', n: 'Story engaged' },
  { id: 's7', n: 'Casual explorer' },
  { id: 's8', n: 'Returning decider' },
];

export const DEFAULT_BEHAVE_SEGMENT = 's7';
