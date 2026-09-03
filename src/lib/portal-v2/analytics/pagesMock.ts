/**
 * Mock P0 cho tab "Trang" của Analytics — danh sách trang đã xuất bản + drill
 * từng trang. Shape bám sát endpoint THẬT để khi ráp API chỉ cần thay nguồn:
 *
 *   list   → GET /admin/analytics/templates/summary  (TemplateAnalyticsSummaryRow[])
 *   detail → GET /pages/{id}/analytics/summary        (PageAnalyticsSummary)
 *            GET /pages/{id}/analytics/blocks          (PageAnalyticsBlocksResponse)
 *            GET /analytics/sources?page_id=…          (AnalyticsSourcesResponse)
 *
 * Số liệu ở đây là minh hoạ (brand Ilia Beauty). Trend/sparkline sinh
 * deterministic từ `seed` để không nhấp nháy giữa các render.
 */

export type PageStatus = 'live' | 'draft';

/** Một dòng danh sách — map từ `TemplateAnalyticsSummaryRow`. */
export type PageAnalyticsListRow = {
  pageId: string;
  title: string;
  slug: string;
  status: PageStatus;
  views: number;
  uniqueVisitors: number;
  clicks: number;
  /** Nhãn tương đối, BE trả `updated_at` → format phía FE. */
  updatedLabel: string;
  /** Tham số sinh trend cho sparkline (mock-only; API trả series thật). */
  drift: number;
  seed: number;
};

export type PageBlockStat = {
  name: string;
  views: number;
  clicks: number;
  /** ms trung bình; hiển thị dạng "9.2s". */
  dwellMs: number;
};

export type PageTrafficSource = {
  source: string;
  visits: number;
};

/** Drill 1 trang — map từ `PageAnalyticsSummary` + blocks + sources. */
export type PageAnalyticsDetail = {
  pageId: string;
  pageViews: number;
  uniqueVisitors: number;
  clicks: number;
  conversions: number;
  avgScrollDepth: number;
  blocks: PageBlockStat[];
  sources: PageTrafficSource[];
};

export type PageAnalyticsListRowWithDetail = PageAnalyticsListRow & {
  detail: PageAnalyticsDetail;
};

const dwell = (s: number): number => Math.round(s * 1000);

export const MOCK_PAGE_ANALYTICS: PageAnalyticsListRowWithDetail[] = [
  {
    pageId: 'p1',
    title: 'Dầu dưỡng tóc nhẹ',
    slug: 'lightweight-hair-oil',
    status: 'live',
    views: 52480,
    uniqueVisitors: 38910,
    clicks: 6120,
    updatedLabel: '2 giờ trước',
    drift: 0.55,
    seed: 1,
    detail: {
      pageId: 'p1',
      pageViews: 52480,
      uniqueVisitors: 38910,
      clicks: 6120,
      conversions: 1904,
      avgScrollDepth: 71,
      blocks: [
        {
          name: 'Emblem — Hero',
          views: 52480,
          clicks: 820,
          dwellMs: dwell(9.2),
        },
        { name: 'Manifesto', views: 44120, clicks: 410, dwellMs: dwell(6.1) },
        {
          name: 'Works — Bóng gương',
          views: 38650,
          clicks: 2980,
          dwellMs: dwell(12.7),
        },
        {
          name: 'Services — 4 lớp dưỡng',
          views: 29870,
          clicks: 1610,
          dwellMs: dwell(8.4),
        },
        {
          name: 'Process — Từ giọt đến tóc',
          views: 21540,
          clicks: 300,
          dwellMs: dwell(5.0),
        },
      ],
      sources: [
        { source: 'Facebook', visits: 22140 },
        { source: 'Trực tiếp', visits: 13820 },
        { source: 'Google', visits: 9760 },
        { source: 'Instagram', visits: 4310 },
        { source: 'TikTok', visits: 2450 },
      ],
    },
  },
  {
    pageId: 'p2',
    title: 'Serum phục hồi đêm',
    slug: 'night-repair-serum',
    status: 'live',
    views: 31240,
    uniqueVisitors: 24870,
    clicks: 4390,
    updatedLabel: '5 giờ trước',
    drift: 0.32,
    seed: 5,
    detail: {
      pageId: 'p2',
      pageViews: 31240,
      uniqueVisitors: 24870,
      clicks: 4390,
      conversions: 1120,
      avgScrollDepth: 66,
      blocks: [
        { name: 'Hero', views: 31240, clicks: 640, dwellMs: dwell(8.1) },
        {
          name: 'Thành phần',
          views: 26010,
          clicks: 1920,
          dwellMs: dwell(11.2),
        },
        {
          name: 'Trước / sau',
          views: 19880,
          clicks: 1310,
          dwellMs: dwell(9.8),
        },
        {
          name: 'CTA đặt hàng',
          views: 12440,
          clicks: 520,
          dwellMs: dwell(4.2),
        },
      ],
      sources: [
        { source: 'Google', visits: 12100 },
        { source: 'Trực tiếp', visits: 8300 },
        { source: 'Facebook', visits: 6210 },
        { source: 'Instagram', visits: 2960 },
        { source: 'Email', visits: 1670 },
      ],
    },
  },
  {
    pageId: 'p3',
    title: 'Bộ sưu tập Xuân',
    slug: 'spring-collection',
    status: 'live',
    views: 18730,
    uniqueVisitors: 15220,
    clicks: 2110,
    updatedLabel: '1 ngày trước',
    drift: -0.12,
    seed: 9,
    detail: {
      pageId: 'p3',
      pageViews: 18730,
      uniqueVisitors: 15220,
      clicks: 2110,
      conversions: 540,
      avgScrollDepth: 58,
      blocks: [
        {
          name: 'Hero lookbook',
          views: 18730,
          clicks: 390,
          dwellMs: dwell(7.4),
        },
        {
          name: 'Grid sản phẩm',
          views: 14990,
          clicks: 1280,
          dwellMs: dwell(10.1),
        },
        {
          name: 'Câu chuyện brand',
          views: 9210,
          clicks: 190,
          dwellMs: dwell(6.6),
        },
        { name: 'CTA', views: 6120, clicks: 250, dwellMs: dwell(3.9) },
      ],
      sources: [
        { source: 'Instagram', visits: 7420 },
        { source: 'Facebook', visits: 5010 },
        { source: 'Trực tiếp', visits: 3320 },
        { source: 'Google', visits: 1980 },
        { source: 'TikTok', visits: 1000 },
      ],
    },
  },
  {
    pageId: 'p4',
    title: 'Kem chống nắng SPF50',
    slug: 'sunscreen-spf50',
    status: 'live',
    views: 14980,
    uniqueVisitors: 12010,
    clicks: 1680,
    updatedLabel: '1 ngày trước',
    drift: 0.18,
    seed: 3,
    detail: {
      pageId: 'p4',
      pageViews: 14980,
      uniqueVisitors: 12010,
      clicks: 1680,
      conversions: 470,
      avgScrollDepth: 63,
      blocks: [
        { name: 'Hero', views: 14980, clicks: 300, dwellMs: dwell(7.0) },
        { name: 'Kết cấu', views: 11220, clicks: 840, dwellMs: dwell(9.3) },
        { name: 'Review', views: 7640, clicks: 410, dwellMs: dwell(8.0) },
        { name: 'CTA', views: 5100, clicks: 130, dwellMs: dwell(3.5) },
      ],
      sources: [
        { source: 'Google', visits: 6120 },
        { source: 'Trực tiếp', visits: 3980 },
        { source: 'Facebook', visits: 2740 },
        { source: 'Instagram', visits: 1420 },
        { source: 'Khác', visits: 720 },
      ],
    },
  },
  {
    pageId: 'p5',
    title: 'Landing ưu đãi 8.3',
    slug: 'promo-83',
    status: 'live',
    views: 12640,
    uniqueVisitors: 10870,
    clicks: 2540,
    updatedLabel: '3 ngày trước',
    drift: -0.4,
    seed: 7,
    detail: {
      pageId: 'p5',
      pageViews: 12640,
      uniqueVisitors: 10870,
      clicks: 2540,
      conversions: 880,
      avgScrollDepth: 74,
      blocks: [
        {
          name: 'Hero khuyến mãi',
          views: 12640,
          clicks: 1120,
          dwellMs: dwell(6.2),
        },
        { name: 'Combo deal', views: 9880, clicks: 980, dwellMs: dwell(8.7) },
        { name: 'Đếm ngược', views: 6410, clicks: 200, dwellMs: dwell(4.1) },
        { name: 'CTA mua ngay', views: 4990, clicks: 240, dwellMs: dwell(2.8) },
      ],
      sources: [
        { source: 'Facebook', visits: 5820 },
        { source: 'Zalo', visits: 2610 },
        { source: 'Trực tiếp', visits: 2140 },
        { source: 'Google', visits: 1200 },
        { source: 'SMS', visits: 870 },
      ],
    },
  },
  {
    pageId: 'p6',
    title: 'Quiz chọn skincare',
    slug: 'skincare-quiz',
    status: 'live',
    views: 6980,
    uniqueVisitors: 6010,
    clicks: 3120,
    updatedLabel: '6 ngày trước',
    drift: 0.6,
    seed: 2,
    detail: {
      pageId: 'p6',
      pageViews: 6980,
      uniqueVisitors: 6010,
      clicks: 3120,
      conversions: 640,
      avgScrollDepth: 81,
      blocks: [
        { name: 'Câu hỏi 1', views: 6980, clicks: 6210, dwellMs: dwell(11.0) },
        { name: 'Câu hỏi 2', views: 5640, clicks: 5010, dwellMs: dwell(9.4) },
        { name: 'Kết quả', views: 4120, clicks: 980, dwellMs: dwell(13.2) },
        { name: 'CTA sản phẩm', views: 3210, clicks: 410, dwellMs: dwell(5.1) },
      ],
      sources: [
        { source: 'Instagram', visits: 3120 },
        { source: 'TikTok', visits: 1840 },
        { source: 'Facebook', visits: 990 },
        { source: 'Trực tiếp', visits: 680 },
        { source: 'Khác', visits: 350 },
      ],
    },
  },
  {
    pageId: 'p7',
    title: 'Về Ilia Beauty',
    slug: 'about',
    status: 'live',
    views: 8410,
    uniqueVisitors: 7120,
    clicks: 640,
    updatedLabel: '6 ngày trước',
    drift: 0.05,
    seed: 11,
    detail: {
      pageId: 'p7',
      pageViews: 8410,
      uniqueVisitors: 7120,
      clicks: 640,
      conversions: 90,
      avgScrollDepth: 52,
      blocks: [
        { name: 'Hero', views: 8410, clicks: 120, dwellMs: dwell(5.9) },
        { name: 'Timeline', views: 5980, clicks: 210, dwellMs: dwell(8.8) },
        { name: 'Đội ngũ', views: 3720, clicks: 180, dwellMs: dwell(6.3) },
        { name: 'Liên hệ', views: 2210, clicks: 130, dwellMs: dwell(4.0) },
      ],
      sources: [
        { source: 'Trực tiếp', visits: 3910 },
        { source: 'Google', visits: 2210 },
        { source: 'Facebook', visits: 1420 },
        { source: 'Instagram', visits: 560 },
        { source: 'Khác', visits: 410 },
      ],
    },
  },
  {
    pageId: 'p8',
    title: 'Routine 5 bước',
    slug: '5-step-routine',
    status: 'live',
    views: 5230,
    uniqueVisitors: 4460,
    clicks: 720,
    updatedLabel: '8 ngày trước',
    drift: -0.08,
    seed: 6,
    detail: {
      pageId: 'p8',
      pageViews: 5230,
      uniqueVisitors: 4460,
      clicks: 720,
      conversions: 150,
      avgScrollDepth: 60,
      blocks: [
        { name: 'Hero', views: 5230, clicks: 90, dwellMs: dwell(6.0) },
        { name: 'Các bước', views: 4110, clicks: 420, dwellMs: dwell(10.5) },
        { name: 'CTA', views: 2340, clicks: 210, dwellMs: dwell(3.7) },
      ],
      sources: [
        { source: 'Google', visits: 2010 },
        { source: 'Trực tiếp', visits: 1520 },
        { source: 'Facebook', visits: 940 },
        { source: 'Email', visits: 480 },
        { source: 'Khác', visits: 280 },
      ],
    },
  },
  {
    pageId: 'p9',
    title: 'Mặt nạ ngủ cấp ẩm',
    slug: 'overnight-mask',
    status: 'live',
    views: 3980,
    uniqueVisitors: 3410,
    clicks: 510,
    updatedLabel: '10 ngày trước',
    drift: 0.1,
    seed: 4,
    detail: {
      pageId: 'p9',
      pageViews: 3980,
      uniqueVisitors: 3410,
      clicks: 510,
      conversions: 120,
      avgScrollDepth: 57,
      blocks: [
        { name: 'Hero', views: 3980, clicks: 80, dwellMs: dwell(6.4) },
        { name: 'Công dụng', views: 3010, clicks: 290, dwellMs: dwell(8.9) },
        { name: 'CTA', views: 1720, clicks: 140, dwellMs: dwell(3.6) },
      ],
      sources: [
        { source: 'Google', visits: 1610 },
        { source: 'Facebook', visits: 980 },
        { source: 'Trực tiếp', visits: 760 },
        { source: 'Instagram', visits: 380 },
        { source: 'Khác', visits: 250 },
      ],
    },
  },
  {
    pageId: 'p10',
    title: 'Nháp landing Hè',
    slug: 'summer-draft',
    status: 'draft',
    views: 0,
    uniqueVisitors: 0,
    clicks: 0,
    updatedLabel: '11 ngày trước',
    drift: 0,
    seed: 0,
    detail: {
      pageId: 'p10',
      pageViews: 0,
      uniqueVisitors: 0,
      clicks: 0,
      conversions: 0,
      avgScrollDepth: 0,
      blocks: [],
      sources: [],
    },
  },
];

/** Trend deterministic cho sparkline/area chart (mock-only). */
export const mockTrend = (
  base: number,
  days: number,
  drift: number,
  seed: number
): number[] => {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < days; i += 1) {
    const wobble =
      Math.sin((i + seed) * 1.3) * 0.12 + Math.cos((i + seed) * 0.7) * 0.06;
    v = Math.max(4, v * (1 + drift / days) * (1 + wobble));
    out.push(Math.round(v));
  }
  return out;
};
