/**
 * Sources (`/v1/sources*`) — hợp đồng THẬT, đối chiếu với BE
 * `internal/domain/models/source_connection.go` + curl thật 2026-08-27.
 *
 * Hai bề mặt tách bạch (khác bản nháp Phase 1 của FE vốn gộp làm một):
 * - `GET /v1/sources` — CONNECTIONS của brand (kể cả `attention`), field
 *   `last_sync_at` (KHÔNG phải `last_sync`) + `freshness` BE tự suy.
 * - `GET /v1/sources/catalog` — 9 provider kết nối được, coverage theo KEY
 *   stage ("awareness"…), cờ `connected` cho brand hiện tại.
 *
 * Bẫy brand scope: mọi route sources KHÔNG nhận `?brand_id` — platform admin
 * không thuộc brand nào sẽ nhận ERR_VALIDATION_FAILED "sources requires a
 * brand scope" (đã curl xác nhận); FE phải đỡ bằng fallback + banner lỗi.
 */

export type RxSourceStatus = 'connected' | 'attention' | 'off';

export type RxSourceFreshness = 'fresh' | 'stale' | 'never';

/* ── GET /v1/sources ─────────────────────────────────────────────────────── */

export type RxSourceConnection = {
  id: string;
  provider: string;
  status: RxSourceStatus;
  external_account: Record<string, unknown>;
  scopes: string[];
  stats: Record<string, unknown>;
  last_sync_at: string | null;
  freshness: RxSourceFreshness;
  created_at: string;
};

export type RxSourceListResponse = { items: RxSourceConnection[] };

/* ── GET /v1/sources/catalog ─────────────────────────────────────────────── */

export type RxSourceCatalogEntry = {
  provider: string;
  label: string;
  category: string;
  scopes: string[];
  /** Key stage audit ("awareness" | … | "post_purchase"). */
  coverage: string[];
  connected: boolean;
};

export type RxSourceCatalogResponse = { items: RxSourceCatalogEntry[] };

/* ── POST /v1/sources/:provider/connect ──────────────────────────────────── */

/** Shopify bắt buộc kèm shop domain (bước "Store" của wizard). */
export type RxConnectSourceRequest = {
  shop?: string;
};

/**
 * `authorize_url` trỏ về `/v1/sources/:provider/callback` của CHÍNH BE khi
 * provider chưa cấu hình OAuth (stub) — FE giữ demo mode; URL ngoài (Google,
 * myshopify.com…) là handshake thật — mở popup.
 */
export type RxSourceConnectResponse = {
  authorize_url: string;
  state: string;
  expires_at: string;
};

/* ── POST /v1/sources/:id/sync ───────────────────────────────────────────── */

export type RxSourceSyncResponse = {
  connection: RxSourceConnection;
  /** false = provider stub, sync chạy đồng bộ (last_sync_at đã nhích). */
  queued: boolean;
  job_id?: string;
};

/* ── GA4 property picker (sau callback) ──────────────────────────────────── */

export type RxGA4Property = {
  property: string;
  display_name: string;
  account: string;
};

export type RxGA4PropertyListResponse = { items: RxGA4Property[] };

export type RxSelectGA4PropertyRequest = {
  property: string;
  display_name?: string;
};
