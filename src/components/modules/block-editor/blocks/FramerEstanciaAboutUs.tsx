'use client';

/**
 * Framer Estancia About Us — port từ `https://estancia.framer.website/`,
 * block `[data-framer-name="Section - About"]`.
 *
 * Layout:
 * - Section nền tan #E7DECF (`--token-d6e5b1a2`).
 * - Container max-width 1380px, flex column, gap 50 → 30 mobile.
 * - Heading h2 center (Onest 56/44/34, ls -0.06em, lh 1.1) +
 *   CTA pill "About us" (bg #3e362e, text #e7decf, Onest 16/14, 600).
 * - Stats grid 3 cột desktop → 1 cột mobile, gap 100 → 14px.
 *   Mỗi card: ảnh chân dung 3:4 (#e7decf khung) + value h3 (Onest 40/32/26)
 *   + label p (Onest 16/14).
 *
 * Animation (R1, R3): useBlockMotion + gsap.fromTo — fade-up 16px cho
 * heading/CTA/3 cards, stagger 0.08s, start 'top 85%', toggleActions reverse.
 * Initial states trong recon (Section 8): opacity 0 + translateY(10px) trên
 * heading/CTA containers.
 *
 * Parallax desktop (P2): stats grid di chuyển theo trục Y chậm hơn scroll
 * để tạo chiều sâu — toàn bộ card là một khối thống nhất (ảnh + text đi cùng).
 * Ảnh + nội dung bố cục giữ nguyên; chỉ translateY. Stats đặt `position:
 * relative` + `zIndex` cao để có thể trượt đè qua heading khi parallax lên.
 * Skip trên mobile để tránh jank (theo yêu cầu "chỉ áp dụng desktop").
 *
 * Token ground truth: bundle CSS (presets lkppfo/bpqqzl/1c28sym +
 * Framer 3-tier override 56/44/34) + recon extracted.json.
 *
 * Responsive: container-query với cqi (R2).
 * Accessibility: aria-label cho CTA, role=img + aria-label cho ảnh,
 * prefers-reduced-motion honored tự động bởi useBlockMotion.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerEstanciaAboutUsContent,
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

interface Props {
  content: FramerEstanciaAboutUsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const SECTION_BG = '#c09c7b';
const CARD_BG = '#e7decf';
const TEXT_DARK = '#3e362e';
const BUTTON_HOVER = '#332c25';
const FONT_FAMILY = "'Onest', 'Inter', system-ui, sans-serif";

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: FONT_FAMILY,
  fontSize: 'clamp(34px, 4.5cqi, 56px)',
  fontWeight: 400,
  letterSpacing: '-0.06em',
  lineHeight: 1.1,
  color: TEXT_DARK,
  textAlign: 'center',
  margin: 0,
  maxWidth: 'clamp(347px, 62cqi, 850px)',
};

const STAT_VALUE_STYLE: React.CSSProperties = {
  fontFamily: FONT_FAMILY,
  fontSize: 'clamp(26px, 3.4cqi, 40px)',
  fontWeight: 500,
  letterSpacing: '-0.06em',
  lineHeight: 1,
  color: TEXT_DARK,
  margin: 0,
};

const STAT_LABEL_STYLE: React.CSSProperties = {
  fontFamily: FONT_FAMILY,
  fontSize: 'clamp(14px, 1.1cqi, 16px)',
  fontWeight: 500,
  letterSpacing: '-0.03em',
  lineHeight: 1.3,
  color: TEXT_DARK,
  margin: 0,
};

const CTA_BUTTON_STYLE: React.CSSProperties = {
  fontFamily: FONT_FAMILY,
  fontSize: 'clamp(14px, 1.1cqi, 16px)',
  fontWeight: 600,
  letterSpacing: '-0.03em',
  lineHeight: 1.2,
  color: '#e7decf',
  backgroundColor: TEXT_DARK,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'clamp(6px, 0.7cqi, 8px)',
  padding: 'clamp(10px, 1.4cqi, 16px) clamp(20px, 2.8cqi, 32px)',
  position: 'relative',
  overflow: 'hidden',
};

const STAT_CARD_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'clamp(8px, 1cqi, 14px)',
  width: '100%',
  backgroundColor: CARD_BG,
  padding: 'clamp(8px, 1cqi, 14px)',
  borderRadius: 0,
};

const STAT_IMAGE_STYLE: React.CSSProperties = {
  width: '100%',
  aspectRatio: '365 / 482',
  backgroundColor: '#d9cab0',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: 0,
};

const StarIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 14,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 16 16'
    fill='none'
    aria-hidden
    style={{ display: 'inline-block', flexShrink: 0 }}
  >
    <path
      d='M8 0 L9.2 6.8 L16 8 L9.2 9.2 L8 16 L6.8 9.2 L0 8 L6.8 6.8 Z'
      fill={color}
    />
  </svg>
);

export function FramerEstanciaAboutUs({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const statsRef = React.useRef<HTMLDivElement>(null);
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const ctaHref = content.ctaHref || '#';
  const [hovered, setHovered] = React.useState(false);

  useBlockMotion(rootRef, ({ scroller, isMobile }) => {
    const root = rootRef.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>(
      '[data-estancia-reveal]'
    );
    if (!targets.length) return;
    gsap.fromTo(
      targets,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      }
    );

    if (isMobile) return;
    const stats = statsRef.current;
    if (!stats) return;
    gsap.fromTo(
      stats,
      { y: 80 },
      {
        y: -520,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      }
    );
  });

  return (
    <section
      ref={rootRef}
      data-element-key='root'
      aria-label='About Estancia'
      style={composeStyle(
        {
          backgroundColor: SECTION_BG,
          width: '100%',
          padding: 'clamp(70px, 8cqi, 150px) clamp(14px, 2cqi, 30px)',
          display: 'flex',
          justifyContent: 'center',
        },
        blockBackgroundStyle(background),
        styleOf('root')
      )}
      className={'@container ' + (className || '')}
    >
      <div
        data-element-key='container'
        style={composeStyle(
          {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(30px, 3.6cqi, 50px)',
            width: '100%',
          },
          styleOf('container')
        )}
      >
        {/* ── Heading group ── */}
        <div
          data-element-key='heading'
          style={composeStyle(
            {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'clamp(20px, 2.4cqi, 30px)',
              width: '100%',
            },
            styleOf('heading')
          )}
        >
          <h2
            data-estancia-reveal
            data-element-key='headingText'
            style={composeStyle(HEADING_STYLE, styleOf('headingText'))}
            className={selectableClass(activeKey === 'headingText')}
          >
            {content.heading}
          </h2>

          {/* CTA pill "About us" — bundle page.html: framer-Dark */}
          <a
            data-estancia-reveal
            data-element-key='cta'
            href={ctaHref}
            aria-label={content.ctaText}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={composeStyle(CTA_BUTTON_STYLE, styleOf('cta'))}
            className={selectableClass(activeKey === 'cta')}
          >
            <StarIcon size={14} color={'#e7decf'} />
            <span style={{ position: 'relative', zIndex: 1 }}>
              {content.ctaText}
            </span>
            <span
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: BUTTON_HOVER,
                transform: hovered ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                zIndex: 0,
              }}
            />
          </a>
        </div>

        {/* ── Stats grid 3 cột desktop → stack vertical tablet/mobile ── */}
        <div
          ref={statsRef}
          data-element-key='stats'
          style={composeStyle(
            {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              position: 'relative',
              zIndex: 2,
              willChange: 'transform',
            },
            styleOf('stats')
          )}
          className='flex flex-col items-center gap-8 @3xl:flex-row! @3xl:items-start! @3xl:justify-between! @3xl:gap-[20px]! @4xl:gap-[100px]!'
        >
          {[
            {
              key: 'card1',
              imageUrl: content.card1ImageUrl,
              value: content.card1Value,
              label: content.card1Label,
            },
            {
              key: 'card2',
              imageUrl: content.card2ImageUrl,
              value: content.card2Value,
              label: content.card2Label,
              desktopMtClass: '@3xl:!mt-[150px]',
            },
            {
              key: 'card3',
              imageUrl: content.card3ImageUrl,
              value: content.card3Value,
              label: content.card3Label,
            },
          ].map(card => (
            <div
              key={card.key}
              data-estancia-reveal
              data-element-key={card.key}
              style={composeStyle(STAT_CARD_STYLE, styleOf(card.key))}
              className={cn(
                selectableClass(activeKey === card.key),
                'desktop-mt-' + card.key,
                card.desktopMtClass
              )}
            >
              <div
                data-element-key={`${card.key}Image`}
                role='img'
                aria-label={`${card.value} — ${card.label}`}
                style={composeStyle(
                  card.imageUrl
                    ? {
                        backgroundImage: `url("${card.imageUrl.replace(/"/g, '%22')}")`,
                      }
                    : {},
                  STAT_IMAGE_STYLE,
                  styleOf(`${card.key}Image`)
                )}
                className={selectableClass(activeKey === `${card.key}Image`)}
              />
              <h3
                data-element-key={`${card.key}Value`}
                style={composeStyle(
                  STAT_VALUE_STYLE,
                  styleOf(`${card.key}Value`)
                )}
                className={selectableClass(activeKey === `${card.key}Value`)}
              >
                {card.value}
              </h3>
              <p
                data-element-key={`${card.key}Label`}
                style={composeStyle(
                  STAT_LABEL_STYLE,
                  styleOf(`${card.key}Label`)
                )}
                className={selectableClass(activeKey === `${card.key}Label`)}
              >
                {card.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
