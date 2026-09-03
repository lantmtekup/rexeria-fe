'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FlipbookContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FlipbookProps {
  content: FlipbookContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const ASPECT_CLASS: Record<NonNullable<FlipbookContent['aspect']>, string> = {
  '3/4': 'aspect-[3/4]',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '16/9': 'aspect-[16/9]',
};

/**
 * Pure-CSS flipbook. Each page is rendered as an `<li>` with absolute
 * positioning; flipping a page rotates it via `rotateY(-180deg)`. We
 * z-index based on whether a page is "flipped" yet so the topmost unflipped
 * page sits in front, and flipped pages stack behind in reverse order.
 *
 * No Three.js or external libs — works in every modern browser via
 * transform-style: preserve-3d.
 */
export function Flipbook({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FlipbookProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const sEyebrow = styleOf('eyebrow');
  const sTitle = styleOf('title');
  const sPages = styleOf('pages');

  const pages = Array.isArray(content.pages) ? content.pages : [];
  const [page, setPage] = React.useState(0);
  const aspectClass = ASPECT_CLASS[content.aspect ?? '3/4'];

  const goPrev = () => setPage(p => Math.max(0, p - 1));
  const goNext = () => setPage(p => Math.min(pages.length - 1, p + 1));

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in flex w-full flex-col items-center gap-4 rounded-md bg-amber-50 px-6 py-10 duration-500 @2xl:px-12 @2xl:py-14',
        className
      )}
    >
      {(content.eyebrow || content.title) && (
        <div className='flex flex-col items-center gap-2 text-center'>
          {content.eyebrow && (
            <span
              data-element-key='eyebrow'
              style={sEyebrow}
              className={selectableClass(
                activeKey === 'eyebrow',
                'text-3xs font-semibold tracking-[0.32em] text-amber-700 uppercase'
              )}
            >
              {content.eyebrow}
            </span>
          )}
          {content.title && (
            <h2
              data-element-key='title'
              style={sTitle}
              className={selectableClass(
                activeKey === 'title',
                'text-2xl font-semibold tracking-tight text-neutral-900 @2xl:text-3xl'
              )}
            >
              {content.title}
            </h2>
          )}
        </div>
      )}

      <div
        data-element-key='pages'
        style={sPages}
        className={selectableClass(
          activeKey === 'pages',
          cn('relative w-full max-w-md select-none', aspectClass)
        )}
      >
        <div className='relative size-full' style={{ perspective: '1600px' }}>
          {pages.length === 0 ? (
            <div className='absolute inset-0 grid place-items-center rounded-md bg-white text-xs text-neutral-400 shadow'>
              Chưa có trang
            </div>
          ) : (
            pages.map((p, i) => {
              const flipped = i < page;
              // Z-index: the topmost UN-flipped page sits in front (highest
              // z). Flipped pages stack BEHIND so the in-progress flip
              // animation reveals the page underneath naturally.
              const z = flipped ? i : pages.length - i + 100;
              return (
                <div
                  key={p.id}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transformOrigin: 'left center',
                    transformStyle: 'preserve-3d',
                    transition:
                      'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                    transform: flipped ? 'rotateY(-178deg)' : 'rotateY(0deg)',
                    zIndex: z,
                  }}
                  className='overflow-hidden rounded-md shadow-xl ring-1 ring-black/5'
                >
                  {/* Front face */}
                  <div
                    className='absolute inset-0 bg-white'
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl}
                      alt={p.caption ?? ''}
                      draggable={false}
                      className='pointer-events-none size-full object-cover'
                    />
                    {p.caption && (
                      <span className='absolute right-3 bottom-3 left-3 rounded bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur'>
                        {p.caption}
                      </span>
                    )}
                  </div>
                  {/* Back face — reverse side once flipped. Shows the NEXT
                      page faintly behind so the spread feels like a real
                      book; for simplicity we just render a paper texture. */}
                  <div
                    className='absolute inset-0 bg-gradient-to-br from-amber-100/80 to-amber-200/80'
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div className='text-3xs flex size-full items-center justify-center tracking-widest text-amber-900/40 uppercase'>
                      Lật trang
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Click zones on top of the book — left half = back, right = next */}
          {pages.length > 1 && (
            <>
              <button
                type='button'
                onClick={goPrev}
                disabled={page === 0}
                aria-label='Trang trước'
                className='absolute top-0 bottom-0 left-0 z-[300] w-1/2 cursor-pointer bg-transparent disabled:cursor-default'
              />
              <button
                type='button'
                onClick={goNext}
                disabled={page === pages.length - 1}
                aria-label='Trang sau'
                className='absolute top-0 right-0 bottom-0 z-[300] w-1/2 cursor-pointer bg-transparent disabled:cursor-default'
              />
            </>
          )}
        </div>
      </div>

      {/* Bottom controls — page indicator + explicit arrows */}
      {pages.length > 1 && (
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={goPrev}
            disabled={page === 0}
            aria-label='Trang trước'
            className='inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-white text-neutral-700 shadow ring-1 ring-black/5 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40'
          >
            <ChevronLeft className='size-4' />
          </button>
          {content.showPageNumbers !== false && (
            <span className='font-mono text-xs text-neutral-500 tabular-nums'>
              {page + 1} / {pages.length}
            </span>
          )}
          <button
            type='button'
            onClick={goNext}
            disabled={page === pages.length - 1}
            aria-label='Trang sau'
            className='inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-white text-neutral-700 shadow ring-1 ring-black/5 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40'
          >
            <ChevronRight className='size-4' />
          </button>
        </div>
      )}
    </div>
  );
}
