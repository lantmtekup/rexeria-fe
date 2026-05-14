'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import {
  Crosshair,
  Image as ImageIcon,
  Plus,
  TextCursorInput,
  Type,
  Video,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import type { ExtraElementKind } from './types';

interface Props {
  onPick: (kind: ExtraElementKind) => void;
  disabled?: boolean;
}

const KINDS: Array<{
  kind: ExtraElementKind;
  label: string;
  hint: string;
  icon: React.ElementType;
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
    hint: 'Pin click → mở popup mô tả',
    icon: Crosshair,
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
            'inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-md text-xs font-medium ring-1 transition-colors',
            'bg-neutral-900 text-white ring-neutral-900 hover:bg-neutral-800',
            'disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:ring-neutral-200'
          )}
        >
          <Plus className='size-3.5' /> Thêm element
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align='start'
          sideOffset={6}
          className='bg-background animate-in fade-in zoom-in-95 z-50 w-60 overflow-hidden rounded-lg border shadow-lg'
        >
          <div className='border-b px-3 py-2'>
            <p className='text-foreground text-xs font-semibold'>
              Chọn loại element
            </p>
            <p className='text-muted-foreground text-[11px]'>
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
                    <span className='text-muted-foreground block text-[11px] leading-4'>
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
