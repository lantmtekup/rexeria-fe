'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface Variant {
  key: string;
  label: string;
  desc: string;
  image: string;
  highlights: string[];
}

interface Props {
  id?: string;
  variants: Variant[];
  onOpenDiscover?: (viewKey?: string) => void;
  /** Inner content scaled by DiscoverPanel while open (child of pin). */
  behindRef?: RefObject<HTMLDivElement | null>;
}

// Editorial product views: pin + scrub advances chapters; quiet text links
// seek. Neutral-50 chapter break from Details; rounded image plate; balanced rail.
export default function ProductVariantSection({
  id,
  variants,
  onOpenDiscover,
  behindRef,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = sectionRef.current;
    if (!root || variants.length === 0) return;

    if (reduceMotion) {
      gsap.set(root.querySelectorAll('.variant-img'), { autoAlpha: 1 });
      gsap.set(root.querySelectorAll('.variant-copy'), { autoAlpha: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const imgs = gsap.utils.toArray<HTMLElement>('.variant-img', root);
      const copies = gsap.utils.toArray<HTMLElement>('.variant-copy', root);
      const count = imgs.length;
      if (count === 0) return;

      gsap.set(imgs, { autoAlpha: 0 });
      gsap.set(copies, { autoAlpha: 0, y: 8 });
      gsap.set(imgs[0], { autoAlpha: 1 });
      gsap.set(copies[0], { autoAlpha: 1, y: 0 });

      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const scrollVh = isMobile ? 2.0 : 2.4;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * scrollVh)}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.85,
          invalidateOnRefresh: true,
          onUpdate: self => {
            const idx = Math.min(count - 1, Math.floor(self.progress * count));
            setActiveIndex(prev => (prev === idx ? prev : idx));
          },
        },
      });

      tlRef.current = tl;

      const segment = 1;
      for (let i = 0; i < count - 1; i++) {
        const at = i * segment;
        tl.to({}, { duration: segment * 0.4 }, at);
        tl.to(
          imgs[i],
          { autoAlpha: 0, duration: segment * 0.25, ease: 'none' },
          at + segment * 0.4
        );
        tl.to(
          copies[i],
          { autoAlpha: 0, y: -4, duration: segment * 0.2, ease: 'none' },
          at + segment * 0.4
        );
        tl.fromTo(
          imgs[i + 1],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: segment * 0.25, ease: 'none' },
          at + segment * 0.4
        );
        tl.fromTo(
          copies[i + 1],
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: segment * 0.25, ease: 'none' },
          at + segment * 0.45
        );
        tl.to({}, { duration: segment * 0.35 }, at + segment * 0.65);
      }
    }, root);

    ScrollTrigger.refresh();
    return () => {
      tlRef.current = null;
      ctx.revert();
    };
  }, [variants, reduceMotion]);

  const handleSeek = (index: number) => {
    if (reduceMotion) {
      setActiveIndex(index);
      return;
    }
    const tl = tlRef.current;
    if (!tl) return;
    const count = variants.length;
    if (count <= 1) return;
    const progress = (index + 0.5) / count;
    const st = tl.scrollTrigger;
    if (!st) return;
    window.scrollTo({
      top: st.start + (st.end - st.start) * progress,
      behavior: 'smooth',
    });
  };

  const handleTabKeyDown = (e: KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSeek(index);
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleSeek(Math.min(index + 1, variants.length - 1));
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      handleSeek(Math.max(index - 1, 0));
    }
  };

  const handleOpenDiscover = () => {
    onOpenDiscover?.(variants[activeIndex]?.key ?? variants[0]?.key);
  };

  if (variants.length === 0) return null;

  const viewNav = (
    <nav
      className='flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-start md:gap-x-8'
      role='tablist'
      aria-label='Góc nhìn sản phẩm'
    >
      {variants.map((v, i) => {
        const isActive = activeIndex === i;
        return (
          <button
            key={v.key}
            type='button'
            role='tab'
            tabIndex={isActive ? 0 : -1}
            aria-label={v.label}
            aria-selected={isActive}
            data-cta-id={`variant-pick-${v.key}`}
            onClick={() => handleSeek(i)}
            onKeyDown={e => handleTabKeyDown(e, i)}
            className={`text-[12px] tracking-[0.14em] transition-colors duration-300 md:text-[13px] ${
              isActive
                ? 'font-normal text-[#003468]'
                : 'font-light text-neutral-400 hover:text-neutral-600'
            }`}
          >
            {v.label}
          </button>
        );
      })}
    </nav>
  );

  const discoverCta = onOpenDiscover ? (
    <button
      type='button'
      onClick={handleOpenDiscover}
      data-cta-id='variant-discover'
      className='group inline-flex items-center gap-3 border-b border-[#003468] pb-1.5 text-[13px] tracking-[0.16em] text-[#003468] uppercase transition-opacity duration-300 hover:opacity-70 active:opacity-90 md:text-sm'
    >
      Xem chi tiết
      <svg
        width='14'
        height='14'
        viewBox='0 0 24 24'
        fill='none'
        aria-hidden
        className='transition-transform duration-300 group-hover:translate-x-0.5'
      >
        <path
          d='M5 12h14M13 6l6 6-6 6'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </button>
  ) : null;

  const copyBlock = (
    <div className='relative min-h-[14rem] w-full max-w-sm md:min-h-[16rem]'>
      {variants.map(v => (
        <div
          key={v.key}
          className='variant-copy absolute inset-x-0 top-0 flex flex-col gap-5'
        >
          <h2 className='text-2xl font-light tracking-tight text-[#003468] md:text-3xl'>
            {v.label}
          </h2>
          <p className='text-sm leading-relaxed font-light text-neutral-600 md:text-base md:leading-[1.7]'>
            {v.desc}
          </p>
          {v.highlights.length > 0 && (
            <ul className='flex flex-col'>
              {v.highlights.map(item => (
                <li
                  key={item}
                  className='border-b border-neutral-200/90 py-2.5 text-sm font-light text-neutral-700 last:border-b-0 md:text-[15px]'
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );

  const imageStage = (
    <div className='variant-stage relative h-[44vh] w-full overflow-hidden rounded-2xl bg-neutral-100 md:h-[58vh] md:rounded-3xl'>
      {variants.map((v, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={v.key}
          src={v.image}
          alt={`Citizen L Arcly - ${v.label}`}
          className='variant-img absolute inset-0 h-full w-full object-cover'
          style={{ zIndex: i + 1 }}
        />
      ))}
    </div>
  );

  if (reduceMotion) {
    return (
      <section
        id={id}
        ref={sectionRef}
        className='product-variant relative w-full border-t border-neutral-200/80 bg-neutral-50 px-6 py-20 md:py-28'
      >
        <div
          ref={behindRef}
          className='mx-auto flex max-w-6xl flex-col gap-16 overflow-hidden'
        >
          {variants.map(v => (
            <div
              key={v.key}
              className='grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-12'
            >
              <div className='md:col-span-7'>
                <div className='overflow-hidden rounded-2xl bg-neutral-100 md:rounded-3xl'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.image}
                    alt={`Citizen L Arcly - ${v.label}`}
                    className='variant-img h-[40vh] w-full object-cover md:h-[50vh]'
                  />
                </div>
              </div>
              <div className='variant-copy flex flex-col gap-5 md:col-span-5'>
                <h2 className='text-2xl font-light tracking-tight text-[#003468] md:text-3xl'>
                  {v.label}
                </h2>
                <p className='text-sm leading-relaxed font-light text-neutral-600 md:text-base'>
                  {v.desc}
                </p>
                {v.highlights.length > 0 && (
                  <ul className='flex flex-col'>
                    {v.highlights.map(item => (
                      <li
                        key={item}
                        className='border-b border-neutral-200/90 py-2.5 text-sm font-light text-neutral-700 last:border-b-0'
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
          {discoverCta && <div className='pt-2'>{discoverCta}</div>}
        </div>
      </section>
    );
  }

  return (
    <section
      id={id}
      ref={sectionRef}
      className='product-variant relative w-full border-t border-neutral-200/80 bg-neutral-50'
    >
      <div
        ref={behindRef}
        className='relative flex min-h-[100dvh] w-full items-center overflow-hidden px-6 py-20 md:px-10 md:py-24 lg:px-16'
      >
        <div className='mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-10 lg:gap-14'>
          {/* Media column: framed image + view switcher as caption control */}
          <div className='order-1 flex flex-col gap-4 md:col-span-7 md:gap-5 lg:col-span-7'>
            {imageStage}
            {viewNav}
          </div>

          {/* Editorial rail: title, body, facts, CTA */}
          <div className='order-2 flex flex-col items-start gap-8 md:col-span-5 md:gap-9 lg:col-span-5'>
            {copyBlock}
            {discoverCta}
          </div>
        </div>
      </div>
    </section>
  );
}
