'use client';

import {
  BarChart3,
  ExternalLink,
  Eye,
  Globe,
  Loader2,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import type {
  MicroSite,
  MicroSiteAnalytics,
  MicroSiteStatus,
} from '@/services/rexer/types';

import { fmtFull, fmtNum } from '../_data';
import { PortalShell } from '../_shell';

const STATUS_META: Record<MicroSiteStatus, { label: string; chip: string }> = {
  live: { label: 'Live', chip: 'bg-emerald-100 text-emerald-700' },
  dev: { label: 'Đang dev', chip: 'bg-amber-100 text-amber-700' },
  paused: { label: 'Tạm dừng', chip: 'bg-muted text-content-muted' },
};

function statusMeta(s: string) {
  return STATUS_META[
    (s as MicroSiteStatus) in STATUS_META ? (s as MicroSiteStatus) : 'dev'
  ];
}

export default function PortalMicroSitesPage() {
  const [sites, setSites] = useState<MicroSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MicroSite | null>(null);

  useEffect(() => {
    let cancelled = false;
    rexerApi.microSites
      .list({ limit: 100 })
      .then(res => {
        if (cancelled) return;
        const items = res.items ?? [];
        setSites(items);
        setSelected(items[0] ?? null);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PortalShell>
      <section>
        <div className='text-2xs text-content-muted flex items-center gap-2 font-semibold tracking-wider uppercase'>
          <Globe className='size-3' /> Micro site
        </div>
        <h1 className='mt-1 text-2xl font-bold tracking-tight'>Micro site</h1>
        <p className='text-content-muted mt-1 text-sm'>
          Các site Rexer dựng riêng cho thương hiệu (domain riêng). Theo dõi
          lượt xem & người dùng tổng hợp từ script nhúng.
        </p>
      </section>

      {loading ? (
        <div className='text-content-muted mt-10 flex items-center justify-center gap-2 text-sm'>
          <Loader2 className='size-4 animate-spin' /> Đang tải micro-site…
        </div>
      ) : sites.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className='mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {sites.map(s => (
              <SiteCard
                key={s.id}
                site={s}
                active={selected?.id === s.id}
                onSelect={() => setSelected(s)}
              />
            ))}
          </div>
          {selected && <AnalyticsPanel site={selected} />}
        </>
      )}
    </PortalShell>
  );
}

function SiteCard({
  site,
  active,
  onSelect,
}: {
  site: MicroSite;
  active: boolean;
  onSelect: () => void;
}) {
  const sm = statusMeta(site.status);
  const trendUp = site.views_trend_pct >= 0;
  return (
    <button
      type='button'
      onClick={onSelect}
      className={cn(
        'group border-border rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        active && 'ring-primary border-primary/40 ring-2'
      )}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm'>
          <Globe className='size-5' />
        </div>
        <span
          className={cn(
            'text-3xs rounded-full px-2 py-0.5 font-bold tracking-wider uppercase',
            sm.chip
          )}
        >
          {sm.label}
        </span>
      </div>
      <div className='text-foreground mt-3 text-sm font-semibold'>
        {site.name}
      </div>
      {site.url ? (
        <a
          href={site.url}
          target='_blank'
          rel='noreferrer'
          onClick={e => e.stopPropagation()}
          className='text-3xs text-content-muted hover:text-foreground mt-0.5 inline-flex items-center gap-1 font-mono hover:underline'
        >
          {site.url} <ExternalLink className='size-2.5' />
        </a>
      ) : (
        <span className='text-3xs text-muted-foreground mt-0.5 block font-mono'>
          chưa có URL
        </span>
      )}
      <div className='border-border/60 mt-3 flex items-end justify-between border-t pt-3'>
        <div>
          <div className='text-foreground font-mono text-lg font-bold tabular-nums'>
            {fmtNum(site.views_30d)}
          </div>
          <div className='text-3xs text-muted-foreground'>views 30 ngày</div>
        </div>
        <span
          className={cn(
            'text-2xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold',
            trendUp
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-rose-100 text-rose-700'
          )}
        >
          {trendUp ? (
            <TrendingUp className='size-3' />
          ) : (
            <TrendingDown className='size-3' />
          )}
          {trendUp ? '+' : ''}
          {site.views_trend_pct}%
        </span>
      </div>
    </button>
  );
}

function AnalyticsPanel({ site }: { site: MicroSite }) {
  const [data, setData] = useState<MicroSiteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setData(null);
    rexerApi.microSites
      .analytics(site.id)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [site.id]);

  useEffect(() => load(), [load]);

  return (
    <section className='border-border mt-6 rounded-2xl border bg-white p-5 shadow-sm'>
      <div className='mb-4 flex items-center gap-2'>
        <div className='flex size-7 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-sm'>
          <BarChart3 className='size-4' />
        </div>
        <div>
          <h3 className='text-sm font-semibold'>Analytics — {site.name}</h3>
          <p className='text-2xs text-content-muted'>30 ngày gần nhất</p>
        </div>
        {data?.source && (
          <span
            className={cn(
              'text-3xs ml-auto rounded-full px-2 py-0.5 font-bold',
              data.source === 'ingest'
                ? 'bg-emerald-100 text-emerald-700'
                : data.source === 'manual'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-sky-100 text-sky-700'
            )}
            title='Nguồn dữ liệu: script đo / nhập tay / trộn'
          >
            {data.source === 'ingest'
              ? 'Script đo'
              : data.source === 'manual'
                ? 'Nhập tay'
                : 'Trộn'}
          </span>
        )}
      </div>

      {loading ? (
        <div className='text-content-muted flex items-center justify-center gap-2 py-10 text-sm'>
          <Loader2 className='size-4 animate-spin' /> Đang tải số liệu…
        </div>
      ) : !data ? (
        <div className='text-content-muted py-10 text-center text-sm'>
          Chưa có số liệu cho site này.
        </div>
      ) : (
        <>
          <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
            <Kpi
              icon={Eye}
              label='Lượt xem'
              value={fmtNum(data.summary.views)}
              delta={data.summary.views_delta_pct}
            />
            <Kpi
              icon={Users}
              label='Người dùng'
              value={fmtNum(data.summary.visitors)}
              delta={data.summary.visitors_delta_pct}
            />
            <Kpi
              icon={TrendingUp}
              label='Thời gian TB'
              value={`${data.summary.avg_time_s}s`}
            />
            <Kpi
              icon={TrendingDown}
              label='Bounce'
              value={`${data.summary.bounce_pct.toFixed(1)}%`}
              delta={data.summary.bounce_delta_pct}
              invertDelta
            />
          </div>

          {data.daily.length > 0 && <DailyChart points={data.daily} />}

          <div className='mt-5 grid gap-4 sm:grid-cols-2'>
            <TopList
              title='Trang nhiều view'
              rows={data.top_pages.map(p => ({
                label: p.path,
                value: p.views,
              }))}
            />
            <TopList
              title='Nguồn truy cập'
              rows={data.top_referrers.map(r => ({
                label: r.source,
                value: r.views,
              }))}
            />
          </div>
        </>
      )}
    </section>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  delta,
  invertDelta,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: number;
  invertDelta?: boolean;
}) {
  const good = delta == null ? true : invertDelta ? delta <= 0 : delta >= 0;
  return (
    <div className='border-border rounded-xl border bg-gradient-to-br from-indigo-50/60 to-white p-3 shadow-sm'>
      <div className='flex size-8 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-sm'>
        <Icon className='size-4' />
      </div>
      <div className='text-3xs text-content-muted mt-2 font-semibold tracking-wider uppercase'>
        {label}
      </div>
      <div className='text-foreground mt-0.5 font-mono text-xl font-bold'>
        {value}
      </div>
      {delta != null && (
        <div
          className={cn(
            'text-3xs mt-0.5 font-mono font-semibold',
            good ? 'text-emerald-600' : 'text-rose-600'
          )}
        >
          {delta >= 0 ? '+' : ''}
          {delta}% vs kỳ trước
        </div>
      )}
    </div>
  );
}

function DailyChart({
  points,
}: {
  points: { date: string; views: number; visitors: number }[];
}) {
  const max = Math.max(...points.map(p => p.views), 1);
  return (
    <div className='border-border mt-5 rounded-xl border p-3'>
      <div className='text-3xs text-content-muted mb-2 font-semibold tracking-wider uppercase'>
        Views theo ngày
      </div>
      <div className='flex h-28 items-end gap-0.5'>
        {points.map(p => (
          <div
            key={p.date}
            className='group relative flex flex-1 flex-col items-center'
            title={`${p.date}: ${fmtFull(p.views)} views`}
          >
            <div
              className='w-full rounded-t bg-gradient-to-t from-indigo-500 to-violet-400 transition-all group-hover:from-indigo-600'
              style={{ height: `${(p.views / max) * 100}%`, minHeight: 2 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TopList({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number }[];
}) {
  return (
    <div className='border-border rounded-xl border p-3'>
      <div className='text-3xs text-content-muted mb-2 font-semibold tracking-wider uppercase'>
        {title}
      </div>
      {rows.length === 0 ? (
        <p className='text-2xs text-muted-foreground py-2'>Chưa có dữ liệu.</p>
      ) : (
        <ul className='space-y-1.5'>
          {rows.slice(0, 5).map((r, i) => (
            <li
              key={i}
              className='flex items-center justify-between gap-2 text-xs'
            >
              <span className='text-content-muted truncate font-mono'>
                {r.label}
              </span>
              <span className='text-foreground font-mono font-semibold tabular-nums'>
                {fmtNum(r.value)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className='border-border mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm'>
      <div className='flex flex-col items-center px-8 py-12 text-center'>
        <div className='flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20'>
          <Globe className='size-7' strokeWidth={2.2} />
        </div>
        <p className='text-foreground mt-4 text-base font-semibold'>
          Chưa có micro-site nào
        </p>
        <p className='text-content-muted mt-1.5 max-w-md text-xs leading-relaxed'>
          Đội ngũ Rexer sẽ dựng site riêng và đăng ký vào đây — bạn sẽ thấy lượt
          xem & analytics tổng hợp ngay khi site go-live.
        </p>
      </div>
    </div>
  );
}
