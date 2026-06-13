/**
 * Type view-facing cho panel "Phễu & Lead". Đây là shape sau khi
 * `funnel-data.ts` map từ response snake_case của BE
 * (be-spec-analytics-funnel-leads) sang camelCase cho component dùng.
 * Lead trong bảng Sales dùng thẳng type `Lead` của service (không map lại).
 */

import type { AnalyticsRange } from '@/services/rexer/types';

export type DateRange = AnalyticsRange;

/** 6 bậc phễu (FunnelSteps khoá theo các key này). */
export interface FunnelCounts {
  visits: number;
  engaged: number;
  ctaClicks: number;
  leads: number;
  sql: number;
  deals: number;
}

/** Một kênh nguồn traffic (đã gom theo utm_source). */
export interface TrafficSource {
  source: string;
  visits: number;
  leads: number;
}

/** CTR + dwell theo block (từ pages.analytics.blocks). */
export interface BlockCtr {
  block: string;
  views: number;
  clicks: number;
  /** Tổng dwell time của block trong range (giây). */
  dwellSec: number;
}

/** Dữ liệu đã hợp nhất cho 2 view Marketing/Sales của 1 page + range. */
export interface FunnelAnalytics {
  funnel: FunnelCounts;
  sources: TrafficSource[];
  blocks: BlockCtr[];
  /** Visits từng ngày trong range (chart "theo ngày"). */
  visitsByDay: number[];
  /** % thay đổi visits so với kỳ trước liền kề. */
  visitsDeltaPct: number;
  /** Thời gian trung bình mỗi phiên (giây). */
  avgSessionSec: number;
  /** Ngưỡng score qualify SQL (brand override hoặc default 65). */
  sqlThreshold: number;
}

export function tierOf(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 80) return 'hot';
  if (score >= 50) return 'warm';
  return 'cold';
}
