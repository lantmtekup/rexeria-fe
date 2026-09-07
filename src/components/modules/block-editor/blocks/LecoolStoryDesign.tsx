'use client';

/**
 * Panel 1 (Design) của block `lecool_story` — SUB-COMPONENT, không đăng ký
 * BlockType. Port từ apps/ecommerce-landing DesignPanel.tsx.
 *
 * Desktop: khối dính đỉnh, strip ảnh chạy NGANG theo scroll dọc; chiều cao
 * root = chiều cao khối dính + quãng chạy ngang, nên trang tự có đủ room.
 *
 * Khác apps:
 * - `gsap.matchMedia('(min-width:1024px)')` → `isDesktop` đo theo container.
 * - ScrollTrigger nhận `scroller` của LandingMotion (editor cuộn trong khung,
 *   không phải window).
 * - Canvas editor: bỏ hẳn sticky + scrub, xếp 4 khối wrap để bấm chọn được cả
 *   những khối vốn nằm ngoài mép phải.
 */
import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { composeStyle, selectableClass } from './applyStyle';
import {
  resolveDesignCards,
  resolveDesignParagraphs,
  type LecoolStoryPanelProps,
} from './lecoolStoryData';
import {
  LECOOL_BODY_FONT,
  LECOOL_DISPLAY_FONT,
  LECOOL_GOLD,
  LECOOL_HEADER_H,
  LECOOL_PAPER,
  LECOOL_STAGE_H,
} from './lecoolTheme';

const CARD_RATIO = '354 / 460';
const BANNER_RATIO = '706 / 460';
/** `55svh` của apps → cqi: 1440px ⇒ 460 (chạm trần), 896px ⇒ 320 (chạm sàn). */
const TRACK_H = 'clamp(320px, 34cqi, 460px)';

const HEADING_STYLE: React.CSSProperties = {
  margin: 0,
  fontFamily: LECOOL_DISPLAY_FONT,
  fontSize: 'clamp(26px, 2.6cqi, 37px)',
  fontWeight: 400,
  lineHeight: 1.2,
  color: '#000000',
};

const PARAGRAPH_STYLE: React.CSSProperties = {
  margin: 0,
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 'clamp(13px, 1.15cqi, 16px)',
  fontWeight: 500,
  lineHeight: '26px',
  color: '#000000',
};

const CAPTION_STYLE: React.CSSProperties = {
  position: 'absolute',
  bottom: '2.6%',
  left: '5.6%',
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 'clamp(13px, 1.1cqi, 16px)',
  fontWeight: 500,
  lineHeight: '26px',
  color: '#FFFFFF',
};

const BANNER_HEADING_STYLE: React.CSSProperties = {
  margin: 0,
  fontFamily: LECOOL_DISPLAY_FONT,
  fontSize: 'clamp(22px, 2.65cqi, 38px)',
  fontWeight: 400,
  lineHeight: 1.2,
  color: '#FFFFFF',
};

const BANNER_SUB_STYLE: React.CSSProperties = {
  margin: 0,
  marginTop: 'clamp(4px, 0.6cqi, 8px)',
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 'clamp(12px, 1.15cqi, 16px)',
  fontWeight: 500,
  lineHeight: '26px',
  color: '#FFFFFF',
};

export function LecoolStoryDesign({
  content,
  styleOf,
  activeKey,
  isCanvas,
  isDesktop,
}: LecoolStoryPanelProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const stickyRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);

  const { scroller, requestRefresh } = useLandingMotion();

  const cards = React.useMemo(() => resolveDesignCards(content), [content]);
  const paragraphs = React.useMemo(
    () => resolveDesignParagraphs(content),
    [content]
  );

  const scrub = !isCanvas && isDesktop;

  React.useEffect(() => {
    const root = rootRef.current;
    const sticky = stickyRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!root || !sticky || !viewport || !track) return;
    if (!scrub) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /** Quãng còn thừa của track so với khung nhìn — cũng là quãng scroll. */
    const distance = () => {
      const style = getComputedStyle(viewport);
      const padX =
        parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      return Math.max(0, track.offsetWidth + padX - viewport.clientWidth);
    };

    const sizeRoot = () => {
      root.style.height = `${sticky.offsetHeight + distance()}px`;
    };
    sizeRoot();
    ScrollTrigger.addEventListener('refreshInit', sizeRoot);

    const ctx = gsap.context(() => {
      gsap.set(viewport, { overflowX: 'hidden' });
      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          scroller,
          start: `top top+=${LECOOL_HEADER_H}`,
          end: () => `+=${distance()}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
    }, root);
    requestRefresh();

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', sizeRoot);
      ctx.revert();
      root.style.height = '';
    };
  }, [scrub, scroller, requestRefresh, cards.length, paragraphs.length]);

  const renderCard = (index: number) => {
    const card = cards[index];
    if (!card) return null;
    const imgKey = `designCards[${index}].imageUrl`;
    const capKey = `designCards[${index}].caption`;
    return (
      <figure
        key={imgKey}
        className='relative m-0 h-full w-auto shrink-0 snap-start overflow-hidden'
        style={{ aspectRatio: CARD_RATIO }}
      >
        <img
          src={card.imageUrl ?? ''}
          alt={card.caption ?? ''}
          data-element-key={imgKey}
          className={selectableClass(
            activeKey === imgKey,
            'h-full w-full object-cover'
          )}
          style={styleOf(imgKey)}
        />
        <figcaption
          data-element-key={capKey}
          className={selectableClass(activeKey === capKey)}
          style={composeStyle(CAPTION_STYLE, styleOf(capKey))}
        >
          {card.caption}
        </figcaption>
      </figure>
    );
  };

  const textBlock = (
    <div
      key='design-text'
      className='flex h-full shrink-0 snap-start flex-col'
      style={{ width: 'clamp(260px, 26cqi, 354px)' }}
    >
      <h2 style={HEADING_STYLE}>
        <span
          data-element-key='designHeadingAccent'
          className={selectableClass(activeKey === 'designHeadingAccent')}
          style={composeStyle(
            { color: LECOOL_GOLD },
            styleOf('designHeadingAccent')
          )}
        >
          {content.designHeadingAccent}
        </span>
        <span
          data-element-key='designHeadingRest'
          className={selectableClass(activeKey === 'designHeadingRest')}
          style={styleOf('designHeadingRest')}
        >
          {content.designHeadingRest}
        </span>
      </h2>

      <div
        className='flex flex-col'
        style={{
          marginTop: 'clamp(24px, 4.5cqi, 64px)',
          maxWidth: 346,
          gap: 26,
        }}
      >
        {paragraphs.map((paragraph, i) => {
          const key = `designParagraphs[${i}]`;
          return (
            <p
              key={key}
              data-element-key={key}
              className={selectableClass(activeKey === key)}
              style={composeStyle(PARAGRAPH_STYLE, styleOf(key))}
            >
              {paragraph}
            </p>
          );
        })}
      </div>
    </div>
  );

  const banner = (
    <div
      key='design-banner'
      className='relative h-full w-auto shrink-0 snap-start'
      style={{ aspectRatio: BANNER_RATIO, backgroundColor: LECOOL_GOLD }}
    >
      <div className='absolute top-[7%] right-[4.5%] left-[4.5%]'>
        <h3
          data-element-key='bannerHeading'
          className={selectableClass(activeKey === 'bannerHeading')}
          style={composeStyle(BANNER_HEADING_STYLE, styleOf('bannerHeading'))}
        >
          {content.bannerHeading}
        </h3>
        <p
          data-element-key='bannerSub'
          className={selectableClass(activeKey === 'bannerSub')}
          style={composeStyle(BANNER_SUB_STYLE, styleOf('bannerSub'))}
        >
          {content.bannerSub}
        </p>
      </div>
      <div className='absolute top-[32.2%] right-[2.3%] bottom-[3.5%] left-[2.3%]'>
        <img
          src={content.bannerImageUrl ?? ''}
          alt=''
          aria-hidden
          data-element-key='bannerImageUrl'
          className={selectableClass(
            activeKey === 'bannerImageUrl',
            'h-full w-full object-cover'
          )}
          style={styleOf('bannerImageUrl')}
        />
      </div>
    </div>
  );

  // Thẻ đầu → khối chữ → các thẻ còn lại → banner (thứ tự của apps, mở rộng
  // được khi author thêm thẻ thứ 3 trở đi).
  const items = [
    renderCard(0),
    textBlock,
    ...cards.slice(1).map((_, i) => renderCard(i + 1)),
    banner,
  ];

  // ── Canvas: wrap thành lưới, cao tự nhiên, không sticky/scrub ──
  if (isCanvas) {
    return (
      <div
        ref={rootRef}
        className='w-full'
        style={{ backgroundColor: LECOOL_PAPER }}
      >
        <div
          className='flex flex-wrap items-start gap-6 py-10'
          style={{
            paddingInline: 'var(--story-gutter)',
            height: 'auto',
          }}
        >
          {items.map(item =>
            item ? (
              <div key={item.key} style={{ height: 320 }}>
                {item}
              </div>
            ) : null
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className='w-full'
      style={{ backgroundColor: LECOOL_PAPER }}
    >
      <div
        ref={stickyRef}
        className={cn('flex w-full items-center', isDesktop ? '' : 'py-10')}
        style={
          isDesktop
            ? {
                position: 'sticky',
                top: LECOOL_HEADER_H,
                height: LECOOL_STAGE_H,
              }
            : undefined
        }
      >
        <div
          ref={viewportRef}
          className={cn(
            'lecool-no-scrollbar w-full overflow-x-auto',
            isDesktop ? '' : 'snap-x snap-mandatory'
          )}
          style={{
            paddingInline: 'var(--story-gutter)',
            scrollPaddingLeft: 'var(--story-gutter)',
          }}
        >
          <div
            ref={trackRef}
            className='flex w-max gap-6'
            style={{ height: TRACK_H }}
          >
            {items}
          </div>
        </div>
      </div>
    </div>
  );
}
