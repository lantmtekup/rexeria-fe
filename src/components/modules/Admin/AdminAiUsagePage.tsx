'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  CoinsIcon,
  DownloadIcon,
  RefreshCwIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
} from 'lucide-react';

import { Button } from '@/components/atoms/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import { cn } from '@/lib/cn';
import type {
  AIUsageGlobalResponse,
  AIUsageListResponse,
  AIUsageQuery,
} from '@/services/rexer/types';

type Range = '7d' | '30d' | '90d';

const RANGES: { key: Range; days: number }[] = [
  { key: '7d', days: 7 },
  { key: '30d', days: 30 },
  { key: '90d', days: 90 },
];

const formatCost = (n: number) =>
  n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

const formatNum = (n: number) => n.toLocaleString('en-US');

function rangeToISO(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function AdminAiUsagePage() {
  const t = useTranslations('admin');
  const tErrors = useTranslations('errors');

  const [range, setRange] = React.useState<Range>('30d');
  const [summary, setSummary] = React.useState<AIUsageGlobalResponse | null>(
    null
  );
  const [recent, setRecent] = React.useState<AIUsageListResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState(false);

  const buildQuery = React.useCallback((): AIUsageQuery => {
    const days = RANGES.find(r => r.key === range)?.days ?? 30;
    return { ...rangeToISO(days), group_by: 'day' };
  }, [range]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = buildQuery();
      const [g, l] = await Promise.all([
        rexerApi.adminAiUsage.globalSummary(q),
        rexerApi.adminAiUsage.list({ ...q, page: 1, limit: 20 }),
      ]);
      setSummary(g);
      setRecent(l);
    } catch (err) {
      const code =
        err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED';
      setError(code);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await rexerApi.adminAiUsage.exportCsv({
        ...buildQuery(),
        limit: 10_000,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-usage-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const code =
        err instanceof RxApiError
          ? err.code || err.message
          : 'CLIENT_UPLOAD_FAILED';
      setError(code);
    } finally {
      setExporting(false);
    }
  };

  const errorMessage = error
    ? (() => {
        try {
          return (tErrors as (key: string) => string)(error);
        } catch {
          return error;
        }
      })()
    : null;

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('aiUsage.title')}
          </h1>
          <p className='text-content-muted text-sm'>{t('aiUsage.subtitle')}</p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='border-border flex items-center gap-1 rounded-md border bg-white p-1 text-xs'>
            {RANGES.map(r => (
              <button
                key={r.key}
                type='button'
                onClick={() => setRange(r.key)}
                className={cn(
                  'rounded px-2.5 py-1 transition',
                  range === r.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-content-muted hover:bg-muted'
                )}
              >
                {t(`aiUsage.range.${r.key}`)}
              </button>
            ))}
          </div>
          <Button variant='outline' onClick={load} disabled={loading}>
            <RefreshCwIcon
              className={cn('size-4', loading && 'animate-spin')}
            />
            {t('refresh')}
          </Button>
          <Button
            variant='primary'
            onClick={handleExport}
            disabled={exporting || !summary}
          >
            <DownloadIcon className='size-4' />
            {exporting ? t('aiUsage.exporting') : t('aiUsage.exportCsv')}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <p className='text-destructive text-sm' role='alert'>
          {errorMessage}
        </p>
      )}

      {/* Summary stat cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          icon={<SparklesIcon className='size-5' />}
          accent='bg-blue-50 text-blue-700'
          label={t('aiUsage.stat.requests')}
          value={summary ? formatNum(summary.summary.total_requests) : '…'}
        />
        <StatCard
          icon={<TrendingUpIcon className='size-5' />}
          accent='bg-purple-50 text-purple-700'
          label={t('aiUsage.stat.tokens')}
          value={summary ? formatNum(summary.summary.total_tokens) : '…'}
        />
        <StatCard
          icon={<CoinsIcon className='size-5' />}
          accent='bg-emerald-50 text-emerald-700'
          label={t('aiUsage.stat.cost')}
          value={summary ? formatCost(summary.summary.cost_usd) : '…'}
        />
        <StatCard
          icon={<UsersIcon className='size-5' />}
          accent='bg-amber-50 text-amber-700'
          label={t('aiUsage.stat.activeUsers')}
          value={summary ? `${summary.top_users.length}` : '…'}
        />
      </div>

      {/* Time series sparkline */}
      <SeriesCard data={summary?.series ?? []} />

      {/* Top users + features grid */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <Card title={t('aiUsage.topUsers')}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('aiUsage.col.user')}</TableHead>
                <TableHead className='w-24 text-right'>
                  {t('aiUsage.col.requests')}
                </TableHead>
                <TableHead className='w-28 text-right'>
                  {t('aiUsage.col.tokens')}
                </TableHead>
                <TableHead className='w-24 text-right'>
                  {t('aiUsage.col.cost')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(summary?.top_users ?? []).slice(0, 10).map(u => (
                <TableRow key={u.user_id}>
                  <TableCell>
                    <div className='truncate text-sm'>
                      {u.user_email || u.user_id}
                    </div>
                  </TableCell>
                  <TableCell className='text-right text-xs'>
                    {formatNum(u.requests)}
                  </TableCell>
                  <TableCell className='text-right text-xs'>
                    {formatNum(u.total_tokens)}
                  </TableCell>
                  <TableCell className='text-right text-xs font-medium'>
                    {formatCost(u.cost_usd)}
                  </TableCell>
                </TableRow>
              ))}
              {summary && summary.top_users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className='text-content-muted py-6 text-center text-xs'
                  >
                    {t('aiUsage.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <Card title={t('aiUsage.topFeatures')}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('aiUsage.col.feature')}</TableHead>
                <TableHead className='w-24 text-right'>
                  {t('aiUsage.col.requests')}
                </TableHead>
                <TableHead className='w-28 text-right'>
                  {t('aiUsage.col.tokens')}
                </TableHead>
                <TableHead className='w-24 text-right'>
                  {t('aiUsage.col.cost')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(summary?.top_features ?? []).slice(0, 10).map(f => (
                <TableRow key={f.feature}>
                  <TableCell className='text-sm'>
                    {t(`aiUsage.feature.${f.feature}`)}
                  </TableCell>
                  <TableCell className='text-right text-xs'>
                    {formatNum(f.requests)}
                  </TableCell>
                  <TableCell className='text-right text-xs'>
                    {formatNum(f.total_tokens)}
                  </TableCell>
                  <TableCell className='text-right text-xs font-medium'>
                    {formatCost(f.cost_usd)}
                  </TableCell>
                </TableRow>
              ))}
              {summary && summary.top_features.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className='text-content-muted py-6 text-center text-xs'
                  >
                    {t('aiUsage.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Recent requests */}
      <Card title={t('aiUsage.recent')}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-40'>{t('aiUsage.col.created')}</TableHead>
              <TableHead>{t('aiUsage.col.feature')}</TableHead>
              <TableHead>{t('aiUsage.col.model')}</TableHead>
              <TableHead className='w-28 text-right'>
                {t('aiUsage.col.tokens')}
              </TableHead>
              <TableHead className='w-24 text-right'>
                {t('aiUsage.col.cost')}
              </TableHead>
              <TableHead className='w-24'>{t('aiUsage.col.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(recent?.items ?? []).map(item => (
              <TableRow key={item.id}>
                <TableCell className='text-xs'>
                  {new Date(item.created_at).toLocaleString()}
                </TableCell>
                <TableCell className='text-sm'>
                  {t(`aiUsage.feature.${item.feature}`)}
                </TableCell>
                <TableCell className='font-mono text-xs'>
                  {item.model}
                </TableCell>
                <TableCell className='text-right text-xs'>
                  {formatNum(item.total_tokens)}
                </TableCell>
                <TableCell className='text-right text-xs'>
                  {formatCost(item.cost_usd)}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs',
                      item.status === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'timeout'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                    )}
                  >
                    {t(`aiUsage.status.${item.status}`)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {recent && recent.items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='text-content-muted py-6 text-center text-xs'
                >
                  {t('aiUsage.empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  accent,
  label,
  value,
}: {
  icon: React.ReactNode;
  accent: string;
  label: string;
  value: string;
}) {
  return (
    <div className='border-border flex flex-col gap-3 rounded-lg border bg-white p-4'>
      <div
        className={cn(
          'flex size-9 items-center justify-center rounded-md',
          accent
        )}
      >
        {icon}
      </div>
      <div className='text-3xl font-semibold tracking-tight'>{value}</div>
      <span className='text-content-muted text-sm'>{label}</span>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className='border-border rounded-lg border bg-white'>
      <div className='border-border border-b px-4 py-2.5 text-sm font-semibold'>
        {title}
      </div>
      {children}
    </div>
  );
}

/** Lightweight inline SVG sparkline — avoids pulling a chart lib into the bundle. */
function SeriesCard({
  data,
}: {
  data: { bucket: string; cost_usd: number; requests: number }[];
}) {
  const t = useTranslations('admin');
  if (data.length === 0) {
    return (
      <div className='border-border flex h-32 items-center justify-center rounded-lg border bg-white'>
        <p className='text-content-muted text-xs'>{t('aiUsage.empty')}</p>
      </div>
    );
  }

  const w = 800;
  const h = 100;
  const pad = 8;
  const maxCost = Math.max(...data.map(d => d.cost_usd), 0.0001);
  const stepX = (w - pad * 2) / Math.max(data.length - 1, 1);
  const points = data
    .map((d, i) => {
      const x = pad + i * stepX;
      const y = h - pad - (d.cost_usd / maxCost) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className='border-border rounded-lg border bg-white p-4'>
      <div className='flex items-center justify-between'>
        <div className='text-sm font-semibold'>{t('aiUsage.costOverTime')}</div>
        <div className='text-content-muted text-xs'>
          {data[0]?.bucket} → {data[data.length - 1]?.bucket}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className='mt-3 h-24 w-full'
        preserveAspectRatio='none'
      >
        <polyline
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          points={points}
          className='text-primary'
        />
      </svg>
    </div>
  );
}
