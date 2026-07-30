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
  AlertTriangle,
  Archive,
  ArrowDownUp,
  BarChart3,
  ExternalLink,
  Eye,
  Flame,
  Globe,
  LayoutGrid,
  LayoutTemplate,
  Link2,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCwIcon,
  RotateCcw,
  Search,
  Send,
  Table as TableIcon,
  Trash2,
  Undo2,
  X as XIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Chip } from '@/components/atoms/chip';
import { DomainSettingsDialog } from '@/components/modules/Admin/DomainSettingsDialog';
import {
  CreateLandingDialog,
  EditLandingDialog,
} from '@/components/modules/Admin/LandingFormDialog';
import { BlocksUsedCell } from '@/components/modules/Admin/BlocksUsedCell';
import { Input } from '@/components/atoms/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { TablePagination } from '@/components/molecules/TablePagination';
import {
  adaptCanvasBlueprint,
  parseCanvas,
} from '@/components/modules/block-editor/serialize';
import type { Block } from '@/components/modules/block-editor/types';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Brand, Page, PageType } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

type StatusFilter = 'all' | 'draft' | 'published' | 'archived';
type TypeFilter = 'all' | PageType;
type Sort = '-updated_at' | '-created_at' | 'created_at' | 'name';
type View = 'grid' | 'table';

// Admin canvas editor route `/admin/landing-pages/[id]` — accepts slug, template
// UUID, hoặc page UUID (fallback khi page chưa có slug). Dùng cho "Mở editor"
// (kebab) + nút primary khi page chưa publish. Trang LIVE cho user xem là
// `/p/{slug}` (published) hoặc `external_url` — xem OpenLandingButton.
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
  archived: 'bg-muted text-content-muted',
};

const TYPE_CHIP: Record<string, string> = {
  landing: 'bg-rose-50 text-rose-700 border-rose-200',
  ad: 'bg-amber-50 text-amber-700 border-amber-200',
  curate: 'bg-violet-50 text-violet-700 border-violet-200',
  email: 'bg-blue-50 text-blue-700 border-blue-200',
};

/** Shared size + radius + border weight cho hàng filter (khớp Blocks). */
const FILTER_CONTROL_CLASS =
  'border-input text-content-muted hover:bg-muted bg-background h-9 w-40 shrink-0 rounded-md border px-2.5 text-xs font-medium outline-none';

type PageAction =
  'publish' | 'unpublish' | 'archive' | 'restore' | 'domain' | 'edit';

function pageThumbnailUrl(page: Page): string | undefined {
  if (page.thumbnail_url) return page.thumbnail_url;
  const meta = page.type_metadata as { featured_image?: string } | undefined;
  return meta?.featured_image || undefined;
}

export function AdminCanvasTemplatesPage() {
  const [items, setItems] = React.useState<Page[]>([]);
  const [total, setTotal] = React.useState(0);
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('landing');
  const [statusFilter, setStatusFilter] =
    React.useState<StatusFilter>('published');
  const [brandFilter, setBrandFilter] = React.useState<string>('');
  const [sort, setSort] = React.useState<Sort>('-updated_at');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [view, setView] = React.useState<View>('table');
  const [domainPage, setDomainPage] = React.useState<Page | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editPage, setEditPage] = React.useState<Page | null>(null);
  // Bulk selection — chỉ available ở table view. BE pages chỉ có
  // soft-delete (DELETE = archive); hard delete chưa expose. Bulk
  // action = bulk archive (status='archived'). Restore qua kebab.
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = React.useState(false);

  // Debounce search.
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter / pageSize change.
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter, statusFilter, brandFilter, sort, pageSize]);

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

  // Blocks-used-per-page — lazy fetch cho các dòng đang hiển thị. `Page`
  // không mang canvas trực tiếp (không như Template list vốn đôi khi có
  // draft_canvas_blueprint) nên luôn cần fetch riêng:
  //   1. `/public/pages/{slug}` — PRIMARY, cùng nguồn `/p/{slug}` render
  //      (đã verify hoạt động đúng ở PageOverlayView/BlockAnalyticsGrid).
  //   2. Fallback: revision MỚI NHẤT của page (`pages.revisions`, BE sort
  //      changed_at DESC → items[0]) — cho page chưa publish.
  //   KHÔNG dùng chuỗi fallback "tìm template sở hữu template_version_id"
  //   (PageOverlayView) ở đây — quá tốn (fan-out toàn bộ template + version
  //   list) cho MỘT dòng bảng, chưa nói tới N dòng đang hiển thị cùng lúc.
  // `items` chỉ đổi reference khi `load()` thật sự set data mới (server-side
  // paginate) nên không cần memo hoá như bên AdminTemplatesPage.
  const [blocksByPage, setBlocksByPage] = React.useState<
    Record<string, Block[] | 'loading' | 'error'>
  >({});
  const blocksFetchStartedRef = React.useRef<Set<string>>(new Set());
  // Reset về true ở ĐẦU effect (không chỉ khai `useRef(true)`) — React dev
  // Strict Mode mount→cleanup-giả-lập→mount lại effect ngay khi component
  // mount; nếu không reset ở mount thứ 2, cleanup của lần mount "giả" khoá
  // `alive=false` VĨNH VIỄN trước khi bất kỳ fetch async nào trả về, khiến
  // mọi kết quả bị chặn âm thầm → cột Blocks kẹt loading mãi mãi.
  const blocksAliveRef = React.useRef(true);
  React.useEffect(() => {
    blocksAliveRef.current = true;
    return () => {
      blocksAliveRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    for (const p of items) {
      if (blocksFetchStartedRef.current.has(p.id)) continue;
      blocksFetchStartedRef.current.add(p.id);

      if (p.external_url) {
        setBlocksByPage(prev => ({ ...prev, [p.id]: [] }));
        continue;
      }

      setBlocksByPage(prev => ({ ...prev, [p.id]: 'loading' }));
      (async () => {
        try {
          if (p.slug) {
            try {
              const pub = await rexerApi.publicPages.get(p.slug);
              const canvas = parseCanvas(
                adaptCanvasBlueprint(pub.canvas_blueprint)
              );
              const blocks = canvas?.pages.flatMap(pg => pg.blocks) ?? [];
              if (blocks.length > 0) {
                if (blocksAliveRef.current)
                  setBlocksByPage(prev => ({ ...prev, [p.id]: blocks }));
                return;
              }
            } catch {
              /* chưa publish — fallback revision */
            }
          }
          const revs = await rexerApi.pages.revisions(p.id, { limit: 1 });
          const latest = (revs.items ?? [])[0];
          const canvas = latest?.config_json
            ? parseCanvas(adaptCanvasBlueprint(latest.config_json))
            : null;
          const blocks = canvas?.pages.flatMap(pg => pg.blocks) ?? [];
          if (blocksAliveRef.current)
            setBlocksByPage(prev => ({ ...prev, [p.id]: blocks }));
        } catch {
          if (blocksAliveRef.current)
            setBlocksByPage(prev => ({ ...prev, [p.id]: 'error' }));
        }
      })();
    }
  }, [items]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await rexerApi.pages.listAll({
        page,
        limit: pageSize,
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
  }, [
    page,
    pageSize,
    sort,
    typeFilter,
    statusFilter,
    brandFilter,
    debouncedSearch,
  ]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Clear selection khi đổi filter/page.
  React.useEffect(() => {
    setSelected(new Set());
  }, [
    debouncedSearch,
    typeFilter,
    statusFilter,
    brandFilter,
    sort,
    view,
    page,
  ]);

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

  /** Bulk archive — `DELETE /v1/pages/:id` BE = soft delete
   *  (status='archived'). Restore qua kebab "Restore". */
  const runBulkArchive = React.useCallback(async () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    if (
      !window.confirm(
        `Archive ${ids.length} landing page?\n\nStatus → 'archived'. Restore được qua kebab "Restore".`
      )
    )
      return;
    setBulkBusy(true);
    const tid = toast.loading(`Archive ${ids.length} pages…`);
    let okCount = 0;
    let failCount = 0;
    await Promise.all(
      ids.map(async id => {
        try {
          await rexerApi.pages.archive(id);
          okCount += 1;
        } catch {
          failCount += 1;
        }
      })
    );
    if (failCount === 0) {
      toast.success(`Đã archive ${okCount} pages`, { id: tid });
    } else {
      toast.error(
        `${okCount}/${ids.length} OK, ${failCount} lỗi, reload để verify`,
        { id: tid }
      );
    }
    setSelected(new Set());
    setBulkBusy(false);
    await load();
  }, [selected, load]);

  // ── Hard delete (purge) ───────────────────────────────────────────────
  // Feature flag NEXT_PUBLIC_ENABLE_HARD_DELETE_PAGES gate UI vì BE
  // endpoint chưa ship (be-audit §19). Khi BE ready, flip flag = `true`.
  const HARD_DELETE_ENABLED =
    process.env.NEXT_PUBLIC_ENABLE_HARD_DELETE_PAGES === 'true';

  /** Open confirm modal — chỉ chạy khi tất cả selected pages đều status
   *  'archived' (tránh xoá nhầm page live). */
  const [purgeModalOpen, setPurgeModalOpen] = React.useState(false);

  /** Pages đang chọn có phải toàn archived không. Computed từ items
   *  trong cache + selected ids. */
  const selectedArchivedIds = React.useMemo(() => {
    const archivedSet = new Set(
      items.filter(p => p.status === 'archived').map(p => p.id)
    );
    return Array.from(selected).filter(id => archivedSet.has(id));
  }, [selected, items]);

  const allSelectedAreArchived =
    selected.size > 0 && selectedArchivedIds.length === selected.size;

  const runBulkPurge = React.useCallback(async () => {
    const ids = selectedArchivedIds;
    if (ids.length === 0) return;
    setPurgeModalOpen(false);
    setBulkBusy(true);
    const tid = toast.loading(`Đang xoá vĩnh viễn ${ids.length} pages…`);
    let okCount = 0;
    let failCount = 0;
    await Promise.all(
      ids.map(async id => {
        try {
          await rexerApi.pages.purge(id);
          okCount += 1;
        } catch {
          failCount += 1;
        }
      })
    );
    if (failCount === 0) {
      toast.success(`Đã xoá vĩnh viễn ${okCount} pages`, { id: tid });
    } else {
      toast.error(
        `${okCount}/${ids.length} OK, ${failCount} lỗi, BE có thể chưa ship endpoint`,
        { id: tid }
      );
    }
    setSelected(new Set());
    setBulkBusy(false);
    await load();
  }, [selectedArchivedIds, load]);

  // ── Page status mutations ────────────────────────────────────────────
  const runPageAction = async (action: PageAction, page: Page) => {
    if (action === 'domain') {
      setDomainPage(page);
      return;
    }
    if (action === 'edit') {
      setEditPage(page);
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

  return (
    <div className='flex h-full min-h-0 flex-col overflow-hidden'>
      {/* Header + filters — shrink-0; list body tự scroll. */}
      <div className='border-border bg-background shrink-0 border-b px-4 py-3'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h1 className='text-xl font-semibold'>Landing pages</h1>
            <p className='text-content-muted mt-0.5 text-xs'>
              Page instances xuyên brand · {total} pages
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='neutral'
              size='sm'
              onClick={load}
              disabled={loading}
            >
              <RefreshCwIcon
                className={cn('size-4', loading && 'animate-spin')}
              />
              Refresh
            </Button>
            <Button size='sm' onClick={() => setCreateOpen(true)}>
              <Plus className='size-4' />
              Tạo landing
            </Button>
          </div>
        </div>

        {/* Search + sort + filters — cùng h-9 / border-input như Blocks. */}
        <div className='mt-2 flex flex-wrap items-center gap-2'>
          <div className='relative min-w-48 flex-1 basis-56'>
            <Search className='text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
            <Input
              placeholder='Tìm theo tên / slug…'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='border-input h-9 rounded-md pl-8 shadow-none md:text-xs'
              aria-label='Tìm kiếm landing pages'
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as TypeFilter)}
            className={FILTER_CONTROL_CLASS}
            aria-label='Lọc theo type'
          >
            <option value='all'>Tất cả type</option>
            <option value='landing'>Landing</option>
            <option value='ad'>Ad</option>
            <option value='curate'>Curate</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as StatusFilter)}
            className={FILTER_CONTROL_CLASS}
            aria-label='Lọc theo trạng thái'
          >
            <option value='all'>Tất cả trạng thái</option>
            <option value='draft'>Draft</option>
            <option value='published'>Published</option>
            <option value='archived'>Archived</option>
          </select>

          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className={FILTER_CONTROL_CLASS}
            aria-label='Lọc theo brand'
          >
            <option value=''>Tất cả brand</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <div className='relative inline-flex items-center'>
            <ArrowDownUp className='text-muted-foreground pointer-events-none absolute left-2.5 size-3.5' />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as Sort)}
              className={cn(FILTER_CONTROL_CLASS, 'appearance-none pr-3 pl-8')}
              aria-label='Sort'
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type='button'
              onClick={clearFilters}
              className='text-content-muted hover:text-foreground inline-flex h-9 shrink-0 items-center gap-1 px-1.5 text-xs'
              aria-label='Xoá bộ lọc'
            >
              <XIcon className='size-3.5' />
              Clear
            </button>
          )}

          <div className='text-content-muted ml-auto inline-flex h-9 shrink-0 items-center text-xs tabular-nums'>
            {items.length} / {total}
          </div>

          <div className='border-input bg-background flex h-9 shrink-0 items-center gap-0.5 rounded-md border p-0.5'>
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
      </div>

      <div className='bg-muted/40 min-h-0 flex-1 overflow-y-auto px-4 py-3 pb-6'>
        {error && (
          <div className='border-destructive/20 bg-danger-bg text-destructive mb-3 rounded-lg border px-3 py-2 text-xs'>
            {error}
          </div>
        )}

        {/* List body */}
        {loading && items.length === 0 ? (
          <div className='text-content-muted flex items-center justify-center py-20 text-sm'>
            <RefreshCwIcon className='mr-2 size-4 animate-spin' /> Đang tải
            pages…
          </div>
        ) : items.length === 0 ? (
          <div className='border-border bg-card rounded-lg border border-dashed p-12 text-center'>
            <LayoutTemplate className='text-muted-foreground mx-auto size-8' />
            <p className='text-content-muted mt-3 text-sm font-semibold'>
              {hasActiveFilters
                ? 'Không có page nào khớp filter'
                : 'Chưa có page nào'}
            </p>
            <p className='text-content-muted mt-1 text-xs'>
              {hasActiveFilters
                ? 'Thử đổi từ khoá hoặc clear filter.'
                : 'Bấm "Tạo landing" để dựng từ template hoặc trỏ link domain.'}
            </p>
            {!hasActiveFilters && (
              <Button className='mt-4' onClick={() => setCreateOpen(true)}>
                <Plus className='size-4' />
                Tạo landing
              </Button>
            )}
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
            blocksByPage={blocksByPage}
            onAction={runPageAction}
            selected={selected}
            onToggleSelected={toggleSelected}
            onToggleSelectAll={toggleSelectAll}
          />
        )}

        {!loading && items.length > 0 && (
          <TablePagination
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={s => {
              setPageSize(s);
              setPage(1);
            }}
          />
        )}
      </div>

      {/* Bulk action bar — sticky bottom khi có selection ở table view. */}
      {selected.size > 0 && view === 'table' && (
        <div className='bg-foreground sticky bottom-4 z-30 mx-auto flex w-fit min-w-[320px] items-center gap-3 rounded-xl border border-zinc-700 px-4 py-2.5 shadow-2xl'>
          <span className='text-xs font-medium text-white'>
            Đã chọn{' '}
            <span className='text-2xs rounded-md bg-white/15 px-1.5 py-0.5 font-mono'>
              {selected.size}
            </span>{' '}
            landing
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
          <button
            type='button'
            onClick={runBulkArchive}
            disabled={bulkBusy}
            className='inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 disabled:opacity-50'
          >
            <Trash2 className='size-3.5' />
            {bulkBusy ? 'Đang xoá…' : 'Xoá (archive) đã chọn'}
          </button>
          {/* Hard delete — chỉ hiện khi flag ON + tất cả selected
              đều archived (avoid xoá nhầm live page). */}
          {HARD_DELETE_ENABLED && allSelectedAreArchived && (
            <button
              type='button'
              onClick={() => setPurgeModalOpen(true)}
              disabled={bulkBusy}
              className='inline-flex items-center gap-1.5 rounded-md border border-red-500/40 bg-red-950 px-3 py-1.5 text-xs font-medium text-red-100 hover:bg-red-900 disabled:opacity-50'
              title='Xoá vĩnh viễn, không khôi phục được'
            >
              <Flame className='size-3.5' />
              Xoá vĩnh viễn
            </button>
          )}
        </div>
      )}

      {HARD_DELETE_ENABLED && (
        <HardDeleteConfirmModal
          open={purgeModalOpen}
          count={selectedArchivedIds.length}
          onConfirm={runBulkPurge}
          onCancel={() => setPurgeModalOpen(false)}
        />
      )}

      {domainPage && (
        <DomainSettingsDialog
          open={!!domainPage}
          onOpenChange={o => !o && setDomainPage(null)}
          page={domainPage}
        />
      )}

      <CreateLandingDialog
        open={createOpen}
        brands={brands}
        onOpenChange={setCreateOpen}
        onCreated={() => load()}
      />
      <EditLandingDialog
        open={!!editPage}
        page={editPage}
        onOpenChange={o => !o && setEditPage(null)}
        onUpdated={updated => {
          setItems(prev => prev.map(p => (p.id === updated.id ? updated : p)));
          setEditPage(null);
        }}
      />
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
    TYPE_CHIP[item.type] ?? 'bg-muted text-content-muted border-border';
  const gradient =
    TYPE_GRADIENT[item.type] ?? 'from-zinc-400 via-zinc-500 to-zinc-600';
  return (
    <div className='group border-border hover:border-border bg-card flex flex-col rounded-2xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
      {/* Thumbnail area — gradient placeholder per type. BE Page response
          không trả thumbnail_url; thumbnail_asset_id rỗng cho hầu hết rows.
          Card root no longer clips (overflow-hidden removed) so the ⋮ action
          menu can escape; the thumbnail keeps its own rounding + clip. */}
      <div
        className={cn(
          'relative aspect-[16/10] overflow-hidden rounded-t-2xl bg-gradient-to-br',
          gradient
        )}
      >
        <div className='absolute inset-0 flex items-center justify-center'>
          <LayoutTemplate className='size-12 text-white/40' />
        </div>
        <span
          className={cn(
            'text-3xs absolute top-2 left-2 rounded-full border px-2 py-0.5 font-bold tracking-wider uppercase backdrop-blur',
            typeChipClass,
            'border-white/30 bg-white/80'
          )}
        >
          {item.type}
        </span>
        <span
          className={cn(
            'text-3xs absolute top-2 right-2 rounded-full px-2 py-0.5 font-bold tracking-wider uppercase shadow-sm backdrop-blur',
            statusClass
          )}
        >
          {item.status}
        </span>
      </div>

      <div className='flex flex-1 flex-col gap-2 p-3.5'>
        <h3 className='text-foreground line-clamp-1 text-sm font-semibold'>
          {item.name}
        </h3>
        {item.external_url ? (
          <span className='text-3xs text-content-muted line-clamp-1 inline-flex items-center gap-1 font-mono'>
            <Link2 className='size-3 shrink-0 text-indigo-500' />
            {item.external_url.replace(/^https?:\/\//, '')}
          </span>
        ) : item.slug ? (
          <code className='text-3xs text-content-muted line-clamp-1 font-mono'>
            /p/{item.slug}
          </code>
        ) : (
          <span className='text-3xs text-muted-foreground font-mono'>
            (chưa có slug)
          </span>
        )}

        <div className='text-3xs text-content-muted mt-auto flex items-center justify-between'>
          {brand ? (
            <Link
              href={`/admin/users/${brand.id}`}
              className='text-content-muted hover:text-foreground inline-flex items-center gap-1 truncate font-medium hover:underline'
            >
              {brand.name}
            </Link>
          ) : (
            <code className='text-muted-foreground font-mono'>
              {item.brand_id.slice(0, 8)}…
            </code>
          )}
          <span className='text-muted-foreground font-mono'>
            {item.updated_at
              ? new Date(item.updated_at).toLocaleDateString('vi-VN')
              : '-'}
          </span>
        </div>

        <div className='mt-1 flex items-stretch gap-1.5'>
          <div className='flex-1'>
            <OpenLandingButton page={item} variant='primary' />
          </div>
          <Link
            href={`/admin/users/${item.brand_id}`}
            className='border-border text-content-muted hover:bg-muted bg-background inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors'
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
        className='border-border text-content-muted hover:bg-muted bg-background inline-flex h-full items-center justify-center rounded-lg border px-2 transition-colors'
        aria-label='Hành động'
        aria-expanded={open}
      >
        <MoreVertical className='size-3.5' />
      </button>
      {open && (
        <div className='border-border bg-card absolute top-full right-0 z-30 mt-1 w-48 overflow-hidden rounded-lg border shadow-lg'>
          {/* Mở editor (canvas) — chỉ landing dựng từ template (không external). */}
          {!page.external_url && (
            <Link
              href={`/admin/landing-pages/${page.slug || page.id}`}
              onClick={() => setOpen(false)}
              className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
            >
              <LayoutTemplate className='size-3.5 text-violet-600' />
              Mở editor (canvas)
            </Link>
          )}
          {/* Sửa thông tin (tên / slug / link) — mọi status. */}
          <button
            type='button'
            onClick={choose('edit')}
            className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
          >
            <Pencil className='text-content-muted size-3.5' />
            Sửa thông tin
          </button>
          {/* Analytics — always available regardless of status. */}
          <Link
            href={`/admin/landing-pages/${page.slug || page.id}/analytics`}
            onClick={() => setOpen(false)}
            className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
          >
            <BarChart3 className='size-3.5 text-blue-600' />
            Analytics
          </Link>
          <div className='bg-muted h-px' />
          {page.status === 'draft' && (
            <button
              type='button'
              onClick={choose('publish')}
              className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
            >
              <Send className='size-3.5 text-emerald-600' />
              Publish
            </button>
          )}
          {page.status === 'published' && (
            <button
              type='button'
              onClick={choose('unpublish')}
              className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
            >
              <Undo2 className='size-3.5 text-amber-600' />
              Unpublish
            </button>
          )}
          {page.status === 'archived' && (
            <button
              type='button'
              onClick={choose('restore')}
              className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
            >
              <RotateCcw className='text-content-muted size-3.5' />
              Restore (→ draft)
            </button>
          )}
          <div className='bg-muted h-px' />
          <button
            type='button'
            onClick={choose('domain')}
            className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
          >
            <Globe className='size-3.5 text-blue-600' />
            Cài đặt domain
          </button>
          {page.status !== 'archived' && (
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
      ? 'bg-foreground text-background hover:bg-foreground/85'
      : 'border border-border bg-background text-content-muted hover:bg-muted';

  // External landing → mở thẳng URL ngoài (tab mới).
  if (page.external_url) {
    return (
      <a
        href={page.external_url}
        target='_blank'
        rel='noreferrer'
        className={cn(baseCls, enabledCls)}
        title={`Mở link ngoài: ${page.external_url}`}
      >
        <ExternalLink className='size-3.5' />
        Mở link
      </a>
    );
  }

  // Template landing đã publish + có slug → xem TRANG LIVE /p/{slug} (tab mới).
  if (page.status === 'published' && page.slug) {
    return (
      <a
        href={`/p/${page.slug}`}
        target='_blank'
        rel='noreferrer'
        className={cn(baseCls, enabledCls)}
        title={`Xem trang công khai: /p/${page.slug}`}
      >
        <Eye className='size-3.5' />
        Xem landing
      </a>
    );
  }

  // Chưa publish (hoặc chưa có slug) → chưa có trang live → mở editor.
  return (
    <Link
      href={publicLandingUrl(segment)}
      className={cn(baseCls, enabledCls)}
      title='Chưa publish, mở editor'
    >
      <Pencil className='size-3.5' />
      Mở editor
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
    <Chip
      selected={active}
      size='md'
      onClick={onClick}
      title={label}
      className='size-8 rounded-md border-transparent px-0 shadow-none'
      aria-label={label}
    >
      {icon}
    </Chip>
  );
}

/* ─── Table ─────────────────────────────────────────────────────────── */

function TableView({
  items,
  brandById,
  blocksByPage,
  onAction,
  selected,
  onToggleSelected,
  onToggleSelectAll,
}: {
  items: Page[];
  brandById: Map<string, Brand>;
  blocksByPage: Record<string, Block[] | 'loading' | 'error'>;
  onAction: (action: PageAction, page: Page) => void;
  selected: Set<string>;
  onToggleSelected: (id: string) => void;
  onToggleSelectAll: (ids: string[], allOn: boolean) => void;
}) {
  const ids = items.map(i => i.id);
  const allOn = ids.length > 0 && ids.every(id => selected.has(id));
  const someOn = ids.some(id => selected.has(id));
  return (
    <div className='border-border bg-card overflow-hidden rounded-lg border'>
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
            <TableHead className='w-64 min-w-64'>Page</TableHead>
            <TableHead className='w-24'>Type</TableHead>
            <TableHead className='w-28'>Status</TableHead>
            <TableHead className='w-44'>Brand</TableHead>
            <TableHead className='w-32'>Cập nhật</TableHead>
            <TableHead className='w-32'>Blocks</TableHead>
            <TableHead className='w-44' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(p => {
            const statusClass = STATUS_CHIP[p.status] ?? STATUS_CHIP.archived;
            const typeClass =
              TYPE_CHIP[p.type] ?? 'bg-muted text-content-muted';
            const brand = brandById.get(p.brand_id);
            const isSelected = selected.has(p.id);
            const thumb = pageThumbnailUrl(p);
            const gradient =
              TYPE_GRADIENT[p.type] ?? 'from-zinc-400 via-zinc-500 to-zinc-600';
            return (
              <TableRow key={p.id} className={cn(isSelected && 'bg-muted')}>
                <TableCell>
                  <input
                    type='checkbox'
                    className='border-border text-foreground focus:ring-ring size-3.5 cursor-pointer rounded'
                    checked={isSelected}
                    onChange={() => onToggleSelected(p.id)}
                    aria-label={`Chọn ${p.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className='flex w-56 flex-col gap-1.5'>
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={p.name}
                        className='border-border h-13.5 w-28 rounded-md border object-cover'
                      />
                    ) : (
                      <div
                        className={cn(
                          'flex h-13.5 w-28 items-center justify-center rounded-md bg-linear-to-br',
                          gradient
                        )}
                      >
                        <LayoutTemplate className='size-5 text-white/50' />
                      </div>
                    )}
                    <div className='min-w-0'>
                      <div className='text-sm leading-snug font-medium wrap-break-word whitespace-normal'>
                        {p.name}
                        {p.external_url && (
                          <span className='text-3xs ml-1 inline-flex items-center gap-0.5 rounded-full bg-indigo-50 px-1.5 py-0.5 align-middle font-bold tracking-wider text-indigo-700 uppercase'>
                            <Link2 className='size-2.5' />
                            External
                          </span>
                        )}
                      </div>
                      <div className='text-3xs text-muted-foreground mt-0.5 font-mono wrap-break-word whitespace-normal'>
                        {p.external_url ? (
                          <code>
                            {p.external_url.replace(/^https?:\/\//, '')}
                          </code>
                        ) : p.slug ? (
                          <code>/p/{p.slug}</code>
                        ) : (
                          <span>(chưa có slug)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'text-3xs rounded-full border px-2 py-0.5 font-bold tracking-wider uppercase',
                      typeClass
                    )}
                  >
                    {p.type}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'text-3xs rounded-full px-2 py-0.5 font-medium',
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
                      className='text-content-muted hover:text-foreground inline-flex items-center gap-1 text-xs font-medium hover:underline'
                    >
                      {brand.name}
                      <ExternalLink className='text-muted-foreground size-3' />
                    </Link>
                  ) : (
                    <code className='text-3xs text-content-muted font-mono'>
                      {p.brand_id.slice(0, 8)}…
                    </code>
                  )}
                </TableCell>
                <TableCell className='text-content-muted text-xs'>
                  {p.updated_at
                    ? new Date(p.updated_at).toLocaleDateString('vi-VN')
                    : '-'}
                </TableCell>
                <TableCell>
                  <BlocksUsedCell state={blocksByPage[p.id]} />
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

/* ─── HardDeleteConfirmModal ─────────────────────────────────────────
 * Type-to-confirm modal cho bulk hard delete. User phải gõ chính xác
 * "XOA" để enable nút confirm — pattern GitHub repo delete. Irreversible
 * nên cần friction. */
function HardDeleteConfirmModal({
  open,
  count,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = React.useState('');
  const KEYWORD = 'XOA';

  React.useEffect(() => {
    if (!open) setTyped('');
  }, [open]);

  if (!open) return null;

  const isConfirmed = typed === KEYWORD;

  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
      onClick={onCancel}
    >
      <div
        className='bg-card w-full max-w-md rounded-2xl p-6 shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex items-start gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100'>
            <AlertTriangle className='size-5 text-red-600' />
          </div>
          <div className='flex-1'>
            <h3 className='text-foreground text-base font-bold'>
              Xoá vĩnh viễn {count} landing pages?
            </h3>
            <p className='text-content-muted mt-1 text-xs leading-relaxed'>
              Hành động này{' '}
              <span className='font-semibold text-red-700'>
                KHÔNG thể khôi phục
              </span>
              . Page, versions, analytics events sẽ bị xoá khỏi DB. Khác với
              &quot;Archive&quot; (chỉ ẩn, restore được).
            </p>
          </div>
        </div>

        <div className='mt-5'>
          <label className='text-2xs text-content-muted block font-medium'>
            Gõ{' '}
            <span className='font-mono font-bold text-red-700'>{KEYWORD}</span>{' '}
            vào ô dưới để confirm:
          </label>
          <input
            type='text'
            value={typed}
            onChange={e => setTyped(e.target.value)}
            autoFocus
            placeholder={KEYWORD}
            className='border-border bg-muted focus:bg-background mt-1.5 w-full rounded-lg border px-3 py-2 font-mono text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200'
          />
        </div>

        <div className='mt-5 flex items-center justify-end gap-2'>
          <Button type='button' variant='ghost' size='sm' onClick={onCancel}>
            Huỷ
          </Button>
          <Button
            type='button'
            variant='destructive'
            size='sm'
            onClick={onConfirm}
            disabled={!isConfirmed}
          >
            <Flame className='size-3.5' />
            Xoá vĩnh viễn {count}
          </Button>
        </div>
      </div>
    </div>
  );
}
