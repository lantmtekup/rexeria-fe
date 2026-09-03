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
  WestlySceneContent,
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

interface WestlySceneProps {
  content: WestlySceneContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * The Westly · Scene — port từ apps/the-westly SceneParallax.tsx.
 *
 * Bản vẽ phòng 2 lớp nét chì (near/far) quét ngang ngược chiều khi scroll +
 * mouse parallax có clamp theo bleed; bấm nút lật sang ảnh thật; mép trên tan
 * bằng feather mask lúc trườn vào; exit là veil bàn giao.
 *
 * Khác apps:
 * - Sticky + dwell spacer + veil bám #residences (page-level) → block TỰ chứa
 *   track: stage sticky 100dvh + dwell (100dvh desktop / 60dvh mobile, đúng
 *   ngân sách sweep gốc) + 35dvh veil (marker đáy root).
 * - Bỏ bg fade-in (đền bù ProductShowcase ghim bên dưới ở page-level) — nền
 *   đặc `bgColor` từ đầu; feather mask + cổng gate giữ lại vì tự chứa được và
 *   là thứ làm mép trên không thành nhát cắt.
 * - Drag-pan mobile dùng gsap Observer — foundation không đăng ký (R1) → bỏ.
 * - Reveal toggle chuyển sang React state (label/aria do React render); tween
 *   ảnh vẫn gsap y như apps — cùng engine với scrub nên không giành transform.
 */

const DEFAULT_NEAR = '/the-westly/s3-p1.png';
const DEFAULT_FAR = '/the-westly/s3-p2.png';
const DEFAULT_PHOTO = '/the-westly/s3-p3.png';
const DEFAULT_BG = '#ffffff';
const DEFAULT_VEIL = '#F3F1EA';

const ACCENT = '#6E7A6F';

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

const FILL_IMG_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
};

export function WestlyScene({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: WestlySceneProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const isCanvas = useIsCanvasEdit(rootRef);
  const pointer = useWestlyPointer(isCanvas);
  const [revealed, setRevealed] = React.useState(false);
  // Motion effect đọc qua ref để không phải nằm trong deps (toggle không được
  // rebuild toàn bộ ScrollTrigger).
  const revealedRef = React.useRef(false);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const eyebrow = content.eyebrow?.trim() || 'APARTMENT SPACE';
  const title =
    content.title?.trim() ||
    'Classic New York charm with welcomed modern twists.';
  const revealShowLabel = content.revealShowLabel?.trim() || 'VIEW PENTHOUSE B';
  const revealHideLabel = content.revealHideLabel?.trim() || 'BACK TO SKETCH';
  const nearUrl = content.nearUrl?.trim() || DEFAULT_NEAR;
  const nearAlt = content.nearAlt?.trim() || 'The Westly interior sketch';
  const farUrl = content.farUrl?.trim() || DEFAULT_FAR;
  const photoUrl = content.photoUrl?.trim() || DEFAULT_PHOTO;
  const photoAlt = content.photoAlt?.trim() || '';
  const bgColor = content.bgColor?.trim() || DEFAULT_BG;
  const veilColor = content.veilColor?.trim() || DEFAULT_VEIL;

  useWestlySceneMotion(rootRef, isCanvas, isMobile, revealedRef);

  /**
   * Lật sketch ↔ ảnh thật. Tween gsap y hệt apps (autoAlpha + scale trên
   * wrapper) — cùng engine với scrub xPercent nên transform được merge chứ
   * không giành nhau; label/aria do React render từ state.
   */
  const onReveal = () => {
    if (isCanvas) return;
    const root = rootRef.current;
    if (!root) return;
    const q = (name: string) =>
      root.querySelector<HTMLElement>(`[data-wsc="${name}"]`);
    const photo = q('photo');
    const near = q('near');
    const far = q('far');
    if (!photo || !near || !far) return;

    const next = !revealedRef.current;
    revealedRef.current = next;
    setRevealed(next);

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const duration = reduce ? 0 : 0.7;

    // Trả offset mouse-parallax về 0 trước khi đổi lớp — lớp sắp hiện không
    // được thừa hưởng cú đẩy chuột của lớp vừa ẩn.
    gsap.to([near, far], { x: 0, y: 0, duration: reduce ? 0 : 0.4 });
    gsap.to(photo, {
      autoAlpha: next ? 1 : 0,
      duration,
      ease: 'power2.inOut',
    });
    gsap.to([near, far], {
      autoAlpha: next ? 0 : 1,
      scale: next ? 1.02 : 1,
      duration,
      ease: 'power2.inOut',
      stagger: 0.06,
    });
  };

  const renderCopyFields = () => (
    <>
      <p
        data-wsc-copy-item=''
        data-element-key='eyebrow'
        className={selectableClass(activeKey === 'eyebrow')}
        style={composeStyle(
          {
            margin: 0,
            fontFamily: WESTLY_FONT_UI,
            fontSize: 'clamp(11px, 1.2cqi, 12px)',
            lineHeight: 1,
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: ACCENT,
          },
          styleOf('eyebrow')
        )}
      >
        {eyebrow}
      </p>
      <h2
        data-wsc-copy-item=''
        data-element-key='title'
        className={selectableClass(activeKey === 'title')}
        style={composeStyle(
          {
            margin: 0,
            marginTop: 'clamp(10px, 1.2cqi, 16px)',
            maxWidth: 'min(100%, 44rem)',
            fontSize: 'clamp(28px, 4.7cqi, 48px)',
            lineHeight: 1.25,
            fontWeight: 500,
            color: ACCENT,
            textWrap: 'balance',
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

  const revealButtonStyle = (extra?: React.CSSProperties) =>
    composeStyle(
      {
        pointerEvents: 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        padding: '10px clamp(24px, 3.9cqi, 40px)',
        border: '1px solid #e5e5e5',
        backgroundColor: '#ffffff',
        color: '#404040',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition:
          'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease',
      },
      extra
    );

  const revealLabelStyle = (key: 'revealShowLabel' | 'revealHideLabel') =>
    composeStyle(
      {
        fontSize: 'clamp(10px, 1.1cqi, 11px)',
        fontWeight: 500,
        letterSpacing: isMobile ? '0.2em' : '0.35em',
      },
      styleOf(key)
    );

  // ── Editor canvas: layout phẳng — copy + 2 nhãn nút + 3 lớp ảnh + màu ──
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
        </div>

        <div
          className='mt-6 flex flex-wrap items-start justify-center gap-3'
          style={{ textAlign: 'center' }}
        >
          {(
            [
              ['revealShowLabel', revealShowLabel, 'Nhãn khi đang xem sketch'],
              ['revealHideLabel', revealHideLabel, 'Nhãn khi đang xem ảnh'],
            ] as const
          ).map(([key, label, caption]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <span
                data-element-key={key}
                className={selectableClass(activeKey === key)}
                style={composeStyle(
                  revealButtonStyle({ pointerEvents: 'none' }),
                  revealLabelStyle(key)
                )}
              >
                {label}
              </span>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#737373' }}>
                {caption}
              </p>
            </div>
          ))}
        </div>

        <div className='mt-8 grid grid-cols-1 gap-4 @2xl:grid-cols-3'>
          {(
            [
              ['nearUrl', nearUrl, nearAlt, 'Lớp nét trước (near)'],
              ['farUrl', farUrl, '', 'Lớp nét sau (far)'],
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

  // ── PreviewMode + /p: production — sticky track + sweep + reveal + veil ──
  const currentLabelKey = revealed ? 'revealHideLabel' : 'revealShowLabel';

  return (
    <section
      ref={rootRef}
      data-westly-scope=''
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        {
          fontFamily: WESTLY_FONT_DISPLAY,
          // 100dvh stage + dwell (ngân sách sweep: 100dvh desktop / 60dvh
          // mobile như apps) + 35dvh veil.
          height: isMobile ? '195dvh' : '235dvh',
          backgroundColor: bgColor,
        },
        blockBackgroundStyle(background)
      )}
    >
      {pointer}
      <div
        data-wsc='viewport'
        style={{
          position: 'sticky',
          top: 0,
          height: '100dvh',
          overflow: 'hidden',
          backgroundColor: bgColor,
          containerType: 'size',
        }}
      >
        {/* Stage 1440/820 phủ hộp sticky; mobile chặn 160cqw + mask dọc */}
        <div
          data-wsc='stage'
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
            data-wsc='photo'
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
            data-wsc='far'
            style={{
              position: 'absolute',
              ...LAYER_INSET,
              willChange: 'transform',
            }}
          >
            {renderImage('farUrl', farUrl, '')}
          </div>

          <div
            data-wsc='near'
            style={{
              position: 'absolute',
              ...LAYER_INSET,
              willChange: 'transform',
            }}
          >
            {renderImage('nearUrl', nearUrl, nearAlt)}
          </div>
        </div>

        {/* Copy + nút đi cùng một cụm giữa stage; wrapper trơ pointer — chỉ
            nút nhận click. */}
        <div
          data-wsc='copy'
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            insetInline: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0 24px',
            textAlign: 'center',
          }}
        >
          {renderCopyFields()}

          <button
            data-wsc='reveal'
            type='button'
            {...westlyCursorToggle}
            aria-pressed={revealed}
            aria-label={revealed ? revealHideLabel : revealShowLabel}
            onClick={onReveal}
            style={revealButtonStyle({
              marginTop: 'clamp(40px, 4cqi, 56px)',
              visibility: 'hidden',
              opacity: 0,
            })}
          >
            <span style={revealLabelStyle(currentLabelKey)}>
              {revealed ? revealHideLabel : revealShowLabel}
            </span>
          </button>
        </div>

        {/* Veil bàn giao */}
        <div
          data-wsc='veil'
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

      {/* Mốc đo veil — 35dvh cuối track ('top bottom'→'top 65%' của bản gốc) */}
      <div
        data-wsc='veil-marker'
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '35dvh',
          pointerEvents: 'none',
        }}
      />
    </section>
  );
}

/**
 * Motion production — giữ timing apps, đổi hợp đồng host. Mọi trigger bám
 * chính root (track tự chứa) thay vì wrapper/dwell/#residences của page.
 */
function useWestlySceneMotion(
  rootRef: React.RefObject<HTMLElement | null>,
  isCanvas: boolean,
  isMobile: boolean,
  revealedRef: React.RefObject<boolean>
) {
  const { scroller, requestRefresh } = useLandingMotion();

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || isCanvas) return;

    const q = (name: string) =>
      root.querySelector<HTMLElement>(`[data-wsc="${name}"]`);
    const viewport = q('viewport');
    const stage = q('stage');
    const photo = q('photo');
    const far = q('far');
    const near = q('near');
    const copy = q('copy');
    const reveal = q('reveal');
    const veil = q('veil');
    const veilMarker = q('veil-marker');
    const copyItems = root.querySelectorAll<HTMLElement>(
      '[data-wsc-copy-item]'
    );
    if (!viewport || !stage || !photo || !far || !near || !copy || !reveal)
      return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const removers: Array<() => void> = [];

    const nearSplit = isMobile ? 4 : 7;
    const farSplit = isMobile ? 2.5 : 4;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set([stage, copy, reveal, ...Array.from(copyItems)], {
          autoAlpha: 1,
        });
        gsap.set(photo, { autoAlpha: 0 });
        return;
      }

      gsap.set(photo, { autoAlpha: 0 });
      gsap.set([far, near], { autoAlpha: 1 });

      // MÉP TAN — mask dải trên trong suốt đúng bằng khoảng cách mép → đỉnh
      // màn khi block trườn vào, nên mép trên không bao giờ thành nhát cắt.
      // KHÔNG scrub: mask phải bám đúng vị trí mép thật. Phủ kín màn thì gỡ
      // hẳn mask, khỏi ôm thêm một lớp composite suốt phần còn lại của trang.
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

      // CỔNG — bản vẽ chỉ hiện khi block đã chiếm nửa dưới màn; scrub nên cuộn
      // ngược thì tan ngược y hệt. Gác ở hai cái bọc stage/copy mà không tween
      // nào khác đụng tới, nên trạng thái reveal bên trong không bị giẫm.
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

      // Entrance — "an vị": scale nhả ra + copy so le, chạy đúng lúc cổng mở.
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
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 },
          '-=0.6'
        )
        .fromTo(
          reveal,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          '-=0.5'
        );

      // SWEEP — hai lớp nét quét ngược chiều trong đúng quãng dwell (phần track
      // sau khi stage dính đỉnh). Splits < BLEED nên scroll + chuột không lộ mép.
      // immediateRender giữ mặc định (true): from không phải vị trí tự nhiên,
      // defer là lớp đứng im rồi giật ngang ~146px trong một frame.
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
        .fromTo(near, { xPercent: nearSplit }, { xPercent: -nearSplit }, 0)
        .fromTo(far, { xPercent: -farSplit }, { xPercent: farSplit }, 0);

      // Veil bàn giao — from tường minh + immediateRender:false (refresh giữa
      // chừng không nuốt trạng thái). Veil che luôn nút reveal nên nút phải tắt.
      if (veil && veilMarker) {
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
            },
          })
          .fromTo(
            veil,
            { opacity: 0 },
            { opacity: 1, duration: 0.85, immediateRender: false },
            0
          )
          .fromTo(
            reveal,
            { autoAlpha: 1 },
            { autoAlpha: 0, duration: 0.25, immediateRender: false },
            0
          )
          // Neo độ dài timeline = 1 — thiếu là veil bị kéo giãn cả quãng.
          .to({}, { duration: 1 }, 0);
      }

      // Mouse parallax — clamp theo bleed trừ đi quãng xPercent của sweep.
      const finePointer = window.matchMedia(
        '(hover: hover) and (pointer: fine)'
      ).matches;
      if (finePointer) {
        const follow = { duration: 0.8, ease: 'power3.out' } as const;
        const nearX = gsap.quickTo(near, 'x', follow);
        const nearY = gsap.quickTo(near, 'y', follow);
        const farX = gsap.quickTo(far, 'x', follow);
        const farY = gsap.quickTo(far, 'y', follow);

        // Bleed là % stage; xPercent là % bề ngang layer — đổi cả hai ra px.
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
          if (revealedRef.current) return;
          const r = viewport.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          const ny = ((e.clientY - r.top) / r.height) * 2 - 1;

          const nMaxX = maxNearX();
          const fMaxX = maxFarX();
          const nMaxY = maxNearY();
          const fMaxY = maxFarY();

          nearX(gsap.utils.clamp(-nMaxX, nMaxX, -nx * 52));
          nearY(gsap.utils.clamp(-nMaxY, nMaxY, -ny * 18));
          farX(gsap.utils.clamp(-fMaxX, fMaxX, nx * 28));
          farY(gsap.utils.clamp(-fMaxY, fMaxY, ny * 10));
        };
        const onLeave = () => {
          if (revealedRef.current) return;
          gsap.to([near, far], { x: 0, y: 0, duration: 1, ease: 'power2.out' });
        };

        viewport.addEventListener('mousemove', onMove, { passive: true });
        viewport.addEventListener('mouseleave', onLeave);
        removers.push(() => {
          viewport.removeEventListener('mousemove', onMove);
          viewport.removeEventListener('mouseleave', onLeave);
        });
      }
    }, root);

    // R4 — refresh khi lớp near (quyết định thị giác) load xong.
    const nearImg = near.querySelector<HTMLImageElement>('img');
    if (nearImg && !nearImg.complete) {
      nearImg.addEventListener('load', requestRefresh, { once: true });
      removers.push(() => nearImg.removeEventListener('load', requestRefresh));
    }

    return () => {
      removers.forEach(r => r());
      ctx.revert();
    };
  }, [rootRef, scroller, requestRefresh, isCanvas, isMobile, revealedRef]);
}
