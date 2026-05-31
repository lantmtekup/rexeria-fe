'use client';

/**
 * Section tracking hook cho code templates. Mount ở public render mode
 * (`/p/{slug}`), tracking life cycle:
 *
 * 1. **page_view** — fire on mount (1 lần per session).
 * 2. **section_view** — IntersectionObserver: section ≥ 50% visible
 *    + ≥ 800ms dwell → fire 1 lần per session per section.
 * 3. **cta_click** — click delegation on `[data-rexer-cta]` elements
 *    bubbles up từ document, fire mỗi click (no dedup).
 *
 * Event format = GA-style với `dimensions` map (key-value flexible)
 * cho custom keys (section_id, cta_id, variant, scroll_depth, …) +
 * `metrics` map (numeric aggregations). Schema chuẩn FE phía dưới;
 * BE chưa accept `dimensions` field sẽ ignore (best-effort tracking
 * — không block render).
 *
 * Session: `sessionStorage.rexer_landing_sid` (giữ cùng pattern với
 * BE-rendered tracking script ở `/p/{slug}` legacy). Mỗi tab = 1
 * session.
 */

import * as React from 'react';

import type { TemplateTrackingConfig } from '../types';

interface TrackEvent {
  page_id: string;
  release_id?: string | null;
  event_type: 'page_view' | 'section_view' | 'cta_click';
  session_id: string;
  occurred_at: string;
  /** Flexible dimensions — GA-style. BE store as JSONB. Keys:
   *  section_id, section_label, cta_id, cta_label, variant, etc. */
  dimensions?: Record<string, string | number | boolean | null>;
  /** Numeric metrics cho value aggregations. */
  metrics?: Record<string, number>;
  /** Idempotency key dedup duplicate fires (vd user navigate back). */
  event_idempotency_key?: string;
}

function sessionId(): string {
  if (typeof window === 'undefined') return '';
  const KEY = 'rexer_landing_sid';
  let s = sessionStorage.getItem(KEY);
  if (!s) {
    s = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    sessionStorage.setItem(KEY, s);
  }
  return s;
}

/** Fire-and-forget POST to /v1/track. Errors swallowed (tracking
 *  failure không block UX). */
async function fire(event: TrackEvent): Promise<void> {
  try {
    await fetch('/api/rexer/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    });
  } catch {
    // Best-effort tracking.
  }
}

interface Options {
  pageId: string;
  releaseId?: string | null;
  tracking?: TemplateTrackingConfig;
  /** Enable flag — set `false` ở preview/edit để khỏi pollute prod data. */
  enabled: boolean;
}

/**
 * Setup tracking khi template render ở public mode. Caller MUST gate
 * `enabled` theo mode === 'public' để preview không fire events.
 */
export function useSectionTracking({
  pageId,
  releaseId,
  tracking,
  enabled,
}: Options): void {
  React.useEffect(() => {
    if (!enabled || !pageId) return;
    const sid = sessionId();
    const now = () => new Date().toISOString();

    // 1. page_view — 1 lần per session.
    const pageViewKey = `pv:${pageId}:${sid}`;
    if (!sessionStorage.getItem(pageViewKey)) {
      sessionStorage.setItem(pageViewKey, '1');
      void fire({
        page_id: pageId,
        release_id: releaseId ?? null,
        event_type: 'page_view',
        session_id: sid,
        occurred_at: now(),
        event_idempotency_key: pageViewKey,
      });
    }

    // 2. section_view — IntersectionObserver. Dedup per session.
    const seenSections = new Set<string>();
    const dwellTimers = new Map<string, number>();
    const sectionMap = new Map<string, { id: string; label: string }>();
    for (const s of tracking?.sections ?? []) {
      sectionMap.set(s.id, s);
    }

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const sectionId = el.dataset.rexerSection;
          if (!sectionId || seenSections.has(sectionId)) continue;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Start 800ms dwell timer
            if (!dwellTimers.has(sectionId)) {
              const tid = window.setTimeout(() => {
                seenSections.add(sectionId);
                const meta = sectionMap.get(sectionId);
                void fire({
                  page_id: pageId,
                  release_id: releaseId ?? null,
                  event_type: 'section_view',
                  session_id: sid,
                  occurred_at: now(),
                  dimensions: {
                    section_id: sectionId,
                    section_label: meta?.label ?? sectionId,
                  },
                  event_idempotency_key: `sv:${pageId}:${sid}:${sectionId}`,
                });
                dwellTimers.delete(sectionId);
              }, 800);
              dwellTimers.set(sectionId, tid);
            }
          } else {
            // Left viewport before dwell → cancel timer.
            const tid = dwellTimers.get(sectionId);
            if (tid !== undefined) {
              clearTimeout(tid);
              dwellTimers.delete(sectionId);
            }
          }
        }
      },
      { threshold: [0, 0.5, 1] }
    );

    // Observe declared sections only — avoid noise từ random elements.
    const sectionEls = document.querySelectorAll<HTMLElement>(
      '[data-rexer-section]'
    );
    sectionEls.forEach(el => observer.observe(el));

    // 3. cta_click — delegation. Fire mỗi click (user có thể click
    // nhiều lần, mỗi lần = conversion intent).
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const cta = target?.closest<HTMLElement>('[data-rexer-cta]');
      if (!cta) return;
      const ctaId = cta.dataset.rexerCta ?? 'unknown';
      const sectionEl = cta.closest<HTMLElement>('[data-rexer-section]');
      const sectionId = sectionEl?.dataset.rexerSection;
      const ctaLabel =
        cta.getAttribute('aria-label') ?? cta.textContent?.trim();
      void fire({
        page_id: pageId,
        release_id: releaseId ?? null,
        event_type: 'cta_click',
        session_id: sid,
        occurred_at: now(),
        dimensions: {
          cta_id: ctaId,
          cta_label: ctaLabel ?? ctaId,
          ...(sectionId ? { section_id: sectionId } : {}),
        },
      });
    };
    document.addEventListener('click', onClick, { capture: true });

    return () => {
      observer.disconnect();
      dwellTimers.forEach(tid => clearTimeout(tid));
      document.removeEventListener('click', onClick, { capture: true });
    };
  }, [enabled, pageId, releaseId, tracking]);
}
