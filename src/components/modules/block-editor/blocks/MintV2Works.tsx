'use client';

/**
 * Data-block "MintV2 · Works" (port từ apps/mintcoin-v2 WorksSection).
 *
 * Card hover-morph zigzag: idle = 1 hero image; hover (desktop) = 4 thumb bay
 * vào 2×2 + backdrop scrub + CTA. Mobile = text/img scrub. Click thumb/hero →
 * lightbox (portal → body, escape container theo R5). Heading char-stagger.
 *
 * Dùng useLandingMotion (block phức tạp tự quản context) vì có event-listener
 * (mouseenter/leave/touch) cần cleanup ngoài gsap.context. isMobile theo
 * container (useContainerMobile).
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import SplitType from 'split-type';

import { useLandingMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintV2WorksContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useContainerMobile } from './useContainerMobile';

interface Props {
  content: MintV2WorksContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

interface LightItem {
  src: string;
  title: string;
  desc: string;
}

// Suy ra title/desc của popup từ URL thumbnail — giữ data cards gọn.
function thumbMeta(src: string): { title: string; desc: string } {
  if (src.includes('coin-obverse'))
    return {
      title: 'Obverse — Charles III Effigy',
      desc: 'The effigy of His Majesty King Charles III, sculpted by Canadian artist Steven Rosati.',
    };
  if (src.includes('coin-reverse'))
    return {
      title: 'Reverse — The Jack Pine',
      desc: "Tom Thomson's windswept pine, rendered in proof-finished relief across 1006.1 g of .99999 fine gold.",
    };
  if (src.includes('jackpine-painting'))
    return {
      title: 'The Source Painting',
      desc: 'Tom Thomson, The Jack Pine (1916–17), painted at Algonquin Park — the inspiration for the coin.',
    };
  if (src.includes('coin-packaging'))
    return {
      title: 'Presentation Case',
      desc: 'Each coin is encapsulated and presented in a Royal Canadian Mint wooden case with a serialised certificate.',
    };
  return {
    title: 'Engraving Detail',
    desc: 'A close angle on the hand-finished die work — every needle, crag, and ripple plotted by hand.',
  };
}

function Lightbox({
  item,
  onClose,
}: {
  item: LightItem | null;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item || typeof document === 'undefined') return null;
  return createPortal(
    <div
      role='dialog'
      aria-modal='true'
      aria-label={item.title}
      onClick={onClose}
      className='fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm md:p-8'
    >
      <div
        onClick={e => e.stopPropagation()}
        className='relative grid w-full max-w-2xl grid-cols-1 overflow-hidden rounded-xl bg-[#0f0f0f] text-neutral-100 shadow-2xl md:grid-cols-2'
      >
        <div className='relative aspect-square bg-neutral-900'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={item.title}
            className='absolute inset-0 h-full w-full object-cover'
          />
        </div>
        <div className='flex flex-col justify-center p-7 md:p-9'>
          <span className='mb-3 text-[11px] tracking-[0.28em] text-[#c79119] uppercase'>
            The Jack Pine · 1 kilo gold
          </span>
          <h3 className='mb-4 font-serif text-2xl leading-tight text-neutral-50 md:text-3xl'>
            {item.title}
          </h3>
          <p className='text-sm leading-relaxed text-neutral-300'>
            {item.desc}
          </p>
        </div>
        <button
          type='button'
          onClick={onClose}
          aria-label='Close'
          className='absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100/10 text-neutral-100 transition-colors duration-200 hover:bg-neutral-100/25'
        >
          <span aria-hidden='true' className='text-base leading-none'>
            ✕
          </span>
        </button>
      </div>
    </div>,
    document.body
  );
}

export function MintV2Works({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const { scroller, requestRefresh } = useLandingMotion();
  const cards = content.cards ?? [];
  const [active, setActive] = React.useState<LightItem | null>(null);
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const removers: Array<() => void> = [];
    const ctx = gsap.context(() => {
      const heading = root.querySelector<HTMLElement>('.works-heading');
      if (heading) {
        const split = new SplitType(heading, { types: 'chars' });
        gsap.fromTo(
          split.chars,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.6,
            ease: 'power3.out',
            stagger: 0.06,
            scrollTrigger: {
              trigger: heading,
              scroller,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }

      root.querySelectorAll<HTMLElement>('.work-card').forEach((card, idx) => {
        const cta = card.querySelector<HTMLElement>('.card-cta');
        const thumbs = card.querySelectorAll<HTMLElement>('.card-thumb');
        const backdrop = card.querySelector<HTMLElement>('.thumbs-bg');
        const mobileText = card.querySelector<HTMLElement>('.mobile-text');
        const mobileImg = card.querySelector<HTMLElement>('.mobile-img');

        if (isMobile) {
          [mobileText, mobileImg].forEach((el, k) => {
            if (!el) return;
            gsap.set(el, { xPercent: k === 0 ? -40 : 40, opacity: 0 });
            gsap.to(el, {
              xPercent: 0,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                scroller,
                start: 'top bottom',
                end: 'center 70%',
                scrub: 1,
                invalidateOnRefresh: true,
              },
            });
          });
          return; // mobile: không hover/thumb
        }

        // Desktop: backdrop scrub (2 chiều converge) + hover thumbs + CTA.
        const backdropFrom = idx % 2 === 1 ? -100 : 100;
        if (backdrop) {
          gsap.set(backdrop, { xPercent: backdropFrom, opacity: 0 });
          gsap.to(backdrop, {
            xPercent: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              scroller,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }
        if (cta) gsap.set(cta, { scale: 0, opacity: 0 });
        thumbs.forEach((thumb, i) => {
          gsap.set(thumb, {
            xPercent: i % 2 === 0 ? -120 : 120,
            yPercent: i < 2 ? -120 : 120,
            scale: 0.6,
            opacity: 0,
          });
        });
        const tl = gsap.timeline({ paused: true });
        thumbs.forEach((thumb, i) => {
          tl.to(
            thumb,
            {
              xPercent: 0,
              yPercent: 0,
              scale: 1,
              opacity: 1,
              duration: 0.85,
              ease: 'power3.out',
            },
            0.15 + i * 0.05
          );
        });
        if (cta)
          tl.to(
            cta,
            { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2)' },
            0.5
          );
        const play = () => tl.play();
        const reverse = () => tl.reverse();
        card.addEventListener('mouseenter', play);
        card.addEventListener('mouseleave', reverse);
        removers.push(() => {
          card.removeEventListener('mouseenter', play);
          card.removeEventListener('mouseleave', reverse);
        });
      });
    }, root);

    requestRefresh();
    return () => {
      removers.forEach(fn => fn());
      ctx.revert();
    };
  }, [scroller, isMobile, requestRefresh]);

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='works @container relative w-full overflow-hidden bg-white py-24 text-neutral-900 @2xl:py-40'
    >
      <div aria-hidden='true' className='absolute inset-0 z-0'>
        <div
          className='absolute inset-0 opacity-50'
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 20% 30%, rgba(199,145,25,0.06) 0%, transparent 55%), radial-gradient(ellipse at 80% 75%, rgba(199,145,25,0.08) 0%, transparent 60%)',
          }}
        />
      </div>

      <div className='relative z-10 mx-auto mb-16 max-w-[1400px] px-6 @2xl:mb-24 @2xl:px-16'>
        <span
          data-element-key='eyebrow'
          style={styleOf('eyebrow')}
          className={selectableClass(
            activeKey === 'eyebrow',
            'mb-4 block text-[11px] tracking-[0.32em] text-neutral-600 uppercase'
          )}
        >
          {content.eyebrow}
        </span>
        <h2
          data-element-key='title'
          style={{ fontSize: 'clamp(56px, 9cqi, 128px)', ...styleOf('title') }}
          className={selectableClass(
            activeKey === 'title',
            'works-heading overflow-hidden pb-2 font-serif leading-[1.15] font-light tracking-tight text-neutral-900'
          )}
        >
          {content.title}
        </h2>
      </div>

      <div
        data-element-key='cards'
        className={selectableClass(
          activeKey === 'cards',
          'relative z-10 mx-auto max-w-[1400px] space-y-12 px-6 @2xl:space-y-[120px] @2xl:px-16'
        )}
      >
        {cards.map((w, idx) => {
          const mirrored = idx % 2 === 1;
          return (
            <article
              key={w.key}
              className={`work-card group relative grid cursor-pointer grid-cols-1 overflow-hidden rounded-sm @2xl:min-h-[400px] ${
                mirrored
                  ? '@2xl:grid-cols-[1fr_1.85fr]'
                  : '@2xl:grid-cols-[1.85fr_1fr]'
              }`}
            >
              {/* TEXT column */}
              <div
                className={`relative flex items-center px-6 py-8 @2xl:p-[50px] ${mirrored ? '@2xl:order-2' : ''}`}
              >
                <div
                  aria-hidden='true'
                  className={`card-bg absolute inset-0 hidden @2xl:block ${w.bgClass}`}
                />
                <div
                  className={`mobile-text relative z-10 will-change-transform ${mirrored ? '@2xl:text-right' : ''}`}
                >
                  <div
                    className={`mb-4 flex items-center gap-3 ${mirrored ? '@2xl:justify-end' : ''}`}
                  >
                    <span className='inline-block bg-neutral-800 px-2 py-1 text-[10px] tracking-[0.18em] text-neutral-300 uppercase'>
                      {w.jpLabel}
                    </span>
                    <span className='inline-block bg-neutral-800 px-3 py-1 text-[10px] tracking-[0.18em] text-neutral-300 uppercase'>
                      {w.category}
                    </span>
                  </div>
                  <h3
                    className='pb-1 font-serif leading-[1.05] font-extrabold tracking-tight text-neutral-900'
                    style={{ fontSize: 'clamp(36px, 6cqi, 84px)' }}
                  >
                    {w.title}
                  </h3>
                </div>
              </div>

              {/* IMAGE column */}
              <div
                className={`relative overflow-hidden ${mirrored ? '@2xl:order-1' : ''}`}
              >
                <button
                  type='button'
                  aria-label={`View ${thumbMeta(w.hero).title}`}
                  onClick={e => {
                    e.stopPropagation();
                    setActive({ src: w.hero, ...thumbMeta(w.hero) });
                  }}
                  className='mobile-img block aspect-square w-full cursor-pointer overflow-hidden will-change-transform @2xl:hidden'
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={w.hero}
                    alt={w.title}
                    loading='lazy'
                    decoding='async'
                    className='h-full w-full object-cover'
                  />
                </button>

                <div
                  aria-hidden='true'
                  className='thumbs-bg absolute inset-0 hidden @2xl:block'
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={w.backdrop}
                    alt=''
                    className='absolute inset-0 h-full w-full object-contain'
                  />
                  <div
                    className='absolute inset-0'
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(20,20,20,0.55) 0%, rgba(20,20,20,0.25) 50%, rgba(20,20,20,0.65) 100%)',
                    }}
                  />
                </div>

                <div className='absolute inset-0 z-20 hidden grid-cols-2 grid-rows-2 gap-3 p-[50px] @2xl:grid @2xl:gap-5'>
                  {w.thumbs.map((src, i) => {
                    const meta = thumbMeta(src);
                    return (
                      <button
                        key={i}
                        type='button'
                        aria-label={`View ${meta.title}`}
                        onClick={e => {
                          e.stopPropagation();
                          setActive({ src, ...meta });
                        }}
                        className='card-thumb group/thumb relative origin-center cursor-pointer overflow-hidden shadow-lg will-change-transform'
                        style={{ opacity: 0 }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt=''
                          loading='lazy'
                          decoding='async'
                          className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-105'
                        />
                        <span className='pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-900/0 text-[10px] tracking-[0.18em] text-neutral-100/0 uppercase transition-all duration-300 group-hover/thumb:bg-neutral-900/40 group-hover/thumb:text-neutral-100'>
                          View
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Lightbox item={active} onClose={() => setActive(null)} />
    </section>
  );
}
