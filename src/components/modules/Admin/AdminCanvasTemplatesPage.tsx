'use client';

/**
 * Admin/staff cross-brand landing pages list — `/admin/landing-pages`.
 *
 * 2026-05-30 cutover: migrated from template catalog (`/v1/templates`) to
 * Page instances (`/v1/pages`). The page now answers "all landings ever
 * created" instead of duplicating `/admin/templates`. Each row is a Page
 * created by admin/brand from a template, with brand + workspace context.
 *
 * Endpoint shipped 2026-05-30 (not yet in swagger):
 *   GET /v1/pages                              # all system pages
 *   GET /v1/pages?type=landing                 # filter by surface
 *   GET /v1/pages?type=landing&brand_id=<uuid> # brand-scoped
 * Plus `status`, `q`, `page`, `limit`, `sort`.
 */

import * as React from 'react';
import Link from 'next/link';
import {
  Archive,
  ArrowDownUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Globe,
  LayoutGrid,
  LayoutTemplate,
  MoreVertical,
  RefreshCwIcon,
  RotateCcw,
  Search,
  Send,
  Table as TableIcon,
  Undo2,
  X as XIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { DomainSettingsDialog } from '@/components/dialogs/DomainSettingsDialog';
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
import type { Brand, Page, PageType } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

type StatusFilter = 'all' | 'draft' | 'published' | 'archived';
type TypeFilter = 'all' | PageType;
type Sort = '-updated_at' | '-created_at' | 'created_at' | 'name';
type View = 'grid' | 'table';

// "Mở landing" navigates to the admin canvas editor. Route
// `/admin/landing-pages/[id]` accepts:
//   • slug (string)         → lookup page by slug → template
//   • template UUID         → render directly
//   • page UUID (fallback)  → lookup page by id → template
// Pages without slug (vd "Landing Hero v1 - Copy" tạo qua dialog mà admin
// không điền slug) vẫn mở được — link dùng page.id.
function publicLandingUrl(slugOrId: string): string {
  return `/admin/landing-pages/${slugOrId}`;
}

const TYPE_GRADIENT: Record<string, string> = {
  landing: 'from-rose-400 via-rose-500 to-red-500',
  ad: 'from-amber-400 via-orange-400 to-orange-500',
  curate: 'from-violet-500 via-fuchsia-500 to-pink-500',
  email: 'from-blue-400 via-blue-500 to-indigo-500',
};

const SORT_OPTIONS: { id: Sort; label: string }[] = [
  { id: '-updated_at', label: 'Mới cập nhật' },
  { id: '-created_at', label: 'Mới tạo nhất' },
  { id: 'created_at', label: 'Cũ nhất' },
  { id: 'name', label: 'Tên A→Z' },
];

const STATUS_CHIP: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-700',
  published: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-zinc-200 text-zinc-600',
};

const TYPE_CHIP: Record<string, string> = {
  landing: 'bg-rose-50 text-rose-700 border-rose-200',
  ad: 'bg-amber-50 text-amber-700 border-amber-200',
  curate: 'bg-violet-50 text-violet-700 border-violet-200',
  email: 'bg-blue-50 text-blue-700 border-blue-200',
};

const LIMIT = 20;

type PageAction = 'publish' | 'unpublish' | 'archive' | 'restore' | 'domain';

export function AdminCanvasTemplatesPage() {
  const [items, setItems] = React.useState<Page[]>([]);
  const [total, setTotal] = React.useState(0);
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('landing');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [brandFilter, setBrandFilter] = React.useState<string>('');
  const [sort, setSort] = React.useState<Sort>('-updated_at');
  const [page, setPage] = React.useState(1);
  const [view, setView] = React.useState<View>('grid');
  const [domainPage, setDomainPage] = React.useState<Page | null>(null);

  // Debounce search.
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter change.
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter, statusFilter, brandFilter, sort]);

  // Load brand list once for the filter picker + display name lookup.
  React.useEffect(() => {
    rexerApi.brands
      .list({ page: 1, limit: 100 })
      .then(r => setBrands(r.items ?? []))
      .catch(() => setBrands([]));
  }, []);

  const brandById = React.useMemo(() => {
    const m = new Map<string, Brand>();
    for (const b of brands) m.set(b.id, b);
    return m;
  }, [brands]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await rexerApi.pages.listAll({
        page,
        limit: LIMIT,
        sort,
        ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(brandFilter ? { brand_id: brandFilter } : {}),
        ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
      });
      setItems(r.items ?? []);
      setTotal(r.total ?? r.items?.length ?? 0);
    } catch (err) {
      setError(
        err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED'
      );
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, sort, typeFilter, statusFilter, brandFilter, debouncedSearch]);

  React.useEffect(() => {
    load();
  }, [load]);

  // ── Page status mutations ────────────────────────────────────────────
  const runPageAction = async (action: PageAction, page: Page) => {
    if (action === 'domain') {
      setDomainPage(page);
      return;
    }
    const label = {
      publish: 'Publish',
      unpublish: 'Unpublish',
      archive: 'Archive',
      restore: 'Restore',
    }[action];
    if (action === 'archive') {
      if (!window.confirm(`Archive "${page.name}"?\n\nPage status → archived.`))
        return;
    }
    const tid = toast.loading(`${label}…`);
    try {
      if (action === 'publish') {
        // Kebab publish ở list không biết HEAD version → để BE giữ
        // page.template_version_id hiện tại (back-compat). User cần
        // editor → Save Version → Publish để snapshot HEAD (be-audit
        // §13 wired ở BlockEditor.handlePublishToggle).
        await rexerApi.pages.publish(page.id);
      } else if (action === 'unpublish')
        await rexerApi.pages.unpublish(page.id);
      else if (action === 'archive') await rexerApi.pages.archive(page.id);
      else if (action === 'restore') await rexerApi.pages.restore(page.id);
      toast.success(`${label} thành công`, { id: tid });
      await load();
    } catch (err) {
      const msg =
        err instanceof RxApiError ? err.code || err.message : 'ACTION_FAILED';
      toast.error(`${label} thất bại: ${msg}`, { id: tid });
    }
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('landing');
    setStatusFilter('all');
    setBrandFilter('');
    setSort('-updated_at');
  };

  const hasActiveFilters =
    typeFilter !== 'landing' ||
    statusFilter !== 'all' ||
    !!brandFilter ||
    !!search.trim();

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className='flex flex-col gap-4 p-6'>
      {/* Header */}
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.18em] text-zinc-500 uppercase'>
            <LayoutTemplate className='size-3' /> Landing pages
          </div>
          <h1 className='mt-1 text-2xl font-semibold tracking-tight'>
            Tất cả landing pages
          </h1>
          <p className='text-content-muted mt-1 text-sm'>
            Page instances xuyên brand · {total} pages · click brand để xem
            detail
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={load} disabled={loading}>
            <RefreshCwIcon
              className={cn('size-4', loading && 'animate-spin')}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Toolbar — search + sort */}
      <div className='flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm'>
        <div className='relative max-w-sm flex-1'>
          <Search className='absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400' />
          <Input
            placeholder='Tìm theo tên / slug…'
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
        <FilterGroup label='Type'>
          <ChipBtn
            active={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
            label='Tất cả'
          />
          <ChipBtn
            active={typeFilter === 'landing'}
            onClick={() => setTypeFilter('landing')}
            label='Landing'
            accent='rose'
          />
          <ChipBtn
            active={typeFilter === 'ad'}
            onClick={() => setTypeFilter('ad')}
            label='Ad'
            accent='amber'
          />
          <ChipBtn
            active={typeFilter === 'curate'}
            onClick={() => setTypeFilter('curate')}
            label='Curate'
            accent='violet'
          />
        </FilterGroup>

        <span className='hidden h-4 w-px bg-zinc-200 sm:block' />

        <FilterGroup label='Status'>
          <ChipBtn
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
            label='Tất cả'
          />
          <ChipBtn
            active={statusFilter === 'draft'}
            onClick={() => setStatusFilter('draft')}
            label='Draft'
            accent='amber'
          />
          <ChipBtn
            active={statusFilter === 'published'}
            onClick={() => setStatusFilter('published')}
            label='Published'
            accent='emerald'
          />
          <ChipBtn
            active={statusFilter === 'archived'}
            onClick={() => setStatusFilter('archived')}
            label='Archived'
          />
        </FilterGroup>

        <span className='hidden h-4 w-px bg-zinc-200 sm:block' />

        <FilterGroup label='Brand'>
          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className='rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 outline-none hover:bg-zinc-50'
          >
            <option value=''>Tất cả brand</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
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

        <div className='ml-auto text-[10.5px] text-zinc-500'>
          {items.length} / {total}
        </div>
      </div>

      {error && (
        <div className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800'>
          {error}
        </div>
      )}

      {/* List body */}
      {loading && items.length === 0 ? (
        <div className='flex items-center justify-center py-20 text-sm text-zinc-500'>
          <RefreshCwIcon className='mr-2 size-4 animate-spin' /> Đang tải pages…
        </div>
      ) : items.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center'>
          <LayoutTemplate className='mx-auto size-8 text-zinc-300' />
          <p className='mt-3 text-[14px] font-semibold text-zinc-700'>
            {hasActiveFilters
              ? 'Không có page nào khớp filter'
              : 'Chưa có page nào'}
          </p>
          <p className='mt-1 text-[12px] text-zinc-500'>
            {hasActiveFilters
              ? 'Thử đổi từ khoá hoặc clear filter.'
              : 'Vào /admin/templates → click "Sử dụng" để tạo landing đầu tiên.'}
          </p>
        </div>
      ) : view === 'grid' ? (
        <GridView
          items={items}
          brandById={brandById}
          onAction={runPageAction}
        />
      ) : (
        <TableView
          items={items}
          brandById={brandById}
          onAction={runPageAction}
        />
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

      {domainPage && (
        <DomainSettingsDialog
          open={!!domainPage}
          onOpenChange={o => !o && setDomainPage(null)}
          page={domainPage}
        />
      )}
    </div>
  );
}

/* ─── Grid ──────────────────────────────────────────────────────────── */

function GridView({
  items,
  brandById,
  onAction,
}: {
  items: Page[];
  brandById: Map<string, Brand>;
  onAction: (action: PageAction, page: Page) => void;
}) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {items.map(p => (
        <PageCard
          key={p.id}
          item={p}
          brand={brandById.get(p.brand_id)}
          onAction={onAction}
        />
      ))}
    </div>
  );
}

function PageCard({
  item,
  brand,
  onAction,
}: {
  item: Page;
  brand: Brand | undefined;
  onAction: (action: PageAction, page: Page) => void;
}) {
  const statusClass = STATUS_CHIP[item.status] ?? STATUS_CHIP.archived;
  const typeChipClass =
    TYPE_CHIP[item.type] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200';
  const gradient =
    TYPE_GRADIENT[item.type] ?? 'from-zinc-400 via-zinc-500 to-zinc-600';
  return (
    <div className='group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md'>
      {/* Thumbnail area — gradient placeholder per type. BE Page response
          không trả thumbnail_url; thumbnail_asset_id rỗng cho hầu hết rows. */}
      <div
        className={cn(
          'relative aspect-[16/10] overflow-hidden bg-gradient-to-br',
          gradient
        )}
      >
        <div className='absolute inset-0 flex items-center justify-center'>
          <LayoutTemplate className='size-12 text-white/40' />
        </div>
        <span
          className={cn(
            'absolute top-2 left-2 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur',
            typeChipClass,
            'border-white/30 bg-white/80'
          )}
        >
          {item.type}
        </span>
        <span
          className={cn(
            'absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-sm backdrop-blur',
            statusClass
          )}
        >
          {item.status}
        </span>
      </div>

      <div className='flex flex-1 flex-col gap-2 p-3.5'>
        <h3 className='line-clamp-1 text-[14px] font-semibold text-zinc-900'>
          {item.name}
        </h3>
        {item.slug ? (
          <code className='line-clamp-1 font-mono text-[10.5px] text-zinc-500'>
            /p/{item.slug}
          </code>
        ) : (
          <span className='font-mono text-[10.5px] text-zinc-400'>
            (chưa có slug)
          </span>
        )}

        <div className='mt-auto flex items-center justify-between text-[10.5px] text-zinc-500'>
          {brand ? (
            <Link
              href={`/admin/users/${brand.id}`}
              className='inline-flex items-center gap-1 truncate font-medium text-zinc-700 hover:text-zinc-900 hover:underline'
            >
              {brand.name}
            </Link>
          ) : (
            <code className='font-mono text-zinc-400'>
              {item.brand_id.slice(0, 8)}…
            </code>
          )}
          <span className='font-mono text-zinc-400'>
            {item.updated_at
              ? new Date(item.updated_at).toLocaleDateString('vi-VN')
              : '—'}
          </span>
        </div>

        <div className='mt-1 flex items-stretch gap-1.5'>
          <div className='flex-1'>
            <OpenLandingButton page={item} variant='primary' />
          </div>
          <Link
            href={`/admin/users/${item.brand_id}`}
            className='inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50'
            title='Mở brand detail'
          >
            <ExternalLink className='size-3' />
          </Link>
          <PageActionMenu page={item} onAction={onAction} />
        </div>
      </div>
    </div>
  );
}

/** Per-page actions: publish/unpublish/archive/restore. Surface depends on
 *  current status — never show "Publish" for already-published, etc. */
function PageActionMenu({
  page,
  onAction,
}: {
  page: Page;
  onAction: (action: PageAction, page: Page) => void;
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

  const choose = (action: PageAction) => () => {
    setOpen(false);
    onAction(action, page);
  };

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
        <div className='absolute right-0 bottom-full z-20 mb-1 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg'>
          {/* Analytics — always available regardless of status. */}
          <Link
            href={`/admin/landing-pages/${page.slug || page.id}/analytics`}
            onClick={() => setOpen(false)}
            className='flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-zinc-700 hover:bg-zinc-50'
          >
            <BarChart3 className='size-3.5 text-blue-600' />
            Analytics
          </Link>
          <div className='h-px bg-zinc-100' />
          {page.status === 'draft' && (
            <button
              type='button'
              onClick={choose('publish')}
              className='flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-zinc-700 hover:bg-zinc-50'
            >
              <Send className='size-3.5 text-emerald-600' />
              Publish
            </button>
          )}
          {page.status === 'published' && (
            <button
              type='button'
              onClick={choose('unpublish')}
              className='flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-zinc-700 hover:bg-zinc-50'
            >
              <Undo2 className='size-3.5 text-amber-600' />
              Unpublish
            </button>
          )}
          {page.status === 'archived' && (
            <button
              type='button'
              onClick={choose('restore')}
              className='flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-zinc-700 hover:bg-zinc-50'
            >
              <RotateCcw className='size-3.5 text-zinc-600' />
              Restore (→ draft)
            </button>
          )}
          <div className='h-px bg-zinc-100' />
          <button
            type='button'
            onClick={choose('domain')}
            className='flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-zinc-700 hover:bg-zinc-50'
          >
            <Globe className='size-3.5 text-blue-600' />
            Cài đặt domain
          </button>
          {page.status !== 'archived' && (
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

/** Open landing in admin canvas editor. Prefers slug for human-readable
 *  URL; falls back to page UUID khi page chưa có slug (route resolver
 *  handles both shapes). */
function OpenLandingButton({
  page,
  variant,
}: {
  page: Page;
  variant?: 'primary' | 'ghost';
}) {
  const segment = page.slug || page.id;
  const baseCls =
    'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors';
  const enabledCls =
    variant === 'primary'
      ? 'bg-zinc-900 text-white hover:bg-zinc-700'
      : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50';
  return (
    <Link
      href={publicLandingUrl(segment)}
      className={cn(baseCls, enabledCls)}
      title={
        page.slug
          ? `Mở editor (slug: ${page.slug})`
          : 'Mở editor (page chưa có slug, dùng id)'
      }
    >
      <Eye className='size-3.5' />
      Mở landing
    </Link>
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

/* ─── Table ─────────────────────────────────────────────────────────── */

function TableView({
  items,
  brandById,
  onAction,
}: {
  items: Page[];
  brandById: Map<string, Brand>;
  onAction: (action: PageAction, page: Page) => void;
}) {
  return (
    <div className='overflow-hidden rounded-2xl border border-zinc-200 bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên page</TableHead>
            <TableHead className='w-24'>Type</TableHead>
            <TableHead className='w-28'>Status</TableHead>
            <TableHead className='w-44'>Brand</TableHead>
            <TableHead className='w-32'>Cập nhật</TableHead>
            <TableHead className='w-44' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(p => {
            const statusClass = STATUS_CHIP[p.status] ?? STATUS_CHIP.archived;
            const typeClass = TYPE_CHIP[p.type] ?? 'bg-zinc-100 text-zinc-600';
            const brand = brandById.get(p.brand_id);
            return (
              <TableRow key={p.id}>
                <TableCell>
                  <div className='font-medium'>{p.name}</div>
                  <div className='flex items-center gap-2 font-mono text-[10.5px] text-zinc-400'>
                    {p.slug ? <code>{p.slug}</code> : <span>—</span>}
                    <span>·</span>
                    <code>{p.id.slice(0, 12)}…</code>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                      typeClass
                    )}
                  >
                    {p.type}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10.5px] font-medium',
                      statusClass
                    )}
                  >
                    {p.status}
                  </span>
                </TableCell>
                <TableCell>
                  {brand ? (
                    <Link
                      href={`/admin/users/${brand.id}`}
                      className='inline-flex items-center gap-1 text-[12px] font-medium text-zinc-700 hover:text-zinc-900 hover:underline'
                    >
                      {brand.name}
                      <ExternalLink className='size-3 text-zinc-400' />
                    </Link>
                  ) : (
                    <code className='font-mono text-[10.5px] text-zinc-500'>
                      {p.brand_id.slice(0, 8)}…
                    </code>
                  )}
                </TableCell>
                <TableCell className='text-xs text-zinc-500'>
                  {p.updated_at
                    ? new Date(p.updated_at).toLocaleDateString('vi-VN')
                    : '—'}
                </TableCell>
                <TableCell>
                  <div className='flex items-center justify-end gap-1.5'>
                    <OpenLandingButton page={p} variant='ghost' />
                    <PageActionMenu page={p} onAction={onAction} />
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
  accent?: 'rose' | 'amber' | 'violet' | 'emerald';
}) {
  const accentActive: Record<NonNullable<typeof accent>, string> = {
    rose: 'bg-rose-600 text-white shadow-sm',
    amber: 'bg-amber-500 text-white shadow-sm',
    violet: 'bg-violet-600 text-white shadow-sm',
    emerald: 'bg-emerald-600 text-white shadow-sm',
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
