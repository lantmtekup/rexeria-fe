/**
 * Dữ liệu DEMO cho view analytics landing ngoài, dùng khi page CHƯA có lượt
 * xem thật (mintcoin custom chỉ bắn section/cta event, không bắn `page_view`
 * nên visits/sources/timeseries = 0). Sinh tất định theo `pageId` để số ổn
 * định qua mỗi lần load — KHÔNG random. Luôn hiển thị kèm nhãn "DỮ LIỆU DEMO"
 * để không nhầm với số thật.
 *
 * Lưu ý: không backdate được qua `/track` (BE group analytics theo
 * `created_at`, không phải `occurred_at`), nên demo 7 ngày chỉ làm được phía
 * FE — đây chính là lý do dùng generator này thay vì seed sự kiện thật.
 */

export interface ExternalDemo {
  pageViews: number;
  uniqueVisitors: number;
  clicks: number;
  conversions: number;
  trend: { date: string; value: number }[];
  sources: { label: string; value: number }[];
  sections: { label: string; value: number }[];
  ctas: { label: string; value: number }[];
}

/** Hash chuỗi → seed số nguyên (FNV-1a, tất định). */
function seedFrom(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** LCG tất định → chuỗi số [0,1). */
function lcg(seed: number) {
  let state = seed || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

/** Nhãn ngày YYYY-MM-DD cho N ngày gần nhất (cũ → mới), mốc theo `today`. */
function lastNDays(n: number, today: Date): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/**
 * Sinh bộ demo 7 ngày. `today` truyền từ component (tránh new Date() ẩn trong
 * util khó test); days mặc định 7.
 */
export function buildExternalDemo(
  pageId: string,
  today: Date,
  days = 7
): ExternalDemo {
  const rand = lcg(seedFrom(pageId));
  const dates = lastNDays(days, today);

  // Trend tăng dần nhẹ + nhiễu → trông tự nhiên.
  const trend = dates.map((date, i) => {
    const base = 40 + i * 14;
    const noise = Math.round((rand() - 0.4) * 30);
    return { date, value: Math.max(8, base + noise) };
  });

  const pageViews = trend.reduce((s, p) => s + p.value, 0);
  const uniqueVisitors = Math.round(pageViews * (0.62 + rand() * 0.1));
  const clicks = Math.round(pageViews * (0.18 + rand() * 0.06));
  const conversions = Math.round(clicks * (0.12 + rand() * 0.05));

  const split = (total: number, parts: number[]) => {
    const sum = parts.reduce((a, b) => a + b, 0);
    return parts.map(p => Math.max(1, Math.round((total * p) / sum)));
  };

  const srcVals = split(uniqueVisitors, [42, 26, 18, 14]);
  const sources = [
    { label: 'google', value: srcVals[0] },
    { label: 'facebook', value: srcVals[1] },
    { label: 'direct', value: srcVals[2] },
    { label: 'zalo', value: srcVals[3] },
  ];

  const secVals = split(pageViews, [30, 22, 16, 14, 10, 8]);
  const sections = [
    { label: 'hero', value: secVals[0] },
    { label: 'emblem', value: secVals[1] },
    { label: 'manifesto', value: secVals[2] },
    { label: 'process', value: secVals[3] },
    { label: 'services', value: secVals[4] },
    { label: 'works', value: secVals[5] },
  ];

  const ctaVals = split(clicks, [48, 32, 20]);
  const ctas = [
    { label: 'buy-now', value: ctaVals[0] },
    { label: 'contact', value: ctaVals[1] },
    { label: 'learn-more', value: ctaVals[2] },
  ];

  return {
    pageViews,
    uniqueVisitors,
    clicks,
    conversions,
    trend,
    sources,
    sections,
    ctas,
  };
}
