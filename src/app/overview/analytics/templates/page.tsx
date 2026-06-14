'use client';

import {
  ChevronRight,
  Eye,
  LayoutGrid,
  LineChart,
  Users,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import {
  ACTION_TAXONOMY,
  FAKE_SUMMARY,
  applyPreset,
  type RangePreset,
  type TemplateAnalyticsRow,
} from './_fake-data';
import { loadSummary } from './_remote';
import {
  BlockTypeChip,
  CtrBadge,
  FakeBadge,
  FakeBanner,
  PageHeader,
  PresetBar,
  Skeleton,
  StatCard,
  fmtFull,
} from './_shared';

export default function TemplateAnalyticsListPage() {
  const [preset, setPreset] = useState<RangePreset>('30d');
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [summary, setSummary] = useState<TemplateAnalyticsRow[]>(() =>
    applyPreset(FAKE_SUMMARY, '30d')
  );
  const [source, setSource] = useState<'live' | 'fake'>('fake');

  const totals = useMemo(
    () =>
      summary.reduce(
        (acc, r) => ({
          views: acc.views + r.views,
          visitors: acc.visitors + r.unique_visitors,
          clicks: acc.clicks + r.total_clicks,
          templates: acc.templates + 1,
        }),
        { views: 0, visitors: 0, clicks: 0, templates: 0 }
      ),
    [summary]
  );

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    loadSummary(preset, applyPreset(FAKE_SUMMARY, preset)).then(res => {
      if (cancelled) return;
      setSummary(res.data);
      setSource(res.source);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [preset, refreshKey]);

  return (
    <div className='bg-background text-foreground min-h-screen antialiased'>
      <PageHeader
        back='/overview'
        title='Rexer AI — Landing page Analytics'
        rightBadge={
          source === 'live' ? (
            <span className='text-3xs inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 font-bold tracking-wider text-emerald-700 uppercase'>
              <span className='size-1.5 animate-pulse rounded-full bg-emerald-500' />
              LIVE BE
            </span>
          ) : (
            <FakeBadge />
          )
        }
      />

      <main className='mx-auto w-full max-w-6xl px-5 py-8 lg:px-10'>
        <section className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <div className='flex items-center gap-2'>
              <div className='flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-sm'>
                <LineChart className='size-5' />
              </div>
              <div>
                <h1 className='text-2xl font-bold tracking-tight'>
                  Template Analytics
                </h1>
                <p className='text-content-muted text-xs'>
                  Tất cả canvas template published. Click vào template để xem
                  chi tiết block + actions.
                </p>
              </div>
            </div>
          </div>
          <PresetBar
            preset={preset}
            onPresetChange={setPreset}
            onRefresh={() => setRefreshKey(k => k + 1)}
          />
        </section>

        {source === 'fake' && <FakeBanner />}

        <div className='mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4'>
          <StatCard
            icon={LayoutGrid}
            label='Landing pages'
            value={totals.templates}
            accent='indigo'
          />
          <StatCard
            icon={Eye}
            label='Tổng views'
            value={totals.views}
            accent='blue'
          />
          <StatCard
            icon={Users}
            label='Visitors duy nhất'
            value={totals.visitors}
            accent='emerald'
          />
          <StatCard
            icon={Zap}
            label='Tổng clicks'
            value={totals.clicks}
            accent='amber'
          />
        </div>

        <div className='border-border mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm'>
          <div className='border-border flex items-center justify-between border-b px-5 py-3'>
            <h2 className='text-sm font-semibold'>
              Performance theo Landing page
            </h2>
            <span className='text-2xs text-content-muted'>
              Click vào dòng để mở trang chi tiết
            </span>
          </div>
          <SummaryTable rows={summary} loading={loading} preset={preset} />
        </div>

        <ApiContractSection />
      </main>
    </div>
  );
}

/* ---------- Summary table ---------- */

function SummaryTable({
  rows,
  loading,
  preset,
}: {
  rows: TemplateAnalyticsRow[];
  loading: boolean;
  preset: RangePreset;
}) {
  const router = useRouter();
  if (loading && rows.length === 0) return <Skeleton rows={5} cols={5} />;
  if (!rows.length) {
    return (
      <div className='text-content-muted px-5 py-10 text-center text-sm'>
        Chưa có dữ liệu trong khoảng này.
      </div>
    );
  }
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead className='border-border bg-muted border-b'>
          <tr className='text-3xs text-content-muted text-left font-semibold tracking-wider uppercase'>
            <th className='px-5 py-2.5'>Landing page</th>
            <th className='px-3 py-2.5 text-right'>Views</th>
            <th className='px-3 py-2.5 text-right'>Visitors</th>
            <th className='px-3 py-2.5 text-right'>Blocks viewed</th>
            <th className='px-3 py-2.5 text-right'>Clicks</th>
            <th className='px-3 py-2.5 text-right'>CTR</th>
            <th className='w-8 px-3 py-2.5' />
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr
              key={r.template_id}
              onClick={() =>
                router.push(
                  `/overview/analytics/templates/${r.template_id}?range=${preset}`
                )
              }
              className='group border-border hover:bg-muted cursor-pointer border-t transition-colors'
            >
              <td className='px-5 py-2.5'>
                <div className='flex items-center gap-2'>
                  <span className='size-1.5 rounded-full bg-zinc-300 group-hover:bg-violet-500' />
                  <span>
                    {r.template_title ?? (
                      <span className='text-muted-foreground font-mono'>
                        {r.template_id.slice(0, 12)}…
                      </span>
                    )}
                  </span>
                </div>
              </td>
              <td className='px-3 py-2.5 text-right font-mono'>
                {fmtFull(r.views)}
              </td>
              <td className='px-3 py-2.5 text-right font-mono'>
                {fmtFull(r.unique_visitors)}
              </td>
              <td className='text-content-muted px-3 py-2.5 text-right font-mono'>
                {fmtFull(r.blocks_viewed)}
              </td>
              <td className='px-3 py-2.5 text-right font-mono'>
                {fmtFull(r.total_clicks)}
              </td>
              <td className='px-3 py-2.5 text-right'>
                <CtrBadge ctr={(r.total_clicks / r.views) * 100} />
              </td>
              <td className='text-muted-foreground px-3 py-2.5 group-hover:text-violet-500'>
                <ChevronRight className='size-3.5' />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- API contract (list-page level: 2 endpoints) ---------- */

function ApiContractSection() {
  return (
    <section className='border-border mt-10 rounded-2xl border bg-white p-6 shadow-sm'>
      <div className='flex items-center gap-2'>
        <div className='flex size-7 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm'>
          <span className='text-3xs font-mono'>{`{ }`}</span>
        </div>
        <h2 className='text-base font-bold'>Hợp đồng API cho Backend</h2>
        <span className='text-3xs bg-muted text-content-muted rounded-full px-2 py-0.5 font-mono'>
          v1
        </span>
      </div>
      <p className='text-content-muted mt-2 text-xs'>
        Trang này gọi 1 endpoint. Trang detail (<code>/templates/[id]</code>)
        gọi thêm 1 endpoint nữa. Tổng 3 endpoint (gồm POST ingest).
      </p>

      <div className='mt-4 space-y-3'>
        <ApiEndpoint
          method='GET'
          path='/api/analytics/templates/summary'
          query='?start=ISO&end=ISO'
          desc='Tổng hợp views / unique visitors / blocks viewed / clicks cho mọi canvas template published trong khoảng [start, end].'
          response={`TemplateAnalyticsRow[]
{
  template_id: string;
  template_title: string | null;
  views: number;
  unique_visitors: number;
  blocks_viewed: number;
  total_clicks: number;
}`}
        />
        <ApiEndpoint
          method='GET'
          path='/api/analytics/templates/:id/breakdown'
          query='?start=ISO&end=ISO'
          desc='(Trang detail) — performance + action detail theo từng block. Mỗi block có actions[] (full), và optional funnel (BookingForm) / slides (Carousel) / images (Gallery).'
          response={`BlockBreakdownRow[]
{
  block_id, block_type,
  views, clicks, unique_viewers,
  avg_dwell_ms, total_dwell_ms,
  top_action, top_target,
  actions: ActionBreakdown[],
  funnel?:  FunnelStep[],
  slides?:  SlideStat[],
  images?:  GalleryImageStat[],
}`}
        />
        <ApiEndpoint
          method='POST'
          path='/api/analytics/events'
          query=''
          desc='FE bắn event từ trang public /p/[slug]. Không auth (visitor không login). Rate-limit theo visitor_id cookie.'
          response={`Request body:
{
  template_id, block_id?, element_id?,
  visitor_id, session_id,
  event_type:
    'template_view' | 'block_view' |
    'block_click'  | 'form_submit' |
    'field_focus'  | 'field_error',
  action?, target?, dwell_ms?,
  meta?: { slide_index, field_name, ... }
}
Response: 204 No Content`}
        />
      </div>

      <div className='border-border bg-muted text-content-muted mt-5 rounded-xl border border-dashed p-4 text-xs'>
        <div className='text-foreground font-semibold'>
          Action taxonomy theo block type
        </div>
        <div className='mt-2 grid grid-cols-1 gap-2 md:grid-cols-2'>
          {Object.entries(ACTION_TAXONOMY).map(([type, t]) => (
            <div
              key={type}
              className='border-border rounded-lg border bg-white p-2'
            >
              <div className='flex items-center justify-between'>
                <BlockTypeChip type={type} />
                <span className='text-3xs text-muted-foreground font-mono'>
                  {t.actions.length} actions
                </span>
              </div>
              <div className='text-3xs text-content-muted mt-1'>
                {t.description}
              </div>
              <div className='mt-1.5 flex flex-wrap gap-1'>
                {t.actions.map(a => (
                  <span
                    key={a}
                    className='text-3xs rounded bg-blue-50 px-1.5 py-0.5 font-mono text-blue-700'
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ApiEndpoint({
  method,
  path,
  query,
  desc,
  response,
}: {
  method: string;
  path: string;
  query: string;
  desc: string;
  response: string;
}) {
  const methodColor = method === 'POST' ? 'bg-blue-600' : 'bg-emerald-600';
  return (
    <div className='border-border overflow-hidden rounded-xl border bg-white'>
      <div className='border-border bg-muted flex items-center gap-2 border-b px-4 py-2'>
        <span
          className={`rounded-md ${methodColor} text-3xs px-1.5 py-0.5 font-mono font-bold text-white`}
        >
          {method}
        </span>
        <code className='font-mono text-xs font-semibold'>
          {path}
          <span className='text-muted-foreground font-normal'>{query}</span>
        </code>
      </div>
      <div className='grid grid-cols-1 gap-4 px-4 py-3 lg:grid-cols-[1fr_300px]'>
        <p className='text-content-muted text-xs leading-relaxed'>{desc}</p>
        <pre className='text-2xs overflow-x-auto rounded-lg bg-zinc-900 px-3 py-2 font-mono leading-snug text-zinc-100'>
          {response}
        </pre>
      </div>
    </div>
  );
}
