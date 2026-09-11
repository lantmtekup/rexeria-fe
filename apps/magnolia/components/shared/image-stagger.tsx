'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { VR } from '@/lib/motion';

/**
 * Staggered image grid, ported from the rexerai block `FramerImageStagger`
 * (`block-editor/blocks/FramerImageStagger.tsx`).
 *
 * A twelve-column grid where the pictures deliberately do not line up: one large plate on one
 * side, a shorter column dropped below the top edge on the other. The offset is the whole
 * effect — it is what stops three photographs reading as a row of thumbnails.
 *
 * It replaces a sticky stack that was wrong for this material in three ways. Every picture was
 * forced into `aspect-[4/3]`, and two of the three sources are portrait (1800 × 2388), so they
 * were cropped to a third of their height. The statement sat pinned in a narrow column, which
 * on a wide screen left most of the section empty and black. And the handover between two
 * sticky panels of different heights always showed a band of the next picture above the one
 * being read.
 *
 * Nothing here is scroll-driven. The page already pins in four places — the hero film, the
 * heritage curtain, the amenity track, the day sequence — and a fifth scroll mechanic between
 * the unit cards and the townhouse plate was one more thing asking to be scrolled through
 * rather than looked at.
 *
 * Aspect ratios are declared per slot from the real files rather than imposed, so no picture
 * is cropped: `ASPECTS` below is the source geometry.
 */

/** Fraction of the right column's width that it is dropped by. This is the stagger. */
const OFFSET = '7%';

export type StaggerItem = {
  key: string;
  src: string;
  alt: string;
  /** CSS aspect ratio of the source file, e.g. '1800 / 2388'. Never cropped to fit. */
  aspect: string;
};

function Plate({
  item,
  delay,
  reduced,
}: {
  item: StaggerItem;
  delay: number;
  reduced: boolean;
}) {
  return (
    <motion.figure
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 1, delay: reduced ? 0 : delay, ease: VR }}
      className='border-ivory/10 bg-charcoal-900 relative w-full overflow-hidden rounded-2xl border'
      style={{ aspectRatio: item.aspect }}
    >
      <img
        src={item.src}
        alt={item.alt}
        loading='lazy'
        decoding='async'
        className='h-full w-full object-cover'
      />
    </motion.figure>
  );
}

export function ImageStagger({
  items,
  heading,
}: {
  items: StaggerItem[];
  /** Sits above the grid and sets it up, rather than beside it holding a column open. */
  heading?: React.ReactNode;
}) {
  const reduced = useReducedMotion() ?? false;
  const [lead, ...rest] = items;
  if (!lead) return null;

  return (
    <div className='mx-auto max-w-[1440px] px-5 md:px-12'>
      {heading && <div className='mb-14 max-w-[42rem] md:mb-20'>{heading}</div>}

      <div className='grid grid-cols-12 gap-4 md:gap-6'>
        <div className='col-span-12 md:col-span-7'>
          <Plate item={lead} delay={0} reduced={reduced} />
        </div>

        {/* Dropped below the plate's top edge — the offset the grid is named for. */}
        <div
          className='col-span-12 flex flex-col gap-4 md:col-span-5 md:gap-6'
          style={reduced ? undefined : { marginTop: OFFSET }}
        >
          {rest.map((item, i) => (
            <Plate
              key={item.key}
              item={item}
              delay={0.12 * (i + 1)}
              reduced={reduced}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
