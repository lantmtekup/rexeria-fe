/**
 * URL state của ba màn Journey Audit — client ghi qua `history.replaceState`
 * (không refetch RSC), route đọc lại lúc SSR để deep-link/hai chiều
 * Journey ↔ Drop-off hoạt động.
 *
 * `?brand=` thuộc về scope (BrandScopeBar) — các helper build href chéo màn
 * phải giữ nó lại, nếu không admin nhảy màn là rơi brand đang chọn.
 */

export const PRODUCT_PARAM = 'product';
export const LENS_PARAM = 'lens';
export const TP_PARAM = 'tp';
export const LEAK_PARAM = 'leak';

export type AuditLens = 'quality' | 'flow';

const readParam = (
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string | null => {
  const raw = searchParams[key];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return value || null;
};

export type JourneyAuditViewState = {
  productId: string | null;
  lens: AuditLens;
  touchpointId: string | null;
};

export const readJourneyAuditParams = (
  searchParams: Record<string, string | string[] | undefined>
): JourneyAuditViewState => ({
  productId: readParam(searchParams, PRODUCT_PARAM),
  lens: readParam(searchParams, LENS_PARAM) === 'flow' ? 'flow' : 'quality',
  touchpointId: readParam(searchParams, TP_PARAM),
});

export type DropoffViewState = {
  productId: string | null;
  leakId: string | null;
};

export const readDropoffParams = (
  searchParams: Record<string, string | string[] | undefined>
): DropoffViewState => ({
  productId: readParam(searchParams, PRODUCT_PARAM),
  leakId: readParam(searchParams, LEAK_PARAM),
});

const replaceParams = (updates: Record<string, string | null>): void => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  Object.entries(updates).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  });
  window.history.replaceState(window.history.state, '', url.toString());
};

export const writeJourneyAuditParams = (state: JourneyAuditViewState): void =>
  replaceParams({
    [PRODUCT_PARAM]: state.productId,
    [LENS_PARAM]: state.lens === 'flow' ? 'flow' : null,
    [TP_PARAM]: state.touchpointId,
  });

export const writeDropoffParams = (state: DropoffViewState): void =>
  replaceParams({
    [PRODUCT_PARAM]: state.productId,
    [LEAK_PARAM]: state.leakId,
  });

/** Href chéo màn, giữ `?brand=` của scope hiện tại (đọc từ URL đang đứng). */
export const crossHref = (
  path: string,
  params: Record<string, string | null>
): string => {
  const search = new URLSearchParams();
  if (typeof window !== 'undefined') {
    const brand = new URLSearchParams(window.location.search).get('brand');
    if (brand) search.set('brand', brand);
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
};
