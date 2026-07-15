'use client';

import { useEffect } from 'react';
import { ANALYTICS_BLOCKS, REXER_PAGE_ID } from './analytics-data';
import { track } from './rexer-client';

// Mounted on the PUBLIC landing only (`/`) — never on `/analytics`, so an admin
// reviewing the overlay doesn't pollute visitor traffic. Fires:
//   • page_view once on load
//   • block_view per block (dwell_ms + scroll_pct) on exit / pagehide
//   • block_click for any [data-cta-id] element
export default function AnalyticsTracker() {
  useEffect(() => {
    if (!REXER_PAGE_ID) return; // not configured → no-op (see analytics-data.ts)

    track('page_view');

    // Per-block dwell + scroll depth. We watch each block's anchor element and
    // accumulate visible time; max scroll-through % is computed from rects.
    const state = new Map<
      string,
      { enteredAt: number; dwell: number; maxScroll: number }
    >();

    const els: Element[] = [];
    ANALYTICS_BLOCKS.forEach(b => {
      const el = document.querySelector(b.selector);
      if (el) {
        els.push(el);
        state.set(b.id, { enteredAt: 0, dwell: 0, maxScroll: 0 });
      }
    });

    const idForEl = (el: Element) =>
      ANALYTICS_BLOCKS.find(b => el.matches(b.selector))?.id ?? null;

    // Human label for a block / CTA — sent as `section_label` / `cta_label`
    // dimensions so the ReXeR portal can show the same friendly names as the
    // on-site overlay instead of the raw section_id ('discover' → 'Product
    // Detail · Reverse'). The label is defined once in ANALYTICS_BLOCKS.
    const labelForBlock = (id?: string) =>
      ANALYTICS_BLOCKS.find(b => b.id === id)?.label;
    const labelForCta = (sectionId: string | undefined, ctaId: string) =>
      ANALYTICS_BLOCKS.find(b => b.id === sectionId)?.ctas?.find(
        c => c.id === ctaId
      )?.label;

    const flush = (id: string) => {
      const s = state.get(id);
      if (!s) return;
      if (s.enteredAt) {
        s.dwell += performance.now() - s.enteredAt;
        s.enteredAt = 0;
      }
      if (s.dwell < 250) return; // ignore quick fly-bys
      // block_view is the event_type the BE counts as a block view; scroll_pct
      // in metrics feeds avg_scroll_depth. One per enter→exit cycle.
      const label = labelForBlock(id);
      track('block_view', {
        sectionId: id,
        dimensions: label ? { section_label: label } : undefined,
        metrics: {
          dwell_ms: Math.round(s.dwell),
          scroll_pct: Math.round(s.maxScroll),
        },
      });
      s.dwell = 0;
      s.maxScroll = 0;
    };

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          const id = idForEl(e.target);
          if (!id) return;
          const s = state.get(id)!;
          if (e.isIntersecting && !s.enteredAt) {
            s.enteredAt = performance.now();
          } else if (!e.isIntersecting && s.enteredAt) {
            flush(id);
          }
        });
      },
      { threshold: 0.25 }
    );
    els.forEach(el => io.observe(el));

    // Track max scroll-through per visible block on scroll.
    const onScroll = () => {
      const vh = window.innerHeight;
      ANALYTICS_BLOCKS.forEach(b => {
        const el = document.querySelector(b.selector);
        const s = state.get(b.id);
        if (!el || !s) return;
        const r = el.getBoundingClientRect();
        if (r.bottom <= 0 || r.top >= vh) return;
        const pct = ((vh - r.top) / Math.max(r.height, 1)) * 100;
        s.maxScroll = Math.min(100, Math.max(s.maxScroll, pct));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // CTA clicks (explicit markers only — keeps signal clean).
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cta = target.closest?.('[data-cta-id]') as HTMLElement | null;
      if (!cta) return;
      // Attribute the click to the block whose anchor element contains it.
      const sectionId = ANALYTICS_BLOCKS.find(b => cta.closest(b.selector))?.id;
      const ctaId = cta.getAttribute('data-cta-id') || 'unknown';
      const sectionLabel = labelForBlock(sectionId);
      const ctaLabel = labelForCta(sectionId, ctaId);
      const dims: Record<string, string> = {};
      if (sectionLabel) dims.section_label = sectionLabel;
      if (ctaLabel) dims.cta_label = ctaLabel;
      // block_click counts toward both block clicks and summary clicks.
      track('block_click', {
        ctaId,
        sectionId,
        dimensions: Object.keys(dims).length ? dims : undefined,
      });
    };
    document.addEventListener('click', onClick);

    // Flush remaining dwell when leaving the page.
    const onHide = () => state.forEach((_, id) => flush(id));
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') onHide();
    });

    return () => {
      onHide();
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
      window.removeEventListener('pagehide', onHide);
    };
  }, []);

  return null;
}
