'use client';

/**
 * Data-block "Hero - 01 (Perform v1)" (port từ 360-admin-cms framer-perform-hero).
 *
 * Design SOURCE: perform.framer.website hero — full-bleed motion-blur bg,
 * eyebrow + headline (per-char entrance) + subtitle + pill CTA + 5-star review,
 * content trái tối đa 720px, overlay gradient ngang từ trái. Manrope 72/500/-0.05em.
 *
 * Theo contract nền GSAP (R1–R6):
 *  - Title char-stagger qua SplitType + gsap.fromTo (thay framer-motion spring gốc).
 *  - Mọi entrance (bg fade, eyebrow/subtitle/cta/review fade-up) qua useBlockMotion
 *    với scrollTrigger {trigger, scroller, start:'top 85%',
 *    toggleActions:'play none none reverse', invalidateOnRefresh:true}.
 *  - @container + đơn vị cqi thay md:/lg:.
 *  - data-element-key + styleOf(key) + selectableClass cho mỗi element editable.
 */
import * as React from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

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
  fontSize: 'clamp(40px, 6cqi, 72px)',
  fontWeight: 500,
  lineHeight: '1.2em',
  letterSpacing: '-0.05em',
  color: '#ffffff',
  margin: 0,
  textShadow: '0 2px 24px rgba(0, 0, 0, 0.35)',
};

export function FramerPerformHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
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

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root) return;

      // Background image — fade-in.
      const bg = root.querySelector<HTMLElement>('.perform-bg');
      if (bg) {
        gsap.fromTo(
          bg,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1.2,
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

      // Title — per-character spring-ish entrance (SplitType chars).
      root
        .querySelectorAll<HTMLElement>('.perform-title')
        .forEach((line, lineIdx) => {
          const split = new SplitType(line, { types: 'chars' });
          gsap.fromTo(
            split.chars,
            { yPercent: 110, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 1.2,
              ease: 'power3.out',
              stagger: 0.035,
              delay: lineIdx * 0.15,
              scrollTrigger: {
                trigger: line,
                scroller,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
                invalidateOnRefresh: true,
              },
            }
          );
        });

      // Eyebrow / subtitle / CTA / review — staggered fade-up.
      gsap.utils
        .toArray<HTMLElement>('.perform-reveal', root)
        .forEach((el, i) => {
          gsap.fromTo(
            el,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out',
              delay: i * 0.08,
              scrollTrigger: {
                trigger: el,
                scroller,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
                invalidateOnRefresh: true,
              },
            }
          );
        });
    },
    [titleLines.length]
  );

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='perform-hero @container relative flex min-h-[clamp(460px,90cqi,900px)] w-full flex-col overflow-hidden rounded-md'
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

      {/* Content column — left-aligned, max 720px */}
      <div
        className='relative z-[2] flex flex-col justify-center'
        style={{
          minHeight: 'inherit',
          padding: 'clamp(24px, 5cqi, 64px)',
          maxWidth: 720,
          fontFamily: '"Manrope", system-ui, sans-serif',
        }}
      >
        {/* Eyebrow */}
        <div
          data-element-key='eyebrow'
          style={composeStyle(
            {
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            },
            styleOf('eyebrow')
          )}
          className={selectableClass(activeKey === 'eyebrow', 'perform-reveal')}
        >
          <span
            aria-hidden='true'
            style={{
              width: 24,
              height: 1,
              background: 'rgba(255,255,255,0.6)',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 'clamp(12px, 1.2cqi, 14px)',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: 0.2,
            }}
          >
            {content.eyebrow || 'Experienced triathlon coach'}
          </span>
        </div>

        {/* Title lines — per-char stagger */}
        <div
          data-element-key='title'
          style={composeStyle({ marginBottom: 24 }, styleOf('title'))}
          className={selectableClass(activeKey === 'title')}
        >
          {titleLines.map((line, i) => (
            <h1
              key={i}
              className='perform-title overflow-hidden'
              style={TITLE_STYLE}
            >
              {line}
            </h1>
          ))}
        </div>

        {/* Subtitle */}
        <div
          data-element-key='subtitle'
          style={composeStyle(
            { marginBottom: 32, maxWidth: 520 },
            styleOf('subtitle')
          )}
          className={selectableClass(
            activeKey === 'subtitle',
            'perform-reveal'
          )}
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
        </div>

        {/* CTA pill */}
        <div className='perform-reveal' style={{ marginBottom: 48 }}>
          <a
            data-element-key='ctaLabel'
            href={content.ctaHref || '#start'}
            aria-label={content.ctaLabel || 'Start now'}
            style={composeStyle(
              {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: 'clamp(11px, 1.2cqi, 14px) clamp(16px, 2cqi, 22px)',
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
            className={selectableClass(activeKey === 'ctaLabel')}
          >
            <span>{content.ctaLabel || 'Start now'}</span>
            <span aria-hidden='true' style={{ fontSize: 16, lineHeight: 1 }}>
              ↗
            </span>
          </a>
        </div>

        {/* Star reviews */}
        <div
          data-element-key='reviewCount'
          style={composeStyle(
            { display: 'flex', alignItems: 'center', gap: 12 },
            styleOf('reviewCount')
          )}
          className={selectableClass(
            activeKey === 'reviewCount',
            'perform-reveal'
          )}
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
                  fontSize: 14,
                  color: i < reviewStars ? '#ffffff' : 'rgba(255,255,255,0.3)',
                }}
              >
                ★
              </span>
            ))}
          </div>
          <span
            style={{
              fontSize: 'clamp(12px, 1.2cqi, 14px)',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.85)',
              fontFamily: '"Manrope", system-ui, sans-serif',
            }}
          >
            {content.reviewCount || '100+ Positive Client Reviews'}
          </span>
        </div>
      </div>
    </section>
  );
}
