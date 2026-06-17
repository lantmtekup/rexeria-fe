'use client';

/**
 * Admin "Landing page template" list. The BE `/v1/templates` endpoint
 * returns the full collection without paging, so search/filter/sort and
 * pagination are computed FE-side. Standard list affordances mirror
 * `AdminCanvasTemplatesPage` so the two screens read as a pair.
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Archive,
  ArrowDownUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  LayoutGrid,
  LayoutTemplate,
  MoreVertical,
  Pencil,
  RefreshCwIcon,
  RotateCcw,
  Search,
  Sparkles,
  Table as TableIcon,
  Tag,
  X as XIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Chip } from '@/components/atoms/chip';
import { Input } from '@/components/atoms/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { CreateTemplateDialog } from '@/components/dialogs/CreateTemplateDialog';
import { UseTemplateDialog } from '@/components/dialogs/UseTemplateDialog';
import { TemplateEffectsDialog } from '@/components/modules/CanvasTemplate/TemplateEffectsDialog';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import { cn } from '@/lib/cn';
import type { Template } from '@/services/rexer/types';

type View = 'grid' | 'table';
type Status = 'all' | 'active' | 'draft' | 'archived';
type Sort = '-updated_at' | '-created_at' | 'created_at' | 'name';

const SORT_OPTIONS: { id: Sort; label: string }[] = [
  { id: '-updated_at', label: 'Mới cập nhật' },
  { id: '-created_at', label: 'Mới tạo nhất' },
  { id: 'created_at', label: 'Cũ nhất' },
  { id: 'name', label: 'Tên A→Z' },
];

const LIMIT = 12;

const STATUS_CHIP: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-amber-100 text-amber-700',
  archived: 'bg-muted text-content-muted',
};

/**
 * BE sometimes returns `author` as a User object (`{display_name, email, ...}`)
 * even though the legacy schema said `string`. Render-safe extract — never
 * pass the raw object to JSX or React throws.
 */
function formatAuthor(author: Template['author']): string {
  if (!author) return '';
  if (typeof author === 'string') return author;
  return author.display_name || author.email || author.id || '';
}

export function AdminTemplatesPage() {
  const t = useTranslations('admin');
  const tErrors = useTranslations('errors');

  const [allItems, setAllItems] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [status, setStatus] = React.useState<Status>('active');
  const [category, setCategory] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<Sort>('-updated_at');
  const [view, setView] = React.useState<View>('table');
  // "Sử dụng template" dialog target; null when closed.
  const [useTarget, setUseTarget] = React.useState<Template | null>(null);
  const [effectsTarget, setEffectsTarget] = React.useState<Template | null>(
    null
  );
  // "Tạo template mới" dialog open state.
  const [createOpen, setCreateOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  // Bulk selection — chỉ active ở table view (grid view không expose checkbox).
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, category, sort]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await rexerApi.templates.list();
      setAllItems(r.items ?? []);
    } catch (err) {
      const code =
        err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED';
      setError(code);
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  // ── Status mutation ─────────────────────────────────────────────────
  // BE PATCH /v1/templates/:id accepts `status` (active|draft|archived).
  // Optimistic update + reload on failure.
  const runStatusAction = React.useCallback(
    async (tpl: Template, action: 'activate' | 'archive' | 'restore') => {
      const nextStatus =
        action === 'activate'
          ? 'active'
          : action === 'archive'
            ? 'archived'
            : 'draft';
      const label =
        action === 'activate'
          ? 'Activate'
          : action === 'archive'
            ? 'Archive'
            : 'Restore';
      if (action === 'archive') {
        if (
          !window.confirm(
            `Archive template "${tpl.name}"?\n\nStatus → archived.`
          )
        )
          return;
      }
      const tid = toast.loading(`${label}…`);
      // Optimistic
      setAllItems(prev =>
        prev.map(t => (t.id === tpl.id ? { ...t, status: nextStatus } : t))
      );
      try {
        await rexerApi.templates.update(tpl.id, { status: nextStatus });
        toast.success(`${label} thành công`, { id: tid });
      } catch (err) {
        toast.error(
          `${label} thất bại: ${err instanceof RxApiError ? err.code || err.message : 'ERROR'}`,
          { id: tid }
        );
        // Revert
        await load();
      }
    },
    [load]
  );

  // Clear selection khi đổi filter/page (rows hiển thị đổi).
  React.useEffect(() => {
    setSelected(new Set());
  }, [debouncedSearch, status, category, sort, view, page]);

  const toggleSelected = React.useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = React.useCallback((ids: string[], allOn: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allOn) ids.forEach(id => next.delete(id));
      else ids.forEach(id => next.add(id));
      return next;
    });
  }, []);

  /** Bulk archive — BE không có hard DELETE (probe 2026-05-31, 404).
   *  Soft delete = PATCH status='archived'. Fan-out parallel + reload.
   *  Selected items vẫn xuất hiện ở list nhưng STATUS_CHIP 'archived'. */
  const runBulkArchive = React.useCallback(async () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    if (
      !window.confirm(
        `Archive ${ids.length} template?\n\nStatus → 'archived'. Có thể restore qua kebab menu.`
      )
    )
      return;
    setBulkBusy(true);
    const tid = toast.loading(`Archive ${ids.length} templates…`);
    let okCount = 0;
    let failCount = 0;
    await Promise.all(
      ids.map(async id => {
        try {
          await rexerApi.templates.update(id, { status: 'archived' });
          okCount += 1;
        } catch {
          failCount += 1;
        }
      })
    );
    if (failCount === 0) {
      toast.success(`Đã archive ${okCount} templates`, { id: tid });
    } else {
      toast.error(
        `${okCount}/${ids.length} OK, ${failCount} lỗi. Reload để verify`,
        { id: tid }
      );
    }
    setSelected(new Set());
    setBulkBusy(false);
    await load();
  }, [selected, load]);

  // Distinct categories across the dataset for the filter strip
  const categories = React.useMemo(() => {
    const s = new Set<string>();
    for (const it of allItems) {
      if (it.category) s.add(it.category);
    }
    return Array.from(s).sort();
  }, [allItems]);

  // FE-side filter + sort + paginate. BE doesn't accept query params for
  // /v1/templates yet — see be-todo.md for the planned upgrade.
  const filtered = React.useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    let arr = allItems.filter(it => {
      if (status !== 'all' && (it.status ?? '').toLowerCase() !== status)
        return false;
      if (category && it.category !== category) return false;
      if (!q) return true;
      return (
        it.name.toLowerCase().includes(q) ||
        (it.description ?? '').toLowerCase().includes(q) ||
        (it.code ?? '').toLowerCase().includes(q) ||
        (it.tags ?? []).some(tg => tg.toLowerCase().includes(q))
      );
    });
    arr = arr.slice().sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created_at':
          return (a.created_at || '').localeCompare(b.created_at || '');
        case '-created_at':
          return (b.created_at || '').localeCompare(a.created_at || '');
        default:
          return (b.updated_at || '').localeCompare(a.updated_at || '');
      }
    });
    return arr;
  }, [allItems, debouncedSearch, status, category, sort]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const pageItems = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setCategory(null);
    setSort('-updated_at');
  };
  const hasActiveFilters = !!search.trim() || status !== 'all' || !!category;

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
      {/* Header */}
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <div className='text-3xs text-content-muted flex items-center gap-2 font-semibold tracking-[0.18em] uppercase'>
            <LayoutTemplate className='size-3' /> {t('templates.title')}
          </div>
          <h1 className='mt-1 text-2xl font-semibold tracking-tight'>
            {t('templates.title')}
          </h1>
          <p className='text-content-muted mt-1 text-sm'>
            {t('templates.subtitle', { total: allItems.length })} · template hệ
            thống dùng làm preset cho brand clone
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={load} disabled={loading}>
            <RefreshCwIcon
              className={cn('size-4', loading && 'animate-spin')}
            />
            {t('refresh')}
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            title={t('templates.create')}
          >
            <Sparkles className='size-4' />
            {t('templates.create')}
          </Button>
        </div>
      </div>

      <p className='text-content-muted text-xs'>{t('templates.note')}</p>

      {/* Toolbar */}
      <div className='border-border bg-card flex flex-wrap items-center gap-2 rounded-2xl border p-2 shadow-sm'>
        <div className='relative max-w-sm flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2' />
          <Input
            placeholder='Tìm theo tên / code / mô tả / tag…'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>

        <div className='relative inline-flex items-center'>
          <ArrowDownUp className='text-muted-foreground pointer-events-none absolute left-2.5 size-3.5' />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as Sort)}
            className='border-border text-content-muted hover:bg-muted bg-background focus:border-ring appearance-none rounded-lg border py-1.5 pr-3 pl-7 text-xs font-medium outline-none'
            aria-label='Sort'
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className='border-border bg-background ml-auto inline-flex items-center gap-0.5 rounded-lg border p-0.5'>
          <ViewBtn
            active={view === 'grid'}
            onClick={() => setView('grid')}
            icon={<LayoutGrid className='size-3.5' />}
            label='Grid'
          />
          <ViewBtn
            active={view === 'table'}
            onClick={() => setView('table')}
            icon={<TableIcon className='size-3.5' />}
            label='Table'
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
        <FilterGroup label='Trạng thái'>
          <ChipBtn
            active={status === 'all'}
            onClick={() => setStatus('all')}
            label='Tất cả'
          />
          <ChipBtn
            active={status === 'active'}
            onClick={() => setStatus('active')}
            label='Active'
            accent='emerald'
          />
          <ChipBtn
            active={status === 'draft'}
            onClick={() => setStatus('draft')}
            label='Draft'
            accent='amber'
          />
          <ChipBtn
            active={status === 'archived'}
            onClick={() => setStatus('archived')}
            label='Archived'
          />
        </FilterGroup>

        {categories.length > 0 && (
          <>
            <span className='bg-border hidden h-4 w-px sm:block' />
            <FilterGroup label='Category' icon={<Tag className='size-3' />}>
              <ChipBtn
                active={!category}
                onClick={() => setCategory(null)}
                label='Tất cả'
              />
              {categories.map(c => (
                <ChipBtn
                  key={c}
                  active={category === c}
                  onClick={() => setCategory(c)}
                  label={c}
                  accent='violet'
                />
              ))}
            </FilterGroup>
          </>
        )}

        {hasActiveFilters && (
          <button
            type='button'
            onClick={clearFilters}
            className='text-2xs text-content-muted hover:text-foreground ml-1 inline-flex items-center gap-1'
          >
            <XIcon className='size-3' />
            Clear
          </button>
        )}
      </div>

      {errorMessage && (
        <p
          className='border-destructive/20 bg-danger-bg text-destructive rounded-lg border px-3 py-2 text-sm'
          role='alert'
        >
          {errorMessage}
        </p>
      )}

      {/* Body */}
      {loading && allItems.length === 0 ? (
        <div className='text-content-muted flex items-center justify-center py-16 text-sm'>
          <RefreshCwIcon className='mr-2 size-4 animate-spin' /> Đang tải
          template…
        </div>
      ) : pageItems.length === 0 ? (
        <div className='border-border bg-card rounded-2xl border border-dashed p-12 text-center'>
          <LayoutTemplate className='text-muted-foreground mx-auto size-8' />
          <p className='text-content-muted mt-3 text-sm font-semibold'>
            {hasActiveFilters
              ? 'Không có template nào khớp filter'
              : t('templates.empty')}
          </p>
          <p className='text-content-muted mt-1 text-xs'>
            {hasActiveFilters
              ? 'Thử đổi từ khoá hoặc clear filter.'
              : t('templates.note')}
          </p>
        </div>
      ) : view === 'grid' ? (
        <GridView
          items={pageItems}
          onUse={setUseTarget}
          onEffects={setEffectsTarget}
          onStatusAction={runStatusAction}
        />
      ) : (
        <TableView
          items={pageItems}
          col={{
            name: t('templates.col.name'),
            code: t('templates.col.code'),
            status: t('templates.col.status'),
            created: t('templates.col.created'),
          }}
          onUse={setUseTarget}
          onEffects={setEffectsTarget}
          onStatusAction={runStatusAction}
          selected={selected}
          onToggleSelected={toggleSelected}
          onToggleSelectAll={toggleSelectAll}
        />
      )}

      {/* Pagination */}
      {pageItems.length > 0 && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={LIMIT}
          onChange={setPage}
        />
      )}

      {/* Bulk action bar — sticky bottom khi có selection. */}
      {selected.size > 0 && view === 'table' && (
        <div className='bg-foreground border-foreground sticky bottom-4 z-30 mx-auto flex w-fit min-w-[320px] items-center gap-3 rounded-xl border px-4 py-2.5 shadow-2xl'>
          <span className='text-background text-xs font-medium'>
            Đã chọn{' '}
            <span className='text-2xs rounded-md bg-white/15 px-1.5 py-0.5 font-mono'>
              {selected.size}
            </span>{' '}
            template
          </span>
          <button
            type='button'
            onClick={() => setSelected(new Set())}
            disabled={bulkBusy}
            className='text-2xs rounded-md px-2 py-1 font-medium text-white/70 hover:bg-white/10 disabled:opacity-50'
          >
            Bỏ chọn
          </button>
          <div className='h-4 w-px bg-white/20' />
          <Button
            type='button'
            variant='destructive'
            size='sm'
            onClick={runBulkArchive}
            disabled={bulkBusy}
          >
            <Archive className='size-3.5' />
            {bulkBusy ? 'Archive…' : 'Archive đã chọn'}
          </Button>
        </div>
      )}

      <UseTemplateDialog
        open={!!useTarget}
        onOpenChange={open => {
          if (!open) setUseTarget(null);
        }}
        template={useTarget}
      />

      <TemplateEffectsDialog
        open={!!effectsTarget}
        onOpenChange={open => {
          if (!open) setEffectsTarget(null);
        }}
        template={effectsTarget}
      />

      <CreateTemplateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

/* ─── Grid ──────────────────────────────────────────────────────────── */

function GridView({
  items,
  onUse,
  onEffects,
  onStatusAction,
}: {
  items: Template[];
  onUse: (t: Template) => void;
  onEffects: (t: Template) => void;
  onStatusAction: (t: Template, action: TemplateStatusAction) => void;
}) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {items.map(it => (
        <TemplateCard
          key={it.id}
          item={it}
          onUse={() => onUse(it)}
          onEffects={onEffects}
          onStatusAction={onStatusAction}
        />
      ))}
    </div>
  );
}

function TemplateCard({
  item,
  onUse,
  onEffects,
  onStatusAction,
}: {
  item: Template;
  onUse: () => void;
  onEffects: (t: Template) => void;
  onStatusAction: (t: Template, action: TemplateStatusAction) => void;
}) {
  const statusClass =
    STATUS_CHIP[(item.status ?? '').toLowerCase()] ??
    'bg-muted text-content-muted';
  return (
    <div className='group border-border hover:border-border bg-card flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
      <Link
        href={`/admin/templates/${item.id}/preview`}
        target='_blank'
        rel='noopener noreferrer'
        className='border-border relative block aspect-[16/10] overflow-hidden border-b bg-gradient-to-br from-zinc-100 via-zinc-200/60 to-zinc-100'
        title='Preview'
      >
        {item.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail_url}
            alt={item.name}
            className='size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
          />
        ) : (
          <div className='text-muted-foreground flex h-full items-center justify-center'>
            <LayoutTemplate className='size-10' />
          </div>
        )}
        {item.status && (
          <span
            className={cn(
              'text-3xs absolute top-2 left-2 rounded-full px-2 py-0.5 font-bold tracking-wider backdrop-blur',
              statusClass
            )}
          >
            {item.status.toUpperCase()}
          </span>
        )}
        {item.category && (
          <span className='text-3xs absolute top-2 right-2 rounded-full bg-violet-100/90 px-2 py-0.5 font-bold tracking-wider text-violet-700 backdrop-blur'>
            {item.category}
          </span>
        )}
      </Link>

      <div className='flex flex-1 flex-col gap-2 p-3.5'>
        <div className='flex items-start justify-between gap-2'>
          <h3 className='text-foreground line-clamp-1 text-sm font-semibold'>
            {item.name}
          </h3>
          {item.code && (
            <code className='text-3xs bg-muted text-content-muted shrink-0 rounded px-1.5 py-0.5 font-mono'>
              {item.code}
            </code>
          )}
        </div>
        {item.description && (
          <p className='text-2xs text-content-muted line-clamp-2 leading-snug'>
            {item.description}
          </p>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {item.tags.slice(0, 3).map(tg => (
              <span
                key={tg}
                className='text-3xs bg-muted text-content-muted rounded-full px-1.5 py-0.5 font-medium'
              >
                {tg}
              </span>
            ))}
          </div>
        )}

        <div className='text-3xs text-content-muted mt-auto flex items-center justify-between'>
          <span>
            {formatAuthor(item.author) || (
              <span className='text-muted-foreground'>-</span>
            )}
          </span>
          <span className='text-muted-foreground font-mono'>
            {item.created_at
              ? new Date(item.created_at).toLocaleDateString('vi-VN')
              : '-'}
          </span>
        </div>

        <div className='mt-1 grid grid-cols-[1fr_1fr_auto] gap-1.5'>
          <Link
            href={`/admin/templates/${item.id}/preview`}
            target='_blank'
            rel='noopener noreferrer'
            className='border-border text-content-muted hover:bg-muted bg-background inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors'
          >
            <Eye className='size-3.5' />
            Preview
          </Link>
          <button
            type='button'
            onClick={onUse}
            className='bg-foreground text-background hover:bg-foreground/85 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors'
          >
            <Sparkles className='size-3.5' />
            Sử dụng
          </button>
          <TemplateActionMenu
            item={item}
            onEffects={() => onEffects(item)}
            onStatusAction={action => onStatusAction(item, action)}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Status action menu (kebab) ─────────────────────────────────────── */

type TemplateStatusAction = 'activate' | 'archive' | 'restore';

function TemplateActionMenu({
  item,
  onEffects,
  onStatusAction,
}: {
  item: Template;
  onEffects: () => void;
  onStatusAction: (action: TemplateStatusAction) => void;
}) {
  const [open, setOpen] = React.useState(false);
  // Dropdown render qua portal + position fixed để KHÔNG bị card cha
  // (overflow-hidden + hover translate) cắt/che. Toạ độ tính từ rect của nút.
  const [pos, setPos] = React.useState<{ top: number; right: number } | null>(
    null
  );
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!open) {
      const r = btnRef.current?.getBoundingClientRect();
      if (r) setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setOpen(o => !o);
  };

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !menuRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    // Vị trí cố định theo rect lúc mở → đóng khi scroll/resize để tránh lệch.
    const onMove = () => setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open]);

  const choose = (action: TemplateStatusAction) => () => {
    setOpen(false);
    onStatusAction(action);
  };

  const status = (item.status ?? '').toLowerCase();

  return (
    <>
      <button
        ref={btnRef}
        type='button'
        onClick={toggle}
        className='border-border text-content-muted hover:bg-muted bg-background inline-flex h-full items-center justify-center rounded-lg border px-2 transition-colors'
        aria-label='Hành động'
        aria-expanded={open}
      >
        <MoreVertical className='size-3.5' />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: 'fixed', top: pos.top, right: pos.right }}
            className='border-border bg-card z-[200] w-44 overflow-hidden rounded-lg border shadow-lg'
          >
            <Link
              href={`/admin/templates/${item.id}/edit`}
              onClick={() => setOpen(false)}
              className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
            >
              <Pencil className='size-3.5 text-blue-600' />
              Mở editor
            </Link>
            <button
              type='button'
              onClick={() => {
                setOpen(false);
                onEffects();
              }}
              className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
            >
              <Sparkles className='size-3.5 text-violet-600' />
              Hiệu ứng template
            </button>
            <div className='bg-muted h-px' />
            {status === 'draft' && (
              <button
                type='button'
                onClick={choose('activate')}
                className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
              >
                <CheckCircle2 className='size-3.5 text-emerald-600' />
                Activate
              </button>
            )}
            {status === 'active' && (
              <button
                type='button'
                onClick={choose('restore')}
                className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
              >
                <RotateCcw className='size-3.5 text-amber-600' />
                Back to draft
              </button>
            )}
            {status === 'archived' && (
              <button
                type='button'
                onClick={choose('restore')}
                className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
              >
                <RotateCcw className='text-content-muted size-3.5' />
                Restore (→ draft)
              </button>
            )}
            {status !== 'archived' && (
              <>
                <div className='bg-muted h-px' />
                <button
                  type='button'
                  onClick={choose('archive')}
                  className='text-destructive hover:bg-danger-bg flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
                >
                  <Archive className='size-3.5' />
                  Archive
                </button>
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

/* ─── Table ─────────────────────────────────────────────────────────── */

function TableView({
  items,
  col,
  onUse,
  onEffects,
  onStatusAction,
  selected,
  onToggleSelected,
  onToggleSelectAll,
}: {
  items: Template[];
  col: { name: string; code: string; status: string; created: string };
  onUse: (t: Template) => void;
  onEffects: (t: Template) => void;
  onStatusAction: (t: Template, action: TemplateStatusAction) => void;
  selected: Set<string>;
  onToggleSelected: (id: string) => void;
  onToggleSelectAll: (ids: string[], allOn: boolean) => void;
}) {
  const ids = items.map(i => i.id);
  const allOn = ids.length > 0 && ids.every(id => selected.has(id));
  const someOn = ids.some(id => selected.has(id));
  return (
    <div className='border-border bg-card rounded-2xl border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-10'>
              <input
                type='checkbox'
                className='border-border text-foreground focus:ring-ring size-3.5 cursor-pointer rounded'
                checked={allOn}
                ref={el => {
                  if (el) el.indeterminate = someOn && !allOn;
                }}
                onChange={() => onToggleSelectAll(ids, allOn)}
                aria-label='Chọn tất cả'
              />
            </TableHead>
            <TableHead className='w-20'>Thumb</TableHead>
            <TableHead>{col.name}</TableHead>
            <TableHead className='w-32'>{col.code}</TableHead>
            <TableHead className='w-28'>{col.status}</TableHead>
            <TableHead className='w-40'>{col.created}</TableHead>
            <TableHead className='w-44' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => {
            const statusClass =
              STATUS_CHIP[(item.status ?? '').toLowerCase()] ??
              'bg-muted text-content-muted';
            const isSelected = selected.has(item.id);
            return (
              <TableRow key={item.id} className={cn(isSelected && 'bg-muted')}>
                <TableCell>
                  <input
                    type='checkbox'
                    className='border-border text-foreground focus:ring-ring size-3.5 cursor-pointer rounded'
                    checked={isSelected}
                    onChange={() => onToggleSelected(item.id)}
                    aria-label={`Chọn ${item.name}`}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/template/${item.id}`}
                    className='border-border block aspect-[4/3] w-16 overflow-hidden rounded-md border bg-gradient-to-br from-zinc-100 to-zinc-200'
                  >
                    {item.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail_url}
                        alt={item.name}
                        className='size-full object-cover'
                      />
                    ) : (
                      <div className='text-muted-foreground flex h-full items-center justify-center'>
                        <LayoutTemplate className='size-4' />
                      </div>
                    )}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className='font-medium'>{item.name}</div>
                  {item.description && (
                    <div className='text-content-muted truncate text-xs'>
                      {item.description}
                    </div>
                  )}
                </TableCell>
                <TableCell className='font-mono text-xs'>{item.code}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs',
                      statusClass
                    )}
                  >
                    {item.status || '-'}
                  </span>
                </TableCell>
                <TableCell className='text-xs'>
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString('vi-VN')
                    : '-'}
                </TableCell>
                <TableCell>
                  <div className='flex items-center justify-end gap-1.5'>
                    <Link
                      href={`/admin/templates/${item.id}/preview`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='border-border text-content-muted hover:bg-muted bg-background inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium'
                    >
                      <Eye className='size-3' />
                      Preview
                    </Link>
                    <button
                      type='button'
                      onClick={() => onUse(item)}
                      className='bg-foreground text-background hover:bg-foreground/85 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium'
                    >
                      <Sparkles className='size-3' />
                      Sử dụng
                    </button>
                    <TemplateActionMenu
                      item={item}
                      onEffects={() => onEffects(item)}
                      onStatusAction={a => onStatusAction(item, a)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/* ─── Pagination ────────────────────────────────────────────────────── */

function Pagination({
  page,
  totalPages,
  total,
  limit,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (next: number) => void;
}) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages: (number | 'gap')[] = [];
  const add = (n: number) => {
    if (!pages.includes(n) && n >= 1 && n <= totalPages) pages.push(n);
  };
  add(1);
  if (page - 1 > 2) pages.push('gap');
  add(page - 1);
  add(page);
  add(page + 1);
  if (page + 1 < totalPages - 1) pages.push('gap');
  add(totalPages);

  return (
    <div className='border-border bg-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 shadow-sm'>
      <span className='text-2xs text-content-muted'>
        {from}-{to} trong {total}
      </span>
      <div className='flex items-center gap-1'>
        <button
          type='button'
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className='border-border text-content-muted hover:bg-muted inline-flex size-7 items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-40'
        >
          <ChevronLeft className='size-3.5' />
        </button>
        {pages.map((p, i) =>
          p === 'gap' ? (
            <span
              key={`gap-${i}`}
              className='text-2xs text-muted-foreground px-1'
            >
              …
            </span>
          ) : (
            <Chip
              key={p}
              size='sm'
              selected={p === page}
              onClick={() => onChange(p)}
              className='min-w-7 rounded-md px-2 font-mono tabular-nums'
            >
              {p}
            </Chip>
          )
        )}
        <button
          type='button'
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className='border-border text-content-muted hover:bg-muted inline-flex size-7 items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-40'
        >
          <ChevronRight className='size-3.5' />
        </button>
      </div>
    </div>
  );
}

/* ─── Bits ──────────────────────────────────────────────────────────── */

function FilterGroup({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className='inline-flex items-center gap-1.5'>
      <span className='text-3xs text-muted-foreground inline-flex items-center gap-1 font-semibold tracking-[0.18em] uppercase'>
        {icon}
        {label}
      </span>
      <div className='inline-flex flex-wrap items-center gap-1'>{children}</div>
    </div>
  );
}

function ChipBtn({
  active,
  onClick,
  label,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  accent?: 'emerald' | 'amber' | 'violet';
}) {
  const accentActive: Record<NonNullable<typeof accent>, string> = {
    emerald: 'bg-emerald-600 text-white shadow-sm',
    amber: 'bg-amber-500 text-white shadow-sm',
    violet: 'bg-violet-600 text-white shadow-sm',
  };
  const cls = active
    ? accent
      ? accentActive[accent]
      : 'bg-foreground text-background shadow-sm'
    : 'border border-border bg-background text-content-muted hover:bg-muted';
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'text-2xs rounded-full px-2.5 py-1 font-medium transition-colors',
        cls
      )}
    >
      {label}
    </button>
  );
}

function ViewBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Chip
      size='sm'
      selected={active}
      onClick={onClick}
      title={label}
      aria-label={label}
      className='border-0 px-2'
    >
      {icon}
    </Chip>
  );
}
