'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SustainitExpertiseItem,
  SustainitOurExpertiseContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface SustainitOurExpertiseProps {
  content: SustainitOurExpertiseContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const INK = '#282828';
const ACCENT_DEFAULT = '#B6FF3D';
const BG_DEFAULT = '#F4F4F2';
const MONO =
  "'Geist Mono', ui-monospace, SFMono-Regular, 'Roboto Mono', monospace";

function safeUrl(url: string | undefined): string | undefined {
  return url ? url.replace(/"/g, '%22') : undefined;
}

interface ExpertiseCellProps {
  item: SustainitExpertiseItem;
  index: number;
  styles?: ElementStylesMap;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

function ExpertiseCell({
  item,
  index,
  styles,
  order,
  positions,
  activeKey,
}: ExpertiseCellProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const imgKey = `items[${index}].imageUrl`;
  const titleKey = `items[${index}].title`;
  const subtitleKey = `items[${index}].subtitle`;
  const bulletsKey = `items[${index}].bullets`;

  const imgUrl = safeUrl(item.imageUrl);
  const bullets = Array.isArray(item.bullets) ? item.bullets : [];

  return (
    <article className={cn('soe-cell group', 'aspect-square')}>
      <div
        data-element-key={imgKey}
        className={cn(
          'soe-cell-img',
          'absolute inset-0 aspect-auto h-full w-full'
        )}
        style={composeStyle(
          {
            backgroundImage: imgUrl ? `url("${imgUrl}")` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          },
          styleOf(imgKey)
        )}
      >
        <span className='sr-only'>{item.title}</span>
      </div>

      <div
        className='soe-cell-text flex flex-col'
        style={{
          gap: 'clamp(6px, 0.9cqi, 12px)',
          padding: 'clamp(14px, 1.8cqi, 24px)',
        }}
      >
        <div
          className='soe-cell-card z-50 flex h-fit! w-[70%]! flex-col items-start justify-start rounded-3xl bg-white py-4! py-8 @3xl:h-[80%]! @4xl:h-[60%]! @4xl:w-[50%]! @4xl:gap-8!'
          style={{ border: `1px solid ${item.color}` }}
        >
          <h3
            data-element-key={titleKey}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: MONO,
                fontSize: 'clamp(13px, 1.5cqi, 18px)',
                fontWeight: 400,
                lineHeight: 1.2,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: INK,
              },
              styleOf(titleKey)
            )}
            className={cn(
              'soe-cell-title mx-auto! max-w-[80%]!',
              selectableClass(activeKey === titleKey)
            )}
          >
            {item.title || 'Expertise title'}
          </h3>

          {item.subtitle ? (
            <p
              data-element-key={subtitleKey}
              style={composeStyle(
                {
                  margin: 0,
                  fontFamily: MONO,
                  fontSize: 'clamp(11px, 1.1cqi, 13px)',
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: INK,
                },
                styleOf(subtitleKey)
              )}
              className={cn(
                'soe-cell-subtitle mx-auto! max-w-[80%]!',
                selectableClass(activeKey === subtitleKey)
              )}
            >
              ({item.subtitle})
            </p>
          ) : null}

          <ul
            data-element-key={bulletsKey}
            style={composeStyle(
              {
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(4px, 0.5cqi, 8px)',
                fontFamily: MONO,
                fontSize: 'clamp(11px, 1.1cqi, 13px)',
                fontWeight: 400,
                lineHeight: 1.5,
                color: INK,
              },
              styleOf(bulletsKey)
            )}
            className={cn(
              'soe-cell-bullets max-w-[85%]! text-left',
              selectableClass(activeKey === bulletsKey)
            )}
          >
            {bullets.map((b, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.3em' }}>
                <span
                  aria-hidden='true'
                  className='mt-1 mr-4 -ml-1 flex size-1.5 shrink-0 rounded-full bg-black p-0.5 @4xl:mr-8'
                  style={{ border: `2px solid ${item.color}` }}
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export function SustainitOurExpertise({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: SustainitOurExpertiseProps) {
  const rootRef = React.useRef<HTMLElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const bgColor = content.bgColor || BG_DEFAULT;
  const accent = content.accentColor || ACCENT_DEFAULT;
  const items = Array.isArray(content.items) ? content.items : [];

  const indexKey = 'indexLabel';
  const headingKey = 'heading';
  const introKey = 'intro';
  const ctaKey = 'ctaLabel';

  useBlockMotion(
    rootRef,
    ({ scroller, isMobile }) => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const cells = root.querySelectorAll<HTMLElement>('.soe-cell');
      if (cells.length) {
        gsap.fromTo(
          cells,
          { opacity: 0, y: isMobile ? 24 : 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 672px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        ctx => {
          const { isDesktop, reduceMotion } = ctx.conditions as {
            isDesktop: boolean;
            reduceMotion: boolean;
          };
          if (!isDesktop || reduceMotion) return;

          const grid = root.querySelector<HTMLElement>('.soe-grid');
          if (!grid) return;
          const lineH = grid.querySelector<HTMLElement>('.soe-grid-line-h');
          const lineV = grid.querySelector<HTMLElement>('.soe-grid-line-v');
          if (!lineH || !lineV) return;

          gsap.fromTo(
            lineH,
            { opacity: 0 },
            {
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: grid,
                scroller,
                start: 'top 60%',
                end: 'top 30%',
                scrub: 0.5,
                invalidateOnRefresh: true,
              },
            }
          );

          gsap.fromTo(
            lineV,
            {
              opacity: 0,
              y: -grid.offsetHeight * 0.4,
            },
            {
              opacity: 1,
              y: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: grid,
                scroller,
                start: 'top 20%',
                end: 'center 50%',
                scrub: 0.5,
                invalidateOnRefresh: true,
              },
            }
          );

          const cards = grid.querySelectorAll<HTMLElement>('.soe-cell-card');
          if (cards.length) {
            cards.forEach((card, i) => {
              gsap.fromTo(
                card,
                { opacity: 0 },
                {
                  opacity: 1,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: card,
                    scroller,
                    start: `top ${80 - i * 5}%`,
                    end: `top ${50 - i * 5}%`,
                    scrub: 0.5,
                    invalidateOnRefresh: true,
                  },
                }
              );
            });
          }
        }
      );
    },
    [items.length]
  );

  return (
    <section
      ref={rootRef}
      style={composeStyle(
        { background: bgColor, color: INK, fontFamily: MONO },
        blockBackgroundStyle(background)
      )}
      className={cn(
        'soe @container relative w-full overflow-hidden',
        className
      )}
    >
      <div
        style={{
          margin: '0 auto',
          padding: 'clamp(48px, 8cqi, 96px) clamp(20px, 4cqi, 56px)',
        }}
      >
        <div
          className='soe-header flex flex-col items-center text-center'
          style={{
            gap: 'clamp(14px, 2cqi, 24px)',
            marginBottom: 'clamp(32px, 5cqi, 64px)',
          }}
        >
          <h2
            data-element-key={headingKey}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: MONO,
                fontSize: 'clamp(30px, 5cqi, 48px)',
                fontWeight: 400,
                lineHeight: 1.1,
                color: INK,
                display: 'inline-block',
                backgroundColor: accent,
                borderRadius: 'clamp(8px, 1cqi, 14px)',
                padding: 'clamp(4px, 0.8cqi, 10px) clamp(12px, 2cqi, 22px)',
              },
              styleOf(headingKey)
            )}
            className={cn(
              'soe-heading',
              selectableClass(activeKey === headingKey)
            )}
          >
            {content.heading || 'Our Expertise'}
          </h2>

          <p
            data-element-key={introKey}
            style={composeStyle(
              {
                margin: 0,
                maxWidth: 'min(520px, 60ch)',
                fontFamily: MONO,
                fontSize: 'clamp(12px, 1.3cqi, 15px)',
                lineHeight: 1.5,
                color: INK,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              },
              styleOf(introKey)
            )}
            className={cn('soe-intro', selectableClass(activeKey === introKey))}
          >
            {content.intro ||
              'We offer strategic partnership at the key stages of building a global iconic brand.'}
          </p>
          <span
            data-element-key={indexKey}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: MONO,
                fontSize: 'clamp(11px, 1.1cqi, 13px)',
                color: INK,
                opacity: 0.6,
              },
              styleOf(indexKey)
            )}
            className={cn('soe-index', selectableClass(activeKey === indexKey))}
          >
            {content.indexLabel || '(01 — 04)'}
          </span>
        </div>

        <div
          className='soe-grid grid grid-cols-1 @2xl:grid-cols-2'
          style={{ gap: 'clamp(16px, 2.5cqi, 32px)' }}
        >
          {items.length >= 4 && (
            <>
              <span
                className='soe-grid-line soe-grid-line-v'
                aria-hidden='true'
              />
              <span
                className='soe-grid-line soe-grid-line-h'
                aria-hidden='true'
              />
            </>
          )}
          {items.slice(0, 4).map((item, idx) => (
            <ExpertiseCell
              key={idx}
              item={item}
              index={idx}
              styles={styles}
              order={order}
              positions={positions}
              activeKey={activeKey}
            />
          ))}
        </div>

        {content.ctaLabel ? (
          <div
            className='soe-cta'
            style={{
              marginTop: 'clamp(40px, 6cqi, 80px)',
              borderTop: `1px solid ${INK}`,
              paddingTop: 'clamp(16px, 2cqi, 24px)',
              textAlign: 'center',
            }}
          >
            <span
              data-element-key={ctaKey}
              style={composeStyle(
                {
                  fontFamily: MONO,
                  fontSize: 'clamp(12px, 1.3cqi, 15px)',
                  fontWeight: 400,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: INK,
                  cursor: 'pointer',
                  minHeight: 44,
                  display: 'inline-flex',
                  alignItems: 'center',
                },
                styleOf(ctaKey)
              )}
              className={cn(
                'soe-cta-label',
                selectableClass(activeKey === ctaKey)
              )}
            >
              {content.ctaLabel}
            </span>
          </div>
        ) : null}
      </div>

      <style>{`
                .soe-grid {
                    position: relative;
                }
                .soe-grid-line {
                    position: absolute;
                    background: ${INK};
                    pointer-events: none;
                    z-index: 1;
                }
                .soe-grid-line-v,
                .soe-grid-line-h {
                    /* Mobile (1 cột): ẩn cả 2 */
                    display: none;
                }
                @container (min-width: 672px) {
                    /* @2xl/@4xl (2 cột): hiện đường dọc + ngang giữa 2 hàng,
                       mỗi đường chỉ dài 1/4 grid, đặt ở tâm. */
                    .soe-grid-line-v {
                        display: block;
                        top: 37.5%;
                        height: 25%;
                        left: 50%;
                        width: 0.5px;
                        transform: translateX(-50%);
                        background: #cbabff;
                    }
                    .soe-grid-line-h {
                        display: block;
                        left: 37.5%;
                        width: 25%;
                        top: 50%;
                        height: 0.5px;
                        transform: translateY(-50%);
                        background: #cbabff;
                    }
                }

                .soe-cell-card {
                    position: absolute;
                    gap: clamp(6px, 0.9cqi, 12px);
                    padding: 0;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    background: #ffffff;
                    width: 60%;
                    height: 60%;
                    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                                box-shadow 0.6s cubic-bezier(0.22, 1, 0.36, 1);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
                }
                /* Khi hover cell -> ảnh nền blur + card nổi lên */
                .soe-cell-img {
                    transition: filter 1s cubic-bezier(0.22, 1, 0.36, 1),
                                transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .soe-cell:hover .soe-cell-img {
                    filter: blur(15px);
                }
                .soe-cell:hover .soe-cell-card {
                    transform: translate(-50%, -50%) translateY(-4px);
                    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
                }
                @container (min-width: 896px) {
                    .soe-cell-card {
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        width: 60%;
                        height: 70%;
                        transform: translate(-50%, -50%);
                        background: #ffffff;
                        justify-content: center;
                        text-align: center;
                    }
                }
                /* Tôn trọng prefers-reduced-motion */
                @media (prefers-reduced-motion: reduce) {
                    .soe-cell-img,
                    .soe-cell-card {
                        transition: none !important;
                    }
                    .soe-cell:hover .soe-cell-img {
                        filter: none;
                        transform: none;
                    }
                    .soe-cell:hover .soe-cell-card {
                        transform: translate(-50%, -50%);
                    }
                }
            `}</style>
    </section>
  );
}
