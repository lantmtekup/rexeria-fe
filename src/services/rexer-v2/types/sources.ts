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

/** Cột feed → nghĩa (retail_feed): tên cột trong feed của partner. */
export type RxFeedMapping = {
  sku: string;
  price: string;
  name: string;
  bullets: string;
};

/**
 * Body connect theo provider (Phase 4 — BE nhánh journey-audit-connectors):
 * - shopify: `shop` (bước Store của wizard)
 * - woocommerce: `site_url` + `consumer_key` + `consumer_secret`
 * - retail_feed: `feed_url` + `schedule?` + `mapping`
 * - amazon: `listing_url`
 * Provider OAuth khác bỏ trống body.
 */
export type RxConnectSourceRequest = {
  shop?: string;
  /** Cách callback trả lời browser: popup (postMessage + tự đóng) hay
   *  redirect (302 về app khi popup bị chặn). BE mặc định popup. */
  mode?: 'popup' | 'redirect';
  site_url?: string;
  consumer_key?: string;
  consumer_secret?: string;
  feed_url?: string;
  schedule?: string;
  mapping?: RxFeedMapping;
  listing_url?: string;
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

/**
 * Provider credential-based (woocommerce/retail_feed/amazon) connect xong
 * NGAY trong một request — không authorize_url, không popup; shape trùng
 * SourceCallbackResponse của BE.
 */
export type RxSourceCredentialConnectResponse = {
  status: 'connected';
  connection: RxSourceConnection;
  sync_job_id?: string;
};

/** Union thật của POST /connect — phân biệt bằng field `authorize_url`. */
export type RxConnectResponse =
  | RxSourceConnectResponse
  | RxSourceCredentialConnectResponse;

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
