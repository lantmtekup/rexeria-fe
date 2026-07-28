'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  AccordionMediaContent,
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  selectableClass,
} from './applyStyle';

interface AccordionMediaProps {
  content: AccordionMediaContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
  /**
   * Khi block cha (vd MintVaultCraft) muốn từng mục inline-edit được:
   * truyền `keyPrefix` (vd 'items') + `styleOf` → mỗi title/description/ảnh
   * nhận `data-element-key`, override style qua toolbar, và selection ring.
   * Bỏ trống → render thuần (block standalone `accordion_media`).
   */
  keyPrefix?: string;
  styleOf?: (key: string) => React.CSSProperties | undefined;
}

/**
 * Accordion Media — port pattern Accordion (CodeGrid may2026): hàng panel ngang,
 * panel active nở rộng (ảnh + tiêu đề + mô tả), còn lại thu hẹp; mobile xếp dọc
 * hiện hết. Thuần React state + CSS transition (flex-grow), không lib.
 */
export function AccordionMedia({
  content,
  background,
  className,
  activeKey,
  keyPrefix,
  styleOf,
}: AccordionMediaProps) {
  const items = content.items ?? [];
  const [active, setActive] = React.useState(0);
  const editable = !!keyPrefix;
  const resolve = styleOf ?? (() => undefined);

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container w-full overflow-hidden rounded-md bg-[#0e0f13] p-3 duration-500 ease-out',
        className
      )}
    >
      <div className='flex h-[clamp(340px,52cqi,560px)] flex-col gap-2 @2xl:flex-row'>
        {items.map((item, i) => {
          const isActive = i === active;
          const imgKey = editable ? `${keyPrefix}[${i}].imageUrl` : '';
          const titleKey = editable ? `${keyPrefix}[${i}].title` : '';
          const descKey = editable ? `${keyPrefix}[${i}].description` : '';
          return (
            <button
              key={i}
              type='button'
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              style={{ flexGrow: isActive ? 52 : 16 }}
              className='group relative h-full flex-1 basis-0 overflow-hidden rounded-lg text-left transition-[flex-grow] duration-500 ease-out @2xl:flex-none'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                {...(editable ? { 'data-element-key': imgKey } : {})}
                src={item.imageUrl}
                alt={item.title}
                style={editable ? resolve(imgKey) : undefined}
                className='absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
              <div className='absolute right-4 bottom-4 left-4'>
                <h3
                  {...(editable ? { 'data-element-key': titleKey } : {})}
                  style={composeStyle(
                    {
                      fontSize: 'clamp(16px, 2.4cqi, 20px)',
                      fontWeight: 600,
                      color: '#ffffff',
                    },
                    editable ? resolve(titleKey) : undefined
                  )}
                  className={
                    editable
                      ? selectableClass(activeKey === titleKey, '')
                      : undefined
                  }
                >
                  {item.title}
                </h3>
                <p
                  {...(editable ? { 'data-element-key': descKey } : {})}
                  style={composeStyle(
                    {
                      marginTop: 4,
                      maxWidth: '28rem',
                      fontSize: 'clamp(13px, 1.8cqi, 14px)',
                      color: 'rgba(255,255,255,0.7)',
                    },
                    editable ? resolve(descKey) : undefined
                  )}
                  className={cn(
                    'transition-opacity duration-500',
                    isActive ? 'opacity-100' : 'opacity-0',
                    editable && selectableClass(activeKey === descKey, '')
                  )}
                >
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
