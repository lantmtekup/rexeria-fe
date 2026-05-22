'use client';

/**
 * Block management center. Lists saved blocks (localStorage Phase 1) with
 * grid/table views, search, type + tag filters, side drawer for preview +
 * metadata edit, and an "Edit" action that creates a scratch canvas
 * template containing the block and navigates to the canvas editor.
 *
 * Replaces the simpler `AdminSavedBlocksPage` — `/admin/saved-blocks` route
 * keeps working as a redirect for backwards compat.
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Bookmark,
  Calendar,
  Copy,
  Hash,
  LayoutGrid,
  Pencil,
  Plus,
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
import {
  deleteSavedBlock,
  duplicateSavedBlock,
  listSavedBlocks,
  renameSavedBlock,
  subscribeSavedBlocks,
  updateSavedBlockTags,
  type SavedBlock,
} from '@/components/modules/CanvasTemplate/block-editor/savedBlocks';
import { serializeCanvas } from '@/components/modules/CanvasTemplate/block-editor/serialize';
import type { BlockType } from '@/components/modules/CanvasTemplate/block-editor/types';
import { rexerApi } from '@/services/rexer/endpoints';
import { cn } from '@/lib/cn';

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

export function AdminBlocksPage() {
  const router = useRouter();
  const [items, setItems] = React.useState<SavedBlock[]>([]);
  const [view, setView] = React.useState<View>('grid');
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<BlockType | 'all'>('all');
  const [tagFilter, setTagFilter] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setItems(listSavedBlocks());
    return subscribeSavedBlocks(() => setItems(listSavedBlocks()));
  }, []);

  const selected = items.find(i => i.id === selectedId) ?? null;

  // Aggregate distinct tags across all saved blocks for the filter chip row.
  const allTags = React.useMemo(() => {
    const s = new Set<string>();
    for (const it of items) for (const t of it.tags ?? []) s.add(t);
    return Array.from(s).sort();
  }, [items]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(e => {
      if (typeFilter !== 'all' && e.block.blockType !== typeFilter)
        return false;
      if (tagFilter && !(e.tags ?? []).includes(tagFilter)) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.block.blockType.toLowerCase().includes(q) ||
        (e.tags ?? []).some(t => t.includes(q))
      );
    });
  }, [items, search, typeFilter, tagFilter]);

  const handleDuplicate = (id: string) => {
    const dup = duplicateSavedBlock(id);
    if (!dup) {
      toast.error('Không tìm thấy block để clone');
      return;
    }
    toast.success(`Đã clone — "${dup.name}"`);
    setSelectedId(dup.id);
  };

  const handleDelete = (block: SavedBlock) => {
    if (!window.confirm(`Xoá "${block.name}"?`)) return;
    deleteSavedBlock(block.id);
    toast.success('Đã xoá');
    if (selectedId === block.id) setSelectedId(null);
  };

  /**
   * Edit flow: create a scratch canvas template containing only this block,
   * then push the user into the canvas editor. The new template is named
   * `[Editing] <block name>` so it's easy to spot if they leave it lying around.
   */
  const handleEdit = async (block: SavedBlock) => {
    const t = toast.loading('Đang tạo canvas tạm để chỉnh sửa…');
    try {
      const canvasData = serializeCanvas([block.block], block.block.id);
      const created = await rexerApi.canvasTemplates.create({
        name: `[Editing] ${block.name}`,
        width: 800,
        height: 600,
        engine: 'fabric',
        engine_version: '5.3.0',
        canvas_data: canvasData,
        is_template: false,
      });
      toast.success('Mở editor — sửa xong dùng 🔖 để lưu bản mới', { id: t });
      router.push(`/canvas-templates/${created.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Tạo canvas thất bại: ${msg}`, { id: t });
    }
  };

  return (
    <div className='flex h-[calc(100vh-3.5rem)]'>
      {/* Main column */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Header */}
        <div className='border-b border-zinc-200 bg-white px-6 py-4'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h1 className='text-xl font-semibold'>Blocks</h1>
              <p className='text-content-muted mt-0.5 text-xs'>
                Thư viện block dùng chung cho mọi landing page · {items.length}{' '}
                blocks
              </p>
            </div>
            <Link
              href='/canvas-templates'
              className='inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50'
            >
              <Plus className='size-3.5' />
              Tạo block từ canvas
              <ArrowRight className='size-3' />
            </Link>
          </div>

          {/* Search + view toggle */}
          <div className='mt-4 flex items-center gap-3'>
            <div className='relative max-w-md flex-1'>
              <Search className='absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400' />
              <Input
                placeholder='Tìm theo tên / block type / tag…'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='pl-8'
              />
            </div>
            <div className='flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-0.5'>
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
                className='rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 outline-none hover:bg-zinc-50'
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
                  <Tag className='size-3 text-zinc-400' />
                  {allTags.map(t => (
                    <button
                      key={t}
                      type='button'
                      onClick={() => setTagFilter(tagFilter === t ? null : t)}
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[10.5px] font-medium transition-colors',
                        tagFilter === t
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
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
                  className='ml-1 inline-flex items-center gap-1 text-[10.5px] text-zinc-500 hover:text-zinc-900'
                >
                  <X className='size-3' />
                  Clear
                </button>
              )}

              <div className='ml-auto text-[10.5px] text-zinc-500'>
                {filtered.length} / {items.length}
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto bg-zinc-50/40 p-6'>
          {filtered.length === 0 ? (
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
                    Mở canvas editor, bấm icon 🔖 trên header để lưu block hiện
                    tại.{' '}
                    <Link
                      href='/canvas-templates'
                      className='text-primary underline'
                    >
                      Mở canvas templates →
                    </Link>
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
              onSelect={setSelectedId}
            />
          ) : (
            <TableView
              items={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        </div>
      </div>

      {/* Drawer */}
      {selected && (
        <DetailDrawer
          block={selected}
          onClose={() => setSelectedId(null)}
          onRename={name => {
            renameSavedBlock(selected.id, name);
            toast.success('Đã đổi tên');
          }}
          onTagsChange={tags => {
            updateSavedBlockTags(selected.id, tags);
            toast.success('Đã cập nhật tag');
          }}
          onDuplicate={() => handleDuplicate(selected.id)}
          onDelete={() => handleDelete(selected)}
          onEdit={() => handleEdit(selected)}
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
}: {
  items: SavedBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {items.map(it => (
        <BlockCard
          key={it.id}
          item={it}
          active={it.id === selectedId}
          onClick={() => onSelect(it.id)}
        />
      ))}
    </div>
  );
}

function BlockCard({
  item,
  active,
  onClick,
}: {
  item: SavedBlock;
  active: boolean;
  onClick: () => void;
}) {
  const type = item.block.blockType;
  const gradient = BLOCK_TYPE_GRADIENT[type] ?? 'from-zinc-400 to-zinc-600';
  const label = BLOCK_TYPE_LABEL[type] ?? type;
  const extraCount = item.block.extraElements?.length ?? 0;
  const hasMobile = !!item.block.contentVi?.mobile;
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border bg-white text-left shadow-sm transition-all hover:shadow-md',
        active
          ? 'border-zinc-900 ring-2 ring-zinc-900/10'
          : 'border-zinc-200 hover:border-zinc-300'
      )}
    >
      <div
        className={cn(
          'relative h-32 bg-gradient-to-br',
          gradient,
          'flex items-center justify-center'
        )}
      >
        <span className='font-mono text-[10px] font-bold tracking-widest text-white/80 uppercase'>
          {label}
        </span>
        {hasMobile && (
          <span className='absolute top-2 right-2 rounded bg-black/30 px-1.5 py-0.5 font-mono text-[9px] text-white backdrop-blur'>
            📱 mobile
          </span>
        )}
        {extraCount > 0 && (
          <span className='absolute bottom-2 left-2 rounded bg-black/30 px-1.5 py-0.5 font-mono text-[9px] text-white backdrop-blur'>
            +{extraCount} extras
          </span>
        )}
      </div>
      <div className='flex flex-1 flex-col gap-1.5 p-3'>
        <div className='truncate text-[13px] font-semibold text-zinc-800'>
          {item.name}
        </div>
        <div className='font-mono text-[10px] text-zinc-500'>{type}</div>
        {item.tags && item.tags.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {item.tags.slice(0, 3).map(t => (
              <span
                key={t}
                className='rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9.5px] font-medium text-zinc-600'
              >
                {t}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className='text-[9.5px] text-zinc-400'>
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}
        <div className='mt-auto text-[10.5px] text-zinc-400'>
          {fmtRelative(item.updatedAt ?? item.createdAt)}
        </div>
      </div>
    </button>
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
}: {
  items: SavedBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (item: SavedBlock) => void;
  onEdit: (item: SavedBlock) => Promise<void> | void;
}) {
  return (
    <div className='overflow-hidden rounded-lg border border-zinc-200 bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead className='w-36'>Block type</TableHead>
            <TableHead className='w-32'>Tags</TableHead>
            <TableHead className='w-24'>Extras</TableHead>
            <TableHead className='w-32'>Cập nhật</TableHead>
            <TableHead className='w-40' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(it => (
            <TableRow
              key={it.id}
              data-state={it.id === selectedId ? 'selected' : undefined}
              className='cursor-pointer'
              onClick={() => onSelect(it.id)}
            >
              <TableCell>
                <div className='font-medium'>{it.name}</div>
                <div className='font-mono text-[10px] text-zinc-400'>
                  {it.id}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant='secondary' className='font-mono text-[10px]'>
                  {it.block.blockType}
                </Badge>
              </TableCell>
              <TableCell>
                {it.tags && it.tags.length > 0 ? (
                  <div className='flex flex-wrap gap-1'>
                    {it.tags.slice(0, 2).map(t => (
                      <span
                        key={t}
                        className='rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9.5px] text-zinc-600'
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className='text-zinc-300'>—</span>
                )}
              </TableCell>
              <TableCell>
                <span className='font-mono text-[11px] text-zinc-600'>
                  {it.block.extraElements?.length ?? 0}
                </span>
              </TableCell>
              <TableCell className='text-xs text-zinc-500'>
                {fmtRelative(it.updatedAt ?? it.createdAt)}
              </TableCell>
              <TableCell>
                <div
                  className='flex items-center gap-1'
                  onClick={e => e.stopPropagation()}
                >
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onEdit(it)}
                    title='Sửa trong canvas'
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
          ))}
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
}: {
  block: SavedBlock;
  onClose: () => void;
  onRename: (name: string) => void;
  onTagsChange: (tags: string[]) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit: () => Promise<void> | void;
}) {
  const [editingName, setEditingName] = React.useState(false);
  const [nameInput, setNameInput] = React.useState(block.name);
  const [tagInput, setTagInput] = React.useState('');
  const type = block.block.blockType;
  const gradient = BLOCK_TYPE_GRADIENT[type] ?? 'from-zinc-400 to-zinc-600';
  const label = BLOCK_TYPE_LABEL[type] ?? type;
  const tags = block.tags ?? [];

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
    <aside className='flex w-[380px] flex-col border-l border-zinc-200 bg-white'>
      {/* Header */}
      <div className='flex items-start justify-between border-b border-zinc-100 px-4 py-3'>
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
              className='w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm font-semibold outline-none focus:ring-2 focus:ring-zinc-900/10'
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
              <Pencil className='size-3 text-zinc-300 group-hover:text-zinc-600' />
            </button>
          )}
          <div className='mt-0.5 font-mono text-[10px] text-zinc-500'>
            {block.id}
          </div>
        </div>
        <button
          type='button'
          onClick={onClose}
          className='rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'
          aria-label='Close'
        >
          <X className='size-4' />
        </button>
      </div>

      {/* Preview */}
      <div className='px-4 pt-4'>
        <div
          className={cn(
            'relative h-44 overflow-hidden rounded-lg bg-gradient-to-br',
            gradient
          )}
        >
          <div className='flex h-full flex-col items-center justify-center text-white/90'>
            <span className='font-mono text-[10px] font-bold tracking-widest uppercase'>
              {label}
            </span>
            <span className='mt-0.5 text-[10px] text-white/70'>
              preview placeholder
            </span>
          </div>
          <div className='absolute right-0 bottom-0 left-0 flex items-center justify-between bg-black/20 px-2 py-1 text-[9.5px] text-white/80 backdrop-blur'>
            <span>
              {block.block.contentVi?.mobile
                ? '📱 desktop + mobile'
                : '🖥 desktop only'}
            </span>
            <span>{block.block.extraElements?.length ?? 0} extras</span>
          </div>
        </div>
        <p className='mt-1 text-center text-[10px] text-zinc-400'>
          Real preview sẽ render khi BE saved-blocks ship — Phase 1: placeholder
        </p>
      </div>

      {/* Metadata */}
      <div className='space-y-3 px-4 py-4 text-[12px]'>
        <MetaRow
          icon={<Hash className='size-3' />}
          label='Block type'
          value={<span className='font-mono text-[11px]'>{type}</span>}
        />
        <MetaRow
          icon={<Calendar className='size-3' />}
          label='Saved'
          value={fmtDate(block.createdAt)}
        />
        {block.updatedAt && (
          <MetaRow
            icon={<Calendar className='size-3' />}
            label='Updated'
            value={fmtRelative(block.updatedAt)}
          />
        )}
        <MetaRow
          icon={<Bookmark className='size-3' />}
          label='Extras'
          value={`${block.block.extraElements?.length ?? 0} elements`}
        />
      </div>

      {/* Tags */}
      <div className='border-t border-zinc-100 px-4 py-3'>
        <div className='mb-1.5 flex items-center gap-1 text-[10.5px] font-semibold tracking-wider text-zinc-500 uppercase'>
          <Tag className='size-3' />
          Tags
        </div>
        <div className='flex flex-wrap items-center gap-1'>
          {tags.length === 0 && (
            <span className='text-[11px] text-zinc-400'>Chưa có tag</span>
          )}
          {tags.map(t => (
            <button
              key={t}
              type='button'
              onClick={() => removeTag(t)}
              className='group flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10.5px] font-medium text-zinc-700 hover:bg-rose-50 hover:text-rose-700'
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
            className='flex-1 rounded-md border border-zinc-200 px-2 py-1 text-[11px] outline-none focus:border-zinc-400'
          />
          <button
            type='button'
            onClick={addTag}
            disabled={!tagInput.trim()}
            className='rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-zinc-700 disabled:opacity-40'
          >
            Thêm
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className='mt-auto space-y-2 border-t border-zinc-100 px-4 py-3'>
        <Button
          variant='primary'
          className='w-full'
          onClick={() => void onEdit()}
        >
          <Pencil className='size-3.5' />
          Sửa trong canvas
        </Button>
        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' onClick={onDuplicate}>
            <Copy className='size-3.5' />
            Duplicate
          </Button>
          <Button variant='outline' onClick={onDelete}>
            <Trash2 className='size-3.5 text-rose-600' />
            Xoá
          </Button>
        </div>
        <button
          type='button'
          onClick={() => {
            navigator.clipboard.writeText(block.id).then(
              () => toast.success('Đã copy block ID'),
              () => toast.error('Copy thất bại')
            );
          }}
          className='w-full text-[10.5px] text-zinc-500 hover:text-zinc-900'
        >
          Copy block ID
        </button>
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
      <div className='flex items-center gap-1.5 text-[10.5px] tracking-wider text-zinc-500 uppercase'>
        {icon}
        {label}
      </div>
      <div className='text-right text-[11.5px] text-zinc-700'>{value}</div>
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
        'flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
        active ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
      )}
    >
      {icon}
    </button>
  );
}
