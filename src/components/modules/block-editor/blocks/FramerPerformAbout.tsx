'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerPerformAboutContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerPerformAboutProps {
  content: FramerPerformAboutContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Framer Perform About — nền đen, section cao 100dvh, bên trong stage sticky.
 *
 * Cơ chế:
 *  - Section lớn = 100dvh + (n-1)*imageHeight. Trong khi section cuộn qua
 *    ScrollTrigger, stage (100dvh, sticky top:0) đứng yên trong viewport →
 *    user thấy "text trượt qua" trong khi section di chuyển.
 *  - Text-col là viewport con (overflow:hidden, height = 100% stage) chứa n
 *    text xếp chồng (absolute). Text A đặt cao hơn giữa viewport một chút
 *    (top ~38% thay vì 50% — yêu cầu "cao hơn giữa section một chút").
 *    Mỗi text tiếp theo cách Text A đúng 1 SLOT = imageHeight (chiều cao
 *    ảnh) → khi scrub đều, text B trồi lên từ dưới viewport vào đúng vị trí
 *    Text A, lặp lại cho C/D...
 *  - Image-col: ảnh vuông cố định (aspect-ratio 1/1), ảnh A hiện đầu tiên;
 *    B/C xếp dưới (opacity 0 + scale 1.08 chờ reveal). Khi text B đi vào
 *    giữa viewport thì ảnh đổi A → B (image swap tại giữa mỗi segment).
 *  - GSAP timeline + scrub: 1 tween text duy nhất kéo đều (ease:none,
 *    duration:n-1) từ initialY → initialY - (n-1)*SLOT. Image chuyển tại
 *    GIỮA mỗi segment (50% local timeline) → "text nào xuất hiện trong
 *    viewport thì ảnh đổi thành ảnh tương ứng".
 *  - Không dùng GSAP `pin` (gây giật iOS) — dùng CSS `position: sticky` cho
 *    lớp giữ màn hình, GSAP chỉ scrub timeline theo scroll.
 *  - Reduced-motion: rail về auto height, stage về static, text + image xếp
 *    chồng theo thứ tự (GSAP bail).
 */

const TEXT_HIGHLIGHT_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(20px, 3cqi, 32px)',
  fontWeight: 500,
  lineHeight: 1.28,
  letterSpacing: '-0.015em',
  color: '#ffffff',
};

const TEXT_REST_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(20px, 3cqi, 32px)',
  fontWeight: 500,
  lineHeight: 1.28,
  letterSpacing: '-0.015em',
  color: 'rgb(153, 153, 153)',
};

export function FramerPerformAbout({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerPerformAboutProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const testimonials: Array<{
    imageUrl: string;
    textHighlight: string;
    textRest: string;
  }> = Array.isArray(content.testimonials) ? content.testimonials : [];

  React.useLayoutEffect(() => {
    const rail = rootRef.current;
    if (!rail) return;
    const imageCol = rail.querySelector<HTMLElement>('.fpa-image-col');
    if (!imageCol) return;
    if (typeof window === 'undefined') return;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const apply = () => {
      if (reduceMotion) {
        rail.style.height = 'auto';
        return;
      }
      const stage = rail.querySelector<HTMLElement>('.fpa-stage');
      const stageHidden =
        stage && window.getComputedStyle(stage).display === 'none';
      if (stageHidden) {
        rail.style.height = 'auto';
        return;
      }
      const ih = imageCol.offsetHeight;
      rail.style.height = `calc(100dvh + ${ih * Math.max(testimonials.length - 1, 0)}px)`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(imageCol);
    // Observe cả stage để re-apply khi container width đổi (mobile ↔ desktop).
    const stage = rail.querySelector<HTMLElement>('.fpa-stage');
    if (stage) ro.observe(stage);
    window.addEventListener('resize', apply);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', apply);
    };
  }, [testimonials.length]);

  useBlockMotion(rootRef, ({ scroller }) => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduceMotion) return; // CSS @media reduced-motion lo layout dọc

    const textEls = gsap.utils.toArray<HTMLElement>('.fpa-text', root);
    const imageEls = gsap.utils.toArray<HTMLElement>('.fpa-image', root);
    const n = textEls.length;
    if (n < 2 || n !== imageEls.length) return;

    const imageCol = root.querySelector<HTMLElement>('.fpa-image-col');
    if (!imageCol) return;
    const imageHeight = imageCol.offsetHeight;
    if (imageHeight <= 0) return;
    const SLOT = imageHeight;

    const INITIAL_TOP_PERCENT = 38;
    textEls.forEach((el, i) => {
      const yPx = i * SLOT;
      gsap.set(el, {
        autoAlpha: 1,
        y: yPx,
      });
    });
    const textCol = root.querySelector<HTMLElement>('.fpa-text-col');
    if (textCol) {
      textCol.style.setProperty(
        '--fpa-text-top-pct',
        `${INITIAL_TOP_PERCENT}%`
      );
    }

    imageEls.forEach((img, i) => {
      if (i === 0) {
        gsap.set(img, { autoAlpha: 1, scale: 1, zIndex: 3 });
      } else {
        gsap.set(img, { autoAlpha: 0, scale: 1.08, zIndex: 2 - i });
      }
    });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root,
        scroller,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });

    const totalYShift = -(n - 1) * SLOT;
    tl.to(textEls, { y: `+=${totalYShift}`, duration: n - 1, ease: 'none' }, 0);

    const swapDur = Math.min(0.4, (n - 1) / (n - 1) / 2);
    for (let i = 1; i < n; i++) {
      const swapAt = i - swapDur;
      tl.to(
        imageEls[i - 1],
        {
          autoAlpha: 0,
          scale: 0.92,
          duration: swapDur,
          zIndex: 0,
          ease: 'power2.in',
        },
        swapAt
      );
      tl.fromTo(
        imageEls[i],
        { autoAlpha: 0, scale: 1.08, zIndex: 3 },
        { autoAlpha: 1, scale: 1, duration: swapDur, ease: 'power2.out' },
        swapAt
      );
    }
  });

  return (
    <div
      ref={rootRef}
      data-block='framer-perform-about'
      style={{
        ...blockBackgroundStyle(background),
        height: '100dvh',
      }}
      className={cn('fpa-rail @container relative w-full bg-black', className)}
    >
      <div
        className='fpa-stage mx-auto w-[90%] @3xl:w-[80%] @4xl:w-[70%]'
        style={{
          position: 'sticky',
          top: 0,
          height: '100dvh',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 'clamp(24px, 4cqi, 64px)',
          alignItems: 'center',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <div
          className='fpa-text-col'
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: 200,
            overflow: 'hidden',
          }}
        >
          {testimonials.map((item, idx) => (
            <p
              key={idx}
              data-element-key={`testimonials[${idx}].textHighlight`}
              style={composeStyle(
                {
                  position: 'absolute',
                  top: `var(--fpa-text-top-pct, 38%)`,
                  left: 0,
                  right: 0,
                  maxWidth: 640,
                  paddingRight: 'clamp(16px, 2cqi, 40px)',
                  margin: 0,
                  willChange: 'transform, opacity',
                },
                styleOf(`testimonials[${idx}].textHighlight`)
              )}
              className={cn(
                'fpa-text',
                selectableClass(
                  activeKey === `testimonials[${idx}].textHighlight`
                )
              )}
            >
              <span style={TEXT_HIGHLIGHT_STYLE}>{item.textHighlight}</span>
              {item.textRest && (
                <>
                  {' '}
                  <span style={TEXT_REST_STYLE}>{item.textRest}</span>
                </>
              )}
            </p>
          ))}
        </div>

        <div
          className='fpa-image-col w-[90%] @3xl:w-full @4xl:w-[80%]'
          style={{
            position: 'relative',
            height: '100%',
            maxHeight: 600,
            justifySelf: 'end',
            paddingRight: '4px',
          }}
        >
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              data-element-key={`testimonials[${idx}].imageUrl`}
              style={composeStyle(
                item.imageUrl
                  ? {
                      backgroundImage: `url("${item.imageUrl.replace(/"/g, '%22')}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : { backgroundColor: '#111111' },
                {
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 16,
                  overflow: 'hidden',
                  willChange: 'transform, opacity',
                },
                styleOf(`testimonials[${idx}].imageUrl`)
              )}
              className={cn(
                'fpa-image',
                selectableClass(activeKey === `testimonials[${idx}].imageUrl`)
              )}
            />
          ))}
        </div>
      </div>

      <div className='fpa-pairs'>
        {testimonials.map((item, idx) => (
          <div
            key={idx}
            className='fpa-pair'
            data-element-key={`testimonials[${idx}]`}
          >
            <div
              data-element-key={`testimonials[${idx}].imageUrl`}
              style={composeStyle(
                item.imageUrl
                  ? {
                      backgroundImage: `url("${item.imageUrl.replace(/"/g, '%22')}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : { backgroundColor: '#111111' },
                {
                  width: '100%',
                  aspectRatio: '4 / 3',
                  borderRadius: 16,
                  overflow: 'hidden',
                },
                styleOf(`testimonials[${idx}].imageUrl`)
              )}
              className={cn(
                selectableClass(activeKey === `testimonials[${idx}].imageUrl`)
              )}
            />
            <p
              data-element-key={`testimonials[${idx}].textHighlight`}
              style={composeStyle(
                {
                  maxWidth: 640,
                  paddingRight: 'clamp(16px, 2cqi, 40px)',
                  margin: 0,
                },
                styleOf(`testimonials[${idx}].textHighlight`)
              )}
              className={cn(
                selectableClass(
                  activeKey === `testimonials[${idx}].textHighlight`
                )
              )}
            >
              <span style={TEXT_HIGHLIGHT_STYLE}>{item.textHighlight}</span>
              {item.textRest && (
                <>
                  {' '}
                  <span style={TEXT_REST_STYLE}>{item.textRest}</span>
                </>
              )}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        /* Desktop: ẩn mobile-only pair list. */
        .fpa-pairs {
          display: none;
        }
        @container (max-width: 809px) {
          /* Mobile/tablet: ẩn stage desktop (2-col + GSAP animation), hiện
             stack dọc các pair (image trên + text dưới). Rail về auto
             height, không animation, không sticky. */
          .fpa-rail {
            height: auto !important;
          }
          .fpa-stage {
            display: none !important;
          }
          .fpa-pairs {
            display: flex !important;
            flex-direction: column !important;
            gap: clamp(100px, 12cqi, 140px) !important;
            padding: clamp(64px, 10cqi, 120px) clamp(16px, 3cqi, 32px)
              clamp(64px, 10cqi, 120px) !important;
          }
          .fpa-pair {
            display: flex !important;
            flex-direction: column !important;
            gap: clamp(16px, 3cqi, 28px) !important;
          }
          .fpa-pair > p {
            margin: 0 !important;
            max-width: 640 !important;
          }
        }
        /* Reduced-motion: bỏ pinned deck — rail về auto height, stage về
           luồng dọc, text + image xếp chồng theo thứ tự. GSAP đã bail. */
        @media (prefers-reduced-motion: reduce) {
          .fpa-rail {
            height: auto !important;
          }
          .fpa-stage {
            display: none !important;
          }
          .fpa-pairs {
            display: flex !important;
            flex-direction: column !important;
            gap: clamp(40px, 7cqi, 72px) !important;
            padding: clamp(80px, 12cqi, 140px) clamp(16px, 3cqi, 40px)
              clamp(80px, 12cqi, 140px) !important;
          }
          .fpa-pair {
            display: flex !important;
            flex-direction: column !important;
            gap: clamp(16px, 3cqi, 28px) !important;
          }
          .fpa-pair > p {
            margin: 0 !important;
            max-width: 640 !important;
          }
        }
      `}</style>
    </div>
  );
}
