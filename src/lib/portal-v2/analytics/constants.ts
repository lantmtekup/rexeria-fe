import type { InsightType, PulseLens } from '@/lib/portal-v2/analytics/types';

export const PULSE_TABS: {
  id: PulseLens;
  labelKey: string;
  subtitleKey: string;
}[] = [
  {
    id: 'overview',
    labelKey: 'tabs.overview',
    subtitleKey: 'tabs.overviewSub',
  },
  {
    id: 'pages',
    labelKey: 'tabs.pages',
    subtitleKey: 'tabs.pagesSub',
  },
  {
    id: 'analytics',
    labelKey: 'tabs.analytics',
    subtitleKey: 'tabs.analyticsSub',
  },
  {
    id: 'insights',
    labelKey: 'tabs.rankings',
    subtitleKey: 'tabs.rankingsSub',
  },
];

export const INSIGHT_TYPES: { id: InsightType; labelKey: string }[] = [
  { id: 'experiences', labelKey: 'rankings.experiences' },
  { id: 'products', labelKey: 'rankings.products' },
  { id: 'journeys', labelKey: 'rankings.journeys' },
  { id: 'blocks', labelKey: 'rankings.blocks' },
];

export const FUNNEL_LABELS = [
  'Sessions',
  'Engaged',
  'Explored',
  'Convinced',
  'Converted',
] as const;

export const RETENTION_LABELS = [
  'Awareness→Engaged',
  'Engaged→Explored',
  'Explored→Convinced',
  'Convinced→Converted',
] as const;

export const ROLE_OF: Record<string, string> = {
  'Awareness→Engaged': 'Hook',
  'Engaged→Explored': 'Explorer',
  'Explored→Convinced': 'Persuader',
  'Convinced→Converted': 'Closer',
};

/** Attention-first campaign health ordering — prototype `rank` map. */
export const HEALTH_RANK: Record<string, number> = {
  risk: 0,
  delayed: 1,
  valuable: 2,
  healthy: 3,
  complete: 4,
};

export const BLOCK_TEMPLATES: { name: string; role: string }[] = [
  { name: 'Hero reveal', role: 'Hook' },
  { name: 'Product story', role: 'Explorer' },
  { name: 'Proof stack', role: 'Persuader' },
  { name: 'Conversion rail', role: 'Closer' },
];

export const COMPONENT_KINDS = [
  'button',
  'media',
  'product',
  'quiz',
  'form',
] as const;

export const COMPONENT_EVENTS = ['view', 'tap', 'complete', 'submit'] as const;

export const COMPONENT_TYPES = ['intent', 'engagement', 'conversion'] as const;
