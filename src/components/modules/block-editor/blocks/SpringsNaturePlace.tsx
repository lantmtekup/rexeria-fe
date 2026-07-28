'use client';

/**
 * Block "Springs - Nature & Place" — port 2 section pin liền kề của
 * springs-estate-clone: `#nature` rồi `#place` (dòng ~3217-4906 index.html).
 * Mỗi section là 1 STICKY PIN riêng (gốc `.l-nature{clip-path:polygon(0
 * 100vh,...); height:420svh}` / `.l-place-video-container{height:400vh}`) —
 * port sang GSAP ScrollTrigger pin+scrub+clip-path, CÙNG khuôn mẫu
 * `SpringsMap.tsx`: curtain reveal ảnh nền + zoom-out parallax, caption
 * (heading/mô tả) trồi lên muộn.
 *
 * ⚠ Bản gốc dùng WebGL spiral shader (`.l-place-webgl__spiral`, blend-mode
 * overlay) + 3 video Vimeo chained sticky (`l-place-sticky-1/2/3`, mỗi video
 * 1 caption card đổi màu nền) cho phần giữa của Place — NGOÀI PHẠM VI port
 * literal (không dựng WebGL/video runtime mới, đúng nguyên tắc đã áp dụng
 * cho `SpringsWellness`/`SpringsHero`: chỉ port CƠ CHẾ THỊ GIÁC pin+curtain
 * qua GSAP, không copy WebGL/Vimeo/Locomotive gốc). Radial-gradient blob tĩnh
 * xấp xỉ tinh thần "spiral glow" thay cho shader thật.
 *
 * Panel Nature: ảnh nền thiên nhiên full-bleed + heading "Nature" + mô tả.
 * Panel Place: ảnh nền không gian sống full-bleed + heading "Place" + mô tả +
 * caption phụ ("Easy access to Nature Park...", gốc nằm ở section `5.map`
 * liền sau — gộp vào đây theo yêu cầu scope), trồi lên cuối cùng (khớp
 * `.l-map-caption{margin-top:120vh}` — xuất hiện muộn).
 *
 * Font thật bản gốc (Victor Serif / TT Commons Pro) dùng chung hằng số với
 * `SpringsIntro.tsx` (SPRINGS_FONT_SERIF/BODY/CSS) — tránh khai báo lệch giữa
 * các block Springs; @font-face lặp lại giữa block vô hại (browser cache 1
 * lần).
 *
 * Mobile (`useContainerMobile`): bản gốc `is-hidden--md-down` tắt hẳn 2 pin
 * trên mobile. Ở đây GIỮ hiển thị (tĩnh, không pin, xếp chồng dọc như bản
 * trước) — khác biệt có chủ đích so với gốc.
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
import { useContainerMobile } from './useContainerMobile';

interface Props {
  content: SpringsNaturePlaceContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const PANEL_MIN_HEIGHT = 'clamp(560px, 100dvh, 980px)';

/** clip-path đầy đủ / ẩn-dưới-đáy — cùng quy ước `SpringsMap.tsx`. */
const NP_CLIP_FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
const NP_CLIP_HIDDEN_BOTTOM = 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)';

export function SpringsNaturePlace({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isMobile = useContainerMobile(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      if (root.clientWidth > 0 && root.clientWidth < 768) return;

      const stickies = root.querySelectorAll<HTMLElement>(
        '.springs-nature-place-sticky'
      );
      if (!stickies.length) return;

      stickies.forEach(sticky => {
        const wrap = sticky.querySelector<HTMLElement>(
          '.springs-nature-place-clip'
        );
        const imgInner = sticky.querySelector<HTMLElement>(
          '.springs-nature-place-img-inner'
        );
        const heading = sticky.querySelector<HTMLElement>(
          '[data-motion="heading"]'
        );
        const rest = sticky.querySelectorAll<HTMLElement>(
          '[data-motion="body"]'
        );
        const captionLate = sticky.querySelector<HTMLElement>(
          '[data-motion="caption-late"]'
        );

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: sticky.parentElement as HTMLElement,
            scroller,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            pin: sticky,
            pinSpacing: false,
            pinType: 'transform',
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        if (wrap) {
          tl.fromTo(
            wrap,
            { clipPath: NP_CLIP_HIDDEN_BOTTOM },
            { clipPath: NP_CLIP_FULL, duration: 0.3 },
            0
          );
        }
        if (imgInner) {
          tl.fromTo(imgInner, { scale: 1.18 }, { scale: 1, duration: 0.9 }, 0);
        }
        if (heading) {
          tl.fromTo(
            heading,
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 0.2 },
            0.22
          );
        }
        if (rest.length) {
          tl.fromTo(
            rest,
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: 0.18, stagger: 0.08 },
            0.3
          );
        }
        if (captionLate) {
          tl.fromTo(
            captionLate,
            { autoAlpha: 0, yPercent: 25 },
            { autoAlpha: 1, yPercent: 0, duration: 0.2 },
            0.68
          );
        }
      });

      root.querySelectorAll('img').forEach(img => {
        if (!(img as HTMLImageElement).complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });
    },
    [isMobile]
  );

  const natureCaption = (
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
  );

  const placeCaptionBlock = (
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
          data-motion='caption-late'
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
  );

  const renderImage = (
    key: 'natureImage' | 'placeImage',
    src: string,
    alt: string,
    scrimGradient: string
  ) => (
    <React.Fragment>
      {src ? (
        <div
          data-element-key={key}
          className={selectableClass(
            activeKey === key,
            'springs-nature-place-img-inner absolute inset-0'
          )}
          style={styleOf(key)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            aria-hidden='true'
            className='h-full w-full object-cover'
          />
        </div>
      ) : null}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0'
        style={{ background: scrimGradient }}
      />
    </React.Fragment>
  );

  const natureScrim =
    'linear-gradient(180deg, rgba(10,14,8,0.05) 0%, rgba(10,14,8,0.2) 55%, rgba(10,14,8,0.7) 100%)';
  const placeScrim =
    'linear-gradient(180deg, rgba(10,14,8,0.05) 0%, rgba(10,14,8,0.22) 55%, rgba(10,14,8,0.72) 100%)';

  // ── Mobile: gốc ẩn hẳn (`is-hidden--md-down`) — ở đây giữ tĩnh, xếp chồng. ─
  if (isMobile) {
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

        <div
          className='relative flex w-full items-end overflow-hidden'
          style={{ minHeight: PANEL_MIN_HEIGHT }}
        >
          {renderImage(
            'natureImage',
            content.natureImage,
            content.natureHeading || 'Nature',
            natureScrim
          )}
          {natureCaption}
        </div>

        <div
          className='relative flex w-full items-end overflow-hidden'
          style={{ minHeight: PANEL_MIN_HEIGHT }}
        >
          {renderImage(
            'placeImage',
            content.placeImage,
            content.placeHeading || 'Place',
            placeScrim
          )}
          {placeCaptionBlock}
        </div>
      </section>
    );
  }

  // ── Desktop: 2 sticky pin nối tiếp (Nature → Place), curtain reveal. ─────
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

      <div style={{ height: '300vh', position: 'relative' }}>
        <div className='springs-nature-place-sticky relative h-[100svh] w-full overflow-hidden'>
          <div
            className='springs-nature-place-clip absolute inset-0'
            style={{ clipPath: NP_CLIP_HIDDEN_BOTTOM }}
          >
            {renderImage(
              'natureImage',
              content.natureImage,
              content.natureHeading || 'Nature',
              natureScrim
            )}
            <div className='absolute inset-0 flex items-end'>
              {natureCaption}
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: '300vh', position: 'relative' }}>
        <div className='springs-nature-place-sticky relative h-[100svh] w-full overflow-hidden'>
          <div
            className='springs-nature-place-clip absolute inset-0'
            style={{ clipPath: NP_CLIP_HIDDEN_BOTTOM }}
          >
            {renderImage(
              'placeImage',
              content.placeImage,
              content.placeHeading || 'Place',
              placeScrim
            )}
            <div className='absolute inset-0 flex items-end'>
              {placeCaptionBlock}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
