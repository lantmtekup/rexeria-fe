'use client';

import { gaEvent } from '@/lib/analytics/ga';

/**
 * Đo "tính năng nào trong Portal được dùng nhiều".
 *
 * Mức MÀN HÌNH đã có sẵn, không cần gì thêm: mỗi lần đổi route là một
 * `page_view` kèm `page_path` (`/portal-v2/campaigns`, `/portal-v2/media`…),
 * nên báo cáo "Pages and screens" của GA4 xếp hạng module được ngay.
 *
 * File này chỉ lo phần GA4 KHÔNG thấy được: hành động nằm trong một màn và
 * không đổi URL — bấm nối nguồn, đồng bộ, thêm domain, dừng thử nghiệm…
 *
 * Vì sao gom tên vào một chỗ: tên event là khoá phân tích, đặt rải rác thì vài
 * tháng sau sẽ có cả `sync_source` lẫn `source_sync` lẫn `syncSource` trong
 * cùng một property, và không báo cáo nào gộp lại được nữa. GA4 cũng không cho
 * đổi tên event đã thu.
 */
export const FEATURE_EVENT = {
  sourceSync: 'source_sync',
  sourceDisconnect: 'source_disconnect',
  sourceConnectComplete: 'source_connect_complete',
  domainAdd: 'domain_add',
  domainVerify: 'domain_verify',
  experimentStop: 'experiment_stop',
  experimentConclude: 'experiment_conclude',
} as const;

export type FeatureEvent = (typeof FEATURE_EVENT)[keyof typeof FEATURE_EVENT];

/**
 * Bắn một event tính năng.
 *
 * Quy ước: CHỈ gọi sau khi hành động THÀNH CÔNG. Đếm cả lần thất bại thì con số
 * không còn trả lời được "tính năng này có được dùng không" — nó lẫn với "tính
 * năng này đang hỏng".
 *
 * `params` nên là nhãn phân loại thô (provider, kênh…), KHÔNG kèm id hay bất cứ
 * thứ gì nhận dạng được người dùng: dữ liệu đã gửi sang GA4 thì không rút lại
 * được, và Google cấm đưa PII vào.
 */
export function trackFeature(
  event: FeatureEvent,
  params?: Record<string, string | number | boolean>
): void {
  gaEvent(event, params);
}
