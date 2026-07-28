'use client';

/**
 * Hero - BrightEdge — clone LAYOUT/ANIMATION (không phải nội dung) từ 1
 * template Framer đã mua (recon: recon-brightedge-hero/spec.md). Copy +
 * ảnh trong defaultContent đều là PLACEHOLDER — license template chỉ cho
 * 1 sản phẩm cuối, không cho tái phân phối copy/ảnh gốc như 1 block dùng
 * chung trong thư viện rexerai. User tự thay nội dung/ảnh thật qua editor.
 *
 * Layout: 2 cột (text trái ~44% / ảnh phải ~56%), avatar stack + nút mũi
 * tên, badge tròn xoay chữ quanh chấm cam có hiệu ứng glow lặp lại.
 * Animation: entrance fade/rise cho text (power3.out ~0.9s, so recon §9),
 * glow pulse 700ms cubic-bezier lặp lại trên chấm cam (CDP capture).
 */
import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  BrightedgeHeroContent,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface BrightedgeHeroProps {
  content: BrightedgeHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function BrightedgeHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BrightedgeHeroProps) {
  const rootRef = React.useRef<HTMLElement>(null);

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
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const eyebrow = root.querySelector<HTMLElement>('.be-hero-eyebrow');
      const heading = root.querySelector<HTMLElement>('.be-hero-heading');
      const subtitle = root.querySelector<HTMLElement>('.be-hero-subtitle');
      const cta = root.querySelector<HTMLElement>('.be-hero-cta');
      const image = root.querySelector<HTMLElement>('.be-hero-image');
      const dot = root.querySelector<HTMLElement>('.be-hero-badge-dot');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      });
      if (eyebrow) {
        tl.fromTo(
          eyebrow,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          0
        );
      }
      if (heading) {
        tl.fromTo(
          heading,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
          0.1
        );
      }
      if (subtitle) {
        tl.fromTo(
          subtitle,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
          0.3
        );
      }
      if (cta) {
        tl.fromTo(
          cta,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
          0.4
        );
      }
      if (image) {
        tl.fromTo(
          image,
          { opacity: 0, scale: 0.94 },
          { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' },
          0.15
        );
      }

      // Glow pulse lặp lại trên chấm cam — recon CDP: 700ms cubic-bezier,
      // dựng lại bằng yoyo repeat vì WAAPI gốc không lộ rõ trigger.
      if (dot) {
        gsap.to(dot, {
          boxShadow: '0 0 0 14px rgba(245,87,51,0)',
          duration: 0.7,
          ease: 'power1.out',
          repeat: -1,
          yoyo: false,
          repeatDelay: 0.3,
        });
      }
    },
    []
  );

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container relative w-full overflow-hidden bg-[#fcfcfc] py-12 @2xl:py-16 @4xl:py-24',
        className
      )}
    >
      <div className='mx-auto flex w-full max-w-[1360px] flex-col gap-10 px-5 @2xl:flex-row @2xl:items-center @2xl:gap-8 @4xl:gap-14 @4xl:px-10'>
        {/* Left: text */}
        <div className='flex min-w-0 flex-1 flex-col gap-6'>
          <p
            data-element-key='eyebrow'
            style={composeStyle(
              {
                fontFamily: '"Archivo", system-ui, sans-serif',
                fontSize: 'clamp(16px, 2.4cqi, 20px)',
                fontWeight: 600,
                color: '#333333',
                margin: 0,
              },
              styleOf('eyebrow')
            )}
            className={selectableClass(
              activeKey === 'eyebrow',
              'be-hero-eyebrow'
            )}
          >
            {content.eyebrow}
          </p>
          <h1
            data-element-key='heading'
            style={composeStyle(
              {
                fontFamily: '"Archivo", system-ui, sans-serif',
                fontSize: 'clamp(48px, 9.5cqi, 128px)',
                fontWeight: 800,
                lineHeight: 0.92,
                color: '#333333',
                margin: 0,
                textTransform: 'uppercase',
              },
              styleOf('heading')
            )}
            className={selectableClass(
              activeKey === 'heading',
              'be-hero-heading'
            )}
          >
            {content.heading}
          </h1>
          <p
            data-element-key='subtitle'
            style={composeStyle(
              {
                fontFamily: '"Archivo", system-ui, sans-serif',
                fontSize: 'clamp(15px, 1.6cqi, 18px)',
                fontWeight: 300,
                lineHeight: 1.5,
                color: '#545454',
                margin: 0,
                maxWidth: '38ch',
              },
              styleOf('subtitle')
            )}
            className={selectableClass(
              activeKey === 'subtitle',
              'be-hero-subtitle'
            )}
          >
            {content.subtitle}
          </p>

          <div className='be-hero-cta flex items-center gap-4'>
            <div
              data-element-key='avatars'
              className={selectableClass(activeKey === 'avatars', 'flex')}
              style={styleOf('avatars')}
            >
              {content.avatars.map((a, i) => (
                <div
                  key={a.id}
                  className='size-11 shrink-0 overflow-hidden rounded-full ring-2 ring-[#fcfcfc]'
                  style={{
                    marginLeft: i === 0 ? 0 : -14,
                    backgroundImage: a.imageUrl
                      ? `url("${a.imageUrl.replace(/"/g, '%22')}")`
                      : undefined,
                    backgroundColor: a.imageUrl ? undefined : '#e5e5e5',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: content.avatars.length - i,
                    position: 'relative',
                  }}
                />
              ))}
            </div>
            <a
              data-element-key='ctaLabel'
              href={content.ctaHref || '#'}
              style={composeStyle(
                {
                  fontFamily: '"Archivo", system-ui, sans-serif',
                  fontSize: '15px',
                  fontWeight: 400,
                  color: '#333333',
                },
                styleOf('ctaLabel')
              )}
              className={selectableClass(
                activeKey === 'ctaLabel',
                'inline-flex items-center gap-3'
              )}
            >
              {content.ctaLabel}
              <span
                className='flex size-11 shrink-0 items-center justify-center rounded-full border border-[#333333] transition-transform hover:translate-x-1'
                aria-hidden
              >
                →
              </span>
            </a>
          </div>
        </div>

        {/* Right: image + rotating badge */}
        <div className='relative min-w-0 flex-1 @2xl:flex-[1.2]'>
          <div
            data-element-key='imageUrl'
            className={cn(
              selectableClass(activeKey === 'imageUrl', 'be-hero-image'),
              'aspect-4/3 w-full overflow-hidden rounded-[40px_0px_0px] bg-[#545454] @2xl:aspect-square'
            )}
            style={composeStyle(
              {
                backgroundImage: content.imageUrl
                  ? `url("${content.imageUrl.replace(/"/g, '%22')}")`
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              },
              styleOf('imageUrl')
            )}
            role='img'
            aria-label={content.heading}
          />

          {/* Circular rotating badge, bottom-right overlay */}
          <div className='absolute right-4 bottom-4 flex size-24 items-center justify-center @4xl:size-28'>
            <svg
              viewBox='0 0 100 100'
              className='absolute inset-0 size-full animate-[spin_12s_linear_infinite]'
              aria-hidden
            >
              <defs>
                <path
                  id='be-badge-circle'
                  d='M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0'
                />
              </defs>
              <text
                data-element-key='badgeText'
                style={
                  {
                    fontFamily: '"Archivo", system-ui, sans-serif',
                    fontSize: '6.5px',
                    fontWeight: 400,
                    letterSpacing: '1.2px',
                    fill: '#333333',
                  } as React.CSSProperties
                }
                className={selectableClass(activeKey === 'badgeText')}
              >
                <textPath href='#be-badge-circle' startOffset='0%'>
                  {content.badgeText}
                </textPath>
              </text>
            </svg>
            <div
              className='be-hero-badge-dot flex size-11 items-center justify-center rounded-full bg-[#f55733] text-white'
              aria-hidden
            >
              ↓
            </div>
          </div>

          <p
            data-element-key='badgeSubtext'
            style={composeStyle(
              {
                fontFamily: '"Archivo", system-ui, sans-serif',
                fontSize: 'clamp(18px, 2.6cqi, 28px)',
                fontWeight: 800,
                color: '#ffffff',
                textAlign: 'right',
                margin: 0,
                textTransform: 'uppercase',
              },
              styleOf('badgeSubtext')
            )}
            className={selectableClass(
              activeKey === 'badgeSubtext',
              'absolute bottom-4 left-4'
            )}
          >
            {content.badgeSubtext}
          </p>
        </div>
      </div>
    </section>
  );
}
