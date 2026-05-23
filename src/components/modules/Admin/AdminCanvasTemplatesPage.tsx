'use client';

/**
 * Admin/staff list of landing pages (BE table `canvas_templates`). Phase 1
 * managed-service: Rexer staff drafts each landing, optionally marks it as
 * a library template, and assigns it to a brand workspace via the hand-off
 * modal.
 *
 * Standard list affordances: search, status/type/active filters, sort,
 * grid + table view toggle, pagination — all server-side via the existing
 * `/canvas-templates?q=&page=&limit=&sort=&is_template=&is_active=` params.
 */

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  LayoutTemplate,
  RefreshCwIcon,
  Search,
  SendIcon,
  SparklesIcon,
  Table as TableIcon,
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
import type { CanvasTemplate } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

import { AdminAssignTemplateDialog } from './AdminAssignTemplateDialog';

type View = 'grid' | 'table';
type Status = 'all' | 'active' | 'inactive';
type Kind = 'all' | 'library' | 'assigned' | 'draft';
type Sort = '-updated_at' | '-created_at' | 'created_at' | 'name';

const SORT_OPTIONS: { id: Sort; label: string }[] = [
  { id: '-updated_at', label: 'Mới cập nhật' },
  { id: '-created_at', label: 'Mới tạo nhất' },
  { id: 'created_at', label: 'Cũ nhất' },
  { id: 'name', label: 'Tên A→Z' },
];

const LIMIT = 12;

export function AdminCanvasTemplatesPage() {
  const [items, setItems] = React.useState<CanvasTemplate[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [status, setStatus] = React.useState<Status>('all');
  const [kind, setKind] = React.useState<Kind>('all');
  const [sort, setSort] = React.useState<Sort>('-updated_at');
  const [view, setView] = React.useState<View>('grid');
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [assignTarget, setAssignTarget] = React.useState<CanvasTemplate | null>(
    null
  );

  // Debounce search so we don't burn requests on every keystroke
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when any filter changes
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, kind, sort]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: Parameters<typeof rexerApi.canvasTemplates.list>[0] = {
        page,
        limit: LIMIT,
        sort,
      };
      if (debouncedSearch.trim()) query.q = debouncedSearch.trim();
      if (status === 'active') query.is_active = true;
      else if (status === 'inactive') query.is_active = false;
      if (kind === 'library') query.is_template = true;
      else if (kind === 'assigned' || kind === 'draft')
        query.is_template = false;
      const r = await rexerApi.canvasTemplates.list(query);
      let arr = r.items ?? [];
      // assigned vs draft is a sub-filter on the client because BE doesn't
      // expose has_client_id directly — both share is_template=false.
      if (kind === 'assigned') arr = arr.filter(t => !!t.client_id);
      else if (kind === 'draft') arr = arr.filter(t => !t.client_id);
      setItems(arr);
      setTotal(r.total ?? arr.length);
      setTotalPages(Math.max(1, r.total_pages ?? 1));
    } catch (err) {
      setError(
        err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED'
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, kind, sort, page]);

  React.useEffect(() => {
    load();
  }, [load]);

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setKind('all');
    setSort('-updated_at');
  };

  const hasActiveFilters =
    status !== 'all' || kind !== 'all' || !!search.trim();

  return (
    <div className='flex flex-col gap-4 p-6'>
      {/* Header */}
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.18em] text-zinc-500 uppercase'>
            <LayoutTemplate className='size-3' /> Landing pages
          </div>
          <h1 className='mt-1 text-2xl font-semibold tracking-tight'>
            Landing pages
          </h1>
          <p className='text-content-muted mt-1 text-sm'>
            Rexer drafts · assign sang brand workspace để họ chỉnh sửa và
            publish · {total} landing
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={load} disabled={loading}>
            <RefreshCwIcon
              className={cn('size-4', loading && 'animate-spin')}
            />
            Refresh
          </Button>
          <Button asChild>
            <Link href='/canvas-templates'>
              <SparklesIcon className='size-4' />
              Editor mới
            </Link>
          </Button>
        </div>
      </div>

      {/* Toolbar — search + sort + view toggle */}
      <div className='flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm'>
        <div className='relative max-w-sm flex-1'>
          <Search className='absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400' />
          <Input
            placeholder='Tìm theo tên / mô tả…'
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
      <div className='flex flex-wrap items-center gap-2'>
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
            active={status === 'inactive'}
            onClick={() => setStatus('inactive')}
            label='Inactive'
          />
        </FilterGroup>

        <span className='hidden h-4 w-px bg-zinc-200 sm:block' />

        <FilterGroup label='Loại'>
          <ChipBtn
            active={kind === 'all'}
            onClick={() => setKind('all')}
            label='Tất cả'
          />
          <ChipBtn
            active={kind === 'library'}
            onClick={() => setKind('library')}
            label='Library'
            accent='violet'
          />
          <ChipBtn
            active={kind === 'assigned'}
            onClick={() => setKind('assigned')}
            label='Đã assign'
            accent='blue'
          />
          <ChipBtn
            active={kind === 'draft'}
            onClick={() => setKind('draft')}
            label='Draft'
          />
        </FilterGroup>

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

      {error && (
        <div className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800'>
          {error}
        </div>
      )}

      {/* List body */}
      {loading && items.length === 0 ? (
        <div className='flex items-center justify-center py-20 text-sm text-zinc-500'>
          <RefreshCwIcon className='mr-2 size-4 animate-spin' /> Đang tải
          landing pages…
        </div>
      ) : items.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center'>
          <LayoutTemplate className='mx-auto size-8 text-zinc-300' />
          <p className='mt-3 text-[14px] font-semibold text-zinc-700'>
            {hasActiveFilters
              ? 'Không có landing nào khớp filter'
              : 'Chưa có landing page nào'}
          </p>
          <p className='mt-1 text-[12px] text-zinc-500'>
            {hasActiveFilters
              ? 'Thử đổi từ khoá hoặc clear filter.'
              : 'Bấm "Editor mới" để tạo landing đầu tiên.'}
          </p>
        </div>
      ) : view === 'grid' ? (
        <GridView items={items} onAssign={setAssignTarget} />
      ) : (
        <TableView items={items} onAssign={setAssignTarget} />
      )}

      {/* Pagination */}
      {items.length > 0 && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={LIMIT}
          onChange={setPage}
        />
      )}

      <AdminAssignTemplateDialog
        open={!!assignTarget}
        template={assignTarget}
        onClose={() => setAssignTarget(null)}
        onAssigned={updated => {
          setItems(prev =>
            prev.map(it => (it.id === updated.id ? updated : it))
          );
          toast.success(
            'Brand sẽ thấy template này trong /portal/landing-pages'
          );
        }}
      />
    </div>
  );
}

/* ─── Grid ──────────────────────────────────────────────────────────── */

function GridView({
  items,
  onAssign,
}: {
  items: CanvasTemplate[];
  onAssign: (t: CanvasTemplate) => void;
}) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {items.map(t => (
        <LandingCard key={t.id} item={t} onAssign={() => onAssign(t)} />
      ))}
    </div>
  );
}

function LandingCard({
  item,
  onAssign,
}: {
  item: CanvasTemplate;
  onAssign: () => void;
}) {
  const tag = describeKind(item);
  return (
    <div className='group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md'>
      {/* Thumbnail — BE thumbnail_url with gradient fallback */}
      <Link
        href={`/canvas-templates/${item.id}`}
        className='relative block aspect-[16/10] overflow-hidden border-b border-zinc-100 bg-gradient-to-br from-zinc-100 via-zinc-200/60 to-zinc-100'
        title='Mở editor'
      >
        {item.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail_url}
            alt={item.name}
            className='size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <LayoutTemplate className='size-10 text-zinc-300' />
          </div>
        )}
        {/* Status chip top-left */}
        <span
          className={cn(
            'absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider backdrop-blur',
            item.is_active
              ? 'bg-emerald-50/90 text-emerald-700'
              : 'bg-zinc-100/90 text-zinc-500'
          )}
        >
          {item.is_active ? 'ACTIVE' : 'INACTIVE'}
        </span>
        {/* Kind chip top-right */}
        <span
          className={cn(
            'absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider backdrop-blur',
            tag.chip
          )}
        >
          {tag.label}
        </span>
      </Link>

      {/* Body */}
      <div className='flex flex-1 flex-col gap-2 p-3.5'>
        <h3 className='line-clamp-1 text-[14px] font-semibold text-zinc-900'>
          {item.name}
        </h3>
        {item.description && (
          <p className='line-clamp-2 text-[11.5px] leading-snug text-zinc-500'>
            {item.description}
          </p>
        )}
        <div className='mt-auto flex items-center justify-between text-[10.5px] text-zinc-500'>
          <span>
            {item.client_id ? (
              <code className='font-mono text-zinc-600'>
                {item.client_id.slice(0, 8)}…
              </code>
            ) : (
              <span className='text-zinc-400'>chưa assign</span>
            )}
          </span>
          <span className='font-mono text-zinc-400'>
            {item.updated_at
              ? new Date(item.updated_at).toLocaleDateString('vi-VN')
              : '—'}
          </span>
        </div>

        <div className='mt-1 flex gap-1.5'>
          <Button asChild variant='outline' size='sm' className='flex-1'>
            <Link href={`/canvas-templates/${item.id}`}>Editor</Link>
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={onAssign}
            title='Assign sang brand'
            className='flex-1'
          >
            <SendIcon className='size-3.5' />
            Assign
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Table ─────────────────────────────────────────────────────────── */

function TableView({
  items,
  onAssign,
}: {
  items: CanvasTemplate[];
  onAssign: (t: CanvasTemplate) => void;
}) {
  return (
    <div className='overflow-hidden rounded-2xl border border-zinc-200 bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-20'>Thumb</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead className='w-32'>Trạng thái</TableHead>
            <TableHead className='w-44'>Brand</TableHead>
            <TableHead className='w-32'>Cập nhật</TableHead>
            <TableHead className='w-36' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(t => {
            const tag = describeKind(t);
            return (
              <TableRow key={t.id}>
                <TableCell>
                  <Link
                    href={`/canvas-templates/${t.id}`}
                    className='block aspect-[4/3] w-16 overflow-hidden rounded-md border border-zinc-200 bg-gradient-to-br from-zinc-100 to-zinc-200'
                  >
                    {t.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.thumbnail_url}
                        alt={t.name}
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
                  <div className='font-medium'>{t.name}</div>
                  <div className='text-content-muted truncate font-mono text-[10.5px]'>
                    {t.id}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10.5px] font-medium',
                      t.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-zinc-100 text-zinc-600'
                    )}
                  >
                    {t.is_active ? 'active' : 'inactive'}
                  </span>
                  <span
                    className={cn(
                      'ml-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium',
                      tag.chip
                    )}
                  >
                    {tag.label}
                  </span>
                </TableCell>
                <TableCell className='text-[12px] text-zinc-600'>
                  {t.client_id ? (
                    <code className='font-mono text-[10.5px]'>
                      {t.client_id.slice(0, 8)}…
                    </code>
                  ) : (
                    <span className='text-zinc-400'>chưa assign</span>
                  )}
                </TableCell>
                <TableCell className='text-xs text-zinc-500'>
                  {t.updated_at
                    ? new Date(t.updated_at).toLocaleDateString('vi-VN')
                    : '—'}
                </TableCell>
                <TableCell>
                  <div className='flex items-center justify-end gap-1'>
                    <Button asChild variant='ghost' size='sm' title='Mở editor'>
                      <Link href={`/canvas-templates/${t.id}`}>Editor</Link>
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onAssign(t)}
                      title='Assign sang brand'
                    >
                      <SendIcon className='size-3.5' />
                      Assign
                    </Button>
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

  // Compute compact page-number window — always show first / last, current
  // ± 1, with ellipses where there are gaps.
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
          aria-label='Trang trước'
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
                'inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 font-mono text-[11px] font-semibold tabular-nums transition-colors',
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
          aria-label='Trang sau'
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
      <div className='inline-flex items-center gap-1'>{children}</div>
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
  accent?: 'emerald' | 'violet' | 'blue';
}) {
  const accentActive: Record<NonNullable<typeof accent>, string> = {
    emerald: 'bg-emerald-600 text-white shadow-sm',
    violet: 'bg-violet-600 text-white shadow-sm',
    blue: 'bg-blue-600 text-white shadow-sm',
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

/**
 * Classifies a template into one of 3 buckets the admin cares about, with
 * the matching chip styling. Keeps the chip palette consistent grid/table.
 */
function describeKind(t: CanvasTemplate): { label: string; chip: string } {
  if (t.is_template) {
    return {
      label: 'LIBRARY',
      chip: 'bg-violet-100 text-violet-700',
    };
  }
  if (t.client_id) {
    return {
      label: 'ASSIGNED',
      chip: 'bg-blue-100 text-blue-700',
    };
  }
  return {
    label: 'DRAFT',
    chip: 'bg-zinc-100 text-zinc-600',
  };
}
