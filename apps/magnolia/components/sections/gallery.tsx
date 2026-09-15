'use client';
import Image from 'next/image';
import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useLocale } from '@/components/shared/locale-provider';
import { useSmoothProgress } from '@/components/shared/use-smooth-progress';
import { FrameScrub } from '@/components/journey/frame-scrub';
import {
  StackedReveal,
  type StackedItem,
} from '@/components/shared/stacked-reveal';

/**
 * Day experience, rebuilt on the rexerai block `HeroScroll` ("Hero Scroll Reveal Cinematic").
 *
 * The original slides four pairs of images in from the right and out to the left. Each phase
 * arrives, sits, and is gone; nothing connects morning to noon except that one replaced the
 * other, and the section reads as four separate panels rather than one day passing.
 *
 * The stacked reveal makes the connection visible: each photograph shrinks into a frame and
 * uncovers the next standing behind it, so the four times of day become one continuous
 * passage. See components/shared/stacked-reveal.tsx for the values it carries over.
 *
 * Only the four lead photographs remain. The second image of each pair was decoration in a
 * layout that no longer exists; four full-bleed pictures, each given the screen, say more.
 */
const PHASE_IMAGES = [
  { id: 'morning', src: '/images/assets/day-experience/morning-01.webp' },
  { id: 'noon', src: '/images/assets/day-experience/noon-01.webp' },
  { id: 'afternoon', src: '/images/assets/day-experience/afternoon-01.webp' },
  { id: 'evening', src: '/images/assets/day-experience/evening-02.webp' },
] as const;

/** First frame of the day, used as the film's poster while it loads. */
const POSTER = '/images/assets/day-experience/morning-01.webp';

export function GallerySection() {
  const { t } = useLocale();
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;

  const items: StackedItem[] = PHASE_IMAGES.map(p => ({
    key: p.id,
    src: p.src,
    alt: `${t.gallery.ariaLabel} — ${t.gallery.phases[p.id]}`,
    label: t.gallery.phases[p.id],
  }));

  return (
    <section
      id='gallery'
      ref={ref}
      aria-label={t.gallery.ariaLabel}
      className='bg-charcoal-950 relative snap-start'
    >
      <GalleryIntro />
      <StackedReveal items={items} />
    </section>
  );
}

/**
 * The statement that opens the passage, over the scroll-scrubbed film.
 *
 * The film is the backdrop rather than the subject: the words sit on it, and it advances with
 * the same scroll that brings them in and takes them out. At 180svh the scrub runs about
 * 119 px per second of footage, the same legible rate the hero uses.
 */
export function GalleryIntro() {
  const { t } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress: raw } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const p = useSmoothProgress(raw);

  const opacity = useTransform(p, [0, 0.18, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(p, [0, 0.18, 0.7, 1], [28, 0, 0, -24]);
  const blur = useTransform(
    p,
    [0, 0.18, 0.7, 1],
    ['blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(6px)']
  );

  const [first, second] = t.gallery.intro.split('\n');

  return (
    <div ref={ref} style={{ height: reduced ? undefined : '180svh' }}>
      <div className='bg-charcoal-950 sticky top-0 flex h-[100svh] min-h-[620px] flex-col items-center justify-center gap-9 overflow-hidden px-5 md:gap-14 md:px-8'>
        {/*
         * Phim trong KHUNG VIỀN MỀM — cùng cái mask với khung tour 360.
         *
         * Trước đó phim chạy full-bleed phía sau một lớp scrim tối
         * (charcoal/80 → /45 → /80) và câu chữ đè lên trên. Kết quả: gần như
         * không thấy phim, chỉ thấy một vệt tối, và chữ phải đeo
         * text-shadow 28px mới đọc được. Đóng khung phim rồi đặt chữ BÊN DƯỚI
         * thì cả hai đều rõ, và không cần scrim lẫn text-shadow.
         */}
        <div className='relative aspect-[4/5] w-full max-w-[87.5rem] overflow-hidden [mask-image:url(/journey/mask/frame-square.svg)] [mask-repeat:no-repeat] [mask-size:100%_100%] sm:aspect-square md:aspect-[1641/842] md:w-4/5'>
          {reduced ? (
            <Image
              src={POSTER}
              alt=''
              fill
              sizes='(max-width: 767px) 100vw, 80vw'
              className='object-cover'
            />
          ) : (
            <FrameScrub
              dir='/frames/grace'
              count={73}
              targetRef={ref}
              poster={POSTER}
            />
          )}
        </div>

        <motion.p
          style={reduced ? undefined : { opacity, y, filter: blur }}
          className='font-display text-ivory/95 relative z-10 max-w-[46rem] text-center text-[clamp(1.5rem,2.9vw,3.1rem)] leading-[1.22] tracking-[-0.02em]'
        >
          {first}
          <br />
          {second}
        </motion.p>
      </div>
    </div>
  );
}
