'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, ExternalLink, FileText, Globe } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { MetricCard } from '@/components/molecules/MetricCard';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
  AnalyticsDailyPoint,
  ClientPortalAnalyticsResponse,
  ClientPortalProject,
  ReportLink,
} from '@/services/rexer/types';
import { cn } from '@/lib/cn';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

type RangeKey = '7d' | '30d' | '90d';
const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: '7d', label: '7 days', days: 7 },
  { key: '30d', label: '30 days', days: 30 },
  { key: '90d', label: '90 days', days: 90 },
];

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function rangeBounds(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days + 1);
  return { from: isoDate(from), to: isoDate(to) };
}

function formatNumber(n?: number) {
  if (n == null) return '—';
  return n.toLocaleString();
}
function formatPercent(n?: number) {
  if (n == null) return '—';
  return `${(n * 100).toFixed(1)}%`;
}

function DailyChart({ daily }: { daily: AnalyticsDailyPoint[] }) {
  const max = React.useMemo(
    () => Math.max(1, ...daily.map(d => d.page_views)),
    [daily]
  );
  if (daily.length === 0) {
    return (
      <p className='text-muted-foreground py-8 text-center text-sm'>
        No daily activity yet.
      </p>
    );
  }
  return (
    <div className='flex items-end gap-1 overflow-x-auto pb-2'>
      {daily.map(d => {
        const h = (d.page_views / max) * 100;
        return (
          <div
            key={d.date}
            className='flex min-w-[28px] flex-col items-center gap-1'
          >
            <div className='bg-muted flex h-32 w-6 items-end overflow-hidden rounded-sm'>
              <div
                className='bg-primary/80 w-full'
                style={{ height: `${h}%` }}
                title={`Views: ${d.page_views}`}
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

export default function PortalProjectPage({ params }: PageProps) {
  const { projectId } = use(params);
  const [project, setProject] = React.useState<ClientPortalProject | null>(
    null
  );
  const [analytics, setAnalytics] =
    React.useState<ClientPortalAnalyticsResponse | null>(null);
  const [reports, setReports] = React.useState<ReportLink[]>([]);
  const [range, setRange] = React.useState<RangeKey>('30d');
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(async () => {
    setLoading(true);
    const days = RANGES.find(r => r.key === range)?.days ?? 30;
    const bounds = rangeBounds(days);
    try {
      const [p, a, r] = await Promise.all([
        rexerApi.clientPortal.project(projectId),
        rexerApi.clientPortal.analytics(projectId, bounds),
        rexerApi.clientPortal
          .reports(projectId)
          .then(r => r.items)
          .catch(() => [] as ReportLink[]),
      ]);
      setProject(p);
      setAnalytics(a);
      setReports(r);
    } catch (err) {
      toast.error(`Could not load: ${rxErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [projectId, range]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div className='mx-auto w-full max-w-[1100px] px-8 py-6'>
      <div className='flex items-center gap-2 text-xs'>
        <Link
          href='/portal'
          className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1'
        >
          <ChevronLeft className='size-3.5' /> Overview
        </Link>
      </div>

      <header className='mt-2 mb-4 flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h1 className='text-foreground text-2xl font-semibold tracking-[-0.02em]'>
            {loading && !project ? 'Loading…' : (project?.name ?? 'Project')}
          </h1>
          {project && (
            <p className='text-muted-foreground mt-1 text-xs'>
              {project.template_name} ·{' '}
              {project.page_url ? (
                <Badge variant='secondary' className='gap-1'>
                  <Globe className='size-3' /> Live
                </Badge>
              ) : (
                <Badge variant='outline'>Not published</Badge>
              )}
            </p>
          )}
        </div>
        {project?.page_url && (
          <Button asChild variant='outline' size='sm'>
            <a
              href={project.page_url}
              target='_blank'
              rel='noreferrer noopener'
            >
              <ExternalLink className='size-3.5' /> Open landing
            </a>
          </Button>
        )}
      </header>

      <section className='border-border bg-background mb-4 flex items-center justify-between gap-4 rounded-xl border p-4'>
        <span className='text-muted-foreground text-xs tracking-wide uppercase'>
          Range
        </span>
        <div className='flex items-center gap-1'>
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
      </section>

      <section className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <MetricCard
          label='Page views'
          value={loading ? '—' : formatNumber(analytics?.summary?.page_views)}
        />
        <MetricCard
          label='CTA clicks'
          value={loading ? '—' : formatNumber(analytics?.summary?.cta_clicks)}
        />
        <MetricCard
          label='Conversions'
          value={loading ? '—' : formatNumber(analytics?.summary?.conversions)}
        />
        <MetricCard
          label='CTR'
          value={loading ? '—' : formatPercent(analytics?.summary?.ctr)}
        />
      </section>

      <section className='border-border bg-background mt-4 flex flex-col gap-3 rounded-xl border p-5'>
        <header className='flex items-center justify-between'>
          <h3 className='text-foreground text-base font-semibold'>
            Daily activity
          </h3>
          {loading && <Spinner size={14} />}
        </header>
        {loading ? (
          <div className='text-muted-foreground flex justify-center py-8'>
            <Spinner size={20} />
          </div>
        ) : (
          <DailyChart daily={analytics?.daily ?? []} />
        )}
      </section>

      <section className='border-border bg-background mt-4 flex flex-col gap-3 rounded-xl border p-5'>
        <header className='flex items-center gap-2'>
          <FileText className='text-muted-foreground size-4' />
          <h3 className='text-foreground text-base font-semibold'>Reports</h3>
        </header>
        {reports.length === 0 ? (
          <p className='text-muted-foreground text-sm'>
            No reports shared yet.
          </p>
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
    </div>
  );
}
