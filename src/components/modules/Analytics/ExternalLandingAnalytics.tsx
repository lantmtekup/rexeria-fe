'use client';

/**
 * Analytics cho landing NGOÀI (loại "extension" — vd mintcoin.vercel.app).
 *
 * Landing ngoài không render qua canvas block của ReXeR nên `BlockAnalyticsGrid`
 * vô nghĩa. Thay vào đó site ngoài nhúng snippet tracking-key (`pk_live_…`) bắn
 * event `page_view` / `cta_click` kèm `dimensions.section_id` / `cta_id` về
 * `POST /v1/track`. Event lưu trong `analytics_events` theo `page_id`, brand đọc
 * lại qua các endpoint canonical (`/pages/:id/analytics/*`, priv — brand-scoped):
 *
 *   - summary    → page_views / unique_visitors / clicks / conversions + trend
 *   - sources    → visits theo utm_source
 *   - breakdown  → group_by dimensions.section_id | dimensions.cta_id
 *
 * Mọi call best-effort: lỗi/empty → render full layout với số 0 (không màn lỗi),
 * đồng nhất với BlockAnalyticsGrid.
 */

import {
  ArrowLeft,
  ExternalLink,
  Eye,
  MousePointerClick,
  Send,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import type {
  AnalyticsRange,
  AnalyticsSourceRow,
  PageAnalyticsBreakdownRow,
  PageAnalyticsSummary,
  TrackingKey,
} from '@/services/rexer/types';

import { AreaChart, Card, MetricTile } from './dashboard-bits';
import { buildExternalDemo } from './external-demo';

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '90d', label: '90 ngày' },
];

const fmt = (n: number) => n.toLocaleString('vi-VN');

interface Props {
  pageId: string;
  externalUrl?: string | null;
  pageName?: string;
  backHref?: string;
}

export function ExternalLandingAnalytics({
  pageId,
  externalUrl,
  pageName,
  backHref = '/portal/landing-pages',
}: Props) {
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PageAnalyticsSummary | null>(null);
  const [trendSeries, setTrendSeries] = useState<number[]>([]);
  const [sources, setSources] = useState<AnalyticsSourceRow[]>([]);
  const [sections, setSections] = useState<PageAnalyticsBreakdownRow[]>([]);
  const [ctas, setCtas] = useState<PageAnalyticsBreakdownRow[]>([]);
  const [trackingKey, setTrackingKey] = useState<TrackingKey | null>(null);
  // null = auto (demo khi chưa có traffic thật); true/false = người dùng ép.
  const [demoOverride, setDemoOverride] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      // Mỗi nguồn độc lập — fail nguồn nào thì nguồn đó về rỗng, phần còn lại
      // vẫn hiển thị. Không để 1 endpoint lỗi che cả trang.
      const [sum, evtDays, src, sec, cta, keys] = await Promise.all([
        rexerApi.pages.analytics.summary(pageId, { range }).catch(() => null),
        // Trend lấy từ `breakdown(group_by='event_type')` → hàng `page_view`
        // có `views_by_day`. KHÔNG dùng `/analytics/timeseries` (query-param,
        // chưa deploy/lỗi trên prod) cũng KHÔNG dùng `summary.trend` (lấy từ
        // analytics_daily_aggregate stub). breakdown là path-param, chạy trên
        // build prod hiện tại (section breakdown đang hiện số).
        rexerApi.pages.analytics
          .breakdown(pageId, { group_by: 'event_type', range })
          .then(r => r.items ?? [])
          .catch(() => []),
        rexerApi.pages.analytics
          .sources(pageId, { range })
          .then(r => r.items ?? [])
          .catch(() => []),
        rexerApi.pages.analytics
          .breakdown(pageId, { group_by: 'dimensions.section_id', range })
          .then(r => r.items ?? [])
          .catch(() => []),
        // Không lọc event_type: gom theo cta_id mọi event mang cta_id — bắt
        // được cả `cta_click` (mintcoin thật) lẫn `click` (seed/funnel). Key
        // rỗng (event không có cta_id) lọc bỏ ở dưới.
        rexerApi.pages.analytics
          .breakdown(pageId, { group_by: 'dimensions.cta_id', range })
          .then(r => (r.items ?? []).filter(it => it.key))
          .catch(() => []),
        rexerApi.trackingKeys
          .list({ limit: 50 })
          .then(r => r.items ?? [])
          .catch(() => []),
      ]);
      if (cancelled) return;
      setSummary(sum);
      // Trend = views_by_day của event_type 'page_view'.
      const pv = evtDays.find(r => r.key === 'page_view');
      setTrendSeries(pv?.views_by_day ?? []);
      setSources(src);
      setSections(sec);
      setCtas(cta);
      // Key active nhận dữ liệu gần nhất → đại diện trạng thái "đã kết nối".
      const active = keys
        .filter(k => k.status === 'active')
        .sort(
          (a, b) =>
            new Date(b.last_used_at ?? 0).getTime() -
            new Date(a.last_used_at ?? 0).getTime()
        );
      setTrackingKey(active[0] ?? keys[0] ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [pageId, range]);

  const realViews = summary?.page_views ?? 0;
  const realTrendTotal = trendSeries.reduce((s, v) => s + v, 0);
  // Có lượt xem thật chưa? (mintcoin custom chỉ bắn section/cta nên số này
  // thường = 0 dù section breakdown có data.)
  const hasRealTraffic = realViews > 0 || realTrendTotal > 0;
  const demo = demoOverride ?? !hasRealTraffic;

  const demoData = useMemo(
    () => buildExternalDemo(pageId, new Date()),
    [pageId]
  );

  // View model: demo → bộ tất định; thật → từ endpoint.
  const views = demo ? demoData.pageViews : realViews;
  const visitors = demo
    ? demoData.uniqueVisitors
    : (summary?.unique_visitors ?? 0);
  const clicks = demo ? demoData.clicks : (summary?.clicks ?? 0);
  const conversions = demo ? demoData.conversions : (summary?.conversions ?? 0);
  const ctr = views > 0 ? (clicks / views) * 100 : 0;

  // Trend + sources có thể thiếu riêng dù trang đã có traffic thật (endpoint
  // chưa deploy / direct bị ẩn). Fallback demo theo TỪNG card + gắn tag để
  // không nhầm với số thật.
  const demoTrend = demoData.trend.map(t => t.value);
  const trendIsDemo = demo || trendSeries.length === 0;
  const trendValues = demo
    ? demoTrend
    : trendSeries.length > 0
      ? trendSeries
      : demoTrend;

  const realSources = sources.map(s => ({
    label: s.utm_source || 'direct',
    value: s.visits,
  }));
  const sourcesIsDemo = demo || realSources.length === 0;
  const sourceRows = demo
    ? demoData.sources
    : realSources.length > 0
      ? realSources
      : demoData.sources;

  const sectionRows = demo
    ? demoData.sections
    : sections.map(s => ({ label: s.key || '—', value: s.metrics.count ?? 0 }));
  const ctaRows = demo
    ? demoData.ctas
    : ctas.map(c => ({ label: c.key || '—', value: c.metrics.count ?? 0 }));

  return (
    <div className='mx-auto w-full max-w-6xl px-4 pt-4 pb-16 sm:px-6'>
      {/* Header */}
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <Link
            href={backHref}
            className='text-content-muted hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium'
          >
            <ArrowLeft className='size-3.5' /> Landing pages
          </Link>
          <h1 className='mt-1 text-xl font-bold tracking-tight'>
            {pageName ?? 'Landing ngoài'}
          </h1>
          {externalUrl && (
            <a
              href={externalUrl}
              target='_blank'
              rel='noreferrer'
              className='text-primary mt-0.5 inline-flex items-center gap-1 text-xs font-medium hover:underline'
            >
              <ExternalLink className='size-3' />
              {externalUrl.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <DemoToggle
            demo={demo}
            onToggle={() => setDemoOverride(!demo)}
            disabled={hasRealTraffic ? false : true}
          />
          <div className='border-border bg-muted inline-flex rounded-lg border p-0.5'>
            {RANGES.map(r => (
              <button
                key={r.value}
                type='button'
                onClick={() => setRange(r.value)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  range === r.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-content-muted hover:text-foreground'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {demo ? (
        <DemoBanner hasRealTraffic={hasRealTraffic} pageId={pageId} />
      ) : (
        <ConnectionBanner
          trackingKey={trackingKey}
          hasData={views > 0}
          pageId={pageId}
        />
      )}

      {/* KPI tiles */}
      <div className='mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <MetricTile icon={Eye} label='Lượt xem' value={fmt(views)} />
        <MetricTile icon={Users} label='Khách (unique)' value={fmt(visitors)} />
        <MetricTile
          icon={MousePointerClick}
          label='Click CTA'
          value={fmt(clicks)}
          hint={`CTR ${ctr.toFixed(1)}%`}
        />
        <MetricTile icon={Send} label='Chuyển đổi' value={fmt(conversions)} />
      </div>

      {/* Trend */}
      <div className='mt-3'>
        <Card title='Lượt xem theo ngày' tag={trendIsDemo ? 'demo' : range}>
          {trendValues.length > 0 ? (
            <AreaChart series={trendValues} />
          ) : (
            <EmptyHint
              loading={loading}
              text='Chưa có lượt xem nào trong khoảng này.'
            />
          )}
        </Card>
      </div>

      {/* Sources + breakdown */}
      <div className='mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <Card
          title='Nguồn truy cập'
          tag={sourcesIsDemo ? 'demo' : 'utm_source'}
        >
          <BreakdownList
            loading={loading}
            rows={sourceRows}
            emptyText='Chưa có dữ liệu nguồn (traffic direct bị BE ẩn).'
          />
        </Card>
        <Card title='Theo section' tag='section_id'>
          <BreakdownList
            loading={loading}
            rows={sectionRows}
            emptyText='Site ngoài chưa gắn data-section / chưa có view.'
          />
        </Card>
      </div>

      {ctaRows.length > 0 && (
        <div className='mt-3'>
          <Card title='Click theo CTA' tag='cta_id'>
            <BreakdownList
              loading={loading}
              rows={ctaRows}
              emptyText='Chưa có click CTA.'
            />
          </Card>
        </div>
      )}
    </div>
  );
}

/* ── bits ──────────────────────────────────────────────────────────────── */

function DemoToggle({
  demo,
  onToggle,
  disabled,
}: {
  demo: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type='button'
      onClick={onToggle}
      disabled={disabled}
      title={
        disabled
          ? 'Chưa có lượt xem thật — đang hiển thị dữ liệu demo'
          : demo
            ? 'Đang xem demo — bấm để xem dữ liệu thật'
            : 'Bấm để xem dữ liệu demo'
      }
      className={cn(
        'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
        demo
          ? 'border-violet-300 bg-violet-100 text-violet-700'
          : 'border-border text-content-muted hover:bg-muted bg-white',
        disabled && 'cursor-not-allowed opacity-70'
      )}
    >
      {demo ? 'Dữ liệu demo' : 'Dữ liệu thật'}
    </button>
  );
}

function DemoBanner({
  hasRealTraffic,
  pageId,
}: {
  hasRealTraffic: boolean;
  pageId: string;
}) {
  return (
    <div className='mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-xs text-violet-800'>
      <span className='text-2xs rounded bg-violet-200 px-1.5 py-0.5 font-mono font-bold tracking-wider uppercase'>
        Dữ liệu demo
      </span>
      {hasRealTraffic ? (
        <span>
          Đang xem số minh hoạ 7 ngày. Bấm “Dữ liệu thật” để xem số thực tế.
        </span>
      ) : (
        <span>
          Landing chưa có lượt xem thật (site ngoài chưa bắn{' '}
          <code className='rounded bg-violet-100 px-1 font-mono'>
            page_view
          </code>{' '}
          với{' '}
          <code className='rounded bg-violet-100 px-1 font-mono'>
            page_id={pageId.slice(0, 8)}…
          </code>
          ). Số dưới đây là demo để xem layout.
        </span>
      )}
    </div>
  );
}

function ConnectionBanner({
  trackingKey,
  hasData,
  pageId,
}: {
  trackingKey: TrackingKey | null;
  hasData: boolean;
  pageId: string;
}) {
  const connected = hasData || !!trackingKey?.last_used_at;
  return (
    <div
      className={cn(
        'mt-4 flex flex-wrap items-center gap-2 rounded-xl border px-4 py-2.5 text-xs',
        connected
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-amber-200 bg-amber-50 text-amber-800'
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          connected ? 'animate-pulse bg-emerald-500' : 'bg-amber-500'
        )}
      />
      {connected ? (
        <span>
          Đã kết nối tracking key
          {trackingKey?.key_prefix && (
            <span className='font-mono font-semibold'>
              {' '}
              {trackingKey.key_prefix}…
            </span>
          )}
          {trackingKey?.last_used_at && (
            <>
              {' '}
              · nhận dữ liệu lần cuối{' '}
              <strong>
                {new Date(trackingKey.last_used_at).toLocaleString('vi-VN')}
              </strong>
            </>
          )}
        </span>
      ) : (
        <span>
          Chưa nhận được dữ liệu. Đảm bảo site ngoài gửi event với{' '}
          <code className='rounded bg-amber-100 px-1 font-mono font-semibold'>
            page_id = {pageId}
          </code>{' '}
          (đúng UUID/slug của landing này) qua snippet tracking-key. Sai page_id
          ⇒ BE bỏ event.
        </span>
      )}
    </div>
  );
}

function BreakdownList({
  rows,
  loading,
  emptyText,
}: {
  rows: { label: string; value: number }[];
  loading: boolean;
  emptyText: string;
}) {
  if (rows.length === 0)
    return <EmptyHint loading={loading} text={emptyText} />;
  const max = Math.max(...rows.map(r => r.value), 1);
  return (
    <ul className='flex flex-col gap-2'>
      {rows.map(r => (
        <li key={r.label} className='flex items-center gap-3'>
          <span className='text-foreground w-28 shrink-0 truncate text-xs font-medium'>
            {r.label}
          </span>
          <div className='bg-muted h-2 flex-1 overflow-hidden rounded-full'>
            <div
              className='h-full rounded-full bg-indigo-500'
              style={{ width: `${(r.value / max) * 100}%` }}
            />
          </div>
          <span className='text-content-muted w-12 shrink-0 text-right font-mono text-xs tabular-nums'>
            {fmt(r.value)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function EmptyHint({ loading, text }: { loading: boolean; text: string }) {
  return (
    <p className='text-content-muted py-6 text-center text-xs'>
      {loading ? 'Đang tải…' : text}
    </p>
  );
}
