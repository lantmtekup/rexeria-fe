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
  WestlyHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useWestlyPointer } from './WestlyPointer';
import { useContainerMobile } from './useContainerMobile';
import { WESTLY_FONT_DISPLAY } from './westlyTheme';

interface WestlyHeroProps {
  content: WestlyHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * The Westly Hero — port từ apps/the-westly Hero.tsx.
 *
 * Sân thượng penthouse 3 lớp (mây xa / mây gần / cảnh) trên khung thiết kế 3:2,
 * chữ nấp SAU lớp cảnh ở desktop; mouse parallax đẩy cảnh và chữ ngược hướng
 * nhau để lộ chữ; exit là veil (màu nền section sau) scrub phủ dần.
 *
 * Khác apps:
 * - Sticky section + section sau trườn lên → block TỰ chứa track (root 185dvh,
 *   stage sticky 100dvh); exit scrub bám chính root ('top top' → 'bottom
 *   bottom' = đúng quãng 85% viewport của bản gốc).
 * - Drag-pan mobile của bản gốc dùng gsap Observer — foundation không đăng ký
 *   Observer (R1 cấm registerPlugin trong block) nên bản block BỎ drag-pan;
 *   mobile vẫn xem đủ nhờ stage chặn 220cqw + mask chân.
 * - viewport md: / matchMedia layout → useContainerMobile + ternary inline.
 */

const DEFAULT_SCENE = '/the-westly/p1-hero.webp';
const DEFAULT_CLOUDS_FAR = '/the-westly/p2-hero.png';
const DEFAULT_CLOUDS_MID = '/the-westly/p3-hero.png';
const DEFAULT_VEIL = '#F3F1EA';

/** Mask chân stage trên mobile — cho sàn gạch tan vào nền trắng. */
const EDGE_MASK = 'linear-gradient(to bottom, #000 84%, transparent)';

/**
 * Biên độ mouse parallax. Bị chặn bởi bleed inset -5% của lớp scene/far
 * (5% khung 1440×960 ≈ 72px ngang / 48px dọc) — đẩy quá là lộ mép ảnh.
 * copy trôi CÙNG hướng chuột (ngược scene) nên không bị trần bleed: cộng dồn
 * ~136px ngang / 70px dọc đủ để chữ trượt hẳn ra khỏi cây/sân thượng.
 */
const PUSH = {
  scene: { x: 56, y: 30 },
  far: { x: 22, y: 11 },
  mid: { x: 48, y: 22 },
  copy: { x: 80, y: 40 },
} as const;

const TITLE_STYLE: React.CSSProperties = {
  margin: 0,
  // Hệ số cqi canh cho đạt 56px từ ~1024 (mốc lg của apps) — 3.9cqi chỉ đạt
  // max ở 1440, mọi khổ thật đều nhỏ hơn bản gốc.
  fontSize: 'clamp(28px, 5.5cqi, 56px)',
  lineHeight: 1.15,
  fontWeight: 500,
  color: '#6E7A6F',
  textWrap: 'balance',
};

const FILL_IMG_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const STAGE_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100dvh',
  overflow: 'hidden',
  backgroundColor: '#ffffff',
  // Chữ/khung đo bằng cqw/cqh theo hộp stage (bản apps đo theo section
  // [container-type:size]) — stage ở đây đóng đúng vai trò đó.
  containerType: 'size',
};

type LenisLike = { scrollTo: (target: number) => void };

export function WestlyHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: WestlyHeroProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const isCanvas = useIsCanvasEdit(rootRef);
  const pointer = useWestlyPointer(isCanvas);
  const { scroller } = useLandingMotion();
  const [ctaHovered, setCtaHovered] = React.useState(false);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const title = content.title?.trim() || 'The Master Penthouse.';
  const subtitle =
    content.subtitle?.trim() || 'Your Home above the Everything else.';
  const ctaText = content.ctaText?.trim() || 'EXPLORE';
  const ctaHref = content.ctaHref?.trim() || '';
  const sceneUrl = content.sceneUrl?.trim() || DEFAULT_SCENE;
  const sceneAlt = content.sceneAlt?.trim() || 'The Westly rooftop terrace';
  const cloudsFarUrl = content.cloudsFarUrl?.trim() || DEFAULT_CLOUDS_FAR;
  const cloudsMidUrl = content.cloudsMidUrl?.trim() || DEFAULT_CLOUDS_MID;
  const veilColor = content.veilColor?.trim() || DEFAULT_VEIL;

  useWestlyHeroMotion(rootRef, stageRef, isCanvas, isMobile);

  /**
   * EXPLORE không có link → mô phỏng bản gốc: cuộn qua hết track hero (điểm
   * exit kết thúc, section sau vào trọn màn). Có link thì để LinkNav/browser lo.
   */
  const onCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isCanvas) {
      e.preventDefault();
      return;
    }
    if (ctaHref && ctaHref !== '#') return;
    e.preventDefault();
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    if (scroller) {
      const top =
        scroller.scrollTop +
        rect.bottom -
        scroller.getBoundingClientRect().top -
        scroller.clientHeight;
      scroller.scrollTo({ top, behavior: 'smooth' });
      return;
    }
    const top = window.scrollY + rect.bottom - window.innerHeight;
    const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
    if (lenis) lenis.scrollTo(top);
    else window.scrollTo({ top, behavior: 'smooth' });
  };

  const renderTitleBlock = (staticLayout: boolean) => (
    <>
      <h1
        data-element-key='title'
        className={selectableClass(activeKey === 'title')}
        style={composeStyle(TITLE_STYLE, styleOf('title'))}
      >
        {title}
      </h1>
      <p
        data-element-key='subtitle'
        className={selectableClass(activeKey === 'subtitle')}
        style={composeStyle(
          TITLE_STYLE,
          staticLayout ? { marginTop: 4 } : undefined,
          styleOf('subtitle')
        )}
      >
        {subtitle}
      </p>
    </>
  );

  const renderCta = (extraStyle?: React.CSSProperties) => (
    <a
      data-wh='cta'
      data-element-key='ctaHref'
      href={isCanvas ? undefined : ctaHref || '#'}
      onClick={onCtaClick}
      aria-label={ctaText}
      onMouseEnter={() => setCtaHovered(true)}
      onMouseLeave={() => setCtaHovered(false)}
      className={selectableClass(activeKey === 'ctaHref')}
      style={composeStyle(
        {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 44,
          padding: '10px 32px',
          border: '1px solid',
          borderColor: ctaHovered ? '#6E7A6F' : '#e5e5e5',
          backgroundColor: ctaHovered ? '#6E7A6F' : '#ffffff',
          color: ctaHovered ? '#ffffff' : '#404040',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          transition:
            'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease',
          textDecoration: 'none',
        },
        extraStyle,
        styleOf('ctaHref')
      )}
    >
      <span
        data-element-key='ctaText'
        className={selectableClass(activeKey === 'ctaText')}
        style={composeStyle(
          {
            fontSize: 'clamp(10px, 1.1cqi, 11px)',
            fontWeight: 500,
            letterSpacing: '0.3em',
          },
          styleOf('ctaText')
        )}
      >
        {ctaText}
      </span>
    </a>
  );

  const renderLayerImage = (
    key: 'sceneUrl' | 'cloudsFarUrl' | 'cloudsMidUrl',
    src: string,
    alt: string,
    style?: React.CSSProperties
  ) => (
    <img
      src={src}
      alt={alt}
      data-element-key={key}
      className={selectableClass(activeKey === key)}
      style={composeStyle(style, styleOf(key))}
    />
  );

  // ── Editor canvas: layout phẳng — chữ/CTA/3 lớp ảnh/màu veil đều bấm được,
  //    không sticky track 185dvh chiếm canvas, không motion. ──
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
            backgroundColor: '#ffffff',
            padding: '40px 24px',
          },
          blockBackgroundStyle(background)
        )}
      >
        <div
          style={{ maxWidth: '64rem', margin: '0 auto', textAlign: 'center' }}
        >
          {renderTitleBlock(true)}
          <div style={{ marginTop: 24 }}>{renderCta()}</div>
        </div>

        <div className='mt-8 grid grid-cols-1 gap-4 @2xl:grid-cols-3'>
          {(
            [
              ['sceneUrl', sceneUrl, sceneAlt, 'Ảnh sân thượng'],
              ['cloudsFarUrl', cloudsFarUrl, '', 'Mây xa (nền)'],
              ['cloudsMidUrl', cloudsMidUrl, '', 'Mây gần'],
            ] as const
          ).map(([key, src, alt, caption]) => (
            <figure key={key} style={{ margin: 0 }}>
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '3 / 2',
                  overflow: 'hidden',
                  backgroundColor: '#fafafa',
                  border: '1px solid #e5e5e5',
                }}
              >
                {renderLayerImage(key, src, alt, FILL_IMG_STYLE)}
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
          style={{
            marginTop: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 12, color: '#737373' }}>
            Màu veil (nền section kế tiếp):
          </span>
          <span
            data-element-key='veilColor'
            className={selectableClass(activeKey === 'veilColor')}
            style={composeStyle(
              {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                border: '1px solid #e5e5e5',
                fontSize: 12,
                color: '#404040',
              },
              styleOf('veilColor')
            )}
          >
            <span
              aria-hidden
              style={{
                width: 16,
                height: 16,
                display: 'inline-block',
                backgroundColor: veilColor,
                border: '1px solid #d4d4d4',
              }}
            />
            {veilColor}
          </span>
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: layout production — track sticky + parallax + veil ──
  const layerMask = isMobile
    ? {
        maskImage: EDGE_MASK,
        WebkitMaskImage: EDGE_MASK,
      }
    : undefined;

  return (
    <section
      ref={rootRef}
      data-westly-scope=''
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        {
          fontFamily: WESTLY_FONT_DISPLAY,
          height: '185dvh',
          backgroundColor: '#ffffff',
        },
        blockBackgroundStyle(background)
      )}
    >
      {pointer}
      <div ref={stageRef} style={STAGE_STYLE}>
        {/* Khung thiết kế 3:2 (1440×960) phủ stage — các lớp giữ % theo khung
            để scale đồng bộ; stage crop mép ở khổ khác. Dưới mobile chặn
            220cqw, chấp nhận dải trắng trên/dưới (trời + nền đều trắng). */}
        <div
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            aspectRatio: '3 / 2',
            width: isMobile
              ? 'min(220cqw, max(100cqw, 150cqh))'
              : 'max(100cqw, 150cqh)',
          }}
        >
          {/* Mây xa — full khung. inset -5% = trần biên độ parallax (PUSH). */}
          <div
            data-wh='far'
            style={{
              position: 'absolute',
              inset: '-5%',
              visibility: 'hidden',
              opacity: 0,
              willChange: 'transform',
              ...layerMask,
            }}
          >
            <div data-wh='far-drift' style={{ position: 'absolute', inset: 0 }}>
              {renderLayerImage(
                'cloudsFarUrl',
                cloudsFarUrl,
                '',
                FILL_IMG_STYLE
              )}
            </div>
          </div>

          {/* Mây gần — dải nổi trong khung */}
          <div
            data-wh='mid'
            style={{
              position: 'absolute',
              top: '24.5%',
              left: '19.2%',
              width: '61.5%',
              visibility: 'hidden',
              opacity: 0,
              willChange: 'transform',
            }}
          >
            <div data-wh='mid-drift'>
              {renderLayerImage('cloudsMidUrl', cloudsMidUrl, '', {
                display: 'block',
                width: '100%',
                height: 'auto',
              })}
            </div>
          </div>

          {/* Khối chữ — trong khung để cùng stacking context với lớp cảnh
              (desktop z 1 < cảnh z 2 → chữ nấp sau sân thượng); số đo theo
              stage (cqw/cqh), không theo khung. */}
          <div
            data-wh='copy'
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(100cqw, 64rem)',
              padding: '0 24px',
              textAlign: 'center',
              visibility: 'hidden',
              opacity: 0,
              top: isMobile ? 'calc(50% - 38cqh)' : '20%',
              zIndex: isMobile ? 3 : 1,
            }}
          >
            {/* Lớp drift riêng cho parallax — entrance tween y của [data-wh=copy],
                ghi chung một node là hai bên giành transform. */}
            <div data-wh='copy-drift'>{renderTitleBlock(false)}</div>
          </div>

          {/* Lớp cảnh (sân thượng) — che chữ ở desktop */}
          <div
            data-wh='scene'
            style={{
              position: 'absolute',
              inset: '-5%',
              zIndex: 2,
              visibility: 'hidden',
              opacity: 0,
              willChange: 'transform',
              ...layerMask,
            }}
          >
            {renderLayerImage('sceneUrl', sceneUrl, sceneAlt, FILL_IMG_STYLE)}
          </div>
        </div>

        {renderCta({
          position: 'absolute',
          bottom: isMobile ? 32 : 40,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          visibility: 'hidden',
          opacity: 0,
        })}

        {/* Veil bàn giao — cùng màu nền section sau, hero tan vào thay vì bị
            cắt mép. will-change opacity: scrub đổi opacity mỗi frame trên mảng
            full-viewport, cho nó layer riêng khỏi repaint cảnh bên dưới. */}
        <div
          data-wh='veil'
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
    </section>
  );
}

/**
 * Toàn bộ motion production: entrance on-mount, drift mây, exit scrub theo
 * track của chính block, mouse parallax frame-lerp. Giữ nguyên timing của
 * apps/the-westly; chỉ đổi hợp đồng host (scroller, container, cleanup).
 */
function useWestlyHeroMotion(
  rootRef: React.RefObject<HTMLElement | null>,
  stageRef: React.RefObject<HTMLDivElement | null>,
  isCanvas: boolean,
  isMobile: boolean
) {
  const { scroller, requestRefresh } = useLandingMotion();

  React.useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage || isCanvas) return;

    const q = (name: string) =>
      stage.querySelector<HTMLElement>(`[data-wh="${name}"]`);
    const scene = q('scene');
    const far = q('far');
    const mid = q('mid');
    const farDrift = q('far-drift');
    const midDrift = q('mid-drift');
    const copy = q('copy');
    const copyDrift = q('copy-drift');
    const cta = q('cta');
    const veil = q('veil');
    if (!scene || !far || !mid || !farDrift || !midDrift || !copy || !veil)
      return;

    const ui = cta ? [copy, cta] : [copy];
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const removers: Array<() => void> = [];

    const ctx = gsap.context(() => {
      if (reduce) {
        // Trạng thái kết: mọi thứ hiện, không tween.
        gsap.set([scene, far, mid, ...ui], { autoAlpha: 1 });
        return;
      }

      // Ẩn trước paint đầu (markup đã visibility:hidden sẵn — set ở đây để
      // fromTo có from tường minh, refresh giữa chừng không ghi nhầm start).
      gsap.set(scene, { autoAlpha: 0, scale: 1.12 });
      gsap.set([far, mid, ...ui], { autoAlpha: 0 });

      // Entrance — hero above the fold, chạy ngay khi mount.
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 1 },
      });
      tl.fromTo([far, mid], { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 })
        .fromTo(
          scene,
          { autoAlpha: 0, scale: 1.12 },
          { autoAlpha: 1, scale: 1, duration: 1.4 },
          '<0.15'
        )
        .fromTo(
          ui,
          { autoAlpha: 0, y: -16 },
          { autoAlpha: 1, y: 0, stagger: 0.12 },
          '-=0.6'
        );

      // Reload/back-nav khôi phục scroll giữa trang → entrance sẽ đánh nhau
      // với exit scrub trên cùng autoAlpha cả duration. Nhảy thẳng trạng thái kết.
      const scrolled = scroller ? scroller.scrollTop > 0 : window.scrollY > 0;
      if (scrolled) tl.progress(1);

      // Cùng bẫy đó ở scroll 0: range exit bắt đầu ngay khi root chạm đỉnh —
      // cuộn trong lúc entrance còn chạy = hai tween giành scale/autoAlpha mỗi
      // frame → giật. Người dùng đã cuộn thì entrance coi như xong.
      const scrollHost: EventTarget = scroller ?? window;
      const finishEntranceOnScroll = () => {
        if (tl.progress() < 1) tl.progress(1);
      };
      scrollHost.addEventListener('scroll', finishEntranceOnScroll, {
        passive: true,
        once: true,
      });
      removers.push(() =>
        scrollHost.removeEventListener('scroll', finishEntranceOnScroll)
      );

      // Drift mây ambient (chỉ x — yPercent thuộc về exit scrub)
      const driftTweens = [
        gsap.to(farDrift, {
          x: '+=12',
          duration: 26,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        }),
        gsap.to(midDrift, {
          x: '-=18',
          duration: 18,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        }),
      ];

      // Exit — veil phủ dần trong quãng stage còn dính (85dvh cuối của track).
      // fromTo với from tường minh + immediateRender:false: refresh giữa chừng
      // không nuốt trạng thái, và không đè entrance trước khi user cuộn.
      // onLeave/onEnterBack: hero bị veil che kín thì cho drift ngủ — hai tween
      // vô hạn trên layer vô hình chỉ bắt compositor vẽ lại suốt phần còn trang.
      const exit = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.4,
          invalidateOnRefresh: true,
          onLeave: () => driftTweens.forEach(t => t.pause()),
          onEnterBack: () => driftTweens.forEach(t => t.play()),
        },
      });
      exit
        .fromTo(
          veil,
          { opacity: 0 },
          { opacity: 1, duration: 0.57, immediateRender: false },
          0.25
        )
        .fromTo(
          scene,
          { scale: 1 },
          { scale: 1.18, duration: 1, immediateRender: false },
          0
        )
        .fromTo(
          far,
          { xPercent: 0, autoAlpha: 1 },
          { xPercent: -16, autoAlpha: 0, duration: 1, immediateRender: false },
          0
        )
        .fromTo(
          mid,
          { xPercent: 0, autoAlpha: 1 },
          { xPercent: 45, autoAlpha: 0, duration: 1, immediateRender: false },
          0
        )
        .fromTo(
          ui,
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.25, immediateRender: false },
          0
        )
        // Thả lớp cảnh chỉ khi veil đã che — ảnh còn đọc được qua blend.
        .fromTo(
          scene,
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.15, immediateRender: false },
          0.82
        );

      // Mouse parallax — frame-lerp, chỉ máy có chuột thật.
      const finePointer = window.matchMedia(
        '(hover: hover) and (pointer: fine)'
      ).matches;
      if (finePointer && !isMobile) {
        const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
        const LERP = 0.09;
        // Đứng yên thì thôi ghi style — set transform mỗi frame giữ các layer
        // full-viewport luôn dirty, compositor vẽ lại cả khi chuột bất động.
        let settled = true;

        // quickSetter: không cấp phát tween mới mỗi frame như gsap.set.
        const setScene = gsap.quickSetter(scene, 'css');
        const setFar = gsap.quickSetter(far, 'css');
        const setMid = gsap.quickSetter(mid, 'css');
        const setCopy = copyDrift ? gsap.quickSetter(copyDrift, 'css') : null;

        const onMove = (e: MouseEvent) => {
          // Đo rect mỗi lần: stage sticky giữa trang nên rect đổi theo scroll.
          const b = stage.getBoundingClientRect();
          pointer.targetX = ((e.clientX - b.left) / b.width) * 2 - 1;
          pointer.targetY = ((e.clientY - b.top) / b.height) * 2 - 1;
          settled = false;
        };
        const onLeave = () => {
          pointer.targetX = 0;
          pointer.targetY = 0;
          settled = false;
        };

        const onTick = () => {
          if (settled) return;
          const t = 1 - Math.pow(1 - LERP, gsap.ticker.deltaRatio());
          pointer.x += (pointer.targetX - pointer.x) * t;
          pointer.y += (pointer.targetY - pointer.y) * t;

          if (
            Math.abs(pointer.x) < 0.0004 &&
            Math.abs(pointer.y) < 0.0004 &&
            pointer.targetX === 0 &&
            pointer.targetY === 0
          ) {
            pointer.x = 0;
            pointer.y = 0;
            settled = true; // ghi nốt frame 0 này rồi im
          }

          setScene({
            x: -pointer.x * PUSH.scene.x,
            y: -pointer.y * PUSH.scene.y,
          });
          setFar({ x: pointer.x * PUSH.far.x, y: pointer.y * PUSH.far.y });
          setMid({ x: pointer.x * PUSH.mid.x, y: pointer.y * PUSH.mid.y });
          setCopy?.({
            x: pointer.x * PUSH.copy.x,
            y: pointer.y * PUSH.copy.y,
          });
        };

        gsap.ticker.add(onTick);
        stage.addEventListener('mousemove', onMove, { passive: true });
        stage.addEventListener('mouseleave', onLeave);
        removers.push(() => {
          gsap.ticker.remove(onTick);
          stage.removeEventListener('mousemove', onMove);
          stage.removeEventListener('mouseleave', onLeave);
          gsap.set(
            copyDrift ? [scene, far, mid, copyDrift] : [scene, far, mid],
            { x: 0, y: 0 }
          );
        });
      }
    }, stage);

    // R4 — ảnh cảnh load xong thì refresh trigger.
    const sceneImg = scene.querySelector<HTMLImageElement>('img');
    if (sceneImg && !sceneImg.complete) {
      sceneImg.addEventListener('load', requestRefresh, { once: true });
      removers.push(() => sceneImg.removeEventListener('load', requestRefresh));
    }

    return () => {
      removers.forEach(r => r());
      ctx.revert();
    };
  }, [rootRef, stageRef, scroller, requestRefresh, isCanvas, isMobile]);
}
