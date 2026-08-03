'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BelgoAboutProductContent,
  BlockBackground,
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
import {
  BELGO_FONT_BODY,
  BELGO_FONT_CSS,
  BELGO_FONT_DISPLAY,
} from './belgoTheme';
import {
  resolveBelgoAboutProductSpecs,
  resolveBelgoAboutProductTitleLines,
} from './_registry/defs/belgoAboutProduct';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface BelgoAboutProductProps {
  content: BelgoAboutProductContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Belgo About Product — port từ apps/belgo AboutProduct.tsx.
 *
 * Khác apps:
 *  - viewport `matchMedia('(min-width:1024px)')` → đo container (ResizeObserver
 *    trên chính khối specs) cho cả scaleX-fit tiêu đề lẫn layout 2 cột;
 *  - `gsap.matchMedia(MOTION_CONDITIONS)` → `useBlockMotion` + `scroller`;
 *  - check hiển thị dòng specs tính theo rect của scroller (editor preview cuộn
 *    trong phần tử, không phải window);
 *  - token màu/chữ chuyển hết vào inline base để toolbar override được.
 */

const INK = '#1A1A1A';
const SPECS_RED = '#d72505';
const SURFACE = '#e4ddcf';

/** Ngưỡng container bật layout 2 cột + scaleX-fit (apps dùng viewport lg). */
const WIDE_BREAKPOINT = 1024;

export function BelgoAboutProduct({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BelgoAboutProductProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const isWide = !useContainerMobile(rootRef, WIDE_BREAKPOINT);
  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const titleLines = React.useMemo(
    () => resolveBelgoAboutProductTitleLines(content),
    [content]
  );
  const specs = React.useMemo(
    () => resolveBelgoAboutProductSpecs(content),
    [content]
  );

  const patternUrl = content.patternUrl?.trim();
  const crestUrl = content.crestUrl?.trim();
  const crestAlt = content.crestAlt?.trim() || '';
  const eyebrow = content.eyebrow ?? '';
  const body = content.body ?? '';
  const illustrationUrl = content.illustrationUrl?.trim();
  const specsTitle = content.specsTitle ?? '';

  // Editor có thể đổi fontSize/fontFamily của specsTitle → phải fit lại.
  const specsTitleStyleKey = JSON.stringify(
    elementStyleOf(styles, 'specsTitle') ?? null
  );

  /**
   * scaleX-fit tiêu đề "BEVERAGE SPECS" cho vừa đúng bề rộng cột (chỉ khi
   * container đủ rộng). Thuần DOM — không phải animation nên nằm ngoài GSAP.
   */
  React.useEffect(() => {
    const title = titleRef.current;
    const parent = title?.parentElement;
    if (!title || !parent) return;

    const fitTitle = () => {
      if (parent.clientWidth < WIDE_BREAKPOINT) {
        title.style.transform = 'none';
        title.style.width = '';
        return;
      }

      // Đo bề rộng chữ tự nhiên (phải shrink-to-fit, không w-full).
      title.style.transform = 'none';
      title.style.width = 'max-content';

      const textWidth = title.scrollWidth;
      if (textWidth <= 0) return;

      title.style.transformOrigin = 'left center';
      title.style.transform = `scaleX(${parent.clientWidth / textWidth})`;
    };

    const ro = new ResizeObserver(fitTitle);
    ro.observe(parent);

    // Bebas nạp qua @import (async) → `fonts.ready` có thể resolve TRƯỚC khi
    // font về. Fit lại mỗi lần document nạp xong một đợt font, nếu không tỉ lệ
    // scaleX kẹt ở số đo của font fallback (chữ chỉ chiếm ~2/3 cột).
    const refit = () => fitTitle();
    document.fonts?.addEventListener?.('loadingdone', refit);
    void document.fonts?.ready?.then(fitTitle);
    void document.fonts
      ?.load?.(`210px ${BELGO_FONT_DISPLAY}`)
      .then(fitTitle)
      .catch(() => {});
    fitTitle();

    return () => {
      ro.disconnect();
      document.fonts?.removeEventListener?.('loadingdone', refit);
    };
  }, [specsTitle, specsTitleStyleKey]);

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      if (!root || isCanvas) return;

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);
      const blendLayers = gsap.utils.toArray<HTMLElement>(
        '[data-reveal-illustration], [data-reveal-crest]',
        root
      );
      const specsRoot = root.querySelector<HTMLElement>('[data-specs]');
      const specsLayer = root.querySelector<HTMLElement>('[data-specs-layer]');
      const specRows = gsap.utils.toArray<HTMLElement>('[data-spec-row]', root);
      const specParts = gsap.utils.toArray<HTMLElement>(
        '[data-spec-label], [data-spec-value], [data-spec-copy]',
        root
      );

      root.querySelectorAll('img').forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });

      if (reduce) {
        gsap.set(targets, { opacity: 1, y: 0 });
        gsap.set(blendLayers, { y: 0 });
        if (specsLayer) gsap.set(specsLayer, { y: 0 });
        gsap.set(specRows, { autoAlpha: 1, y: 0 });
        gsap.set(specParts, { autoAlpha: 1, y: 0 });
        return;
      }

      /** Khung nhìn hiệu dụng: phần tử scroller (editor) hoặc window (/p). */
      const viewport = () => {
        if (scroller) {
          const r = scroller.getBoundingClientRect();
          return { top: r.top, height: r.height };
        }
        return { top: 0, height: window.innerHeight };
      };

      // Dòng specs — play/reverse theo vị trí thực tế trong khung nhìn. Không
      // dùng ScrollTrigger per-row vì lớp cha đang bị scrub lag dịch chuyển,
      // start/end cache lúc refresh sẽ lệch.
      let checkSpecRows: (() => void) | undefined;

      if (specsRoot && specRows.length) {
        const rowAnims = specRows.map(row => {
          const parts = gsap.utils.toArray<HTMLElement>(
            '[data-spec-label], [data-spec-value], [data-spec-copy]',
            row
          );

          gsap.set(row, { autoAlpha: 0, y: 72 });
          gsap.set(parts, { autoAlpha: 0, y: 36 });

          const tl = gsap
            .timeline({ paused: true })
            .to(row, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power3.out' })
            .to(
              parts,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out',
              },
              0.12
            );

          return { row, tl, visible: false };
        });

        checkSpecRows = () => {
          const vp = viewport();
          const enterLine = vp.height * 0.88;
          const exitLine = vp.height * 0.94;

          rowAnims.forEach(item => {
            const top = item.row.getBoundingClientRect().top - vp.top;

            if (!item.visible && top < enterLine) {
              item.visible = true;
              item.tl.play();
              return;
            }

            // Cuộn ngược lên qua khỏi dòng → reverse để lần sau chạy lại.
            if (item.visible && top >= exitLine) {
              item.visible = false;
              item.tl.reverse();
            }
          });
        };

        ScrollTrigger.create({
          trigger: specsRoot,
          scroller,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: checkSpecRows,
          onRefresh: checkSpecRows,
        });
      }

      // BEVERAGE SPECS — cả khối trôi chậm hơn nhịp cuộn trang.
      if (specsRoot && specsLayer) {
        gsap.fromTo(
          specsLayer,
          { y: () => viewport().height * 0.6 },
          {
            y: () => -viewport().height * 0.45,
            ease: 'none',
            immediateRender: false,
            // Lag scrub còn đang đuổi → kiểm tra lại vị trí các dòng.
            onUpdate: () => checkSpecRows?.(),
            scrollTrigger: {
              trigger: specsRoot,
              scroller,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      gsap.fromTo(
        targets,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: root, scroller, start: 'top 75%' },
        }
      );

      // Lớp blend giữ nguyên opacity/mix-blend từ CSS — chỉ tween translate.
      if (blendLayers.length) {
        gsap.fromTo(
          blendLayers,
          { y: 40 },
          {
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: root, scroller, start: 'top 75%' },
          }
        );
      }
    },
    [isCanvas, isMobile, titleLines.length, specs.length]
  );

  const titleFontSize = isWide
    ? 'clamp(2.5rem, 6.2cqi, 4.5rem)'
    : 'clamp(2.25rem, 7.5cqi, 3.75rem)';

  return (
    <section
      ref={rootRef}
      id='about-product'
      data-canvas-edit={isCanvas ? 'true' : undefined}
      className={cn('@container w-full', className)}
      style={composeStyle(
        {
          backgroundColor: SURFACE,
          ...(patternUrl
            ? {
                backgroundImage: `url('${patternUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'multiply',
              }
            : null),
        },
        blockBackgroundStyle(background)
      )}
    >
      <style>{BELGO_FONT_CSS}</style>

      <div
        className='flex flex-col overflow-hidden'
        style={{
          minHeight: isCanvas ? undefined : '100svh',
          paddingTop: isMobile ? '5rem' : '8rem',
        }}
      >
        {crestUrl ? (
          <div
            data-reveal-crest
            aria-hidden
            className='mx-auto shrink-0'
            style={{
              width: 151,
              maxWidth: '40cqi',
              aspectRatio: '2.69218 / 1',
              filter: 'grayscale(1) saturate(0)',
              mixBlendMode: 'exclusion',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={crestUrl}
              alt={crestAlt}
              data-element-key='crestUrl'
              className={selectableClass(
                activeKey === 'crestUrl',
                'h-full w-full object-contain'
              )}
              style={styleOf('crestUrl')}
              decoding='async'
            />
          </div>
        ) : null}

        <div
          className={cn(
            'mt-8 flex min-h-0 flex-1 flex-col @2xl:mt-16',
            isWide && 'flex-row items-start'
          )}
        >
          <div
            className='shrink-0'
            style={{
              flex: isWide ? '1 1 0%' : undefined,
              paddingLeft: isMobile ? '1.5rem' : '5cqi',
              paddingRight: isMobile ? '1.5rem' : '5cqi',
            }}
          >
            <p
              data-reveal
              data-element-key='eyebrow'
              className={selectableClass(activeKey === 'eyebrow')}
              style={composeStyle(
                {
                  margin: 0,
                  fontFamily: BELGO_FONT_BODY,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: INK,
                },
                styleOf('eyebrow')
              )}
            >
              {eyebrow}
            </p>

            <h2 style={{ margin: 0, marginTop: isMobile ? '1rem' : '1.5rem' }}>
              {titleLines.map((line, i) => {
                const key = `titleLines[${i}]`;
                return (
                  <span
                    key={key}
                    data-reveal
                    data-element-key={key}
                    className={selectableClass(activeKey === key, 'block')}
                    style={composeStyle(
                      {
                        display: 'block',
                        fontFamily: BELGO_FONT_DISPLAY,
                        fontSize: titleFontSize,
                        lineHeight: 0.95,
                        color: INK,
                      },
                      styleOf(key)
                    )}
                  >
                    {line}
                  </span>
                );
              })}
            </h2>

            <p
              data-reveal
              data-element-key='body'
              className={selectableClass(activeKey === 'body')}
              style={composeStyle(
                {
                  marginTop: isMobile ? '1.5rem' : '2rem',
                  marginBottom: 0,
                  maxWidth: '28rem',
                  fontFamily: BELGO_FONT_BODY,
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  lineHeight: 1.625,
                  color: 'rgba(26, 26, 26, 0.85)',
                },
                styleOf('body')
              )}
            >
              {body}
            </p>
          </div>

          {illustrationUrl ? (
            <div
              data-reveal-illustration
              aria-hidden='true'
              className='shrink-0'
              style={{
                width: isWide ? 738 : 'min(100%, 420px)',
                maxWidth: '100%',
                marginLeft: isWide ? 0 : 'auto',
                marginRight: isWide ? 0 : 'auto',
                aspectRatio: '1.4046639231824416 / 1',
                mixBlendMode: 'multiply',
                opacity: 0.5,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={illustrationUrl}
                alt=''
                data-element-key='illustrationUrl'
                className={selectableClass(
                  activeKey === 'illustrationUrl',
                  'h-full w-full object-cover object-center'
                )}
                style={styleOf('illustrationUrl')}
                decoding='async'
                loading='lazy'
              />
            </div>
          ) : null}
        </div>
      </div>

      <div
        data-specs
        className='w-full overflow-hidden'
        style={{
          paddingLeft: isMobile ? '1.5rem' : '5cqi',
          paddingRight: isMobile ? '1.5rem' : '5cqi',
          paddingBottom: isCanvas ? '4rem' : isMobile ? '8rem' : '16rem',
        }}
      >
        <div
          data-specs-layer
          className='mx-auto max-w-7xl will-change-transform'
        >
          <h2
            ref={titleRef}
            data-element-key='specsTitle'
            className={selectableClass(
              activeKey === 'specsTitle',
              'inline-block'
            )}
            style={composeStyle(
              {
                margin: 0,
                maxWidth: 'none',
                whiteSpace: 'nowrap',
                fontFamily: BELGO_FONT_DISPLAY,
                fontSize: isWide
                  ? 'clamp(4rem, 16cqi, 210px)'
                  : 'clamp(2.75rem, 12cqi, 6.5rem)',
                lineHeight: 0.9,
                color: SPECS_RED,
                willChange: 'transform',
              },
              styleOf('specsTitle')
            )}
          >
            {specsTitle}
          </h2>

          <div style={{ marginTop: isMobile ? '2rem' : '3.5rem' }}>
            {specs.map((spec, i) => (
              <div
                key={`belgo-spec-${i}`}
                data-spec-row
                className={cn(
                  'border-t',
                  isWide && 'flex items-start justify-between gap-10'
                )}
                style={{
                  borderTopColor: 'rgba(26, 26, 26, 0.25)',
                  paddingTop: isMobile ? '1.5rem' : '2rem',
                  paddingBottom: isMobile ? '1.5rem' : '2rem',
                }}
              >
                <div style={{ flex: isWide ? '1 1 0%' : undefined }}>
                  <p
                    data-spec-label
                    data-element-key={`specs[${i}].label`}
                    className={selectableClass(
                      activeKey === `specs[${i}].label`,
                      'will-change-transform'
                    )}
                    style={composeStyle(
                      {
                        margin: 0,
                        fontFamily: BELGO_FONT_DISPLAY,
                        fontSize: '0.875rem',
                        letterSpacing: '0.12em',
                        color: INK,
                      },
                      styleOf(`specs[${i}].label`)
                    )}
                  >
                    {spec.label}
                  </p>
                  <p
                    data-spec-value
                    className='will-change-transform'
                    style={{
                      margin: 0,
                      marginTop: '0.75rem',
                      lineHeight: 1,
                    }}
                  >
                    <span
                      data-element-key={`specs[${i}].value`}
                      className={selectableClass(
                        activeKey === `specs[${i}].value`
                      )}
                      style={composeStyle(
                        {
                          fontFamily: BELGO_FONT_DISPLAY,
                          fontSize: 'clamp(3.5rem, 8cqi, 5.5rem)',
                          color: INK,
                        },
                        styleOf(`specs[${i}].value`)
                      )}
                    >
                      {spec.value}
                    </span>
                    {spec.unit ? (
                      <span
                        data-element-key={`specs[${i}].unit`}
                        className={selectableClass(
                          activeKey === `specs[${i}].unit`,
                          'ml-1'
                        )}
                        style={composeStyle(
                          {
                            fontFamily: BELGO_FONT_DISPLAY,
                            fontSize: 'clamp(1.4rem, 3.2cqi, 2.2rem)',
                            letterSpacing: '0.02em',
                            verticalAlign: 'baseline',
                            color: INK,
                          },
                          styleOf(`specs[${i}].unit`)
                        )}
                      >
                        {spec.unit}
                      </span>
                    ) : null}
                  </p>
                </div>

                <p
                  data-spec-copy
                  data-element-key={`specs[${i}].copy`}
                  className={selectableClass(
                    activeKey === `specs[${i}].copy`,
                    'will-change-transform'
                  )}
                  style={composeStyle(
                    {
                      margin: 0,
                      marginTop: isWide ? '0.5rem' : '1rem',
                      maxWidth: isMobile ? 'none' : '24rem',
                      flex: isWide ? '1 1 0%' : undefined,
                      fontFamily: BELGO_FONT_BODY,
                      fontSize: isMobile ? '0.875rem' : '1rem',
                      fontWeight: 600,
                      lineHeight: 1.375,
                      color: INK,
                    },
                    styleOf(`specs[${i}].copy`)
                  )}
                >
                  {spec.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
