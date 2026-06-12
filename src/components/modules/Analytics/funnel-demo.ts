/**
 * Demo data cho Analytics v2 (phễu Marketing/Sales) — seeded deterministic
 * theo (landing, range) để reload không nhảy số, cùng pattern demo/live của
 * StatsAnnotationOverlay. Tỉ lệ bám ví dụ spec §2: engaged 55% · CTA 20% ·
 * lead 6,5% · SQL 40% lead · close 8% lead. Thay bằng API thật ở GĐ3-wire.
 */

export type DateRange = '7d' | '30d' | '90d';

export interface FunnelCounts {
  visits: number;
  engaged: number;
  ctaClicks: number;
  leads: number;
  sql: number;
  deals: number;
}

export interface TrafficSource {
  source: string;
  visits: number;
  leads: number;
  adSpend: number | null; // null = kênh không trả phí
}

export interface BlockCtr {
  block: string;
  views: number;
  clicks: number;
  /** Tổng dwell time của block trong range (giây) — từ event block_dwell. */
  dwellSec: number;
}

export type LeadStatus = 'new' | 'contacted' | 'negotiating' | 'won' | 'lost';
export type LeadTier = 'hot' | 'warm' | 'cold';
export type LeadMethod = 'form' | 'wallet' | 'whitelist';

export interface DemoLead {
  id: string;
  name: string;
  contact: string;
  method: LeadMethod;
  source: string;
  score: number;
  tier: LeadTier;
  status: LeadStatus;
  dealValue: number | null;
  createdAgoDays: number;
}

export interface DemoAnalytics {
  funnel: FunnelCounts;
  sources: TrafficSource[];
  blocks: BlockCtr[];
  leads: DemoLead[];
  revenue: number;
  /** Visits từng ngày trong range (chart "theo ngày"). */
  visitsByDay: number[];
  /** % thay đổi visits so với kỳ trước (demo: -20..+35). */
  visitsDeltaPct: number;
  /** Tách lead theo 2 biến thể A/B (spec §4 — A/B landing). */
  leadsAB: { a: number; b: number };
  /** Thời gian trung bình user ở lại trang mỗi phiên xem (giây). */
  avgSessionSec: number;
}

export const SQL_THRESHOLD = 65;

export function tierOf(score: number): LeadTier {
  if (score >= 80) return 'hot';
  if (score >= 50) return 'warm';
  return 'cold';
}

/* ── seeded rng (mulberry32 + string hash) ─────────────────────────────── */

function hash(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── generators ────────────────────────────────────────────────────────── */

const SOURCES = ['Paid Ads', 'Organic', 'Social', 'Referral', 'Direct'];
const SOURCE_BASE: Record<string, number> = {
  Referral: 30,
  Organic: 25,
  Social: 20,
  'Paid Ads': 15,
  Direct: 10,
};
const FIRST = ['Minh', 'Lan', 'Hùng', 'Thảo', 'Quân', 'Vy', 'Đạt', 'Ngọc'];
const LAST = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Võ', 'Đặng'];
const BLOCKS = [
  'Hero',
  'Tokenomics',
  'Roadmap',
  'Whitelist CTA',
  'FAQ',
  'Footer CTA',
];
const RANGE_SCALE: Record<DateRange, number> = {
  '7d': 1,
  '30d': 3.6,
  '90d': 9,
};

function makeLead(rnd: () => number, i: number): DemoLead {
  const source = SOURCES[Math.floor(rnd() * SOURCES.length)];
  const method: LeadMethod =
    rnd() < 0.55 ? 'form' : rnd() < 0.5 ? 'wallet' : 'whitelist';
  let score = SOURCE_BASE[source];
  if (method !== 'form') score += 25; // connect ví / whitelist
  if (rnd() < 0.6) score += 15; // click CTA
  if (rnd() < 0.3) score += 15; // returning ≥ 2
  if (rnd() < 0.4) score += 10; // xem Tokenomics
  if (rnd() < 0.5) score += 10; // scroll ≥ 75%
  score = Math.min(100, score);

  const r = rnd();
  const status: LeadStatus =
    r < 0.42
      ? 'new'
      : r < 0.68
        ? 'contacted'
        : r < 0.84
          ? 'negotiating'
          : r < 0.92
            ? 'won'
            : 'lost';
  const name = `${LAST[Math.floor(rnd() * LAST.length)]} ${FIRST[Math.floor(rnd() * FIRST.length)]}`;
  return {
    id: `ld_${i}`,
    name,
    contact:
      method === 'form'
        ? `${name.split(' ').pop()?.toLowerCase()}${i}@gmail.com`
        : `0x${hash(`${i}w`).toString(16).slice(0, 8)}…`,
    method,
    source,
    score,
    tier: tierOf(score),
    status,
    dealValue: status === 'won' ? Math.round(200 + rnd() * 1800) : null,
    createdAgoDays: Math.floor(rnd() * 14),
  };
}

export function buildDemoAnalytics(
  landingId: string,
  range: DateRange
): DemoAnalytics {
  const rnd = mulberry32(hash(`${landingId}:${range}`));
  const scale = RANGE_SCALE[range];
  const visits = Math.round((5200 + rnd() * 3000) * scale);
  const engaged = Math.round(visits * (0.5 + rnd() * 0.1));
  const ctaClicks = Math.round(visits * (0.17 + rnd() * 0.06));
  const leadCount = Math.round(visits * (0.055 + rnd() * 0.02));

  // Bảng lead chỉ render tối đa 40 dòng demo; counts giữ số phễu đầy đủ.
  const leads = Array.from({ length: Math.min(40, leadCount) }, (_, i) =>
    makeLead(rnd, i)
  );
  const sql = Math.round(leadCount * 0.4);
  const deals = Math.round(leadCount * 0.08);
  const revenue = Math.round(deals * (700 + rnd() * 500));

  let rest = visits;
  const sources = SOURCES.map((source, i) => {
    const share =
      i === SOURCES.length - 1
        ? rest
        : Math.round(visits * (0.1 + rnd() * 0.2));
    rest -= share;
    return {
      source,
      visits: Math.max(share, 0),
      leads: Math.round(leadCount * (0.1 + rnd() * 0.2)),
      adSpend: source === 'Paid Ads' ? Math.round(1200 * scale) : null,
    };
  });

  const blocks = BLOCKS.map(block => {
    const views = Math.round(visits * (0.3 + rnd() * 0.6));
    const avgDwell = 4 + rnd() * 26; // TB 4–30s/lượt xem tuỳ block
    return {
      block,
      views,
      clicks: Math.round(views * (0.02 + rnd() * 0.12)),
      dwellSec: Math.round(views * avgDwell),
    };
  });

  // Random-walk quanh mức trung bình ngày, chuẩn hoá để tổng ≈ visits.
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const walk: number[] = [];
  let level = 0.7 + rnd() * 0.6;
  for (let d = 0; d < days; d++) {
    level = Math.max(0.25, Math.min(1.8, level + (rnd() - 0.48) * 0.35));
    walk.push(level);
  }
  const walkSum = walk.reduce((s, v) => s + v, 0);
  const visitsByDay = walk.map(v => Math.round((v / walkSum) * visits));

  const aShare = 0.6 + rnd() * 0.15;
  return {
    funnel: { visits, engaged, ctaClicks, leads: leadCount, sql, deals },
    sources,
    blocks,
    leads,
    revenue,
    visitsByDay,
    visitsDeltaPct: Math.round(-20 + rnd() * 55),
    leadsAB: {
      a: Math.round(leadCount * aShare),
      b: leadCount - Math.round(leadCount * aShare),
    },
    // Khớp thô với dwell theo block: tổng dwell / visits, kẹp 35s–4m.
    avgSessionSec: Math.min(
      240,
      Math.max(35, blocks.reduce((s, b) => s + b.dwellSec, 0) / visits)
    ),
  };
}
