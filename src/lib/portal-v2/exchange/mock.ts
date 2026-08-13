import { EXCHANGE_GRADIENTS } from '@/lib/portal-v2/exchange/constants';
import type { ExchangeListingMeta } from '@/lib/portal-v2/exchange/types';

/** Marketplace overlay — temporary until BE ships exchange fields. */
export const EXCHANGE_PAGE_META_PRESETS: Omit<
  ExchangeListingMeta,
  'grad' | 'kind'
>[] = [
  {
    price: 49,
    featured: true,
    badge: 'Staff pick',
    objective: 'lead',
    summary:
      'Catches the shopper who bounces on a shade grid. Three taps, one match.',
    evidence: { lift: 0.18, sessions: 12400, tier: 'Strong' },
    coverage: { pct: 92, blocks: 4, objCovered: true },
  },
  {
    price: 39,
    featured: true,
    objective: 'cta',
    summary: 'Product story with a single decisive CTA.',
    evidence: { lift: 0.12, sessions: 8600, tier: 'Moderate' },
    coverage: { pct: 88, blocks: 5, objCovered: true },
  },
  {
    price: 29,
    featured: true,
    objective: 'convert',
    summary: 'Conversion-first layout with proof blocks built in.',
    evidence: { lift: 0.09, sessions: 5200, tier: 'Moderate' },
    coverage: { pct: 85, blocks: 4, objCovered: true },
  },
  {
    price: 29,
    featured: false,
    objective: 'insight',
    summary: 'Learn what shoppers prefer before you ask for the sale.',
    coverage: { pct: 76, blocks: 3, objCovered: false },
  },
  {
    price: 0,
    featured: false,
    objective: 'lead',
    summary: 'Free starter template for lead capture flows.',
    coverage: { pct: 70, blocks: 3, objCovered: true },
  },
  {
    price: 0,
    featured: false,
    objective: 'cta',
    summary: 'Community template — simple CTA surface.',
    coverage: { pct: 65, blocks: 2, objCovered: true },
  },
];

export const EXCHANGE_BLOCK_META_PRESETS: Omit<
  ExchangeListingMeta,
  'grad' | 'kind'
>[] = [
  {
    price: 19,
    featured: false,
    objective: 'convert',
    summary: 'Single conversion block with social proof slot.',
    evidence: { lift: 0.06, sessions: 2100, tier: 'Early' },
    coverage: { pct: 100, blocks: 1, objCovered: true },
  },
  {
    price: 0,
    featured: false,
    objective: 'insight',
    summary: 'Poll block for first-party preference data.',
    coverage: { pct: 100, blocks: 1, objCovered: true },
  },
  {
    price: 29,
    featured: false,
    badge: 'New',
    objective: 'cta',
    summary: 'Hero + CTA block pair for campaign inserts.',
    coverage: { pct: 100, blocks: 2, objCovered: false },
  },
  {
    price: 0,
    featured: false,
    objective: 'lead',
    summary: 'Email capture block with minimal friction.',
    coverage: { pct: 100, blocks: 1, objCovered: true },
  },
  {
    price: 9,
    featured: false,
    objective: 'convert',
    summary: 'Compact offer block for product grids.',
    evidence: { lift: 0.04, sessions: 980, tier: 'Early' },
    coverage: { pct: 100, blocks: 1, objCovered: true },
  },
  {
    price: 19,
    featured: false,
    objective: 'cta',
    summary: 'Educate-then-act block with media slot.',
    coverage: { pct: 100, blocks: 1, objCovered: true },
  },
];

const hashIndex = (id: string): number => {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h + id.charCodeAt(i) * (i + 1)) % 9973;
  }
  return h;
};

export const pageMetaPreset = (
  id: string
): Omit<ExchangeListingMeta, 'kind'> => {
  const i = hashIndex(id);
  const preset =
    EXCHANGE_PAGE_META_PRESETS[i % EXCHANGE_PAGE_META_PRESETS.length]!;
  return {
    ...preset,
    grad: EXCHANGE_GRADIENTS[i % EXCHANGE_GRADIENTS.length]!,
  };
};

export const blockMetaPreset = (
  id: string
): Omit<ExchangeListingMeta, 'kind'> => {
  const i = hashIndex(id);
  const preset =
    EXCHANGE_BLOCK_META_PRESETS[i % EXCHANGE_BLOCK_META_PRESETS.length]!;
  return {
    ...preset,
    grad: EXCHANGE_GRADIENTS[i % EXCHANGE_GRADIENTS.length]!,
  };
};
