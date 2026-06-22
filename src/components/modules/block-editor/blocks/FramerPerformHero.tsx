'use client';

/**
 * Data-block "Hero - 01 (Perform v1)" (port từ 360-admin-cms framer-perform-hero).
 *
 * Design SOURCE: perform.framer.website hero — full-bleed motion-blur bg,
 * eyebrow + headline (per-char entrance) + subtitle + pill CTA + 5-star review,
 * content trái tối đa 720px, overlay gradient ngang từ trái. Manrope 72/500/-0.05em.
 *
 * Theo contract nền GSAP (R1–R6):
 *  - Title char-stagger qua framer-motion (motion.span + useInView, delay i*0.07).
 *  - Mọi entrance (bg fade, eyebrow/subtitle/cta/review fade-up) qua useBlockMotion
 *    với scrollTrigger {trigger, scroller, start:'top 85%',
 *    toggleActions:'play none none reverse', invalidateOnRefresh:true}.
 *  - @container + đơn vị cqi thay md:/lg:.
 *  - data-element-key + styleOf(key) + selectableClass cho mỗi element editable.
 */
import * as React from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerPerformHeroContent,
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
  content: FramerPerformHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const TITLE_STYLE: React.CSSProperties = {
  fontFamily: '"Manrope", system-ui, sans-serif',
  fontSize: 'clamp(40px, 7.5cqi, 72px)',
  fontWeight: 500,
  lineHeight: '1.2em',
  letterSpacing: '-0.05em',
  color: '#ffffff',
  margin: 0,
  textShadow: '0 2px 24px rgba(0, 0, 0, 0.35)',
};

function StaggeredTitleLine({
  text,
  style,
  startInView,
}: {
  text: string;
  style: React.CSSProperties;
  startInView?: boolean;
}) {
  const ref = React.useRef<HTMLHeadingElement>(null);
  const localInView = useInView(ref, { once: true });
  const isInView = startInView ?? localInView;

  const charVariants = {
    hidden: { opacity: 0 },
    show: (i: number) => ({
      opacity: 1,
      transition: { delay: i * 0.07 },
    }),
  };

  const letters = Array.from(text ?? '');

  return (
    <motion.h1
      ref={ref}
      className='perform-title overflow-hidden'
      style={style}
      initial='hidden'
      animate={isInView ? 'show' : 'hidden'}
    >
      {letters.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          aria-hidden='true'
          variants={charVariants}
          custom={i}
          style={{ whiteSpace: 'pre-line' }}
        >
          {char}
        </motion.span>
      ))}
    </motion.h1>
  );
}

function RevealOnView({
  isInView,
  delay,
  children,
  className,
  style,
}: {
  isInView: boolean;
  delay: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function FramerPerformHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isRootInView = useInView(rootRef, {
    once: true,
    margin: '0px 0px -15% 0px',
  });
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const reviewStars = Number(content.reviewStars ?? 5);
  const titleLines = (content.title || 'Level Up Your\nPerformance')
    .split('\n')
    .filter(Boolean);

  const TITLE_CHAR_DURATION = 0.4;
  const TITLE_CHAR_STAGGER = 0.07;
  const titleTotalDuration =
    titleLines.reduce(
      (acc, line) => Math.max(acc, (line.length - 1) * TITLE_CHAR_STAGGER),
      0
    ) + TITLE_CHAR_DURATION;
  const REVEAL_BASE_DELAY = titleTotalDuration;
  const REVEAL_STAGGER = 0.08;

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root) return;

      // Background image — fade-in + zoom out from 105% to 100%.
      const bg = root.querySelector<HTMLElement>('.perform-bg');
      if (bg) {
        gsap.fromTo(
          bg,
          { opacity: 0, scale: 1.05 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.4,
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

      // Eyebrow / subtitle / CTA / review — handled bằng RevealOnView (framer-motion),
    },
    [titleLines.length]
  );

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='perform-hero @container relative flex h-screen w-full flex-col overflow-hidden'
    >
      {/* Background image */}
      <div
        data-element-key='backgroundUrl'
        style={composeStyle(
          content.backgroundUrl
            ? {
                backgroundImage: `url("${content.backgroundUrl.replace(/"/g, '%22')}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : { backgroundColor: '#1a1a1a' },
          styleOf('backgroundUrl')
        )}
        className={selectableClass(
          activeKey === 'backgroundUrl',
          'perform-bg absolute inset-0'
        )}
      />

      {/* Left-to-right gradient overlay */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 35%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* Content column — left-aligned */}
      <div
        className='flex h-full w-full flex-1 items-center justify-center'
        style={{}}
      >
        <div
          className='flex w-[90%] max-w-[350px] @3xl:max-w-[770px] @4xl:w-full @4xl:max-w-[1120px]'
          style={{
            fontFamily: '"Manrope", system-ui, sans-serif',
          }}
        >
          <div
            className='relative z-[2] flex flex-1 flex-col justify-center gap-16 @lg:basis-1/2'
            style={{
              minHeight: 'inherit',
              // padding: 'clamp(24px, 5cqi, 64px)',
              fontFamily: '"Manrope", system-ui, sans-serif',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 40,
              }}
            >
              {/* Wrap info */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {/* Eyebrow */}
                <RevealOnView
                  isInView={isRootInView}
                  delay={REVEAL_BASE_DELAY + 0 * REVEAL_STAGGER}
                  data-element-key='eyebrow'
                  style={composeStyle(
                    {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    },
                    styleOf('eyebrow')
                  )}
                  className={selectableClass(activeKey === 'eyebrow')}
                >
                  <span
                    aria-hidden='true'
                    style={{
                      width: 48,
                      height: 1,
                      background: 'rgba(255,255,255,0.6)',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 'clamp(14px, 1.2cqi, 16px)',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.85)',
                      letterSpacing: 0.2,
                    }}
                  >
                    {content.eyebrow || 'Experienced triathlon coach'}
                  </span>
                </RevealOnView>

                {/* Title lines — per-char stagger (framer-motion StaggeredFade port). */}
                <div
                  data-element-key='title'
                  style={composeStyle({}, styleOf('title'))}
                  className={selectableClass(activeKey === 'title')}
                >
                  <span className='whitespace-pre-line'>
                    <StaggeredTitleLine
                      text={content?.title}
                      style={TITLE_STYLE}
                      startInView={isRootInView}
                    />
                  </span>
                </div>

                {/* Subtitle */}
                <RevealOnView
                  isInView={isRootInView}
                  delay={REVEAL_BASE_DELAY + 2 * REVEAL_STAGGER}
                  data-element-key='subtitle'
                  style={composeStyle({}, styleOf('subtitle'))}
                  className={selectableClass(activeKey === 'subtitle')}
                >
                  <p
                    style={{
                      fontFamily: '"Manrope", system-ui, sans-serif',
                      fontSize: 'clamp(14px, 1.4cqi, 16px)',
                      lineHeight: 1.55,
                      color: 'rgba(255,255,255,0.85)',
                      margin: 0,
                    }}
                  >
                    {content.subtitle ||
                      'Improve your triathlon performance with personalized training plans guided by an experienced coach committed to your success.'}
                  </p>
                </RevealOnView>
              </div>

              {/* CTA pill */}
              <RevealOnView
                isInView={isRootInView}
                delay={REVEAL_BASE_DELAY + 4 * REVEAL_STAGGER}
              >
                <a
                  data-element-key='ctaLabel'
                  href={content.ctaHref || '#start'}
                  aria-label={content.ctaLabel || 'Start now'}
                  style={composeStyle(
                    {
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      padding:
                        'clamp(4px, 1.2cqi, 6px) 4px clamp(4px, 1.2cqi, 6px) clamp(16px, 2cqi, 22px)',
                      background: '#ffffff',
                      color: '#0c0c0c',
                      borderRadius: 999,
                      fontSize: 'clamp(13px, 1.3cqi, 15px)',
                      fontWeight: 500,
                      textDecoration: 'none',
                      lineHeight: 1,
                      fontFamily: '"Manrope", system-ui, sans-serif',
                    },
                    styleOf('ctaLabel')
                  )}
                  className={selectableClass(activeKey === 'ctaLabel', 'group')}
                >
                  <span>{content.ctaLabel || 'Start now'}</span>
                  <span
                    aria-hidden='true'
                    className='inline-flex items-center justify-center transition-transform duration-300 group-hover:rotate-45'
                    style={{
                      width: 40,
                      height: 40,
                      fontSize: 20,
                      lineHeight: 1,
                      borderRadius: '50%',
                      backgroundColor: '#0c0c0c',
                      color: '#ffffff',
                    }}
                  >
                    ↗
                  </span>
                </a>
              </RevealOnView>
            </div>

            {/* Star reviews */}
            <RevealOnView
              isInView={isRootInView}
              delay={REVEAL_BASE_DELAY + 6 * REVEAL_STAGGER}
              data-element-key='reviewCount'
              style={composeStyle(
                {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  borderLeftWidth: 2,
                  padding: '8px 0 8px 24px',
                },
                styleOf('reviewCount')
              )}
              className={selectableClass(activeKey === 'reviewCount')}
            >
              <div
                aria-label={`${reviewStars} out of 5 stars`}
                style={{ display: 'inline-flex', gap: 2 }}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    aria-hidden='true'
                    style={{
                      fontSize: 24,
                      color:
                        i < reviewStars ? '#ffffff' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span
                style={{
                  fontSize: 'clamp(12px, 1.2cqi, 16px)',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.85)',
                  fontFamily: '"Manrope", system-ui, sans-serif',
                }}
              >
                {content.reviewCount || '100+ Positive Client Reviews'}
              </span>
            </RevealOnView>
          </div>
        </div>
      </div>
    </section>
  );
}
