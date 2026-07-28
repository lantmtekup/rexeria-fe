/**
 * React hooks that wrap the singleton `tracker` for the public landing
 * route. Three hooks:
 *
 * - `useInitTracker(pageId)`: mounts the tracker + fires `page_view`
 *   once per session. Returns nothing — it's a side-effect hook.
 *
 * - `useBlockTracking()`: sets up the global click capture + scroll-depth
 *   listeners + IntersectionObserver for `[data-block-id]` / `[data-element-id]`.
 *   Call it once near the top of the page, after blocks are rendered.
 *
 * Both are pure side-effects; nothing renders.
 */

import * as React from 'react';

import { tracker } from './tracker';

/* ---------------- init + page_view ---------------- */

const pageViewFiredFor = new Set<string>();

/**
 * @param subPage Slug of the sub-page being viewed, '' for the landing's home
 *   page. A multi-page template is ONE BE `Page` row, so every sub-page shares
 *   `pageId`; without this the dedupe key would suppress every view after the
 *   first and all sub-page traffic would collapse onto the landing root.
 *   BE has no sub-page column yet, so it rides along in `target` + `meta`.
 */
export function useInitTracker(
  pageId: string | null | undefined,
  subPage?: string
): void {
  React.useEffect(() => {
    if (!pageId) return;
    tracker.init(pageId);
    const key = `${pageId}:${subPage ?? ''}:${tracker.session}`;
    if (!pageViewFiredFor.has(key)) {
      pageViewFiredFor.add(key);
      tracker.emit({
        event_type: 'page_view',
        ...(subPage ? { target: subPage, meta: { sub_page: subPage } } : {}),
      });
    }
  }, [pageId, subPage]);
}

/* ---------------- click + scroll + intersection ---------------- */

const SCROLL_THRESHOLDS = [25, 50, 75, 100];

interface BlockDwell {
  blockId: string;
  enteredAt: number; // performance.now()
  accumulatedMs: number;
}

/**
 * Wires document-level listeners:
 *   - click capture on `[data-element-id]` → fires `click`
 *   - scroll → fires `scroll_depth` at 25/50/75/100% (once each)
 *   - IntersectionObserver on `[data-block-id]` → fires `block_view` (first
 *     time) and `block_dwell` (on exit, with accumulated visible time)
 */
export function useBlockTracking(): void {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    /* ---- click ---- */
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const el = target.closest<HTMLElement>('[data-element-id]');
      if (!el) return;
      const elementId = el.getAttribute('data-element-id') ?? undefined;
      const elementRole =
        el.getAttribute('data-element-role') ??
        (el.tagName === 'A'
          ? 'link'
          : el.tagName === 'BUTTON'
            ? 'button'
            : undefined);
      const block = el.closest<HTMLElement>('[data-block-id]');
      const blockId = block?.getAttribute('data-block-id') ?? undefined;
      tracker.emit({
        event_type: 'click',
        action: 'click',
        element_id: elementId,
        element_role: elementRole,
        block_id: blockId,
        target: elementId,
      });
    };
    document.addEventListener('click', onClick, true);

    /* ---- scroll depth ---- */
    const firedScroll = new Set<number>();
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH <= 0) return;
      const pct = Math.round((window.scrollY / docH) * 100);
      for (const t of SCROLL_THRESHOLDS) {
        if (pct >= t && !firedScroll.has(t)) {
          firedScroll.add(t);
          tracker.emit({ event_type: 'scroll_depth', scroll_depth: t });
        }
      }
    };
    let scrollRaf: number | null = null;
    const throttledScroll = () => {
      if (scrollRaf !== null) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        onScroll();
      });
    };
    window.addEventListener('scroll', throttledScroll, { passive: true });

    /* ---- block view + dwell via IntersectionObserver ---- */
    const dwells = new Map<string, BlockDwell>();
    const firedView = new Set<string>();
    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const node = entry.target as HTMLElement;
          const blockId = node.getAttribute('data-block-id');
          if (!blockId) continue;
          const visible = entry.intersectionRatio >= 0.5;
          if (visible) {
            if (!firedView.has(blockId)) {
              firedView.add(blockId);
              tracker.emit({
                event_type: 'block_view',
                block_id: blockId,
              });
            }
            // Start a dwell window.
            if (!dwells.has(blockId)) {
              dwells.set(blockId, {
                blockId,
                enteredAt: performance.now(),
                accumulatedMs: 0,
              });
            }
          } else {
            const d = dwells.get(blockId);
            if (d) {
              const delta = performance.now() - d.enteredAt;
              const total = Math.round(d.accumulatedMs + delta);
              if (total > 250) {
                tracker.emit({
                  event_type: 'block_dwell',
                  block_id: blockId,
                  dwell_ms: total,
                });
              }
              dwells.delete(blockId);
            }
          }
        }
      },
      { threshold: [0, 0.5] }
    );
    // Observe currently mounted blocks; re-observe on DOM mutation (block
    // navigation, lazy mount).
    const observeAll = () => {
      document
        .querySelectorAll('[data-block-id]')
        .forEach(el => io.observe(el));
    };
    observeAll();
    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });

    /* ---- flush any still-open dwells on unload ---- */
    const flushOpenDwells = () => {
      for (const d of dwells.values()) {
        const delta = performance.now() - d.enteredAt;
        const total = Math.round(d.accumulatedMs + delta);
        if (total > 250) {
          tracker.emit({
            event_type: 'block_dwell',
            block_id: d.blockId,
            dwell_ms: total,
          });
        }
      }
      dwells.clear();
    };
    const onUnload = () => {
      flushOpenDwells();
      tracker.flush(true);
    };
    window.addEventListener('pagehide', onUnload);

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('pagehide', onUnload);
      io.disconnect();
      mo.disconnect();
      if (scrollRaf !== null) cancelAnimationFrame(scrollRaf);
      flushOpenDwells();
    };
  }, []);
}
