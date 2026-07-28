import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  ReadymagProjectsContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface ReadymagProjectsProps {
  content: ReadymagProjectsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Readymag (RADIUS) projects — lưới brutalist: card đánh số (No.00X + tên lớn
 *  + role) xen card ảnh oval nền đen. Nền trắng, viền đen bo tròn. 1/2 cột. */
export function ReadymagProjects({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: ReadymagProjectsProps) {
  const styleOf = (k: string) =>
    composeStyle(
      elementStyleOf(styles, k),
      orderStyle(order, k),
      positionStyle(positions, k)
    );
  const items = content.items ?? [];
  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container w-full bg-white px-3 py-3 text-black',
        className
      )}
    >
      <div
        data-element-key='items'
        style={styleOf('items')}
        className={selectableClass(
          activeKey === 'items',
          'grid grid-cols-1 gap-3 @xl:grid-cols-2'
        )}
      >
        {items.map((it, i) => (
          <React.Fragment key={i}>
            <div className='flex flex-col rounded-3xl border border-black px-6 py-5'>
              <span className='text-xs font-semibold'>{it.no}</span>
              <h3 className='mt-1 text-4xl font-semibold tracking-tight @2xl:text-6xl'>
                {it.name}
              </h3>
              <span className='mt-2 text-xs font-semibold tracking-wide uppercase'>
                {it.role}
              </span>
            </div>
            <div className='relative aspect-[16/10] overflow-hidden rounded-3xl border border-black bg-black'>
              {it.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.imageUrl}
                  alt={it.name}
                  className='absolute inset-0 h-full w-full rounded-3xl object-cover'
                />
              ) : null}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
