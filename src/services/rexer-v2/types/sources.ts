/**
 * Sources (`/v1/sources*`) — hợp đồng Phase 1 cho hub tích hợp của Journey
 * Audit. Mọi kết nối đều read-only; BE đang xây song song đúng shape này.
 */

export type RxSourceStatus = 'connected' | 'attention' | 'available';

export type RxSourceAuth =
  | 'OAuth'
  | 'API key'
  | 'Feed'
  | 'Public listing'
  | 'No credentials'
  | 'Modelled';

/* ── GET /v1/sources · GET /v1/sources/catalog ───────────────────────────── */

/**
 * Một nguồn — cả bản đã kết nối (`/sources`) lẫn bản trong catalog
 * (`/sources/catalog`, `status: 'available'`) cùng shape; các trường chỉ có
 * nghĩa ở một phía thì nullable.
 */
export type RxSource = {
  id: string;
  provider: string;
  name: string;
  icon: string;
  category: string;
  auth: RxSourceAuth;
  status: RxSourceStatus;
  first_party: boolean;
  /** Các stage của hành trình mà nguồn này soi được. */
  stages: string[];
  /** Đã kết nối: nguồn đang quan sát gì. */
  observes: string | null;
  /** Đã kết nối: dòng tóm tắt dữ liệu đã sync. */
  stats: string | null;
  /** Đã kết nối: nhãn lần sync gần nhất ("2h ago" | "live" | "modelled"). */
  last_sync: string | null;
  /** `attention`: mô tả sự cố mất quyền truy cập. */
  issue: string | null;
  /** Catalog: giá trị nguồn mang lại khi kết nối. */
  value: string | null;
  /** Catalog: kết nối xong mở khoá gì trong audit. */
  unlocks: string | null;
};

export type RxSourcesResponse = { items: RxSource[] };

/* ── POST /v1/sources/:provider/connect ──────────────────────────────────── */

export type RxSourceConnectResponse = {
  authorize_url: string;
};

/* ── POST /v1/sources/:id/sync ───────────────────────────────────────────── */

export type RxSourceSyncResponse = {
  id: string;
  status: 'queued' | 'running';
};
