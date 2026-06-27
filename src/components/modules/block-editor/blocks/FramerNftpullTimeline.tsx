'use client';

import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import { useContainerMobile } from './useContainerMobile';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerNftpullTimelineContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { cn } from '@/lib/cn';

const CARD_AT_3XL_MIN_WIDTH = 768;

interface Props {
  content: FramerNftpullTimelineContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: '"Public Sans", system-ui, sans-serif',
  fontWeight: 700,
  fontSize: 'clamp(38px, 5.6cqi, 56px)',
  letterSpacing: '-0.027em',
  lineHeight: 1.28,
  margin: '0 0 clamp(14px, 1.6cqi, 20px)',
  color: '#ffffff',
  textAlign: 'center',
};

const INTRO_STYLE: React.CSSProperties = {
  fontFamily: '"Public Sans", system-ui, sans-serif',
  fontWeight: 400,
  fontSize: 'clamp(18px, 1.8cqi, 20px)',
  lineHeight: 1.7,
  color: '#cdcdcd',
  margin: '0 auto',
  maxWidth: '60ch',
  textAlign: 'center',
};

const CARD_BASE_STYLE: React.CSSProperties = {
  background:
    'linear-gradient(112deg, rgb(36, 37, 39) 0%, rgb(57, 58, 62) 100%)',
  borderRadius: 24,

  padding: 'clamp(20px, 3cqi, 34px)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'clamp(10px, 1.2cqi, 14px)',
  maxWidth: 520,
  minHeight: 200,
  position: 'relative',
  width: '100%',
};

const CARD_STYLE_MASK: React.CSSProperties = {
  WebkitMaskImage: `url('https://framerusercontent.com/images/8H79lPpnpMbUcZcj9K2ZdjHk.png')`,
  maskImage: `url('https://framerusercontent.com/images/8H79lPpnpMbUcZcj9K2ZdjHk.png')`,
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
};

const CARD_TITLE_STYLE: React.CSSProperties = {
  fontFamily: '"Public Sans", system-ui, sans-serif',
  fontWeight: 700,
  fontSize: 'clamp(28px, 4cqi, 36px)',
  letterSpacing: '-0.01em',
  lineHeight: 1.2,
  color: '#ffffff',
  margin: 0,
};

const CARD_DESC_STYLE: React.CSSProperties = {
  fontFamily: '"Public Sans", system-ui, sans-serif',
  fontWeight: 400,
  fontSize: 'clamp(16px, 2cqi, 18px)',
  lineHeight: 1.7,
  color: '#cdcdcd',
  margin: 0,
};

const BADGE_BASE_STYLE: React.CSSProperties = {
  WebkitMaskImage: `url('https://framerusercontent.com/images/s1u845am8UHe6Aq61wr2tAgG2sM.png')`,
  maskImage: `url('https://framerusercontent.com/images/s1u845am8UHe6Aq61wr2tAgG2sM.png')`,
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',

  width: '72px',
  height: '72px',
  background: 'linear-gradient(rgb(36, 37, 39) 0%, rgb(57, 58, 62) 100%)',
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '"Public Sans", system-ui, sans-serif',
  fontWeight: 600,
  fontSize: 'clamp(34px, 2.5cqi, 36px)',
  color: '#ffffff',
  flexShrink: 0,
};

export type TimelineSide = 'left' | 'right';

export interface TimelineSectionProps {
  article: Pick<
    FramerNftpullTimelineContent['items'][number],
    'title' | 'description'
  >;
  number: React.ReactNode;
  side?: TimelineSide;
  /** Tiền tố key của row (vd `items.0`) — element con scoped để selectable/style riêng từng item. */
  keyPrefix: string;
  styles?: ElementStylesMap;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  isAt3xl?: boolean;
  className?: string;
}

export function TimelineSection({
  article,
  number,
  side = 'right',
  keyPrefix,
  styles,
  order,
  positions,
  activeKey,
  isAt3xl = false,
  className,
}: TimelineSectionProps) {
  const isRight = side === 'right';
  // Element con scoped theo row: `items.${idx}.<field>` để mỗi item
  // selectable/style/drag riêng (khớp data-element-key BlockPreview đọc thô).
  const fullKey = (key: string) => `${keyPrefix}.${key}`;
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, fullKey(key)),
      orderStyle(order, fullKey(key)),
      positionStyle(positions, fullKey(key))
    );

  return (
    <div
      data-side={isRight ? 'right' : 'left'}
      className={cn(
        'nftpull-row relative flex w-full items-start gap-6',
        isRight ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      <div
        className={cn(
          // Mobile: card trên, badge dưới (cùng cột, có gap-6 để tách hàng
          // rõ ràng — tránh badge đè lên article như trước).
          // Desktop (≥3xl): hàng ngang, justify theo side.
          'flex w-full flex-1 flex-col-reverse items-start gap-6 @3xl:flex-row',
          isRight
            ? 'pl-0 @2xl:justify-end @2xl:pl-0 @3xl:pl-12'
            : 'pr-0 @2xl:justify-start @2xl:pr-0 @3xl:pr-12'
        )}
      >
        <article
          data-element-key={fullKey('card')}
          style={composeStyle(
            CARD_BASE_STYLE,
            styleOf('card'),
            isAt3xl ? CARD_STYLE_MASK : undefined
          )}
          className={selectableClass(
            activeKey === fullKey('card'),
            'nftpull-card mt-12 @3xl:mt-0'
          )}
        >
          <h3
            data-element-key={fullKey('title')}
            style={composeStyle(CARD_TITLE_STYLE, styleOf('title'))}
            className={selectableClass(activeKey === fullKey('title'))}
          >
            {article.title}
          </h3>
          <p
            data-element-key={fullKey('description')}
            style={composeStyle(CARD_DESC_STYLE, styleOf('description'))}
            className={selectableClass(activeKey === fullKey('description'))}
          >
            {article.description}
          </p>
        </article>
        <div
          data-element-key={fullKey('number')}
          className={cn(
            'nftpull-badge z-2',
            isRight ? '@3xl:order-first' : '@3xl:order-last'
          )}
          style={composeStyle(BADGE_BASE_STYLE, styleOf('number'))}
        >
          {number}
        </div>
      </div>
    </div>
  );
}

export function FramerNftpullTimeline({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const items = Array.isArray(content.items) ? content.items : [];

  const isMobileContainer = useContainerMobile(rootRef, CARD_AT_3XL_MIN_WIDTH);
  const isAt3xl = !isMobileContainer;

  useBlockMotion(rootRef, ({ scroller, isMobile }) => {
    const root = rootRef.current;
    if (!root) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    // 1) Header entrance — fade-up.
    const header = root.querySelector<HTMLElement>('.nftpull-header');
    if (header) {
      gsap.fromTo(
        header,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: header,
            scroller,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    }

    const fill = root.querySelector<HTMLElement>('.nftpull-spine-fill');
    const firstRow = root.querySelector<HTMLElement>('.nftpull-row');
    const lastRow = root.querySelector<HTMLElement>('.nftpull-row:last-child');
    if (fill && firstRow) {
      gsap.fromTo(
        fill,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: firstRow,
            scroller,
            start: 'top 70%',
            endTrigger: lastRow ?? firstRow,
            end: lastRow ? 'bottom center' : 'bottom 70%',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        }
      );
    }

    const cards = root.querySelectorAll<HTMLElement>('.nftpull-card');
    if (cards.length && !isMobile) {
      cards.forEach(card => {
        gsap.set(card, {
          transformPerspective: 1500,
          transformOrigin: 'center center',
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            scroller,
            start: 'top 100%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        });
        tl.fromTo(
          card,
          { opacity: 0.1, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
          },
          0
        );

        gsap.fromTo(
          card,
          { rotateX: -85 },
          {
            rotateX: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              scroller,
              start: 'top 100%',
              end: 'top 80%',
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    } else if (cards.length) {
      // Mobile: giữ animation cũ (fade-up đơn giản) cho nhẹ.
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: cards[0],
            scroller,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    }

    const badges = root.querySelectorAll<HTMLElement>('.nftpull-badge');
    if (badges.length && !isMobile) {
      // Desktop: badge — fade-in (opacity 0.3→1) + y theo thời gian 1s;
      // rotateX đi theo SCRUB (tốc độ cuộn), không theo thời gian.
      badges.forEach(badge => {
        gsap.set(badge, {
          transformPerspective: 1000,
          transformOrigin: 'center center',
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: badge,
            scroller,
            start: 'top 100%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        });
        tl.fromTo(
          badge,
          { opacity: 0.3, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
          },
          0
        );

        gsap.fromTo(
          badge,
          { rotateX: -85 },
          {
            rotateX: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: badge,
              scroller,
              start: 'top 100%',
              end: 'top 60%',
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    } else if (badges.length) {
      // Mobile: giữ animation cũ cho nhẹ.
      gsap.fromTo(
        badges,
        { opacity: 0, scale: 0.7 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'back.out(1.4)',
          stagger: 0.12,
          delay: 0.1,
          scrollTrigger: {
            trigger: badges[0],
            scroller,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    }
  });

  const rootStyleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  return (
    <section
      ref={rootRef}
      style={{
        position: 'relative',
        color: '#ffffff',
        fontFamily: '"Public Sans", system-ui, sans-serif',
        background: '#0e0e0e',
        ...blockBackgroundStyle(background),
      }}
      className='nftpull-timeline @container relative w-full overflow-hidden'
    >
      <div
        style={{
          padding:
            'clamp(50px, 8cqi, 120px) clamp(20px, 3cqi, 60px) clamp(60px, 10cqi, 160px)',
        }}
      >
        {/* Header */}
        <div
          className='nftpull-header'
          style={{
            maxWidth: 815,
            margin: '0 auto clamp(40px, 7cqi, 100px)',
            textAlign: 'center',
          }}
        >
          <h2
            data-element-key='heading'
            style={composeStyle(HEADING_STYLE, rootStyleOf('heading'))}
            className={selectableClass(activeKey === 'heading')}
          >
            {content.heading}
          </h2>
          <p
            data-element-key='intro'
            style={composeStyle(INTRO_STYLE, rootStyleOf('intro'))}
            className={selectableClass(activeKey === 'intro')}
          >
            {content.intro}
          </p>
        </div>

        {/* Timeline stage */}
        <div
          style={{
            position: 'relative',
            maxWidth: 1248,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(40px, 6cqi, 96px)',
          }}
        >
          <div
            aria-hidden
            className='absolute top-0 bottom-0 left-1/2 hidden w-[2px] -translate-x-1/2 @4xl:block'
            style={{
              pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden
            className='nftpull-spine-fill absolute top-0 bottom-0 left-1/2 hidden w-[3px] -translate-x-1/2 @4xl:block'
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)',
              transform: 'scaleY(0)',
              transformOrigin: 'top center',
              pointerEvents: 'none',
              willChange: 'transform',
            }}
          />

          <div
            data-element-key='items'
            className='flex flex-col gap-0 @3xl:gap-12'
          >
            {items.map((item, idx) => (
              <TimelineSection
                key={idx}
                article={{
                  title: item.title,
                  description: item.description,
                }}
                number={item.number}
                side={idx % 2 === 0 ? 'left' : 'right'}
                keyPrefix={`items.${idx}`}
                styles={styles}
                order={order}
                positions={positions}
                activeKey={activeKey}
                isAt3xl={isAt3xl}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
