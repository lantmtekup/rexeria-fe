import { Package } from 'lucide-react';

import { cn } from '@/lib/cn';

type ProductCoverProps = {
  /** Fixed height override. Cards use the responsive clamp. */
  height?: number;
  className?: string;
};

/**
 * Card cover drawn to the same rules as JourneyCover / ExperienceCover —
 * one soft field, one hairline, one quiet mark. No per-product gradient:
 * colourful letter swatches fight the catalogue grid at this scale.
 */
export const ProductCover = ({ height, className }: ProductCoverProps) => (
  <div
    className={cn(
      'relative grid place-items-center overflow-hidden bg-(--pv2-electric-soft)',
      !height &&
        'aspect-[16/10] max-h-[clamp(140px,28vw,200px)] w-full border-b border-[var(--pv2-hair)]',
      className
    )}
    style={height ? { height } : undefined}
  >
    <Package
      className='size-8 text-(--pv2-electric)/30'
      strokeWidth={1.6}
      aria-hidden
    />
  </div>
);
