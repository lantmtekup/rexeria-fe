'use client';

import * as React from 'react';
import {
  Image as ImageIcon,
  TextCursorInput,
  Trash2,
  Type,
  Video,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import type { ExtraElement, ExtraElementKind } from './types';

interface Props {
  elements: ExtraElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

const KIND_META: Record<
  ExtraElementKind,
  { label: string; icon: React.ElementType }
> = {
  text: { label: 'Text', icon: Type },
  edit_text: { label: 'Edit text', icon: TextCursorInput },
  photo: { label: 'Photo', icon: ImageIcon },
  video: { label: 'Video', icon: Video },
};

function labelOf(el: ExtraElement): string {
  switch (el.kind) {
    case 'text':
      return el.content.text || 'Text';
    case 'edit_text':
      return el.content.placeholder || el.content.fieldName || 'Edit text';
    case 'photo':
      return el.content.alt || 'Photo';
    case 'video':
      return el.content.alt || 'Video';
  }
}

/**
 * Render the list of user-added extra elements below the fixed layer
 * list. Click → select (so the canvas highlights + the toolbar swaps to
 * per-kind editor). Trash icon removes.
 */
export function ExtraElementsList({
  elements,
  selectedId,
  onSelect,
  onRemove,
}: Props) {
  if (elements.length === 0) {
    return (
      <p className='px-3 py-2 text-[11px] text-neutral-400'>
        Chưa có element tự thêm. Bấm “Thêm element” để bắt đầu.
      </p>
    );
  }
  return (
    <ul className='flex flex-col gap-1.5'>
      {elements
        .slice()
        // Newest on top (zIndex desc, then array order).
        .sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0))
        .map(el => {
          const meta = KIND_META[el.kind];
          const Icon = meta.icon;
          const active = selectedId === el.id;
          return (
            <li key={el.id}>
              <button
                type='button'
                onClick={() => onSelect(el.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs ring-1 transition-colors',
                  active
                    ? 'bg-sky-50 text-sky-900 ring-sky-200'
                    : 'bg-white text-neutral-700 ring-neutral-200 hover:bg-neutral-50'
                )}
              >
                <Icon className='size-3.5 shrink-0 text-neutral-500' />
                <span className='min-w-0 flex-1 truncate'>{labelOf(el)}</span>
                <span className='text-[10px] text-neutral-400'>
                  {meta.label}
                </span>
                <button
                  type='button'
                  onClick={e => {
                    e.stopPropagation();
                    onRemove(el.id);
                  }}
                  className='inline-flex size-5 items-center justify-center rounded text-neutral-400 hover:bg-red-50 hover:text-red-600'
                  aria-label='Xoá element'
                >
                  <Trash2 className='size-3' />
                </button>
              </button>
            </li>
          );
        })}
    </ul>
  );
}
