import { EXCHANGE_CAN_BUY } from '@/lib/portal-v2/exchange/constants';
import type {
  ExchangeActionState,
  ExchangeFilters,
  ExchangeListingView,
  ExchangeSessionState,
} from '@/lib/portal-v2/exchange/types';

export const formatPrice = (price: number): string =>
  price > 0 ? `$${price}` : 'Free';

export const formatLift = (lift: number): string => {
  const pct = Math.abs(Math.round(lift * 100));
  const sign = lift >= 0 ? '+' : '−';
  return `${sign}${pct}% vs control`;
};

export const resolveActionState = (
  listing: ExchangeListingView,
  session: ExchangeSessionState,
  canBuy = EXCHANGE_CAN_BUY
): ExchangeActionState => {
  if (session.added[listing.id]) return 'added';

  const ownedKeys = [listing.id, listing.pageId, listing.blockId].filter(
    Boolean
  ) as string[];

  const owned =
    listing.meta.price === 0 || ownedKeys.some(key => session.owned[key]);

  if (owned) return 'owned';
  if (listing.meta.price > 0 && !canBuy) return 'locked';
  if (listing.meta.price > 0) return 'buy';
  return 'owned';
};

export const filterListings = (
  listings: ExchangeListingView[],
  filters: ExchangeFilters
): ExchangeListingView[] => {
  let reads = [...listings];

  // kind + q are applied server-side when refetching; keep as safety net
  if (filters.kind !== 'all') {
    reads = reads.filter(r => r.meta.kind === filters.kind);
  }
  if (filters.obj !== 'all') {
    reads = reads.filter(r => r.meta.objective === filters.obj);
  }
  if (filters.price !== 'all') {
    reads = reads.filter(r =>
      filters.price === 'free' ? r.meta.price === 0 : r.meta.price > 0
    );
  }

  const proven = reads
    .filter(r => r.proven)
    .sort(
      (a, b) =>
        (b.meta.evidence?.lift ?? 0) - (a.meta.evidence?.lift ?? 0) ||
        (b.meta.evidence?.sessions ?? 0) - (a.meta.evidence?.sessions ?? 0)
    );
  const unproven = reads.filter(r => !r.proven);
  return [...proven, ...unproven];
};

export const countByKind = (
  listings: ExchangeListingView[],
  kind: ExchangeFilters['kind']
): number => {
  if (kind === 'all') return listings.length;
  return listings.filter(r => r.meta.kind === kind).length;
};

export const authorLabel = (
  author: string | { display_name?: string } | undefined
): string => {
  if (!author) return 'Unknown';
  if (typeof author === 'string') {
    const trimmed = author.trim();
    return trimmed || 'Unknown';
  }
  return author.display_name?.trim() || 'Unknown';
};
