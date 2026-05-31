'use client';

/**
 * Admin "Landing page template" list. The BE `/v1/templates` endpoint
 * returns the full collection without paging, so search/filter/sort and
 * pagination are computed FE-side. Standard list affordances mirror
 * `AdminCanvasTemplatesPage` so the two screens read as a pair.
 */

import * as React from 'react';
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
  archived: 'bg-zinc-100 text-zinc-500',
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
  const [status, setStatus] = React.useState<Status>('all');
  const [category, setCategory] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<Sort>('-updated_at');
  const [view, setView] = React.useState<View>('grid');
  // "Sử dụng template" dialog target; null when closed.
  const [useTarget, setUseTarget] = React.useState<Template | null>(null);
  // "Tạo template mới" dialog open state.
  const [createOpen, setCreateOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);

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
          <div className='flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.18em] text-zinc-500 uppercase'>
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
      <div className='flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm'>
        <div className='relative max-w-sm flex-1'>
          <Search className='absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400' />
          <Input
            placeholder='Tìm theo tên / code / mô tả / tag…'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>

        <div className='relative inline-flex items-center'>
          <ArrowDownUp className='pointer-events-none absolute left-2.5 size-3.5 text-zinc-400' />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as Sort)}
            className='appearance-none rounded-lg border border-zinc-200 bg-white py-1.5 pr-3 pl-7 text-xs font-medium text-zinc-700 outline-none hover:bg-zinc-50 focus:border-zinc-400'
            aria-label='Sort'
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className='ml-auto inline-flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-0.5'>
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
            <span className='hidden h-4 w-px bg-zinc-200 sm:block' />
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
            className='ml-1 inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900'
          >
            <XIcon className='size-3' />
            Clear
          </button>
        )}
      </div>

      {errorMessage && (
        <p
          className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800'
          role='alert'
        >
          {errorMessage}
        </p>
      )}

      {/* Body */}
      {loading && allItems.length === 0 ? (
        <div className='flex items-center justify-center py-16 text-sm text-zinc-500'>
          <RefreshCwIcon className='mr-2 size-4 animate-spin' /> Đang tải
          template…
        </div>
      ) : pageItems.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center'>
          <LayoutTemplate className='mx-auto size-8 text-zinc-300' />
          <p className='mt-3 text-[14px] font-semibold text-zinc-700'>
            {hasActiveFilters
              ? 'Không có template nào khớp filter'
              : t('templates.empty')}
          </p>
          <p className='mt-1 text-[12px] text-zinc-500'>
            {hasActiveFilters
              ? 'Thử đổi từ khoá hoặc clear filter.'
              : t('templates.note')}
          </p>
        </div>
      ) : view === 'grid' ? (
        <GridView
          items={pageItems}
          onUse={setUseTarget}
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
          onStatusAction={runStatusAction}
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

      <UseTemplateDialog
        open={!!useTarget}
        onOpenChange={open => {
          if (!open) setUseTarget(null);
        }}
        template={useTarget}
      />

      <CreateTemplateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

/* ─── Grid ──────────────────────────────────────────────────────────── */

function GridView({
  items,
  onUse,
  onStatusAction,
}: {
  items: Template[];
  onUse: (t: Template) => void;
  onStatusAction: (t: Template, action: TemplateStatusAction) => void;
}) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {items.map(it => (
        <TemplateCard
          key={it.id}
          item={it}
          onUse={() => onUse(it)}
          onStatusAction={onStatusAction}
        />
      ))}
    </div>
  );
}

function TemplateCard({
  item,
  onUse,
  onStatusAction,
}: {
  item: Template;
  onUse: () => void;
  onStatusAction: (t: Template, action: TemplateStatusAction) => void;
}) {
  const statusClass =
    STATUS_CHIP[(item.status ?? '').toLowerCase()] ??
    'bg-zinc-100 text-zinc-600';
  return (
    <div className='group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md'>
      <Link
        href={`/admin/templates/${item.id}/preview`}
        target='_blank'
        rel='noopener noreferrer'
        className='relative block aspect-[16/10] overflow-hidden border-b border-zinc-100 bg-gradient-to-br from-zinc-100 via-zinc-200/60 to-zinc-100'
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
          <div className='flex h-full items-center justify-center text-zinc-300'>
            <LayoutTemplate className='size-10' />
          </div>
        )}
        {item.status && (
          <span
            className={cn(
              'absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider backdrop-blur',
              statusClass
            )}
          >
            {item.status.toUpperCase()}
          </span>
        )}
        {item.category && (
          <span className='absolute top-2 right-2 rounded-full bg-violet-100/90 px-2 py-0.5 text-[10px] font-bold tracking-wider text-violet-700 backdrop-blur'>
            {item.category}
          </span>
        )}
      </Link>

      <div className='flex flex-1 flex-col gap-2 p-3.5'>
        <div className='flex items-start justify-between gap-2'>
          <h3 className='line-clamp-1 text-[14px] font-semibold text-zinc-900'>
            {item.name}
          </h3>
          {item.code && (
            <code className='shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600'>
              {item.code}
            </code>
          )}
        </div>
        {item.description && (
          <p className='line-clamp-2 text-[11.5px] leading-snug text-zinc-500'>
            {item.description}
          </p>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {item.tags.slice(0, 3).map(tg => (
              <span
                key={tg}
                className='rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9.5px] font-medium text-zinc-600'
              >
                {tg}
              </span>
            ))}
          </div>
        )}

        <div className='mt-auto flex items-center justify-between text-[10.5px] text-zinc-500'>
          <span>
            {formatAuthor(item.author) || (
              <span className='text-zinc-400'>—</span>
            )}
          </span>
          <span className='font-mono text-zinc-400'>
            {item.created_at
              ? new Date(item.created_at).toLocaleDateString('vi-VN')
              : '—'}
          </span>
        </div>

        <div className='mt-1 grid grid-cols-[1fr_1fr_auto] gap-1.5'>
          <Link
            href={`/admin/templates/${item.id}/preview`}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50'
          >
            <Eye className='size-3.5' />
            Preview
          </Link>
          <button
            type='button'
            onClick={onUse}
            className='inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700'
          >
            <Sparkles className='size-3.5' />
            Sử dụng
          </button>
          <TemplateActionMenu
            item={item}
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
  onStatusAction,
}: {
  item: Template;
  onStatusAction: (action: TemplateStatusAction) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (action: TemplateStatusAction) => () => {
    setOpen(false);
    onStatusAction(action);
  };

  const status = (item.status ?? '').toLowerCase();

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        className='inline-flex h-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-zinc-700 transition-colors hover:bg-zinc-50'
        aria-label='Hành động'
        aria-expanded={open}
      >
        <MoreVertical className='size-3.5' />
      </button>
      {open && (
        <div className='absolute right-0 bottom-full z-20 mb-1 w-44 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg'>
          {status === 'draft' && (
            <button
              type='button'
              onClick={choose('activate')}
              className='flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-zinc-700 hover:bg-zinc-50'
            >
              <CheckCircle2 className='size-3.5 text-emerald-600' />
              Activate
            </button>
          )}
          {status === 'active' && (
            <button
              type='button'
              onClick={choose('restore')}
              className='flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-zinc-700 hover:bg-zinc-50'
            >
              <RotateCcw className='size-3.5 text-amber-600' />
              Back to draft
            </button>
          )}
          {status === 'archived' && (
            <button
              type='button'
              onClick={choose('restore')}
              className='flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-zinc-700 hover:bg-zinc-50'
            >
              <RotateCcw className='size-3.5 text-zinc-600' />
              Restore (→ draft)
            </button>
          )}
          {status !== 'archived' && (
            <>
              <div className='h-px bg-zinc-100' />
              <button
                type='button'
                onClick={choose('archive')}
                className='flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-rose-600 hover:bg-rose-50'
              >
                <Archive className='size-3.5' />
                Archive
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Table ─────────────────────────────────────────────────────────── */

function TableView({
  items,
  col,
  onUse,
  onStatusAction,
}: {
  items: Template[];
  col: { name: string; code: string; status: string; created: string };
  onUse: (t: Template) => void;
  onStatusAction: (t: Template, action: TemplateStatusAction) => void;
}) {
  return (
    <div className='border-border overflow-hidden rounded-2xl border bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
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
              'bg-zinc-100 text-zinc-600';
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <Link
                    href={`/template/${item.id}`}
                    className='block aspect-[4/3] w-16 overflow-hidden rounded-md border border-zinc-200 bg-gradient-to-br from-zinc-100 to-zinc-200'
                  >
                    {item.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail_url}
                        alt={item.name}
                        className='size-full object-cover'
                      />
                    ) : (
                      <div className='flex h-full items-center justify-center text-zinc-300'>
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
                    {item.status || '—'}
                  </span>
                </TableCell>
                <TableCell className='text-xs'>
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString('vi-VN')
                    : '—'}
                </TableCell>
                <TableCell>
                  <div className='flex items-center justify-end gap-1.5'>
                    <Link
                      href={`/admin/templates/${item.id}/preview`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50'
                    >
                      <Eye className='size-3' />
                      Preview
                    </Link>
                    <button
                      type='button'
                      onClick={() => onUse(item)}
                      className='inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-700'
                    >
                      <Sparkles className='size-3' />
                      Sử dụng
                    </button>
                    <TemplateActionMenu
                      item={item}
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
    <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 shadow-sm'>
      <span className='text-[11.5px] text-zinc-500'>
        {from}–{to} trong {total}
      </span>
      <div className='flex items-center gap-1'>
        <button
          type='button'
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className='inline-flex size-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40'
        >
          <ChevronLeft className='size-3.5' />
        </button>
        {pages.map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} className='px-1 text-[11px] text-zinc-300'>
              …
            </span>
          ) : (
            <button
              key={p}
              type='button'
              onClick={() => onChange(p)}
              className={cn(
                'inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 font-mono text-[11px] font-semibold tabular-nums',
                p === page
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          type='button'
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className='inline-flex size-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40'
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
      <span className='inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase'>
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
      : 'bg-zinc-900 text-white shadow-sm'
    : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50';
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
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
    <button
      type='button'
      onClick={onClick}
      title={label}
      className={cn(
        'flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
        active ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
      )}
    >
      {icon}
    </button>
  );
}
