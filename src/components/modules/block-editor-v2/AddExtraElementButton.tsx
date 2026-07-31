'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import {
  Crosshair,
  Eraser,
  Hourglass,
  Image as ImageIcon,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  SplitSquareHorizontal,
  TextCursorInput,
  Type,
  Video,
} from 'lucide-react';

import { cn } from '@/lib/cn';

import { FLOATING, R_FLOATING } from './chrome';
import type { ExtraElementKind } from '@/components/modules/block-editor/types';

interface Props {
  onPick: (kind: ExtraElementKind) => void;
  disabled?: boolean;
}

const KINDS: Array<{
  kind: ExtraElementKind;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    kind: 'text',
    label: 'Text',
    hint: 'Label tĩnh chỉ để hiển thị',
    icon: Type,
  },
  {
    kind: 'edit_text',
    label: 'Edit Text',
    hint: 'Ô input cho người xem nhập',
    icon: TextCursorInput,
  },
  {
    kind: 'photo',
    label: 'Photo',
    hint: 'Ảnh từ thư viện media',
    icon: ImageIcon,
  },
  {
    kind: 'video',
    label: 'Video',
    hint: 'Video từ URL hoặc media',
    icon: Video,
  },
  {
    kind: 'hotspot',
    label: 'Hotspot',
    hint: 'Pin click → mở modal có ảnh/CTA',
    icon: Crosshair,
  },
  {
    kind: 'compare',
    label: 'So sánh ảnh',
    hint: 'Slider before/after — kéo để reveal',
    icon: SplitSquareHorizontal,
  },
  {
    kind: 'range',
    label: 'Slider giá trị',
    hint: 'Input range — chọn số trong khoảng',
    icon: SlidersHorizontal,
  },
  {
    kind: 'countdown',
    label: 'Countdown',
    hint: 'Đếm ngược tới deadline / sự kiện',
    icon: Hourglass,
  },
  {
    kind: 'reveal',
    label: 'Reveal',
    hint: 'Cào / lột / spotlight để hé lộ ảnh',
    icon: Eraser,
  },
  {
    kind: 'spin_wheel',
    label: 'Vòng quay',
    hint: 'Spin wheel — minigame may mắn',
    icon: RotateCcw,
  },
];

/**
 * Popover trigger that lets the user add a free-drag element (text /
 * edit_text / photo / video) to the current block. Picking a kind closes
 * the popover and calls `onPick` — the caller spawns + persists the
 * element via `extraElements.ts` helpers.
 */
export function AddExtraElementButton({ onPick, disabled }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type='button'
          disabled={disabled}
          className={cn(
            'inline-flex h-7 w-full items-center justify-center gap-1 rounded-md text-xs font-medium ring-1 transition-colors',
            'bg-white text-neutral-700 ring-neutral-200 hover:bg-neutral-50 hover:ring-neutral-300',
            'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 disabled:ring-neutral-100'
          )}
        >
          <Plus className='size-3.5' /> Thêm element
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align='start'
          sideOffset={6}
          className={cn(
            'animate-in fade-in zoom-in-95 z-50 w-60 overflow-hidden bg-[var(--pv2-paper)]',
            R_FLOATING,
            FLOATING
          )}
        >
          <div className='border-b px-3 py-2'>
            <p className='text-foreground text-xs font-semibold'>
              Chọn loại element
            </p>
            <p className='text-muted-foreground text-2xs'>
              Element mới sẽ đặt giữa block, có thể kéo tự do sau.
            </p>
          </div>
          <ul className='py-1'>
            {KINDS.map(({ kind, label, hint, icon: Icon }) => (
              <li key={kind}>
                <button
                  type='button'
                  onClick={() => {
                    onPick(kind);
                    setOpen(false);
                  }}
                  className='flex w-full items-start gap-2.5 px-3 py-2 text-left hover:bg-neutral-100'
                >
                  <span className='mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700'>
                    <Icon className='size-3.5' />
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='block text-sm leading-5 font-medium'>
                      {label}
                    </span>
                    <span className='text-muted-foreground text-2xs block leading-4'>
                      {hint}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
