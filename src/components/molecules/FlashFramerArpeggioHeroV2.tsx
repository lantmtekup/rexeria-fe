'use client';

import * as React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { cn } from '@/lib/cn';

gsap.registerPlugin(useGSAP);

const DEFAULT_COLUMN_COUNT = 10;
const DEFAULT_COLOR = '#0a0a0a';
const COLUMN_DURATION = 0.88;
/** Chồng lấn px giữa các cột — tránh khe subpixel khi transform trên GPU */
const COLUMN_OVERLAP_PX = 2;
/** Tổng cửa sổ stagger — ease power1.out: nhanh lúc đầu, chậm dần nhẹ, không lệch quá giữa cột 1 và 10 */
const STAGGER_AMOUNT = 0.58;

export const FLASH_COLUMN_DURATION = COLUMN_DURATION;
export const FLASH_STAGGER_AMOUNT = STAGGER_AMOUNT;
export const FLASH_TOTAL_DURATION = COLUMN_DURATION + STAGGER_AMOUNT;

const getColumnLayout = (index: number, count: number) => {
  const slice = 100 / count;
  const overlap = COLUMN_OVERLAP_PX;

  if (index === 0) {
    return {
      left: '0%',
      width: `calc(${slice}% + ${overlap}px)`,
    };
  }

  if (index === count - 1) {
    return {
      left: `calc(${index * slice}% - ${overlap}px)`,
      width: `calc(${slice}% + ${overlap}px)`,
    };
  }

  return {
    left: `calc(${index * slice}% - ${overlap}px)`,
    width: `calc(${slice}% + ${overlap * 2}px)`,
  };
};

export interface FlashFramerArpeggioHeroV2Props {
  onComplete?: () => void;
  columnCount?: number;
  color?: string;
  className?: string;
}

export const FlashFramerArpeggioHeroV2 = ({
  onComplete,
  columnCount = DEFAULT_COLUMN_COUNT,
  color = DEFAULT_COLOR,
  className,
}: FlashFramerArpeggioHeroV2Props) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const onCompleteRef = React.useRef(onComplete);

  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const reduce = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (reduce) {
        onCompleteRef.current?.();
        return;
      }

      const cols = gsap.utils.toArray<HTMLElement>('[data-flash-col]', root);
      if (cols.length === 0) {
        onCompleteRef.current?.();
        return;
      }

      gsap.set(cols, { yPercent: 0, force3D: true });

      gsap
        .timeline({
          defaults: { duration: COLUMN_DURATION, ease: 'power2.out' },
          onComplete: () => onCompleteRef.current?.(),
        })
        .to(cols, {
          yPercent: -100,
          stagger: {
            amount: STAGGER_AMOUNT,
            from: 'start',
            ease: 'power1.out',
          },
        });
    },
    { scope: rootRef, dependencies: [columnCount] }
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 z-60 overflow-hidden',
        className
      )}
    >
      <div className='relative h-full w-full'>
        {Array.from({ length: columnCount }, (_, index) => {
          const layout = getColumnLayout(index, columnCount);

          return (
            <div
              key={index}
              data-flash-col
              className='absolute top-0 h-full transform-[translateZ(0)] will-change-transform backface-hidden'
              style={{
                left: layout.left,
                width: layout.width,
                backgroundColor: color,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
