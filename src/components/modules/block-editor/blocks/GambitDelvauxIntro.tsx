'use client';

/**
 * Block "Intro - Curtain Reveal" (port `Intro` của apps/gambit-delvaux) —
 * giữ NGUYÊN layout, style token và timing của bản app:
 *
 *  - Phase 1: 2 màn (nửa trên / nửa dưới) tách ra 1.35s `power3.in`;
 *  - Phase 2: giữ khung full 0.6s, cụm logo dip xuống 12px + scale 1.05 (0.28s);
 *  - Phase 3: cụm logo bay lên đỉnh + thu nhỏ để icon-text về đúng 132px (1.5s),
 *    icon trên scale 0.45 rồi fade ở `transition+=1.0`; ảnh sản phẩm trồi lên
 *    (y 0 + autoAlpha 1) cùng 1.5s;
 *  - Phase 4: tên sản phẩm hiện theo clip trái→phải từng ký tự (2.2s
 *    `power3.out`), dòng chữ scale vừa ~98% bề ngang khung nhìn;
 *  - Exit: cả màn trượt xuống `yPercent 100` (0.55s `power3.in`) rồi unmount.
 *
 * Khác apps (đúng contract host — apps-port-host):
 *  - `position: fixed` không sống được trong `@container` → nhánh overlay BỎ
 *    `@container` khỏi `<section>` root (overlay tự mang container của nó), nhờ
 *    vậy trên `/p` overlay render TẠI CHỖ và có mặt ngay trong HTML SSR. Chỉ
 *    portal qua `resolveDrawerPortalHost` khi host là device frame /
 *    `[data-landing-preview]`, ở đó overlay dùng `absolute inset-0`.
 *    ⚠ Overlay `fixed` inline chỉ đúng khi không ancestor nào tạo containing
 *    block — transition `roll-up` / `parallax` (`TemplateTransitions`) bọc block
 *    bằng `sticky z-index` / `will-change: transform` sẽ trap nó;
 *  - `window.innerWidth/innerHeight` → đo CHÍNH overlay (device frame /
 *    viewport), nếu không mọi mốc bay/scale sẽ sai trong preview 390/834;
 *  - `document.body.style.overflow = 'hidden'` thô → lock theo pattern
 *    `useDrawerScrollLock` (scroller trong editor / html + Lenis trên `/p`);
 *  - `gsap.matchMedia(MOTION_CONDITIONS)` (điều kiện viewport) → `gsap.context`
 *    + kiểm tra `prefers-reduced-motion` (block không dùng breakpoint viewport);
 *  - `md:` / `lg:` / `vw` → `@2xl:` / `@4xl:` / `cqi` (canvas responsive spec);
 *  - token thiết kế (font, cỡ chữ, màu, letter-spacing) chuyển từ class Tailwind
 *    sang inline base + `styleOf(key)` để toolbar editor override được.
 *
 * Canvas editor (và mini-preview không có LandingMotionRoot): fork sang lưới
 * phẳng — mọi field hiện cùng lúc, không overlay/khoá scroll/animation.
 * PreviewMode + `/p` giữ nguyên production.
 *
 * Font dùng chung cụm Delvaux (`delvauxTheme`) — Genath + Atlas Grotesk đã
 * self-host ở `public/delvaux/font`.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import {
  DELVAUX_FONT_BODY,
  DELVAUX_FONT_CSS,
  DELVAUX_FONT_HEADING,
} from './delvauxTheme';
import { GAMBIT_DELVAUX_INTRO_DEFAULTS } from './_registry/defs/gambitDelvauxIntro';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  GambitDelvauxIntroContent,
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
  content: GambitDelvauxIntroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

type LenisLike = { stop: () => void; start: () => void };

const getLenis = (): LenisLike | undefined =>
  (window as unknown as { __lenis?: LenisLike }).__lenis;

/** Nền gốc của màn intro (`bg-[#F5F5F5]`). */
const INTRO_BG = '#f5f5f5';
/** Khoảng cách từ mép trên tới tâm cụm logo khi đã lên đỉnh (px, bản gốc). */
const LOGO_TOP_OFFSET = 28;
/** Chiều rộng icon-text khi đã lên top. */
const ICON_TEXT_FINAL_WIDTH = 132;
const CLIP_HIDDEN = 'inset(0 100% 0 0)';
const CLIP_VISIBLE = 'inset(0 0% 0 0)';
/** Overlay phải nằm trên mọi chrome khác của trang (header Delvaux dùng 999). */
const OVERLAY_Z = 1000;

export function GambitDelvauxIntro({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const curtainTopRef = React.useRef<HTMLDivElement>(null);
  const curtainBottomRef = React.useRef<HTMLDivElement>(null);
  const logoGroupRef = React.useRef<HTMLDivElement>(null);
  const logoTopRef = React.useRef<HTMLImageElement>(null);
  const logoTextRef = React.useRef<HTMLImageElement>(null);
  const productWrapRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  /** Hàm skip do effect motion cài — nút bấm chỉ gọi xuyên qua ref. */
  const skipRef = React.useRef<(() => void) | null>(null);

  const { hasRoot, scroller } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);
  const [showIntro, setShowIntro] = React.useState(true);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const D = GAMBIT_DELVAUX_INTRO_DEFAULTS;
  const logoTopUrl = content.logoTopUrl?.trim() || D.logoTopUrl;
  const logoTextUrl = content.logoTextUrl?.trim() || D.logoTextUrl;
  const logoTextAlt = content.logoTextAlt?.trim() || D.logoTextAlt;
  const productImageUrl = content.productImageUrl?.trim() || D.productImageUrl;
  const productImageAlt = content.productImageAlt?.trim() || D.productImageAlt;
  const title = content.title?.trim() || D.title;
  const skipLabel = content.skipLabel?.trim() || D.skipLabel;

  /**
   * Host portal CHỈ cần khi overlay phải bám vào khung preview
   * (`[data-device-frame]` / `[data-landing-preview]`). Trên `/p`,
   * `resolveDrawerPortalHost` trả về `document.body` — portal tới đó không đổi
   * gì về mặt layout mà chỉ khiến overlay xuất hiện SAU hydrate: HTML server
   * gửi xuống không có nó ⇒ browser paint các block phía dưới trước rồi intro
   * mới ập lên. Giữ `null` ở case đó để render overlay TẠI CHỖ, có mặt ngay
   * trong HTML SSR và phủ kín từ frame đầu tiên.
   */
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || isCanvas) {
      setPortalHost(null);
      return;
    }
    const host = resolveDrawerPortalHost(root);
    setPortalHost(host === document.body ? null : host);
  }, [hasRoot, isCanvas]);

  const inFrame = isDeviceFrameHost(portalHost);
  /**
   * `hasRoot === false` = mini-preview / thumbnail danh sách Blocks (không có
   * LandingMotionRoot). Ở đó TUYỆT ĐỐI không render overlay `fixed` — nó sẽ phủ
   * kín cả app admin. Render lưới phẳng thay thế.
   */
  const showStatic = isCanvas || !hasRoot;
  const useOverlay = hasRoot && !isCanvas && showIntro;

  const bgStyle = blockBackgroundStyle(background);
  /** Màn che phải trùng nền overlay, kể cả khi editor đổi màu nền block. */
  const surfaceColor =
    typeof bgStyle?.backgroundColor === 'string'
      ? bgStyle.backgroundColor
      : INTRO_BG;

  const handleSkip = React.useCallback(() => {
    skipRef.current?.();
  }, []);

  // ── Timeline intro (chỉ chạy ở PreviewMode + /p) ──────────────────────
  React.useEffect(() => {
    if (!useOverlay) return;

    const overlay = overlayRef.current;
    const curtainTop = curtainTopRef.current;
    const curtainBottom = curtainBottomRef.current;
    const logoGroup = logoGroupRef.current;
    const logoTop = logoTopRef.current;
    const logoText = logoTextRef.current;
    const productWrap = productWrapRef.current;
    const titleRoot = titleRef.current;

    if (
      !overlay ||
      !curtainTop ||
      !curtainBottom ||
      !logoGroup ||
      !logoTop ||
      !logoText ||
      !productWrap ||
      !titleRoot
    ) {
      return;
    }

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    /**
     * Khung nhìn của overlay: device frame → chính nó; `/p` → viewport.
     * `window.innerHeight` chỉ đúng ở case cuối, nên luôn đo phần tử.
     */
    const viewBox = () => {
      const rect = overlay.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return { w: rect.width, h: rect.height };
      }
      return { w: window.innerWidth, h: window.innerHeight };
    };

    const getLogoFinalY = () => -(viewBox().h * 0.5 - LOGO_TOP_OFFSET);
    const getLogoFinalScale = () =>
      ICON_TEXT_FINAL_WIDTH / (logoText.offsetWidth || ICON_TEXT_FINAL_WIDTH);
    const getProductStartY = () => viewBox().h * 0.65;
    const titleChars = titleRoot.querySelectorAll<HTMLElement>('[data-char]');

    /** Scale đều cả dòng để ~full khung nhìn, giữ kerning tự nhiên. */
    const fitTitleWidth = () => {
      gsap.set(titleRoot, {
        scale: 1,
        xPercent: -50,
        transformOrigin: '50% 100%',
      });
      const nextScale = (viewBox().w * 0.98) / titleRoot.scrollWidth;
      gsap.set(titleRoot, {
        scale: nextScale,
        xPercent: -50,
        transformOrigin: '50% 100%',
      });
    };

    const applyFinalState = () => {
      gsap.set([curtainTop, curtainBottom], {
        yPercent: i => (i === 0 ? -100 : 100),
      });
      gsap.set(logoGroup, {
        y: getLogoFinalY(),
        scale: getLogoFinalScale(),
        autoAlpha: 1,
        transformOrigin: '50% 50%',
      });
      gsap.set(logoTop, { autoAlpha: 0, scale: 0.45 });
      gsap.set(productWrap, { y: 0, autoAlpha: 1 });
      fitTitleWidth();
      gsap.set(titleChars, { clipPath: CLIP_VISIBLE, autoAlpha: 1 });
    };

    // ── Khoá scroll trong lúc intro (pattern useDrawerScrollLock) ──
    const html = document.documentElement;
    let locked = false;
    const lockScroll = () => {
      if (locked) return;
      locked = true;
      if (scroller) {
        scroller.style.overflow = 'hidden';
        return;
      }
      const scrollbarWidth = window.innerWidth - html.clientWidth;
      html.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      getLenis()?.stop();
    };
    const unlockScroll = () => {
      if (!locked) return;
      locked = false;
      if (scroller) {
        scroller.style.overflow = '';
        return;
      }
      html.style.overflow = '';
      document.body.style.paddingRight = '';
      getLenis()?.start();
    };

    let timeline: gsap.core.Timeline | null = null;
    let exitTween: gsap.core.Tween | null = null;
    let completed = false;
    let exiting = false;
    let skipped = false;
    let cancelled = false;

    const handleComplete = () => {
      if (completed) return;
      completed = true;
      unlockScroll();
      setShowIntro(false);
    };

    const playExit = () => {
      if (exiting || completed) return;
      exiting = true;

      timeline?.kill();
      timeline = null;

      gsap.set(overlay, { pointerEvents: 'none' });
      exitTween = gsap.to(overlay, {
        yPercent: 100,
        duration: 0.55,
        ease: 'power3.in',
        onComplete: handleComplete,
      });
    };

    skipRef.current = () => {
      if (skipped || exiting || completed) return;
      skipped = true;
      applyFinalState();
      timeline?.kill();
      timeline = null;
      playExit();
    };

    lockScroll();

    const handleResize = () => {
      fitTitleWidth();
    };

    let cleanupCtx: (() => void) | null = null;

    const setupMotion = () => {
      if (cancelled) return;

      fitTitleWidth();

      const ctx = gsap.context(() => {
        gsap.set([curtainTop, curtainBottom], { yPercent: 0 });
        gsap.set(logoGroup, {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          transformOrigin: '50% 50%',
        });
        gsap.set(logoTop, {
          autoAlpha: 1,
          scale: 1,
          transformOrigin: '50% 50%',
        });
        gsap.set(productWrap, { y: getProductStartY, autoAlpha: 0 });
        gsap.set(titleChars, { clipPath: CLIP_HIDDEN, autoAlpha: 0 });

        if (reduce) {
          applyFinalState();
          handleComplete();
          return;
        }

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          onComplete: playExit,
        });

        timeline = tl;

        // Phase 1: curtain split — chậm đầu, tăng tốc khi mở hết
        tl.to(curtainTop, {
          yPercent: -100,
          duration: 1.35,
          ease: 'power3.in',
        })
          .to(
            curtainBottom,
            { yPercent: 100, duration: 1.35, ease: 'power3.in' },
            '<'
          )
          // Phase 2: giữ khung full (0.6s)
          .to({}, { duration: 0.6 })
          // Dip nhẹ xuống và scale lên một chút trước khi bay lên
          .to(logoGroup, {
            y: 12,
            scale: 1.05,
            duration: 0.28,
            ease: 'power2.in',
          })
          .addLabel('transition')

          // Phase 3: bay lên + thu nhỏ — icon-text về ~132px
          .to(
            logoGroup,
            {
              y: getLogoFinalY,
              scale: getLogoFinalScale,
              duration: 1.5,
              transformOrigin: '50% 50%',
            },
            'transition'
          )
          .to(productWrap, { y: 0, autoAlpha: 1, duration: 1.5 }, 'transition')
          // logo-top nhỏ dần khi lên top
          .to(
            logoTop,
            { scale: 0.45, duration: 1.5, transformOrigin: '50% 50%' },
            'transition'
          )
          // logo-top bay sát top rồi mới fade
          .to(
            logoTop,
            { autoAlpha: 0, duration: 0.4, ease: 'power2.out' },
            'transition+=1.0'
          )
          // Phase 4: tên sản phẩm — clip trái→phải + opacity rõ dần
          .add(() => {
            fitTitleWidth();
          })
          .to(
            titleChars,
            {
              clipPath: CLIP_VISIBLE,
              autoAlpha: 1,
              duration: 2.2,
              ease: 'power3.out',
            },
            '>'
          );
      }, overlay);

      // Fit ngoài context để ctx.revert() không xoá scale title
      fitTitleWidth();

      cleanupCtx = () => {
        ctx.revert();
        timeline = null;
        fitTitleWidth();
      };
    };

    void (document.fonts?.ready ?? Promise.resolve()).then(setupMotion);
    window.addEventListener('resize', handleResize);

    // Device frame đổi kích thước (390/834/1440) mà không có resize window.
    const resizeTarget = inFrame ? portalHost : scroller;
    const ro = resizeTarget ? new ResizeObserver(handleResize) : null;
    if (ro && resizeTarget) ro.observe(resizeTarget);

    return () => {
      cancelled = true;
      skipRef.current = null;
      window.removeEventListener('resize', handleResize);
      ro?.disconnect();
      exitTween?.kill();
      exitTween = null;
      timeline?.kill();
      timeline = null;
      cleanupCtx?.();
      unlockScroll();
    };
  }, [useOverlay, scroller, portalHost, inFrame, title]);

  // ── Style token (tuyền inline — toolbar override được) ────────────────
  const skipBase: React.CSSProperties = {
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 'clamp(12px, 1cqi, 14px)',
    fontWeight: 500,
    letterSpacing: '0.025em',
    textTransform: 'uppercase',
    color: '#000000',
  };

  const titleBase: React.CSSProperties = {
    margin: 0,
    fontFamily: DELVAUX_FONT_HEADING,
    fontSize: 'clamp(2.75rem, 13cqi, 10rem)',
    lineHeight: 1,
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
    color: '#000000',
  };

  const curtainStyle: React.CSSProperties = { backgroundColor: surfaceColor };

  const skipButton = (
    <button
      type='button'
      onClick={handleSkip}
      aria-label={skipLabel}
      className='absolute top-4 right-4 z-20 cursor-pointer @2xl:top-5 @2xl:right-5 @4xl:top-6 @4xl:right-6'
    >
      <span
        data-element-key='skipLabel'
        className={selectableClass(activeKey === 'skipLabel')}
        style={composeStyle(skipBase, styleOf('skipLabel'))}
      >
        {skipLabel}
      </span>
    </button>
  );

  // ── Editor canvas / mini-preview: lưới phẳng, mọi field hiện cùng lúc ──
  if (showStatic) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit={isCanvas ? 'true' : undefined}
        aria-label='Delvaux intro'
        className={cn(
          'gambit-delvaux-intro @container relative w-full overflow-hidden',
          className
        )}
        style={composeStyle({ backgroundColor: INTRO_BG }, bgStyle)}
      >
        <style>{DELVAUX_FONT_CSS}</style>

        <div
          className='relative flex flex-col items-center'
          style={{
            gap: 'clamp(24px, 3cqi, 48px)',
            padding: 'clamp(48px, 6cqi, 96px) clamp(20px, 4cqi, 64px)',
          }}
        >
          {skipButton}

          <div className='flex flex-col items-center gap-3 @2xl:gap-4 @4xl:gap-5'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-element-key='logoTopUrl'
              src={logoTopUrl}
              alt=''
              className={selectableClass(
                activeKey === 'logoTopUrl',
                'w-[min(46cqi,180px)] @2xl:w-[min(30cqi,220px)] @4xl:w-[min(30cqi,260px)]'
              )}
              style={styleOf('logoTopUrl')}
              draggable={false}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-element-key='logoTextUrl'
              src={logoTextUrl}
              alt={logoTextAlt}
              className={selectableClass(
                activeKey === 'logoTextUrl',
                'w-[min(64cqi,280px)] @2xl:w-[min(42cqi,360px)] @4xl:w-[min(42cqi,420px)]'
              )}
              style={styleOf('logoTextUrl')}
              draggable={false}
            />
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-element-key='productImageUrl'
            src={productImageUrl}
            alt={productImageAlt}
            className={selectableClass(
              activeKey === 'productImageUrl',
              'w-[min(46cqi,200px)] @2xl:w-[min(28cqi,240px)] @4xl:w-[min(28cqi,300px)]'
            )}
            style={styleOf('productImageUrl')}
            draggable={false}
          />

          <h1
            data-element-key='title'
            className={selectableClass(activeKey === 'title', 'w-full')}
            style={composeStyle(
              { ...titleBase, textAlign: 'center' },
              styleOf('title')
            )}
          >
            {title}
          </h1>
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: overlay phủ kín, chạy timeline gốc ──────────────
  const overlay = (
    <div
      ref={overlayRef}
      aria-label='Delvaux intro'
      className={cn(
        'gambit-delvaux-intro @container overflow-hidden',
        inFrame ? 'absolute inset-0' : 'fixed inset-0'
      )}
      style={composeStyle(
        { zIndex: OVERLAY_Z, backgroundColor: INTRO_BG },
        bgStyle
      )}
    >
      {skipButton}

      <div className='absolute inset-0 z-10 flex items-center justify-center'>
        <div
          ref={logoGroupRef}
          className='flex flex-col items-center gap-3 @2xl:gap-4 @4xl:gap-5'
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={logoTopRef}
            data-element-key='logoTopUrl'
            src={logoTopUrl}
            alt=''
            className={selectableClass(
              activeKey === 'logoTopUrl',
              'w-[min(72cqi,280px)] @2xl:w-[min(48cqi,360px)] @4xl:w-[min(55cqi,480px)]'
            )}
            style={styleOf('logoTopUrl')}
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={logoTextRef}
            data-element-key='logoTextUrl'
            src={logoTextUrl}
            alt={logoTextAlt}
            className={selectableClass(
              activeKey === 'logoTextUrl',
              'w-[min(82cqi,420px)] @2xl:w-[min(62cqi,560px)] @4xl:w-[min(70cqi,720px)]'
            )}
            style={styleOf('logoTextUrl')}
            draggable={false}
          />
        </div>
      </div>

      <div
        ref={productWrapRef}
        className='absolute inset-x-0 bottom-[22%] flex justify-center @4xl:bottom-[25%]'
        style={{ zIndex: 5 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-element-key='productImageUrl'
          src={productImageUrl}
          alt={productImageAlt}
          className={selectableClass(
            activeKey === 'productImageUrl',
            'w-[min(58cqi,240px)] @2xl:w-[min(48cqi,300px)] @4xl:w-[min(65cqi,380px)]'
          )}
          style={styleOf('productImageUrl')}
          draggable={false}
        />
      </div>

      <h1
        ref={titleRef}
        data-element-key='title'
        aria-label={title}
        className={selectableClass(
          activeKey === 'title',
          'pointer-events-none absolute bottom-3 left-1/2 inline-flex @2xl:-bottom-3 @4xl:-bottom-5'
        )}
        style={composeStyle({ ...titleBase, zIndex: 5 }, styleOf('title'))}
      >
        {title.split('').map((char, index) =>
          char === ' ' ? (
            <span
              key={`space-${index}`}
              aria-hidden
              className='inline-block w-[0.28em] shrink-0'
            />
          ) : (
            <span
              key={`${char}-${index}`}
              data-char
              aria-hidden
              className='inline-block shrink-0'
            >
              {char}
            </span>
          )
        )}
      </h1>

      <div
        ref={curtainTopRef}
        className='absolute inset-x-0 top-0 z-10 h-1/2'
        style={curtainStyle}
        aria-hidden
      />
      <div
        ref={curtainBottomRef}
        className='absolute inset-x-0 bottom-0 z-10 h-1/2'
        style={curtainStyle}
        aria-hidden
      />
    </div>
  );

  /**
   * KHÔNG đặt `@container` lên root khi đang ở nhánh overlay: `container-type`
   * tạo containing block cho `position: fixed` (R5 — landing-motion-foundation)
   * ⇒ overlay sẽ bám vào section cao 0px thay vì viewport. Overlay tự mang
   * `@container` của nó nên `cqi` / `@2xl:` bên trong vẫn đúng.
   */
  return (
    <section
      ref={rootRef}
      className={cn(
        'gambit-delvaux-intro relative w-full',
        useOverlay ? 'h-0 overflow-visible' : '@container',
        className
      )}
      style={bgStyle}
    >
      <style>{DELVAUX_FONT_CSS}</style>
      {useOverlay
        ? portalHost
          ? createPortal(overlay, portalHost)
          : overlay
        : null}
    </section>
  );
}
