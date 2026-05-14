'use client';

import * as React from 'react';
import { Bookmark, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
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
  'feature_section',
  'photo_gallery',
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

  // Load + subscribe so saves in another tab refresh this list automatically.
  React.useEffect(() => {
    if (!open) return;
    setSaved(listSavedBlocks());
    return subscribeSavedBlocks(() => setSaved(listSavedBlocks()));
  }, [open]);

  const handlePickSaved = (entry: SavedBlock) => {
    if (!onPickSaved) {
      // Fallback: fall through to the builtin type so user still gets a block.
      onPick(entry.block.blockType);
    } else {
      onPickSaved(instantiateSavedBlock(entry));
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Thêm block mới</DialogTitle>
          <p className='text-sm text-neutral-500'>
            Chọn block có sẵn hoặc tái sử dụng block đã lưu trong thư viện.
          </p>
        </DialogHeader>

        {/* Tab strip */}
        <div className='flex items-end gap-1 border-b border-neutral-200'>
          <TabBtn active={tab === 'builtin'} onClick={() => setTab('builtin')}>
            Block có sẵn
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

        {tab === 'builtin' ? (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {ORDERED_TYPES.map(type => {
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
        ) : (
          <SavedTab
            entries={saved}
            onPick={handlePickSaved}
            onChanged={() => setSaved(listSavedBlocks())}
          />
        )}
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
