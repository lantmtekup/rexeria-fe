/**
 * Fire-and-forget visitor analytics tracker for the public landing route
 * `/p/[id]/[token]`. Events are batched (max 10) and flushed every 5s of
 * inactivity, on `beforeunload` (via `sendBeacon`), or when the queue
 * fills up. POSTs to `/api/rexer/analytics/events` — the public ingest
 * endpoint per BE spec.
 *
 * Identity:
 * - `visitor_id` persists across sessions in localStorage so dedupe of
 *   "unique visitors" works on the BE side.
 * - `session_id` rotates after 30 min of idle so per-session aggregations
 *   (dwell, scroll depth) reset between visits.
 *
 * The tracker is a module-level singleton — only the visible public render
 * mounts it. Calling `init()` again with the same `pageId` is a no-op;
 * passing a different one resets the session bucket.
 *
 * `pageId` = canonical page UUID (be-fe-handoff Q5 2026-06-03 — the ingest
 * only accepts `page_id`; the legacy `template_id` schema was retired and
 * such events are silently dropped).
 */

import type { AnalyticsEventInput } from '@/services/rexer/types';

const VISITOR_KEY = 'rexer.tracker.visitor_id';
const SESSION_KEY = 'rexer.tracker.session_id';
const SESSION_LAST_SEEN_KEY = 'rexer.tracker.session_last_seen';
const SESSION_IDLE_MS = 30 * 60 * 1000; // 30 min
const BATCH_LIMIT = 10;
const FLUSH_DEBOUNCE_MS = 5_000;
const INGEST_URL = '/api/rexer/analytics/events';
/** Retry ingest khi 5xx/lỗi mạng — xem chú thích ở `send()`. */
const RETRY_LIMIT = 2;
const RETRY_DELAY_MS = 4_000;

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Cheap fallback — collisions extremely unlikely at our visitor scale.
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

function readOrCreateVisitor(): string {
  if (typeof window === 'undefined') return uuid();
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const fresh = uuid();
    window.localStorage.setItem(VISITOR_KEY, fresh);
    return fresh;
  } catch {
    return uuid();
  }
}

function readOrCreateSession(): string {
  if (typeof window === 'undefined') return uuid();
  try {
    const last = Number(
      window.sessionStorage.getItem(SESSION_LAST_SEEN_KEY) ?? 0
    );
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing && Date.now() - last < SESSION_IDLE_MS) {
      window.sessionStorage.setItem(SESSION_LAST_SEEN_KEY, String(Date.now()));
      return existing;
    }
    const fresh = uuid();
    window.sessionStorage.setItem(SESSION_KEY, fresh);
    window.sessionStorage.setItem(SESSION_LAST_SEEN_KEY, String(Date.now()));
    return fresh;
  } catch {
    return uuid();
  }
}

function utmFromUrl(): Pick<
  AnalyticsEventInput,
  'utm_source' | 'utm_medium' | 'utm_campaign'
> {
  if (typeof window === 'undefined') return {};
  const sp = new URLSearchParams(window.location.search);
  return {
    utm_source: sp.get('utm_source') ?? undefined,
    utm_medium: sp.get('utm_medium') ?? undefined,
    utm_campaign: sp.get('utm_campaign') ?? undefined,
  };
}

class Tracker {
  private pageId = '';
  private visitorId = '';
  private sessionId = '';
  private queue: AnalyticsEventInput[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private unloadHandler: (() => void) | null = null;
  private initialized = false;

  init(pageId: string): void {
    if (this.initialized && this.pageId === pageId) return;
    // Different page on same SPA navigation — flush leftovers first.
    if (this.initialized && this.pageId !== pageId) {
      this.flush();
    }
    this.pageId = pageId;
    this.visitorId = readOrCreateVisitor();
    this.sessionId = readOrCreateSession();
    this.initialized = true;

    if (this.unloadHandler === null && typeof window !== 'undefined') {
      this.unloadHandler = () => this.flush(true);
      window.addEventListener('pagehide', this.unloadHandler);
      window.addEventListener('beforeunload', this.unloadHandler);
    }
  }

  /** Refresh the session activity timestamp on each emit. */
  private touchSession(): void {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(SESSION_LAST_SEEN_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  }

  emit(partial: Partial<AnalyticsEventInput> & { event_type: string }): void {
    if (!this.initialized || typeof window === 'undefined') return;
    this.touchSession();
    const event: AnalyticsEventInput = {
      page_id: this.pageId,
      visitor_id: this.visitorId,
      session_id: this.sessionId,
      viewport_w: window.innerWidth,
      viewport_h: window.innerHeight,
      referrer: document.referrer || undefined,
      ...utmFromUrl(),
      ...partial,
    };
    this.queue.push(event);
    if (this.queue.length >= BATCH_LIMIT) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => this.flush(), FLUSH_DEBOUNCE_MS);
  }

  /**
   * Send the queue to BE. Set `useBeacon` true on `beforeunload`/`pagehide`
   * — fetch() during unload is cancelled by the browser, but `sendBeacon`
   * survives.
   */
  flush(useBeacon = false): void {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, this.queue.length);
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const payload = JSON.stringify(batch.length === 1 ? batch[0] : batch);
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(INGEST_URL, blob);
      return;
    }
    this.send(batch, 0);
  }

  /**
   * POST một batch, retry khi hạ tầng nuốt request. Đo thật 2026-09-01:
   * proxy Worker thi thoảng 503 thoáng qua ngay sau deploy (cold start) —
   * fire-and-forget thuần là mất vĩnh viễn batch đó, analytics đếm thiếu.
   * Retry CHỈ với 5xx/lỗi mạng (4xx là payload/ rate limit — gửi lại vô ích),
   * tối đa RETRY_LIMIT lần, giãn RETRY_DELAY_MS mỗi lần.
   */
  private send(batch: AnalyticsEventInput[], attempt: number): void {
    const payload = JSON.stringify(batch.length === 1 ? batch[0] : batch);
    const retry = () => {
      if (attempt >= RETRY_LIMIT) return;
      setTimeout(
        () => this.send(batch, attempt + 1),
        RETRY_DELAY_MS * (attempt + 1)
      );
    };
    fetch(INGEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      // Fire-and-forget — don't await, don't block render.
      keepalive: true,
      credentials: 'omit',
    })
      .then(res => {
        if (res.status >= 500) retry();
      })
      .catch(retry);
  }

  /** Test/debug — wipes queue + timer but keeps identity. */
  reset(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this.queue = [];
  }

  get visitor(): string {
    return this.visitorId;
  }

  get session(): string {
    return this.sessionId;
  }
}

export const tracker = new Tracker();
