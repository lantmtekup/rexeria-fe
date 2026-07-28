'use client';

import { useEffect, useRef, useState } from 'react';
import {
  gsap,
  ScrollTrigger,
  SplitText,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '@/app/lib/motion';

/** 3 visual panels / track thirds — s07–s08 share panel 0 */
const PANEL_COUNT = 3;
/** Panel steps + last-panel exit (image left / copy right / fade) */
const SCROLL_SEGMENTS = PANEL_COUNT + 1;
const SEGMENT_DURATION = 1;
/** Line-reveal timing within s07→s08 (fits SEGMENT_DURATION) */
const LINE_REVEAL_DURATION = 0.65;
const LINE_REVEAL_STAGGER = 0.35;
/** Image lag vs track (px) — text rides full speed, image counters for parallax */
const PARALLAX_Y_DESKTOP = 180;
const PARALLAX_Y_MOBILE = 100;
/** Fallback mobile s07→s08 bag lift when measure is unavailable */
const MOBILE_IMAGE_SETTLE_Y = -140;
/** Last-panel exit: mild split + soft fade (end like screenshot, not blank) */
const EXIT_X_PERCENT = 18;
const EXIT_OPACITY = 0.25;

type OverviewPanel = {
  id: string;
  image: string;
  title: string;
  body?: string;
  details?: {
    label: string;
    ref: string;
    bullets: readonly string[];
  };
};

const PANELS: readonly OverviewPanel[] = [
  {
    id: 'overview',
    image: '/product1-nobg.png',
    title:
      'SMALL BAG WITH TOP HANDLE CRAFTED FROM BOX CALF LEATHER, ADORNED WITH HAND-EMBROIDERED EMBOSSED STARS.',
    details: {
      label: 'Details',
      ref: 'REF. AA0406AAM062DDO',
      bullets: [
        'Smooth and sophisticated Box Calf leather',
        'Natural calfskin lining',
        '1 interior flat pocket with vanity mirror',
        'Removable and adjustable leather shoulder strap',
        'Gold metal hardware',
      ],
    },
  },
  {
    id: 'material',
    image: '/product2-nobg.png',
    title: "BRILLANT MINI'S MATERIAL",
    body: 'Presenting the Luxury bag, where elegance meets sophistication. Made from premium materials, this handbag is a must-have for fashion connoisseurs. Its chic design and classic style make it the ultimate accessory for any outfit, perfect for your fashionable escapades.',
  },
  {
    id: 'design',
    image: '/product3-nobg.png',
    title: "BRILLANT MINI'S DESIGN",
    body: 'The Brillant Mini by Delvaux embodies the essence of luxury and style. Meticulously crafted from premium materials, this handbag is a must-have for discerning fashion lovers. Its exquisite design and classic charm make it the ultimate accessory for any outfit, perfect for your elegant gatherings.',
  },
] as const;

const [OVERVIEW_PANEL, ...SLIDE_PANELS] = PANELS;

type ScreenId = 's07' | 's08' | 's09' | 's10';

const ProductImage = ({
  src,
  className,
}: {
  src: string;
  className?: string;
}) => <img src={src} alt='Brillant Mini handbag' className={className} />;

const PanelCopy = ({
  panel,
  lineReveal = false,
}: {
  panel: OverviewPanel;
  /** Mark text nodes for SplitText line-reveal (s07 only). */
  lineReveal?: boolean;
}) => (
  <>
    <h2
      data-line-reveal={lineReveal ? '' : undefined}
      className='font-(family-name:--font-genath) text-[clamp(1.15rem,4.2vw,1.35rem)] leading-[1.35] tracking-[0.01em] text-black uppercase md:text-[clamp(1.1rem,2.4vw,1.4rem)] lg:text-[clamp(1.05rem,2.2vw,1.55rem)]'
    >
      {panel.title}
    </h2>
    {panel.body ? (
      <p
        data-line-reveal={lineReveal ? '' : undefined}
        className='mt-4 text-[13px] leading-[1.7] text-black md:mt-5 md:text-sm lg:text-[0.95rem]'
      >
        {panel.body}
      </p>
    ) : null}
    {panel.details ? (
      <div className='mt-6 md:mt-8'>
        <p
          data-line-reveal={lineReveal ? '' : undefined}
          className='text-[13px] text-black md:text-sm'
        >
          {panel.details.label}
        </p>
        <p
          data-line-reveal={lineReveal ? '' : undefined}
          className='mt-1 text-[13px] tracking-wide text-black md:text-sm'
        >
          {panel.details.ref}
        </p>
        <ul className='mt-3 list-none space-y-1.5 text-[13px] leading-relaxed text-black md:mt-4 md:text-sm'>
          {panel.details.bullets.map(item => (
            <li key={item} data-line-reveal={lineReveal ? '' : undefined}>
              {`• ${item}`}
            </li>
          ))}
        </ul>
      </div>
    ) : null}
  </>
);

const PANEL_STAGE_CLASS =
  'flex h-full flex-col items-center justify-start gap-4 px-5 pb-20 pt-16 md:flex-row md:items-center md:justify-center md:gap-10 md:px-10 md:pb-16 md:pt-0 lg:gap-20 lg:px-24 lg:pb-0';
/** s07–s08: bag starts viewport-centered on mobile (copy is absolute / out of flow). */
const OVERVIEW_STAGE_CLASS =
  'flex h-full flex-col items-center justify-center px-5 pb-20 md:flex-row md:gap-10 md:px-10 md:pb-16 lg:gap-20 lg:px-24 lg:pb-0';
const PANEL_IMAGE_COL_CLASS = 'flex w-full shrink-0 justify-center md:w-[50%]';
const PANEL_COPY_COL_CLASS =
  'w-full max-w-[20rem] md:w-[42%] md:max-w-[24rem] lg:max-w-[26rem]';
const PANEL_IMAGE_CLASS =
  'mx-auto w-[min(68vw,260px)] md:w-[min(42vw,340px)] lg:mx-0 lg:w-full';
const OVERVIEW_COPY_MOBILE_CLASS =
  'absolute inset-x-5 bottom-20 z-0 mx-auto max-w-[20rem] md:static md:inset-auto md:bottom-auto md:mx-0 md:w-[42%] md:max-w-[24rem] lg:max-w-[26rem]';

const SplitPanel = ({
  panel,
  isLast = false,
}: {
  panel: OverviewPanel;
  isLast?: boolean;
}) => (
  <div className={PANEL_STAGE_CLASS}>
    <div className={PANEL_IMAGE_COL_CLASS}>
      <div
        data-parallax-image
        data-exit-image={isLast ? '' : undefined}
        className={`${PANEL_IMAGE_CLASS} will-change-transform`}
      >
        <ProductImage src={panel.image} className='h-auto w-full' />
      </div>
    </div>
    <div
      data-exit-copy={isLast ? '' : undefined}
      className={`${PANEL_COPY_COL_CLASS} will-change-transform`}
    >
      <PanelCopy panel={panel} />
    </div>
  </div>
);

/** Offset from SplitPanel left-column rest → stage center (s07 start). */
const getImageCenterOffset = (imageEl: HTMLElement, isMobile: boolean) => {
  if (isMobile) return 0;

  const stage = imageEl.closest('[data-overview-stage]');
  if (!(stage instanceof HTMLElement)) return 0;

  const prevX = gsap.getProperty(imageEl, 'x');
  gsap.set(imageEl, { x: 0 });

  const stageRect = stage.getBoundingClientRect();
  const imageRect = imageEl.getBoundingClientRect();

  gsap.set(imageEl, { x: prevX });

  const targetCenterX = stageRect.left + stageRect.width / 2;
  const currentCenterX = imageRect.left + imageRect.width / 2;

  return targetCenterX - currentCenterX;
};

/**
 * Mobile s08: lift bag so its bottom clears the absolute copy block (+ gap).
 * Measures at y:0 (centered rest), returns negative y in px.
 */
const getMobileImageSettleY = (
  imageEl: HTMLElement,
  detailsEl: HTMLElement,
  gap = 24
) => {
  const prevY = Number(gsap.getProperty(imageEl, 'y')) || 0;
  gsap.set(imageEl, { y: 0 });

  const imageBottom = imageEl.getBoundingClientRect().bottom;
  const detailsTop = detailsEl.getBoundingClientRect().top;

  gsap.set(imageEl, { y: prevY });

  const overlap = imageBottom + gap - detailsTop;
  if (overlap <= 0) return MOBILE_IMAGE_SETTLE_Y;
  return -overlap;
};

export default function ProductOverview() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const [activeScreen, setActiveScreen] = useState<ScreenId>('s07');
  const activeScreenRef = useRef<ScreenId>('s07');

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const image = imageRef.current;
    const details = detailsRef.current;

    if (!root || !track || !image || !details) return;

    const mm = gsap.matchMedia();
    let cancelled = false;

    /** Map timeline labels → screen; `exit` stays on s10 for aria. */
    const resolveScreenFromLabel = (label: string): ScreenId => {
      if (label === 's07') return 's07';
      if (label === 's08') return 's08';
      if (label === 's09') return 's09';
      return 's10';
    };

    const syncActiveScreen = (label: string) => {
      const next = resolveScreenFromLabel(label);
      if (next === activeScreenRef.current) return;
      activeScreenRef.current = next;
      setActiveScreen(next);
    };

    const setupMotion = () => {
      if (cancelled) return;

      mm.add(MOTION_CONDITIONS, context => {
        const { isMobile, reduce } = context.conditions as MotionConditions;

        const ctx = gsap.context(() => {
          const [imageS09, imageS10] = gsap.utils.toArray<HTMLElement>(
            root.querySelectorAll('[data-parallax-image]')
          );
          const exitImage =
            root.querySelector<HTMLElement>('[data-exit-image]') ?? imageS10;
          const exitCopy = root.querySelector<HTMLElement>('[data-exit-copy]');
          const parallaxY = isMobile ? PARALLAX_Y_MOBILE : PARALLAX_Y_DESKTOP;
          const mobileSettleY = () =>
            isMobile ? getMobileImageSettleY(image, details) : 0;
          const revealEls = gsap.utils.toArray<HTMLElement>(
            details.querySelectorAll('[data-line-reveal]')
          );
          const split = revealEls.length
            ? SplitText.create(revealEls, { type: 'lines', mask: 'lines' })
            : null;
          const lines = split?.lines ?? [];

          gsap.set(track, { yPercent: 0 });
          // Rest layout = SplitPanel; s07 starts bag at stage center via x offset
          gsap.set(image, {
            x: () => getImageCenterOffset(image, isMobile),
            y: 0,
          });
          gsap.set(details, { autoAlpha: 1 });
          if (lines.length) {
            gsap.set(lines, { yPercent: 110, opacity: 0 });
          }
          // Incoming panels start shifted down so they lag behind copy on enter
          if (imageS09) gsap.set(imageS09, { y: parallaxY });
          if (imageS10) gsap.set(imageS10, { y: parallaxY });
          if (exitImage) gsap.set(exitImage, { xPercent: 0, opacity: 1 });
          if (exitCopy) {
            gsap.set(
              exitCopy,
              isMobile
                ? { y: 0, yPercent: 0, opacity: 1 }
                : { xPercent: 0, opacity: 1 }
            );
          }

          if (reduce) {
            gsap.set(image, { x: 0, y: isMobile ? mobileSettleY() : 0 });
            if (lines.length) gsap.set(lines, { yPercent: 0, opacity: 1 });
            if (imageS09) gsap.set(imageS09, { y: 0 });
            if (imageS10) gsap.set(imageS10, { y: 0 });
            activeScreenRef.current = 's08';
            setActiveScreen('s08');
            return;
          }

          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: `+=${SCROLL_SEGMENTS * 100}%`,
              pin: true,
              // Low scrub lag so the panel tracks scroll tightly before snap
              scrub: 0.15,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              // TEMP: disable snap-to-next-screen (labelsDirectional) — causes scroll jank/lag
              // snap: {
              //   snapTo: 'labelsDirectional',
              //   duration: { min: 0.18, max: 0.32 },
              //   delay: 0,
              //   ease: 'power3.inOut',
              // },
              onUpdate: self => {
                const anim = self.animation;
                if (anim && 'currentLabel' in anim) {
                  syncActiveScreen(
                    (anim as gsap.core.Timeline).currentLabel() ?? 's07'
                  );
                  return;
                }
                syncActiveScreen('s07');
              },
            },
          });

          // s07 → s08: bag lifts above copy (mobile) / settles left (desktop); lines reveal
          tl.addLabel('s07', 0).to(image, {
            x: 0,
            y: mobileSettleY,
            duration: SEGMENT_DURATION,
          });

          if (lines.length) {
            tl.to(
              lines,
              {
                yPercent: 0,
                opacity: 1,
                duration: LINE_REVEAL_DURATION,
                stagger: { amount: LINE_REVEAL_STAGGER },
                ease: 'power3.out',
              },
              '<'
            );
          }

          tl.addLabel('s08')
            // s08 → s09: track slides full speed; images counter-move (slower vs copy)
            .to(track, {
              yPercent: -(100 / PANEL_COUNT),
              duration: SEGMENT_DURATION,
            })
            .to(
              image,
              {
                y: () => mobileSettleY() + parallaxY,
                duration: SEGMENT_DURATION,
              },
              '<'
            )
            .to(
              imageS09,
              {
                y: 0,
                duration: SEGMENT_DURATION,
              },
              '<'
            )
            .addLabel('s09')
            // s09 → s10: same parallax lag on outgoing / incoming images
            .to(track, {
              yPercent: -(200 / PANEL_COUNT),
              duration: SEGMENT_DURATION,
            })
            .to(
              imageS09,
              {
                y: parallaxY,
                duration: SEGMENT_DURATION,
              },
              '<'
            )
            .to(
              imageS10,
              {
                y: 0,
                duration: SEGMENT_DURATION,
              },
              '<'
            )
            .addLabel('s10');

          // s10 → exit: desktop L/R split; mobile = reverse of s07→s08 (image↑ / copy↓)
          if (exitImage && exitCopy) {
            if (isMobile) {
              tl.to(exitImage, {
                y: MOBILE_IMAGE_SETTLE_Y,
                opacity: EXIT_OPACITY,
                duration: SEGMENT_DURATION,
              })
                .to(
                  exitCopy,
                  {
                    // Reverse of s07 line-reveal (lines start at yPercent 110)
                    yPercent: 110,
                    opacity: EXIT_OPACITY,
                    duration: SEGMENT_DURATION,
                  },
                  '<'
                )
                .addLabel('exit');
            } else {
              tl.to(exitImage, {
                xPercent: -EXIT_X_PERCENT,
                opacity: EXIT_OPACITY,
                duration: SEGMENT_DURATION,
              })
                .to(
                  exitCopy,
                  {
                    xPercent: EXIT_X_PERCENT,
                    opacity: EXIT_OPACITY,
                    duration: SEGMENT_DURATION,
                  },
                  '<'
                )
                .addLabel('exit');
            }
          }
        }, root);

        ScrollTrigger.refresh();

        return () => {
          ctx.revert();
        };
      });
    };

    void document.fonts.ready.then(setupMotion);

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className='relative h-svh overflow-hidden bg-[#F5F5F5]'
      aria-label='Product overview'
    >
      <div
        ref={trackRef}
        className='relative h-[300%] will-change-transform'
        aria-live='polite'
      >
        {/* Screens 07–08: same SplitPanel grid — bag starts centered, settles left */}
        <div
          data-overview-stage
          className='relative h-1/3 overflow-hidden'
          aria-hidden={activeScreen !== 's07' && activeScreen !== 's08'}
        >
          <div className={OVERVIEW_STAGE_CLASS}>
            <div className={PANEL_IMAGE_COL_CLASS}>
              <div
                ref={imageRef}
                className={`relative z-10 ${PANEL_IMAGE_CLASS} will-change-transform`}
              >
                <ProductImage
                  src={OVERVIEW_PANEL.image}
                  className='h-auto w-full'
                />
              </div>
            </div>
            <div className={OVERVIEW_COPY_MOBILE_CLASS}>
              <div ref={detailsRef} className='will-change-transform'>
                <PanelCopy panel={OVERVIEW_PANEL} lineReveal />
              </div>
            </div>
          </div>
        </div>

        {SLIDE_PANELS.map((panel, index) => (
          <div
            key={panel.id}
            className='relative h-1/3 overflow-hidden'
            aria-hidden={activeScreen !== (index === 0 ? 's09' : 's10')}
          >
            <SplitPanel
              panel={panel}
              isLast={index === SLIDE_PANELS.length - 1}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
