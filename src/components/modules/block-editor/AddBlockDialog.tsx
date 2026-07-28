'use client';

import * as React from 'react';
import {
  Bookmark,
  Check,
  Loader2,
  Pencil,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Chip } from '@/components/atoms/chip';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { rexerApi } from '@/services/rexer/endpoints';
import { cn } from '@/lib/cn';
import {
  BLOCK_STATUS_META,
  BLOCK_STATUS_ORDER,
  effectiveBlockStatus,
} from '@/lib/block-status';

import { BlockMiniPreview } from './BlockMiniPreview';
import { createBlock } from './factory';
import { instantiateSavedBlock } from './savedBlocks';
import { BLOCK_TYPE_META, type Block, type BlockType } from './types';
import { RxApiError } from '@/services/rexer/client';
import type { Block as ServerBlock, BlockStatus } from '@/services/rexer/types';

const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_STATUS_FILTER: BlockStatus | 'all' = 'published';

/** Row thư viện từ GET /v1/blocks — cùng nguồn /admin/blocks. */
type LibraryEntry = {
  id: string;
  name: string;
  typeCode: string;
  tags: string[];
  status: BlockStatus;
  createdAt: string;
  updatedAt?: string;
  /** Settings hợp lệ (editor Block); null với brief/placeholder rỗng. */
  block: Block | null;
};

/** Wave 3: picker đọc `/v1/blocks` (BlocksPage) — KHÔNG cộng BLOCK_TYPE_META catalog.
 *  totalCount = số row thư viện sau status filter, không gộp ~189 type code FE. */
function serverToLibraryEntry(b: ServerBlock): LibraryEntry {
  const s = b.settings as Record<string, unknown> | null | undefined;
  let block: Block | null = null;
  if (s && typeof s === 'object' && 'blockType' in s) {
    block = s as unknown as Block;
  }
  return {
    id: b.id,
    name: b.name,
    typeCode: b.type_code,
    tags: b.tags ?? [],
    status: effectiveBlockStatus(b),
    createdAt: b.created_at,
    updatedAt: b.updated_at,
    block,
  };
}

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

function matchesQuery(text: string, q: string): boolean {
  return text.toLowerCase().includes(q);
}

function matchesLibraryEntry(entry: LibraryEntry, q: string): boolean {
  if (!q) return true;
  if (matchesQuery(entry.name, q)) return true;
  if (matchesQuery(entry.typeCode, q)) return true;
  if (entry.tags.some(t => matchesQuery(t, q))) return true;
  const meta = BLOCK_TYPE_META[entry.typeCode as BlockType];
  if (meta) {
    if (matchesQuery(meta.label, q)) return true;
    if (matchesQuery(meta.adminLabel, q)) return true;
    if (meta.tags.some(t => matchesQuery(t, q))) return true;
  }
  return false;
}

function formatTagLabel(tag: string): string {
  return tag.replace(/-/g, ' ');
}

function getEntryTags(entry: LibraryEntry): string[] {
  const typeTags = BLOCK_TYPE_META[entry.typeCode as BlockType]?.tags ?? [];
  return Array.from(new Set([...entry.tags, ...typeTags]));
}

function collectAvailableTags(entries: LibraryEntry[]): string[] {
  const counts = new Map<string, number>();
  for (const e of entries) {
    for (const tag of getEntryTags(e)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.keys()).sort(
    (a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b)
  );
}

function matchesEntryTagFilter(
  entry: LibraryEntry,
  tagFilter: string | 'all'
): boolean {
  if (tagFilter === 'all') return true;
  return getEntryTags(entry).includes(tagFilter);
}

function filterLibraryEntries(
  entries: LibraryEntry[],
  q: string,
  tagFilter: string | 'all',
  statusFilter: BlockStatus | 'all'
): LibraryEntry[] {
  return entries.filter(entry => {
    if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
    if (!matchesLibraryEntry(entry, q)) return false;
    if (!matchesEntryTagFilter(entry, tagFilter)) return false;
    return true;
  });
}

function getPreviewBlock(entry: LibraryEntry): Block {
  if (entry.block) return entry.block;
  const type = entry.typeCode as BlockType;
  if (BLOCK_TYPE_META[type]) {
    const block = createBlock(type);
    block.name = entry.name;
    return block;
  }
  return {
    id: `preview_${entry.id}`,
    blockType: type,
    name: entry.name,
    contentVi: { desktop: {} as Block['contentVi']['desktop'] },
    contentEn: { desktop: {} as Block['contentEn']['desktop'] },
    isVisible: true,
  };
}

function instantiateLibraryEntry(entry: LibraryEntry): Block {
  if (entry.block) {
    return instantiateSavedBlock({
      id: entry.id,
      name: entry.name,
      block: entry.block,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tags: entry.tags,
    });
  }
  const block = createBlock(entry.typeCode as BlockType);
  block.name = entry.name;
  block.id = `b_${Math.random().toString(36).slice(2, 10)}`;
  return block;
}

interface AddBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Chèn nhiều block theo type_code (fallback khi không có onPickSaved). */
  onPick: (types: BlockType[]) => void;
  /** Chèn nhiều block đã instantiate từ thư viện. */
  onPickSaved?: (blocks: Block[]) => void;
}

export function AddBlockDialog({
  open,
  onOpenChange,
  onPick,
  onPickSaved,
}: AddBlockDialogProps) {
  const [library, setLibrary] = React.useState<LibraryEntry[] | null>(null);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<BlockStatus | 'all'>(
    DEFAULT_STATUS_FILTER
  );
  const [tagFilter, setTagFilter] = React.useState<string | 'all'>('all');
  const [selection, setSelection] = React.useState<Set<string>>(new Set());

  const reloadLibrary = React.useCallback(
    async (opts?: { keepStale?: boolean }) => {
      if (!opts?.keepStale) setLibrary(null);
      try {
        const r = await rexerApi.blocks.list({ limit: 200 });
        setLibrary((r.items ?? []).map(serverToLibraryEntry));
      } catch {
        setLibrary([]);
      }
    },
    []
  );

  React.useEffect(() => {
    if (!open) return;
    void reloadLibrary({ keepStale: true });
  }, [open, reloadLibrary]);

  React.useEffect(() => {
    if (open) return;
    setSearchInput('');
    setSearch('');
    setStatusFilter(DEFAULT_STATUS_FILTER);
    setTagFilter('all');
    setSelection(new Set());
  }, [open]);

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const q = normalizeQuery(search);

  const statusScoped = React.useMemo(() => {
    if (!library) return [];
    if (statusFilter === 'all') return library;
    return library.filter(e => e.status === statusFilter);
  }, [library, statusFilter]);

  const filteredEntries = React.useMemo(
    () => filterLibraryEntries(statusScoped, q, tagFilter, 'all'),
    [statusScoped, q, tagFilter]
  );

  // totalCount = row thư viện BE (theo status), không cộng catalog FE.
  const totalCount = statusScoped.length;
  const filteredCount = filteredEntries.length;

  const availableTags = React.useMemo(
    () => collectAvailableTags(statusScoped),
    [statusScoped]
  );

  const hasActiveFilters =
    q !== '' || tagFilter !== 'all' || statusFilter !== DEFAULT_STATUS_FILTER;

  const handleClearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter(DEFAULT_STATUS_FILTER);
    setTagFilter('all');
  };

  const handleToggleEntry = (id: string) => {
    setSelection(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    if (selection.size === 0 || !library) return;

    const picked = library.filter(e => selection.has(e.id));
    const blocks = picked.map(instantiateLibraryEntry);

    if (onPickSaved) {
      onPickSaved(blocks);
    } else {
      onPick(blocks.map(b => b.blockType));
    }

    for (const entry of picked) {
      if (!entry.id.startsWith('legacy:')) {
        void rexerApi.blocks.use(entry.id).catch(() => {});
      }
    }

    onOpenChange(false);
  };

  const libraryLoading = library === null;
  const libraryEmpty = library !== null && library.length === 0;
  const noResults = !libraryLoading && filteredCount === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] w-[calc(100%-2rem)] flex-col sm:max-w-6xl'>
        <DialogHeader>
          <DialogTitle>Thêm block mới</DialogTitle>
          <p className='text-sm text-neutral-500'>
            Chọn block từ thư viện — cùng nguồn với trang Blocks.
          </p>
        </DialogHeader>

        <div className='shrink-0 space-y-2.5 border-b border-neutral-100 pb-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='relative min-w-48 flex-1 basis-56'>
              <Search className='text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
              <Input
                placeholder='Tìm theo tên / block type / tag…'
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className='h-9 pl-8'
                aria-label='Tìm kiếm blocks'
              />
            </div>

            <select
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as BlockStatus | 'all')
              }
              className='border-input text-content-muted hover:bg-muted bg-background h-9 w-36 shrink-0 rounded-md border px-2.5 text-xs font-medium outline-none'
              aria-label='Lọc theo trạng thái'
            >
              <option value='all'>Mọi trạng thái</option>
              {BLOCK_STATUS_ORDER.map(s => (
                <option key={s} value={s}>
                  {BLOCK_STATUS_META[s].label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type='button'
                onClick={handleClearFilters}
                className='text-content-muted hover:text-foreground inline-flex h-9 shrink-0 items-center gap-1 px-1.5 text-xs'
                aria-label='Xoá bộ lọc'
              >
                <X className='size-3.5' />
                Clear
              </button>
            )}

            <div className='text-content-muted ml-auto inline-flex h-9 shrink-0 items-center text-xs tabular-nums'>
              {filteredCount} / {totalCount}
            </div>
          </div>

          {availableTags.length > 0 && (
            <div className='flex gap-1.5 overflow-x-auto pb-0.5'>
              <Chip
                size='sm'
                selected={tagFilter === 'all'}
                onClick={() => setTagFilter('all')}
                className='shrink-0 whitespace-nowrap'
              >
                Tất cả tag
              </Chip>
              {availableTags.map(tag => (
                <Chip
                  key={tag}
                  size='sm'
                  selected={tagFilter === tag}
                  onClick={() => setTagFilter(tag)}
                  className='shrink-0 whitespace-nowrap'
                  title={tag}
                >
                  {formatTagLabel(tag)}
                </Chip>
              ))}
            </div>
          )}
        </div>

        <div className='-mr-1 min-h-0 flex-1 space-y-6 overflow-y-auto pr-1'>
          {libraryLoading ? (
            <div className='flex items-center justify-center py-12 text-sm text-neutral-500'>
              <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải thư
              viện…
            </div>
          ) : noResults ? (
            <div className='flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-200 px-4 py-12 text-center'>
              {libraryEmpty && !hasActiveFilters ? (
                <>
                  <Bookmark className='size-8 text-neutral-300' />
                  <p className='text-sm font-medium text-neutral-700'>
                    Thư viện trống
                  </p>
                  <p className='max-w-sm text-xs text-neutral-500'>
                    Tạo block trên trang Blocks hoặc lưu block hiện tại từ
                    editor.
                  </p>
                </>
              ) : (
                <>
                  <p className='text-sm text-neutral-500'>
                    Không có block khớp bộ lọc.
                  </p>
                  {hasActiveFilters && (
                    <Button
                      type='button'
                      variant='neutral'
                      size='sm'
                      onClick={handleClearFilters}
                    >
                      Xoá bộ lọc
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : (
            <section>
              <h3 className='text-2xs mb-2 font-semibold tracking-wider text-neutral-500 uppercase'>
                Thư viện · {filteredCount}
              </h3>
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
                {filteredEntries.map(entry => (
                  <LibraryCard
                    key={entry.id}
                    entry={entry}
                    previewBlock={getPreviewBlock(entry)}
                    selected={selection.has(entry.id)}
                    onToggle={() => handleToggleEntry(entry.id)}
                    onChanged={reloadLibrary}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <DialogFooter className='shrink-0 border-t border-neutral-100 pt-3'>
          <Button
            type='button'
            variant='neutral'
            size='sm'
            onClick={() => onOpenChange(false)}
          >
            Huỷ
          </Button>
          <Button
            type='button'
            variant='default'
            size='sm'
            disabled={selection.size === 0}
            onClick={handleConfirm}
          >
            Thêm{selection.size > 0 ? ` (${selection.size})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SelectionBadge({ selected }: { selected: boolean }) {
  if (!selected) return null;
  return (
    <span className='bg-primary text-primary-foreground absolute top-2 right-2 flex size-5 items-center justify-center rounded-full shadow-sm'>
      <Check className='size-3' aria-hidden />
    </span>
  );
}

function LazyBlockPreview({
  block,
  aspect = '16 / 10',
}: {
  block: Block;
  aspect?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) setVisible(true);
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  if (!visible) {
    return <div ref={ref} className='aspect-16/10 w-full bg-neutral-100' />;
  }

  return (
    <React.Suspense
      fallback={
        <div className='aspect-16/10 w-full animate-pulse bg-neutral-100' />
      }
    >
      <BlockMiniPreview block={block} aspect={aspect} />
    </React.Suspense>
  );
}

function LibraryCard({
  entry,
  previewBlock,
  selected,
  onToggle,
  onChanged,
}: {
  entry: LibraryEntry;
  previewBlock: Block;
  selected: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const [renaming, setRenaming] = React.useState(false);
  const [nextName, setNextName] = React.useState(entry.name);
  const isLegacy = entry.id.startsWith('legacy:');

  React.useEffect(() => {
    if (renaming) setNextName(entry.name);
  }, [renaming, entry.name]);

  const submitRename = async () => {
    const trimmed = nextName.trim();
    if (!trimmed || trimmed === entry.name) {
      setRenaming(false);
      return;
    }
    try {
      await rexerApi.blocks.update(entry.id, { name: trimmed });
      onChanged();
      toast.success('Đã đổi tên');
    } catch (err) {
      const msg =
        err instanceof RxApiError ? err.code || err.message : 'RENAME_FAILED';
      toast.error(`Đổi tên thất bại: ${msg}`);
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Xoá "${entry.name}" khỏi thư viện?`)) return;
    try {
      await rexerApi.blocks.archive(entry.id);
      onChanged();
      toast.success('Đã xoá');
    } catch (err) {
      const msg =
        err instanceof RxApiError ? err.code || err.message : 'DELETE_FAILED';
      toast.error(`Xoá thất bại: ${msg}`);
    }
  };

  const handlePreviewKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-2 rounded-lg border bg-white p-2 transition-colors',
        selected
          ? 'border-primary ring-primary/20 ring-2'
          : 'border-neutral-200 hover:border-neutral-900'
      )}
    >
      <div
        role='button'
        tabIndex={0}
        aria-pressed={selected}
        onClick={onToggle}
        onKeyDown={handlePreviewKeyDown}
        className='relative cursor-pointer overflow-hidden rounded-md border border-neutral-100 bg-neutral-50'
      >
        <SelectionBadge selected={selected} />
        <div className='pointer-events-none'>
          <LazyBlockPreview block={previewBlock} aspect='16 / 10' />
        </div>
      </div>
      <div className='flex items-center gap-1 px-1'>
        {renaming ? (
          <Input
            autoFocus
            value={nextName}
            onChange={e => setNextName(e.target.value)}
            onBlur={submitRename}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => {
              if (e.key === 'Enter') submitRename();
              else if (e.key === 'Escape') setRenaming(false);
            }}
            className='h-7 flex-1 text-xs'
          />
        ) : (
          <button
            type='button'
            onClick={e => {
              e.stopPropagation();
              onToggle();
            }}
            className='line-clamp-2 min-w-0 flex-1 text-left text-xs leading-snug font-medium break-words text-neutral-700 hover:text-neutral-900'
            title={entry.name}
          >
            {entry.name}
          </button>
        )}
        {!isLegacy && (
          <>
            <button
              type='button'
              onClick={e => {
                e.stopPropagation();
                setRenaming(v => !v);
              }}
              className='shrink-0 rounded p-1 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-100 hover:text-neutral-700'
              aria-label='Đổi tên'
            >
              <Pencil className='size-3' />
            </button>
            <button
              type='button'
              onClick={handleDelete}
              className='shrink-0 rounded p-1 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600'
              aria-label='Xoá'
            >
              <Trash2 className='size-3' />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
