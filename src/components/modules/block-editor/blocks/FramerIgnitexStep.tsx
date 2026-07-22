'use client';

import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerIgnitexStepContent,
  FramerIgnitexStepCard,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface Props {
  content: FramerIgnitexStepContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const DEFAULT_CARDS: FramerIgnitexStepCard[] = [
  {
    title: 'Discover & Define',
    body: 'We dive deep into your goals, audience, and brand to uncover insights and define a clear direction.',
    mainImageUrl:
      'https://framerusercontent.com/images/9pSg9VbHyOzgvjgKg8ZxafAC9Y.svg',
  },
  {
    title: 'Design & Build',
    body: 'With strategy in place, we craft stunning visuals and high-performing digital solutions tailored to your needs.',
    mainImageUrl:
      'https://framerusercontent.com/images/FKdtn2NzI19PvdqikGNTBvGO8M.svg',
  },
  {
    title: 'Launch & Grow',
    body: 'We bring your vision to life, optimize for performance, and support your ongoing success post-launch.',
    mainImageUrl:
      'https://framerusercontent.com/images/qijKgqD5sm0TZqlD52en6tHZeQ.svg',
  },
];

const CARD_KEYS = [
  {
    title: 'card1Title',
    body: 'card1Body',
    imageUrl: 'card1MainImageUrl',
  },
  {
    title: 'card2Title',
    body: 'card2Body',
    imageUrl: 'card2MainImageUrl',
  },
  {
    title: 'card3Title',
    body: 'card3Body',
    imageUrl: 'card3MainImageUrl',
  },
] as const;

type CardFieldKey =
  (typeof CARD_KEYS)[number][keyof (typeof CARD_KEYS)[number]];

const pick = (content: FramerIgnitexStepContent, key: CardFieldKey) =>
  content[key]?.trim() || '';

const resolveCards = (
  content: FramerIgnitexStepContent
): FramerIgnitexStepCard[] => {
  const legacy = Array.isArray(content.cards) ? content.cards : [];
  const resolved = CARD_KEYS.map((keys, i) => {
    const prev = legacy[i] ?? DEFAULT_CARDS[i];
    return {
      title: pick(content, keys.title) || prev?.title || '',
      body: pick(content, keys.body) || prev?.body || '',
      mainImageUrl:
        pick(content, keys.imageUrl) || prev?.mainImageUrl || undefined,
      subImageUrl: prev?.subImageUrl,
    };
  }).filter(c => c.title || c.body || c.mainImageUrl);
  return resolved.length > 0 ? resolved : DEFAULT_CARDS;
};

const FONT_STACK =
  '"Geist", "Geist Placeholder", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
const SERIF_STACK = '"Great Vibes", "Great Vibes Placeholder", cursive';

const ROOT_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  backgroundColor: '#FFFFFF',
  containerType: 'inline-size',
};

const OUTER_TRACK_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '240dvh',
  backgroundColor: '#FFFFFF',
};

const STICKY_INNER_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100dvh',
  overflow: 'hidden',
  isolation: 'isolate',
  containerType: 'inline-size',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'start',
  padding: 'clamp(40px, 8cqi, 120px) clamp(20px, 3.5cqi, 50px)',
  gap: 'clamp(24px, 4cqi, 60px)',
};

const CONTENT_ABS_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: '20%',
  inset: 0,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'clamp(20px, 1.7cqi, 50px)',
  width: '100%',
  maxWidth: 'min(1280px, 100%)',
  marginInline: 'auto',
  paddingInline: 'clamp(20px, 3.5cqi, 50px)',
};

const PRE_TITLE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  fontFamily: FONT_STACK,
  fontSize: 'clamp(14px, 1.2cqi, 16px)',
  fontWeight: 500,
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
  color: '#05080c',
};

const TITLE_COLUMN_STYLE: React.CSSProperties = {
  // display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  width: 'clamp(180px, 24cqi, 300px)',
  flexShrink: 0,
};

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: FONT_STACK,
  fontSize: 'clamp(36px, 4.3cqi, 60px)',
  fontWeight: 500,
  lineHeight: 1.1,
  letterSpacing: '-0.04em',
  color: '#05080c',
  margin: 0,
  marginLeft: '16px',
  textAlign: 'center',
};

const SERIF_WORD_STYLE: React.CSSProperties = {
  fontFamily: SERIF_STACK,
  fontSize: 'clamp(40px, 4.3cqi, 62px)',
  fontWeight: 400,
  lineHeight: 1,
  letterSpacing: '-0.04em',
  color: '#05080c',
  margin: 0,
  fontStyle: 'normal',
};

const CARDS_STACK_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'clamp(10px, 1.2cqi, 16px)',
  flex: '1 1 auto',
  minWidth: 0,
  maxWidth: 'min(400px, 100%)',
  // maxHeight: '100%',
  paddingBottom: '150px',
  overflowY: 'auto',
  scrollbarWidth: 'none',
};

const CARD_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'clamp(8px, 0.8cqi, 12px)',
  padding: 'clamp(10px, 0.9cqi, 14px)',
  border: '1px solid #ebebeb',
  borderRadius: 'clamp(10px, 1.1cqi, 16px)',
  backgroundColor: '#FFFFFF',
  width: '100%',
  flexShrink: 0,
};

const CARD_HEADER_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 'clamp(10px, 1.4cqi, 20px)',
  width: '100%',
};

const CARD_TITLE_STYLE: React.CSSProperties = {
  fontFamily: FONT_STACK,
  fontSize: 'clamp(18px, 1.9cqi, 28px)',
  fontWeight: 500,
  lineHeight: 1.2,
  letterSpacing: '-0.04em',
  color: '#05080c',
  margin: 0,
};

const SPARKLE_ROW_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'clamp(4px, 0.4cqi, 6px)',
  flexShrink: 0,
};

const CARD_BODY_STYLE: React.CSSProperties = {
  fontFamily: FONT_STACK,
  fontSize: 'clamp(14px, 1.25cqi, 18px)',
  fontWeight: 500,
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
  color: '#5b5b5b',
  margin: 0,
  maxWidth: 'min(372px, 100%)',
};

const ILLUSTRATION_WRAPPER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 'clamp(60px, 9cqi, 120px)',
  padding: 'clamp(4px, 0.5cqi, 8px) 0',
};

const ILLUSTRATION_IMAGE_STYLE: React.CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const MAIN_IMAGE_STYLE: React.CSSProperties = {
  display: 'block',
  // maxWidth: 'clamp(80px, 9cqi, 120px)',
  width: '220px',
  height: '220px',
  objectFit: 'contain',
  margin: '0 auto',
};

// const SUB_IMAGE_STYLE: React.CSSProperties = {
//     position: 'absolute',
//     top: '60%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: '60px',
//     height: '60px',
//     objectFit: 'contain',
//     pointerEvents: 'none',
// };

const SPARKLE_GLYPH = (size = 16) => (
  <svg
    aria-hidden='true'
    width={size}
    height={size}
    viewBox='0 0 16 16'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M8 0L9.6 6.4L16 8L9.6 9.6L8 16L6.4 9.6L0 8L6.4 6.4L8 0Z'
      fill='currentColor'
    />
  </svg>
);

export function FramerIgnitexStep({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stickyRef = React.useRef<HTMLDivElement>(null);
  const leftColumnRef = React.useRef<HTMLDivElement>(null);
  const rightColumnRef = React.useRef<HTMLDivElement>(null);
  const cardsStackRef = React.useRef<HTMLDivElement>(null);

  // Editor canvas → layout tĩnh editable (giống ScrollMattis / Readymag Cases).
  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const preTitle = content.preTitle || 'From concept to launch';
  const leftTop = content.leftTop || 'Your';
  const leftBottom = content.leftBottom || 'into Brand';
  const rightTop = content.rightTop || 'transform';
  const rightBottom = content.rightBottom || 'stories';

  const splitLeftBottom = React.useMemo(() => {
    const trimmed = leftBottom.trim();
    if (!trimmed) return { leading: '', last: '' };
    const tokens = trimmed.split(/\s+/);
    if (tokens.length === 1) return { leading: '', last: tokens[0] };
    return {
      leading: tokens.slice(0, -1).join(' '),
      last: tokens[tokens.length - 1],
    };
  }, [leftBottom]);

  const cards = React.useMemo(() => resolveCards(content), [content]);

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root || isCanvas) return;

      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const left = leftColumnRef.current;
      const right = rightColumnRef.current;
      const stack = cardsStackRef.current;
      if (!left || !right || !stack) return;

      if (reduce) {
        gsap.set([left, right, stack], {
          clearProps: 'transform',
          opacity: 1,
        });
        return;
      }

      gsap.set(left, { x: 235, y: -250 });
      gsap.set(right, { x: -235, y: -250 });
      gsap.set(stack, { yPercent: 110, opacity: 1 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      });
      tl.to(left, { y: 0, duration: 0.5 }, 0)
        .to(right, { y: 0, duration: 0.5 }, 0)
        .to(left, { x: 0, duration: 0.5 }, 0.5)
        .to(right, { x: 0, duration: 0.5 }, 0.5)
        .to(stack, { yPercent: -10, opacity: 1, duration: 1 }, 0.5);
    },
    [cards.length, isCanvas]
  );

  const renderCard = (card: FramerIgnitexStepCard, idx: number) => {
    const keys = CARD_KEYS[idx];
    if (!keys) return null;
    return (
      <div
        key={`card-${idx}`}
        data-fist-card-index={idx}
        className={`fist-card fist-card-${idx}`}
        style={CARD_STYLE}
      >
        <div style={CARD_HEADER_STYLE} className='fist-card-header'>
          <h3
            data-element-key={keys.title}
            style={composeStyle(CARD_TITLE_STYLE, styleOf(keys.title))}
            className={selectableClass(
              activeKey === keys.title,
              'fist-card-title'
            )}
          >
            {card.title}
          </h3>
          <span
            data-fist-sparkle
            style={composeStyle(SPARKLE_ROW_STYLE)}
            className='fist-sparkle-row'
            aria-hidden='true'
          >
            {SPARKLE_GLYPH(14)}
            {SPARKLE_GLYPH(14)}
            {SPARKLE_GLYPH(14)}
          </span>
        </div>

        {card.mainImageUrl ? (
          <div
            data-element-key={keys.imageUrl}
            className={selectableClass(
              activeKey === keys.imageUrl,
              'fist-illustration'
            )}
            style={composeStyle(
              ILLUSTRATION_WRAPPER_STYLE,
              ILLUSTRATION_IMAGE_STYLE,
              styleOf(keys.imageUrl)
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.mainImageUrl}
              alt=''
              aria-hidden='true'
              className='fist-illustration-main'
              style={{ ...MAIN_IMAGE_STYLE, pointerEvents: 'none' }}
            />
          </div>
        ) : (
          <div
            data-element-key={keys.imageUrl}
            className={selectableClass(
              activeKey === keys.imageUrl,
              'fist-illustration'
            )}
            style={composeStyle(
              ILLUSTRATION_WRAPPER_STYLE,
              {
                minHeight: 80,
                background: '#f5f5f5',
                borderRadius: 8,
              },
              styleOf(keys.imageUrl)
            )}
          />
        )}

        <p
          data-element-key={keys.body}
          style={composeStyle(CARD_BODY_STYLE, styleOf(keys.body))}
          className={selectableClass(activeKey === keys.body, 'fist-card-body')}
        >
          {card.body}
        </p>
      </div>
    );
  };

  // ── Editor canvas: layout tĩnh, hiện đủ headings + 3 cards ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-block='framer-ignitex-step'
        data-canvas-edit='true'
        style={composeStyle(
          ROOT_STYLE,
          { height: 'auto', minHeight: 480, padding: '32px 20px' },
          blockBackgroundStyle(background)
        )}
        className='fist-root fist-canvas @container'
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&family=Geist:wght@500;600&display=swap');
          .fist-root :where(h1, h2, h3, h4, p, span) { margin: 0; padding: 0; }
        `}</style>

        <span
          data-element-key='preTitle'
          className={selectableClass(
            activeKey === 'preTitle',
            'fist-pre-title'
          )}
          style={composeStyle(
            PRE_TITLE_STYLE,
            { marginBottom: 24 },
            styleOf('preTitle')
          )}
        >
          {SPARKLE_GLYPH(12)}
          <span>{preTitle}</span>
        </span>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr) minmax(0,1fr)',
            gap: 20,
            alignItems: 'start',
            maxWidth: 1100,
            marginInline: 'auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h2
              data-element-key='leftTop'
              style={composeStyle(
                HEADING_STYLE,
                { marginLeft: 0, textAlign: 'left' },
                styleOf('leftTop')
              )}
              className={selectableClass(activeKey === 'leftTop')}
            >
              {leftTop}
            </h2>
            <h2
              data-element-key='leftBottom'
              style={composeStyle(
                HEADING_STYLE,
                {
                  marginLeft: 0,
                  textAlign: 'left',
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: 10,
                  flexWrap: 'wrap',
                },
                styleOf('leftBottom')
              )}
              className={selectableClass(activeKey === 'leftBottom')}
            >
              {splitLeftBottom.leading ? (
                <span style={HEADING_STYLE}>{splitLeftBottom.leading}</span>
              ) : null}
              {splitLeftBottom.last ? (
                <span style={SERIF_WORD_STYLE}>{splitLeftBottom.last}</span>
              ) : null}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cards.map((card, idx) => renderCard(card, idx))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h2
              data-element-key='rightTop'
              style={composeStyle(
                HEADING_STYLE,
                { marginLeft: 0, textAlign: 'left' },
                styleOf('rightTop')
              )}
              className={selectableClass(activeKey === 'rightTop')}
            >
              {rightTop}
            </h2>
            <h2
              data-element-key='rightBottom'
              style={composeStyle(
                HEADING_STYLE,
                { marginLeft: 0, textAlign: 'left' },
                styleOf('rightBottom')
              )}
              className={selectableClass(activeKey === 'rightBottom')}
            >
              {rightBottom}
            </h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      data-block='framer-ignitex-step'
      style={composeStyle(
        ROOT_STYLE,
        OUTER_TRACK_STYLE,
        blockBackgroundStyle(background)
      )}
      className='fist-root fist-outer-track @container'
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&family=Geist:wght@500;600&display=swap');
        .fist-root :where(h1, h2, h3, h4, p, span) { margin: 0; padding: 0; }
        .fist-root :focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 4px;
        }
        @container (max-width: 1023px) {
          .fist-outer-track { height: auto !important; }
          .fist-sticky-inner {
            position: relative !important;
            top: auto !important;
            height: auto !important;
            min-height: 0 !important;
            padding: clamp(40px, 8cqi, 80px) clamp(16px, 4cqi, 24px) !important;
            gap: clamp(24px, 5cqi, 48px) !important;
          }
          .fist-content {
            position: relative !important;
            inset: auto !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: clamp(32px, 5cqi, 48px) !important;
            padding: 0 !important;
          }
          .fist-title-column {
            width: 100% !important;
            max-width: min(728px, 100%) !important;
            align-items: center !important;
            text-align: center !important;
            transform: none !important;
          }
          .fist-title-column h2,
          .fist-title-column .fist-serif {
            text-align: center !important;
          }
          .fist-cards-stack {
            max-width: min(420px, 100%) !important;
            width: 100% !important;
            transform: none !important;
            opacity: 1 !important;
          }
          .fist-card { padding: 18px !important; }
          .fist-card-header {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 10px !important;
          }
          .fist-card-title { text-align: center !important; }
          .fist-card-body {
            text-align: center !important;
            max-width: 100% !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .fist-outer-track { height: auto !important; }
          .fist-sticky-inner {
            position: relative !important;
            top: auto !important;
            height: auto !important;
            min-height: 0 !important;
          }
          .fist-title-column,
          .fist-cards-stack,
          .fist-content {
            transform: none !important;
            opacity: 1 !important;
          }
          .fist-root [data-fist-sparkle] { transform: none !important; }
        }
      `}</style>

      <div
        ref={stickyRef}
        className='fist-sticky-inner @container'
        style={STICKY_INNER_STYLE}
      >
        <span
          data-element-key='preTitle'
          className={selectableClass(
            activeKey === 'preTitle',
            'fist-pre-title'
          )}
          style={composeStyle(PRE_TITLE_STYLE, styleOf('preTitle'))}
        >
          {SPARKLE_GLYPH(12)}
          <span>{preTitle}</span>
        </span>

        <div style={CONTENT_ABS_STYLE} className='fist-content'>
          <div className='flex @4xl:hidden'>
            <h2
              data-element-key='leftTop'
              style={composeStyle(HEADING_STYLE, styleOf('leftTop'))}
              className={selectableClass(
                activeKey === 'leftTop',
                'fist-h2 max-w-[400px] text-center'
              )}
            >
              {`${leftTop} ${rightTop} ${leftBottom} ${rightBottom}`}
            </h2>
          </div>

          <div
            ref={leftColumnRef}
            data-fist-anim='left'
            className='fist-title-column fist-left hidden @4xl:flex'
            style={composeStyle(TITLE_COLUMN_STYLE, styleOf('leftColumn'))}
          >
            <h2
              data-element-key='leftTop'
              style={composeStyle(HEADING_STYLE, styleOf('leftTop'))}
              className={selectableClass(activeKey === 'leftTop', 'fist-h2')}
            >
              {leftTop}
            </h2>
            <h2
              data-element-key='leftBottom'
              style={composeStyle(
                HEADING_STYLE,
                {
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: 'clamp(8px, 0.7cqi, 14px)',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                },
                styleOf('leftBottom')
              )}
              className={selectableClass(activeKey === 'leftBottom', 'fist-h2')}
            >
              {splitLeftBottom.leading && (
                <span className='fist-h2' style={HEADING_STYLE}>
                  {splitLeftBottom.leading}
                </span>
              )}
              {splitLeftBottom.last && (
                <span
                  className='fist-serif'
                  style={composeStyle(SERIF_WORD_STYLE)}
                >
                  {splitLeftBottom.last}
                </span>
              )}
            </h2>
          </div>

          <div
            ref={cardsStackRef}
            data-fist-anim='cards'
            style={CARDS_STACK_STYLE}
            className='fist-cards-stack'
          >
            {cards.map((card, idx) => renderCard(card, idx))}
          </div>

          <div
            ref={rightColumnRef}
            data-fist-anim='right'
            className='fist-title-column fist-right hidden @4xl:flex'
            style={composeStyle(
              TITLE_COLUMN_STYLE,
              { alignItems: 'flex-start' },
              styleOf('rightColumn')
            )}
          >
            <h2
              data-element-key='rightTop'
              style={composeStyle(HEADING_STYLE, styleOf('rightTop'))}
              className={selectableClass(activeKey === 'rightTop', 'fist-h2')}
            >
              {rightTop}
            </h2>
            <h2
              data-element-key='rightBottom'
              style={composeStyle(HEADING_STYLE, styleOf('rightBottom'))}
              className={selectableClass(
                activeKey === 'rightBottom',
                'fist-h2'
              )}
            >
              {rightBottom}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
