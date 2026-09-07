'use client';

/**
 * Le Cool Move Showcase — port từ apps/ecommerce-landing ShowcaseSection.tsx.
 *
 * Production (container ≥ @4xl): section cao nhiều màn, khối trong dính đỉnh,
 * track ảnh chạy ngang theo scroll. Cột giữa KHÔNG chạy — nó là một lớp phủ
 * đứng yên, chỉ đổi emblem + caption bằng cross-fade đúng lúc mép hai card đi
 * qua nó (`seamAt`).
 *
 * Khác apps:
 * - `gsap.matchMedia('(min-width:1024px)')` → `isDesktop` đo theo container.
 * - ScrollTrigger nhận `scroller` của LandingMotion; `svh` → `dvh`, `vw` → `cqi`.
 * - Canvas editor DÙNG LẠI bố cục mobile (2 card xếp dọc, cột giữa nằm trong
 *   luồng): production giấu cột giữa của card sau (opacity 0) và đẩy card 2 ra
 *   ngoài mép phải, nên trên canvas sẽ không bấm chọn được. PreviewMode và `/p`
 *   giữ nguyên bản pin + scrub.
 * - Ở bản desktop, cột giữa nằm trong `CardFace` chỉ là KHUNG CHIẾM CHỖ
 *   (`invisible`) — nó không mang `data-element-key`, key nằm ở lớp phủ đang
 *   nhìn thấy, tránh hai node trùng key.
 */
import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import type {
  LecoolShowcaseCard,
  LecoolShowcaseContent,
  LecoolShowcaseImage,
} from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { resolveShowcaseCards } from './lecoolShowcaseData';
import {
  LECOOL_DISPLAY_FONT,
  LECOOL_HEADER_H,
  LECOOL_PAPER,
} from './lecoolTheme';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

/** `@4xl` — mốc đổi sang bản pin + chạy ngang (thay `lg:` = 1024px của apps). */
const DESKTOP_BREAKPOINT = 896;

/** Nhịp timeline của apps — giữ nguyên. */
const HOLD = 0.15;
const TRAVEL = 1;
const SWAP = 0.1;
/** Quãng scroll cho mỗi mép card, tính theo % chiều cao màn. */
const SCROLL_PER_STEP = 160;

/** Vị trí (trên timeline) lúc mép giữa card `step` và `step+1` chạm cột giữa. */
function seamAt(step: number, steps: number) {
  return HOLD + (TRAVEL * (step + 0.5)) / steps;
}

/** Bề rộng 2 cột ảnh và cột giữa — cộng lại đúng 100%. */
const COL_IMAGE = '32%';
const COL_CENTER = '36%';

const TITLE_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  margin: 0,
  maxWidth: '20ch',
  padding: 'clamp(20px, 2.4cqi, 44px)',
  fontFamily: LECOOL_DISPLAY_FONT,
  fontSize: 'clamp(20px, 2.1cqi, 40px)',
  fontWeight: 400,
  lineHeight: 1.3,
  color: '#FFFFFF',
};

const CAPTION_STYLE: React.CSSProperties = {
  margin: 0,
  marginTop: 'clamp(24px, 3cqi, 44px)',
  fontFamily: LECOOL_DISPLAY_FONT,
  fontSize: 'clamp(20px, 1.9cqi, 26px)',
  fontWeight: 400,
  lineHeight: 'normal',
  color: '#000000',
};

/**
 * apps đặt mỗi emblem một `clamp` riêng (`clamp(170px,20vw,300px)` /
 * `clamp(150px,15vw,232px)`); CMS chỉ giữ mốc trên rồi suy ra hai mốc kia để
 * author thêm card mới không phải nhập 3 số.
 */
function emblemWidth(max: number) {
  return `clamp(${Math.round(max * 0.56)}px, ${((max / 1440) * 100).toFixed(1)}cqi, ${max}px)`;
}

export function LecoolShowcase({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<LecoolShowcaseContent>) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stickyRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const groupRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const faceRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const isCanvas = useIsCanvasEdit(rootRef);
  const isDesktop = !useContainerMobile(rootRef, DESKTOP_BREAKPOINT);
  const { scroller, requestRefresh } = useLandingMotion();

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const cards = React.useMemo(() => resolveShowcaseCards(content), [content]);
  const count = cards.length;
  const steps = count - 1;

  /** Canvas dùng lại bố cục mobile: 2 card xếp dọc, mọi field trong luồng. */
  const stacked = isCanvas || !isDesktop;

  React.useEffect(() => {
    const section = rootRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    if (!section || !sticky || !track) return;
    if (stacked) return;
    // 1 card thì không có mép nào để đi qua → để yên, không pin, không animate.
    if (steps < 1) return;

    const groups = groupRefs.current.slice(0, count);
    const faces = faceRefs.current.slice(0, count);
    if (groups.some(el => !el) || faces.some(el => !el)) return;

    const groupEls = groups as HTMLDivElement[];
    const fades = (faces as HTMLDivElement[]).map(face =>
      face.querySelectorAll('[data-fade]')
    );
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        // Không chạy ngang: xếp chồng các card rồi chỉ fade qua nhau.
        gsap.set([track, ...groupEls], { width: '100%' });
        gsap.set(groupEls.slice(1), {
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          autoAlpha: 0,
        });
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          scroller,
          start: `top top+=${LECOOL_HEADER_H}`,
          end: () =>
            `+=${Math.max(1, section.offsetHeight - sticky.offsetHeight)}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      if (!reduce) {
        tl.to(
          track,
          { xPercent: (-100 * steps) / count, duration: TRAVEL },
          HOLD
        );
      }

      const swap = Math.min(SWAP, (TRAVEL / steps) * 0.4);

      for (let step = 0; step < steps; step += 1) {
        const at = seamAt(step, steps);

        if (reduce) {
          tl.to(
            groupEls[step + 1],
            { autoAlpha: 1, duration: swap * 2 },
            at - swap
          );
        }

        tl.to(
          fades[step],
          { autoAlpha: 0, y: -14, duration: swap, stagger: 0.02 },
          at - swap
        ).fromTo(
          fades[step + 1],
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: swap, stagger: 0.03 },
          at - swap * 0.4
        );
      }

      // Giữ yên một nhịp ở cuối trước khi thả pin.
      tl.to({}, { duration: HOLD }, HOLD + TRAVEL);
    }, section);

    requestRefresh();
    return () => ctx.revert();
  }, [stacked, steps, count, scroller, requestRefresh]);

  const renderImage = (
    cardIndex: number,
    imageIndex: number,
    image: LecoolShowcaseImage | undefined
  ) => {
    if (!image) return null;
    const imgKey = `cards[${cardIndex}].images[${imageIndex}].imageUrl`;
    const titleKey = `cards[${cardIndex}].images[${imageIndex}].title`;
    return (
      <div
        key={imgKey}
        className={cn(
          'relative w-full shrink-0 overflow-hidden',
          stacked ? 'aspect-[4/5]' : 'h-full'
        )}
        style={stacked ? undefined : { width: COL_IMAGE }}
      >
        <img
          src={image.imageUrl ?? ''}
          alt={image.alt ?? ''}
          data-element-key={imgKey}
          className={selectableClass(
            activeKey === imgKey,
            'h-full w-full object-cover'
          )}
          style={styleOf(imgKey)}
        />

        {image.title ? (
          <>
            <div
              aria-hidden
              className='pointer-events-none absolute inset-x-0 top-0 h-1/3'
              style={{
                backgroundImage:
                  'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
              }}
            />
            <h3
              data-element-key={titleKey}
              className={selectableClass(activeKey === titleKey)}
              style={composeStyle(TITLE_STYLE, styleOf(titleKey))}
            >
              {image.title}
            </h3>
          </>
        ) : null}
      </div>
    );
  };

  /**
   * `spacer`: bản chiếm chỗ trong luồng ở khổ desktop — vô hình, không key,
   * không `data-fade` (lớp phủ mới là bản chạy animation và nhận selection).
   */
  const renderCenter = (
    cardIndex: number,
    card: LecoolShowcaseCard,
    opts: { spacer?: boolean; startHidden?: boolean; className?: string }
  ) => {
    const { spacer = false, startHidden = false, className: cls } = opts;
    const emblemKey = `cards[${cardIndex}].emblemUrl`;
    const lines = card.captionLines ?? [];
    const hidden = startHidden
      ? { opacity: 0, visibility: 'hidden' as const }
      : undefined;

    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center px-6 text-center',
          cls
        )}
        style={
          stacked ? undefined : { paddingInline: 'clamp(24px, 3cqi, 56px)' }
        }
      >
        <img
          src={card.emblemUrl ?? ''}
          alt=''
          aria-hidden
          data-fade={spacer ? undefined : true}
          data-crown-slot={!spacer && card.isCrown ? 'showcase' : undefined}
          /* Cột giữa cross-fade sang card sau giữa chừng pin → vương miện phải
             rời khỏi đây sớm, không thì đè lên emblem/caption của card kế.
             Xem `LecoolCrownTraveler`. */
          data-crown-exit={!spacer && card.isCrown ? 'early' : undefined}
          data-element-key={spacer ? undefined : emblemKey}
          className={
            spacer
              ? 'h-auto'
              : selectableClass(activeKey === emblemKey, 'h-auto')
          }
          style={composeStyle(
            { width: emblemWidth(card.emblemWidth ?? 300) },
            hidden,
            spacer ? undefined : styleOf(emblemKey)
          )}
        />

        {lines.length > 0 ? (
          <p style={CAPTION_STYLE}>
            {lines.map((line, j) => {
              const key = `cards[${cardIndex}].captionLines[${j}]`;
              return (
                <span
                  key={key}
                  data-fade={spacer ? undefined : true}
                  data-element-key={spacer ? undefined : key}
                  className={
                    spacer
                      ? 'block'
                      : selectableClass(activeKey === key, 'block')
                  }
                  style={composeStyle(
                    { display: 'block' },
                    hidden,
                    spacer ? undefined : styleOf(key)
                  )}
                >
                  {line}
                </span>
              );
            })}
          </p>
        ) : null}
      </div>
    );
  };

  const sectionStyle: React.CSSProperties = stacked
    ? {}
    : {
        height: `calc(100dvh - ${LECOOL_HEADER_H}px + ${steps * SCROLL_PER_STEP}dvh)`,
      };

  return (
    <section
      ref={rootRef}
      data-canvas-edit={isCanvas ? 'true' : undefined}
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        { backgroundColor: LECOOL_PAPER },
        sectionStyle,
        blockBackgroundStyle(background)
      )}
    >
      <div
        ref={stickyRef}
        className='relative'
        style={
          stacked
            ? { paddingBlock: 'clamp(48px, 5cqi, 64px)' }
            : {
                position: 'sticky',
                top: LECOOL_HEADER_H,
                height: `calc(100dvh - ${LECOOL_HEADER_H}px)`,
                overflow: 'hidden',
              }
        }
      >
        <div
          ref={trackRef}
          className={cn('flex', stacked ? 'flex-col gap-16' : 'flex-row')}
          style={
            stacked
              ? undefined
              : {
                  position: 'absolute',
                  insetBlock: 0,
                  left: 0,
                  width: `${count * 100}%`,
                }
          }
        >
          {cards.map((card, i) => (
            <div
              key={`group-${i}`}
              ref={node => {
                groupRefs.current[i] = node;
              }}
              className='w-full'
              style={
                stacked
                  ? undefined
                  : { height: '100%', width: `${100 / count}%` }
              }
            >
              <article
                className={cn(
                  'flex w-full items-stretch',
                  stacked ? 'flex-col gap-8' : 'h-full flex-row'
                )}
              >
                {renderImage(i, 0, card.images?.[0])}
                {renderCenter(i, card, {
                  spacer: !stacked,
                  className: cn('flex-1', !stacked && 'invisible'),
                })}
                {renderImage(i, 1, card.images?.[1])}
              </article>
            </div>
          ))}
        </div>

        {/* Lớp phủ cột giữa: đứng yên khi track chạy, cross-fade theo mép card */}
        {stacked ? null : (
          <div
            className='absolute inset-y-0 z-10'
            style={{
              left: COL_IMAGE,
              width: COL_CENTER,
              backgroundColor: LECOOL_PAPER,
            }}
          >
            {cards.map((card, i) => (
              <div
                key={`face-${i}`}
                ref={node => {
                  faceRefs.current[i] = node;
                }}
                className='absolute inset-0'
              >
                {renderCenter(i, card, {
                  startHidden: i > 0,
                  className: 'h-full',
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
