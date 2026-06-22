'use client';

/**
 * Data-block "Framer · Darling Timeline" (port từ 360-admin-cms
 * framer-darling-timeline — clone darling.framer.website "The Day").
 *
 * Timeline 2 cột zig-zag: header căn giữa (heading + intro); cột sống dọc giữa
 * với chấm tròn mỗi mốc; item lẻ bên phải, item chẵn bên trái — mỗi item có
 * giờ, tên (serif), mô tả, ảnh.
 *
 * Contract nền GSAP (R1–R6): BỎ framer-motion hoàn toàn.
 * - Spine fill: source dùng framer-motion useScroll/useTransform (height 0→100%)
 *   → CHUYỂN sang GSAP ScrollTrigger scrub (scaleY 0→1, endTrigger = item cuối),
 *   giống MintV2Process .process-line.
 * - Header + item entrance (slide-in trái/phải): gsap.fromTo + toggleActions.
 * - @container query (@2xl) thay md:/lg:. data-element-key + styleOf cho mỗi
 *   element; mảng items → data-element-key 'items'. Ảnh: div backgroundImage.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerDarlingTimelineContent,
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
  content: FramerDarlingTimelineContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: '"Libre Caslon Condensed", Georgia, serif',
  fontWeight: 400,
  fontSize: 'clamp(40px, 7cqi, 110px)',
  letterSpacing: '-0.02em',
  lineHeight: 1.05,
  margin: '0 0 clamp(16px, 2.5cqi, 36px)',
  color: '#1f1d14',
};

const INTRO_STYLE: React.CSSProperties = {
  fontFamily: '"Libre Caslon Condensed", "Libre Caslon Text", Georgia, serif',
  fontSize: 'clamp(15px, 1.4cqi, 20px)',
  lineHeight: 1.55,
  color: 'rgba(31,29,20,0.7)',
  margin: '0 auto',
  maxWidth: 560,
};

const TIME_STYLE: React.CSSProperties = {
  fontSize: 'clamp(12px, 1.05cqi, 16px)',
  letterSpacing: '0.04em',
  color: 'rgba(31,29,20,0.7)',
  margin: '0 0 clamp(10px, 1.5cqi, 20px)',
  fontFamily: '"Libre Caslon Condensed", Georgia, serif',
};

const TITLE_STYLE: React.CSSProperties = {
  fontFamily: '"Libre Caslon Condensed", Georgia, serif',
  fontWeight: 400,
  fontSize: 'clamp(28px, 4.2cqi, 64px)',
  letterSpacing: '-0.01em',
  lineHeight: 1.05,
  margin: '0 0 clamp(12px, 2cqi, 28px)',
  color: '#1f1d14',
};

const DESC_STYLE: React.CSSProperties = {
  fontFamily: '"Libre Caslon Condensed", "Libre Caslon Text", Georgia, serif',
  fontSize: 'clamp(13px, 1.25cqi, 18px)',
  lineHeight: 1.55,
  color: 'rgba(31,29,20,0.78)',
  margin: '0 0 clamp(20px, 3cqi, 44px)',
  maxWidth: '44ch',
};

export function FramerDarlingTimeline({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const items = Array.isArray(content.items) ? content.items : [];
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(rootRef, ({ scroller }) => {
    const root = rootRef.current;
    if (!root) return;

    // Spine fill — was framer-motion useScroll → useTransform(height 0→100%).
    // Now GSAP ScrollTrigger scrub: scaleY 0→1, endTrigger = last row (giống
    // MintV2Process .process-line). transformOrigin top để fill chảy từ trên.
    const fill = root.querySelector<HTMLElement>('.darling-spine-fill');
    const lastRow = root.querySelector<HTMLElement>('.darling-row:last-child');
    if (fill) {
      gsap.fromTo(
        fill,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 65%',
            endTrigger: lastRow ?? root,
            end: lastRow ? 'bottom center' : 'bottom 75%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        }
      );
    }

    // Header entrance — fade-up.
    const header = root.querySelector<HTMLElement>('.darling-header');
    if (header) {
      gsap.fromTo(
        header,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: header,
            scroller,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    }

    // Item entrance — slide-in từ bên phải (item phải) / bên trái (item trái).
    gsap.utils.toArray<HTMLElement>('.darling-row', root).forEach(row => {
      const dir = row.dataset.side === 'right' ? 60 : -60;
      gsap.fromTo(
        row,
        { opacity: 0, x: dir },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: row,
            scroller,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    });
  });

  return (
    <section
      ref={rootRef}
      style={{
        position: 'relative',
        color: '#1f1d14',
        fontFamily:
          '"Libre Caslon Condensed", "Libre Caslon Text", Georgia, serif',
        ...blockBackgroundStyle(background),
      }}
      className='darling-timeline @container relative w-full overflow-hidden bg-[#f4eed8]'
    >
      <div
        style={{
          padding:
            'clamp(80px, 12cqi, 200px) clamp(20px, 5cqi, 80px) clamp(100px, 14cqi, 240px)',
        }}
      >
        {/* Header */}
        <div
          className='darling-header'
          style={{
            maxWidth: 720,
            margin: '0 auto clamp(60px, 12cqi, 180px)',
            textAlign: 'center',
          }}
        >
          <h2
            data-element-key='heading'
            style={composeStyle(HEADING_STYLE, styleOf('heading'))}
            className={selectableClass(activeKey === 'heading')}
          >
            {content.heading}
          </h2>
          <p
            data-element-key='intro'
            style={composeStyle(INTRO_STYLE, styleOf('intro'))}
            className={selectableClass(activeKey === 'intro')}
          >
            {content.intro}
          </p>
        </div>

        {/* Timeline stage */}
        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          {/* Vertical spine — base (light) layer */}
          <div
            aria-hidden
            className='absolute top-0 bottom-0 left-2 w-px @2xl:left-1/2 @2xl:-translate-x-1/2'
            style={{ background: 'rgba(31,29,20,0.18)', pointerEvents: 'none' }}
          />
          {/* Spine fill overlay — scaleY grows with scroll (GSAP scrub) */}
          <div
            aria-hidden
            className='darling-spine-fill absolute top-0 bottom-0 left-2 w-px @2xl:left-1/2 @2xl:-translate-x-1/2'
            style={{
              background: 'rgba(31,29,20,0.75)',
              transform: 'scaleY(0)',
              transformOrigin: 'top center',
              pointerEvents: 'none',
              willChange: 'transform',
            }}
          />

          <div data-element-key='items'>
            {items.map((item, idx) => {
              const isRight = idx % 2 === 0; // first item on right (matches source)
              return (
                <div
                  key={idx}
                  data-side={isRight ? 'right' : 'left'}
                  className='darling-row relative grid grid-cols-1 gap-0 pl-10 @2xl:grid-cols-2 @2xl:gap-[clamp(40px,5cqi,80px)] @2xl:pl-0'
                  style={{
                    paddingBottom:
                      idx < items.length - 1 ? 'clamp(56px, 10cqi, 160px)' : 0,
                  }}
                >
                  {/* Dot on spine */}
                  <span
                    aria-hidden
                    className='absolute top-0 left-2 z-[1] h-[11px] w-[11px] -translate-x-1/2 rounded-full @2xl:left-1/2'
                    style={{
                      background: '#1f1d14',
                      transform: 'translate(-50%, -2px)',
                    }}
                  />

                  {/* Content side — right on even (0,2,4…), left on odd */}
                  <div
                    className={
                      isRight
                        ? 'flex flex-col items-start text-left @2xl:col-[2/3] @2xl:pl-[clamp(20px,3cqi,56px)]'
                        : 'flex flex-col items-start text-left @2xl:col-[1/2] @2xl:items-end @2xl:pr-[clamp(20px,3cqi,56px)] @2xl:text-right'
                    }
                  >
                    <p
                      data-element-key={`items.${idx}.time`}
                      style={composeStyle(
                        TIME_STYLE,
                        styleOf(`items.${idx}.time`)
                      )}
                      className={selectableClass(
                        activeKey === `items.${idx}.time`
                      )}
                    >
                      {item.time}
                    </p>
                    <h3
                      data-element-key={`items.${idx}.title`}
                      style={composeStyle(
                        TITLE_STYLE,
                        styleOf(`items.${idx}.title`)
                      )}
                      className={selectableClass(
                        activeKey === `items.${idx}.title`
                      )}
                    >
                      {item.title}
                    </h3>
                    <p
                      data-element-key={`items.${idx}.description`}
                      style={composeStyle(
                        DESC_STYLE,
                        styleOf(`items.${idx}.description`)
                      )}
                      className={selectableClass(
                        activeKey === `items.${idx}.description`
                      )}
                    >
                      {item.description}
                    </p>

                    {/* Image — div backgroundImage, không dùng <img> */}
                    <div
                      data-element-key={`items.${idx}.imageUrl`}
                      style={composeStyle(
                        item.imageUrl
                          ? {
                              backgroundImage: `url("${item.imageUrl.replace(/"/g, '%22')}")`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }
                          : { background: '#d8d2bc' },
                        {
                          width: '100%',
                          maxWidth: 540,
                          aspectRatio: '4 / 3',
                          overflow: 'hidden',
                        },
                        styleOf(`items.${idx}.imageUrl`)
                      )}
                      className={selectableClass(
                        activeKey === `items.${idx}.imageUrl`
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
