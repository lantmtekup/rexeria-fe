/** Query param that makes an open shopper-preview shareable: `?preview={listingId}`. */
export const EXCHANGE_PREVIEW_PARAM = 'preview';

export const readExchangePreviewParam = (
  searchParams: Record<string, string | string[] | undefined>
): string | null => {
  const raw = searchParams[EXCHANGE_PREVIEW_PARAM];
  const id = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return id || null;
};

/**
 * Keeps the address bar in step with the open preview. `replaceState` instead of
 * `router.replace` so the server page (and its catalog fetch) never re-runs, and
 * so preview open/close never piles up history entries.
 */
export const writeExchangePreviewParam = (listingId: string | null): void => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const current = url.searchParams.get(EXCHANGE_PREVIEW_PARAM);
  if (current === listingId) return;

  if (listingId) {
    url.searchParams.set(EXCHANGE_PREVIEW_PARAM, listingId);
  } else {
    url.searchParams.delete(EXCHANGE_PREVIEW_PARAM);
  }

  window.history.replaceState(window.history.state, '', url.toString());
};
