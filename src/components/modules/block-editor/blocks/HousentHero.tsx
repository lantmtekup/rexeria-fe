'use client';

/**
 * Housent hero — port 1:1 section `.hero-section.home` của housent.webflow.io
 * (real-estate template). Layout: cột trái (badge + heading lớn + subtitle +
 * search bar, max 645px) trong flow; ảnh toà nhà `.home-hero-image` absolute
 * bám đáy-phải section, bleed ra mép (max 700px). Nền be `#f1e6df`.
 *
 * Số liệu port từ `housent-clone/site/assets/housent.webflow.shared.*.css`
 * (đã resolve token): heading 70px/600/-0.015em/lh1.2, container max 1440 +
 * padding-inline 48px, gap cột 44px, section padding-top 280px, badge Lilex
 * 14px uppercase nền trắng + dot brand #ff810a, button đen #201d1c.
 *
 * Animation GSAP qua `useBlockMotion` (khớp clone gốc — SplitText letter-mask):
 *   - Heading: mỗi CHỮ CÁI trượt lên qua mask `overflow:clip` (yPercent 110→0),
 *     duration 0.6s, ease power2.out, stagger 0.03s. Trigger khi vào viewport.
 *   - Badge: fade + trượt lên nhẹ (opacity + y 20→0), 0.6s power2.out.
 *   - Reduced-motion: bail-out sớm → chữ hiện final state.
 *
 * Tuyền inline px + clamp/cqi (KHÔNG md:/lg:/vw). Responsive qua @container.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentHeroProps {
  content: HousentHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

// Google Sans Flex = primary font gốc; Lilex = helping/mono cho badge + button.
const PRIMARY_STACK =
  '"Google Sans Flex", "Google Sans Flex Placeholder", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
const MONO_STACK =
  '"Lilex", "Lilex Placeholder", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const COLORS = {
  bg: '#f1e6df',
  primary: '#3b322d',
  secondary: '#6c645f',
  brand: '#ff810a',
  black: '#201d1c',
  white: '#ffffff',
  border: '#e7dfdb',
} as const;

const ROOT_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  backgroundColor: COLORS.bg,
  color: COLORS.primary,
  containerType: 'inline-size',
  // padding-top 280 → 150 → 120; padding-bottom 0 (ảnh bleed đáy)
  paddingTop: 'clamp(120px, 19.4cqi, 280px)',
  paddingBottom: 0,
};

const CONTAINER_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: '1440px',
  marginInline: 'auto',
  // padding-inline 48 → 24 → 16
  paddingInline: 'clamp(16px, 3.3cqi, 48px)',
};

const CONTENT_BLOCK_STYLE: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 'clamp(32px, 3cqi, 44px)',
};

const LEFT_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100%',
  maxWidth: '645px',
  // đẩy đáy content chừa chỗ ảnh bleed (section padding-bottom 0)
  paddingBottom: 'clamp(60px, 8cqi, 120px)',
  zIndex: 1,
};

const BADGE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '4px 8px',
  backgroundColor: COLORS.white,
  borderRadius: '6px',
  fontFamily: MONO_STACK,
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: 1.4,
  letterSpacing: 0,
  textTransform: 'uppercase',
  color: COLORS.primary,
  width: 'fit-content',
};

const BADGE_DOT_STYLE: React.CSSProperties = {
  width: '12px',
  height: '12px',
  borderRadius: '4px',
  backgroundColor: COLORS.brand,
  flexShrink: 0,
};

// .gap-48 wrapper: margin-top 48px, overflow hidden (mask cho letter reveal)
const HEADING_WRAP_STYLE: React.CSSProperties = {
  marginTop: 'clamp(32px, 3.3cqi, 48px)',
  overflow: 'hidden',
};

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: PRIMARY_STACK,
  fontSize: 'clamp(38px, 4.86cqi, 70px)',
  fontWeight: 600,
  lineHeight: 1.2,
  letterSpacing: '-0.015em',
  color: COLORS.primary,
  margin: 0,
};

const SUBTITLE_STYLE: React.CSSProperties = {
  marginTop: '16px',
  maxWidth: '540px',
  fontFamily: PRIMARY_STACK,
  fontSize: '18px',
  fontWeight: 400,
  lineHeight: 1.6,
  color: COLORS.secondary,
  margin: '16px 0 0',
};

const SEARCH_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  maxWidth: '637px',
  marginTop: 'clamp(32px, 3.3cqi, 48px)',
};

const SEARCH_INPUT_STYLE: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  height: '52px',
  border: `1px solid ${COLORS.border}`,
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
  borderRadius: '8px',
  padding: '12px 12px 12px 16px',
  fontFamily: PRIMARY_STACK,
  fontSize: '16px',
  color: COLORS.primary,
  outline: 'none',
};

const SEARCH_BUTTON_STYLE: React.CSSProperties = {
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  height: '52px',
  backgroundColor: COLORS.black,
  color: COLORS.white,
  fontFamily: MONO_STACK,
  fontSize: '14px',
  fontWeight: 500,
  textTransform: 'uppercase',
  border: 0,
  borderRadius: '6px',
  padding: '12px 20px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

// Ảnh toà nhà: absolute bám đáy-phải section, bleed mép (desktop). Mobile → static.
const IMAGE_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 'auto 0% 0% auto',
  width: '100%',
  maxWidth: 'clamp(350px, 48cqi, 700px)',
  objectFit: 'cover',
  objectPosition: 'bottom right',
  zIndex: 0,
};

// Gradient fade: ảnh mờ dần xuống nền be ở đáy section (khớp bản gốc).
const IMAGE_FADE_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 'auto 0 0 auto',
  width: '100%',
  maxWidth: 'clamp(350px, 48cqi, 700px)',
  height: 'clamp(80px, 12cqi, 160px)',
  backgroundImage: `linear-gradient(to bottom, rgba(241, 230, 223, 0) 0%, ${COLORS.bg} 100%)`,
  pointerEvents: 'none',
  zIndex: 0,
};

// Hàng thông tin đáy section: 3 cột mono, phân cách bằng đường viền trên.
const FOOTER_STYLE: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  marginTop: 'clamp(48px, 6cqi, 96px)',
  paddingTop: 'clamp(20px, 2.2cqi, 32px)',
  paddingBottom: 'clamp(20px, 2.2cqi, 32px)',
  borderTop: `1px solid ${COLORS.border}`,
  fontFamily: MONO_STACK,
  fontSize: '13px',
  fontWeight: 500,
  letterSpacing: 0,
  textTransform: 'uppercase',
  color: COLORS.secondary,
  zIndex: 1,
};

const FOOTER_ITEM_STYLE: React.CSSProperties = {
  whiteSpace: 'nowrap',
};

function LetterReveal({
  text,
  baseStyle,
  className,
  activeKey,
  elementKey,
  styles,
}: {
  text: string;
  baseStyle: React.CSSProperties;
  className: string;
  activeKey?: string | null;
  elementKey: string;
  styles?: ElementStylesMap;
}) {
  const words = React.useMemo(() => text.split(' '), [text]);
  return (
    <span
      data-element-key={elementKey}
      className={selectableClass(activeKey === elementKey, className)}
      style={composeStyle(baseStyle, elementStyleOf(styles, elementKey))}
      aria-label={text}
    >
      {words.map((word, wi) => (
        <React.Fragment key={`w-${wi}`}>
          <span
            data-hh-word
            aria-hidden='true'
            style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
          >
            {Array.from(word).map((ch, ci) => (
              <span
                key={`c-${ci}`}
                data-hh-mask
                style={{
                  display: 'inline-block',
                  overflow: 'clip',
                  verticalAlign: 'bottom',
                }}
              >
                <span
                  data-hh-letter
                  style={{ display: 'inline-block', willChange: 'transform' }}
                >
                  {ch}
                </span>
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </span>
  );
}

export function HousentHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentHeroProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const badgeRef = React.useRef<HTMLSpanElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root) return;

      const letters = root.querySelectorAll<HTMLElement>('[data-hh-letter]');
      const badge = badgeRef.current;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (letters.length) gsap.set(letters, { yPercent: 0 });
        if (badge) gsap.set(badge, { opacity: 1, y: 0 });
        return;
      }

      if (letters.length) {
        gsap.fromTo(
          letters,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.03,
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }

      if (badge) {
        gsap.fromTo(
          badge,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }
    },
    [content.title, content.badge]
  );

  return (
    <div
      ref={rootRef}
      style={composeStyle(ROOT_STYLE, blockBackgroundStyle(background))}
      className={className}
    >
      <style>{`
        @container (max-width: 767px) {
          .hh-content-block { flex-direction: column !important; align-items: flex-start !important; }
          .hh-left { max-width: 100% !important; padding-bottom: 32px !important; }
          .hh-image { position: static !important; max-width: 100% !important; margin-top: 24px !important; border-radius: 12px; }
          .hh-image-fade { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-hh-letter] { transform: none !important; }
        }
      `}</style>

      <div style={CONTAINER_STYLE}>
        <div style={CONTENT_BLOCK_STYLE} className='hh-content-block'>
          <div style={LEFT_STYLE} className='hh-left'>
            {content.badge ? (
              <span
                ref={badgeRef}
                data-element-key='badge'
                style={composeStyle(BADGE_STYLE, styleOf('badge'))}
                className={selectableClass(activeKey === 'badge')}
              >
                <span style={BADGE_DOT_STYLE} />
                {content.badge}
              </span>
            ) : null}

            <div style={HEADING_WRAP_STYLE}>
              <h1 style={{ margin: 0 }}>
                <LetterReveal
                  text={content.title}
                  baseStyle={HEADING_STYLE}
                  className='hh-heading'
                  activeKey={activeKey}
                  elementKey='title'
                  styles={styles}
                />
              </h1>
            </div>

            {content.subtitle ? (
              <p
                data-element-key='subtitle'
                style={composeStyle(SUBTITLE_STYLE, styleOf('subtitle'))}
                className={selectableClass(activeKey === 'subtitle')}
              >
                {content.subtitle}
              </p>
            ) : null}

            <div
              data-element-key='search'
              style={composeStyle(SEARCH_STYLE, styleOf('search'))}
              className={selectableClass(activeKey === 'search')}
            >
              <input
                readOnly
                placeholder={content.searchPlaceholder}
                style={SEARCH_INPUT_STYLE}
              />
              <button type='button' style={SEARCH_BUTTON_STYLE}>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  aria-hidden='true'
                >
                  <circle cx='11' cy='11' r='8' />
                  <path d='m21 21-4.3-4.3' />
                </svg>
                {content.searchLabel}
              </button>
            </div>
          </div>

          {content.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.imageUrl}
              alt=''
              data-element-key='image'
              style={composeStyle(IMAGE_STYLE, styleOf('image'))}
              className={cnImage(activeKey)}
            />
          ) : (
            <div
              data-element-key='image'
              style={composeStyle(IMAGE_STYLE, styleOf('image'), {
                display: 'grid',
                placeItems: 'center',
                aspectRatio: '4 / 5',
                backgroundColor: '#e6ddd5',
                color: '#9a8f86',
                fontSize: '14px',
              })}
              className={cnImage(activeKey)}
            >
              Ảnh hero
            </div>
          )}

          <div
            style={IMAGE_FADE_STYLE}
            className='hh-image-fade'
            aria-hidden='true'
          />
        </div>

        {content.footerLeft || content.footerCenter || content.footerRight ? (
          <div style={FOOTER_STYLE} className='hh-footer'>
            {content.footerLeft ? (
              <span
                data-element-key='footerLeft'
                style={composeStyle(FOOTER_ITEM_STYLE, styleOf('footerLeft'))}
                className={selectableClass(activeKey === 'footerLeft')}
              >
                {content.footerLeft}
              </span>
            ) : null}
            {content.footerCenter ? (
              <span
                data-element-key='footerCenter'
                style={composeStyle(FOOTER_ITEM_STYLE, styleOf('footerCenter'))}
                className={selectableClass(activeKey === 'footerCenter')}
              >
                {content.footerCenter}
              </span>
            ) : null}
            {content.footerRight ? (
              <span
                data-element-key='footerRight'
                style={composeStyle(FOOTER_ITEM_STYLE, styleOf('footerRight'))}
                className={selectableClass(activeKey === 'footerRight')}
              >
                {content.footerRight}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function cnImage(activeKey?: string | null): string {
  return `hh-image ${selectableClass(activeKey === 'image')}`.trim();
}
