'use client';

/**
 * Admin Customers (clients) list. BE `/v1/clients?status=&q=` returns the
 * full collection with status filter + search; pagination/sorting/items-per-
 * page are computed FE-side because BE doesn't return total/page yet.
 *
 * Standard list affordances: debounced search, status filter chips, sort
 * dropdown, view toggle (grid + table), items-per-page selector, compact
 * pagination. Each card/row links to the detail route `/admin/users/[id]`.
 */

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  RefreshCwIcon,
  Search,
  Table as TableIcon,
  Trash2,
  UserPlus,
  Users,
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
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import { cn } from '@/lib/cn';
import type { Brand } from '@/services/rexer/types';

import { AdminCreateUserModal } from './AdminCreateUserModal';
import { gradientForId, initialsOf } from './_avatar';

type View = 'grid' | 'table';
type Status = 'all' | 'active' | 'pending' | 'suspended' | 'inactive';
type Sort = '-updated_at' | '-created_at' | 'created_at' | 'name';

const SORT_OPTIONS: { id: Sort; label: string }[] = [
  { id: '-updated_at', label: 'Mới cập nhật' },
  { id: '-created_at', label: 'Mới tạo nhất' },
  { id: 'created_at', label: 'Cũ nhất' },
  { id: 'name', label: 'Tên A→Z' },
];

const PAGE_SIZES = [10, 20, 50];

const STATUS_CHIP: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  suspended: 'bg-rose-100 text-rose-700',
  inactive: 'bg-zinc-100 text-zinc-600',
};

export function AdminUsersPage() {
  const t = useTranslations('admin');
  const tErrors = useTranslations('errors');

  const [allItems, setAllItems] = React.useState<Brand[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [status, setStatus] = React.useState<Status>('all');
  const [sort, setSort] = React.useState<Sort>('-updated_at');
  const [view, setView] = React.useState<View>('grid');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  // Bulk selection — only available in table view (grid view không expose
  // checkbox). BE `DELETE /v1/brands/:id` đã ship (probed 2026-05-31).
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = React.useState(false);

  // Debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, sort, pageSize]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: { status?: string; q?: string } = {};
      if (status !== 'all') query.status = status;
      if (debouncedSearch.trim()) query.q = debouncedSearch.trim();
      const r = await rexerApi.brands.list(query);
      setAllItems(r.items ?? []);
    } catch (err) {
      const code =
        err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED';
      setError(code);
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Clear selection khi page/filter đổi (rows hiển thị thay đổi).
  React.useEffect(() => {
    setSelected(new Set());
  }, [debouncedSearch, status, sort, view, page, pageSize]);

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

  /** Bulk delete — BE `DELETE /v1/brands/:id` (hard delete, không như
   *  templates chỉ archive). Fan-out parallel + reload list. Cảnh báo
   *  user vì hard-delete = mất data + cascade brand memberships. */
  const runBulkDelete = React.useCallback(async () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    if (
      !window.confirm(
        `Xoá ${ids.length} khách hàng?\n\n⚠️ HARD DELETE — không thể khôi phục. Tất cả memberships, pages, blocks của brand sẽ bị cascade xoá theo BE setup.`
      )
    )
      return;
    setBulkBusy(true);
    const tid = toast.loading(`Xoá ${ids.length} brand…`);
    let okCount = 0;
    let failCount = 0;
    await Promise.all(
      ids.map(async id => {
        try {
          await rexerApi.brands.remove(id);
          okCount += 1;
        } catch {
          failCount += 1;
        }
      })
    );
    if (failCount === 0) {
      toast.success(`Đã xoá ${okCount} brand`, { id: tid });
    } else {
      toast.error(
        `${okCount}/${ids.length} OK, ${failCount} lỗi — reload để verify`,
        { id: tid }
      );
    }
    setSelected(new Set());
    setBulkBusy(false);
    await load();
  }, [selected, load]);

  // FE-side sort + paginate
  const sorted = React.useMemo(() => {
    const arr = allItems.slice();
    arr.sort((a, b) => {
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
  }, [allItems, sort]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = sorted.slice((page - 1) * pageSize, page * pageSize);

  const hasFilters = !!search.trim() || status !== 'all';
  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setSort('-updated_at');
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
      {/* Header */}
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.18em] text-zinc-500 uppercase'>
            <Users className='size-3' /> {t('users.title')}
          </div>
          <h1 className='mt-1 text-2xl font-semibold tracking-tight'>
            {t('users.title')}
          </h1>
          <p className='text-content-muted mt-1 text-sm'>
            {t('users.subtitle', { total: allItems.length })}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={load} disabled={loading}>
            <RefreshCwIcon
              className={cn('size-4', loading && 'animate-spin')}
            />
            {t('refresh')}
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className='size-4' />
            Tạo khách hàng
          </Button>
        </div>
      </div>

      <AdminCreateUserModal
        open={createOpen}
        clients={allItems}
        onClose={() => setCreateOpen(false)}
        onCreated={load}
      />

      <p className='text-content-muted text-xs'>{t('users.note')}</p>

      {/* Toolbar */}
      <div className='flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm'>
        <div className='relative max-w-sm flex-1'>
          <Search className='absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400' />
          <Input
            placeholder='Tìm theo tên / id…'
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

        <select
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
          className='rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 outline-none hover:bg-zinc-50'
          aria-label='Items per page'
          title='Số item mỗi trang'
        >
          {PAGE_SIZES.map(s => (
            <option key={s} value={s}>
              {s}/trang
            </option>
          ))}
        </select>

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
            active={status === 'pending'}
            onClick={() => setStatus('pending')}
            label='Pending'
            accent='amber'
          />
          <ChipBtn
            active={status === 'suspended'}
            onClick={() => setStatus('suspended')}
            label='Suspended'
            accent='rose'
          />
          <ChipBtn
            active={status === 'inactive'}
            onClick={() => setStatus('inactive')}
            label='Inactive'
          />
        </FilterGroup>

        {hasFilters && (
          <button
            type='button'
            onClick={clearFilters}
            className='ml-1 inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900'
          >
            <XIcon className='size-3' /> Clear
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
          <RefreshCwIcon className='mr-2 size-4 animate-spin' /> Đang tải khách
          hàng…
        </div>
      ) : pageItems.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center'>
          <Users className='mx-auto size-8 text-zinc-300' />
          <p className='mt-3 text-[14px] font-semibold text-zinc-700'>
            {hasFilters
              ? 'Không có khách hàng nào khớp filter'
              : t('users.empty')}
          </p>
          <p className='mt-1 text-[12px] text-zinc-500'>
            {hasFilters
              ? 'Thử đổi từ khoá hoặc clear filter.'
              : 'Bấm "Tạo khách hàng" để onboard brand mới.'}
          </p>
        </div>
      ) : view === 'grid' ? (
        <GridView items={pageItems} />
      ) : (
        <TableView
          items={pageItems}
          t={t}
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
          pageSize={pageSize}
          onChange={setPage}
        />
      )}

      {/* Bulk action bar — sticky bottom khi có selection ở table view. */}
      {selected.size > 0 && view === 'table' && (
        <div className='sticky bottom-4 z-30 mx-auto flex w-fit min-w-[320px] items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 shadow-2xl'>
          <span className='text-[12.5px] font-medium text-white'>
            Đã chọn{' '}
            <span className='rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-[11.5px]'>
              {selected.size}
            </span>{' '}
            brand
          </span>
          <button
            type='button'
            onClick={() => setSelected(new Set())}
            disabled={bulkBusy}
            className='rounded-md px-2 py-1 text-[11.5px] font-medium text-white/70 hover:bg-white/10 disabled:opacity-50'
          >
            Bỏ chọn
          </button>
          <div className='h-4 w-px bg-white/20' />
          <button
            type='button'
            onClick={runBulkDelete}
            disabled={bulkBusy}
            className='inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-rose-500 disabled:opacity-50'
          >
            <Trash2 className='size-3.5' />
            {bulkBusy ? 'Đang xoá…' : 'Xoá đã chọn'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Grid ──────────────────────────────────────────────────────────── */

function GridView({ items }: { items: Brand[] }) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {items.map(c => (
        <ClientCard key={c.id} item={c} />
      ))}
    </div>
  );
}

function ClientCard({ item }: { item: Brand }) {
  const statusClass =
    STATUS_CHIP[item.status?.toLowerCase()] ?? 'bg-zinc-100 text-zinc-600';
  return (
    <Link
      href={`/admin/users/${item.id}`}
      className='group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md'
    >
      <div className='flex items-start gap-3 p-4'>
        <Avatar id={item.id} name={item.name} size={48} />
        <div className='min-w-0 flex-1'>
          <h3 className='truncate text-[14px] font-semibold text-zinc-900'>
            {item.name}
          </h3>
          <p className='mt-0.5 truncate font-mono text-[10px] text-zinc-400'>
            {item.id.slice(0, 8)}…
          </p>
        </div>
      </div>
      <div className='mt-auto flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-4 py-2'>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
            statusClass
          )}
        >
          {item.status || '—'}
        </span>
        <span className='font-mono text-[10px] text-zinc-400'>
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString('vi-VN')
            : '—'}
        </span>
      </div>
    </Link>
  );
}

/* ─── Table ─────────────────────────────────────────────────────────── */

function TableView({
  items,
  t,
  selected,
  onToggleSelected,
  onToggleSelectAll,
}: {
  items: Brand[];
  t: ReturnType<typeof useTranslations>;
  selected: Set<string>;
  onToggleSelected: (id: string) => void;
  onToggleSelectAll: (ids: string[], allOn: boolean) => void;
}) {
  const ids = items.map(i => i.id);
  const allOn = ids.length > 0 && ids.every(id => selected.has(id));
  const someOn = ids.some(id => selected.has(id));
  return (
    <div className='border-border overflow-hidden rounded-2xl border bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-10'>
              <input
                type='checkbox'
                className='size-3.5 cursor-pointer rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400'
                checked={allOn}
                ref={el => {
                  if (el) el.indeterminate = someOn && !allOn;
                }}
                onChange={() => onToggleSelectAll(ids, allOn)}
                aria-label='Chọn tất cả'
              />
            </TableHead>
            <TableHead className='w-12' />
            <TableHead>{t('users.col.name')}</TableHead>
            <TableHead className='w-32'>{t('users.col.status')}</TableHead>
            <TableHead className='w-40'>{t('users.col.created')}</TableHead>
            <TableHead className='w-24' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => {
            const statusClass =
              STATUS_CHIP[item.status?.toLowerCase()] ??
              'bg-zinc-100 text-zinc-600';
            const isSelected = selected.has(item.id);
            return (
              <TableRow
                key={item.id}
                className={cn(
                  'hover:bg-zinc-50/50',
                  isSelected && 'bg-zinc-50'
                )}
              >
                <TableCell>
                  <input
                    type='checkbox'
                    className='size-3.5 cursor-pointer rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400'
                    checked={isSelected}
                    onChange={() => onToggleSelected(item.id)}
                    aria-label={`Chọn ${item.name}`}
                  />
                </TableCell>
                <TableCell>
                  <Avatar id={item.id} name={item.name} size={32} />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/users/${item.id}`}
                    className='font-medium hover:underline'
                  >
                    {item.name}
                  </Link>
                  <div className='text-content-muted truncate font-mono text-xs'>
                    {item.id}
                  </div>
                </TableCell>
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
                  <Link
                    href={`/admin/users/${item.id}`}
                    className='text-primary text-xs hover:underline'
                  >
                    {t('users.view')}
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/* ─── Avatar ────────────────────────────────────────────────────────── */

function Avatar({
  id,
  name,
  size,
}: {
  id: string;
  name: string;
  size: number;
}) {
  const initials = initialsOf(name);
  const gradient = gradientForId(id);
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-mono font-bold text-white shadow-sm',
        gradient
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.floor(size * 0.36)),
      }}
    >
      {initials}
    </div>
  );
}

/* ─── Pagination ────────────────────────────────────────────────────── */

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (next: number) => void;
}) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

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
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='inline-flex items-center gap-1.5'>
      <span className='text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase'>
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
  accent?: 'emerald' | 'amber' | 'rose';
}) {
  const accentActive: Record<NonNullable<typeof accent>, string> = {
    emerald: 'bg-emerald-600 text-white shadow-sm',
    amber: 'bg-amber-500 text-white shadow-sm',
    rose: 'bg-rose-600 text-white shadow-sm',
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
