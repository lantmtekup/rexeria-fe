'use client';

/**
 * Block management center — `/admin/blocks` (+ `/portal/blocks` mirror).
 *
 * Wave 3 cutover (2026-05-30): migrated from localStorage `savedBlocks`
 * helper to BE `/v1/blocks`. Endpoints wired:
 *   GET    /v1/blocks                        → list (`rexerApi.blocks.list`)
 *   POST   /v1/blocks                        → create (in AddBuiltinBlockDialog)
 *   PATCH  /v1/blocks/:id                    → rename + tag update
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
import { usePathname, useRouter } from 'next/navigation';
import {
  Bookmark,
  Calendar,
  Copy,
  Eye,
  Hash,
  LayoutGrid,
  Loader2,
  MoreVertical,
  Pencil,
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

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
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
import { BlockMiniPreview } from '@/components/modules/CanvasTemplate/block-editor/BlockMiniPreview';
import { PreviewMode } from '@/components/modules/CanvasTemplate/block-editor/PreviewMode';
import type {
  Block as EditorBlock,
  BlockType,
} from '@/components/modules/CanvasTemplate/block-editor/types';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Block as ServerBlock } from '@/services/rexer/types';
import { buildLegacyServerBlocks, getLegacyBlock } from '@/blocks/registry';
import { cn } from '@/lib/cn';

import { AddBuiltinBlockDialog } from './AddBuiltinBlockDialog';

type View = 'grid' | 'table';

const BLOCK_TYPE_LABEL: Record<BlockType, string> = {
  hero_split: 'Hero Split',
  hero_overlay: 'Hero Overlay',
  feature_section: 'Features',
  photo_gallery: 'Photo Gallery',
  booking_form: 'Booking Form',
  cta_section: 'CTA',
  image_carousel: 'Carousel',
  stories: 'Stories',
  split_screen: 'Split Screen',
  quiz: 'Quiz',
  poll: 'Poll',
  carousel_3d: 'Carousel 3D',
  flipbook: 'Flipbook',
  panorama: 'Panorama',
  legacy_embed: 'Legacy block',
};

const BLOCK_TYPE_GRADIENT: Record<BlockType, string> = {
  hero_split: 'from-rose-400 to-red-500',
  hero_overlay: 'from-zinc-700 to-zinc-900',
  feature_section: 'from-emerald-400 to-teal-500',
  photo_gallery: 'from-pink-400 to-fuchsia-500',
  booking_form: 'from-blue-500 to-violet-500',
  cta_section: 'from-amber-400 to-orange-500',
  image_carousel: 'from-cyan-400 to-blue-500',
  stories: 'from-orange-400 to-pink-500',
  split_screen: 'from-slate-500 to-zinc-600',
  quiz: 'from-violet-500 to-purple-600',
  poll: 'from-indigo-500 to-blue-600',
  carousel_3d: 'from-fuchsia-500 to-pink-600',
  flipbook: 'from-amber-500 to-yellow-500',
  panorama: 'from-sky-500 to-cyan-600',
  legacy_embed: 'from-slate-500 to-slate-700',
};

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fmtRelative(iso?: string): string {
  if (!iso) return '—';
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

export function AdminBlocksPage() {
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
  const [view, setView] = React.useState<View>('grid');
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<BlockType | 'all'>('all');
  const [tagFilter, setTagFilter] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [catalogOpen, setCatalogOpen] = React.useState(false);
  // Preview overlay — null = closed. Holds parsed editor Block + label for
  // <PreviewMode> (full-screen layout + animation playback per device).
  const [previewTarget, setPreviewTarget] = React.useState<{
    block: EditorBlock;
    name: string;
  } | null>(null);
  // Legacy preview — render component qua registry, không dùng PreviewMode
  // vì PreviewMode expect editor Block shape (canvas-template). Holds
  // schema id để lookup registry + lang switch (vi/en).
  const [legacyPreviewTarget, setLegacyPreviewTarget] = React.useState<{
    schemaId: string;
    name: string;
  } | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await rexerApi.blocks.list({ limit: 200 });
      // Merge legacy registry (POC ported từ 360-cms) ở đầu list. Synthetic
      // entries có id `legacy:*` — không call BE, render preview qua local
      // React component. Khi BE seed thật cho 113 blocks → bỏ merge này.
      const legacy = buildLegacyServerBlocks();
      setItems([...legacy, ...(r.items ?? [])]);
    } catch (err) {
      setError(rxMessage(err));
      setItems(buildLegacyServerBlocks());
    } finally {
      setLoading(false);
    }
  }, []);

  /** Detect legacy synthetic entries. Skip BE actions cho row legacy
   *  (delete/clone/rename) — chỉ allow preview + detail. */
  const isLegacyItem = (item: ServerBlock) => item.id.startsWith('legacy:');

  React.useEffect(() => {
    load();
  }, [load]);

  const selected = items.find(i => i.id === selectedId) ?? null;

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
      if (tagFilter && !(e.tags ?? []).includes(tagFilter)) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.type_code.toLowerCase().includes(q) ||
        (e.tags ?? []).some(t => t.includes(q))
      );
    });
  }, [items, search, typeFilter, tagFilter]);

  const handleDuplicate = async (id: string) => {
    if (id.startsWith('legacy:')) {
      toast.info(
        'Legacy block là catalog system — clone chưa support. Sẽ enable khi seed BE.'
      );
      return;
    }
    const tid = toast.loading('Đang clone…');
    try {
      const dup = await rexerApi.blocks.clone(id);
      toast.success(`Đã clone — "${dup.name}"`, { id: tid });
      await load();
      setSelectedId(dup.id);
    } catch (err) {
      toast.error(`Clone thất bại: ${rxMessage(err)}`, { id: tid });
    }
  };

  const handleDelete = async (block: ServerBlock) => {
    if (isLegacyItem(block)) {
      toast.info('Legacy block thuộc system catalog — không xoá được từ UI.');
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

  const handleRename = async (id: string, name: string) => {
    if (id.startsWith('legacy:')) {
      toast.info('Legacy block — đổi tên trong source code (src/blocks/).');
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await rexerApi.blocks.update(id, { name: trimmed });
      toast.success('Đã đổi tên');
      await load();
    } catch (err) {
      toast.error(`Đổi tên thất bại: ${rxMessage(err)}`);
    }
  };

  const handleTagsChange = async (id: string, tags: string[]) => {
    if (id.startsWith('legacy:')) {
      toast.info('Legacy block — tags fix ở schema source code.');
      return;
    }
    const normalised = Array.from(
      new Set(tags.map(t => t.trim().toLowerCase()).filter(t => t.length > 0))
    );
    try {
      await rexerApi.blocks.update(id, { tags: normalised });
      toast.success('Đã cập nhật tag');
      await load();
    } catch (err) {
      toast.error(`Cập nhật tag thất bại: ${rxMessage(err)}`);
    }
  };

  /**
   * Edit-in-canvas flow still blocked by Wave 3 work — canvas-editor wrap
   * needs to load `block.settings` directly instead of round-tripping
   * through a temp canvas-template id (which is retired post mig 134).
   */
  const handleEdit = (block: ServerBlock) => {
    toast.info(
      `Edit "${block.name}" — flow đang refactor sang block-direct editor (Wave 3). Tạm thời dùng portal block editor để chỉnh.`,
      { duration: 6000 }
    );
  };

  const handlePreview = (block: ServerBlock) => {
    if (isLegacyItem(block)) {
      const schemaId =
        typeof block.settings?.schemaId === 'string'
          ? (block.settings.schemaId as string)
          : null;
      if (!schemaId || !getLegacyBlock(schemaId)) {
        toast.error('Legacy block không tìm thấy trong registry.');
        return;
      }
      setLegacyPreviewTarget({ schemaId, name: block.name });
      return;
    }
    const editorBlock = parseEditorBlock(block.settings);
    if (!editorBlock) {
      toast.error(
        'Block này không có canvas data — settings rỗng hoặc shape không tương thích.'
      );
      return;
    }
    setPreviewTarget({ block: editorBlock, name: block.name });
  };

  const openDetail = (id: string) => {
    if (isPortal) {
      router.push(`${detailBase}/${id}`);
    } else {
      setSelectedId(id);
    }
  };

  return (
    <div className='flex h-[calc(100vh-3.5rem)]'>
      {/* Main column */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Header */}
        <div className='border-border border-b bg-white px-6 py-4'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h1 className='text-xl font-semibold'>Blocks</h1>
              <p className='text-content-muted mt-0.5 text-xs'>
                Thư viện block dùng chung cho mọi landing page · {items.length}{' '}
                blocks
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={load}
                disabled={loading}
                className='border-border text-content-muted hover:bg-muted inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-50'
              >
                <RefreshCw
                  className={cn('size-3.5', loading && 'animate-spin')}
                />
                Refresh
              </button>
              <button
                type='button'
                onClick={() => setCatalogOpen(true)}
                className='inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700'
              >
                <Plus className='size-3.5' />
                Thêm từ thư viện hệ thống
              </button>
            </div>
          </div>

          {/* Search + view toggle */}
          <div className='mt-4 flex items-center gap-3'>
            <div className='relative max-w-md flex-1'>
              <Search className='text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
              <Input
                placeholder='Tìm theo tên / block type / tag…'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='pl-8'
              />
            </div>
            <div className='border-border flex items-center gap-1 rounded-lg border bg-white p-0.5'>
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

          {/* Filter strip */}
          {(allTags.length > 0 || items.length > 0) && (
            <div className='mt-3 flex flex-wrap items-center gap-2'>
              <select
                value={typeFilter}
                onChange={e =>
                  setTypeFilter(e.target.value as BlockType | 'all')
                }
                className='border-border text-content-muted hover:bg-muted rounded-lg border bg-white px-2.5 py-1 text-xs font-medium outline-none'
              >
                <option value='all'>Tất cả type</option>
                {(Object.keys(BLOCK_TYPE_LABEL) as BlockType[]).map(t => (
                  <option key={t} value={t}>
                    {BLOCK_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>

              {allTags.length > 0 && (
                <div className='flex items-center gap-1.5'>
                  <Tag className='text-muted-foreground size-3' />
                  {allTags.map(t => (
                    <button
                      key={t}
                      type='button'
                      onClick={() => setTagFilter(tagFilter === t ? null : t)}
                      className={cn(
                        'text-3xs rounded-full border px-2 py-0.5 font-medium transition-colors',
                        tagFilter === t
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-border text-content-muted hover:bg-muted bg-white'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}

              {(typeFilter !== 'all' || tagFilter) && (
                <button
                  type='button'
                  onClick={() => {
                    setTypeFilter('all');
                    setTagFilter(null);
                  }}
                  className='text-3xs text-content-muted hover:text-foreground ml-1 inline-flex items-center gap-1'
                >
                  <X className='size-3' />
                  Clear
                </button>
              )}

              <div className='text-3xs text-content-muted ml-auto'>
                {filtered.length} / {items.length}
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className='bg-muted/40 flex-1 overflow-y-auto p-6'>
          {error && (
            <div className='mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800'>
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
                items.length === 0 ? (
                  <>
                    Bấm{' '}
                    <button
                      type='button'
                      onClick={() => setCatalogOpen(true)}
                      className='text-primary underline'
                    >
                      Thêm từ thư viện hệ thống
                    </button>{' '}
                    để chọn 1 trong 14 block mẫu — sau đó sửa tuỳ ý.
                  </>
                ) : (
                  'Đổi từ khoá hoặc xoá filter để xem tất cả.'
                )
              }
            />
          ) : view === 'grid' ? (
            <GridView
              items={filtered}
              selectedId={selectedId}
              onSelect={openDetail}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onPreview={handlePreview}
            />
          ) : (
            <TableView
              items={filtered}
              selectedId={selectedId}
              onSelect={openDetail}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onPreview={handlePreview}
            />
          )}
        </div>
      </div>

      {/* Drawer (admin only — portal uses dedicated detail route) */}
      {!isPortal && selected && (
        <DetailDrawer
          block={selected}
          onClose={() => setSelectedId(null)}
          onRename={name => handleRename(selected.id, name)}
          onTagsChange={tags => handleTagsChange(selected.id, tags)}
          onDuplicate={() => handleDuplicate(selected.id)}
          onDelete={() => handleDelete(selected)}
          onEdit={() => handleEdit(selected)}
          onPreview={() => handlePreview(selected)}
        />
      )}

      <AddBuiltinBlockDialog
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        onAdded={id => {
          load();
          openDetail(id);
        }}
      />

      {/* Full-screen layout + animation preview overlay. PreviewMode handles
          its own enter/exit animation + device responsive frame. */}
      {previewTarget && (
        <PreviewMode
          blocks={[previewTarget.block]}
          lang='vi'
          onClose={() => setPreviewTarget(null)}
        />
      )}

      {legacyPreviewTarget && (
        <LegacyPreviewOverlay
          schemaId={legacyPreviewTarget.schemaId}
          name={legacyPreviewTarget.name}
          onClose={() => setLegacyPreviewTarget(null)}
        />
      )}
    </div>
  );
}

/* ─── Grid ───────────────────────────────────────────────────────────── */

function GridView({
  items,
  selectedId,
  onSelect,
  onDuplicate,
  onDelete,
  onPreview,
}: {
  items: ServerBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (item: ServerBlock) => void;
  onPreview: (item: ServerBlock) => void;
}) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {items.map(it => (
        <BlockCard
          key={it.id}
          item={it}
          active={it.id === selectedId}
          onClick={() => onSelect(it.id)}
          onDuplicate={() => onDuplicate(it.id)}
          onDelete={() => onDelete(it)}
          onPreview={() => onPreview(it)}
        />
      ))}
    </div>
  );
}

function BlockCard({
  item,
  active,
  onClick,
  onDuplicate,
  onDelete,
  onPreview,
}: {
  item: ServerBlock;
  active: boolean;
  onClick: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPreview: () => void;
}) {
  const type = item.type_code as BlockType;
  const gradient = BLOCK_TYPE_GRADIENT[type] ?? 'from-zinc-400 to-zinc-600';
  // Legacy item: prefer schema.name → strip `legacy_` prefix from type_code
  // không meaningful cho admin scan. Default label vẫn fallback type_code.
  const isLegacy = item.id.startsWith('legacy:');
  const legacySchemaId =
    isLegacy && typeof item.settings?.schemaId === 'string'
      ? (item.settings.schemaId as string)
      : null;
  const legacyEntry = legacySchemaId ? getLegacyBlock(legacySchemaId) : null;
  const legacyCategory =
    isLegacy && typeof item.settings?.category === 'string'
      ? (item.settings.category as string)
      : null;
  const label = isLegacy
    ? (legacyCategory ?? 'Legacy')
    : (BLOCK_TYPE_LABEL[type] ?? item.type_code);
  const editorBlock = parseEditorBlock(item.settings);
  const extraCount = editorBlock?.extraElements?.length ?? 0;
  const hasMobile = !!editorBlock?.contentVi?.mobile;
  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-white text-left shadow-sm transition-all hover:shadow-md',
        active
          ? 'border-zinc-900 ring-2 ring-zinc-900/10'
          : 'border-border hover:border-border'
      )}
    >
      <div className='absolute top-2 right-2 z-10 flex items-center gap-1'>
        {/* Quick preview button — opens full-screen layout + animation */}
        <button
          type='button'
          onClick={e => {
            e.stopPropagation();
            onPreview();
          }}
          className='text-content-muted hover:text-foreground flex size-7 items-center justify-center rounded-full bg-white/85 shadow-sm ring-1 ring-black/5 backdrop-blur transition-all hover:bg-white'
          title='Xem preview (layout + animation)'
          aria-label='Preview block'
        >
          <Play className='size-3.5' />
        </button>
        <CardKebabMenu
          onDetail={onClick}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
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
          {editorBlock ? (
            <BlockMiniPreview block={editorBlock} aspect='4 / 3' />
          ) : legacyEntry ? (
            <LegacyBlockThumbnail entry={legacyEntry} />
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
          <div className='text-foreground truncate text-sm font-semibold'>
            {item.name}
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

function CardKebabMenu({
  onDetail,
  onDuplicate,
  onDelete,
  onPreview,
}: {
  onDetail: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
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
        className='text-content-muted hover:text-foreground flex size-7 items-center justify-center rounded-full bg-white/85 shadow-sm ring-1 ring-black/5 backdrop-blur transition-all hover:bg-white'
        aria-label='More actions'
        aria-expanded={open}
      >
        <MoreVertical className='size-3.5' />
      </button>
      {open && (
        <div className='border-border absolute top-9 right-0 z-20 w-48 overflow-hidden rounded-lg border bg-white shadow-lg'>
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
            className='flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50'
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
  onSelect,
  onDuplicate,
  onDelete,
  onEdit,
  onPreview,
}: {
  items: ServerBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (item: ServerBlock) => void;
  onEdit: (item: ServerBlock) => Promise<void> | void;
  onPreview: (item: ServerBlock) => void;
}) {
  return (
    <div className='border-border overflow-hidden rounded-lg border bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead className='w-36'>Block type</TableHead>
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
            return (
              <TableRow
                key={it.id}
                data-state={it.id === selectedId ? 'selected' : undefined}
                className='cursor-pointer'
                onClick={() => onSelect(it.id)}
              >
                <TableCell>
                  <div className='font-medium'>{it.name}</div>
                  <div className='text-3xs text-muted-foreground font-mono'>
                    {it.id}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant='secondary' className='text-3xs font-mono'>
                    {it.type_code}
                  </Badge>
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
                    <span className='text-muted-foreground'>—</span>
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
                      title='Sửa trong canvas (Wave 3)'
                    >
                      <Pencil className='size-3.5' />
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
                      <Trash2 className='size-3.5 text-rose-600' />
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

/* ─── Drawer ─────────────────────────────────────────────────────────── */

function DetailDrawer({
  block,
  onClose,
  onRename,
  onTagsChange,
  onDuplicate,
  onDelete,
  onEdit,
  onPreview,
}: {
  block: ServerBlock;
  onClose: () => void;
  onRename: (name: string) => void;
  onTagsChange: (tags: string[]) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit: () => Promise<void> | void;
  onPreview: () => void;
}) {
  const [editingName, setEditingName] = React.useState(false);
  const [nameInput, setNameInput] = React.useState(block.name);
  const [tagInput, setTagInput] = React.useState('');
  const type = block.type_code as BlockType;
  const gradient = BLOCK_TYPE_GRADIENT[type] ?? 'from-zinc-400 to-zinc-600';
  const label = BLOCK_TYPE_LABEL[type] ?? block.type_code;
  const tags = block.tags ?? [];
  const editorBlock = parseEditorBlock(block.settings);

  React.useEffect(() => {
    setNameInput(block.name);
    setEditingName(false);
    setTagInput('');
  }, [block.id, block.name]);

  const commitName = () => {
    if (nameInput.trim() && nameInput !== block.name) {
      onRename(nameInput.trim());
    }
    setEditingName(false);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (tags.includes(t)) {
      setTagInput('');
      return;
    }
    onTagsChange([...tags, t]);
    setTagInput('');
  };

  const removeTag = (t: string) => {
    onTagsChange(tags.filter(x => x !== t));
  };

  return (
    <aside className='border-border flex w-[380px] flex-col border-l bg-white'>
      {/* Header */}
      <div className='border-border flex items-start justify-between border-b px-4 py-3'>
        <div className='min-w-0 flex-1'>
          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={commitName}
              onKeyDown={e => {
                if (e.key === 'Enter') commitName();
                if (e.key === 'Escape') {
                  setNameInput(block.name);
                  setEditingName(false);
                }
              }}
              className='border-border w-full rounded-md border bg-white px-2 py-1 text-sm font-semibold outline-none focus:ring-2 focus:ring-zinc-900/10'
            />
          ) : (
            <button
              type='button'
              onClick={() => setEditingName(true)}
              className='group flex items-center gap-1.5 text-left'
              title='Click để đổi tên'
            >
              <span className='truncate text-sm font-semibold'>
                {block.name}
              </span>
              <Pencil className='text-muted-foreground group-hover:text-content-muted size-3' />
            </button>
          )}
          <div className='text-3xs text-content-muted mt-0.5 font-mono'>
            {block.id}
          </div>
        </div>
        <button
          type='button'
          onClick={onClose}
          className='text-muted-foreground hover:bg-muted hover:text-content-muted rounded p-1'
          aria-label='Close'
        >
          <X className='size-4' />
        </button>
      </div>

      {/* Preview */}
      <div className='px-4 pt-4'>
        <div className='border-border relative overflow-hidden rounded-lg border'>
          {editorBlock ? (
            <BlockMiniPreview block={editorBlock} aspect='16 / 9' />
          ) : (
            <div
              className={cn(
                'flex aspect-video items-center justify-center bg-gradient-to-br text-white/80',
                gradient
              )}
            >
              <Bookmark className='size-10 opacity-80' />
            </div>
          )}
          <span
            className={cn(
              'text-3xs absolute top-2 left-2 rounded bg-gradient-to-br px-1.5 py-0.5 font-mono font-bold tracking-widest text-white/95 uppercase shadow-sm',
              gradient
            )}
          >
            {label}
          </span>
          <div className='text-3xs absolute right-0 bottom-0 left-0 flex items-center justify-between bg-black/20 px-2 py-1 text-white/80 backdrop-blur'>
            <span>
              {editorBlock?.contentVi?.mobile
                ? '📱 desktop + mobile'
                : '🖥 desktop only'}
            </span>
            <span>{editorBlock?.extraElements?.length ?? 0} extras</span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className='space-y-3 px-4 py-4 text-xs'>
        <MetaRow
          icon={<Hash className='size-3' />}
          label='Block type'
          value={<span className='text-2xs font-mono'>{block.type_code}</span>}
        />
        <MetaRow
          icon={<Calendar className='size-3' />}
          label='Saved'
          value={fmtDate(block.created_at)}
        />
        {block.updated_at && block.updated_at !== block.created_at && (
          <MetaRow
            icon={<Calendar className='size-3' />}
            label='Updated'
            value={fmtRelative(block.updated_at)}
          />
        )}
        <MetaRow
          icon={<Bookmark className='size-3' />}
          label='Extras'
          value={`${editorBlock?.extraElements?.length ?? 0} elements`}
        />
        <MetaRow
          icon={<RefreshCw className='size-3' />}
          label='Usage'
          value={`${block.usage_count ?? 0} ×`}
        />
        <MetaRow
          icon={<Hash className='size-3' />}
          label='Scope'
          value={<span className='text-2xs font-mono'>{block.scope}</span>}
        />
      </div>

      {/* Tags */}
      <div className='border-border border-t px-4 py-3'>
        <div className='text-3xs text-content-muted mb-1.5 flex items-center gap-1 font-semibold tracking-wider uppercase'>
          <Tag className='size-3' />
          Tags
        </div>
        <div className='flex flex-wrap items-center gap-1'>
          {tags.length === 0 && (
            <span className='text-2xs text-muted-foreground'>Chưa có tag</span>
          )}
          {tags.map(t => (
            <button
              key={t}
              type='button'
              onClick={() => removeTag(t)}
              className='group text-3xs bg-muted text-content-muted flex items-center gap-1 rounded-full px-2 py-0.5 font-medium hover:bg-rose-50 hover:text-rose-700'
              title='Click để xoá tag'
            >
              {t}
              <X className='size-2.5 opacity-0 group-hover:opacity-100' />
            </button>
          ))}
        </div>
        <div className='mt-2 flex items-center gap-1.5'>
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder='Thêm tag (Enter)…'
            className='text-2xs border-border flex-1 rounded-md border px-2 py-1 outline-none focus:border-zinc-400'
          />
          <button
            type='button'
            onClick={addTag}
            disabled={!tagInput.trim()}
            className='text-2xs rounded-md bg-zinc-900 px-2.5 py-1 font-medium text-white hover:bg-zinc-700 disabled:opacity-40'
          >
            Thêm
          </button>
        </div>
      </div>

      {/* Footer actions */}
      <div className='border-border mt-auto border-t px-4 py-3'>
        {/* Primary action — most-used = visual preview */}
        <Button
          size='sm'
          onClick={onPreview}
          className='mb-1.5 w-full'
          disabled={!editorBlock}
          title={
            editorBlock
              ? 'Mở preview full-screen với layout + animation'
              : 'Block không có canvas data — preview disabled'
          }
        >
          <Play className='size-3.5' />
          Preview (layout + animation)
        </Button>
        <div className='grid grid-cols-3 gap-1.5'>
          <Button variant='outline' size='sm' onClick={onEdit}>
            <Pencil className='size-3.5' />
            Edit
          </Button>
          <Button variant='outline' size='sm' onClick={onDuplicate}>
            <Copy className='size-3.5' />
            Clone
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={onDelete}
            className='text-rose-600 hover:bg-rose-50'
          >
            <Trash2 className='size-3.5' />
            Xoá
          </Button>
        </div>
      </div>
    </aside>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className='flex items-center justify-between gap-2'>
      <div className='text-3xs text-content-muted flex items-center gap-1.5 font-semibold tracking-wider uppercase'>
        {icon}
        {label}
      </div>
      <div className='text-foreground'>{value}</div>
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
    <button
      type='button'
      onClick={onClick}
      title={label}
      className={cn(
        'text-2xs flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors',
        active ? 'bg-zinc-900 text-white' : 'text-content-muted hover:bg-muted'
      )}
    >
      {icon}
    </button>
  );
}

/* ─── LegacyBlockThumbnail ───────────────────────────────────────────
 * Render component legacy ở size lớn rồi scale down để fit khung
 * 4:3 ratio của card. `transform: scale(...)` + `transform-origin:
 * top left` đảm bảo component thấy viewport full-size (~1280×960) →
 * khi shrink xuống card preview vẫn giữ layout proportions.
 *
 * Pointer-events: none để tránh hover / scroll affect card click. */
function LegacyBlockThumbnail({
  entry,
}: {
  entry: ReturnType<typeof getLegacyBlock>;
}) {
  if (!entry) return null;
  const { schema, Component } = entry;
  const content = (schema.defaults.vi ?? {}) as Record<string, unknown>;
  const SOURCE_W = 1280;
  const SOURCE_H = 960;

  return (
    <div className='bg-muted relative aspect-[4/3] overflow-hidden'>
      <div
        aria-hidden='true'
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: SOURCE_W,
          height: SOURCE_H,
          transform: 'scale(0.25)',
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
      >
        <Component content={content} editable={false} />
      </div>
    </div>
  );
}

/* ─── LegacyPreviewOverlay ──────────────────────────────────────────
 * Full-screen modal render legacy block ở viewport thật + toolbar
 * top-bar (name, lang switch vi/en, close). Block dùng position:
 * fixed (delvaux hero), h-screen, vh units — wrapper có `transform:
 * translateZ(0)` tạo new containing block để fixed children stay
 * inside modal (giống pattern PageOverlayView 2026-05-31).
 *
 * ESC key + click backdrop → close. Body scroll lock while open. */
function LegacyPreviewOverlay({
  schemaId,
  name,
  onClose,
}: {
  schemaId: string;
  name: string;
  onClose: () => void;
}) {
  const [lang, setLang] = React.useState<'vi' | 'en'>('vi');
  const entry = getLegacyBlock(schemaId);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!entry) return null;
  const { Component, schema } = entry;
  const content = (schema.defaults[lang] ?? schema.defaults.vi ?? {}) as Record<
    string,
    unknown
  >;
  const availableLangs = Object.keys(schema.defaults);

  return (
    <div className='fixed inset-0 z-[200] flex flex-col bg-zinc-950'>
      {/* Toolbar */}
      <div className='flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-zinc-900 px-4 py-2.5'>
        <div className='flex min-w-0 items-center gap-3'>
          <span className='text-3xs inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 font-mono font-bold tracking-wider text-amber-300 uppercase'>
            Legacy
          </span>
          <div className='min-w-0'>
            <div className='truncate text-sm font-semibold text-white'>
              {name}
            </div>
            <code className='text-3xs text-muted-foreground block truncate font-mono'>
              {schema.id}
            </code>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {availableLangs.length > 1 && (
            <div className='flex items-center gap-1 rounded-full border border-white/10 bg-zinc-800 p-0.5'>
              {availableLangs.map(l => (
                <button
                  key={l}
                  type='button'
                  onClick={() => setLang(l as 'vi' | 'en')}
                  className={cn(
                    'text-3xs rounded-full px-2.5 py-1 font-mono font-bold tracking-wider uppercase transition-colors',
                    lang === l
                      ? 'text-foreground bg-white'
                      : 'text-muted-foreground hover:text-white'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
          <button
            type='button'
            onClick={onClose}
            className='text-muted-foreground flex size-8 items-center justify-center rounded-full hover:bg-white/10 hover:text-white'
            aria-label='Đóng preview'
            title='Đóng (ESC)'
          >
            <X className='size-4' />
          </button>
        </div>
      </div>

      {/* Content — translateZ tạo containing block cho fixed/vh children */}
      <div
        className='relative flex-1 overflow-auto bg-white'
        style={{ transform: 'translateZ(0)' }}
      >
        <Component content={content} editable={false} />
      </div>
    </div>
  );
}
