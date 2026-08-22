import { EXCHANGE_CAN_BUY } from '@/lib/portal-v2/exchange/constants';
import type {
  ExchangeActionState,
  ExchangeFilters,
  ExchangeListingView,
  ExchangeSessionState,
} from '@/lib/portal-v2/exchange/types';

/**
 * Nhãn i18n cho kind của một listing. Trước đây hai chỗ tự viết
 * `kind === 'block' ? kindBlock : kindPage`; thêm 'ad' vào ternary đó thì ads
 * bị gọi là "Trải nghiệm". Gom lại một chỗ để lần thêm kind sau không phải đi
 * tìm lại từng ternary.
 */
export const kindLabelKey = (
  kind: ExchangeListingView['meta']['kind']
): string => {
  if (kind === 'block') return 'kindBlock';
  if (kind === 'ad') return 'kindAd';
  return 'kindPage';
};

export const formatPrice = (price: number): string =>
  price > 0 ? `$${price}` : 'Free';

export const formatLift = (lift: number): string => {
  const pct = Math.abs(Math.round(lift * 100));
  const sign = lift >= 0 ? '+' : '−';
  return `${sign}${pct}% vs control`;
};

/**
 * A preview needs a public slug (landings) or a block id (blocks) to render.
 * Ads luôn xem được: route `/rexer/ads/{id}` nằm ngay trong app này, không
 * phụ thuộc bản ghi nào cả.
 */
export const isPreviewable = (listing: ExchangeListingView): boolean => {
  if (listing.source === 'ad') return Boolean(listing.adFormatId);
  return listing.source === 'page'
    ? Boolean(listing.slug)
    : Boolean(listing.blockId);
};

export const resolveActionState = (
  listing: ExchangeListingView,
  session: ExchangeSessionState,
  canBuy = EXCHANGE_CAN_BUY
): ExchangeActionState => {
  // Ads xem được, chưa mang về được — xem doc của `ExchangeActionState`.
  // Đứng TRƯỚC mọi nhánh khác: giá 0 sẽ thành 'owned' và bày ra nút Thêm,
  // mà nút đó dựng `type: 'landing'` từ một creative quảng cáo.
  if (listing.meta.kind === 'ad') return 'unavailable';

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
