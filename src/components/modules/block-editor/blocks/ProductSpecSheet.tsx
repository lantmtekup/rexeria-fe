'use client';

import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  ProductSpecSheetContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface ProductSpecSheetProps {
  content: ProductSpecSheetContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Product Spec Sheet — port từ CodeGrid "product page" (022_…). Trang sản phẩm
 * với ảnh + tên + mô tả; bấm "Thông số" thì bảng thông số trượt lên từ đáy
 * (bottom-sheet), bấm đóng thì trượt xuống.
 *
 * Dùng CSS transition + state (mượt + chắc chạy); `prefers-reduced-motion` qua
 * `motion-reduce` của Tailwind.
 */
export function ProductSpecSheet({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: ProductSpecSheetProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const [open, setOpen] = React.useState(false);
  const specs = Array.isArray(content.specs) ? content.specs : [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container relative flex min-h-[70vh] w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-md bg-[#f4f1ea] px-6 py-12 duration-500 ease-out',
        className
      )}
    >
      {content.eyebrow && (
        <span
          data-element-key='eyebrow'
          style={styleOf('eyebrow')}
          className={selectableClass(
            activeKey === 'eyebrow',
            'text-2xs text-content-muted font-semibold tracking-[0.32em] uppercase'
          )}
        >
          {content.eyebrow}
        </span>
      )}

      {content.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          data-element-key='imageUrl'
          src={content.imageUrl}
          alt={content.title ?? ''}
          className={selectableClass(
            activeKey === 'imageUrl',
            'h-64 w-auto rounded-xl object-contain transition-all duration-500'
          )}
          style={{ filter: open ? 'blur(2px)' : 'none' }}
        />
      )}

      {content.title && (
        <h2
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'text-foreground text-2xl font-semibold tracking-tight @2xl:text-4xl'
          )}
        >
          {content.title}
        </h2>
      )}
      {content.description && (
        <p
          data-element-key='description'
          style={styleOf('description')}
          className={selectableClass(
            activeKey === 'description',
            'text-content-muted max-w-md text-center text-sm'
          )}
        >
          {content.description}
        </p>
      )}

      <button
        type='button'
        onClick={() => setOpen(true)}
        className='rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800'
      >
        {content.specLabel ?? 'Thông số'}
      </button>

      {/* Lớp mờ nền khi mở. */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          'absolute inset-0 z-[1] bg-black/30 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      {/* Bottom-sheet thông số. */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 z-[2] rounded-t-2xl bg-white p-6 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className='mb-3 flex items-center justify-between'>
          <span className='text-foreground text-sm font-semibold'>
            {content.specLabel ?? 'Thông số'}
          </span>
          <button
            type='button'
            aria-label='Đóng'
            onClick={() => setOpen(false)}
            className='text-content-muted hover:text-foreground'
          >
            <X className='size-5' />
          </button>
        </div>
        <dl className='grid gap-2 @2xl:grid-cols-2'>
          {specs.map((s, i) => (
            <div
              key={i}
              className='border-border flex items-center justify-between gap-3 border-b py-2 text-sm'
            >
              <dt className='text-content-muted'>{s.label}</dt>
              <dd className='text-foreground font-medium'>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
