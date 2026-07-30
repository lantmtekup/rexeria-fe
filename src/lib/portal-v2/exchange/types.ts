export type ExchangeKind = 'all' | 'page' | 'block';

export type ExchangeObjective = 'all' | 'insight' | 'lead' | 'cta' | 'convert';

export type ExchangePriceFilter = 'all' | 'free' | 'paid';

/** Catalog sources: published landing pages + published blocks. */
export type ExchangeSource = 'page' | 'block';

export type ExchangeEvidence = {
  lift: number;
  sessions: number;
  tier: string;
};

export type ExchangeCoverage = {
  pct: number;
  blocks: number;
  objCovered: boolean;
};

export type ExchangeListingMeta = {
  price: number;
  featured: boolean;
  badge?: string;
  objective: Exclude<ExchangeObjective, 'all'>;
  kind: Exclude<ExchangeKind, 'all'>;
  grad: string;
  summary?: string;
  evidence?: ExchangeEvidence;
  coverage: ExchangeCoverage;
  layerRoles: string[];
};

export type ExchangeListingView = {
  id: string;
  source: ExchangeSource;
  /** Landing page id when source === 'page'. */
  pageId?: string;
  /** Public `/p/{slug}` when source === 'page'. */
  slug?: string;
  /** Seed version when installing a landing listing into a workspace. */
  templateVersionId?: string;
  blockId?: string;
  name: string;
  author: string;
  description: string;
  thumbnailUrl?: string;
  category?: string;
  meta: ExchangeListingMeta;
  proven: boolean;
};

export type ExchangeFilters = {
  q: string;
  kind: ExchangeKind;
  obj: ExchangeObjective;
  price: ExchangePriceFilter;
};

export type ExchangeActionState = 'added' | 'owned' | 'buy' | 'locked';

export type ExchangeSessionState = {
  owned: Record<string, boolean>;
  added: Record<string, string>;
};
