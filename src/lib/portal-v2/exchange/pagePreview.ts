/** Session cache — prefetch `/p/{slug}` before opening preview avoids shell flash. */
const pagePreviewCache = new Set<string>();
const pagePreviewInflight = new Map<string, Promise<boolean>>();

const PAGE_PREVIEW_TIMEOUT_MS = 30_000;

export const isExchangePagePreviewCached = (slug: string): boolean =>
  pagePreviewCache.has(slug);

export const markExchangePagePreviewCached = (slug: string): void => {
  pagePreviewCache.add(slug);
};

/**
 * Warm the landing iframe in a hidden frame. Resolves when onLoad fires or on
 * timeout. Same-origin `/p/*` — browser cache helps the visible iframe later.
 */
export const prefetchExchangePagePreview = (slug: string): Promise<boolean> => {
  if (typeof document === 'undefined') return Promise.resolve(false);
  if (pagePreviewCache.has(slug)) return Promise.resolve(true);

  const inflight = pagePreviewInflight.get(slug);
  if (inflight) return inflight;

  const request = new Promise<boolean>(resolve => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    iframe.style.cssText =
      'position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none';
    iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';
    iframe.src = `/p/${encodeURIComponent(slug)}`;

    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      iframe.onload = null;
      iframe.remove();
      pagePreviewInflight.delete(slug);
      if (ok) pagePreviewCache.add(slug);
      resolve(ok);
    };

    const timer = window.setTimeout(
      () => finish(false),
      PAGE_PREVIEW_TIMEOUT_MS
    );

    iframe.onload = () => finish(true);
    document.body.appendChild(iframe);
  });

  pagePreviewInflight.set(slug, request);
  return request;
};
