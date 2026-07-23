'use client';

import { useEffect, useRef } from 'react';
import {
  gsap,
  ScrollTrigger,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '@/app/lib/motion';

type Spec = { label: string; value: string; unit?: string; copy: string };

const SPECS: Spec[] = [
  {
    label: 'ABV',
    value: '5.1',
    unit: '%',
    copy: 'A smooth balance of flavor and strength. Just enough kick to keep things interesting, but light enough to keep the good times rolling. Cheers to that!',
  },
  {
    label: 'IBU',
    value: '18',
    copy: 'Bitterness? Just a whisper. Enough to tease your taste buds, but never overpowering. A sip of balance in every drop.',
  },
  {
    label: 'VOL',
    value: '33',
    unit: 'CL',
    copy: 'Perfectly sized for the right moment. Not too much, not too little—just enough to enjoy every refreshing sip.',
  },
];

export default function AboutProduct() {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    const desktopMq = window.matchMedia('(min-width: 1024px)');

    const fitTitle = () => {
      if (!desktopMq.matches) {
        title.style.transform = 'none';
        title.style.width = '';
        return;
      }

      // Measure natural text width (must be shrink-to-fit, not w-full).
      title.style.transform = 'none';
      title.style.width = 'max-content';

      const parent = title.parentElement;
      if (!parent) return;

      const textWidth = title.scrollWidth;
      if (textWidth <= 0) return;

      const scale = parent.clientWidth / textWidth;
      title.style.transformOrigin = 'left center';
      title.style.transform = `scaleX(${scale})`;
    };

    const parent = title.parentElement;
    const ro = new ResizeObserver(fitTitle);
    if (parent) ro.observe(parent);

    desktopMq.addEventListener('change', fitTitle);
    void document.fonts.ready.then(fitTitle);
    fitTitle();

    return () => {
      ro.disconnect();
      desktopMq.removeEventListener('change', fitTitle);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(MOTION_CONDITIONS, ctx => {
      const { reduce } = ctx.conditions as MotionConditions;
      const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);
      const blendLayers = gsap.utils.toArray<HTMLElement>(
        '[data-reveal-illustration], [data-reveal-crest]',
        root
      );
      const specsRoot = root.querySelector<HTMLElement>('[data-specs]');
      const specsLayer = root.querySelector<HTMLElement>('[data-specs-layer]');
      const specRows = gsap.utils.toArray<HTMLElement>('[data-spec-row]', root);
      const specParts = gsap.utils.toArray<HTMLElement>(
        '[data-spec-label], [data-spec-value], [data-spec-copy]',
        root
      );

      if (reduce) {
        gsap.set(targets, { opacity: 1, y: 0 });
        gsap.set(blendLayers, { y: 0 });
        if (specsLayer) gsap.set(specsLayer, { y: 0 });
        gsap.set(specRows, { autoAlpha: 1, y: 0 });
        gsap.set(specParts, { autoAlpha: 1, y: 0 });
        return;
      }

      // Spec rows — play/reverse based on visual viewport (works with lag transform)
      let checkSpecRows: (() => void) | undefined;

      if (specsRoot && specRows.length) {
        const rowAnims = specRows.map(row => {
          const parts = gsap.utils.toArray<HTMLElement>(
            '[data-spec-label], [data-spec-value], [data-spec-copy]',
            row
          );

          gsap.set(row, { autoAlpha: 0, y: 72 });
          gsap.set(parts, { autoAlpha: 0, y: 36 });

          const tl = gsap
            .timeline({ paused: true })
            .to(row, {
              autoAlpha: 1,
              y: 0,
              duration: 0.75,
              ease: 'power3.out',
            })
            .to(
              parts,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out',
              },
              0.12
            );

          return { row, tl, visible: false };
        });

        checkSpecRows = () => {
          const vh = window.innerHeight;
          const enterLine = vh * 0.88;
          const exitLine = vh * 0.94;

          rowAnims.forEach(item => {
            const top = item.row.getBoundingClientRect().top;

            if (!item.visible && top < enterLine) {
              item.visible = true;
              item.tl.play();
              return;
            }

            // Scrolled back up past the row → reverse so it can play again
            if (item.visible && top >= exitLine) {
              item.visible = false;
              item.tl.reverse();
            }
          });
        };

        ScrollTrigger.create({
          trigger: specsRoot,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: checkSpecRows,
          onRefresh: checkSpecRows,
        });
      }

      // BEVERAGE SPECS — whole block lags hard behind page scroll.
      if (specsRoot && specsLayer) {
        gsap.fromTo(
          specsLayer,
          { y: () => window.innerHeight * 0.6 },
          {
            y: () => -window.innerHeight * 0.45,
            ease: 'none',
            immediateRender: false,
            // Re-check row visibility while scrub lag is catching up
            onUpdate: () => checkSpecRows?.(),
            scrollTrigger: {
              trigger: specsRoot,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      gsap.fromTo(
        targets,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: root,
            start: 'top 75%',
          },
        }
      );

      // Blend layers keep their CSS opacity/mix-blend — only animate translate
      if (blendLayers.length) {
        gsap.fromTo(
          blendLayers,
          { y: 40 },
          {
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: root,
              start: 'top 75%',
            },
          }
        );
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id='about-product'
      ref={rootRef}
      className='w-full'
      style={{
        backgroundColor: '#e4ddcf',
        backgroundImage: "url('/assets/section-2/bg-pattern.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'multiply',
      }}
    >
      <div className='flex min-h-[100svh] flex-col overflow-hidden pt-20 sm:pt-28 lg:h-screen lg:pt-32'>
        <div
          data-reveal-crest
          className='pointer-events-none mx-auto w-[151px] shrink-0'
          style={{
            aspectRatio: '2.69218 / 1',
            filter: 'grayscale(1) saturate(0)',
            mixBlendMode: 'exclusion',
          }}
        >
          <img
            src='/assets/section-2/icon-top.png'
            alt='Belgő crest'
            className='h-full w-full object-contain'
            width={692}
            height={256}
            decoding='async'
          />
        </div>
        <div className='mt-8 flex min-h-0 flex-1 flex-col sm:mt-12 md:mt-20 lg:mt-[100px] lg:flex-row lg:items-start'>
          <div className='shrink-0 px-6 text-[#1A1A1A] md:px-10 lg:flex-1 lg:px-20'>
            <p
              data-reveal
              className='text-sm font-medium'
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              ABOUT PRODUCT
            </p>

            <h2
              data-reveal
              className='mt-4 text-4xl leading-[0.95] sm:mt-6 sm:text-5xl md:text-6xl lg:text-7xl'
              style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
            >
              <span className='block'>BELGO AMBER</span>
              <span className='block'>- BOLD, BALANCED, AND</span>
              <span className='block'>BREWED TO PERFECTION</span>
            </h2>

            <p
              data-reveal
              className='mt-6 max-w-md text-sm leading-relaxed text-[#1A1A1A]/85 sm:mt-8 sm:text-base'
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              Belgo Amber embodies the rich brewing traditions of Belgium,
              crafted with a deep amber hue, smooth caramel maltiness, and a
              touch of spice from noble hops. This well-balanced brew honors
              time-honored techniques, delivering a complex yet refreshing taste
              with a crisp, lingering finish.
            </p>
          </div>
          <div
            data-reveal-illustration
            aria-hidden='true'
            className='pointer-events-none mx-auto w-[min(100%,320px)] shrink-0 sm:w-[min(100%,420px)] md:w-[560px] lg:mx-0 lg:w-[738px]'
            style={{
              aspectRatio: '1.4046639231824416 / 1',
              mixBlendMode: 'multiply',
              opacity: 0.5,
            }}
          >
            <img
              src='/assets/section-2/bg.png'
              alt=''
              className='h-full w-full object-cover object-center'
              width={1095}
              height={788}
              decoding='async'
              loading='lazy'
            />
          </div>
        </div>
      </div>

      <div
        data-specs
        className='w-full overflow-hidden px-6 pb-32 md:px-10 md:pb-48 lg:px-20 lg:pb-64'
      >
        <div
          data-specs-layer
          className='mx-auto max-w-7xl text-[#1A1A1A] will-change-transform'
        >
          <h2
            ref={titleRef}
            className='inline-block max-w-none text-[clamp(2.75rem,12vw,6.5rem)] leading-[0.9] whitespace-nowrap text-[#d72505] will-change-transform lg:text-[210px]'
            style={{
              fontFamily: 'var(--font-bebas), sans-serif',
            }}
          >
            BEVERAGE SPECS
          </h2>

          <div className='mt-8 md:mt-14'>
            {SPECS.map(spec => (
              <div
                key={spec.label}
                data-spec-row
                className='border-t border-[#1A1A1A]/25 py-6 sm:py-8 lg:flex lg:items-start lg:justify-between lg:gap-10'
              >
                <div className='lg:flex-1'>
                  <p
                    data-spec-label
                    className='text-sm tracking-[0.12em] will-change-transform'
                    style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
                  >
                    {spec.label}
                  </p>
                  <p
                    data-spec-value
                    className='mt-3 leading-none will-change-transform'
                    style={{
                      fontFamily: 'var(--font-bebas), sans-serif',
                      fontSize: 'clamp(3.5rem, 8vw, 5.5rem)',
                    }}
                  >
                    {spec.value}
                    {spec.unit && (
                      <span className='ml-1 align-baseline text-[0.4em] tracking-wide'>
                        {spec.unit}
                      </span>
                    )}
                  </p>
                </div>

                <p
                  data-spec-copy
                  className='mt-4 max-w-none text-sm leading-snug font-semibold text-[#1A1A1A] will-change-transform sm:mt-6 sm:max-w-sm sm:text-base lg:mt-2 lg:max-w-sm lg:flex-1'
                  style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                >
                  {spec.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
