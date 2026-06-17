'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Check,
  Clock,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { rexerApi } from '@/services/rexer/endpoints';
import type {
  ExperienceGoal,
  InsightReport,
  InsightStatus,
} from '@/services/rexer/types';
import { Chip } from '@/components/atoms/chip';
import { cn } from '@/lib/cn';
import { AiOrb } from './steps/ui';

/**
 * Danh sách báo cáo AI-Insights của brand (wire `rexerApi.insights.list`). Tái dùng
 * layout list portal (header + filter + lưới card) cho đồng bộ. Click 1 báo cáo →
 * trang chi tiết `${basePath}/[id]`; nút "Tạo phân tích mới" → `${basePath}/new`.
 *
 * `basePath` để link đúng theo ngữ cảnh: `/portal/insights` hoặc `/admin/insights`.
 */
const STATUS_META: Record<InsightStatus, { chip: string; icon: typeof Check }> =
  {
    queued: { chip: 'bg-amber-100 text-amber-700', icon: Clock },
    running: { chip: 'bg-primary/10 text-primary', icon: Loader2 },
    succeeded: { chip: 'bg-emerald-100 text-emerald-700', icon: Check },
    failed: { chip: 'bg-danger-bg text-danger', icon: X },
  };

export function InsightsList({ basePath }: { basePath: string }) {
  const t = useTranslations('insights');

  const [items, setItems] = useState<InsightReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | InsightStatus>('all');

  useEffect(() => {
    let cancelled = false;
    rexerApi.insights
      .list()
      .then(r => !cancelled && setItems(r.items ?? []))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const goalLabel = (g: ExperienceGoal) => {
    const key = `goals.${g}`;
    const label = t(key);
    return label === key ? g : label;
  };
  const statusLabel = (s: InsightStatus) => {
    const key = `status.${s}`;
    const label = t(key);
    return label === key ? s : label;
  };

  const handleRename = async (r: InsightReport) => {
    const next = window.prompt(t('list.renamePrompt'), r.title ?? '');
    if (next == null) return;
    const title = next.trim();
    if (!title || title === r.title) return;
    try {
      const updated = await rexerApi.insights.update(r.id, { title });
      setItems(prev =>
        prev.map(x => (x.id === r.id ? { ...x, title: updated.title } : x))
      );
      toast.success(t('list.renamed'));
    } catch {
      toast.error(t('list.renameFailed'));
    }
  };

  const handleDelete = async (r: InsightReport) => {
    if (
      !window.confirm(
        t('list.deleteConfirm', { name: r.title || t('list.untitled') })
      )
    )
      return;
    try {
      await rexerApi.insights.remove(r.id);
      setItems(prev => prev.filter(x => x.id !== r.id));
      toast.success(t('list.deleted'));
    } catch {
      toast.error(t('list.deleteFailed'));
    }
  };

  const filtered = items.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (q && !(r.title ?? '').toLowerCase().includes(q.toLowerCase()))
      return false;
    return true;
  });

  const FILTERS: Array<'all' | InsightStatus> = [
    'all',
    'succeeded',
    'running',
    'queued',
    'failed',
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <AiOrb size={48} />
          <div className='min-w-0 space-y-0.5'>
            <h1 className='text-content-main truncate text-2xl font-semibold tracking-tight'>
              {t('title')}
            </h1>
            <p className='text-content-muted text-sm'>{t('list.subtitle')}</p>
          </div>
        </div>
        <Link
          href={`${basePath}/new`}
          className='bg-primary hover:bg-primary-dark inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition'
        >
          <Plus className='size-4' aria-hidden /> {t('list.new')}
        </Link>
      </header>

      {/* Filter */}
      <div className='border-border bg-card flex flex-wrap items-center gap-3 rounded-2xl border p-3 shadow-sm'>
        <div className='border-border bg-muted flex flex-1 items-center gap-2 rounded-lg border px-3 py-1.5 lg:max-w-sm'>
          <Search className='text-content-muted size-3.5' aria-hidden />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={t('list.searchPh')}
            className='placeholder:text-content-muted flex-1 bg-transparent text-sm outline-none'
          />
        </div>
        <div className='flex flex-wrap items-center gap-1'>
          {FILTERS.map(f => (
            <Chip
              key={f}
              size='sm'
              selected={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? t('list.statusAll') : statusLabel(f)}
            </Chip>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className='text-content-muted flex items-center justify-center gap-2 py-12 text-sm'>
          <Loader2 className='size-4 animate-spin' /> {t('list.loading')}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState basePath={basePath} hasAny={items.length > 0} t={t} />
      ) : (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {filtered.map(r => (
            <ReportCard
              key={r.id}
              report={r}
              href={`${basePath}/${r.id}`}
              statusLabel={statusLabel}
              goalLabel={goalLabel}
              untitled={t('list.untitled')}
              renameLabel={t('list.rename')}
              deleteLabel={t('list.delete')}
              onRename={() => handleRename(r)}
              onDelete={() => handleDelete(r)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportCard({
  report: r,
  href,
  statusLabel,
  goalLabel,
  untitled,
  renameLabel,
  deleteLabel,
  onRename,
  onDelete,
}: {
  report: InsightReport;
  href: string;
  statusLabel: (s: InsightStatus) => string;
  goalLabel: (g: ExperienceGoal) => string;
  untitled: string;
  renameLabel: string;
  deleteLabel: string;
  onRename: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = STATUS_META[r.status as InsightStatus] ?? STATUS_META.queued;
  const StatusIcon = meta.icon;
  const goal = r.blueprint?.experience_goal?.primary_goal;

  return (
    <div className='group border-border hover:border-primary/40 bg-card relative flex flex-col gap-3 rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
      {/* Lớp phủ click toàn card → mở chi tiết (button menu nằm trên nhờ z-index) */}
      <Link
        href={href}
        className='absolute inset-0 rounded-2xl'
        aria-label={r.title || untitled}
      />

      <div className='flex items-start justify-between gap-2'>
        <span className='bg-primary/10 text-primary inline-flex size-9 shrink-0 items-center justify-center rounded-xl'>
          <Sparkles className='size-4' aria-hidden />
        </span>
        <div className='relative z-10 flex items-center gap-1'>
          <span
            className={cn(
              'text-3xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold',
              meta.chip
            )}
          >
            <StatusIcon
              className={cn('size-3', r.status === 'running' && 'animate-spin')}
              aria-hidden
            />
            {statusLabel(r.status as InsightStatus)}
          </span>
          <button
            type='button'
            onClick={() => setMenuOpen(o => !o)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
            className='text-content-muted hover:bg-muted rounded p-1'
            aria-label='Tuỳ chọn'
          >
            <MoreVertical className='size-4' aria-hidden />
          </button>
          {menuOpen && (
            <div className='border-border bg-card absolute top-7 right-0 z-20 w-32 overflow-hidden rounded-lg border shadow-lg'>
              <button
                type='button'
                onClick={onRename}
                className='hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
              >
                <Pencil className='size-3' aria-hidden /> {renameLabel}
              </button>
              <button
                type='button'
                onClick={onDelete}
                className='text-destructive hover:bg-danger-bg flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
              >
                <Trash2 className='size-3' aria-hidden /> {deleteLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className='min-w-0'>
        <h3 className='text-content-main truncate text-sm font-semibold'>
          {r.title || untitled}
        </h3>
        {goal && (
          <p className='text-content-muted mt-0.5 inline-flex items-center gap-1 text-xs'>
            <Target className='size-3' aria-hidden />
            {goalLabel(goal)}
          </p>
        )}
      </div>
      {r.created_at && (
        <p className='text-content-muted text-3xs mt-auto font-mono'>
          {new Date(r.created_at).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}

function EmptyState({
  basePath,
  hasAny,
  t,
}: {
  basePath: string;
  hasAny: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className='border-border bg-background flex flex-col items-center rounded-2xl border border-dashed px-8 py-14 text-center'>
      <AiOrb size={56} />
      <p className='text-content-main mt-4 text-base font-semibold'>
        {hasAny ? t('list.emptyFilter') : t('list.empty')}
      </p>
      {!hasAny && (
        <>
          <p className='text-content-muted mt-1.5 max-w-md text-sm'>
            {t('list.emptyHint')}
          </p>
          <Link
            href={`${basePath}/new`}
            className='bg-primary hover:bg-primary-dark mt-5 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition'
          >
            <Plus className='size-4' aria-hidden /> {t('list.new')}
          </Link>
        </>
      )}
    </div>
  );
}
