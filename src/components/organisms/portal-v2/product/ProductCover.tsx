import { Package } from 'lucide-react';

import { ProductImage } from '@/components/molecules/portal-v2/product-image';
import { cn } from '@/lib/cn';

type ProductCoverProps = {
  /** The product's photo, when one is on file. Falls back to the quiet mark. */
  src?: string | null;
  alt?: string;
  /** Fixed height override. Cards use the responsive clamp. */
  height?: number;
  className?: string;
};

/**
 * Card cover drawn to the same rules as JourneyCover / ExperienceCover —
 * one soft field, one hairline, one quiet mark. No per-product gradient:
 * colourful letter swatches fight the catalogue grid at this scale.
 *
 * A real photo wins when there is one. `object-contain` rather than cover: the
 * box is 16/10 but catalogue photography is square-to-portrait, and cropping a
 * product out of its own card is worse than the letterboxing.
 */
export const ProductCover = ({
  src,
  alt = '',
  height,
  className,
}: ProductCoverProps) => (
  <div
    className={cn(
      'relative grid place-items-center overflow-hidden bg-(--pv2-electric-soft)',
      !height &&
        'aspect-[16/10] max-h-[clamp(140px,28vw,200px)] w-full border-b border-[var(--pv2-hair)]',
      className
    )}
    style={height ? { height } : undefined}
  >
    <ProductImage src={src} alt={alt} className='object-contain p-2'>
      <Package
        className='size-8 text-(--pv2-electric)/30'
        strokeWidth={1.6}
        aria-hidden
      />
    </ProductImage>
  </div>
);
