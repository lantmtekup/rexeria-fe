'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { Check, ChevronDown, Layers, Plus, Trash2 } from 'lucide-react';

import { cn } from '@/lib/cn';

import type { Block } from './types';

interface BlockSceneMenuProps {
  blocks: Block[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd?: () => void;
  onRemove?: (id: string) => void;
}

export function BlockSceneMenu({
  blocks,
  activeId,
  onSelect,
  onAdd,
  onRemove,
}: BlockSceneMenuProps) {
  const [open, setOpen] = React.useState(false);
  const activeIndex = blocks.findIndex(b => b.id === activeId);
  const activeBlock = activeIndex >= 0 ? blocks[activeIndex] : null;

  if (blocks.length === 0) return null;

  const label =
    blocks.length === 1
      ? (activeBlock?.name ?? 'Block')
      : `${activeIndex + 1}/${blocks.length} · ${activeBlock?.name ?? '—'}`;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type='button'
          aria-label='Chọn block'
          className={cn(
            'flex h-7 max-w-[11rem] items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 text-left shadow-sm transition hover:bg-neutral-50',
            open && 'border-neutral-300 bg-neutral-50'
          )}
        >
          <Layers className='size-3.5 shrink-0 text-neutral-500' />
          <span className='text-2xs min-w-0 flex-1 truncate font-medium text-neutral-800'>
            {label}
          </span>
          <ChevronDown className='size-3 shrink-0 text-neutral-400' />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align='start'
          sideOffset={6}
          className='bg-background animate-in fade-in zoom-in-95 z-50 w-64 overflow-hidden rounded-lg border shadow-lg'
        >
          <div className='border-b px-3 py-2'>
            <p className='text-foreground text-xs font-semibold'>Các block</p>
          </div>
          <ul className='max-h-64 overflow-y-auto py-1'>
            {blocks.map((block, index) => {
              const isActive = block.id === activeId;
              return (
                <li key={block.id}>
                  <div
                    className={cn(
                      'flex items-center gap-1 pr-1',
                      isActive && 'bg-neutral-50'
                    )}
                  >
                    <button
                      type='button'
                      onClick={() => {
                        onSelect(block.id);
                        setOpen(false);
                      }}
                      className='flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-100'
                    >
                      <span className='text-3xs text-content-muted w-4 shrink-0 font-mono tabular-nums'>
                        {index + 1}
                      </span>
                      <span
                        className={cn(
                          'min-w-0 flex-1 truncate',
                          isActive
                            ? 'font-semibold text-neutral-900'
                            : 'text-neutral-700'
                        )}
                      >
                        {block.name}
                      </span>
                      {isActive && (
                        <Check className='size-3.5 shrink-0 text-neutral-900' />
                      )}
                    </button>
                    {isActive && onRemove && blocks.length > 1 && (
                      <button
                        type='button'
                        aria-label={`Xoá ${block.name}`}
                        onClick={() => {
                          onRemove(block.id);
                          setOpen(false);
                        }}
                        className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded text-rose-500 hover:bg-rose-50'
                      >
                        <Trash2 className='size-3.5' />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {onAdd && (
            <div className='border-t p-1.5'>
              <button
                type='button'
                onClick={() => {
                  onAdd();
                  setOpen(false);
                }}
                className='text-2xs flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-neutral-300 py-2 font-medium text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50'
              >
                <Plus className='size-3.5' />
                Thêm block
              </button>
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
