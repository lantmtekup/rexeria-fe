'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  WestlyRevealContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useWestlyPointer, westlyCursorToggle } from './WestlyPointer';
import { useContainerMobile } from './useContainerMobile';
import { WESTLY_FONT_DISPLAY, WESTLY_FONT_UI } from './westlyTheme';

interface WestlyRevealProps {
  content: WestlyRevealContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * The Westly · Reveal — port từ apps/the-westly SceneReveal.tsx.
 *
 * Cảnh bếp 2 lớp nét chì; KHỐI CHỮ nằm GIỮA far và near nên chỉ hiện qua lỗ
 * kính (phần tràn bị tường/tủ của lớp near che). Click bất kỳ đâu trên section
 * lật sang ảnh thật — chữ đổi chỗ (ô kính → giữa) và đổi màu (xanh → trắng)
 * trong lúc còn ẩn rồi hiện lại. Sweep + mouse parallax kéo chữ CÙNG lớp far.
 *
 * Khác apps (cùng bộ quyết định với WestlyScene):
 * - Track tự chứa: stage sticky 100dvh + dwell (100dvh desktop / 60dvh mobile)
 *   + 85dvh veil (range gốc 'top bottom'→'top 15%' — dài hơn scene vì
 *   ProductReveal trườn lên che hẳn).
 * - Bỏ bg fade-in; giữ feather mask + cổng gate (tự chứa được).
 * - Bỏ drag-pan mobile (Observer không có trong foundation — R1); suppressClick
 *   của drag cũng đi theo.
 * - Reveal giữ imperative trong effect (production branch không re-render nên
 *   aria-pressed setAttribute an toàn; không có label đổi như scene).
 */

const DEFAULT_NEAR = '/the-westly/s5-p1.png';
const DEFAULT_FAR = '/the-westly/s5-p2.png';
const DEFAULT_PHOTO = '/the-westly/s5-p3.png';
const DEFAULT_BG = '#ffffff';
const DEFAULT_VEIL = '#F3F1EA';

/**
 * Bleed các lớp vượt ra ngoài stage — nguồn duy nhất cho inset CSS và clamp
 * mouse parallax. Phải LỚN hơn xPercent sweep + biên độ chuột, không thì lộ mép.
 */
const BLEED = { x: 16, y: 5 } as const;

const LAYER_INSET: React.CSSProperties = {
  top: `-${BLEED.y}%`,
  right: `-${BLEED.x}%`,
  bottom: `-${BLEED.y}%`,
  left: `-${BLEED.x}%`,
};

/** Mask dọc của stage trên mobile — hai mép trên/dưới tan vào nền. */
const STAGE_MASK_MOBILE =
  'linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent)';

/**
 * Tâm khối chữ khi nằm trong ô kính — % của stage (đọc từ ảnh design, hệ toạ
 * độ 1440×820).
 */
const WINDOW_POS = { x: 17, y: 31 } as const;

/** Xanh trên bản sketch, trắng khi nằm trên ảnh thật. */
const COPY_COLOR = { sketch: '#6E7A6F', photo: '#FFFFFF' } as const;

const FILL_IMG_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
};

export function WestlyReveal({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: WestlyRevealProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const isCanvas = useIsCanvasEdit(rootRef);
  const pointer = useWestlyPointer(isCanvas);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const eyebrow = content.eyebrow?.trim() || 'EXPLORE KITCHEN SPACE';
  const title =
    content.title?.trim() ||
    'The separate windowed kitchen recalls the sophistication';
  const nearUrl = content.nearUrl?.trim() || DEFAULT_NEAR;
  const nearAlt = content.nearAlt?.trim() || 'The Westly interior sketch';
  const farUrl = content.farUrl?.trim() || DEFAULT_FAR;
  const photoUrl = content.photoUrl?.trim() || DEFAULT_PHOTO;
  const photoAlt = content.photoAlt?.trim() || '';
  const bgColor = content.bgColor?.trim() || DEFAULT_BG;
  const veilColor = content.veilColor?.trim() || DEFAULT_VEIL;

  useWestlyRevealMotion(rootRef, isCanvas, isMobile);

  const renderCopyFields = () => (
    <>
      <p
        data-wv-copy-item=''
        data-element-key='eyebrow'
        className={selectableClass(activeKey === 'eyebrow')}
        style={composeStyle(
          {
            margin: 0,
            fontFamily: WESTLY_FONT_UI,
            fontSize: 12,
            lineHeight: 1,
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: COPY_COLOR.sketch,
          },
          styleOf('eyebrow')
        )}
      >
        {eyebrow}
      </p>
      <h2
        data-wv-copy-item=''
        data-element-key='title'
        className={selectableClass(activeKey === 'title')}
        style={composeStyle(
          {
            margin: 0,
            marginTop: 16,
            // Apps: 30/38/48 theo breakpoint — quy về clamp đạt 48 tại ~1024.
            // Số dòng phụ thuộc cỡ chữ, nhưng placeCopy đo lại trên resize nên
            // clamp liên tục vẫn an toàn.
            fontSize: 'clamp(30px, 4.7cqi, 48px)',
            lineHeight: 1.25,
            fontWeight: 500,
            color: COPY_COLOR.sketch,
          },
          styleOf('title')
        )}
      >
        {title}
      </h2>
    </>
  );

  const renderImage = (
    key: 'nearUrl' | 'farUrl' | 'photoUrl',
    src: string,
    alt: string,
    extra?: React.CSSProperties
  ) => (
    <img
      src={src}
      alt={alt}
      data-element-key={key}
      className={selectableClass(activeKey === key)}
      style={composeStyle(FILL_IMG_STYLE, extra, styleOf(key))}
    />
  );

  // ── Editor canvas: layout phẳng — copy + 3 lớp ảnh + màu; không toggle ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-westly-scope=''
        data-canvas-edit='true'
        className={cn('@container relative w-full', className)}
        style={composeStyle(
          {
            fontFamily: WESTLY_FONT_DISPLAY,
            backgroundColor: bgColor,
            padding: '40px 24px',
          },
          blockBackgroundStyle(background)
        )}
      >
        <div
          style={{ maxWidth: '44rem', margin: '0 auto', textAlign: 'center' }}
        >
          {renderCopyFields()}
          <p style={{ margin: '10px 0 0', fontSize: 11, color: '#737373' }}>
            Trên trang thật: chữ nấp trong ô kính của bản vẽ, click cả section
            để lật sang ảnh thật (chữ ra giữa, đổi màu trắng)
          </p>
        </div>

        <div className='mt-8 grid grid-cols-1 gap-4 @2xl:grid-cols-3'>
          {(
            [
              ['nearUrl', nearUrl, nearAlt, 'Lớp nét trước (near — che chữ)'],
              ['farUrl', farUrl, '', 'Lớp nét sau (far — sau chữ)'],
              ['photoUrl', photoUrl, photoAlt, 'Ảnh thật (reveal)'],
            ] as const
          ).map(([key, src, alt, caption]) => (
            <figure key={key} style={{ margin: 0 }}>
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '1440 / 820',
                  overflow: 'hidden',
                  backgroundColor: '#fafafa',
                  border: '1px solid #e5e5e5',
                }}
              >
                {renderImage(key, src, alt)}
              </div>
              <figcaption
                style={{ marginTop: 6, fontSize: 12, color: '#737373' }}
              >
                {caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <div
          className='mt-6 flex flex-wrap items-center justify-center gap-3'
          style={{ textAlign: 'center' }}
        >
          {(
            [
              ['bgColor', bgColor, 'Màu nền'],
              ['veilColor', veilColor, 'Màu veil bàn giao'],
            ] as const
          ).map(([key, value, caption]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <span
                data-element-key={key}
                className={selectableClass(activeKey === key)}
                style={composeStyle(
                  {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 10px',
                    border: '1px solid #e5e5e5',
                    backgroundColor: '#ffffff',
                    fontSize: 12,
                    color: '#404040',
                  },
                  styleOf(key)
                )}
              >
                <span
                  aria-hidden
                  style={{
                    width: 16,
                    height: 16,
                    display: 'inline-block',
                    backgroundColor: value,
                    border: '1px solid #d4d4d4',
                  }}
                />
                {value}
              </span>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#737373' }}>
                {caption}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: production ──
  return (
    <section
      ref={rootRef}
      data-westly-scope=''
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        {
          fontFamily: WESTLY_FONT_DISPLAY,
          // 100dvh stage + dwell (100/60) + 85dvh veil (range gốc → top 15%).
          height: isMobile ? '245dvh' : '285dvh',
          backgroundColor: bgColor,
        },
        blockBackgroundStyle(background)
      )}
    >
      {pointer}
      {/* Cả hộp sticky là nút toggle — click bất kỳ đâu lật sketch ↔ ảnh. */}
      <div
        data-wv='viewport'
        role='button'
        tabIndex={0}
        {...westlyCursorToggle}
        aria-pressed='false'
        aria-label='Toggle interior view'
        style={{
          position: 'sticky',
          top: 0,
          height: '100dvh',
          overflow: 'hidden',
          cursor: 'pointer',
          backgroundColor: bgColor,
          containerType: 'size',
        }}
      >
        <div
          data-wv='stage'
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            aspectRatio: '1440 / 820',
            width: isMobile
              ? 'min(160cqw, max(100cqw, calc(100cqh * 1440 / 820)))'
              : 'max(100cqw, calc(100cqh * 1440 / 820))',
            overflow: 'hidden',
            maskImage: isMobile ? STAGE_MASK_MOBILE : undefined,
            WebkitMaskImage: isMobile ? STAGE_MASK_MOBILE : undefined,
          }}
        >
          <div
            data-wv='photo'
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              visibility: 'hidden',
              opacity: 0,
              willChange: 'transform',
            }}
          >
            {renderImage('photoUrl', photoUrl, photoAlt)}
          </div>

          <div
            data-wv='far'
            style={{
              position: 'absolute',
              ...LAYER_INSET,
              willChange: 'transform',
            }}
          >
            {renderImage('farUrl', farUrl, '', { objectFit: 'cover' })}
          </div>

          {/* Chữ nằm GIỮA far và near — đúng thứ tự DOM này mới ra hiệu ứng
              hiện qua lỗ kính (phần tràn bị lớp near che). Mobile: ô kính rơi
              ra ngoài mép trái (stage rộng hơn màn) nên chữ về giữa và lên
              TRÊN near để còn đọc được — hiệu ứng lỗ kính chỉ chạy desktop. */}
          <div
            data-wv='copy'
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              inset: 0,
              zIndex: isMobile ? 1 : undefined,
              willChange: 'transform',
            }}
          >
            <div
              data-wv='copy-shift'
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                willChange: 'transform',
              }}
            >
              {renderCopyFields()}
            </div>
          </div>

          <div
            data-wv='near'
            style={{
              position: 'absolute',
              ...LAYER_INSET,
              willChange: 'transform',
            }}
          >
            {renderImage('nearUrl', nearUrl, nearAlt, { objectFit: 'cover' })}
          </div>
        </div>

        {/* Veil bàn giao — cùng màu nền block sau. */}
        <div
          data-wv='veil'
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            backgroundColor: veilColor,
            opacity: 0,
            pointerEvents: 'none',
            willChange: 'opacity',
          }}
        />
      </div>

      {/* Mốc đo veil — 85dvh cuối track ('top bottom'→'top 15%' của bản gốc) */}
      <div
        data-wv='veil-marker'
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '85dvh',
          pointerEvents: 'none',
        }}
      />
    </section>
  );
}

/**
 * Motion production — giữ timing + toàn bộ toán đặt chữ của apps; đổi hợp đồng
 * host (scroller, container, cleanup). Reveal imperative trong effect.
 */
function useWestlyRevealMotion(
  rootRef: React.RefObject<HTMLElement | null>,
  isCanvas: boolean,
  isMobile: boolean
) {
  const { scroller, requestRefresh } = useLandingMotion();

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || isCanvas) return;

    const q = (name: string) =>
      root.querySelector<HTMLElement>(`[data-wv="${name}"]`);
    const viewport = q('viewport');
    const stage = q('stage');
    const photo = q('photo');
    const far = q('far');
    const near = q('near');
    const copy = q('copy');
    const copyShift = q('copy-shift');
    const veil = q('veil');
    const veilMarker = q('veil-marker');
    const copyItems = root.querySelectorAll<HTMLElement>('[data-wv-copy-item]');
    if (!viewport || !stage || !photo || !far || !near || !copy || !copyShift)
      return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const removers: Array<() => void> = [];

    const nearSplit = isMobile ? 4 : 7;
    const farSplit = isMobile ? 2.5 : 4;
    let revealed = false;

    const ctx = gsap.context(() => {
      gsap.set(photo, { autoAlpha: 0 });
      gsap.set([far, near], { autoAlpha: 1 });

      /**
       * Bề ngang quyết định câu ngắt mấy dòng: hẹp để lọt ô kính thì 3–4 dòng,
       * rộng ra giữa thì còn 2. Tính px vì cỡ chữ cũng px cố định.
       */
      const copyWidth = () => {
        const wide = viewport.clientWidth >= 1024;
        if (revealed || isMobile) {
          return Math.min(wide ? 600 : 420, viewport.clientWidth - 48);
        }
        return wide ? 340 : 280;
      };

      /** Chỗ đứng của khối chữ theo trạng thái hiện tại. */
      const copyPlacement = () => {
        if (revealed || isMobile) return { x: 0, y: 0 };
        const stageW = stage.offsetWidth;
        // Stage rộng hơn viewport thì bị xén đều hai bên — đẩy chữ sang phải
        // vừa đủ để không bị xén theo; cộng cả biên độ scrub ±farSplit%.
        const clipped = (stageW - viewport.clientWidth) / 2;
        const wanted = (WINDOW_POS.x / 100) * stageW;
        const drift = (farSplit / 100) * stageW;
        const safe = clipped + copyWidth() / 2 + drift + 24;
        return {
          x: Math.max(wanted, safe) - stageW / 2,
          y: ((WINDOW_POS.y - 50) / 100) * stage.offsetHeight,
        };
      };

      /**
       * Đặt chỗ tức thì, không tween: bề ngang đổi thì câu ngắt lại dòng, mà
       * nội suy bề ngang qua từng frame là chữ nhảy dòng liên tục. xPercent/
       * yPercent khai ở đây vì GSAP đụng transform là xoá translate của CSS.
       */
      const placeCopy = () => {
        gsap.set(copyShift, {
          width: copyWidth(),
          xPercent: -50,
          yPercent: -50,
          ...copyPlacement(),
        });
        copyShift.style.textAlign = revealed || isMobile ? 'center' : 'left';
      };

      /** Màu tween được mà không reflow, nên vẫn cho chạy. */
      const paintCopy = (dur = 0) => {
        gsap.to(copyItems, {
          color: revealed ? COPY_COLOR.photo : COPY_COLOR.sketch,
          duration: dur,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      };

      placeCopy();
      paintCopy();
      window.addEventListener('resize', placeCopy);
      removers.push(() => window.removeEventListener('resize', placeCopy));

      // Toggle — cả section là nút; chữ đổi chỗ + đổi màu lúc còn ẩn rồi mới
      // hiện lại (trượt sang là câu nhảy dòng suốt đoạn bay).
      const onToggle = () => {
        revealed = !revealed;
        const duration = reduce ? 0 : 0.7;
        gsap.set([near, far, photo, copy], { x: 0, y: 0 });

        gsap.to(photo, {
          autoAlpha: revealed ? 1 : 0,
          duration,
          ease: 'power2.inOut',
        });
        gsap.to([near, far], {
          autoAlpha: revealed ? 0 : 1,
          scale: revealed ? 1.02 : 1,
          duration,
          ease: 'power2.inOut',
          stagger: 0.06,
        });
        placeCopy();
        paintCopy();
        gsap.fromTo(
          copyItems,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration,
            ease: 'power2.out',
            stagger: reduce ? 0 : 0.08,
            overwrite: 'auto',
          }
        );
        viewport.setAttribute('aria-pressed', String(revealed));
      };
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        onToggle();
      };
      viewport.addEventListener('click', onToggle);
      viewport.addEventListener('keydown', onKeyDown);
      removers.push(() => {
        viewport.removeEventListener('click', onToggle);
        viewport.removeEventListener('keydown', onKeyDown);
        viewport.style.pointerEvents = '';
      });

      if (reduce) {
        gsap.set([stage, copy], { autoAlpha: 1 });
        gsap.set(copyItems, { autoAlpha: 1 });
        return;
      }

      gsap.set(copyItems, { autoAlpha: 0 });

      // MÉP TAN — mask dải trên trong suốt đúng bằng khoảng cách mép → đỉnh
      // màn lúc block trườn vào; phủ kín màn thì gỡ hẳn mask.
      const viewportH = () =>
        scroller ? scroller.clientHeight : window.innerHeight;
      const paintFeather = (progress: number) => {
        const px = Math.round(viewportH() * (1 - progress));
        const mask =
          px > 1
            ? `linear-gradient(to bottom, transparent 0px, #000 ${px}px)`
            : '';
        viewport.style.maskImage = mask;
        viewport.style.webkitMaskImage = mask;
      };
      gsap.timeline({
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top bottom',
          end: 'top top',
          invalidateOnRefresh: true,
          onUpdate: self => paintFeather(self.progress),
          onLeave: () => paintFeather(1),
          onLeaveBack: () => paintFeather(0),
          onRefresh: self => paintFeather(self.progress),
        },
      });
      removers.push(() => {
        viewport.style.maskImage = '';
        viewport.style.webkitMaskImage = '';
      });

      // CỔNG — bản vẽ chỉ hiện khi block đã chiếm nửa dưới màn (scrub thuận
      // nghịch, không giẫm trạng thái reveal bên trong).
      gsap.fromTo(
        [stage, copy],
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 62%',
            end: 'top 50%',
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        }
      );

      // Entrance — "an vị": scale nhả ra + chữ so le, đúng lúc cổng mở.
      gsap
        .timeline({
          defaults: { ease: 'power3.out', duration: 1.1 },
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 50%',
            once: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo([far, near], { scale: 1.06 }, { scale: 1 })
        .fromTo(photo, { scale: 1.04 }, { scale: 1, duration: 1.2 }, 0)
        .fromTo(
          copyItems,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 },
          '-=0.6'
        );

      // SWEEP — near một chiều, [far + CHỮ] ngược chiều: chữ nằm sau kính mà
      // khung cửa trượt ngược lại, chữ đứng yên sẽ lòi dần ra ngoài ô.
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top top',
            end: isMobile ? '+=60%' : '+=100%',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(near, { xPercent: -nearSplit }, { xPercent: nearSplit }, 0)
        .fromTo(
          [far, copy],
          { xPercent: farSplit },
          { xPercent: -farSplit },
          0
        );

      // Veil bàn giao — cắt pointer-events khi đã che quá 60% (cả section là
      // nút toggle, veil click-through sẽ nuốt click của block đang trườn lên).
      if (veil && veilMarker) {
        let covered = false;
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: veilMarker,
              scroller,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: 0.4,
              invalidateOnRefresh: true,
              onUpdate: self => {
                const off = self.progress > 0.6;
                if (off !== covered) {
                  covered = off;
                  viewport.style.pointerEvents = off ? 'none' : '';
                }
              },
            },
          })
          .fromTo(
            veil,
            { opacity: 0 },
            { opacity: 1, duration: 0.57, immediateRender: false },
            0.25
          )
          // Neo độ dài timeline = 1 — thiếu là veil bị kéo giãn cả quãng.
          .to({}, { duration: 1 }, 0);
      }

      // Mouse parallax — chữ ăn theo cùng giá trị với lớp far (cùng độ sâu).
      const finePointer = window.matchMedia(
        '(hover: hover) and (pointer: fine)'
      ).matches;
      if (finePointer) {
        const follow = { duration: 0.8, ease: 'power3.out' } as const;
        const nearX = gsap.quickTo(near, 'x', follow);
        const nearY = gsap.quickTo(near, 'y', follow);
        const farX = gsap.quickTo(far, 'x', follow);
        const farY = gsap.quickTo(far, 'y', follow);
        const copyX = gsap.quickTo(copy, 'x', follow);
        const copyY = gsap.quickTo(copy, 'y', follow);

        const maxNearX = () => {
          const bleedPx = (viewport.offsetWidth * BLEED.x) / 100;
          const scrollPx = (near.offsetWidth * nearSplit) / 100;
          return Math.max(0, bleedPx - scrollPx);
        };
        const maxFarX = () => {
          const bleedPx = (viewport.offsetWidth * BLEED.x * 0.55) / 100;
          const scrollPx = (far.offsetWidth * farSplit) / 100;
          return Math.max(0, bleedPx - scrollPx);
        };
        const maxNearY = () => (viewport.offsetHeight * BLEED.y) / 100;
        const maxFarY = () =>
          (viewport.offsetHeight * (BLEED.y * (2 / 3))) / 100;

        const onMove = (e: MouseEvent) => {
          if (revealed) return;
          const r = viewport.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          const ny = ((e.clientY - r.top) / r.height) * 2 - 1;

          const nMaxX = maxNearX();
          const fMaxX = maxFarX();
          const nMaxY = maxNearY();
          const fMaxY = maxFarY();

          const fx = gsap.utils.clamp(-fMaxX, fMaxX, nx * 28);
          const fy = gsap.utils.clamp(-fMaxY, fMaxY, ny * 10);

          nearX(gsap.utils.clamp(-nMaxX, nMaxX, -nx * 52));
          nearY(gsap.utils.clamp(-nMaxY, nMaxY, -ny * 18));
          farX(fx);
          farY(fy);
          copyX(fx);
          copyY(fy);
        };
        const onLeave = () => {
          if (revealed) return;
          gsap.to([near, far, copy], {
            x: 0,
            y: 0,
            duration: 1,
            ease: 'power2.out',
          });
        };

        viewport.addEventListener('mousemove', onMove, { passive: true });
        viewport.addEventListener('mouseleave', onLeave);
        removers.push(() => {
          viewport.removeEventListener('mousemove', onMove);
          viewport.removeEventListener('mouseleave', onLeave);
        });
      }
    }, root);

    // R4 — refresh khi lớp near load xong.
    const nearImg = near.querySelector<HTMLImageElement>('img');
    if (nearImg && !nearImg.complete) {
      nearImg.addEventListener('load', requestRefresh, { once: true });
      removers.push(() => nearImg.removeEventListener('load', requestRefresh));
    }

    return () => {
      removers.forEach(r => r());
      ctx.revert();
    };
  }, [rootRef, scroller, requestRefresh, isCanvas, isMobile]);
}
