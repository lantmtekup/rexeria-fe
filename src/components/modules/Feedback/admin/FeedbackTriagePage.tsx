'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { DownloadIcon, RefreshCwIcon, SearchIcon } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
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
  AdminFeedbackQuery,
  Feedback,
  FeedbackCategory,
  FeedbackSeverity,
  FeedbackStatus,
} from '@/services/rexer/types';

import { FeedbackTriageDrawer } from './FeedbackTriageDrawer';

const STATUSES: FeedbackStatus[] = [
  'new',
  'triaged',
  'in_progress',
  'resolved',
  'wontfix',
];
const CATEGORIES: FeedbackCategory[] = [
  'bug',
  'improvement',
  'question',
  'praise',
  'other',
];
const SEVERITIES: FeedbackSeverity[] = ['low', 'medium', 'high', 'critical'];

const PAGE_SIZE = 20;

type FilterState = {
  status?: FeedbackStatus;
  category?: FeedbackCategory;
  severity?: FeedbackSeverity;
  q?: string;
};

const STATUS_BADGE: Record<FeedbackStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  triaged: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-amber-100 text-amber-800',
  resolved: 'bg-green-100 text-green-800',
  wontfix: 'bg-neutral-200 text-neutral-700',
};

const SEVERITY_BADGE: Record<FeedbackSeverity, string> = {
  low: 'bg-neutral-100 text-neutral-700',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-amber-100 text-amber-800',
  critical: 'bg-red-100 text-red-800',
};

export function FeedbackTriagePage() {
  const t = useTranslations('feedback');
  const tErrors = useTranslations('errors');

  const [filters, setFilters] = React.useState<FilterState>({});
  const [searchInput, setSearchInput] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [items, setItems] = React.useState<Feedback[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [selected, setSelected] = React.useState<Feedback | null>(null);

  const buildQuery = React.useCallback(
    (overrides?: Partial<AdminFeedbackQuery>): AdminFeedbackQuery => ({
      ...filters,
      page,
      limit: PAGE_SIZE,
      sort: '-created_at',
      ...overrides,
    }),
    [filters, page]
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rexerApi.adminFeedback.list(buildQuery());
      setItems(res.items);
      setTotal(res.total);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, q: searchInput.trim() || undefined }));
    setPage(1);
  };

  const toggleFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
    setPage(1);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await rexerApi.adminFeedback.exportCsv(buildQuery());
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feedback-${new Date().toISOString().slice(0, 10)}.csv`;
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('admin.title')}
          </h1>
          <p className='text-content-muted text-sm'>
            {t('admin.subtitle', { total })}
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={load}
            disabled={loading}
            aria-label={t('admin.refresh')}
          >
            <RefreshCwIcon
              className={cn('size-4', loading && 'animate-spin')}
            />
            {t('admin.refresh')}
          </Button>
          <Button
            variant='primary'
            onClick={handleExport}
            disabled={exporting || items.length === 0}
          >
            <DownloadIcon className='size-4' />
            {exporting ? t('admin.exporting') : t('admin.exportCsv')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className='border-border flex flex-col gap-3 rounded-lg border bg-neutral-50 p-3'>
        <form onSubmit={handleSearch} className='flex gap-2'>
          <div className='relative flex-1'>
            <SearchIcon className='text-content-muted absolute top-1/2 left-3 size-4 -translate-y-1/2' />
            <Input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder={t('admin.searchPlaceholder')}
              className='pl-9'
            />
          </div>
          <Button type='submit' variant='outline'>
            {t('admin.search')}
          </Button>
        </form>

        <FilterGroup
          label={t('admin.filterStatus')}
          options={STATUSES}
          active={filters.status}
          onToggle={v => toggleFilter('status', v)}
          renderLabel={v => t(`admin.status.${v}`)}
        />
        <FilterGroup
          label={t('admin.filterCategory')}
          options={CATEGORIES}
          active={filters.category}
          onToggle={v => toggleFilter('category', v)}
          renderLabel={v => t(`category.${v}`)}
        />
        <FilterGroup
          label={t('admin.filterSeverity')}
          options={SEVERITIES}
          active={filters.severity}
          onToggle={v => toggleFilter('severity', v)}
          renderLabel={v => t(`severity.${v}`)}
        />
      </div>

      {errorMessage && (
        <p className='text-destructive text-sm' role='alert'>
          {errorMessage}
        </p>
      )}

      {/* Table */}
      <div className='border-border rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-32'>{t('admin.col.created')}</TableHead>
              <TableHead className='w-28'>{t('admin.col.category')}</TableHead>
              <TableHead className='w-24'>{t('admin.col.severity')}</TableHead>
              <TableHead>{t('admin.col.message')}</TableHead>
              <TableHead className='w-28'>{t('admin.col.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && !loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-content-muted py-8 text-center'
                >
                  {t('admin.empty')}
                </TableCell>
              </TableRow>
            ) : (
              items.map(item => (
                <TableRow
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className='cursor-pointer'
                >
                  <TableCell className='text-xs'>
                    {new Date(item.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className='rounded-full bg-neutral-100 px-2 py-0.5 text-xs'>
                      {t(`category.${item.category}`)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.severity ? (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs',
                          SEVERITY_BADGE[item.severity]
                        )}
                      >
                        {t(`severity.${item.severity}`)}
                      </span>
                    ) : (
                      <span className='text-content-muted text-xs'>—</span>
                    )}
                  </TableCell>
                  <TableCell className='max-w-md'>
                    <div className='truncate text-sm font-medium'>
                      {item.title || item.message.slice(0, 80)}
                    </div>
                    <div className='text-content-muted truncate text-xs'>
                      {item.page_url}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs',
                        STATUS_BADGE[item.status]
                      )}
                    >
                      {t(`admin.status.${item.status}`)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className='flex items-center justify-between text-sm'>
          <span className='text-content-muted'>
            {t('admin.pageOf', { page, total: totalPages })}
          </span>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              {t('admin.prev')}
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              {t('admin.next')}
            </Button>
          </div>
        </div>
      )}

      <FeedbackTriageDrawer
        feedback={selected}
        onClose={() => setSelected(null)}
        onUpdated={updated => {
          setItems(prev =>
            prev.map(it => (it.id === updated.id ? updated : it))
          );
          setSelected(updated);
        }}
      />
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  active,
  onToggle,
  renderLabel,
}: {
  label: string;
  options: readonly T[];
  active: T | undefined;
  onToggle: (v: T) => void;
  renderLabel: (v: T) => string;
}) {
  return (
    <div className='flex items-center gap-2'>
      <span className='text-foreground w-24 shrink-0 text-xs font-medium'>
        {label}
      </span>
      <div className='flex flex-wrap gap-1.5'>
        {options.map(v => (
          <button
            key={v}
            type='button'
            onClick={() => onToggle(v)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs transition',
              active === v
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-neutral-100'
            )}
          >
            {renderLabel(v)}
          </button>
        ))}
      </div>
    </div>
  );
}
