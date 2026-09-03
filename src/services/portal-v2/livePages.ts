/**
 * "Trang đã live" cho tab Analytics của portal-v2.
 *
 * Nguồn (đã soát handler BE, không phải suy từ type FE):
 *   list   → GET /v1/deploy/live            (item đã deploy — có public_url/slug)
 *   per-trang tổng → GET /v1/pages/{slug}/analytics/summary
 *            BE `SummarizePage` → resolvePageForRead → EnsureCanAccessBrand,
 *            nên brand user đọc được trang CỦA MÌNH, cross-brand trả 404.
 *   detail → /pages/{slug}/analytics/blocks · /analytics/sources · /analytics/timeseries
 *
 * Lưu ý shape thật ≠ type FE khai:
 *   - `/analytics/summary` KHÔNG trả `trend`/`avg_scroll_depth` (chỉ page_views,
 *     unique_visitors, clicks, conversions, from, to). Trend lấy từ
 *     `/analytics/timeseries?metric=visits|leads`.
 *   - `measured:false` ⇒ chưa đo, trả null — không vẽ số 0 như thể là kết quả.
 *
 * KHÔNG rơi về mock: nạp hỏng ⇒ trả rỗng + error để UI hiện khung trống.
 */

import { mapLiveRow } from '@/lib/portal-v2/deploy/helpers';
import { rexerApi } from '@/services/rexer/endpoints';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

const SLUG_FROM_PUBLIC = /\/p\/([^/?#]+)/;

const message = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

/** Một trang đã live — danh sách. `measured=false` ⇒ chưa có số đo. */
export type LivePageRow = {
  slug: string;
  title: string;
  campaignName: string;
  /** Link chia sẻ (`<slug>.rexerstudio.com`) — null khi BE chưa resolve slug. */
  shareUrl: string | null;
  measured: boolean;
  pageViews: number | null;
  uniqueVisitors: number | null;
  clicks: number | null;
  conversions: number | null;
};

export type LivePagesResult = {
  rows: LivePageRow[];
  /** Khoảng ngày BE tự chọn cho summary (hiện lên UI thay vì đoán "14 ngày"). */
  range: { from: string; to: string } | null;
  error: string | null;
};

/**
 * Server-side: list trang live + tổng view mỗi trang. N+1 có chủ đích —
 * `/deploy/live` không mang số đo, mỗi trang một `summary` (N thường nhỏ =
 * số item đang live). Chạy song song, trang nào summary hỏng ⇒ measured=false.
 */
export const fetchLivePages = async (): Promise<LivePagesResult> => {
  let live: Awaited<ReturnType<typeof rexerV2Api.deploy.live>>;
  try {
    live = await rexerV2Api.deploy.live();
  } catch (err) {
    return {
      rows: [],
      range: null,
      error: message(err, 'Không tải được danh sách trang live'),
    };
  }

  // Một trang = một slug; item trùng slug (nhiều kênh) chỉ lấy một.
  const seen = new Set<string>();
  const base = (live.items ?? [])
    .map(view => {
      const mapped = mapLiveRow(view);
      const slug = view.public_url?.match(SLUG_FROM_PUBLIC)?.[1] ?? null;
      return { mapped, slug };
    })
    .filter(
      (x): x is { mapped: ReturnType<typeof mapLiveRow>; slug: string } => {
        if (!x.slug || seen.has(x.slug)) return false;
        seen.add(x.slug);
        return true;
      }
    );

  let range: { from: string; to: string } | null = null;

  const rows = await Promise.all(
    base.map(async ({ mapped, slug }): Promise<LivePageRow> => {
      const title = mapped.subjectName || mapped.campaign.name || slug;
      const row: LivePageRow = {
        slug,
        title,
        campaignName: mapped.campaign.name,
        shareUrl: mapped.publicUrl,
        measured: false,
        pageViews: null,
        uniqueVisitors: null,
        clicks: null,
        conversions: null,
      };
      try {
        const s = await rexerApi.pages.analytics.summary(slug);
        row.measured = true;
        row.pageViews = s.page_views;
        row.uniqueVisitors = s.unique_visitors;
        row.clicks = s.clicks;
        row.conversions = s.conversions;
        // BE tự chọn from/to; lấy của trang đầu đo được làm nhãn chung.
        const anyS = s as unknown as { from?: string; to?: string };
        if (!range && anyS.from && anyS.to) {
          range = { from: anyS.from, to: anyS.to };
        }
      } catch {
        /* chưa đo / chưa có event — giữ measured=false, số null */
      }
      return row;
    })
  );

  return { rows, range, error: null };
};

// ── Detail (client-side, gọi khi bấm một trang) ─────────────────────────────

export type LivePageBlock = {
  name: string;
  views: number;
  clicks: number;
  dwellMs: number | null;
};

export type LivePageSource = {
  source: string;
  visits: number;
};

export type LivePageTrendPoint = {
  date: string;
  visits: number;
  leads: number;
};

export type LivePageDetail = {
  slug: string;
  measured: boolean;
  pageViews: number;
  uniqueVisitors: number;
  clicks: number;
  conversions: number;
  blocks: LivePageBlock[];
  sources: LivePageSource[];
  trend: LivePageTrendPoint[];
};

/**
 * Chi tiết một trang. 4 nguồn độc lập ⇒ allSettled: block/source/trend hỏng
 * thì phần đó rỗng chứ không kéo sập cả màn. Summary hỏng ⇒ measured=false.
 */
export const fetchLivePageDetail = async (
  slug: string
): Promise<LivePageDetail> => {
  const [summaryR, blocksR, sourcesR, visitsR, leadsR] =
    await Promise.allSettled([
      rexerApi.pages.analytics.summary(slug),
      rexerApi.pages.analytics.blocks(slug),
      rexerApi.pages.analytics.sources(slug),
      rexerApi.pages.analytics.timeseries(slug, { metric: 'visits' }),
      rexerApi.pages.analytics.timeseries(slug, { metric: 'leads' }),
    ]);

  const summary = summaryR.status === 'fulfilled' ? summaryR.value : null;

  const blocks: LivePageBlock[] =
    blocksR.status === 'fulfilled'
      ? (blocksR.value.items ?? []).map(b => ({
          name: b.label || b.block_key || b.block_id,
          views: b.views,
          clicks: b.clicks,
          dwellMs: b.avg_dwell_ms,
        }))
      : [];

  const sources: LivePageSource[] =
    sourcesR.status === 'fulfilled'
      ? (sourcesR.value.items ?? []).map(s => ({
          source: s.utm_source || 'direct',
          visits: s.visits,
        }))
      : [];

  const visitPoints =
    visitsR.status === 'fulfilled' ? (visitsR.value.points ?? []) : [];
  const leadsByDate = new Map(
    (leadsR.status === 'fulfilled' ? (leadsR.value.points ?? []) : []).map(
      p => [p.date, p.value] as const
    )
  );
  const trend: LivePageTrendPoint[] = visitPoints.map(p => ({
    date: p.date,
    visits: p.value,
    leads: leadsByDate.get(p.date) ?? 0,
  }));

  return {
    slug,
    measured: !!summary,
    pageViews: summary?.page_views ?? 0,
    uniqueVisitors: summary?.unique_visitors ?? 0,
    clicks: summary?.clicks ?? 0,
    conversions: summary?.conversions ?? 0,
    blocks,
    sources,
    trend,
  };
};
