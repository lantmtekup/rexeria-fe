'use client';

/**
 * Data-block "MintV2 · Works" (port từ apps/mintcoin-v2 WorksSection).
 *
 * Card hover-morph zigzag: idle = backdrop; hover (desktop) = 4 thumb bay
 * vào 2×2 + backdrop scrub. Mobile = text/img scrub. Click thumb/hero →
 * lightbox (portal → device-frame / body). Heading char-stagger.
 *
 * Canvas editor: flat edit layout (all thumbs visible, no hover/scrub).
 * PreviewMode + /p: production layout + motion.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import SplitType from 'split-type';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintV2WorkCard,
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

type StyleOf = (key: string) => React.CSSProperties | undefined;

const DEFAULT_BG = '#efe9dc';

/** Parse `bg-[#hex]` / `#hex` / bare hex from legacy bgClass or bgColor. */
export function normalizeBgColor(card: MintV2WorkCard): string {
  const raw = (card.bgColor || card.bgClass || '').trim();
  if (!raw) return DEFAULT_BG;
  const fromClass = raw.match(/bg-\[#([0-9a-fA-F]{3,8})\]/);
  if (fromClass) return `#${fromClass[1]}`;
  if (raw.startsWith('#')) return raw;
  if (/^[0-9a-fA-F]{3,8}$/.test(raw)) return `#${raw}`;
  return DEFAULT_BG;
}

export function normalizeWorkCard(card: MintV2WorkCard): MintV2WorkCard {
  return {
    ...card,
    thumbs: Array.isArray(card.thumbs) ? card.thumbs : [],
    bgColor: normalizeBgColor(card),
  };
}

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
  portalHost,
}: {
  item: LightItem | null;
  onClose: () => void;
  portalHost: HTMLElement | null;
}) {
  React.useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item || !portalHost) return null;

  const inFrame = isDeviceFrameHost(portalHost);
  const posClass = inFrame ? 'absolute' : 'fixed';

  return createPortal(
    <div
      role='dialog'
      aria-modal='true'
      aria-label={item.title}
      onClick={onClose}
      className={cn(
        posClass,
        'inset-0 z-100 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm @3xl:p-8'
      )}
    >
      <div
        onClick={e => e.stopPropagation()}
        className='relative grid w-full max-w-2xl grid-cols-1 overflow-hidden rounded-xl bg-[#0f0f0f] text-neutral-100 shadow-2xl @3xl:grid-cols-2'
      >
        <div className='relative aspect-square bg-neutral-900'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={item.title}
            className='absolute inset-0 h-full w-full object-cover'
          />
        </div>
        <div className='flex flex-col justify-center p-7 @3xl:p-9'>
          <span
            className='mb-3 uppercase'
            style={{
              fontSize: 11,
              letterSpacing: '0.28em',
              color: '#c79119',
            }}
          >
            The Jack Pine · 1 kilo gold
          </span>
          <h3
            className='mb-4 leading-tight'
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(22px, 3.5cqi, 30px)',
              color: '#fafafa',
            }}
          >
            {item.title}
          </h3>
          <p
            className='leading-relaxed'
            style={{ fontSize: 14, color: '#d4d4d4' }}
          >
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
    portalHost
  );
}

function SectionHeading({
  content,
  activeKey,
  styleOf,
}: {
  content: MintV2WorksContent;
  activeKey?: string | null;
  styleOf: StyleOf;
}) {
  return (
    <div className='relative z-10 mx-auto mb-16 max-w-[1400px] px-6 @2xl:mb-24 @2xl:px-16'>
      <span
        data-element-key='eyebrow'
        style={composeStyle(
          {
            display: 'block',
            marginBottom: 16,
            fontSize: 11,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#525252',
          },
          styleOf('eyebrow')
        )}
        className={selectableClass(activeKey === 'eyebrow', '')}
      >
        {content.eyebrow}
      </span>
      <h2
        data-element-key='title'
        style={composeStyle(
          {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(56px, 9cqi, 128px)',
            fontWeight: 300,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#171717',
            overflow: 'hidden',
            paddingBottom: 8,
          },
          styleOf('title')
        )}
        className={selectableClass(activeKey === 'title', 'works-heading')}
      >
        {content.title}
      </h2>
    </div>
  );
}

function CanvasCard({
  card,
  index,
  activeKey,
  styleOf,
  onOpen,
}: {
  card: MintV2WorkCard;
  index: number;
  activeKey?: string | null;
  styleOf: StyleOf;
  onOpen: (item: LightItem) => void;
}) {
  const jpKey = `cards[${index}].jpLabel`;
  const catKey = `cards[${index}].category`;
  const titleKey = `cards[${index}].title`;
  const heroKey = `cards[${index}].hero`;
  const backdropKey = `cards[${index}].backdrop`;
  const bgKey = `cards[${index}].bgColor`;
  const thumbs = card.thumbs.slice(0, 4);

  return (
    <article
      className='overflow-hidden rounded-sm border border-neutral-200'
      style={{ backgroundColor: card.bgColor }}
    >
      <div
        data-element-key={bgKey}
        className={selectableClass(
          activeKey === bgKey,
          'flex flex-wrap items-center gap-3 px-4 py-3'
        )}
        style={composeStyle({ backgroundColor: card.bgColor }, styleOf(bgKey))}
      >
        <span
          aria-hidden='true'
          className='h-5 w-5 shrink-0 rounded-sm border border-neutral-300'
          style={{ backgroundColor: card.bgColor }}
        />
        <span
          style={{
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#737373',
          }}
        >
          Card {card.number || index + 1} · nền
        </span>
      </div>

      <div className='grid grid-cols-1 gap-4 p-4 @2xl:grid-cols-2'>
        <div className='space-y-3'>
          <div className='flex flex-wrap gap-2'>
            <span
              data-element-key={jpKey}
              style={composeStyle(
                {
                  display: 'inline-block',
                  backgroundColor: '#262626',
                  color: '#d4d4d4',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  padding: '4px 8px',
                },
                styleOf(jpKey)
              )}
              className={selectableClass(activeKey === jpKey, '')}
            >
              {card.jpLabel}
            </span>
            <span
              data-element-key={catKey}
              style={composeStyle(
                {
                  display: 'inline-block',
                  backgroundColor: '#262626',
                  color: '#d4d4d4',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  padding: '4px 12px',
                },
                styleOf(catKey)
              )}
              className={selectableClass(activeKey === catKey, '')}
            >
              {card.category}
            </span>
          </div>
          <h3
            data-element-key={titleKey}
            style={composeStyle(
              {
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 'clamp(28px, 5cqi, 48px)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: '#171717',
              },
              styleOf(titleKey)
            )}
            className={selectableClass(activeKey === titleKey, '')}
          >
            {card.title}
          </h3>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <button
            type='button'
            data-element-key={heroKey}
            aria-label={`Hero · ${card.title}`}
            onClick={() => onOpen({ src: card.hero, ...thumbMeta(card.hero) })}
            style={composeStyle({}, styleOf(heroKey))}
            className={selectableClass(
              activeKey === heroKey,
              'relative aspect-square overflow-hidden bg-neutral-200'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.hero}
              alt=''
              className='absolute inset-0 h-full w-full object-cover'
            />
            <span className='absolute bottom-1 left-1 bg-black/50 px-1.5 py-0.5 text-[9px] tracking-wider text-white uppercase'>
              Hero
            </span>
          </button>
          <button
            type='button'
            data-element-key={backdropKey}
            aria-label={`Backdrop · ${card.title}`}
            onClick={() =>
              onOpen({ src: card.backdrop, ...thumbMeta(card.backdrop) })
            }
            style={composeStyle({}, styleOf(backdropKey))}
            className={selectableClass(
              activeKey === backdropKey,
              'relative aspect-square overflow-hidden bg-neutral-200'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.backdrop}
              alt=''
              className='absolute inset-0 h-full w-full object-contain'
            />
            <span className='absolute bottom-1 left-1 bg-black/50 px-1.5 py-0.5 text-[9px] tracking-wider text-white uppercase'>
              Backdrop
            </span>
          </button>
          {thumbs.map((src, ti) => {
            const thumbKey = `cards[${index}].thumbs[${ti}]`;
            const meta = thumbMeta(src);
            return (
              <button
                key={thumbKey}
                type='button'
                data-element-key={thumbKey}
                aria-label={`Thumb ${ti + 1} · ${meta.title}`}
                onClick={() => onOpen({ src, ...meta })}
                style={composeStyle({}, styleOf(thumbKey))}
                className={selectableClass(
                  activeKey === thumbKey,
                  'relative aspect-square overflow-hidden bg-neutral-200'
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=''
                  className='absolute inset-0 h-full w-full object-cover'
                />
                <span className='absolute bottom-1 left-1 bg-black/50 px-1.5 py-0.5 text-[9px] tracking-wider text-white uppercase'>
                  T{ti + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function LiveCard({
  card,
  index,
  mirrored,
  activeKey,
  styleOf,
  onOpen,
}: {
  card: MintV2WorkCard;
  index: number;
  mirrored: boolean;
  activeKey?: string | null;
  styleOf: StyleOf;
  onOpen: (item: LightItem) => void;
}) {
  const jpKey = `cards[${index}].jpLabel`;
  const catKey = `cards[${index}].category`;
  const titleKey = `cards[${index}].title`;
  const heroKey = `cards[${index}].hero`;
  const backdropKey = `cards[${index}].backdrop`;
  const bgKey = `cards[${index}].bgColor`;
  const thumbs = card.thumbs.slice(0, 4);

  return (
    <article
      className={cn(
        'work-card group relative grid cursor-pointer grid-cols-1 overflow-hidden rounded-sm @2xl:min-h-[400px]',
        mirrored ? '@2xl:grid-cols-[1fr_1.85fr]' : '@2xl:grid-cols-[1.85fr_1fr]'
      )}
    >
      <div
        className={cn(
          'relative flex items-center px-6 py-8 @2xl:p-[50px]',
          mirrored && '@2xl:order-2'
        )}
      >
        <div
          aria-hidden='true'
          data-element-key={bgKey}
          className={selectableClass(
            activeKey === bgKey,
            'card-bg absolute inset-0 hidden @2xl:block'
          )}
          style={composeStyle(
            { backgroundColor: card.bgColor },
            styleOf(bgKey)
          )}
        />
        <div
          className={cn(
            'mobile-text relative z-10 will-change-transform',
            mirrored && '@2xl:text-right'
          )}
        >
          <div
            className={cn(
              'mb-4 flex items-center gap-3',
              mirrored && '@2xl:justify-end'
            )}
          >
            <span
              data-element-key={jpKey}
              style={composeStyle(
                {
                  display: 'inline-block',
                  backgroundColor: '#262626',
                  color: '#d4d4d4',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  padding: '4px 8px',
                },
                styleOf(jpKey)
              )}
              className={selectableClass(activeKey === jpKey, '')}
            >
              {card.jpLabel}
            </span>
            <span
              data-element-key={catKey}
              style={composeStyle(
                {
                  display: 'inline-block',
                  backgroundColor: '#262626',
                  color: '#d4d4d4',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  padding: '4px 12px',
                },
                styleOf(catKey)
              )}
              className={selectableClass(activeKey === catKey, '')}
            >
              {card.category}
            </span>
          </div>
          <h3
            data-element-key={titleKey}
            style={composeStyle(
              {
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 'clamp(36px, 6cqi, 84px)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: '#171717',
                paddingBottom: 4,
              },
              styleOf(titleKey)
            )}
            className={selectableClass(activeKey === titleKey, '')}
          >
            {card.title}
          </h3>
        </div>
      </div>

      <div
        className={cn('relative overflow-hidden', mirrored && '@2xl:order-1')}
      >
        <button
          type='button'
          data-element-key={heroKey}
          aria-label={`View ${thumbMeta(card.hero).title}`}
          onClick={e => {
            e.stopPropagation();
            onOpen({ src: card.hero, ...thumbMeta(card.hero) });
          }}
          style={composeStyle({}, styleOf(heroKey))}
          className={selectableClass(
            activeKey === heroKey,
            'mobile-img block aspect-square w-full cursor-pointer overflow-hidden will-change-transform @2xl:hidden'
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.hero}
            alt={card.title}
            loading='lazy'
            decoding='async'
            className='h-full w-full object-cover'
          />
        </button>

        <div
          aria-hidden='true'
          data-element-key={backdropKey}
          className={selectableClass(
            activeKey === backdropKey,
            'thumbs-bg absolute inset-0 hidden @2xl:block'
          )}
          style={composeStyle({}, styleOf(backdropKey))}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.backdrop}
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
          {thumbs.map((src, ti) => {
            const thumbKey = `cards[${index}].thumbs[${ti}]`;
            const meta = thumbMeta(src);
            return (
              <button
                key={thumbKey}
                type='button'
                data-element-key={thumbKey}
                aria-label={`View ${meta.title}`}
                onClick={e => {
                  e.stopPropagation();
                  onOpen({ src, ...meta });
                }}
                style={composeStyle({ opacity: 0 }, styleOf(thumbKey))}
                className={selectableClass(
                  activeKey === thumbKey,
                  'card-thumb group/thumb relative origin-center cursor-pointer overflow-hidden shadow-lg will-change-transform'
                )}
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
  const cards = React.useMemo(
    () => (content.cards ?? []).map(normalizeWorkCard),
    [content.cards]
  );
  const [active, setActive] = React.useState<LightItem | null>(null);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);

  const isCanvas = useIsCanvasEdit(rootRef);

  React.useLayoutEffect(() => {
    setPortalHost(resolveDrawerPortalHost(rootRef.current));
  }, [active, isCanvas]);

  const styleOf: StyleOf = key =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const handleOpen = React.useCallback((item: LightItem) => {
    setActive(item);
  }, []);

  const handleClose = React.useCallback(() => {
    setActive(null);
  }, []);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || isCanvas) return;

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
          return;
        }

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
  }, [scroller, isMobile, requestRefresh, isCanvas, cards]);

  const sectionStyle = blockBackgroundStyle(background);

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        style={sectionStyle}
        className='works @container relative w-full overflow-hidden bg-white py-12 text-neutral-900'
      >
        <SectionHeading
          content={content}
          activeKey={activeKey}
          styleOf={styleOf}
        />
        <div
          data-element-key='cards'
          className={selectableClass(
            activeKey === 'cards',
            'relative z-10 mx-auto max-w-[1400px] space-y-6 px-6 @2xl:px-16'
          )}
          style={styleOf('cards')}
        >
          {cards.map((card, idx) => (
            <CanvasCard
              key={card.key || idx}
              card={card}
              index={idx}
              activeKey={activeKey}
              styleOf={styleOf}
              onOpen={handleOpen}
            />
          ))}
        </div>
        <Lightbox item={active} onClose={handleClose} portalHost={portalHost} />
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      style={sectionStyle}
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

      <SectionHeading
        content={content}
        activeKey={activeKey}
        styleOf={styleOf}
      />

      <div
        data-element-key='cards'
        className={selectableClass(
          activeKey === 'cards',
          'relative z-10 mx-auto max-w-[1400px] space-y-12 px-6 @2xl:space-y-[120px] @2xl:px-16'
        )}
        style={styleOf('cards')}
      >
        {cards.map((card, idx) => (
          <LiveCard
            key={card.key || idx}
            card={card}
            index={idx}
            mirrored={idx % 2 === 1}
            activeKey={activeKey}
            styleOf={styleOf}
            onOpen={handleOpen}
          />
        ))}
      </div>

      <Lightbox item={active} onClose={handleClose} portalHost={portalHost} />
    </section>
  );
}
