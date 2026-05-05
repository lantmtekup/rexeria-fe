'use client';

import * as React from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { cn } from '@/lib/cn';

import { BLOCK_TYPE_META, type BlockType } from './types';

interface AddBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (type: BlockType) => void;
}

const ORDERED_TYPES: BlockType[] = [
  'hero_split',
  'hero_overlay',
  'feature_section',
  'photo_gallery',
  'booking_form',
  'cta_section',
];

export function AddBlockDialog({
  open,
  onOpenChange,
  onPick,
}: AddBlockDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Thêm block mới</DialogTitle>
          <p className='text-sm text-neutral-500'>
            Chọn loại block để thêm vào trang.
          </p>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}
