'use client';

import { AlertCircle, ArrowUpRight, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { cn } from '@/lib/cn';
import {
  fetchLivePageDetail,
  type LivePageDetail,
  type LivePageRow,
  type LivePagesResult,
} from '@/services/portal-v2/livePages';

const fmt = (n: number | null): string =>
  n == null ? '—' : n.toLocaleString('vi-VN');
const ctr = (clicks: number | null, views: number | null): string =>
  views && views > 0 && clicks != null
    ? `${((clicks / views) * 100).toFixed(1)}%`
    : '—';
const dwellLabel = (ms: number | null): string =>
  ms == null ? '—' : `${(ms / 1000).toFixed(1)}s`;

/** Area chart cho màn chi tiết — visits (đặc) + leads (nét đứt). */
const TrendChart = ({
  visits,
  leads,
}: {
  visits: number[];
  leads: number[];
}) => {
  const W = 560;
  const H = 180;
  const padL = 6;
  const padR = 6;
  const padT = 14;
  const padB = 22;
  const iw = W - padL - padR;
  const ih = H - padT - padB;
  const n = visits.length;
  const max = Math.max(1, ...visits, ...leads) * 1.12;
  const stepX = n > 1 ? iw / (n - 1) : 0;
  const toPts = (arr: number[]) =>
    arr.map((v, i) => [padL + i * stepX, padT + ih - (v / max) * ih] as const);
  const toPath = (p: readonly (readonly [number, number])[]) =>
    p
      .map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`)
      .join(' ');
  const vp = toPts(visits);
  const lp = toPts(leads);
  const vLast = vp[vp.length - 1]!;
  const gridYs = [0, 1, 2, 3].map(g => padT + (ih * g) / 3);
  const ticks = [0, Math.floor((n - 1) / 2), n - 1].filter(
    (v, i, a) => a.indexOf(v) === i && v >= 0
  );
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
        <linearGradient id='pv2-lp-va' x1='0' y1='0' x2='0' y2='1'>
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
      <path d={vArea} fill='url(#pv2-lp-va)' />
      <path
        d={toPath(vp)}
        fill='none'
        style={{ stroke: 'var(--pv2-electric)' }}
        strokeWidth={2}
        strokeLinejoin='round'
      />
      <path
        d={toPath(lp)}
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
        const anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle';
        return (
          <text
            key={k}
            x={x.toFixed(1)}
            y={H - 6}
            textAnchor={anchor}
            className='font-[family-name:var(--pv2-disp)]'
            style={{ fontSize: 10, fill: 'var(--pv2-faint)' }}
          >
            {visits.length ? `−${n - 1 - i}n` : ''}
          </text>
        );
      })}
    </svg>
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

const HeadCell = ({
  children,
  align = 'right',
  hide,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  hide?: boolean;
}) => (
  <th
    className={cn(
      'border-b border-[var(--pv2-hair)] px-4 py-2.5 text-[10.5px] font-bold tracking-[0.05em] whitespace-nowrap text-[var(--pv2-mut)] uppercase md:px-5',
      align === 'left' ? 'text-left' : 'text-right',
      hide && 'hidden lg:table-cell'
    )}
  >
    {children}
  </th>
);

// ── List ──────────────────────────────────────────────────────────────────

const PagesList = ({
  data,
  onSelect,
}: {
  data: LivePagesResult;
  onSelect: (row: LivePageRow) => void;
}) => {
  const t = useTranslations('portalV2.analytics.pages');
  const totals = useMemo(() => {
    const v = data.rows.reduce((a, r) => a + (r.pageViews ?? 0), 0);
    const u = data.rows.reduce((a, r) => a + (r.uniqueVisitors ?? 0), 0);
    const c = data.rows.reduce((a, r) => a + (r.clicks ?? 0), 0);
    const cv = data.rows.reduce((a, r) => a + (r.conversions ?? 0), 0);
    return { v, u, c, cv, ctr: v > 0 ? `${((c / v) * 100).toFixed(1)}%` : '—' };
  }, [data.rows]);

  if (data.error) {
    return (
      <div className='flex flex-col items-center gap-2 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-6 py-12 text-center'>
        <AlertCircle className='size-6 text-[var(--pv2-error)]' aria-hidden />
        <p className='text-[14px] font-semibold text-[var(--pv2-ink)]'>
          {t('loadError')}
        </p>
        <p className='max-w-md font-[family-name:var(--pv2-disp)] text-[11.5px] break-words text-[var(--pv2-mut)]'>
          {data.error}
        </p>
      </div>
    );
  }

  if (data.rows.length === 0) {
    return (
      <div className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-6 py-12 text-center'>
        <p className='text-[14px] font-semibold text-[var(--pv2-ink)]'>
          {t('emptyTitle')}
        </p>
        <p className='mt-1 text-[12.5px] text-[var(--pv2-mut)]'>
          {t('emptyBody')}
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5'>
      <div className='grid grid-cols-2 gap-px overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-hair)] lg:grid-cols-4'>
        <KpiCell label={t('kpi.views')} value={fmt(totals.v)} />
        <KpiCell label={t('kpi.uniques')} value={fmt(totals.u)} />
        <KpiCell label={t('kpi.clicks')} value={fmt(totals.c)} />
        <KpiCell label={t('kpi.conversions')} value={fmt(totals.cv)} />
      </div>

      <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
        <div className='flex items-center justify-between border-b border-[var(--pv2-hair)] px-4 py-3 md:px-5'>
          <h2 className='text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
            {t('listTitle', { count: data.rows.length })}
          </h2>
          <span className='text-[11.5px] text-[var(--pv2-faint)]'>
            {data.range
              ? `${data.range.from} → ${data.range.to}`
              : t('listNote')}
          </span>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-[var(--pv2-canvas)]'>
                <HeadCell align='left'>{t('colPage')}</HeadCell>
                <HeadCell>{t('colViews')}</HeadCell>
                <HeadCell hide>{t('colUniques')}</HeadCell>
                <HeadCell>{t('colClicks')}</HeadCell>
                <HeadCell>{t('colCtr')}</HeadCell>
                <HeadCell hide>{t('colConversions')}</HeadCell>
                <th className='w-8 border-b border-[var(--pv2-hair)]' />
              </tr>
            </thead>
            <tbody>
              {data.rows.map(r => (
                <tr
                  key={r.slug}
                  role='button'
                  tabIndex={0}
                  onClick={() => onSelect(r)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(r);
                    }
                  }}
                  className='group cursor-pointer border-b border-[var(--pv2-hair)]/60 transition-colors last:border-0 hover:bg-[var(--pv2-canvas)] focus-visible:bg-[var(--pv2-canvas)] focus-visible:outline-none'
                >
                  <td className='px-4 py-3.5 md:px-5'>
                    <div className='flex items-center gap-2 font-semibold text-[var(--pv2-ink)]'>
                      {r.title}
                      {!r.measured && (
                        <span className='rounded-full bg-[var(--pv2-hair)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--pv2-mut)]'>
                          {t('unmeasured')}
                        </span>
                      )}
                    </div>
                    <div className='mt-0.5 font-[family-name:var(--pv2-disp)] text-[11.5px] text-[var(--pv2-faint)]'>
                      /p/{r.slug}
                    </div>
                  </td>
                  <td className='px-4 py-3.5 text-right font-[family-name:var(--pv2-disp)] text-[15px] font-semibold text-[var(--pv2-ink)] tabular-nums md:px-5'>
                    {fmt(r.pageViews)}
                  </td>
                  <td className='hidden px-4 py-3.5 text-right text-[var(--pv2-mut)] tabular-nums md:px-5 lg:table-cell'>
                    {fmt(r.uniqueVisitors)}
                  </td>
                  <td className='px-4 py-3.5 text-right text-[var(--pv2-mut)] tabular-nums md:px-5'>
                    {fmt(r.clicks)}
                  </td>
                  <td className='px-4 py-3.5 text-right text-[var(--pv2-mut)] tabular-nums md:px-5'>
                    {ctr(r.clicks, r.pageViews)}
                  </td>
                  <td className='hidden px-4 py-3.5 text-right text-[var(--pv2-mut)] tabular-nums md:px-5 lg:table-cell'>
                    {fmt(r.conversions)}
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
  row: LivePageRow;
  onBack: () => void;
}) => {
  const t = useTranslations('portalV2.analytics.pages');
  const [detail, setDetail] = useState<LivePageDetail | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetchLivePageDetail(row.slug)
      .then(d => {
        if (cancelled) return;
        setDetail(d);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [row.slug]);

  const maxSource = Math.max(1, ...(detail?.sources ?? []).map(s => s.visits));

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
          <div className='mt-1 font-[family-name:var(--pv2-disp)] text-[12px] text-[var(--pv2-faint)]'>
            /p/{row.slug}
          </div>
        </div>
        {row.shareUrl && (
          <a
            href={row.shareUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1.5 rounded-[var(--pv2-r-sm)] bg-[var(--pv2-electric-soft)] px-3.5 py-2 text-[13px] font-semibold text-[var(--pv2-electric)] transition-colors hover:bg-[var(--pv2-electric)] hover:text-white'
          >
            {t('viewPage')}
            <ArrowUpRight className='size-3.5' strokeWidth={2.2} aria-hidden />
          </a>
        )}
      </div>

      {status === 'loading' && (
        <div className='flex items-center justify-center gap-2 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] py-16 text-[13px] text-[var(--pv2-mut)]'>
          <Loader2 className='size-4 animate-spin' aria-hidden />
          {t('loading')}
        </div>
      )}

      {status === 'error' && (
        <div className='flex flex-col items-center gap-2 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] py-12 text-center'>
          <AlertCircle className='size-6 text-[var(--pv2-error)]' aria-hidden />
          <p className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
            {t('loadError')}
          </p>
        </div>
      )}

      {status === 'ready' && detail && (
        <>
          <div className='grid grid-cols-2 gap-px overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-hair)] sm:grid-cols-4'>
            <KpiCell label={t('kpi.views')} value={fmt(detail.pageViews)} />
            <KpiCell
              label={t('kpi.uniques')}
              value={fmt(detail.uniqueVisitors)}
            />
            <KpiCell label={t('kpi.clicks')} value={fmt(detail.clicks)} />
            <KpiCell
              label={t('kpi.conversions')}
              value={fmt(detail.conversions)}
            />
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
                    {t('legendVisits')}
                  </span>
                  <span className='flex items-center gap-1.5 text-[11.5px] text-[var(--pv2-mut)]'>
                    <span
                      className='size-2.5 rounded-[3px]'
                      style={{ background: 'var(--pv2-warning)' }}
                    />
                    {t('legendLeads')}
                  </span>
                </div>
              </div>
              <div className='px-4 pt-4 pb-2 md:px-5'>
                {detail.trend.length > 1 ? (
                  <TrendChart
                    visits={detail.trend.map(p => p.visits)}
                    leads={detail.trend.map(p => p.leads)}
                  />
                ) : (
                  <p className='py-10 text-center text-[12.5px] text-[var(--pv2-faint)]'>
                    {t('trendEmpty')}
                  </p>
                )}
              </div>
            </div>

            <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
              <div className='border-b border-[var(--pv2-hair)] px-4 py-3 md:px-5'>
                <h3 className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
                  {t('sourcesTitle')}
                </h3>
              </div>
              {detail.sources.length ? (
                <div>
                  {detail.sources.map(s => (
                    <div
                      key={s.source}
                      className='flex items-center gap-3 border-b border-[var(--pv2-hair)]/60 px-4 py-2.5 last:border-0 md:px-5'
                    >
                      <span className='w-20 shrink-0 truncate text-[12.5px] font-medium text-[var(--pv2-ink)]'>
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
              ) : (
                <p className='px-5 py-8 text-center text-[12.5px] text-[var(--pv2-faint)]'>
                  {t('sourcesEmpty')}
                </p>
              )}
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
            {detail.blocks.length ? (
              <div className='overflow-x-auto'>
                <table className='w-full border-collapse'>
                  <thead>
                    <tr className='bg-[var(--pv2-canvas)]'>
                      <HeadCell align='left'>{t('colBlock')}</HeadCell>
                      <HeadCell>{t('colViews')}</HeadCell>
                      <HeadCell>{t('colClicks')}</HeadCell>
                      <HeadCell>{t('colCtr')}</HeadCell>
                      <HeadCell hide>{t('colDwell')}</HeadCell>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.blocks.map((b, i) => (
                      <tr
                        key={`${b.name}-${i}`}
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
                        <td className='hidden px-4 py-3 text-right text-[var(--pv2-mut)] tabular-nums md:px-5 lg:table-cell'>
                          {dwellLabel(b.dwellMs)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className='px-5 py-8 text-center text-[12.5px] text-[var(--pv2-faint)]'>
                {t('blocksEmpty')}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ── Panel ─────────────────────────────────────────────────────────────────

export const PagesPanel = ({ data }: { data: LivePagesResult }) => {
  const [selected, setSelected] = useState<LivePageRow | null>(null);

  if (selected) {
    return <PageDetail row={selected} onBack={() => setSelected(null)} />;
  }
  return <PagesList data={data} onSelect={setSelected} />;
};
