'use client';

import { useCallback, useEffect, useRef, type KeyboardEvent } from 'react';
import { gsap, MQ } from '@/app/lib/motion';

type Flavor = {
  key: string;
  name: string;
  color: string;
};

const FLAVORS: Flavor[] = [
  { key: 'blonde', name: 'BLONDE', color: '#F5B301' },
  { key: 'amber', name: 'AMBER', color: '#C4622D' },
  { key: 'cherry', name: 'CHERRY', color: '#C0392B' },
  { key: 'full-moon', name: 'FULL MOON', color: '#8C6A3F' },
  { key: 'artisan-pilsner', name: 'ARTISAN PILSNER', color: '#D4A017' },
];

const BOTTLE_X = -28;
const GLASS_X = 34;

type FlavorItemProps = {
  flavor: Flavor;
  index: number;
  onRegister: (index: number, tl: gsap.core.Timeline | null) => void;
  onActivate: (index: number) => void;
};

function FlavorItem({
  flavor,
  index,
  onRegister,
  onActivate,
}: FlavorItemProps) {
  const base = `/assets/section-5/${flavor.key}`;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const bottleRef = useRef<HTMLImageElement>(null);
  const glassRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    const bg = bgRef.current;
    const bottle = bottleRef.current;
    const glass = glassRef.current;
    if (!title || !bg || !bottle || !glass) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 1024px)',
        isMobile: '(max-width: 1023px)',
        reduce: MQ.reduce,
      },
      context => {
        const reduce = Boolean(context.conditions?.reduce);
        const duration = reduce ? 0 : 0.55;

        gsap.set(bottle, { xPercent: -50, x: 0 });
        gsap.set(glass, { xPercent: -50, x: 0, autoAlpha: 0 });
        gsap.set(bg, { autoAlpha: 0 });
        gsap.set(title, { y: 24, autoAlpha: 0 });

        const hoverTl = gsap.timeline({
          paused: true,
          defaults: { duration, ease: 'power2.out' },
        });

        hoverTl
          .to(bottle, { x: BOTTLE_X }, 0)
          .to(glass, { x: GLASS_X, autoAlpha: 1 }, 0)
          .to(bg, { autoAlpha: 1 }, 0)
          .to(title, { y: 0, autoAlpha: 1 }, 0.05);

        onRegister(index, hoverTl);

        return () => {
          onRegister(index, null);
          hoverTl.kill();
        };
      }
    );

    return () => mm.revert();
  }, [index, onRegister]);

  const handleActivate = () => {
    onActivate(index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onActivate(index);
    }
  };

  return (
    <div
      data-flavor-item
      role='button'
      tabIndex={0}
      aria-label={flavor.name}
      onMouseEnter={handleActivate}
      onFocus={handleActivate}
      onKeyDown={handleKeyDown}
      className='relative flex h-full w-[80vw] min-w-[80vw] shrink-0 flex-col items-center justify-center outline-none sm:w-[45vw] sm:min-w-[45vw] lg:w-[33.333vw] lg:min-w-[33.333vw]'
    >
      <h3
        ref={titleRef}
        className='relative z-20 mb-1 shrink-0 px-2 text-center text-3xl leading-none tracking-[0.02em] md:text-4xl lg:mb-2 lg:text-5xl'
        style={{
          fontFamily: 'var(--font-bebas), sans-serif',
          color: flavor.color,
        }}
      >
        {flavor.name}
      </h3>

      <div className='relative aspect-square w-[min(88%,48vh)] lg:w-[min(92%,58vh)]'>
        <img
          ref={bgRef}
          src={`${base}/bg.png`}
          alt=''
          aria-hidden='true'
          className='pointer-events-none absolute top-1/2 left-1/2 z-0 h-[78%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-contain'
          decoding='async'
          loading='lazy'
        />
        <img
          ref={bottleRef}
          src={`${base}/bottle.png`}
          alt={flavor.name}
          className='absolute bottom-[2%] left-1/2 z-10 h-[92%] w-auto object-contain'
          decoding='async'
          loading='lazy'
        />
        <img
          ref={glassRef}
          src={`${base}/glass.png`}
          alt=''
          aria-hidden='true'
          className='absolute bottom-[2%] left-1/2 z-10 h-[68%] w-auto max-w-none object-contain'
          decoding='async'
          loading='lazy'
        />
      </div>
    </div>
  );
}

export default function MoreFlavors() {
  const rootRef = useRef<HTMLElement>(null);
  const videoColRef = useRef<HTMLDivElement>(null);
  const galleryColRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const hoverTlsRef = useRef<(gsap.core.Timeline | null)[]>([]);
  const activeIndexRef = useRef<number | null>(null);
  const activateRef = useRef<(index: number) => void>(() => {});
  const findCenterIndexRef = useRef<() => number>(() => 0);

  const handleActivate = useCallback((index: number) => {
    if (activeIndexRef.current === index) {
      const current = hoverTlsRef.current[index];
      if (current && current.progress() < 1) current.play();
      return;
    }

    if (activeIndexRef.current !== null) {
      hoverTlsRef.current[activeIndexRef.current]?.reverse();
    }
    hoverTlsRef.current[index]?.play();
    activeIndexRef.current = index;
  }, []);

  activateRef.current = handleActivate;

  const findCenterIndex = useCallback(() => {
    const gallery = galleryColRef.current;
    const track = trackRef.current;
    if (!gallery || !track) return 0;

    const items = track.querySelectorAll<HTMLElement>('[data-flavor-item]');
    if (items.length === 0) return 0;

    const galleryRect = gallery.getBoundingClientRect();
    const centerX = galleryRect.left + galleryRect.width / 2;

    let best = 0;
    let bestDist = Infinity;

    items.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      const dist = Math.abs(mid - centerX);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });

    return best;
  }, []);

  findCenterIndexRef.current = findCenterIndex;

  const handleRegister = useCallback(
    (index: number, tl: gsap.core.Timeline | null) => {
      hoverTlsRef.current[index] = tl;
      if (!tl) return;
      requestAnimationFrame(() => {
        activateRef.current(findCenterIndexRef.current());
      });
    },
    []
  );

  const syncCenterItem = useCallback(() => {
    activateRef.current(findCenterIndex());
  }, [findCenterIndex]);

  useEffect(() => {
    const root = rootRef.current;
    const videoCol = videoColRef.current;
    const galleryCol = galleryColRef.current;
    const track = trackRef.current;
    if (!root || !videoCol || !galleryCol || !track) return;

    const mm = gsap.matchMedia();

    // Desktop: pin + scrub; item giữa gallery tự open theo scroll.
    mm.add('(min-width: 1024px)', () => {
      gsap.set(videoCol, { width: '50%', xPercent: 0, autoAlpha: 1 });
      gsap.set(galleryCol, { width: '50%' });
      gsap.set(track, { x: 0 });

      const getCollapseDistance = () => window.innerWidth * 0.5;
      const getTrackDistance = () =>
        Math.max(0, track.scrollWidth - root.offsetWidth);

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => '+=' + (getCollapseDistance() + getTrackDistance()),
          invalidateOnRefresh: true,
          onUpdate: syncCenterItem,
          onRefresh: syncCenterItem,
        },
      });

      tl.to(
        videoCol,
        { width: 0, xPercent: -20, autoAlpha: 0, duration: 1 },
        0
      );
      tl.to(galleryCol, { width: '100%', duration: 1 }, 0);
      tl.to(track, { x: () => -getTrackDistance(), duration: 1 });

      const raf = requestAnimationFrame(syncCenterItem);

      return () => {
        cancelAnimationFrame(raf);
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });

    // Mobile: scroll dọc pin section → track chạy ngang theo scrub.
    mm.add('(max-width: 1023px)', () => {
      gsap.set(videoCol, {
        height: '38svh',
        autoAlpha: 1,
        clearProps: 'width,xPercent',
      });
      gsap.set(galleryCol, { clearProps: 'width' });
      gsap.set(track, { x: 0 });

      const getCollapseDistance = () => window.innerHeight * 0.35;
      const getTrackDistance = () =>
        Math.max(0, track.scrollWidth - galleryCol.offsetWidth);

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => '+=' + (getCollapseDistance() + getTrackDistance()),
          invalidateOnRefresh: true,
          onUpdate: syncCenterItem,
          onRefresh: syncCenterItem,
        },
      });

      tl.to(videoCol, { height: 0, autoAlpha: 0, duration: 0.35 }, 0);
      tl.to(track, { x: () => -getTrackDistance(), duration: 1 }, 0);

      const raf = requestAnimationFrame(syncCenterItem);

      return () => {
        cancelAnimationFrame(raf);
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });

    return () => mm.revert();
  }, [syncCenterItem]);

  return (
    <section
      id='more-flavors'
      ref={rootRef}
      className='relative h-svh w-full overflow-hidden bg-[#e2dccb] lg:h-screen lg:overflow-hidden'
    >
      <div className='flex h-full min-w-0 flex-col lg:h-full lg:flex-row lg:overflow-hidden'>
        <div
          ref={videoColRef}
          className='relative h-[38svh] w-full shrink-0 overflow-hidden lg:h-full lg:w-1/2 lg:min-w-0 lg:overflow-hidden'
        >
          <video
            className='absolute inset-0 h-full w-full object-cover'
            src='/assets/videos/section5.mp4'
            autoPlay
            muted
            loop
            playsInline
            preload='auto'
          />
          <div className='absolute inset-0 bg-black/30' />
          <div className='relative z-10 flex h-full items-center px-6 md:px-10 lg:px-16'>
            <div>
              <p
                className='text-sm tracking-[0.12em] text-[#EDE6D6]'
                style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
              >
                OUR PRODUCTS
              </p>
              <h2
                className='mt-6 max-w-xl text-5xl leading-[0.95] text-[#EDE6D6] md:text-6xl'
                style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
              >
                DON&apos;T STOP NOW &ndash; THERE&apos;S MORE FLAVOR TO
                DISCOVER!
              </h2>
            </div>
          </div>
        </div>

        <div
          ref={galleryColRef}
          className='group/track relative min-h-0 min-w-0 flex-1 overflow-hidden lg:h-full lg:w-1/2 lg:flex-none lg:overflow-hidden'
          onMouseLeave={syncCenterItem}
        >
          <div ref={trackRef} className='flex h-full w-max lg:h-full'>
            {FLAVORS.map((flavor, index) => (
              <FlavorItem
                key={flavor.key}
                flavor={flavor}
                index={index}
                onRegister={handleRegister}
                onActivate={handleActivate}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
