'use client';

import * as React from 'react';
import {
  Activity,
  CalendarRange,
  ExternalLink,
  FileText,
  MousePointerClick,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { MetricCard } from '@/components/molecules/MetricCard';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
  AnalyticsDailyPoint,
  EventSummaryResponse,
  ProjectAnalyticsResponse,
  ReportLink,
} from '@/services/rexer/types';
import { cn } from '@/lib/cn';

interface AnalyticsWorkspaceProps {
  projectId: string;
}

type RangeKey = '7d' | '30d' | '90d';

const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: '90d', label: 'Last 90 days', days: 90 },
];

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function rangeBounds(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days + 1);
  return { from: isoDate(from), to: isoDate(to) };
}

function formatNumber(n: number | undefined): string {
  if (n == null || Number.isNaN(n)) return '—';
  if (Math.abs(n) >= 1000) return n.toLocaleString();
  return String(n);
}

function formatPercent(n: number | undefined): string {
  if (n == null || Number.isNaN(n)) return '—';
  return `${(n * 100).toFixed(1)}%`;
}

function DailyChart({ daily }: { daily: AnalyticsDailyPoint[] }) {
  const max = React.useMemo(
    () =>
      Math.max(
        1,
        ...daily.map(d => Math.max(d.page_views, d.cta_clicks, d.conversions))
      ),
    [daily]
  );
  if (daily.length === 0) {
    return (
      <p className='text-muted-foreground py-12 text-center text-sm'>
        No daily activity in this range yet.
      </p>
    );
  }
  return (
    <div className='flex items-end gap-1 overflow-x-auto pb-2'>
      {daily.map(d => {
        const pv = (d.page_views / max) * 100;
        const cc = (d.cta_clicks / max) * 100;
        const cv = (d.conversions / max) * 100;
        return (
          <div
            key={d.date}
            className='flex min-w-[28px] flex-col items-center gap-1'
          >
            <div className='bg-muted relative flex h-32 w-6 items-end overflow-hidden rounded-sm'>
              <div
                className='bg-primary/80 absolute inset-x-0 bottom-0 transition-all'
                style={{ height: `${pv}%` }}
                title={`Views: ${d.page_views}`}
              />
              <div
                className='absolute inset-x-0 bottom-0 bg-amber-500/70'
                style={{ height: `${cc}%`, width: '60%', left: '20%' }}
                title={`Clicks: ${d.cta_clicks}`}
              />
              <div
                className='absolute inset-x-0 bottom-0 bg-emerald-500'
                style={{ height: `${cv}%`, width: '30%', left: '35%' }}
                title={`Conversions: ${d.conversions}`}
              />
            </div>
            <span className='text-muted-foreground text-[9px]'>
              {d.date.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function EventBreakdown({ data }: { data: EventSummaryResponse | null }) {
  const entries = Object.entries(data?.event_counts ?? {});
  if (entries.length === 0) {
    return (
      <p className='text-muted-foreground py-6 text-center text-sm'>
        No events in this range.
      </p>
    );
  }
  const total = entries.reduce((acc, [, n]) => acc + n, 0) || 1;
  return (
    <ul className='flex flex-col divide-y divide-neutral-100'>
      {entries
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => {
          const pct = (count / total) * 100;
          return (
            <li
              key={type}
              className='flex items-center justify-between gap-3 py-2'
            >
              <div className='flex min-w-0 items-center gap-2'>
                <span className='bg-primary/10 text-primary inline-flex size-6 items-center justify-center rounded-md'>
                  <Activity className='size-3' />
                </span>
                <span className='text-foreground truncate text-sm'>
                  {type.replace(/_/g, ' ')}
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <span className='text-muted-foreground text-xs'>
                  {pct.toFixed(0)}%
                </span>
                <span className='text-foreground text-sm font-semibold'>
                  {formatNumber(count)}
                </span>
              </div>
            </li>
          );
        })}
    </ul>
  );
}

function ReportsCard({
  reports,
  loading,
}: {
  reports: ReportLink[];
  loading: boolean;
}) {
  return (
    <section className='border-border bg-background flex flex-col gap-3 rounded-xl border p-5'>
      <header className='flex items-center justify-between'>
        <h3 className='text-foreground text-base font-semibold'>Reports</h3>
        {loading && <Spinner size={14} />}
      </header>
      {!loading && reports.length === 0 ? (
        <p className='text-muted-foreground text-sm'>No reports yet.</p>
      ) : (
        <ul className='flex flex-col divide-y divide-neutral-100'>
          {reports.map(r => (
            <li
              key={r.id}
              className='flex items-center justify-between gap-3 py-2'
            >
              <div className='min-w-0'>
                <p className='text-foreground truncate text-sm font-medium'>
                  {r.title || r.type}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {r.type} · {new Date(r.generated_at).toLocaleDateString()}
                </p>
              </div>
              <Button asChild variant='ghost' size='sm'>
                <a href={r.url} target='_blank' rel='noreferrer noopener'>
                  <ExternalLink className='size-3.5' /> Open
                </a>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AnalyticsWorkspace({ projectId }: AnalyticsWorkspaceProps) {
  const [range, setRange] = React.useState<RangeKey>('30d');
  const [analytics, setAnalytics] =
    React.useState<ProjectAnalyticsResponse | null>(null);
  const [events, setEvents] = React.useState<EventSummaryResponse | null>(null);
  const [reports, setReports] = React.useState<ReportLink[]>([]);
  const [loadingMetrics, setLoadingMetrics] = React.useState(true);
  const [loadingReports, setLoadingReports] = React.useState(true);

  const reload = React.useCallback(async () => {
    const days = RANGES.find(r => r.key === range)?.days ?? 30;
    const bounds = rangeBounds(days);
    setLoadingMetrics(true);
    try {
      const [a, e] = await Promise.all([
        rexerApi.projects.analytics(projectId, bounds),
        rexerApi.projects.eventsSummary(projectId, bounds).catch(() => null),
      ]);
      setAnalytics(a);
      setEvents(e);
    } catch (err) {
      toast.error(`Failed to load analytics: ${rxErrorMessage(err)}`);
    } finally {
      setLoadingMetrics(false);
    }
  }, [projectId, range]);

  const loadReports = React.useCallback(async () => {
    setLoadingReports(true);
    try {
      const r = await rexerApi.projects.reports(projectId);
      setReports(r.items);
    } catch {
      // Reports endpoint may not be populated; silent fallback.
      setReports([]);
    } finally {
      setLoadingReports(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  const summary = analytics?.summary;

  return (
    <div className='mx-auto flex w-full max-w-[1100px] flex-col gap-5 px-6 pb-10'>
      <section className='border-border bg-background flex items-center justify-between gap-4 rounded-xl border p-4'>
        <div className='flex items-center gap-2'>
          <CalendarRange className='text-muted-foreground size-4' />
          <span className='text-muted-foreground text-xs tracking-wide uppercase'>
            Range
          </span>
          <div className='ml-2 flex items-center gap-1'>
            {RANGES.map(r => (
              <button
                key={r.key}
                type='button'
                onClick={() => setRange(r.key)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  range === r.key
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <Button
          variant='ghost'
          size='sm'
          onClick={reload}
          disabled={loadingMetrics}
        >
          <RefreshCw
            className={cn('size-3.5', loadingMetrics && 'animate-spin')}
          />
          Refresh
        </Button>
      </section>

      <section className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <MetricCard
          label='Page views'
          value={loadingMetrics ? '—' : formatNumber(summary?.page_views)}
          hint={
            <span className='inline-flex items-center gap-1'>
              <TrendingUp className='size-3' /> total
            </span>
          }
        />
        <MetricCard
          label='CTA clicks'
          value={loadingMetrics ? '—' : formatNumber(summary?.cta_clicks)}
          hint={
            <span className='inline-flex items-center gap-1'>
              <MousePointerClick className='size-3' /> total
            </span>
          }
        />
        <MetricCard
          label='Conversions'
          value={loadingMetrics ? '—' : formatNumber(summary?.conversions)}
          hint='completed actions'
        />
        <MetricCard
          label='CTR'
          value={loadingMetrics ? '—' : formatPercent(summary?.ctr)}
          hint='clicks ÷ views'
        />
      </section>

      <section className='border-border bg-background flex flex-col gap-3 rounded-xl border p-5'>
        <header className='flex items-center justify-between'>
          <h3 className='text-foreground text-base font-semibold'>
            Daily activity
          </h3>
          <div className='text-muted-foreground flex items-center gap-3 text-xs'>
            <span className='inline-flex items-center gap-1'>
              <span className='bg-primary/80 inline-block size-2 rounded-sm' />
              Views
            </span>
            <span className='inline-flex items-center gap-1'>
              <span className='inline-block size-2 rounded-sm bg-amber-500/70' />
              Clicks
            </span>
            <span className='inline-flex items-center gap-1'>
              <span className='inline-block size-2 rounded-sm bg-emerald-500' />
              Conversions
            </span>
          </div>
        </header>
        {loadingMetrics ? (
          <div className='text-muted-foreground flex justify-center py-12'>
            <Spinner size={20} />
          </div>
        ) : (
          <DailyChart daily={analytics?.daily ?? []} />
        )}
      </section>

      <div className='grid grid-cols-1 gap-5 lg:grid-cols-2'>
        <section className='border-border bg-background flex flex-col gap-3 rounded-xl border p-5'>
          <header className='flex items-center gap-2'>
            <FileText className='text-muted-foreground size-4' />
            <h3 className='text-foreground text-base font-semibold'>
              Event types
            </h3>
          </header>
          {loadingMetrics ? (
            <div className='text-muted-foreground flex justify-center py-6'>
              <Spinner size={16} />
            </div>
          ) : (
            <EventBreakdown data={events} />
          )}
        </section>
        <ReportsCard reports={reports} loading={loadingReports} />
      </div>
    </div>
  );
}

export { AnalyticsWorkspace };
