'use client';

import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/cn';
import {
  MOCK_PAGE_ANALYTICS,
  mockTrend,
  type PageAnalyticsListRowWithDetail,
} from '@/lib/portal-v2/analytics/pagesMock';

const fmt = (n: number): string => n.toLocaleString('vi-VN');
const ctr = (clicks: number, views: number): string =>
  views > 0 ? `${((clicks / views) * 100).toFixed(1)}%` : '—';
const dwellLabel = (ms: number): string => `${(ms / 1000).toFixed(1)}s`;

/** Sparkline nhỏ trong mỗi dòng bảng — màu electric của token. */
const Sparkline = ({ data }: { data: number[] }) => {
  const w = 68;
  const h = 24;
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map(
    (v, i) => [i * step, h - ((v - min) / rng) * (h - 4) - 2] as const
  );
  const line = pts
    .map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(' ');
  const last = pts[pts.length - 1]!;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className='shrink-0'
      aria-hidden
    >
      <path
        d={line}
        fill='none'
        style={{ stroke: 'var(--pv2-electric)' }}
        strokeWidth={1.5}
        strokeLinejoin='round'
        strokeLinecap='round'
      />
      <circle
        cx={last[0].toFixed(1)}
        cy={last[1].toFixed(1)}
        r={2}
        style={{ fill: 'var(--pv2-electric)' }}
      />
    </svg>
  );
};

/** Area chart 14 ngày cho màn chi tiết — lượt xem (đặc) + click (nét đứt). */
const TrendChart = ({
  views,
  clicks,
}: {
  views: number[];
  clicks: number[];
}) => {
  const W = 560;
  const H = 180;
  const padL = 6;
  const padR = 6;
  const padT = 14;
  const padB = 22;
  const iw = W - padL - padR;
  const ih = H - padT - padB;
  const max = Math.max(...views, ...clicks) * 1.12 || 1;
  const stepX = iw / (views.length - 1);
  const toPts = (arr: number[]) =>
    arr.map((v, i) => [padL + i * stepX, padT + ih - (v / max) * ih] as const);
  const toPath = (p: readonly (readonly [number, number])[]) =>
    p
      .map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`)
      .join(' ');
  const vp = toPts(views);
  const cp = toPts(clicks);
  const vLast = vp[vp.length - 1]!;
  const gridYs = [0, 1, 2, 3].map(g => padT + (ih * g) / 3);
  const days = views.length;
  const ticks = [0, Math.floor(days / 2), days - 1];
  const vArea = `${toPath(vp)} L${vp[vp.length - 1]![0].toFixed(1)} ${
    padT + ih
  } L${vp[0]![0].toFixed(1)} ${padT + ih} Z`;

  return (
    <svg
      width='100%'
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio='none'
      className='block'
      role='img'
    >
      {gridYs.map((y, i) => (
        <line
          key={i}
          x1={padL}
          y1={y.toFixed(1)}
          x2={W - padR}
          y2={y.toFixed(1)}
          style={{ stroke: 'var(--pv2-hair)' }}
          strokeWidth={1}
        />
      ))}
      <defs>
        <linearGradient id='pv2-va' x1='0' y1='0' x2='0' y2='1'>
          <stop
            offset='0'
            style={{ stopColor: 'var(--pv2-electric)', stopOpacity: 0.16 }}
          />
          <stop
            offset='1'
            style={{ stopColor: 'var(--pv2-electric)', stopOpacity: 0 }}
          />
        </linearGradient>
      </defs>
      <path d={vArea} fill='url(#pv2-va)' />
      <path
        d={toPath(vp)}
        fill='none'
        style={{ stroke: 'var(--pv2-electric)' }}
        strokeWidth={2}
        strokeLinejoin='round'
      />
      <path
        d={toPath(cp)}
        fill='none'
        style={{ stroke: 'var(--pv2-warning)' }}
        strokeWidth={2}
        strokeDasharray='4 3'
        strokeLinejoin='round'
      />
      <circle
        cx={vLast[0].toFixed(1)}
        cy={vLast[1].toFixed(1)}
        r={3}
        style={{ fill: 'var(--pv2-electric)' }}
      />
      {ticks.map((i, k) => {
        const x = padL + i * stepX;
        const anchor = i === 0 ? 'start' : i === days - 1 ? 'end' : 'middle';
        const lab = days - i === 1 ? 'hôm nay' : `−${days - 1 - i}n`;
        return (
          <text
            key={k}
            x={x.toFixed(1)}
            y={H - 6}
            textAnchor={anchor}
            className='font-[family-name:var(--pv2-disp)]'
            style={{ fontSize: 10, fill: 'var(--pv2-faint)' }}
          >
            {lab}
          </text>
        );
      })}
    </svg>
  );
};

const StatusPill = ({ status }: { status: 'live' | 'draft' }) => {
  const t = useTranslations('portalV2.analytics.pages');
  const live = status === 'live';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
        live
          ? 'bg-[var(--pv2-success)]/12 text-[var(--pv2-success)]'
          : 'bg-[var(--pv2-hair)] text-[var(--pv2-mut)]'
      )}
    >
      <span
        className='size-1.5 rounded-full'
        style={{
          background: live ? 'var(--pv2-success)' : 'var(--pv2-faint)',
        }}
      />
      {live ? t('statusLive') : t('statusDraft')}
    </span>
  );
};

const KpiCell = ({ label, value }: { label: string; value: string }) => (
  <div className='bg-[var(--pv2-paper)] px-4 py-4 md:px-5'>
    <p className='text-[10px] font-bold tracking-[0.11em] text-[var(--pv2-faint)] uppercase'>
      {label}
    </p>
    <strong className='mt-1 block font-[family-name:var(--pv2-disp)] text-2xl tracking-[-0.04em] text-[var(--pv2-ink)] tabular-nums'>
      {value}
    </strong>
  </div>
);

// ── List ──────────────────────────────────────────────────────────────────

const PagesList = ({
  rows,
  onSelect,
}: {
  rows: PageAnalyticsListRowWithDetail[];
  onSelect: (id: string) => void;
}) => {
  const t = useTranslations('portalV2.analytics.pages');
  const totals = useMemo(() => {
    const v = rows.reduce((a, r) => a + r.views, 0);
    const u = rows.reduce((a, r) => a + r.uniqueVisitors, 0);
    const c = rows.reduce((a, r) => a + r.clicks, 0);
    return { v, u, c, ctr: v > 0 ? `${((c / v) * 100).toFixed(1)}%` : '—' };
  }, [rows]);

  return (
    <div className='flex flex-col gap-5'>
      <div className='grid grid-cols-2 gap-px overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-hair)] lg:grid-cols-4'>
        <KpiCell label={t('kpi.views')} value={fmt(totals.v)} />
        <KpiCell label={t('kpi.uniques')} value={fmt(totals.u)} />
        <KpiCell label={t('kpi.clicks')} value={fmt(totals.c)} />
        <KpiCell label={t('kpi.ctr')} value={totals.ctr} />
      </div>

      <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
        <div className='flex items-center justify-between border-b border-[var(--pv2-hair)] px-4 py-3 md:px-5'>
          <h2 className='text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
            {t('listTitle', { count: rows.length })}
          </h2>
          <span className='text-[11.5px] text-[var(--pv2-faint)]'>
            {t('listNote')}
          </span>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-[var(--pv2-canvas)]'>
                {[
                  { k: 'colPage', align: 'left' },
                  { k: 'colViews', align: 'right' },
                  { k: 'colUniques', align: 'right', hide: true },
                  { k: 'colClicks', align: 'right' },
                  { k: 'colCtr', align: 'right' },
                  { k: 'colUpdated', align: 'right', hide: true },
                ].map(c => (
                  <th
                    key={c.k}
                    className={cn(
                      'border-b border-[var(--pv2-hair)] px-4 py-2.5 text-[10.5px] font-bold tracking-[0.05em] whitespace-nowrap text-[var(--pv2-mut)] uppercase md:px-5',
                      c.align === 'left' ? 'text-left' : 'text-right',
                      c.hide && 'hidden lg:table-cell'
                    )}
                  >
                    {t(c.k)}
                  </th>
                ))}
                <th className='w-8 border-b border-[var(--pv2-hair)]' />
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr
                  key={r.pageId}
                  role='button'
                  tabIndex={0}
                  onClick={() => onSelect(r.pageId)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(r.pageId);
                    }
                  }}
                  className='group cursor-pointer border-b border-[var(--pv2-hair)]/60 transition-colors last:border-0 hover:bg-[var(--pv2-canvas)] focus-visible:bg-[var(--pv2-canvas)] focus-visible:outline-none'
                >
                  <td className='px-4 py-3.5 md:px-5'>
                    <div className='flex items-center gap-2 font-semibold text-[var(--pv2-ink)]'>
                      {r.title}
                      <StatusPill status={r.status} />
                    </div>
                    <div className='mt-0.5 font-[family-name:var(--pv2-disp)] text-[11.5px] text-[var(--pv2-faint)]'>
                      /p/{r.slug}
                    </div>
                  </td>
                  <td className='px-4 py-3.5 text-right md:px-5'>
                    <div className='flex items-center justify-end gap-2.5'>
                      <span className='font-[family-name:var(--pv2-disp)] text-[15px] font-semibold text-[var(--pv2-ink)] tabular-nums'>
                        {r.views ? fmt(r.views) : '—'}
                      </span>
                      {r.views > 0 && (
                        <Sparkline
                          data={mockTrend(r.views / 14, 14, r.drift, r.seed)}
                        />
                      )}
                    </div>
                  </td>
                  <td className='hidden px-4 py-3.5 text-right text-[var(--pv2-mut)] tabular-nums md:px-5 lg:table-cell'>
                    {r.uniqueVisitors ? fmt(r.uniqueVisitors) : '—'}
                  </td>
                  <td className='px-4 py-3.5 text-right text-[var(--pv2-mut)] tabular-nums md:px-5'>
                    {r.clicks ? fmt(r.clicks) : '—'}
                  </td>
                  <td className='px-4 py-3.5 text-right text-[var(--pv2-mut)] tabular-nums md:px-5'>
                    {ctr(r.clicks, r.views)}
                  </td>
                  <td className='hidden px-4 py-3.5 text-right text-[var(--pv2-faint)] md:px-5 lg:table-cell'>
                    {r.updatedLabel}
                  </td>
                  <td className='pr-3 text-right'>
                    <ChevronRight
                      className='inline size-4 text-[var(--pv2-faint)] transition-colors group-hover:text-[var(--pv2-electric)]'
                      strokeWidth={2}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Detail ────────────────────────────────────────────────────────────────

const PageDetail = ({
  row,
  onBack,
}: {
  row: PageAnalyticsListRowWithDetail;
  onBack: () => void;
}) => {
  const t = useTranslations('portalV2.analytics.pages');
  const d = row.detail;
  const viewsSeries = mockTrend(d.pageViews / 14, 14, row.drift, row.seed);
  const clicksSeries = mockTrend(
    d.clicks / 14,
    14,
    row.drift * 0.8,
    row.seed + 2
  );
  const maxSource = Math.max(1, ...d.sources.map(s => s.visits));

  const kpis = [
    { label: t('kpi.views'), value: fmt(d.pageViews) },
    { label: t('kpi.uniques'), value: fmt(d.uniqueVisitors) },
    { label: t('kpi.clicks'), value: fmt(d.clicks) },
    { label: t('kpi.conversions'), value: fmt(d.conversions) },
    { label: t('kpi.scroll'), value: `${d.avgScrollDepth}%` },
  ];

  return (
    <div className='flex flex-col gap-5'>
      <div>
        <button
          type='button'
          onClick={onBack}
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--pv2-mut)] transition-colors hover:text-[var(--pv2-ink)]'
        >
          ← {t('back')}
        </button>
      </div>

      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h2 className='font-[family-name:var(--pv2-disp)] text-[1.375rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)]'>
            {row.title}
          </h2>
          <div className='mt-1 flex items-center gap-2'>
            <StatusPill status={row.status} />
            <span className='font-[family-name:var(--pv2-disp)] text-[12px] text-[var(--pv2-faint)]'>
              /p/{row.slug}
            </span>
          </div>
        </div>
        <a
          href={`https://portal.rexerstudio.com/p/${row.slug}`}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1.5 rounded-[var(--pv2-r-sm)] bg-[var(--pv2-electric-soft)] px-3.5 py-2 text-[13px] font-semibold text-[var(--pv2-electric)] transition-colors hover:bg-[var(--pv2-electric)] hover:text-white'
        >
          {t('viewPage')}
          <ArrowUpRight className='size-3.5' strokeWidth={2.2} aria-hidden />
        </a>
      </div>

      <div className='grid grid-cols-2 gap-px overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-hair)] sm:grid-cols-3 lg:grid-cols-5'>
        {kpis.map(k => (
          <KpiCell key={k.label} label={k.label} value={k.value} />
        ))}
      </div>

      <div className='grid gap-4 lg:grid-cols-[1.6fr_1fr]'>
        <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
          <div className='flex items-center justify-between border-b border-[var(--pv2-hair)] px-4 py-3 md:px-5'>
            <h3 className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
              {t('trendTitle')}
            </h3>
            <div className='flex items-center gap-3.5'>
              <span className='flex items-center gap-1.5 text-[11.5px] text-[var(--pv2-mut)]'>
                <span
                  className='size-2.5 rounded-[3px]'
                  style={{ background: 'var(--pv2-electric)' }}
                />
                {t('legendViews')}
              </span>
              <span className='flex items-center gap-1.5 text-[11.5px] text-[var(--pv2-mut)]'>
                <span
                  className='size-2.5 rounded-[3px]'
                  style={{ background: 'var(--pv2-warning)' }}
                />
                {t('legendClicks')}
              </span>
            </div>
          </div>
          <div className='px-4 pt-4 pb-2 md:px-5'>
            <TrendChart views={viewsSeries} clicks={clicksSeries} />
          </div>
        </div>

        <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
          <div className='border-b border-[var(--pv2-hair)] px-4 py-3 md:px-5'>
            <h3 className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
              {t('sourcesTitle')}
            </h3>
          </div>
          <div>
            {d.sources.map(s => (
              <div
                key={s.source}
                className='flex items-center gap-3 border-b border-[var(--pv2-hair)]/60 px-4 py-2.5 last:border-0 md:px-5'
              >
                <span className='w-20 shrink-0 text-[12.5px] font-medium text-[var(--pv2-ink)]'>
                  {s.source}
                </span>
                <span className='h-2 flex-1 overflow-hidden rounded-full bg-[var(--pv2-hair)]'>
                  <span
                    className='block h-full rounded-full'
                    style={{
                      width: `${(s.visits / maxSource) * 100}%`,
                      background: 'var(--pv2-electric)',
                    }}
                  />
                </span>
                <span className='w-16 text-right font-[family-name:var(--pv2-disp)] text-[12px] text-[var(--pv2-mut)] tabular-nums'>
                  {fmt(s.visits)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
        <div className='flex items-center justify-between border-b border-[var(--pv2-hair)] px-4 py-3 md:px-5'>
          <h3 className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
            {t('blocksTitle')}
          </h3>
          <span className='text-[11.5px] text-[var(--pv2-faint)]'>
            {t('blocksNote')}
          </span>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-[var(--pv2-canvas)]'>
                {[
                  'colBlock',
                  'colViews',
                  'colClicks',
                  'colCtr',
                  'colDwell',
                ].map((k, i) => (
                  <th
                    key={k}
                    className={cn(
                      'border-b border-[var(--pv2-hair)] px-4 py-2.5 text-[10.5px] font-bold tracking-[0.05em] whitespace-nowrap text-[var(--pv2-mut)] uppercase md:px-5',
                      i === 0 ? 'text-left' : 'text-right',
                      k === 'colDwell' && 'hidden sm:table-cell'
                    )}
                  >
                    {t(k)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.blocks.map(b => (
                <tr
                  key={b.name}
                  className='border-b border-[var(--pv2-hair)]/60 last:border-0'
                >
                  <td className='px-4 py-3 font-medium text-[var(--pv2-ink)] md:px-5'>
                    {b.name}
                  </td>
                  <td className='px-4 py-3 text-right text-[var(--pv2-mut)] tabular-nums md:px-5'>
                    {fmt(b.views)}
                  </td>
                  <td className='px-4 py-3 text-right text-[var(--pv2-mut)] tabular-nums md:px-5'>
                    {fmt(b.clicks)}
                  </td>
                  <td className='px-4 py-3 text-right text-[var(--pv2-mut)] tabular-nums md:px-5'>
                    {ctr(b.clicks, b.views)}
                  </td>
                  <td className='hidden px-4 py-3 text-right text-[var(--pv2-mut)] tabular-nums sm:table-cell md:px-5'>
                    {dwellLabel(b.dwellMs)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Panel ─────────────────────────────────────────────────────────────────

export const PagesPanel = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const rows = MOCK_PAGE_ANALYTICS;
  const selected = rows.find(r => r.pageId === selectedId) ?? null;

  if (selected) {
    return <PageDetail row={selected} onBack={() => setSelectedId(null)} />;
  }
  return <PagesList rows={rows} onSelect={setSelectedId} />;
};
