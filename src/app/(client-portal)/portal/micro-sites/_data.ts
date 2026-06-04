/**
 * Micro-site = site Rexer code riêng cho khách (a.com, b.com…). Platform chỉ
 * QUẢN LÝ (CRUD danh sách + thông tin chung) và xem ANALYTICS từng site —
 * không phải page-builder.
 *
 * BE chưa ship `/v1/portal/micro-sites` + analytics. Đây là mock + fallback,
 * sẵn sàng wire khi BE có endpoint analytics theo `micro_site_id`
 * (xem docs/be-tasks — Rexer tự track qua script nhúng).
 */

export type MicroSiteStatus = 'live' | 'dev' | 'paused';

export interface MicroSite {
  id: string;
  name: string;
  /** Public URL site khách (Rexer code + host riêng). */
  url: string;
  brand_name?: string;
  status: MicroSiteStatus;
  description?: string;
  thumbnail_url?: string;
  /** Gradient fallback khi chưa có thumbnail. */
  cover_gradient: string;
  views_30d: number;
  /** % thay đổi views vs 30d trước (vd +12, -3). */
  views_trend_pct: number;
  created_at: string;
}

export const STATUS_META: Record<
  MicroSiteStatus,
  { label: string; chip: string; dot: string }
> = {
  live: {
    label: 'Live',
    chip: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  dev: {
    label: 'Đang dev',
    chip: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  paused: {
    label: 'Tạm dừng',
    chip: 'bg-muted text-content-muted',
    dot: 'bg-zinc-400',
  },
};

export const SITE_GRADIENTS = [
  'from-indigo-500 to-violet-600',
  'from-rose-500 to-red-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-sky-500 to-blue-600',
  'from-fuchsia-500 to-pink-600',
];

export const FAKE_MICROSITES: MicroSite[] = [
  {
    id: 'ms_abce',
    name: 'ABCe',
    url: 'https://abce.com',
    brand_name: 'ACME Beverage Group',
    status: 'live',
    description: 'Micro-site thương hiệu ABCe — landing + catalog + booking.',
    cover_gradient: SITE_GRADIENTS[0],
    views_30d: 482_140,
    views_trend_pct: 12,
    created_at: '2026-03-12T00:00:00Z',
  },
  {
    id: 'ms_coca_tet',
    name: 'Coca Tết 2026',
    url: 'https://tet.coca.vn',
    brand_name: 'ACME Beverage Group',
    status: 'live',
    description: 'Campaign Tết — mini-site nhiều trang + lì xì game.',
    cover_gradient: SITE_GRADIENTS[1],
    views_30d: 720_400,
    views_trend_pct: 5,
    created_at: '2026-01-08T00:00:00Z',
  },
  {
    id: 'ms_fanta_summer',
    name: 'Fanta Summer Fest',
    url: 'https://summer.fanta.vn',
    brand_name: 'ACME Beverage Group',
    status: 'paused',
    description: 'Hết mùa hè — tạm dừng, giữ để tái dùng năm sau.',
    cover_gradient: SITE_GRADIENTS[2],
    views_30d: 84_200,
    views_trend_pct: -41,
    created_at: '2025-05-20T00:00:00Z',
  },
  {
    id: 'ms_sport_2026',
    name: 'Sport 2026',
    url: '',
    brand_name: 'ACME Beverage Group',
    status: 'dev',
    description: 'Cross-brand campaign sự kiện thể thao 2026 — đang build.',
    cover_gradient: SITE_GRADIENTS[4],
    views_30d: 0,
    views_trend_pct: 0,
    created_at: '2026-05-30T00:00:00Z',
  },
];

/* ───────── Analytics (mock) ───────── */

export interface MicroSiteAnalytics {
  views_30d: number;
  visitors_30d: number;
  avg_time_s: number;
  bounce_pct: number;
  views_pct: number;
  visitors_pct: number;
  bounce_pct_delta: number;
  /** 30 điểm — lượt xem theo ngày. */
  daily: number[];
  top_pages: { path: string; views: number }[];
  sources: { name: string; pct: number }[];
  devices: { name: string; pct: number }[];
}

/** Seeded từ id để mock ổn định giữa các render (không random). */
function seed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function fakeMicroSiteAnalytics(site: MicroSite): MicroSiteAnalytics {
  const base = Math.max(site.views_30d, 1000);
  const h = seed(site.id);
  const daily = Array.from({ length: 30 }, (_, i) => {
    const wave = Math.sin((i + (h % 7)) / 3) * 0.35 + 1;
    return Math.round((base / 30) * wave * (0.85 + ((h >> i) & 3) * 0.08));
  });
  const visitors = Math.round(base * 0.41);
  return {
    views_30d: site.views_30d,
    visitors_30d: visitors,
    avg_time_s: 90 + (h % 120),
    bounce_pct: 30 + (h % 25),
    views_pct: site.views_trend_pct,
    visitors_pct: Math.round(site.views_trend_pct * 0.7),
    bounce_pct_delta: (h % 7) - 3,
    daily,
    top_pages: [
      { path: '/', views: Math.round(base * 0.46) },
      { path: '/product', views: Math.round(base * 0.29) },
      { path: '/pricing', views: Math.round(base * 0.16) },
      { path: '/about', views: Math.round(base * 0.09) },
    ],
    sources: [
      { name: 'Direct', pct: 45 },
      { name: 'Facebook', pct: 30 },
      { name: 'Google', pct: 18 },
      { name: 'Khác', pct: 7 },
    ],
    devices: [
      { name: 'Mobile', pct: 68 },
      { name: 'Desktop', pct: 28 },
      { name: 'Tablet', pct: 4 },
    ],
  };
}
