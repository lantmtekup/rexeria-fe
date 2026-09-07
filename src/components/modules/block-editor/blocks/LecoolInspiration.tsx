'use client';

/**
 * Le Cool Move Inspiration — port từ apps/ecommerce-landing InspirationSection.tsx.
 *
 * Ba chế độ:
 * - `deck` (container ≥ @4xl VÀ có chuột thật): 5 lá xếp chồng ở giữa sân khấu;
 *   rê vào sân khấu thì bung quạt 3D, rê vào từng lá thì lá đó nhấc lên kèm
 *   pill tên. Không có ScrollTrigger — toàn bộ là tương tác chuột.
 * - `strip` (khổ hẹp / máy cảm ứng): dải cuộn ngang có snap, pill nằm dưới ảnh.
 * - `grid` (canvas editor): 5 lá wrap thành lưới, cao tự nhiên, không animation.
 *
 * Vì sao canvas phải tách: ở chế độ deck 4 lá dưới bị lá trên che gần hết và
 * chỉ lộ ra khi rê chuột — trên canvas sẽ không bấm chọn được. `strip` cũng
 * không hợp vì lá 4-5 nằm ngoài mép phải.
 *
 * Khác apps:
 * - `matchMedia('(min-width:1024px)')` → `isDesktop` đo theo container. Riêng
 *   `(hover: hover)` GIỮ NGUYÊN matchMedia: đó là năng lực thiết bị (có chuột
 *   hay không), không phải mốc layout.
 * - `vw` → `cqi`; `.no-scrollbar` của globals.css → `<style>` kèm block.
 * - Token Tailwind (`text-white`, `text-[clamp()]`, `font-display`) → inline base.
 */
import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type { LecoolInspirationContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import {
  CARD_W,
  DECK_GAP,
  FACE_PERSPECTIVE,
  FAN_DUR,
  FAN_EASE,
  FAN_EDGE_GUTTER,
  FAN_ROTY,
  FAN_SCALE,
  LIFT_DUR,
  LIFT_Y,
  STACK_STEP_S,
  STACK_STEP_Y,
  STAGE_PERSPECTIVE,
  TITLE_DUR,
  TITLE_SLIDE,
  deckLayout,
  fitDeck,
  pillOffset,
  resolveInspirationCards,
} from './lecoolInspirationData';
import {
  LECOOL_BODY_FONT,
  LECOOL_DISPLAY_FONT,
  LECOOL_GOLD,
  LECOOL_INK,
  LECOOL_NO_SCROLLBAR_CSS,
  LECOOL_PAPER,
} from './lecoolTheme';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

/** `@4xl` — mốc bật chế độ deck (thay `lg:` = 1024px của apps). */
const DESKTOP_BREAKPOINT = 896;

const EYEBROW_STYLE: React.CSSProperties = {
  marginTop: 16,
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 11,
  lineHeight: '10px',
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: LECOOL_GOLD,
};

const TITLE_STYLE: React.CSSProperties = {
  margin: 0,
  marginTop: 12,
  fontFamily: LECOOL_DISPLAY_FONT,
  fontSize: 'clamp(28px, 2.8cqi, 40px)',
  fontWeight: 400,
  lineHeight: 1.2,
  color: '#000000',
};

const SUBTITLE_STYLE: React.CSSProperties = {
  margin: 0,
  marginTop: 12,
  maxWidth: 560,
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 'clamp(14px, 1.15cqi, 16px)',
  fontWeight: 500,
  lineHeight: '26px',
  color: 'rgba(0,0,0,0.7)',
};

const PILL_STYLE: React.CSSProperties = {
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 11,
  lineHeight: '10px',
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  textAlign: 'center',
  color: '#FFFFFF',
  backgroundColor: LECOOL_INK,
  borderRadius: 9999,
  paddingInline: 12,
  paddingBlock: 8,
};

export function LecoolInspiration({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<LecoolInspirationContent>) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const liftRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const faceRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const titleRefs = React.useRef<(HTMLSpanElement | null)[]>([]);

  const isCanvas = useIsCanvasEdit(rootRef);
  const isDesktop = !useContainerMobile(rootRef, DESKTOP_BREAKPOINT);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const cards = React.useMemo(
    () => resolveInspirationCards(content),
    [content]
  );
  const count = cards.length;

  const mode: 'deck' | 'strip' | 'grid' = isCanvas
    ? 'grid'
    : isDesktop
      ? 'deck'
      : 'strip';

  React.useEffect(() => {
    if (mode !== 'deck') return;
    const stage = stageRef.current;
    const cardEls = cardRefs.current
      .slice(0, count)
      .filter(Boolean) as HTMLDivElement[];
    const lifts = liftRefs.current
      .slice(0, count)
      .filter(Boolean) as HTMLDivElement[];
    const faces = faceRefs.current
      .slice(0, count)
      .filter(Boolean) as HTMLDivElement[];
    const titles = titleRefs.current
      .slice(0, count)
      .filter(Boolean) as HTMLSpanElement[];
    if (!stage || cardEls.length !== count || count === 0) return;

    // Năng lực thiết bị, không phải mốc layout → vẫn hỏi matchMedia.
    if (!window.matchMedia('(hover: hover)').matches) return;
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const fanDur = reduce ? 0 : FAN_DUR;
    const liftDur = reduce ? 0 : LIFT_DUR;
    const titleDur = reduce ? 0 : TITLE_DUR;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      gsap.set(cardEls, { xPercent: -50, yPercent: -50 });
      gsap.set(titles, { xPercent: -50, autoAlpha: 0, y: TITLE_SLIDE });

      const pillY = new Array<number>(count).fill(0);
      let hovered = -1;

      const showTitle = (i: number, duration: number) => {
        gsap.to(titles[i], {
          autoAlpha: 1,
          y: pillY[i],
          duration,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };
      const hideTitle = (i: number, duration: number) => {
        gsap.to(titles[i], {
          autoAlpha: 0,
          y: pillY[i] + TITLE_SLIDE,
          duration,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };

      const applyStack = (duration: number) => {
        gsap.to(cardEls, {
          x: 0,
          y: (i: number) => i * STACK_STEP_Y,
          z: 0,
          duration,
          ease: FAN_EASE,
          overwrite: 'auto',
        });
        gsap.to(faces, {
          rotateY: 0,
          scale: (i: number) => 1 - i * STACK_STEP_S,
          duration,
          ease: FAN_EASE,
          overwrite: 'auto',
        });
        gsap.to(titles, {
          rotateY: 0,
          duration,
          ease: FAN_EASE,
          overwrite: 'auto',
        });
        pillY.fill(0);
      };

      const applyFan = (duration: number) => {
        const fit = fitDeck(count, stage.clientWidth - FAN_EDGE_GUTTER);
        const scale = FAN_SCALE * fit;
        const layout = deckLayout(count, DECK_GAP * fit, scale);

        gsap.to(cardEls, {
          x: (i: number) => layout[i].x,
          y: 0,
          z: (i: number) => layout[i].z,
          duration,
          ease: FAN_EASE,
          overwrite: 'auto',
        });
        gsap.to(faces, {
          rotateY: FAN_ROTY,
          scale,
          duration,
          ease: FAN_EASE,
          overwrite: 'auto',
        });
        gsap.to(titles, {
          rotateY: FAN_ROTY,
          duration,
          ease: FAN_EASE,
          overwrite: 'auto',
        });

        pillY.fill(pillOffset(scale));
        if (hovered >= 0) showTitle(hovered, duration);
      };

      applyStack(0);

      const onStageEnter = () => applyFan(fanDur);
      const onStageLeave = () => {
        applyStack(fanDur);
        hovered = -1;
        gsap.to(lifts, {
          y: 0,
          duration: liftDur,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        cardEls.forEach((_, i) => hideTitle(i, titleDur));
      };

      stage.addEventListener('mouseenter', onStageEnter);
      stage.addEventListener('mouseleave', onStageLeave);
      cleanups.push(() => {
        stage.removeEventListener('mouseenter', onStageEnter);
        stage.removeEventListener('mouseleave', onStageLeave);
      });

      cardEls.forEach((card, i) => {
        const onEnter = () => {
          hovered = i;
          gsap.to(lifts[i], {
            y: LIFT_Y,
            duration: liftDur,
            ease: 'power2.out',
            overwrite: 'auto',
          });
          showTitle(i, titleDur);
        };
        const onLeave = () => {
          if (hovered === i) hovered = -1;
          gsap.to(lifts[i], {
            y: 0,
            duration: liftDur,
            ease: 'power2.out',
            overwrite: 'auto',
          });
          hideTitle(i, titleDur);
        };
        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mouseleave', onLeave);
        cleanups.push(() => {
          card.removeEventListener('mouseenter', onEnter);
          card.removeEventListener('mouseleave', onLeave);
        });
      });
    }, stage);

    return () => {
      for (const fn of cleanups) fn();
      ctx.revert();
    };
  }, [mode, count]);

  const renderCard = (index: number) => {
    const card = cards[index];
    const imgKey = `cards[${index}].imageUrl`;
    const titleKey = `cards[${index}].title`;

    return (
      <div
        key={`card-${index}`}
        ref={node => {
          cardRefs.current[index] = node;
        }}
        className={cn(
          mode === 'deck' && 'absolute top-1/2 left-1/2',
          mode === 'strip' && 'relative shrink-0 snap-center',
          mode === 'grid' && 'relative'
        )}
        style={
          mode === 'deck'
            ? { width: CARD_W, zIndex: count - index }
            : mode === 'strip'
              ? { width: '70cqi', maxWidth: CARD_W, zIndex: count - index }
              : // Canvas: 2 lá một hàng, đủ to để bấm chọn ảnh lẫn pill tên.
                { width: 'calc(50% - 8px)', maxWidth: CARD_W }
        }
      >
        <div
          ref={node => {
            liftRefs.current[index] = node;
          }}
          style={{ perspective: `${FACE_PERSPECTIVE}px` }}
        >
          <div
            ref={node => {
              faceRefs.current[index] = node;
            }}
          >
            <div
              className='relative aspect-[5/4] w-full overflow-hidden'
              style={{
                borderRadius: 10,
                boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
              }}
            >
              <img
                src={card.imageUrl ?? ''}
                alt={card.alt ?? ''}
                data-element-key={imgKey}
                className={selectableClass(
                  activeKey === imgKey,
                  'h-full w-full object-cover'
                )}
                style={styleOf(imgKey)}
              />
            </div>
          </div>

          <span
            ref={node => {
              titleRefs.current[index] = node;
            }}
            data-element-key={titleKey}
            className={selectableClass(
              activeKey === titleKey,
              mode === 'deck'
                ? 'absolute bottom-full left-1/2 mb-4 block w-fit whitespace-nowrap opacity-0'
                : 'mx-auto mt-3 block w-fit'
            )}
            style={composeStyle(PILL_STYLE, styleOf(titleKey))}
          >
            {card.title}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section
      ref={rootRef}
      data-canvas-edit={isCanvas ? 'true' : undefined}
      className={cn('@container relative w-full overflow-hidden', className)}
      style={composeStyle(
        {
          fontFamily: LECOOL_BODY_FONT,
          backgroundColor: LECOOL_PAPER,
          paddingBlock: 'clamp(48px, 5cqi, 64px)',
        },
        blockBackgroundStyle(background)
      )}
    >
      <style>{LECOOL_NO_SCROLLBAR_CSS}</style>

      <div className='mx-auto w-full px-6'>
        <div className='flex flex-col items-center text-center'>
          {/* `data-crown-slot` — điểm dừng thứ 5 của CrownTraveler bên apps. */}
          <img
            src={content.crownUrl ?? ''}
            alt=''
            aria-hidden
            data-crown-slot='inspirations'
            data-element-key='crownUrl'
            className={selectableClass(activeKey === 'crownUrl', 'h-auto')}
            style={composeStyle(
              { width: 'clamp(52px, 4.4cqi, 73px)' },
              styleOf('crownUrl')
            )}
          />

          <span
            data-element-key='eyebrow'
            className={selectableClass(activeKey === 'eyebrow')}
            style={composeStyle(EYEBROW_STYLE, styleOf('eyebrow'))}
          >
            {content.eyebrow}
          </span>

          <h2
            data-element-key='title'
            className={selectableClass(activeKey === 'title')}
            style={composeStyle(TITLE_STYLE, styleOf('title'))}
          >
            {content.title}
          </h2>

          <p
            data-element-key='subtitle'
            className={selectableClass(activeKey === 'subtitle')}
            style={composeStyle(SUBTITLE_STYLE, styleOf('subtitle'))}
          >
            {content.subtitle}
          </p>
        </div>

        <div
          ref={stageRef}
          className={cn(
            'lecool-no-scrollbar',
            mode === 'deck' && 'relative mt-14 block h-[680px]',
            mode === 'strip' &&
              '-mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2',
            mode === 'grid' && 'mt-10 flex flex-wrap items-start gap-4'
          )}
          style={
            mode === 'deck'
              ? { perspective: `${STAGE_PERSPECTIVE}px` }
              : undefined
          }
        >
          {cards.map((_, i) => renderCard(i))}
        </div>
      </div>
    </section>
  );
}
