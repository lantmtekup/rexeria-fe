'use client';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useSmoothProgress } from './use-smooth-progress';
import { CurtainReveal } from './curtain-reveal';

/**
 * Horizontal media track.
 *
 * The scroll mechanic comes from `the_grand_service` (a pinned viewport with a row translating
 * under it). The card is `west72_showcase` (`block-editor/blocks/West72Showcase.tsx`): the
 * photograph fills the panel and a light card is anchored into its bottom-right corner, rather
 * than a fixed-width image sitting beside a panel.
 *
 * Type scale and spacing are the source block's, converted from container units to viewport
 * units because this page has no container context:
 *
 * | | source | here |
 * |---|---|---|
 * | chip | `clamp(12px, 0.97cqi, 14px)`, padding 12, uppercase, on `WEST72_BROWN` | same, on `amber-700` |
 * | title | `clamp(34px, 4.17cqi, 60px)`, line-height 0.92, weight 500, uppercase | same |
 * | body | `clamp(15px, 1.25cqi, 18px)`, line-height 1.56 | same |
 * | card | `padding: max(2.78cqi, 28px)`, copy `max-width: 22.15cqi` | same |
 *
 * Two deliberate departures. The source paints the card pure white with a `#763718` title; the
 * Magnolia equivalents are ivory and `amber-700` (#8a5418), which is within a shade of it and
 * keeps the page on its own palette. And the source uppercases the body too — that reads well
 * in English but Vietnamese set entirely in caps with diacritics is markedly harder to read, so
 * only the chip and the title are uppercased.
 *
 * The reveal is the source block's too: four ivory columns part while the photograph unwinds
 * from 15° and 1.2 scale over 1.6s. Each card fires its own, on an IntersectionObserver rather
 * than the vertical rule used elsewhere — a card in this track arrives sideways, so a rule that
 * watches its top edge would never see it come.
 *
 * One addition: the host's height is measured from the track rather than hardcoded, so scroll
 * maps one-to-one onto translation at any window size.
 */
/** Full-bleed panels, edge to edge, as the source block renders its frame at `100svh`. */
const PANEL_W = '100vw';
const GAP = '0px';
const PAD_LEFT = '0px';
const PAD_RIGHT = '0px';
const CARD_PAD = 'max(2.78vw, 28px)';
const COPY_MAX = 'min(22.15vw, 420px)';

/**
 * How much of a panel must be on screen before its curtain starts to part.
 *
 * A panel is a full viewport wide, so this number trades two faults against each other. Set it
 * high and the reveal has not begun while a wide band of the panel is already showing — at
 * 0.55 that band was a solid ivory column a quarter of the window across, since all four
 * curtains were still shut. Set it at zero and the beat starts on the panel's first pixel and
 * its 1.6 s is spent long before the panel is in front of anyone, so the curtain is never seen
 * at all.
 *
 * 0.3 keeps the beat visible: it begins with a strip of the panel showing and runs while the
 * rest of it travels in.
 */
const REVEAL_AT = 0.3;

export type TrackItem = {
  key: string;
  src: string;
  alt: string;
  title: string;
  /** Optional supporting paragraph. Without it the panel sits tighter. */
  body?: string;
  cta?: string;
  /** When present the CTA is a link; otherwise it renders as a plain button. */
  href?: string;
};

export const MediaPanelCard = memo(function MediaPanelCard({
  item,
  index,
  chip,
  flat = false,
}: {
  item: TrackItem;
  index: number;
  chip?: string;
  flat?: boolean;
}) {
  const articleRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (flat || revealed) return;
    const el = articleRef.current;
    if (!el) return;
    // Fires on horizontal arrival as well as vertical, which a rect-top rule cannot do.
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.intersectionRatio >= REVEAL_AT))
          setRevealed(true);
      },
      { threshold: [0, REVEAL_AT, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [flat, revealed]);

  const cta = item.cta ? (
    item.href ? (
      <a
        href={item.href}
        target='_blank'
        rel='noreferrer'
        aria-label={`${item.cta}: ${item.title}`}
        className='border-charcoal-950/30 tracking-luxe text-charcoal-950 hover:border-charcoal-950 mt-7 inline-flex w-fit items-center gap-3 border-b pb-1 font-sans text-[0.62rem] uppercase transition-colors'
      >
        {item.cta}
        <span aria-hidden>→</span>
      </a>
    ) : (
      <button
        type='button'
        className='border-charcoal-950/30 tracking-luxe text-charcoal-950 hover:border-charcoal-950 mt-7 inline-flex w-fit items-center gap-3 border-b pb-1 font-sans text-[0.62rem] uppercase transition-colors'
      >
        {item.cta}
        <span aria-hidden>→</span>
      </button>
    )
  ) : null;

  const card = (
    <div
      className={
        flat
          ? 'bg-ivory relative z-10 -mt-16 mr-4 ml-auto flex w-[calc(100%-2rem)] flex-col'
          : 'bg-ivory absolute right-0 bottom-0 z-20 flex flex-col'
      }
      style={{ padding: CARD_PAD }}
    >
      {chip && (
        <span
          className='font-display text-ivory w-fit bg-amber-700 leading-none font-medium uppercase'
          style={{ padding: 12, fontSize: 'clamp(11px, 0.97vw, 14px)' }}
        >
          {chip}
        </span>
      )}
      <h3
        className='font-display mt-6 w-fit font-medium text-amber-700 uppercase'
        style={{ fontSize: 'clamp(28px, 4.17vw, 60px)', lineHeight: 0.92 }}
      >
        {item.title}
      </h3>
      {item.body && (
        <p
          className='text-charcoal-950 mt-8 font-sans'
          style={{
            fontSize: 'clamp(13px, 1.25vw, 18px)',
            lineHeight: 1.56,
            maxWidth: COPY_MAX,
          }}
        >
          {item.body}
        </p>
      )}
      {cta}
    </div>
  );

  /* Plain img: already right-sized WebP and every card loads up front, so the track never
     stalls on a decode part-way through its travel. */
  const img = (
    <img
      src={item.src}
      alt={item.alt}
      loading='eager'
      decoding='async'
      fetchPriority={index === 0 ? 'high' : 'low'}
      className={
        flat
          ? 'aspect-[4/3] w-full object-cover'
          : 'absolute inset-0 h-full w-full object-cover'
      }
    />
  );

  if (flat) {
    return (
      <article ref={articleRef} className='flex flex-col'>
        {img}
        {card}
      </article>
    );
  }

  return (
    <article
      ref={articleRef}
      className='relative h-full flex-none overflow-hidden'
      style={{ width: PANEL_W }}
    >
      <CurtainReveal open={revealed}>{img}</CurtainReveal>
      {card}
    </article>
  );
});

function Row({
  progress,
  items,
  move,
  chip,
}: {
  progress: MotionValue<number>;
  items: TrackItem[];
  move: number;
  chip?: string;
}) {
  const x = useTransform(progress, [0, 1], [0, -move]);
  return (
    <motion.div
      style={{ x, gap: GAP, paddingLeft: PAD_LEFT, paddingRight: PAD_RIGHT }}
      className='flex h-full w-max flex-row items-center will-change-transform'
    >
      {items.map((item, i) => (
        <MediaPanelCard key={item.key} item={item} index={i} chip={chip} />
      ))}
    </motion.div>
  );
}

/** `chip` is the small label printed on every card, the role the source block's chip plays. */
export function MediaPanelTrack({
  items,
  chip,
}: {
  items: TrackItem[];
  chip?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress: raw } = useScroll({
    target: hostRef,
    offset: ['start start', 'end end'],
  });
  const p = useSmoothProgress(raw);

  const [flat, setFlat] = useState(false);
  const [move, setMove] = useState(0);
  const keys = useMemo(() => items.map(i => i.key).join('|'), [items]);

  useEffect(() => {
    const measure = () => {
      const narrow = window.matchMedia('(max-width: 767px)').matches;
      setFlat(narrow || reduced);
      const vp = viewportRef.current;
      const track = trackRef.current;
      if (narrow || reduced || !vp || !track) {
        setMove(0);
        return;
      }
      setMove(Math.max(0, track.scrollWidth - vp.clientWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    // Webfonts reflow the panels after first paint, which changes the track width.
    const id = window.setTimeout(measure, 500);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('resize', measure);
    };
  }, [reduced, keys]);

  if (flat) {
    return (
      <div className='flex flex-col gap-16'>
        {items.map((item, i) => (
          <MediaPanelCard
            key={item.key}
            item={item}
            index={i}
            chip={chip}
            flat
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      style={{ height: move ? `calc(100svh + ${move}px)` : '300vh' }}
    >
      <div className='sticky top-0 h-[100svh] min-h-[620px] overflow-hidden'>
        <div
          ref={viewportRef}
          className='absolute inset-0 z-[2] overflow-hidden'
        >
          <div ref={trackRef} className='h-full w-max'>
            <Row progress={p} items={items} move={move} chip={chip} />
          </div>
        </div>
      </div>
    </div>
  );
}
