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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  // Bỏ chọn khi đổi bộ lọc/tìm kiếm: thẻ đang chọn có thể biến khỏi màn hình,
  // giữ lại thì người dùng bấm "Xoá đã chọn" mà không thấy mình đang xoá gì.
  useEffect(() => {
    setSelected(new Set());
  }, [q, filter]);

  const toggleSelected = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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

  /**
   * Xoá nhiều báo cáo cùng lúc.
   *
   * BE không có endpoint xoá hàng loạt (`DELETE /insights/reports/{id}` là đơn
   * lẻ), nên fan-out song song rồi đếm — giống `runBulkArchive` bên
   * `AdminTemplatesPage`. Đếm riêng thành công/thất bại vì một id hỏng không
   * được phép nuốt mất kết quả của những id còn lại: chỉ gỡ khỏi danh sách
   * đúng những cái BE xác nhận đã xoá.
   */
  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0 || bulkBusy) return;
    if (!window.confirm(t('list.bulkConfirm', { n: ids.length }))) return;

    setBulkBusy(true);
    const tid = toast.loading(t('list.bulkDeleting', { n: ids.length }));
    const done: string[] = [];
    await Promise.all(
      ids.map(async id => {
        try {
          await rexerApi.insights.remove(id);
          done.push(id);
        } catch {
          /* giữ lại trong danh sách để người dùng thấy cái nào chưa xoá được */
        }
      })
    );

    const gone = new Set(done);
    setItems(prev => prev.filter(x => !gone.has(x.id)));
    setSelected(prev => new Set([...prev].filter(id => !gone.has(id))));

    if (done.length === ids.length) {
      toast.success(t('list.bulkDone', { n: done.length }), { id: tid });
    } else {
      toast.error(
        t('list.bulkPartial', {
          ok: done.length,
          total: ids.length,
          fail: ids.length - done.length,
        }),
        { id: tid }
      );
    }
    setBulkBusy(false);
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

  const allVisibleSelected =
    filtered.length > 0 && filtered.every(r => selected.has(r.id));

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

      {/* Thanh thao tác hàng loạt — chỉ hiện khi có thẻ được chọn, để lúc
          bình thường danh sách không bị thêm một hàng nút chẳng dùng tới. */}
      {selected.size > 0 && (
        <div className='border-primary/30 bg-primary/5 flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3'>
          <span className='text-content-main text-sm font-medium'>
            {t('list.bulkSelected', { n: selected.size })}
          </span>
          <button
            type='button'
            onClick={() => setSelected(new Set(filtered.map(r => r.id)))}
            disabled={allVisibleSelected}
            className='text-content-muted hover:text-content-main text-xs disabled:opacity-40'
          >
            {t('list.selectAll', { n: filtered.length })}
          </button>
          <button
            type='button'
            onClick={() => setSelected(new Set())}
            className='text-content-muted hover:text-content-main text-xs'
          >
            {t('list.clearSelection')}
          </button>
          <button
            type='button'
            onClick={handleBulkDelete}
            disabled={bulkBusy}
            className='ml-auto inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60'
          >
            {bulkBusy ? (
              <Loader2 className='size-3.5 animate-spin' aria-hidden />
            ) : (
              <Trash2 className='size-3.5' aria-hidden />
            )}
            {bulkBusy
              ? t('list.bulkDeleting', { n: selected.size })
              : t('list.bulkDelete')}
          </button>
        </div>
      )}

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
              selectLabel={t('list.selectOne')}
              selected={selected.has(r.id)}
              onToggleSelect={() => toggleSelected(r.id)}
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
  selectLabel,
  selected,
  onToggleSelect,
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
  selectLabel: string;
  selected: boolean;
  onToggleSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = STATUS_META[r.status as InsightStatus] ?? STATUS_META.queued;
  const StatusIcon = meta.icon;
  const goal = r.blueprint?.experience_goal?.primary_goal;

  return (
    <div
      className={cn(
        'group bg-card relative flex flex-col gap-3 rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        selected
          ? 'border-primary ring-primary/25 ring-2'
          : 'border-border hover:border-primary/40'
      )}
    >
      {/* Lớp phủ click toàn card → mở chi tiết (button menu nằm trên nhờ z-index) */}
      <Link
        href={href}
        className='absolute inset-0 rounded-2xl'
        aria-label={r.title || untitled}
      />

      <div className='flex items-start justify-between gap-2'>
        {/* Ô chọn thay chỗ icon khi rê chuột hoặc khi đã chọn: lưới thẻ không
            có cột riêng để đặt checkbox, mà thêm hẳn một ô cố định thì màn hình
            lúc nào cũng rối dù hầu hết thời gian không ai chọn gì.
            `z-10` để nổi trên lớp phủ Link, nếu không bấm vào là mở chi tiết. */}
        <span className='relative z-10 inline-flex size-9 shrink-0 items-center justify-center'>
          <input
            type='checkbox'
            checked={selected}
            onChange={onToggleSelect}
            aria-label={selectLabel}
            className={cn(
              'accent-primary size-4 cursor-pointer transition-opacity',
              selected
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
            )}
          />
          {!selected && (
            <span
              aria-hidden
              className='bg-primary/10 text-primary pointer-events-none absolute inset-0 inline-flex items-center justify-center rounded-xl transition-opacity group-hover:opacity-0'
            >
              <Sparkles className='size-4' />
            </span>
          )}
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
