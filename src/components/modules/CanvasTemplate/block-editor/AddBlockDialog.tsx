'use client';

import * as React from 'react';
import { Bookmark, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { rexerApi } from '@/services/rexer/endpoints';
import { cn } from '@/lib/cn';

import {
  deleteSavedBlock,
  instantiateSavedBlock,
  listSavedBlocks,
  renameSavedBlock,
  subscribeSavedBlocks,
  type SavedBlock,
} from './savedBlocks';
import { BLOCK_TYPE_META, type Block, type BlockType } from './types';

/** Public /v1/block-types item shape (legacy naming — `code`/`name`/
 *  `is_active`). Admin /v1/admin/block-types uses canonical `type`/`label_vi`
 *  but this dialog only needs the public read which all roles can hit. */
interface BeBlockType {
  code: string;
  name?: string;
  is_active: boolean;
}

interface AddBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pick a built-in block type. */
  onPick: (type: BlockType) => void;
  /** Pick a saved block — caller inserts the fully-formed Block into canvas. */
  onPickSaved?: (block: Block) => void;
}

const ORDERED_TYPES: BlockType[] = [
  'hero_split',
  'hero_overlay',
  'image_carousel',
  'carousel_3d',
  'stories',
  'flipbook',
  'panorama',
  'feature_section',
  'photo_gallery',
  'split_screen',
  'quiz',
  'poll',
  'booking_form',
  'cta_section',
];

type Tab = 'builtin' | 'saved';

export function AddBlockDialog({
  open,
  onOpenChange,
  onPick,
  onPickSaved,
}: AddBlockDialogProps) {
  const [tab, setTab] = React.useState<Tab>('builtin');
  const [saved, setSaved] = React.useState<SavedBlock[]>([]);
  // BE block-types catalog — filter `is_active` source-of-truth.
  // Null = loading; Set<code> = loaded; empty Set = nothing active.
  const [activeCodes, setActiveCodes] = React.useState<Set<string> | null>(
    null
  );

  // Load + subscribe so saves in another tab refresh this list automatically.
  React.useEffect(() => {
    if (!open) return;
    setSaved(listSavedBlocks());
    return subscribeSavedBlocks(() => setSaved(listSavedBlocks()));
  }, [open]);

  // Load BE block-types + filter is_active. Show only types both FE knows
  // how to render (ORDERED_TYPES) AND admin has marked active.
  React.useEffect(() => {
    if (!open) return;
    setActiveCodes(null);
    rexerApi.blockTypes
      .list({ is_active: true })
      .then(r => {
        const items = (r.items ?? []) as BeBlockType[];
        setActiveCodes(
          new Set(items.filter(b => b.is_active).map(b => b.code))
        );
      })
      .catch(() => {
        // BE down? Fail open — show all FE types so editor remains usable.
        setActiveCodes(new Set(ORDERED_TYPES));
      });
  }, [open]);

  // Active types = FE-supported intersected with BE active set.
  const visibleTypes = React.useMemo(() => {
    if (!activeCodes) return [];
    return ORDERED_TYPES.filter(t => activeCodes.has(t));
  }, [activeCodes]);

  const handlePickSaved = (entry: SavedBlock) => {
    if (!onPickSaved) {
      // Fallback: fall through to the builtin type so user still gets a block.
      onPick(entry.block.blockType);
    } else {
      onPickSaved(instantiateSavedBlock(entry));
    }
    onOpenChange(false);
  };

  const loadingTypes = activeCodes === null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[85vh] flex-col sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Thêm block mới</DialogTitle>
          <p className='text-sm text-neutral-500'>
            Chọn block có sẵn hoặc tái sử dụng block đã lưu trong thư viện.
          </p>
        </DialogHeader>

        {/* Tab strip — sticky to dialog top while content scrolls below. */}
        <div className='flex shrink-0 items-end gap-1 border-b border-neutral-200'>
          <TabBtn active={tab === 'builtin'} onClick={() => setTab('builtin')}>
            Block có sẵn
            {!loadingTypes && visibleTypes.length > 0 ? (
              <span className='ml-1.5 rounded-full bg-neutral-100 px-1.5 text-[10px] font-semibold text-neutral-600'>
                {visibleTypes.length}
              </span>
            ) : null}
          </TabBtn>
          <TabBtn active={tab === 'saved'} onClick={() => setTab('saved')}>
            <span className='inline-flex items-center gap-1.5'>
              <Bookmark className='size-3.5' />
              Đã lưu
              {saved.length > 0 ? (
                <span className='rounded-full bg-neutral-900 px-1.5 text-[10px] font-semibold text-white'>
                  {saved.length}
                </span>
              ) : null}
            </span>
          </TabBtn>
        </div>

        {/* Scrollable body — capped to dialog height so 14+ block cards don't
            push the footer/header out of viewport. */}
        <div className='-mr-1 flex-1 overflow-y-auto pr-1'>
          {tab === 'builtin' ? (
            loadingTypes ? (
              <div className='flex items-center justify-center py-12 text-sm text-neutral-500'>
                <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải
                catalog block…
              </div>
            ) : visibleTypes.length === 0 ? (
              <div className='rounded-lg border border-dashed border-neutral-200 px-4 py-12 text-center text-sm text-neutral-500'>
                Không có block type nào ở trạng thái active. Vào{' '}
                <strong>/admin/block-types</strong> để bật.
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                {visibleTypes.map(type => {
                  const meta = BLOCK_TYPE_META[type];
                  return (
                    <button
                      key={type}
                      type='button'
                      onClick={() => {
                        onPick(type);
                        onOpenChange(false);
                      }}
                      className={cn(
                        'group flex cursor-pointer flex-col gap-2 overflow-hidden rounded-lg border border-neutral-200 bg-white p-2 text-left transition-colors hover:border-neutral-900'
                      )}
                    >
                      <div
                        className='flex aspect-[16/10] items-center justify-center rounded-md text-[11px] font-semibold tracking-wider text-white/80 uppercase'
                        style={{ backgroundColor: meta.accent }}
                      >
                        {meta.label}
                      </div>
                      <span className='px-1 text-xs font-medium text-neutral-700 group-hover:text-neutral-900'>
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <SavedTab
              entries={saved}
              onPick={handlePickSaved}
              onChanged={() => setSaved(listSavedBlocks())}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-neutral-900 text-neutral-900'
          : 'border-transparent text-neutral-500 hover:text-neutral-800'
      )}
    >
      {children}
    </button>
  );
}

function SavedTab({
  entries,
  onPick,
  onChanged,
}: {
  entries: SavedBlock[];
  onPick: (entry: SavedBlock) => void;
  onChanged: () => void;
}) {
  if (entries.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2 rounded-lg border border-dashed border-neutral-200 px-4 py-12 text-center'>
        <Bookmark className='size-8 text-neutral-300' />
        <p className='text-sm font-medium text-neutral-700'>Thư viện trống</p>
        <p className='max-w-sm text-xs text-neutral-500'>
          Bấm icon dấu trang trên header của editor để lưu block hiện tại vào
          thư viện — sau đó tái sử dụng ở mọi canvas.
        </p>
      </div>
    );
  }
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
      {entries.map(e => (
        <SavedCard key={e.id} entry={e} onPick={onPick} onChanged={onChanged} />
      ))}
    </div>
  );
}

function SavedCard({
  entry,
  onPick,
  onChanged,
}: {
  entry: SavedBlock;
  onPick: (e: SavedBlock) => void;
  onChanged: () => void;
}) {
  const [renaming, setRenaming] = React.useState(false);
  const [nextName, setNextName] = React.useState(entry.name);
  const meta = BLOCK_TYPE_META[entry.block.blockType];

  React.useEffect(() => {
    if (renaming) setNextName(entry.name);
  }, [renaming, entry.name]);

  const submitRename = () => {
    const trimmed = nextName.trim();
    if (!trimmed || trimmed === entry.name) {
      setRenaming(false);
      return;
    }
    renameSavedBlock(entry.id, trimmed);
    onChanged();
    toast.success('Đã đổi tên');
    setRenaming(false);
  };

  const handleDelete = () => {
    if (!window.confirm(`Xoá "${entry.name}" khỏi thư viện?`)) return;
    deleteSavedBlock(entry.id);
    onChanged();
    toast.success('Đã xoá');
  };

  return (
    <div className='group flex flex-col gap-2 overflow-hidden rounded-lg border border-neutral-200 bg-white p-2 transition-colors hover:border-neutral-900'>
      <button
        type='button'
        onClick={() => onPick(entry)}
        className='flex aspect-[16/10] cursor-pointer items-center justify-center rounded-md text-[11px] font-semibold tracking-wider text-white/80 uppercase'
        style={{ backgroundColor: meta.accent }}
      >
        {meta.label}
      </button>
      <div className='flex items-center gap-1 px-1'>
        {renaming ? (
          <Input
            autoFocus
            value={nextName}
            onChange={e => setNextName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={e => {
              if (e.key === 'Enter') submitRename();
              else if (e.key === 'Escape') setRenaming(false);
            }}
            className='h-7 flex-1 text-xs'
          />
        ) : (
          <button
            type='button'
            onClick={() => onPick(entry)}
            className='min-w-0 flex-1 truncate text-left text-xs font-medium text-neutral-700 hover:text-neutral-900'
            title={entry.name}
          >
            {entry.name}
          </button>
        )}
        <button
          type='button'
          onClick={() => setRenaming(v => !v)}
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
      </div>
    </div>
  );
}
