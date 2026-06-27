'use client';

/**
 * Block management center — `/admin/blocks` (+ `/portal/blocks` mirror).
 *
 * Wave 3 cutover (2026-05-30): migrated from localStorage `savedBlocks`
 * helper to BE `/v1/blocks`. Endpoints wired:
 *   GET    /v1/blocks                        → list (`rexerApi.blocks.list`)
 *   PATCH  /v1/blocks/:id                    → rename + tag + info update
 *   DELETE /v1/blocks/:id                    → archive
 *   POST   /v1/blocks/:id/clone              → duplicate
 *   POST   /v1/blocks/:id/use                → not used here (canvas editor calls)
 *
 * BE `Block.settings` stores the editor's Block JSON (set by FE on save) —
 * we parse it back here so `BlockMiniPreview` can render. When settings
 * isn't a valid editor Block (e.g. brand_private rows seeded server-side),
 * the card shows the gradient placeholder only.
 *
 * Edit-in-canvas is still Wave 3 work (handler shows informative toast).
 */

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bookmark,
  Check,
  ChevronDown,
  Copy,
  Eye,
  FlaskConical,
  LayoutGrid,
  Loader2,
  MoreVertical,
  Pencil,
  PencilRuler,
  Play,
  Plus,
  RefreshCw,
  Search,
  Table as TableIcon,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Chip } from '@/components/atoms/chip';
import { Input } from '@/components/atoms/input';
import { EmptyState } from '@/components/molecules/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { BlockMiniPreview } from '@/components/modules/block-editor/BlockMiniPreview';
import { TablePagination } from '@/components/molecules/TablePagination';
import { BLOCK_TYPE_META } from '@/components/modules/block-editor/types';
import type {
  Block as EditorBlock,
  BlockType,
} from '@/components/modules/block-editor/types';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Block as ServerBlock, BlockStatus } from '@/services/rexer/types';
import { cn } from '@/lib/cn';
import {
  BLOCK_STATUS_META,
  BLOCK_STATUS_ORDER,
  BlockStatusBadge,
  effectiveBlockStatus,
} from '@/lib/block-status';

import { AddBuiltinBlockDialog } from './AddBuiltinBlockDialog';
import { EditBlockDialog } from './EditBlockDialog';

type View = 'grid' | 'table';

// Derive từ registry BLOCK_TYPE_META (nguồn duy nhất). Thêm block type mới
// chỉ cần 1 entry ở types.ts — 2 map này tự đầy đủ.
const BLOCK_TYPE_LABEL: Record<BlockType, string> = Object.fromEntries(
  Object.values(BLOCK_TYPE_META).map(m => [m.type, m.adminLabel])
) as Record<BlockType, string>;

const BLOCK_TYPE_GRADIENT: Record<BlockType, string> = Object.fromEntries(
  Object.values(BLOCK_TYPE_META).map(m => [m.type, m.gradient])
) as Record<BlockType, string>;

function fmtDate(iso?: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fmtRelative(iso?: string): string {
  if (!iso) return '-';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const day = Math.floor(diff / 86_400_000);
  if (day < 1) return 'hôm nay';
  if (day < 7) return `${day} ngày trước`;
  if (day < 30) return `${Math.floor(day / 7)} tuần trước`;
  return fmtDate(iso);
}

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

/**
 * Try parsing `Block.settings` back to an editor Block. FE writes editor
 * Block as-is into settings on create, so the round-trip works for blocks
 * the FE owns. Returns null for any row whose settings doesn't look like
 * an editor Block (shows gradient-only card).
 */
function parseEditorBlock(
  settings: Record<string, unknown> | undefined
): EditorBlock | null {
  if (!settings || typeof settings !== 'object') return null;
  if (!('blockType' in settings)) return null;
  return settings as unknown as EditorBlock;
}

export function BlocksPage() {
  const router = useRouter();
  const pathname = usePathname();
  // Brand portal mounts this component at /portal/blocks. In that context the
  // side-drawer is replaced by a dedicated detail route (/portal/blocks/[id])
  // so the URL clearly reads as portal — admin/staff still get the drawer.
  const isPortal = pathname?.startsWith('/portal') ?? false;
  const detailBase = isPortal ? '/portal/blocks' : '/admin/blocks';

  const [items, setItems] = React.useState<ServerBlock[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [view, setView] = React.useState<View>('table');
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<BlockType | 'all'>('all');
  const [statusFilter, setStatusFilter] = React.useState<BlockStatus | 'all'>(
    'all'
  );
  const [tagFilter, setTagFilter] = React.useState<string[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  // Bulk select (xoá nhiều) — giữ id, chung cho cả grid + table.
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = React.useState(false);
  const [catalogOpen, setCatalogOpen] = React.useState(false);
  // Block đang sửa thông tin (name/description/tags) qua EditBlockDialog.
  const [editTarget, setEditTarget] = React.useState<ServerBlock | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await rexerApi.blocks.list({ limit: 200 });
      setItems(r.items ?? []);
    } catch (err) {
      setError(rxMessage(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  // Options filter type: từ registry FE BLOCK_TYPE_META (nguồn duy nhất) + gộp
  // thêm type_code có trong data mà registry chưa phủ (đừng để block nào không lọc được).
  const typeOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const [code, label] of Object.entries(BLOCK_TYPE_LABEL)) {
      map.set(code, label);
    }
    for (const it of items) {
      if (!map.has(it.type_code)) map.set(it.type_code, it.type_code);
    }
    return Array.from(map, ([code, label]) => ({ code, label })).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [items]);

  // Số block đã có theo type_code → chip "đã có N" trong dialog thêm block.
  const typeCounts = React.useMemo(() => {
    const m: Record<string, number> = {};
    for (const it of items) m[it.type_code] = (m[it.type_code] ?? 0) + 1;
    return m;
  }, [items]);

  // type_code đã được map vào ít nhất 1 block → EditBlockDialog ẩn khỏi combobox
  // Mapping code (dev chỉ thấy block mới code chưa assign).
  const usedTypeCodes = React.useMemo(
    () => new Set(Object.keys(typeCounts)),
    [typeCounts]
  );

  // Đếm block theo trạng thái → strip thống kê (bấm = lọc nhanh).
  const statusCounts = React.useMemo(() => {
    const m: Record<BlockStatus, number> = {
      draft: 0,
      in_dev: 0,
      review: 0,
      changes_requested: 0,
      published: 0,
    };
    for (const it of items) m[effectiveBlockStatus(it)]++;
    return m;
  }, [items]);

  // Distinct tags across all rows for the filter chip row.
  const allTags = React.useMemo(() => {
    const s = new Set<string>();
    for (const it of items) for (const t of it.tags ?? []) s.add(t);
    return Array.from(s).sort();
  }, [items]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(e => {
      if (typeFilter !== 'all' && e.type_code !== typeFilter) return false;
      if (statusFilter !== 'all' && effectiveBlockStatus(e) !== statusFilter)
        return false;
      // Multi-tag: block phải chứa TẤT CẢ tag đã chọn (AND — lọc thu hẹp).
      if (
        tagFilter.length > 0 &&
        !tagFilter.every(t => (e.tags ?? []).includes(t))
      )
        return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.type_code.toLowerCase().includes(q) ||
        (e.tags ?? []).some(t => t.includes(q))
      );
    });
  }, [items, search, typeFilter, statusFilter, tagFilter]);

  // Reset trang + bỏ chọn khi đổi filter; slice client-side cho cả grid + table.
  React.useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [search, typeFilter, statusFilter, tagFilter]);

  const paged = React.useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const handleDuplicate = async (id: string) => {
    const tid = toast.loading('Đang clone…');
    try {
      const dup = await rexerApi.blocks.clone(id);
      toast.success(`Đã clone: "${dup.name}"`, { id: tid });
      await load();
      setSelectedId(dup.id);
    } catch (err) {
      toast.error(`Clone thất bại: ${rxMessage(err)}`, { id: tid });
    }
  };

  // Chỉ cho xoá block ở trạng thái Nháp (draft) — block đã/đang dùng (in_dev,
  // review, published…) không được xoá để tránh mất nội dung đang chạy.
  const isDraft = (b: ServerBlock) => effectiveBlockStatus(b) === 'draft';

  const handleDelete = async (block: ServerBlock) => {
    if (!isDraft(block)) {
      toast.error('Chỉ xoá được block ở trạng thái Nháp (draft).');
      return;
    }
    if (!window.confirm(`Xoá "${block.name}"?`)) return;
    const tid = toast.loading('Đang xoá…');
    try {
      await rexerApi.blocks.archive(block.id);
      toast.success('Đã xoá', { id: tid });
      if (selectedId === block.id) setSelectedId(null);
      await load();
    } catch (err) {
      toast.error(`Xoá thất bại: ${rxMessage(err)}`, { id: tid });
    }
  };

  // ── Bulk select ──────────────────────────────────────────────────────────
  // Chỉ cho chọn block draft (non-draft bị chặn xoá nên không chọn được).
  const toggleSelect = (id: string) =>
    setSelected(prev => {
      const block = items.find(b => b.id === id);
      if (block && !isDraft(block)) return prev;
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Select-all CHỈ thao tác trên block draft của TRANG hiện tại (paged); selection
  // giữ qua các trang. Block không phải draft không cho chọn (xoá bị chặn).
  const pageDraftIds = paged.filter(isDraft).map(b => b.id);
  const allOnPage =
    pageDraftIds.length > 0 && pageDraftIds.every(id => selected.has(id));
  const someOnPage = pageDraftIds.some(id => selected.has(id));
  const toggleSelectAll = () =>
    setSelected(prev => {
      const next = new Set(prev);
      if (allOnPage) pageDraftIds.forEach(id => next.delete(id));
      else pageDraftIds.forEach(id => next.add(id));
      return next;
    });

  // Xoá (archive) các block đã chọn — tuần tự để không đập BE; lỗi nào bỏ qua,
  // báo lại cuối.
  const handleBulkDelete = async () => {
    // Defensive: chỉ archive block còn ở trạng thái draft.
    const ids = Array.from(selected).filter(id => {
      const b = items.find(x => x.id === id);
      return b && isDraft(b);
    });
    if (ids.length === 0) {
      toast.error('Chỉ xoá được block ở trạng thái Nháp (draft).');
      return;
    }
    if (
      !window.confirm(
        `Xoá ${ids.length} block đã chọn?\n\nKHÔNG hoàn tác được (archive).`
      )
    )
      return;
    setBulkDeleting(true);
    let ok = 0;
    const failed: string[] = [];
    for (const id of ids) {
      try {
        await rexerApi.blocks.archive(id);
        ok += 1;
      } catch {
        failed.push(id);
      }
    }
    setBulkDeleting(false);
    setSelected(new Set());
    if (selectedId && ids.includes(selectedId)) setSelectedId(null);
    if (ok > 0) toast.success(`Đã xoá ${ok} block`);
    if (failed.length > 0) toast.error(`${failed.length} block không xoá được`);
    await load();
  };

  /** Mở dialog sửa thông tin block (name/description/tags). Nội dung canvas
   *  (settings) vẫn chỉnh trong block editor riêng. */
  const handleEdit = (block: ServerBlock) => {
    setEditTarget(block);
  };

  // Mở block trên CANVAS editor (block-direct): điều hướng thẳng tới route edit,
  // editor load `blocks.get` → canvas, sửa xong dùng 🔖 ghi đè bản gốc
  // (blocks.update). KHÔNG còn tạo canvas-template tạm.
  const handleOpenCanvas = (block: ServerBlock) => {
    const editorBlock = parseEditorBlock(block.settings);
    if (!editorBlock) {
      toast.error('Block không có canvas data hợp lệ để sửa trên editor.');
      return;
    }
    router.push(`${detailBase}/${block.id}/edit`);
  };

  // Preview = mở DEV preview page (/dev/blocks?id=…) ở tab mới — full layout +
  // animation, scroll/pin neo đúng viewport. id-mode fetch block thật rồi render
  // đúng settings đã lưu (quan trọng cho type dùng chung như hero_split).
  //
  // Guard id rỗng: nếu server trả block không có `id` (sai field / thiếu
  // migrate) thì KHÔNG mở tab default ngầm — báo lỗi rõ + dump object ra
  // console để soi đúng field BE trả về, thay vì lặng lẽ rơi về arpeggio.
  const handlePreview = (block: ServerBlock) => {
    if (!block.id) {
      // eslint-disable-next-line no-console
      console.warn('[blocks] preview: block thiếu id từ server →', block);
      toast.error(
        `Block "${block.name}" không có id từ server — không mở preview được (xem console).`
      );
      return;
    }
    window.open(
      `/dev/blocks?id=${encodeURIComponent(block.id)}`,
      '_blank',
      'noopener'
    );
  };

  const openDetail = (id: string) => {
    if (isPortal) {
      router.push(`${detailBase}/${id}`);
    } else {
      setSelectedId(id);
    }
  };

  // Click vào 1 block → mở Preview (layout + animation) ngay. Admin bỏ drawer;
  // portal vẫn vào route chi tiết riêng. Edit/Clone/Xoá nằm ở action mỗi hàng/card.
  const handleRowClick = (id: string) => {
    if (isPortal) {
      openDetail(id);
      return;
    }
    const block = items.find(b => b.id === id);
    if (block) handlePreview(block);
  };

  return (
    <div className='flex h-[calc(100vh-3.5rem)]'>
      {/* Main column */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Header */}
        <div className='border-border bg-background border-b px-4 py-3'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h1 className='text-xl font-semibold'>Blocks</h1>
            </div>
            <div className='flex items-center gap-2'>
              {!isPortal && (
                <Button
                  variant='neutral'
                  size='sm'
                  onClick={() => router.push('/admin/blocks/preview')}
                  title='Xem & seed block code từ src/blocks (dev)'
                >
                  <FlaskConical />
                  Dev preview
                </Button>
              )}
              <Button
                variant='neutral'
                size='sm'
                onClick={load}
                disabled={loading}
              >
                <RefreshCw className={cn(loading && 'animate-spin')} />
                Refresh
              </Button>
              <Button size='sm' onClick={() => setCatalogOpen(true)}>
                <Plus />
                Tạo mới
              </Button>
            </div>
          </div>

          {/* Thống kê trạng thái — chip bấm để lọc nhanh. Gọn 1 hàng để chừa
              chiều cao cho list nội dung. */}
          {items.length > 0 && (
            <div className='mt-2 flex flex-wrap items-center gap-1.5'>
              <StatTile
                label='Tất cả'
                value={items.length}
                active={statusFilter === 'all'}
                onClick={() => setStatusFilter('all')}
              />
              {BLOCK_STATUS_ORDER.map(s => (
                <StatTile
                  key={s}
                  label={BLOCK_STATUS_META[s].label}
                  value={statusCounts[s]}
                  dot={BLOCK_STATUS_META[s].dot}
                  active={statusFilter === s}
                  onClick={() =>
                    setStatusFilter(statusFilter === s ? 'all' : s)
                  }
                />
              ))}
            </div>
          )}

          {/* Search + filter + view — gộp 1 hàng ngang cho gọn. */}
          <div className='mt-2 flex flex-wrap items-center gap-2'>
            <div className='relative min-w-[180px] flex-1'>
              <Search className='text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
              <Input
                placeholder='Tìm theo tên / block type / tag…'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='pl-8'
              />
            </div>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as BlockType | 'all')}
              className='border-border text-content-muted hover:bg-muted bg-background rounded-lg border px-2.5 py-1.5 text-xs font-medium outline-none'
            >
              <option value='all'>Tất cả type</option>
              {typeOptions.map(o => (
                <option key={o.code} value={o.code}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as BlockStatus | 'all')
              }
              className='border-border text-content-muted hover:bg-muted bg-background rounded-lg border px-2.5 py-1.5 text-xs font-medium outline-none'
            >
              <option value='all'>Tất cả trạng thái</option>
              {BLOCK_STATUS_ORDER.map(s => (
                <option key={s} value={s}>
                  {BLOCK_STATUS_META[s].label}
                </option>
              ))}
            </select>

            {allTags.length > 0 && (
              <TagMultiSelect
                allTags={allTags}
                value={tagFilter}
                onChange={setTagFilter}
              />
            )}

            {(typeFilter !== 'all' ||
              statusFilter !== 'all' ||
              tagFilter.length > 0) && (
              <button
                type='button'
                onClick={() => {
                  setTypeFilter('all');
                  setStatusFilter('all');
                  setTagFilter([]);
                }}
                className='text-3xs text-content-muted hover:text-foreground inline-flex items-center gap-1'
              >
                <X className='size-3' />
                Clear
              </button>
            )}

            <div className='text-3xs text-content-muted ml-auto'>
              {filtered.length} / {items.length}
            </div>

            <div className='border-border bg-background flex items-center gap-1 rounded-lg border p-0.5'>
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

        {/* Body */}
        <div className='bg-muted/40 flex-1 overflow-y-auto px-4 py-3'>
          {error && (
            <div className='border-destructive/20 bg-danger-bg text-destructive mb-3 rounded-lg border px-3 py-2 text-xs'>
              Load blocks thất bại: <code className='font-mono'>{error}</code>
            </div>
          )}
          {loading && items.length === 0 ? (
            <div className='text-content-muted flex items-center justify-center py-20 text-sm'>
              <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải blocks…
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Bookmark className='size-10' />}
              title={
                items.length === 0
                  ? 'Chưa có saved block'
                  : 'Không khớp tìm kiếm'
              }
              description={
                items.length === 0
                  ? 'Tạo block trong canvas editor rồi lưu vào thư viện.'
                  : 'Đổi từ khoá hoặc xoá filter để xem tất cả.'
              }
            />
          ) : view === 'grid' ? (
            <GridView
              items={paged}
              selectedId={selectedId}
              selected={selected}
              onToggleSelect={toggleSelect}
              onSelect={handleRowClick}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onOpenCanvas={handleOpenCanvas}
              openingCanvas={null}
              onPreview={handlePreview}
            />
          ) : (
            <TableView
              items={paged}
              selectedId={selectedId}
              selected={selected}
              onToggleSelect={toggleSelect}
              allOnPage={allOnPage}
              someOnPage={someOnPage}
              selectAllDisabled={pageDraftIds.length === 0}
              onToggleAll={toggleSelectAll}
              onSelect={handleRowClick}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onOpenCanvas={handleOpenCanvas}
              openingCanvas={null}
              onPreview={handlePreview}
            />
          )}

          {!loading && filtered.length > 0 && (
            <TablePagination
              total={filtered.length}
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
      </div>

      <AddBuiltinBlockDialog
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        counts={typeCounts}
        onAdded={id => {
          load();
          openDetail(id);
        }}
      />

      <EditBlockDialog
        open={!!editTarget}
        onOpenChange={open => {
          if (!open) setEditTarget(null);
        }}
        block={editTarget}
        usedTypeCodes={usedTypeCodes}
        onSaved={updated => {
          setItems(prev => prev.map(b => (b.id === updated.id ? updated : b)));
          setEditTarget(null);
        }}
      />

      {/* Thanh hành động bulk — fixed đáy giữa, hiện khi đã chọn block. */}
      {selected.size > 0 && (
        <div className='bg-foreground fixed bottom-4 left-1/2 z-40 flex w-fit min-w-[320px] -translate-x-1/2 items-center gap-3 rounded-xl border border-zinc-700 px-4 py-2.5 shadow-2xl'>
          <span className='text-xs font-medium text-white'>
            Đã chọn{' '}
            <span className='text-2xs rounded-md bg-white/15 px-1.5 py-0.5 font-mono'>
              {selected.size}
            </span>{' '}
            block
          </span>
          <button
            type='button'
            onClick={() => setSelected(new Set())}
            disabled={bulkDeleting}
            className='text-2xs rounded-md px-2 py-1 font-medium text-white/70 hover:bg-white/10 disabled:opacity-50'
          >
            Bỏ chọn
          </button>
          <div className='h-4 w-px bg-white/20' />
          <button
            type='button'
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className='inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 disabled:opacity-50'
          >
            {bulkDeleting ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <Trash2 className='size-3.5' />
            )}
            {bulkDeleting ? 'Đang xoá…' : 'Xoá đã chọn'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Grid ───────────────────────────────────────────────────────────── */

function GridView({
  items,
  selectedId,
  selected,
  onToggleSelect,
  onSelect,
  onDuplicate,
  onDelete,
  onEdit,
  onOpenCanvas,
  openingCanvas,
  onPreview,
}: {
  items: ServerBlock[];
  selectedId: string | null;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (item: ServerBlock) => void;
  onEdit: (item: ServerBlock) => void;
  onOpenCanvas: (item: ServerBlock) => void;
  openingCanvas: string | null;
  onPreview: (item: ServerBlock) => void;
}) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {items.map(it => (
        <BlockCard
          key={it.id}
          item={it}
          active={it.id === selectedId}
          checked={selected.has(it.id)}
          onToggleSelect={() => onToggleSelect(it.id)}
          onClick={() => onSelect(it.id)}
          onDuplicate={() => onDuplicate(it.id)}
          onDelete={() => onDelete(it)}
          onEdit={() => onEdit(it)}
          onOpenCanvas={() => onOpenCanvas(it)}
          opening={openingCanvas === it.id}
          onPreview={() => onPreview(it)}
        />
      ))}
    </div>
  );
}

function BlockCard({
  item,
  active,
  checked,
  onToggleSelect,
  onClick,
  onDuplicate,
  onDelete,
  onEdit,
  onOpenCanvas,
  opening,
  onPreview,
}: {
  item: ServerBlock;
  active: boolean;
  checked: boolean;
  onToggleSelect: () => void;
  onClick: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onOpenCanvas: () => void;
  opening: boolean;
  onPreview: () => void;
}) {
  const type = item.type_code as BlockType;
  const gradient = BLOCK_TYPE_GRADIENT[type] ?? 'from-zinc-400 to-zinc-600';
  const label = BLOCK_TYPE_LABEL[type] ?? item.type_code;
  const editorBlock = parseEditorBlock(item.settings);
  const extraCount = editorBlock?.extraElements?.length ?? 0;
  const hasMobile = !!editorBlock?.contentVi?.mobile;
  // Chỉ block Nháp (draft) mới chọn được để xoá.
  const draft = effectiveBlockStatus(item) === 'draft';
  return (
    <div
      className={cn(
        'group bg-card relative flex flex-col overflow-hidden rounded-xl border text-left shadow-sm transition-all hover:shadow-md',
        active || checked
          ? 'border-foreground ring-foreground/10 ring-2'
          : 'border-border hover:border-border'
      )}
    >
      {/* Checkbox chọn để xoá hàng loạt — chỉ block Nháp; hiện khi chọn / hover. */}
      {draft && (
        <label
          onClick={e => e.stopPropagation()}
          className={cn(
            'bg-background/85 absolute top-2 left-2 z-20 flex size-6 cursor-pointer items-center justify-center rounded-md shadow-sm ring-1 ring-black/5 backdrop-blur transition-opacity',
            checked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
          <input
            type='checkbox'
            checked={checked}
            onChange={onToggleSelect}
            className='size-3.5 cursor-pointer rounded'
            aria-label={`Chọn ${item.name}`}
          />
        </label>
      )}

      <div className='absolute top-2 right-2 z-10 flex items-center gap-1'>
        {/* Quick preview button — opens full-screen layout + animation */}
        <button
          type='button'
          onClick={e => {
            e.stopPropagation();
            onPreview();
          }}
          className='text-content-muted hover:text-foreground bg-background/85 hover:bg-background flex size-7 items-center justify-center rounded-full shadow-sm ring-1 ring-black/5 backdrop-blur transition-all'
          title='Xem preview (layout + animation)'
          aria-label='Preview block'
        >
          <Play className='size-3.5' />
        </button>
        <CardKebabMenu
          onDetail={onClick}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onEdit={onEdit}
          onOpenCanvas={onOpenCanvas}
          opening={opening}
          onPreview={onPreview}
        />
      </div>

      {/* Card body — div + role="button" (KHÔNG <button>) vì
          BlockMiniPreview chứa carousel với <button> prev/next nested.
          Nested <button> = hydration error per react. Pattern giống
          fix CatalogCard trước đó. */}
      <div
        role='button'
        tabIndex={0}
        onClick={onClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className='flex flex-1 cursor-pointer flex-col text-left'
      >
        <div className='relative'>
          {/* Ưu tiên thumbnail custom (BE thumbnail_url) → preview render từ
              settings → gradient placeholder. Khớp precedence với TableView. */}
          {item.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.thumbnail_url}
              alt={item.name}
              className='aspect-[4/3] w-full object-cover'
            />
          ) : editorBlock ? (
            <BlockMiniPreview block={editorBlock} aspect='4 / 3' />
          ) : (
            <div
              className={cn(
                'flex aspect-[4/3] items-center justify-center bg-gradient-to-br text-white/80',
                gradient
              )}
            >
              <Bookmark className='size-10 opacity-80' />
            </div>
          )}
          <span
            className={cn(
              'text-3xs absolute bottom-2 left-2 rounded bg-gradient-to-br px-1.5 py-0.5 font-mono font-bold tracking-widest text-white/95 uppercase shadow-sm',
              gradient
            )}
          >
            {label}
          </span>
          {hasMobile && (
            <span className='text-3xs absolute right-2 bottom-2 rounded bg-black/40 px-1.5 py-0.5 font-mono text-white backdrop-blur'>
              📱
            </span>
          )}
          {extraCount > 0 && (
            <span className='text-3xs absolute top-2 left-2 rounded bg-black/40 px-1.5 py-0.5 font-mono text-white backdrop-blur'>
              +{extraCount} extras
            </span>
          )}
        </div>
        <div className='flex flex-1 flex-col gap-1.5 p-3'>
          <div className='flex items-center justify-between gap-2'>
            <div className='text-foreground truncate text-sm font-semibold'>
              {item.name}
            </div>
            <BlockStatusBadge status={item.status} className='shrink-0' />
          </div>
          <div className='text-3xs text-content-muted font-mono'>
            {item.type_code}
          </div>
          {item.tags && item.tags.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {item.tags.slice(0, 3).map(t => (
                <span
                  key={t}
                  className='text-3xs bg-muted text-content-muted rounded-full px-1.5 py-0.5 font-medium'
                >
                  {t}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className='text-3xs text-muted-foreground'>
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          )}
          <div className='text-3xs text-muted-foreground mt-auto flex items-center justify-between'>
            <span>{fmtRelative(item.updated_at ?? item.created_at)}</span>
            {item.usage_count > 0 && (
              <span className='font-mono'>↻ {item.usage_count}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Ô thống kê 1 trạng thái — số to, dot màu + nhãn, bấm để lọc. */
/** Lọc tag nhiều cùng lúc — popover checkbox + search, scale khi nhiều tag. */
function TagMultiSelect({
  allTags,
  value,
  onChange,
}: {
  allTags: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [q, setQ] = React.useState('');
  const shown = q
    ? allTags.filter(t => t.toLowerCase().includes(q.toLowerCase()))
    : allTags;
  const toggle = (t: string) =>
    onChange(value.includes(t) ? value.filter(x => x !== t) : [...value, t]);
  const label = value.length === 0 ? 'Tất cả tag' : `${value.length} tag`;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type='button'
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors outline-none',
            value.length > 0
              ? 'border-primary bg-primary/5 text-foreground'
              : 'border-border text-content-muted hover:bg-muted bg-background'
          )}
        >
          <Tag className='size-3' />
          {label}
          <ChevronDown className='size-3 opacity-60' />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align='start'
          sideOffset={4}
          className='border-border bg-background z-50 w-56 rounded-lg border p-1.5 shadow-lg'
        >
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder='Tìm tag…'
            className='border-border bg-background focus:ring-ring/40 mb-1 h-7 w-full rounded-md border px-2 text-xs outline-none focus:ring-2'
          />
          <div className='max-h-56 overflow-y-auto'>
            {shown.length === 0 ? (
              <p className='text-3xs text-content-muted px-2 py-2'>
                Không có tag
              </p>
            ) : (
              shown.map(t => {
                const on = value.includes(t);
                return (
                  <button
                    key={t}
                    type='button'
                    onClick={() => toggle(t)}
                    className='hover:bg-muted flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs'
                  >
                    <span
                      className={cn(
                        'flex size-3.5 shrink-0 items-center justify-center rounded border',
                        on
                          ? 'bg-foreground border-foreground text-background'
                          : 'border-border'
                      )}
                    >
                      {on && <Check className='size-2.5' />}
                    </span>
                    <span className='truncate'>{t}</span>
                  </button>
                );
              })
            )}
          </div>
          {value.length > 0 && (
            <button
              type='button'
              onClick={() => onChange([])}
              className='text-3xs text-content-muted hover:text-foreground mt-1 w-full px-2 py-1 text-left'
            >
              Bỏ chọn tất cả
            </button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function StatTile({
  label,
  value,
  dot,
  active,
  onClick,
}: {
  label: string;
  value: number;
  dot?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary/5 text-foreground ring-primary/20 ring-1'
          : 'border-border text-content-muted hover:border-primary/40 hover:bg-muted/40'
      )}
    >
      <span
        className={cn('size-1.5 rounded-full', dot ?? 'bg-foreground/70')}
      />
      {label}
      <span className='text-foreground font-semibold tabular-nums'>
        {value}
      </span>
    </button>
  );
}

function CardKebabMenu({
  onDetail,
  onDuplicate,
  onDelete,
  onEdit,
  onOpenCanvas,
  opening,
  onPreview,
}: {
  onDetail: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onOpenCanvas: () => void;
  opening: boolean;
  onPreview: () => void;
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

  const choose = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div ref={ref} className='relative' onClick={e => e.stopPropagation()}>
      <button
        type='button'
        onClick={e => {
          e.stopPropagation();
          setOpen(o => !o);
        }}
        className='text-content-muted hover:text-foreground bg-background/85 hover:bg-background flex size-7 items-center justify-center rounded-full shadow-sm ring-1 ring-black/5 backdrop-blur transition-all'
        aria-label='More actions'
        aria-expanded={open}
      >
        <MoreVertical className='size-3.5' />
      </button>
      {open && (
        <div className='border-border bg-background absolute top-9 right-0 z-20 w-48 overflow-hidden rounded-lg border shadow-lg'>
          <button
            type='button'
            onClick={choose(onPreview)}
            className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
          >
            <Play className='text-content-muted size-3.5' />
            Preview (animation)
          </button>
          <button
            type='button'
            onClick={choose(onDetail)}
            className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
          >
            <Eye className='text-content-muted size-3.5' />
            Mở chi tiết
          </button>
          <button
            type='button'
            onClick={choose(onEdit)}
            className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
          >
            <Pencil className='text-content-muted size-3.5' />
            Sửa thông tin
          </button>
          <button
            type='button'
            onClick={choose(onOpenCanvas)}
            disabled={opening}
            className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs disabled:opacity-50'
          >
            {opening ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <PencilRuler className='text-content-muted size-3.5' />
            )}
            Sửa trên canvas
          </button>
          <button
            type='button'
            onClick={choose(onDuplicate)}
            className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
          >
            <Copy className='text-content-muted size-3.5' />
            Duplicate
          </button>
          <div className='bg-muted h-px' />
          <button
            type='button'
            onClick={choose(onDelete)}
            className='text-destructive hover:bg-danger-bg flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
          >
            <Trash2 className='size-3.5' />
            Xoá
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Table ──────────────────────────────────────────────────────────── */

function TableView({
  items,
  selectedId,
  selected,
  onToggleSelect,
  allOnPage,
  someOnPage,
  selectAllDisabled,
  onToggleAll,
  onSelect,
  onDuplicate,
  onDelete,
  onEdit,
  onOpenCanvas,
  openingCanvas,
  onPreview,
}: {
  items: ServerBlock[];
  selectedId: string | null;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  allOnPage: boolean;
  someOnPage: boolean;
  selectAllDisabled: boolean;
  onToggleAll: () => void;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (item: ServerBlock) => void;
  onEdit: (item: ServerBlock) => Promise<void> | void;
  onOpenCanvas: (item: ServerBlock) => void;
  openingCanvas: string | null;
  onPreview: (item: ServerBlock) => void;
}) {
  return (
    <div className='border-border bg-card overflow-hidden rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-10'>
              <input
                type='checkbox'
                className='border-border size-3.5 cursor-pointer rounded disabled:cursor-not-allowed disabled:opacity-40'
                checked={allOnPage}
                disabled={selectAllDisabled}
                ref={el => {
                  if (el) el.indeterminate = someOnPage && !allOnPage;
                }}
                onChange={onToggleAll}
                aria-label='Chọn tất cả block Nháp trên trang'
                title={
                  selectAllDisabled
                    ? 'Không có block Nháp nào trên trang để chọn'
                    : 'Chọn tất cả block Nháp'
                }
              />
            </TableHead>
            <TableHead className='w-28'>Thumbnail</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead className='w-32'>Trạng thái</TableHead>
            <TableHead className='w-36'>Mapping code</TableHead>
            <TableHead className='w-32'>Tags</TableHead>
            <TableHead className='w-24'>Extras</TableHead>
            <TableHead className='w-20'>Usage</TableHead>
            <TableHead className='w-32'>Cập nhật</TableHead>
            <TableHead className='w-40' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(it => {
            const editorBlock = parseEditorBlock(it.settings);
            const draft = effectiveBlockStatus(it) === 'draft';
            return (
              <TableRow
                key={it.id}
                data-state={
                  it.id === selectedId || selected.has(it.id)
                    ? 'selected'
                    : undefined
                }
                className='cursor-pointer'
                onClick={() => onSelect(it.id)}
              >
                <TableCell onClick={e => e.stopPropagation()}>
                  <input
                    type='checkbox'
                    className='border-border size-3.5 cursor-pointer rounded disabled:cursor-not-allowed disabled:opacity-40'
                    checked={selected.has(it.id)}
                    disabled={!draft}
                    onChange={() => onToggleSelect(it.id)}
                    aria-label={`Chọn ${it.name}`}
                    title={
                      draft
                        ? `Chọn ${it.name}`
                        : 'Chỉ chọn/xoá được block Nháp (draft)'
                    }
                  />
                </TableCell>
                <TableCell>
                  {it.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.thumbnail_url}
                      alt={it.name}
                      className='border-border h-[54px] w-24 rounded-md border object-cover'
                    />
                  ) : editorBlock ? (
                    <div className='border-border bg-card w-24 overflow-hidden rounded-md border'>
                      <BlockMiniPreview block={editorBlock} aspect='16 / 9' />
                    </div>
                  ) : (
                    <div className='bg-muted text-content-muted text-3xs flex h-[54px] w-24 items-center justify-center rounded-md'>
                      no preview
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className='font-medium'>{it.name}</div>
                  {it.review_note && (
                    <div
                      className='text-3xs text-muted-foreground mt-0.5 max-w-[16rem] truncate'
                      title={it.review_note}
                    >
                      📝 {it.review_note}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <BlockStatusBadge status={it.status} />
                </TableCell>
                <TableCell>
                  <div className='text-foreground text-sm'>
                    {BLOCK_TYPE_LABEL[it.type_code as BlockType] ??
                      it.type_code}
                  </div>
                  <code className='text-3xs text-muted-foreground font-mono'>
                    {it.type_code}
                  </code>
                </TableCell>
                <TableCell>
                  {it.tags && it.tags.length > 0 ? (
                    <div className='flex flex-wrap gap-1'>
                      {it.tags.slice(0, 2).map(t => (
                        <span
                          key={t}
                          className='text-3xs bg-muted text-content-muted rounded-full px-1.5 py-0.5'
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className='text-muted-foreground'>-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className='text-2xs text-content-muted font-mono'>
                    {editorBlock?.extraElements?.length ?? 0}
                  </span>
                </TableCell>
                <TableCell>
                  <span className='text-2xs text-content-muted font-mono'>
                    {it.usage_count ?? 0}
                  </span>
                </TableCell>
                <TableCell className='text-content-muted text-xs'>
                  {fmtRelative(it.updated_at ?? it.created_at)}
                </TableCell>
                <TableCell>
                  <div
                    className='flex items-center gap-1'
                    onClick={e => e.stopPropagation()}
                  >
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onPreview(it)}
                      title='Preview (layout + animation)'
                    >
                      <Play className='size-3.5' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onEdit(it)}
                      title='Sửa thông tin (tên, mô tả, tag)'
                    >
                      <Pencil className='size-3.5' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onOpenCanvas(it)}
                      disabled={openingCanvas === it.id}
                      title='Sửa nội dung trên canvas editor'
                    >
                      {openingCanvas === it.id ? (
                        <Loader2 className='size-3.5 animate-spin' />
                      ) : (
                        <PencilRuler className='size-3.5' />
                      )}
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onDuplicate(it.id)}
                      title='Duplicate'
                    >
                      <Copy className='size-3.5' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onDelete(it)}
                      title='Xoá'
                    >
                      <Trash2 className='text-destructive size-3.5' />
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
    <Chip selected={active} size='sm' onClick={onClick} title={label}>
      {icon}
    </Chip>
  );
}
