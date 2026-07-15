// ReXeR analytics client — push (anonymous /v1/track) + read (authed page APIs).
// Contract mirrors be-ReXeR.ai/docs/be-analytics-track-integration.md.

import { REXER_PAGE_ID, REXER_TRACKING_KEY } from './analytics-data';

// ── identity ────────────────────────────────────────────────────────────────
function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function sessionId(): string {
  if (typeof window === 'undefined') return '';
  let s = sessionStorage.getItem('rexer_sid');
  if (!s) {
    s = rid();
    sessionStorage.setItem('rexer_sid', s);
  }
  return s;
}

function visitorId(): string {
  if (typeof window === 'undefined') return '';
  let v = localStorage.getItem('rexer_vid');
  if (!v) {
    v = rid();
    localStorage.setItem('rexer_vid', v);
  }
  return v;
}

// ── push ──────────────────────────────────────────────────────────────────
// Event types the BE counts (internal/domain/consts): page_view → summary views,
// block_view → per-block views, block_click → block + summary clicks.
export type TrackEventType =
  | 'page_view'
  | 'block_view'
  | 'block_click'
  | 'click'
  | 'form_submit'
  | 'custom';

export interface TrackOpts {
  sectionId?: string; // BE mirrors dimensions.section_id → block_key
  ctaId?: string;
  eventName?: string;
  dimensions?: Record<string, string | null>;
  metrics?: Record<string, number>;
}

// Fire-and-forget. Never throws — tracking must not break the page.
export function track(eventType: TrackEventType, opts: TrackOpts = {}): void {
  if (typeof window === 'undefined' || !REXER_PAGE_ID) return;

  const url = new URL(window.location.href);
  const dimensions: Record<string, string | null> = {
    page_path: window.location.pathname,
    referrer: document.referrer || null,
    utm_source: url.searchParams.get('utm_source'),
    utm_medium: url.searchParams.get('utm_medium'),
    utm_campaign: url.searchParams.get('utm_campaign'),
    viewport_w: String(window.innerWidth),
    viewport_h: String(window.innerHeight),
    ...opts.dimensions,
  };
  if (opts.sectionId) dimensions.section_id = opts.sectionId;
  if (opts.ctaId) dimensions.cta_id = opts.ctaId;

  const session = sessionId();
  const body: Record<string, unknown> = {
    page_id: REXER_PAGE_ID,
    event_type: eventType,
    event_name: opts.eventName,
    session_id: session,
    visitor_id: visitorId(),
    occurred_at: new Date().toISOString(),
    dimensions,
    metrics: opts.metrics,
    event_idempotency_key: [
      'p',
      REXER_PAGE_ID,
      session,
      eventType,
      opts.sectionId || opts.ctaId || '',
      Math.floor(Date.now() / 1000),
    ].join(':'),
  };
  // Publishable key also in body — fallback path for sendBeacon (no headers).
  if (REXER_TRACKING_KEY) body.key = REXER_TRACKING_KEY;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (REXER_TRACKING_KEY) headers['X-ReXeR-Key'] = REXER_TRACKING_KEY;

  try {
    // Routed through our same-origin /api/track proxy: the ReXeR key only
    // whitelists the prod domain as an Origin, and the browser can't forge the
    // Origin header — so the server forwards with the allowed Origin. Works
    // identically on localhost dev and the deployed domain.
    fetch(`/api/track`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      keepalive: true, // still delivers on page unload
    }).catch(() => {});
  } catch {
    /* noop */
  }
}

// ── read (needs ReXeR cookie session; scoped by brand) ──────────────────────
export interface PageSummary {
  page_views: number;
  unique_visitors: number;
  clicks: number;
  conversions: number;
  from: string;
  to: string;
}

export interface BlockRow {
  block_key: string;
  block_type?: string;
  views: number;
  clicks: number;
  avg_scroll_depth: number;
  // Avg time-on-block in ms. Optional: only present once the BE adds it to the
  // page-blocks endpoint (spec: be-spec-block-dwell-in-page-blocks-2026-06-05).
  avg_dwell_ms?: number;
  views_by_day: number[];
}

// Read goes through our same-origin Next proxy (/api/rexer/*) which forwards
// the ReXeR session cookie server→server — the authed endpoints have no CORS,
// so a direct browser call to :8080 is blocked.
async function readJSON<T>(path: string): Promise<T | null> {
  if (!REXER_PAGE_ID) return null;
  try {
    const res = await fetch(`/api/rexer${path}`, { credentials: 'include' });
    if (!res.ok) return null; // 401/403/404 → caller falls back to mock
    return (await res.json()) as T;
  } catch {
    return null; // network failure → mock
  }
}

export function fetchSummary(range: string): Promise<PageSummary | null> {
  return readJSON<PageSummary>(
    `/pages/${REXER_PAGE_ID}/analytics/summary?range=${range}`
  );
}

export async function fetchBlocks(range: string): Promise<BlockRow[] | null> {
  const res = await readJSON<{ items: BlockRow[] }>(
    `/pages/${REXER_PAGE_ID}/analytics/blocks?range=${range}`
  );
  return res ? res.items : null;
}

// Per-CTA click breakdown (group by dimensions.cta_id). Our clicks are pushed as
// event_type `block_click` with the element's data-cta-id mirrored to
// dimensions.cta_id, so we group those. Returns a { cta_id → click count } map.
interface BreakdownRow {
  key: string;
  metrics: { count: number; unique_session?: number };
}

export async function fetchCtaBreakdown(
  range: string
): Promise<Record<string, number> | null> {
  const res = await readJSON<{ items: BreakdownRow[] }>(
    `/pages/${REXER_PAGE_ID}/analytics/breakdown?group_by=dimensions.cta_id&event_type=block_click&range=${range}`
  );
  if (!res) return null;
  const map: Record<string, number> = {};
  res.items.forEach(r => (map[r.key] = r.metrics?.count ?? 0));
  return map;
}
