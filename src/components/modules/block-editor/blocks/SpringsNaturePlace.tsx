'use client';

/**
 * Block "Springs - Nature & Place" (gộp 2 slide sticky-scroll liền kề của
 * springs-estate-clone: `#nature` rồi `#place`, dòng 3217-4906 index.html).
 *
 * Bản gốc dùng sticky-scroll pinning phức tạp (webgl canvas, parallax layer
 * theo data-parallax-*) cho cả 2 slide — ở đây rút gọn thành 2 panel full-bleed
 * XẾP CHỒNG THEO CHIỀU DỌC (Nature trước, Place sau), mỗi panel tự reveal khi
 * cuộn tới (không replicate cơ chế pin gốc — đúng phạm vi yêu cầu).
 *
 * Panel Nature: ảnh nền thiên nhiên full-bleed + heading "Nature" + mô tả.
 * Panel Place: ảnh nền không gian sống full-bleed + heading "Place" + mô tả +
 * caption phụ ("Easy access to Nature Park...", gốc nằm ở section `5.map`
 * liền sau — gộp vào đây theo yêu cầu scope).
 *
 * Font thật bản gốc (Victor Serif / TT Commons Pro) dùng chung hằng số với
 * `SpringsIntro.tsx` (SPRINGS_FONT_SERIF/BODY/CSS) — tránh khai báo lệch giữa
 * các block Springs; @font-face lặp lại giữa block vô hại (browser cache 1
 * lần).
 *
 * Motion: mỗi panel có ScrollTrigger RIÊNG (heading fade+rise trước, mô tả/
 * caption fade+rise stagger sau) — `scroller` qua useBlockMotion (R1-R6),
 * `toggleActions: 'play none none reverse'`, tôn trọng prefers-reduced-motion.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpringsNaturePlaceContent,
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
  SPRINGS_FONT_BODY,
  SPRINGS_FONT_CSS,
  SPRINGS_FONT_SERIF,
} from './SpringsIntro';

interface Props {
  content: SpringsNaturePlaceContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const PANEL_MIN_HEIGHT = 'clamp(560px, 100dvh, 980px)';

export function SpringsNaturePlace({
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

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root) return;
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (reduce) return;

      const panels = root.querySelectorAll<HTMLElement>(
        '.springs-nature-place-panel'
      );
      panels.forEach(panel => {
        const heading = panel.querySelector<HTMLElement>(
          '[data-motion="heading"]'
        );
        const rest = panel.querySelectorAll<HTMLElement>(
          '[data-motion="body"]'
        );

        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: panel,
            scroller,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        });

        if (heading) {
          tl.from(heading, { autoAlpha: 0, y: 44, duration: 0.9 }, 0);
        }
        if (rest.length) {
          tl.from(
            rest,
            { autoAlpha: 0, y: 28, duration: 0.8, stagger: 0.12 },
            0.18
          );
        }
      });
    },
    []
  );

  return (
    <section
      ref={rootRef}
      style={composeStyle(
        { background: '#12160f' },
        blockBackgroundStyle(background)
      )}
      className='springs-nature-place @container relative w-full'
    >
      <style>{SPRINGS_FONT_CSS}</style>

      {/* Panel 1 — Nature */}
      <div
        className='springs-nature-place-panel springs-nature-place-nature-panel relative flex w-full items-end overflow-hidden'
        style={{ minHeight: PANEL_MIN_HEIGHT }}
      >
        {content.natureImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            data-element-key='natureImage'
            src={content.natureImage}
            alt={content.natureHeading || 'Nature'}
            className={selectableClass(
              activeKey === 'natureImage',
              'springs-nature-place-nature-img absolute inset-0 h-full w-full'
            )}
            style={composeStyle(
              { objectFit: 'cover', objectPosition: 'center' },
              styleOf('natureImage')
            )}
          />
        ) : null}
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'linear-gradient(180deg, rgba(10,14,8,0.05) 0%, rgba(10,14,8,0.2) 55%, rgba(10,14,8,0.7) 100%)',
          }}
        />

        <div
          className='relative z-[1] w-full'
          style={{
            padding:
              'clamp(28px, 5cqi, 64px) clamp(24px, 6cqi, 96px) clamp(48px, 8cqi, 96px)',
          }}
        >
          <h2
            data-element-key='natureHeading'
            data-motion='heading'
            className={selectableClass(activeKey === 'natureHeading')}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: SPRINGS_FONT_SERIF,
                fontWeight: 400,
                fontSize: 'clamp(40px, 8cqi, 96px)',
                lineHeight: 1.05,
                color: '#f6f5ee',
              },
              styleOf('natureHeading')
            )}
          >
            {content.natureHeading}
          </h2>

          {content.natureDescription ? (
            <p
              data-element-key='natureDescription'
              data-motion='body'
              className={selectableClass(
                activeKey === 'natureDescription',
                'springs-nature-place-nature-desc'
              )}
              style={composeStyle(
                {
                  margin: 0,
                  marginTop: 'clamp(16px, 2.4cqi, 28px)',
                  maxWidth: '46ch',
                  fontFamily: SPRINGS_FONT_BODY,
                  fontWeight: 400,
                  fontSize: 'clamp(15px, 1.7cqi, 19px)',
                  lineHeight: 1.55,
                  color: 'rgba(246,245,238,0.86)',
                },
                styleOf('natureDescription')
              )}
            >
              {content.natureDescription}
            </p>
          ) : null}
        </div>
      </div>

      {/* Panel 2 — Place */}
      <div
        className='springs-nature-place-panel springs-nature-place-place-panel relative flex w-full items-end overflow-hidden'
        style={{ minHeight: PANEL_MIN_HEIGHT }}
      >
        {content.placeImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            data-element-key='placeImage'
            src={content.placeImage}
            alt={content.placeHeading || 'Place'}
            className={selectableClass(
              activeKey === 'placeImage',
              'springs-nature-place-place-img absolute inset-0 h-full w-full'
            )}
            style={composeStyle(
              { objectFit: 'cover', objectPosition: 'center' },
              styleOf('placeImage')
            )}
          />
        ) : null}
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'linear-gradient(180deg, rgba(10,14,8,0.05) 0%, rgba(10,14,8,0.22) 55%, rgba(10,14,8,0.72) 100%)',
          }}
        />

        <div
          className='relative z-[1] flex w-full flex-col items-end text-right'
          style={{
            padding:
              'clamp(28px, 5cqi, 64px) clamp(24px, 6cqi, 96px) clamp(48px, 8cqi, 96px)',
          }}
        >
          <h2
            data-element-key='placeHeading'
            data-motion='heading'
            className={selectableClass(activeKey === 'placeHeading')}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: SPRINGS_FONT_SERIF,
                fontWeight: 400,
                fontSize: 'clamp(40px, 8cqi, 96px)',
                lineHeight: 1.05,
                color: '#f6f5ee',
              },
              styleOf('placeHeading')
            )}
          >
            {content.placeHeading}
          </h2>

          {content.placeDescription ? (
            <p
              data-element-key='placeDescription'
              data-motion='body'
              className={selectableClass(
                activeKey === 'placeDescription',
                'springs-nature-place-place-desc'
              )}
              style={composeStyle(
                {
                  margin: 0,
                  marginTop: 'clamp(16px, 2.4cqi, 28px)',
                  maxWidth: '46ch',
                  fontFamily: SPRINGS_FONT_BODY,
                  fontWeight: 400,
                  fontSize: 'clamp(15px, 1.7cqi, 19px)',
                  lineHeight: 1.55,
                  color: 'rgba(246,245,238,0.86)',
                },
                styleOf('placeDescription')
              )}
            >
              {content.placeDescription}
            </p>
          ) : null}

          {content.placeCaption ? (
            <p
              data-element-key='placeCaption'
              data-motion='body'
              className={selectableClass(
                activeKey === 'placeCaption',
                'springs-nature-place-caption'
              )}
              style={composeStyle(
                {
                  margin: 0,
                  marginTop: 'clamp(24px, 3.6cqi, 40px)',
                  paddingTop: 'clamp(16px, 2.4cqi, 24px)',
                  maxWidth: '38ch',
                  borderTop: '1px solid rgba(246,245,238,0.35)',
                  fontFamily: SPRINGS_FONT_BODY,
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 'clamp(13px, 1.4cqi, 16px)',
                  lineHeight: 1.5,
                  color: 'rgba(246,245,238,0.68)',
                },
                styleOf('placeCaption')
              )}
            >
              {content.placeCaption}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
