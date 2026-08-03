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
