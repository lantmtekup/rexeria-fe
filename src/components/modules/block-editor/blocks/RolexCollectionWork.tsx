'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

import { useBlockMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  RolexCollectionWorkContent,
  RolexCollectionWorkStage,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { FONT_BODY, FONT_CSS, FONT_HEADING } from './rolexFonts';

interface Props {
  content: RolexCollectionWorkContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const STAGE_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100dvh',
  overflow: 'hidden',
  isolation: 'isolate',
};

// 1 scroll ≈ 50px sẽ active đúng 1 item kế tiếp — cố định theo px tuyệt đối
// (không theo %) để không phụ thuộc chiều cao viewport.
const SCROLL_PX_PER_STAGE = 50;

const CTA_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: 344,
  transform: 'translateX(-50%)',
  margin: 0,
  fontFamily: FONT_BODY,
  fontWeight: 400,
  color: '#ffffff',
  textAlign: 'center',
  zIndex: 30,
};

const watchDepthForDistance = (distance: number): number => {
  if (distance === 0) return 0;
  const magnitude = 200 + 50 * Math.abs(distance);
  return distance > 0 ? -magnitude : magnitude;
};

const DEFAULT_STAGES: RolexCollectionWorkStage[] = [
  {
    title: 'OYSTER',
    imageUrl: '/rolex-collection/watch-oyster.webp',
  },
  {
    title: 'PERPETUAL',
    backgroundColor: '#cc1d1d',
    imageUrl: '/rolex-collection/watch-perpetual.webp',
  },
  {
    title: 'DAYTONA',
    backgroundColor: '#743dff',
    imageUrl: '/rolex-collection/watch-daytona.webp',
  },
  {
    title: 'SUBMARINER',
    backgroundColor: '#1bcc82',
    imageUrl: '/rolex-collection/watch-submariner.webp',
  },
  {
    title: 'SEA DWELER',
    backgroundColor: '#ff8e3d',
    imageUrl: '/rolex-collection/watch-seadweller.webp',
  },
  {
    title: 'DEEP SEA',
    backgroundColor: '#ff8080',
    imageUrl: '/rolex-collection/watch-deepsea.webp',
  },
  {
    title: 'GMT MASTER',
    backgroundColor: '#1d45cc',
    imageUrl: '/rolex-collection/watch-gmtmaster.webp',
  },
];

const resolveStages = (
  raw: RolexCollectionWorkStage[] | undefined
): RolexCollectionWorkStage[] => {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_STAGES;
  return raw.map((stage, i) => {
    const fallback = DEFAULT_STAGES[i] ?? DEFAULT_STAGES[0];
    return {
      title: stage.title?.trim() || fallback.title,
      backgroundColor: stage.backgroundColor?.trim() || undefined,
      imageUrl: stage.imageUrl?.trim() || fallback.imageUrl,
    };
  });
};

export function RolexCollectionWork({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const stages = React.useMemo(
    () => resolveStages(content.stages),
    [content.stages]
  );

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      const stage = stageRef.current;
      if (!root || !stage || isCanvas) return;

      const layers = gsap.utils.toArray<HTMLElement>('[data-rcw-layer]', stage);
      const swings = gsap.utils.toArray<HTMLElement>('[data-rcw-swing]', stage);
      const titles = gsap.utils.toArray<HTMLElement>('[data-rcw-title]', stage);
      if (!layers.length) return;

      const containers = swings.map(
        swing => swing.querySelector<HTMLElement>('[data-rcw-container]')!
      );
      const images = swings.map(
        swing => swing.querySelector<HTMLElement>('[data-rcw-image]')!
      );

      stage.querySelectorAll('img').forEach(img => {
        if (!(img as HTMLImageElement).complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const splits = titles.map(title =>
        title ? new SplitType(title, { types: 'chars' }) : null
      );

      const stageCount = layers.length;
      const lastStage = stageCount - 1;
      // Đối chiếu trực tiếp với capable-seat-351062.framer.app/work (giải mã
      // ma trận transform thật của cả 7 project): "Image Container" xoay
      // CÙNG DẤU với wrapper ngoài (không triệt tiêu về 0) — item "future"
      // bão hòa về -90, item "past" bão hòa về +90. Site mẫu KHÔNG có công
      // thức width nào cả (container width cố định) — cỡ to/nhỏ giữa các
      // item hoàn toàn là hệ quả tự nhiên của rotateX thật (chỉ nén chiều
      // cao, chiều rộng không đổi) kết hợp z-depth tăng dần theo khoảng
      // cách — không tự bịa gradient riêng. Đo bằng scan 10px trên site mẫu:
      // mỗi project có cửa sổ "đang xoay" rộng ~250px, điểm bắt đầu của các
      // project liên tiếp cách nhau đúng 100px/unit → dải bão hòa thật ~2.5
      // đơn vị khoảng cách (không phải 1) — giữ ROT_BAND rộng để đúng hiệu
      // ứng phối cảnh mềm mà site mẫu cố ý dùng.
      const ROT_BAND = 2.5;
      const WIDTH_INACTIVE = 278;
      const WIDTH_ACTIVE = 350;

      // Continuous scroll-linked stack — mọi thuộc tính là hàm liên tục của
      // scrollPos (số thực), không tween/threshold, nên không thể "đè" nhau:
      // luôn có đúng 1 trạng thái xác định cho mỗi vị trí cuộn. Ghi thẳng
      // vào style (không qua gsap.set) vì hàm này chạy trên MỌI frame cuộn.
      const applyStack = (scrollPos: number) => {
        layers.forEach((layer, i) => {
          const closeness = Math.max(0, 1 - Math.abs(i - scrollPos));
          layer.style.opacity = String(closeness);
          layer.style.visibility = closeness > 0.01 ? 'visible' : 'hidden';
        });

        swings.forEach((swing, j) => {
          const distance = j - scrollPos;
          const absDistance = Math.abs(distance);
          const rotFactor = Math.min(1, absDistance / ROT_BAND);
          const sideSign = distance === 0 ? 0 : distance > 0 ? -1 : 1;
          const depth = watchDepthForDistance(distance);
          const width =
            WIDTH_ACTIVE - (WIDTH_ACTIVE - WIDTH_INACTIVE) * rotFactor;

          swing.style.transform = `rotateX(${90 * rotFactor}deg)`;
          containers[j].style.width = `${width}px`;
          containers[j].style.transform =
            `translateZ(${depth}px) rotateX(${sideSign * 90 * rotFactor}deg)`;
          images[j].style.transform = `rotateX(${-90 * rotFactor}deg)`;
        });

        splits.forEach((split, i) => {
          if (!split?.chars) return;
          const distance = i - scrollPos;
          // Falloff bậc 2 (không tuyến tính) + biên trượt rộng hơn (130%
          // thay vì 110%) để 2 tiêu đề liền kề không cùng lộ rõ trong lúc
          // crossfade — tránh chữ đè lên nhau giữa chừng transition.
          const closenessLinear = Math.max(0, 1 - Math.abs(distance));
          const opacity = closenessLinear * closenessLinear;
          const yPercent = Math.max(-1, Math.min(1, distance)) * 130;
          split.chars.forEach(char => {
            char.style.opacity = String(opacity);
            char.style.transform = `translateY(${yPercent}%)`;
          });
        });
      };

      applyStack(0);

      if (reduce) {
        return () => splits.forEach(s => s?.revert());
      }

      const trigger = ScrollTrigger.create({
        trigger: root,
        scroller,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: self => applyStack(self.progress * lastStage),
      });

      return () => {
        trigger.kill();
        splits.forEach(s => s?.revert());
      };
    },
    [isCanvas, stages.length]
  );

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className='rcw @container relative w-full bg-black'
        style={composeStyle(
          { minHeight: 420 },
          blockBackgroundStyle(background)
        )}
      >
        <style>{FONT_CSS}</style>
        <div className='flex flex-col gap-3 px-[4cqi] py-[4cqi]'>
          <div
            data-element-key='introBackgroundUrl'
            className={selectableClass(
              activeKey === 'introBackgroundUrl',
              'relative h-24 w-full shrink-0 overflow-hidden rounded'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.introBackgroundUrl}
              alt='intro backdrop'
              className='h-full w-full object-cover'
            />
          </div>
          <p
            data-element-key='ctaLabel'
            style={composeStyle(
              { fontFamily: FONT_BODY, color: '#ffffff', margin: 0 },
              styleOf('ctaLabel')
            )}
            className={selectableClass(activeKey === 'ctaLabel', 'text-sm')}
          >
            CTA: {content.ctaLabel}
          </p>
          {stages.map((stage, i) => {
            const titleKey = `stages[${i}].title`;
            const bgKey = `stages[${i}].backgroundColor`;
            const imgKey = `stages[${i}].imageUrl`;
            return (
              <div
                key={titleKey}
                className='flex items-center gap-3 rounded-lg p-3'
                style={{
                  backgroundColor: stage.backgroundColor || '#111111',
                }}
              >
                <div
                  data-element-key={imgKey}
                  className={selectableClass(
                    activeKey === imgKey,
                    'relative h-20 w-14 shrink-0 overflow-hidden rounded bg-black/20'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={stage.imageUrl}
                    alt={stage.title}
                    className='h-full w-full object-contain'
                  />
                </div>
                <p
                  data-element-key={titleKey}
                  style={composeStyle(
                    {
                      fontFamily: FONT_HEADING,
                      fontWeight: 400,
                      color: '#ffffff',
                      margin: 0,
                      textTransform: 'uppercase',
                      fontSize: 20,
                      flex: 1,
                    },
                    styleOf(titleKey)
                  )}
                  className={selectableClass(activeKey === titleKey)}
                >
                  {stage.title}
                </p>
                <p
                  data-element-key={bgKey}
                  style={composeStyle(
                    { fontFamily: FONT_BODY, color: '#ffffff', margin: 0 },
                    styleOf(bgKey)
                  )}
                  className={selectableClass(
                    activeKey === bgKey,
                    'shrink-0 text-xs opacity-80'
                  )}
                >
                  {stage.backgroundColor || '(nền intro)'}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      className='rcw @container relative w-full'
      style={composeStyle(
        {
          height: `calc(100dvh + ${(stages.length - 1) * SCROLL_PX_PER_STAGE}px)`,
          backgroundColor: '#050505',
        },
        blockBackgroundStyle(background)
      )}
    >
      <style>{FONT_CSS}</style>
      <div ref={stageRef} style={STAGE_STYLE}>
        <div
          data-element-key='introBackgroundUrl'
          className={selectableClass(
            activeKey === 'introBackgroundUrl',
            'absolute inset-0 z-0 overflow-hidden'
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.introBackgroundUrl}
            alt=''
            className='h-full w-full object-cover'
          />
        </div>

        {stages.map((stage, i) => (
          <div
            key={`bg-${i}`}
            data-rcw-layer
            className='absolute inset-0'
            style={{
              zIndex: 1,
              backgroundColor: stage.backgroundColor || 'transparent',
              opacity: i === 0 ? 1 : 0,
              visibility: i === 0 ? 'visible' : 'hidden',
            }}
          />
        ))}

        <div
          className='absolute inset-0'
          style={{ zIndex: 10, perspective: 700 }}
        >
          {stages.map((stage, i) => {
            const imgKey = `stages[${i}].imageUrl`;
            return (
              <div
                key={`swing-${i}`}
                data-rcw-swing
                className='absolute inset-0 flex items-center justify-center'
                style={{
                  transformStyle: 'preserve-3d',
                  transform: i === 0 ? 'rotateX(0deg)' : 'rotateX(90deg)',
                }}
              >
                <div
                  data-rcw-container
                  className='relative'
                  style={{
                    transformStyle: 'preserve-3d',
                    aspectRatio: '0.714286 / 1',
                    width: i === 0 ? 350 : 278,
                    transform:
                      i === 0
                        ? 'translateZ(0px) rotateX(0deg)'
                        : `translateZ(${watchDepthForDistance(i)}px) rotateX(-90deg)`,
                  }}
                >
                  <div
                    data-rcw-image
                    data-element-key={imgKey}
                    className={selectableClass(
                      activeKey === imgKey,
                      'absolute inset-0'
                    )}
                    style={{
                      transform: i === 0 ? 'rotateX(0deg)' : 'rotateX(-90deg)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={stage.imageUrl}
                      alt={stage.title}
                      className='h-full w-full object-contain'
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {stages.map((stage, i) => {
          const titleKey = `stages[${i}].title`;
          return (
            <p
              key={`title-${i}`}
              data-rcw-title
              data-element-key={titleKey}
              style={composeStyle(
                {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  margin: 0,
                  fontFamily: FONT_HEADING,
                  fontWeight: 400,
                  color: '#ffffff',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                  zIndex: 20,
                },
                styleOf(titleKey)
              )}
              className={selectableClass(
                activeKey === titleKey,
                'text-[40px] @2xl:text-[56px] @4xl:text-[65px]'
              )}
            >
              {stage.title}
            </p>
          );
        })}

        <p
          data-element-key='ctaLabel'
          style={composeStyle(CTA_STYLE, styleOf('ctaLabel'))}
          className={selectableClass(
            activeKey === 'ctaLabel',
            'text-[12px] @2xl:text-[14px]'
          )}
        >
          {content.ctaLabel}
        </p>
      </div>
    </section>
  );
}
