/**
 * React hooks that wrap the singleton `tracker` for the public landing
 * route. Three hooks:
 *
 * - `useInitTracker(pageId)`: mounts the tracker + fires `page_view`
 *   once per session. Returns nothing — it's a side-effect hook.
 *
 * - `useBlockTracking(signalByBlockId?)`: sets up the global click capture +
 *   scroll-depth listeners + IntersectionObserver for `[data-block-id]` /
 *   `[data-element-id]`. Call it once near the top of the page, after blocks
 *   are rendered.
 *
 * OPT-IN GATING (2026-08-14). Every block/element-level event now requires
 * explicit `block.signal` config — the same config the editor's "Signal" tab
 * writes into `canvas_blueprint.blocks[].signal`. A block with no `signal` at
 * all, or `signal.track !== true`, emits nothing beyond the page-level
 * `page_view`. This is a deliberate coverage change: most blocks in
 * production have no signal config yet, so `block_view`/`block_dwell`/
 * per-element `click` will go quiet on unconfigured pages until content
 * owners opt blocks in via the Signal panel. `page_view` is unaffected — it
 * is not attached to any block.
 *
 * `signalByBlockId` may arrive after mount (e.g. `_legacy-token-view.tsx`
 * loads its canvas async) — it is read through a ref inside the listeners
 * below rather than closed over, so passing a fresh map on a later render
 * takes effect without re-wiring the DOM listeners.
 *
 * Both are pure side-effects; nothing renders.
 */

import * as React from 'react';

import type {
  BlockSignalConfig,
  ComponentSignalConfig,
} from '@/components/modules/block-editor/types';

import { tracker } from './tracker';

/* ---------------- signal gating ---------------- */

/** Master switch for a block — `undefined`/`false` means "born untracked". */
function blockIsTrackable(signal: BlockSignalConfig | undefined): boolean {
  return signal?.track === true;
}

/**
 * Does this block want a given mechanical signal (`dwell`/`scroll`/`tap`/...)?
 * Once `track` is on, an omitted key in `signals` defaults to on — matches
 * `DEFAULT_BLOCK_SIGNALS` in `block-editor-v2/signal/vocabulary.ts`, which
 * seeds `dwell`/`scroll`/`tap` true the moment the master toggle is first
 * turned on.
 */
function blockWantsSignal(
  signal: BlockSignalConfig | undefined,
  key: string
): boolean {
  if (!blockIsTrackable(signal)) return false;
  return signal?.signals?.[key] !== false;
}

/** A tracking point's config, only if its own toggle is actually on. */
function elementSignalOf(
  signal: BlockSignalConfig | undefined,
  elementKey: string
): ComponentSignalConfig | undefined {
  if (!blockIsTrackable(signal)) return undefined;
  const cfg = signal?.components?.[elementKey];
  return cfg?.track ? cfg : undefined;
}

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
 *   - click capture on `[data-element-id]` → fires `click` (ungated — this is
 *     the ad-widget's own manually-assigned ids, a separate mechanism, see
 *     `InteractiveAdWidget.tsx`; never gated by signal config)
 *   - click capture on `[data-element-key]` → fires `click` ONLY when the
 *     owning block's signal config marks that element as a tracking point
 *     (`signal.components[key].track === true`); carries the tracking
 *     point's config in `meta.signal`
 *   - scroll → fires `scroll_depth` at 25/50/75/100% (once each), only while
 *     at least one block on the page wants the `scroll` signal
 *   - IntersectionObserver on `[data-block-id]` → fires `block_view` (first
 *     time) and `block_dwell` (on exit, with accumulated visible time), only
 *     for blocks whose signal config has `track: true` and hasn't turned
 *     `dwell` off
 *
 * @param signalByBlockId `block.id → block.signal`, built by the caller from
 *   the page's parsed blocks. See the opt-in note in the file header.
 */
export function useBlockTracking(
  signalByBlockId?: Record<string, BlockSignalConfig>
): void {
  const signalRef = React.useRef(signalByBlockId);
  React.useEffect(() => {
    signalRef.current = signalByBlockId;
  }, [signalByBlockId]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    /* ---- click (legacy, ungated — InteractiveAdWidget's own ids) ---- */
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

    /* ---- click (signal-gated — `data-element-key` from RenderBlock) ---- */
    const onSignalClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const el = target.closest<HTMLElement>('[data-element-key]');
      if (!el) return;
      const elementKey = el.getAttribute('data-element-key');
      const block = el.closest<HTMLElement>('[data-block-id]');
      const blockId = block?.getAttribute('data-block-id');
      if (!elementKey || !blockId) return;
      const cfg = elementSignalOf(signalRef.current?.[blockId], elementKey);
      if (!cfg) return;
      tracker.emit({
        event_type: 'click',
        action: 'click',
        element_id: elementKey,
        block_id: blockId,
        target: elementKey,
        meta: {
          signal: {
            type: cfg.type,
            event: cfg.event,
            object: cfg.object,
            threshold: cfg.threshold,
            strength: cfg.strength,
            crm: cfg.crm,
            privacy: cfg.privacy,
          },
        },
      });
    };
    document.addEventListener('click', onSignalClick, true);

    /* ---- scroll depth ---- */
    const pageWantsScroll = (): boolean => {
      const map = signalRef.current;
      if (!map) return false;
      return Object.values(map).some(s => blockWantsSignal(s, 'scroll'));
    };
    const firedScroll = new Set<number>();
    const onScroll = () => {
      if (!pageWantsScroll()) return;
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
    // Observe currently mounted blocks that opted into dwell/view tracking;
    // re-observe on DOM mutation (block navigation, lazy mount, or a signal
    // map that arrived after the initial mount).
    const observeAll = () => {
      document.querySelectorAll('[data-block-id]').forEach(el => {
        const blockId = el.getAttribute('data-block-id');
        if (
          blockId &&
          blockWantsSignal(signalRef.current?.[blockId], 'dwell')
        ) {
          io.observe(el);
        }
      });
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
      document.removeEventListener('click', onSignalClick, true);
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('pagehide', onUnload);
      io.disconnect();
      mo.disconnect();
      if (scrollRaf !== null) cancelAnimationFrame(scrollRaf);
      flushOpenDwells();
    };
  }, []);
}
