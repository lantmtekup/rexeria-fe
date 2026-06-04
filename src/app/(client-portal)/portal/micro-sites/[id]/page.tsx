'use client';

import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Gauge,
  Globe,
  MousePointerClick,
  Timer,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

import { cn } from '@/lib/cn';

import { fmtNum } from '../../_data';
import { PortalShell } from '../../_shell';
import { FAKE_MICROSITES, STATUS_META, fakeMicroSiteAnalytics } from '../_data';

function fmtDuration(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}m${String(s % 60).padStart(2, '0')}s`;
}

export default function MicroSiteAnalyticsPage() {
  const params = useParams();
  const id = String(params?.id ?? '');
  const site = useMemo(() => FAKE_MICROSITES.find(s => s.id === id), [id]);
  const a = useMemo(() => (site ? fakeMicroSiteAnalytics(site) : null), [site]);

  if (!site || !a) {
    return (
      <PortalShell>
        <BackLink />
        <div className='border-border text-content-muted mt-6 rounded-2xl border border-dashed bg-white p-12 text-center text-sm'>
          Không tìm thấy micro site.
        </div>
      </PortalShell>
    );
  }

  const meta = STATUS_META[site.status];
  const maxDaily = Math.max(...a.daily, 1);

  return (
    <PortalShell>
      <BackLink />

      {/* Header */}
      <section className='mt-4 flex flex-wrap items-end justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-bold tracking-tight'>{site.name}</h1>
            <span
              className={cn(
                'text-3xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold',
                meta.chip
              )}
            >
              <span className={cn('size-1.5 rounded-full', meta.dot)} />
              {meta.label}
            </span>
          </div>
          {site.url ? (
            <a
              href={site.url}
              target='_blank'
              rel='noreferrer'
              className='text-content-muted hover:text-primary mt-1 inline-flex items-center gap-1 font-mono text-xs'
            >
              <Globe className='size-3' />
              {site.url.replace(/^https?:\/\//, '')}
            </a>
          ) : (
            <span className='text-content-muted mt-1 inline-block text-xs'>
              chưa có URL
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <span className='border-border text-content-muted rounded-lg border bg-white px-3 py-1.5 text-xs'>
            30 ngày qua
          </span>
          {site.url && (
            <a
              href={site.url}
              target='_blank'
              rel='noreferrer'
              className='bg-foreground hover:bg-foreground/85 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white'
            >
              <ExternalLink className='size-3.5' /> Mở site
            </a>
          )}
        </div>
      </section>

      <div className='mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-800'>
        <span className='mt-0.5 inline-block size-2 shrink-0 rounded-full bg-amber-500' />
        Demo data — sẽ thay bằng analytics thật khi BE track site qua
        micro_site_id.
      </div>

      {/* KPI */}
      <section className='mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <Kpi
          icon={<Eye className='size-4' />}
          label='Lượt xem'
          value={fmtNum(a.views_30d)}
          delta={a.views_pct}
          accent='blue'
        />
        <Kpi
          icon={<Users className='size-4' />}
          label='Khách (unique)'
          value={fmtNum(a.visitors_30d)}
          delta={a.visitors_pct}
          accent='emerald'
        />
        <Kpi
          icon={<Timer className='size-4' />}
          label='Thời gian TB'
          value={fmtDuration(a.avg_time_s)}
          accent='violet'
        />
        <Kpi
          icon={<Gauge className='size-4' />}
          label='Bounce rate'
          value={`${a.bounce_pct}%`}
          delta={a.bounce_pct_delta}
          invertDelta
          accent='amber'
        />
      </section>

      {/* Daily chart */}
      <section className='border-border mt-4 rounded-2xl border bg-white p-4 shadow-sm'>
        <div className='text-2xs text-content-muted flex items-center gap-1.5 font-semibold tracking-wider uppercase'>
          <MousePointerClick className='size-3' /> Lượt xem theo ngày
        </div>
        <div className='mt-3 flex h-32 items-end gap-1'>
          {a.daily.map((v, i) => (
            <div
              key={i}
              title={`Ngày ${i + 1}: ${fmtNum(v)} views`}
              className='from-primary/70 to-primary hover:from-primary hover:to-primary-dark flex-1 rounded-t bg-gradient-to-t transition-colors'
              style={{ height: `${(v / maxDaily) * 100}%` }}
            />
          ))}
        </div>
        <div className='text-3xs text-content-muted mt-1.5 flex justify-between'>
          <span>30 ngày trước</span>
          <span>Hôm nay</span>
        </div>
      </section>

      {/* Breakdowns */}
      <section className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3'>
        <BreakdownPanel title='Top trang'>
          {a.top_pages.map(p => (
            <BarRow
              key={p.path}
              label={p.path}
              value={fmtNum(p.views)}
              pct={(p.views / a.top_pages[0].views) * 100}
            />
          ))}
        </BreakdownPanel>
        <BreakdownPanel title='Nguồn traffic'>
          {a.sources.map(s => (
            <BarRow
              key={s.name}
              label={s.name}
              value={`${s.pct}%`}
              pct={s.pct}
            />
          ))}
        </BreakdownPanel>
        <BreakdownPanel title='Thiết bị'>
          {a.devices.map(d => (
            <BarRow
              key={d.name}
              label={d.name}
              value={`${d.pct}%`}
              pct={d.pct}
            />
          ))}
        </BreakdownPanel>
      </section>
    </PortalShell>
  );
}

function BackLink() {
  return (
    <Link
      href='/portal/micro-sites'
      className='group border-border text-content-muted hover:border-foreground hover:text-foreground inline-flex items-center gap-2 self-start rounded-full border bg-white px-3 py-1.5 text-xs font-medium shadow-sm transition-all'
    >
      <ArrowLeft className='size-3.5 transition-transform group-hover:-translate-x-0.5' />
      Micro sites
    </Link>
  );
}

const KPI_ACCENT: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
};

function Kpi({
  icon,
  label,
  value,
  delta,
  invertDelta,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: number;
  invertDelta?: boolean;
  accent: keyof typeof KPI_ACCENT | string;
}) {
  const good = delta == null ? null : invertDelta ? delta <= 0 : delta >= 0;
  return (
    <div className='border-border rounded-2xl border bg-white p-4 shadow-sm'>
      <div className='flex items-center justify-between'>
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-lg',
            KPI_ACCENT[accent] ?? KPI_ACCENT.blue
          )}
        >
          {icon}
        </span>
        {delta != null && (
          <span
            className={cn(
              'text-3xs font-semibold',
              good ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {delta > 0 ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>
      <div className='mt-2 font-mono text-xl font-bold tabular-nums'>
        {value}
      </div>
      <div className='text-2xs text-content-muted mt-0.5'>{label}</div>
    </div>
  );
}

function BreakdownPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className='border-border rounded-2xl border bg-white p-4 shadow-sm'>
      <div className='text-2xs text-content-muted mb-3 font-semibold tracking-wider uppercase'>
        {title}
      </div>
      <div className='space-y-2.5'>{children}</div>
    </div>
  );
}

function BarRow({
  label,
  value,
  pct,
}: {
  label: string;
  value: string;
  pct: number;
}) {
  return (
    <div>
      <div className='flex items-center justify-between text-xs'>
        <span className='text-foreground truncate font-mono'>{label}</span>
        <span className='text-content-muted ml-2 shrink-0 font-semibold'>
          {value}
        </span>
      </div>
      <div className='bg-muted mt-1 h-1.5 overflow-hidden rounded-full'>
        <div
          className='bg-primary h-full rounded-full'
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  );
}
