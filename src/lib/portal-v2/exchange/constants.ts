import type {
  ExchangeKind,
  ExchangeObjective,
  ExchangePriceFilter,
} from '@/lib/portal-v2/exchange/types';

export const EXCHANGE_CAN_BUY = true;

export const EXCHANGE_KINDS: {
  id: ExchangeKind;
  labelKey: string;
}[] = [
  { id: 'all', labelKey: 'kindAll' },
  { id: 'page', labelKey: 'kindPage' },
  { id: 'block', labelKey: 'kindBlock' },
];

export const EXCHANGE_OBJECTIVES: {
  id: ExchangeObjective;
  labelKey: string;
}[] = [
  { id: 'all', labelKey: 'objAny' },
  { id: 'insight', labelKey: 'objInsight' },
  { id: 'lead', labelKey: 'objLead' },
  { id: 'cta', labelKey: 'objCta' },
  { id: 'convert', labelKey: 'objConvert' },
];

export const EXCHANGE_PRICES: {
  id: ExchangePriceFilter;
  labelKey: string;
}[] = [
  { id: 'all', labelKey: 'priceAny' },
  { id: 'free', labelKey: 'priceFree' },
  { id: 'paid', labelKey: 'pricePaid' },
];

export const EXCHANGE_DEFAULT_FILTERS = {
  q: '',
  kind: 'all' as ExchangeKind,
  obj: 'all' as ExchangeObjective,
  price: 'all' as ExchangePriceFilter,
};

export const EXCHANGE_GRADIENTS = [
  'linear-gradient(135deg,#6C4CF1,#9B7DF8)',
  'linear-gradient(135deg,#3862FF,#6B8AFF)',
  'linear-gradient(135deg,#0EA5A4,#34D399)',
  'linear-gradient(135deg,#F97316,#FBBF24)',
  'linear-gradient(135deg,#EC4899,#A855F7)',
  'linear-gradient(135deg,#64748B,#94A3B8)',
] as const;
