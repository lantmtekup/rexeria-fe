'use client';

import { Route } from 'lucide-react';

import { cn } from '@/lib/cn';

type JourneyCoverProps = {
  /** Fixed height override. Cards use the responsive clamp. */
  height?: number;
  className?: string;
};

/**
 * The card cover, drawn to the same rules as `ExperienceCover` — one aspect
 * ratio, one hairline, one tinted field.
 *
 * One form for every journey, deliberately. A per-journey diagram here competes
 * with the canvas that already draws the graph properly, and a wall of tiny
 * node maps reads as noise at grid scale. The cover's job is to hold the shape
 * of the card; the name and the chips underneath do the identifying.
 */
export const JourneyCover = ({ height, className }: JourneyCoverProps) => (
  <div
    className={cn(
      'relative grid place-items-center overflow-hidden bg-(--pv2-electric-soft)',
      !height &&
        'aspect-[16/10] max-h-[clamp(140px,28vw,200px)] w-full border-b border-[var(--pv2-hair)]',
      className
    )}
    style={height ? { height } : undefined}
  >
    <Route
      className='size-8 text-(--pv2-electric)/30'
      strokeWidth={1.6}
      aria-hidden
    />
  </div>
);
