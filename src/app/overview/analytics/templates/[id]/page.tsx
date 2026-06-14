'use client';

import {
  ChevronDown,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  LayoutGrid,
  MousePointerClick,
  TrendingDown,
  Users,
  Zap,
} from 'lucide-react';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { Fragment, Suspense, useEffect, useMemo, useState } from 'react';

import {
  ACTION_TAXONOMY,
  FAKE_BREAKDOWN,
  FAKE_SUMMARY,
  applyPresetBreakdown,
  type ActionBreakdown,
  type BlockBreakdownRow,
  type FunnelStep,
  type GalleryImageStat,
  type RangePreset,
  type SlideStat,
} from '../_fake-data';
import { loadBreakdown } from '../_remote';
import {
  BlockTypeChip,
  CtrBadge,
  FakeBadge,
  FakeBanner,
  PageHeader,
  PresetBar,
  Skeleton,
  StatCard,
  fmtDwell,
  fmtFull,
  fmtNum,
} from '../_shared';

export default function TemplateDetailPage() {
  return (
    <Suspense
      fallback={<div className='text-content-muted p-8 text-sm'>Loading…</div>}
    >
      <TemplateDetailInner />
    </Suspense>
  );
}

function TemplateDetailInner() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const initialPreset = (searchParams.get('range') as RangePreset) || '30d';

  const tpl = FAKE_SUMMARY.find(s => s.template_id === params.id);
  if (!tpl) notFound();

  const [preset, setPreset] = useState<RangePreset>(initialPreset);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [openBlockId, setOpenBlockId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<BlockBreakdownRow[]>(() =>
    applyPresetBreakdown(FAKE_BREAKDOWN[params.id] ?? [], initialPreset)
  );
  const [source, setSource] = useState<'live' | 'fake'>('fake');

  const totals = useMemo(
    () => ({
      blocks: blocks.length,
      views: blocks.reduce((s, b) => s + b.views, 0),
      visitors: Math.max(...blocks.map(b => b.unique_viewers), 0),
      clicks: blocks.reduce((s, b) => s + b.clicks, 0),
    }),
    [blocks]
  );

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    loadBreakdown(
      params.id,
      preset,
      applyPresetBreakdown(FAKE_BREAKDOWN[params.id] ?? [], preset)
    ).then(res => {
      if (cancelled) return;
      setBlocks(res.data);
      setSource(res.source);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [params.id, preset, refreshKey]);

  return (
    <div className='bg-background text-foreground min-h-screen antialiased'>
      <PageHeader
        back='/overview/analytics/templates'
        backLabel='Tất cả landing pages'
        title='Landing page Analytics'
        subtitle={tpl.template_title ?? tpl.template_id}
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
        {/* Detail hero */}
        <section className='flex flex-wrap items-end justify-between gap-4'>
          <div className='min-w-0'>
            <div className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
              Landing page
            </div>
            <h1 className='mt-1 text-2xl font-bold tracking-tight'>
              {tpl.template_title ?? (
                <span className='text-muted-foreground font-mono'>
                  {tpl.template_id}
                </span>
              )}
            </h1>
            <div className='text-2xs text-content-muted mt-1 flex items-center gap-2'>
              <span className='font-mono'>{tpl.template_id}</span>
              <span>·</span>
              <span>{blocks.length} block</span>
            </div>
          </div>
          <PresetBar
            preset={preset}
            onPresetChange={setPreset}
            onRefresh={() => setRefreshKey(k => k + 1)}
          />
        </section>

        {source === 'fake' && <FakeBanner />}

        {/* KPI for this template */}
        <div className='mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4'>
          <StatCard
            icon={LayoutGrid}
            label='Blocks'
            value={totals.blocks}
            accent='indigo'
            hint='Số block trong landing page'
          />
          <StatCard
            icon={Eye}
            label='Page views'
            value={totals.views}
            accent='blue'
          />
          <StatCard
            icon={Users}
            label='Unique visitors'
            value={totals.visitors}
            accent='emerald'
          />
          <StatCard
            icon={Zap}
            label='Total clicks'
            value={totals.clicks}
            accent='amber'
            hint={`CTR ${((totals.clicks / Math.max(totals.views, 1)) * 100).toFixed(1)}%`}
          />
        </div>

        {/* Blocks table with inline detail */}
        <div className='border-border mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm'>
          <div className='border-border flex items-center justify-between border-b px-5 py-3'>
            <div className='flex items-center gap-2'>
              <div className='flex size-7 items-center justify-center rounded-lg bg-violet-500 text-white shadow-sm'>
                <MousePointerClick className='size-4' />
              </div>
              <div>
                <h2 className='text-sm font-semibold'>
                  Block breakdown ({blocks.length})
                </h2>
                <p className='text-2xs text-content-muted'>
                  Click vào dòng để xem chi tiết action / funnel / slides
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setOpenBlockId(id =>
                  id ? null : (blocks[0]?.block_id ?? null)
                )
              }
              className='text-2xs border-border text-content-muted hover:bg-muted rounded-lg border bg-white px-2.5 py-1 font-medium'
            >
              {openBlockId ? 'Đóng tất cả' : 'Mở block đầu'}
            </button>
          </div>
          <BreakdownTable
            rows={blocks}
            loading={loading}
            openId={openBlockId}
            onToggle={id => setOpenBlockId(cur => (cur === id ? null : id))}
          />
        </div>
      </main>
    </div>
  );
}

/* ---------- Breakdown table ---------- */

function BreakdownTable({
  rows,
  loading,
  openId,
  onToggle,
}: {
  rows: BlockBreakdownRow[];
  loading: boolean;
  openId: string | null;
  onToggle: (id: string) => void;
}) {
  if (loading && !rows.length) return <Skeleton rows={3} cols={7} />;
  if (!rows.length) {
    return (
      <div className='text-content-muted px-5 py-8 text-center text-sm'>
        Template này chưa có block view/click trong khoảng được chọn.
      </div>
    );
  }
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead className='border-border bg-muted/50 border-b'>
          <tr className='text-3xs text-content-muted text-left font-semibold tracking-wider uppercase'>
            <th className='w-8 px-3 py-2.5' />
            <th className='px-3 py-2.5'>Block</th>
            <th className='px-3 py-2.5 text-right'>Views</th>
            <th className='px-3 py-2.5 text-right'>Unique</th>
            <th className='px-3 py-2.5 text-right'>Clicks</th>
            <th className='px-3 py-2.5 text-right'>CTR</th>
            <th className='px-3 py-2.5 text-right'>Avg dwell</th>
            <th className='px-3 py-2.5'>Top action</th>
            <th className='px-3 py-2.5'>Top target</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const isOpen = openId === r.block_id;
            return (
              <Fragment key={r.block_id}>
                <tr
                  onClick={() => onToggle(r.block_id)}
                  className={`border-border cursor-pointer border-t transition-colors ${
                    isOpen ? 'bg-violet-50/40' : 'hover:bg-muted/60'
                  }`}
                >
                  <td className='text-muted-foreground px-3 py-2.5'>
                    {isOpen ? (
                      <ChevronDown className='size-4' />
                    ) : (
                      <ChevronRight className='size-4' />
                    )}
                  </td>
                  <td className='px-3 py-2.5'>
                    <div className='flex items-center gap-2'>
                      <BlockTypeChip type={r.block_type} />
                      <span className='text-3xs text-muted-foreground font-mono'>
                        {r.actions.length} action
                      </span>
                    </div>
                  </td>
                  <td className='px-3 py-2.5 text-right font-mono'>
                    {fmtFull(r.views)}
                  </td>
                  <td className='text-content-muted px-3 py-2.5 text-right font-mono'>
                    {fmtFull(r.unique_viewers)}
                  </td>
                  <td className='px-3 py-2.5 text-right font-mono'>
                    {fmtFull(r.clicks)}
                  </td>
                  <td className='px-3 py-2.5 text-right'>
                    <CtrBadge ctr={(r.clicks / r.views) * 100} />
                  </td>
                  <td className='text-content-muted px-3 py-2.5 text-right font-mono'>
                    {fmtDwell(r.avg_dwell_ms)}
                  </td>
                  <td className='px-3 py-2.5'>
                    {r.top_action ? (
                      <span className='text-2xs rounded-md bg-blue-100 px-1.5 py-0.5 font-mono text-blue-700'>
                        {r.top_action}
                      </span>
                    ) : (
                      <span className='text-muted-foreground'>—</span>
                    )}
                  </td>
                  <td className='text-2xs text-content-muted max-w-[180px] truncate px-3 py-2.5 font-mono'>
                    {r.top_target ?? '—'}
                  </td>
                </tr>
                {isOpen && (
                  <tr className='bg-gradient-to-b from-violet-50/30 to-white'>
                    <td colSpan={9} className='px-5 py-4'>
                      <BlockDetailPanel row={r} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Block detail panel ---------- */

function BlockDetailPanel({ row }: { row: BlockBreakdownRow }) {
  const taxonomy = row.block_type ? ACTION_TAXONOMY[row.block_type] : undefined;
  return (
    <div className='space-y-4'>
      <div>
        <h4 className='text-foreground text-sm font-bold'>
          Chi tiết hành vi —{' '}
          <span className='font-mono text-violet-700'>{row.block_id}</span>
        </h4>
        {taxonomy && (
          <p className='text-2xs text-content-muted mt-0.5'>
            {taxonomy.description} · Tracked actions:{' '}
            <span className='font-mono'>{taxonomy.actions.length}</span>
          </p>
        )}
      </div>

      {row.funnel && (
        <div className='rounded-xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50/60 to-white p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex size-6 items-center justify-center rounded-lg bg-fuchsia-500 text-white'>
              <TrendingDown className='size-3.5' />
            </div>
            <h5 className='text-sm font-semibold'>Funnel — Form conversion</h5>
          </div>
          <Funnel steps={row.funnel} />
        </div>
      )}

      {row.slides && (
        <div className='rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/60 to-white p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex size-6 items-center justify-center rounded-lg bg-amber-500 text-white'>
              <LayoutGrid className='size-3.5' />
            </div>
            <h5 className='text-sm font-semibold'>Performance theo slide</h5>
          </div>
          <SlidesGrid slides={row.slides} />
        </div>
      )}

      {row.images && (
        <div className='rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-white p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex size-6 items-center justify-center rounded-lg bg-blue-500 text-white'>
              <ImageIcon className='size-3.5' />
            </div>
            <h5 className='text-sm font-semibold'>Per-image performance</h5>
          </div>
          <ImagesGrid images={row.images} />
        </div>
      )}

      <div className='border-border rounded-xl border bg-white p-4'>
        <div className='mb-3 flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <div className='flex size-6 items-center justify-center rounded-lg bg-zinc-900 text-white'>
              <MousePointerClick className='size-3.5' />
            </div>
            <h5 className='text-sm font-semibold'>
              Actions ({row.actions.length})
            </h5>
          </div>
          <span className='text-3xs text-muted-foreground font-mono'>
            Sort theo count
          </span>
        </div>
        <ActionsTable actions={row.actions} />
      </div>
    </div>
  );
}

/* ---------- sub: Funnel ---------- */

function Funnel({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(...steps.map(s => s.count));
  const final = steps[steps.length - 1].count;
  const first = steps[0].count;
  return (
    <div className='space-y-2'>
      {steps.map((s, i) => {
        const pct = (s.count / max) * 100;
        const isLast = i === steps.length - 1;
        return (
          <div key={s.name} className='relative'>
            <div className='flex items-center gap-3'>
              <div className='w-32 shrink-0'>
                <div className='flex items-center gap-1.5'>
                  <span className='text-3xs flex size-5 items-center justify-center rounded-full bg-zinc-900 font-mono font-bold text-white'>
                    {i + 1}
                  </span>
                  <span className='text-content-muted text-xs font-medium'>
                    {s.label}
                  </span>
                </div>
              </div>
              <div className='bg-muted relative flex-1 overflow-hidden rounded-md'>
                <div
                  className={`flex h-7 items-center justify-end pr-2 ${
                    isLast
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                      : 'bg-gradient-to-r from-fuchsia-400 to-fuchsia-500'
                  }`}
                  style={{ width: `${pct}%` }}
                >
                  <span className='text-2xs font-mono font-bold text-white'>
                    {fmtFull(s.count)}
                  </span>
                </div>
              </div>
              <div className='w-20 shrink-0 text-right'>
                {s.drop_off_pct > 0 ? (
                  <span
                    className={`text-3xs rounded-md px-1.5 py-0.5 font-mono ${
                      s.drop_off_pct >= 50
                        ? 'bg-rose-100 text-rose-700'
                        : s.drop_off_pct >= 30
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-muted text-content-muted'
                    }`}
                  >
                    −{s.drop_off_pct}%
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
      <div className='text-2xs border-border mt-3 flex items-center justify-between border-t pt-2'>
        <span className='text-content-muted'>Conversion tổng:</span>
        <span className='font-mono font-bold text-emerald-700'>
          {((final / first) * 100).toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

/* ---------- sub: Slides ---------- */

function SlidesGrid({ slides }: { slides: SlideStat[] }) {
  return (
    <div className='grid grid-cols-2 gap-2 md:grid-cols-4'>
      {slides.map(s => {
        const ctrPct = s.views > 0 ? (s.clicks / s.views) * 100 : 0;
        return (
          <div
            key={s.index}
            className='border-border overflow-hidden rounded-lg border bg-white'
          >
            <div className='aspect-video bg-gradient-to-br from-amber-200 to-amber-50 p-1.5'>
              <span className='text-3xs rounded bg-white/80 px-1.5 py-0.5 font-mono text-amber-700'>
                #{s.index}
              </span>
            </div>
            <div className='p-2'>
              <div className='text-2xs truncate font-medium'>{s.label}</div>
              <div className='text-3xs mt-1 flex items-center justify-between'>
                <span className='text-content-muted font-mono'>
                  {fmtNum(s.views)} v
                </span>
                <span className='text-content-muted font-mono'>
                  {fmtNum(s.clicks)} c
                </span>
                <CtrBadge ctr={ctrPct} />
              </div>
              <div className='text-3xs text-muted-foreground mt-1'>
                dwell {fmtDwell(s.avg_dwell_ms)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- sub: Images ---------- */

function ImagesGrid({ images }: { images: GalleryImageStat[] }) {
  const maxClicks = Math.max(...images.map(i => i.clicks));
  return (
    <div className='grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-7'>
      {images.map(img => {
        const intensity = img.clicks / maxClicks;
        return (
          <div
            key={img.src}
            className='border-border overflow-hidden rounded-lg border bg-white'
          >
            <div
              className='relative aspect-square bg-gradient-to-br from-blue-200 to-blue-50'
              style={{ opacity: 0.4 + intensity * 0.6 }}
            >
              <span className='text-3xs absolute top-1 left-1 rounded bg-white/80 px-1 py-0.5 font-mono text-blue-700'>
                #{img.index}
              </span>
              {intensity > 0.7 && (
                <span className='text-3xs absolute top-1 right-1 rounded-full bg-rose-500 px-1.5 py-0.5 font-mono font-bold text-white'>
                  HOT
                </span>
              )}
            </div>
            <div className='p-1.5'>
              <div className='text-3xs flex items-center justify-between'>
                <span className='text-content-muted font-mono'>
                  {img.clicks} clicks
                </span>
              </div>
              <div className='text-3xs text-muted-foreground'>
                {img.zooms} zooms
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- sub: Actions ---------- */

function ActionsTable({ actions }: { actions: ActionBreakdown[] }) {
  if (!actions.length)
    return (
      <p className='text-content-muted text-center text-xs'>
        Chưa có action nào trong khoảng thời gian này.
      </p>
    );
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead className='border-border border-b'>
          <tr className='text-3xs text-content-muted text-left font-semibold tracking-wider uppercase'>
            <th className='py-2 pr-3'>Action</th>
            <th className='py-2 pr-3 text-right'>Count</th>
            <th className='py-2 pr-3 text-right'>Unique</th>
            <th className='py-2 pr-3'>Top targets</th>
          </tr>
        </thead>
        <tbody>
          {actions.map(a => (
            <tr key={a.action} className='border-border border-t'>
              <td className='py-2 pr-3'>
                <span className='text-2xs rounded-md bg-blue-100 px-1.5 py-0.5 font-mono text-blue-700'>
                  {a.action}
                </span>
              </td>
              <td className='py-2 pr-3 text-right font-mono font-semibold'>
                {fmtFull(a.count)}
              </td>
              <td className='text-content-muted py-2 pr-3 text-right font-mono'>
                {fmtFull(a.unique_visitors)}
              </td>
              <td className='py-2 pr-3'>
                {a.targets.length > 0 ? (
                  <div className='flex flex-wrap gap-1'>
                    {a.targets.slice(0, 5).map(t => (
                      <span
                        key={t.target}
                        className='text-3xs border-border bg-muted text-content-muted inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono'
                      >
                        {t.target}
                        <span className='text-muted-foreground'>·</span>
                        <span className='text-foreground font-bold'>
                          {fmtFull(t.count)}
                        </span>
                      </span>
                    ))}
                    {a.targets.length > 5 && (
                      <span className='text-3xs text-muted-foreground'>
                        +{a.targets.length - 5} khác
                      </span>
                    )}
                  </div>
                ) : (
                  <span className='text-2xs text-muted-foreground'>
                    Không có target
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
