'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { VR } from '@/lib/motion';

/**
 * Sticky image stack, ported from the rexerai block `FramerAesthaEditorial`.
 *
 * The stacking is **pure CSS `position: sticky` — no scroll JS at all**. Its recon measured
 * transform and opacity across eleven scroll positions and found them unchanged the whole way:
 * the effect is entirely layout.
 *
 * How it works: the panels are siblings, each `sticky top-0`, but with **different heights**
 * (80 / 90 / 100 of the viewport). A short panel finishes its run first, and the next one —
 * being opaque and later in flow — slides up over it. That is the stack.
 *
 * Doing it this way rather than with a scrubbed timeline means no scroll listener, no
 * measurement, nothing to re-sync on resize, and it cannot fall out of step with the scroll.
 */
const PANEL_HEIGHTS = ['80svh', '90svh', '100svh'] as const;

export type StackItem = { key: string; src: string; alt: string };

export function StickyStack({
  items,
  aside,
}: {
  items: StackItem[];
  /** Held beside the stack; it stays put while the images pass. */
  aside?: React.ReactNode;
}) {
  const reduced = useReducedMotion() ?? false;

  if (reduced) {
    return (
      <div className='flex flex-col gap-10 px-5 md:px-8'>
        {aside}
        {items.map(item => (
          <img
            key={item.key}
            src={item.src}
            alt={item.alt}
            loading='lazy'
            decoding='async'
            className='w-full rounded-2xl object-cover'
          />
        ))}
      </div>
    );
  }

  return (
    <div className='relative grid grid-cols-1 gap-8 px-5 md:grid-cols-[0.8fr_1fr] md:gap-16 md:px-12'>
      {aside && (
        <div className='md:sticky md:top-0 md:flex md:h-[100svh] md:items-center'>
          {aside}
        </div>
      )}

      <div className='relative'>
        {items.map((item, i) => (
          <div
            key={item.key}
            className='sticky top-0 flex items-center'
            style={{ height: PANEL_HEIGHTS[i % PANEL_HEIGHTS.length] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: VR }}
              className='border-ivory/12 bg-charcoal-900 w-full overflow-hidden rounded-2xl border shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]'
            >
              <img
                src={item.src}
                alt={item.alt}
                loading='lazy'
                decoding='async'
                className='aspect-[4/3] w-full object-cover'
              />
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
