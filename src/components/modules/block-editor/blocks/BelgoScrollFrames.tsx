'use client';

/**
 * Belgo · Scroll Frames — port từ apps/belgo ScrollFrameSequence.tsx.
 *
 * Overlay canvas full-viewport phát chuỗi frame chai bia, scrub theo scroll
 * giữa 2 block khác trên trang (mặc định `#hero` → `#about-product`), kèm
 * preloader curtain khoá scroll cho tới khi frame decode xong.
 *
 * Khác apps:
 *  - `position: fixed` không sống được trong `@container` → portal qua
 *    `resolveDrawerPortalHost`; trong device frame dùng `absolute`;
 *  - `window.innerWidth/innerHeight` → đo host (device frame / scroller / window);
 *  - `document.body.style.overflow = 'hidden'` thô → `lockScroll()` theo pattern
 *    `useDrawerScrollLock` (html overflow + Lenis stop/start);
 *  - `gsap.matchMedia(MOTION_CONDITIONS)` → `useBlockMotion` + `scroller` trên
 *    mọi ScrollTrigger;
 *  - string `#hero`/`#about-product` trong `gsap.context(root)` bị scope sai →
 *    resolve Element qua `resolveInScroller` (scroller/document) trước khi tạo ST;
 *  - `/p` + Lenis: `scrub: true` (không 1.1) để tránh lag kép; editor giữ 1.1;
 *  - preload progressive: chỉ chờ ~40 frame đầu (intro + buffer) rồi mở curtain;
 *    phần còn lại tải nền theo chunk, draw fallback frame gần nhất nếu chưa sẵn;
 *  - bỏ `history.scrollRestoration` + `window.scrollTo(0,0)`: block không được
 *    giành quyền điều khiển scroll của cả trang host;
 *  - canvas editor render poster tĩnh (frame giữa) + các field sửa được, KHÔNG
 *    dựng overlay fixed / preloader che editor.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import type {
  BelgoScrollFramesContent,
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { BELGO_FONT_CSS, BELGO_FONT_DISPLAY, BELGO_GOLD } from './belgoTheme';
import {
  BELGO_SCROLL_FRAMES_DEFAULTS,
  resolveBelgoFrameSrc,
} from './_registry/defs/belgoScrollFrames';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface BelgoScrollFramesProps {
  content: BelgoScrollFramesContent;
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

const LOADER_BG = '#1A120C';

/**
 * Tìm trigger ngoài `gsap.context` scope của block (root h-0 không chứa
 * #hero / #about-product). Query trong scroller trước — PreviewMode có thể
 * trùng id với canvas bên dưới; `document.getElementById` sẽ lấy bản sai.
 */
const resolveInScroller = (
  selector: string,
  scroller: HTMLElement | undefined
): HTMLElement | null => {
  const raw = selector.trim();
  if (!raw) return null;
  const q =
    raw.startsWith('#') || raw.startsWith('.') || raw.startsWith('[')
      ? raw
      : `#${raw}`;
  const root: ParentNode = scroller ?? document;
  try {
    return root.querySelector<HTMLElement>(q);
  } catch {
    return null;
  }
};

/** Ép số nguyên ≥ 1 từ value CMS (có thể là string do field text). */
const toCount = (value: unknown, fallback: number): number => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= 1 ? n : fallback;
};

/** Hằng số chuyển động — giữ nguyên số của apps (props → const, không lộ ra CMS). */
const SCALE_FROM = 1;
const SCALE_TO = 0.8;
const VISIBLE_RATIO = 0.74;
const Y_PARALLAX_DIP = 1.22;
const Y_PARALLAX_PEAK = 0.1;
const Y_END = 40;
const INTRO_FROM_FRAME = 15;
const INTRO_DURATION = 1;
/** Số frame chờ trước khi mở curtain — đủ intro + buffer scrub đầu. */
const EAGER_FRAME_COUNT = 40;
/** Chunk tải nền sau reveal (không block scroll). */
const BG_LOAD_CHUNK = 6;
/** Prefetch quanh frame đang vẽ khi scrub. */
const SCRUB_LOOKAHEAD = 4;

export function BelgoScrollFrames({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BelgoScrollFramesProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const parallaxRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const loaderRef = React.useRef<HTMLDivElement>(null);
  const loaderContentRef = React.useRef<HTMLDivElement>(null);
  const logoRef = React.useRef<HTMLImageElement>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  const progressLabelRef = React.useRef<HTMLSpanElement>(null);
  const curtainRef = React.useRef<HTMLDivElement>(null);

  const { hasRoot } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);
  const [mounted, setMounted] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const D = BELGO_SCROLL_FRAMES_DEFAULTS;
  const startSelector = content.startSelector?.trim() || D.startSelector;
  const endSelector = content.endSelector?.trim() || D.endSelector;
  // Toolbar chỉ có field text → frameCount/framePad về dạng string; ép số ở đây.
  const frameCount = toCount(content.frameCount, D.frameCount);
  const frameSrc = content.frameSrc?.trim() || D.frameSrc;
  const framePad = toCount(content.framePad, D.framePad);
  const showLoader = content.showLoader ?? D.showLoader;
  const loaderLogoUrl = content.loaderLogoUrl?.trim() || D.loaderLogoUrl;
  const loaderLogoAlt = content.loaderLogoAlt?.trim() || D.loaderLogoAlt;
  const loaderLabel = content.loaderLabel ?? D.loaderLabel;

  React.useEffect(() => setMounted(true), []);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || isCanvas) return;
    setPortalHost(resolveDrawerPortalHost(root));
  }, [mounted, hasRoot, isCanvas]);

  const inFrame = isDeviceFrameHost(portalHost);
  /**
   * `hasRoot === false` = mini-preview / thumbnail danh sách Blocks (không có
   * LandingMotionRoot). Ở đó TUYỆT ĐỐI không portal overlay `position: fixed`
   * ra body — nó sẽ phủ kín cả app admin. Render poster tĩnh thay thế.
   */
  const showPoster = isCanvas || !hasRoot;
  const useOverlay = mounted && hasRoot && !isCanvas;

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      if (isCanvas || !hasRoot) return;

      const wrapper = wrapperRef.current;
      const parallax = parallaxRef.current;
      const inner = innerRef.current;
      const canvas = canvasRef.current;
      if (!wrapper || !parallax || !inner || !canvas) return;

      // Context trong suốt — sequence phủ lên nội dung trang.
      const ctx2d = canvas.getContext('2d', { alpha: true });
      if (!ctx2d) return;

      const loader = loaderRef.current;
      const loaderContent = loaderContentRef.current;
      const logo = logoRef.current;
      const progressBar = progressBarRef.current;
      const progressLabel = progressLabelRef.current;
      const curtain = curtainRef.current;
      const hasLoader = !!(
        showLoader &&
        loader &&
        loaderContent &&
        logo &&
        progressBar &&
        progressLabel &&
        curtain
      );

      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      /**
       * Khung nhìn của overlay: device frame → chính nó; editor → scroller;
       * `/p` → window. `window.innerWidth` chỉ đúng ở case cuối.
       */
      const hostBox = () => {
        const host = inFrame ? portalHost : null;
        const el = host ?? scroller ?? null;
        if (el) {
          const r = el.getBoundingClientRect();
          return { w: r.width, h: r.height };
        }
        return { w: window.innerWidth, h: window.innerHeight };
      };

      // ── scroll lock cho preloader (pattern useDrawerScrollLock) ──
      const html = document.documentElement;
      let locked = false;
      const lockScroll = () => {
        if (locked || !hasLoader) return;
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

      // Slot ảnh — chỉ gán `src` khi thật sự tải (tránh stampede 89 request).
      const images: (HTMLImageElement | null)[] = Array.from(
        { length: frameCount },
        () => null
      );

      const counter = { frame: 0 };
      const progress = { value: 0 };
      let lastFrame = -1;
      let lastDrawnSrc = -1;
      let viewW = 0;
      let viewH = 0;
      let cancelled = false;
      let introTl: gsap.core.Timeline | null = null;
      let breatheTl: gsap.core.Timeline | null = null;
      let exitTl: gsap.core.Timeline | null = null;
      let progressTween: gsap.core.Tween | null = null;
      let bgIdleId = 0;
      let bgTimeoutId = 0;

      const introIndex = Math.max(
        0,
        Math.min(INTRO_FROM_FRAME, frameCount) - 1
      );
      const eagerCount = Math.min(
        frameCount,
        Math.max(introIndex + 1, EAGER_FRAME_COUNT)
      );

      const isImageReady = (img: HTMLImageElement | null | undefined) =>
        !!(img && img.complete && img.naturalWidth > 0);

      const ensureImage = (index: number): HTMLImageElement | null => {
        if (index < 0 || index >= frameCount) return null;
        let img = images[index];
        if (!img) {
          img = new Image();
          images[index] = img;
        }
        if (!img.src) {
          img.src = resolveBelgoFrameSrc(frameSrc, index + 1, framePad);
        }
        return img;
      };

      /** Contain-fit, không bao giờ phóng quá pixel gốc của ảnh. */
      const getContainScale = (img: HTMLImageElement) =>
        Math.min(1, viewW / img.naturalWidth, viewH / img.naturalHeight);

      /**
       * Offset Y (px) để chỉ `VISIBLE_RATIO` phần frame nằm trên đáy khung nhìn
       * (2/3 lộ ra, 1/3 chìm dưới fold).
       */
      const getStartY = () => {
        const img = images[0];
        if (!isImageReady(img)) return viewH * (1 - VISIBLE_RATIO);
        const drawnH = img!.naturalHeight * getContainScale(img!);
        const centeredTop = (viewH - drawnH) / 2;
        const targetTop = viewH - VISIBLE_RATIO * drawnH;
        return targetTop - centeredTop;
      };

      const startScale = Math.min(SCALE_FROM, 1);
      const getDipY = () => getStartY() * Y_PARALLAX_DIP;
      const getPeakY = () => -viewH * Y_PARALLAX_PEAK;

      const resizeCanvas = () => {
        const box = hostBox();
        viewW = box.w;
        viewH = box.h;
        const dprCap = viewW < 768 ? 1 : 1.5;
        const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
        canvas.width = Math.round(viewW * dpr);
        canvas.height = Math.round(viewH * dpr);
        canvas.style.width = `${viewW}px`;
        canvas.style.height = `${viewH}px`;
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        lastFrame = -1;
        lastDrawnSrc = -1;
      };

      /** Frame gần nhất đã decode — ưu tiên lùi (đã đi qua) rồi tới. */
      const findReadyImage = (
        i: number
      ): { img: HTMLImageElement; srcIndex: number } | null => {
        const direct = images[i];
        if (isImageReady(direct)) return { img: direct!, srcIndex: i };
        for (let d = 1; d < frameCount; d++) {
          const back = images[i - d];
          if (isImageReady(back)) return { img: back!, srcIndex: i - d };
          const fwd = images[i + d];
          if (isImageReady(fwd)) return { img: fwd!, srcIndex: i + d };
        }
        return null;
      };

      const prefetchAround = (i: number) => {
        for (let d = 0; d <= SCRUB_LOOKAHEAD; d++) {
          ensureImage(i + d);
          if (d > 0) ensureImage(i - d);
        }
      };

      const drawFrame = (i: number) => {
        prefetchAround(i);
        const ready = findReadyImage(i);
        if (!ready) return;
        // Cùng nguồn ảnh đã vẽ + cùng target index → bỏ qua.
        if (i === lastFrame && ready.srcIndex === lastDrawnSrc) return;
        const { img } = ready;
        const scale = getContainScale(img);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx2d.clearRect(0, 0, viewW, viewH);
        ctx2d.drawImage(img, (viewW - w) / 2, (viewH - h) / 2, w, h);
        lastFrame = i;
        lastDrawnSrc = ready.srcIndex;
      };

      const render = () => {
        const i = Math.round(counter.frame);
        drawFrame(i);
      };

      const waitForImage = (img: HTMLImageElement) =>
        new Promise<void>(resolve => {
          const done = () => {
            if (typeof img.decode === 'function') {
              img
                .decode()
                .then(() => resolve())
                .catch(() => resolve());
              return;
            }
            resolve();
          };
          if (img.complete && img.naturalWidth > 0) {
            done();
            return;
          }
          img.onload = () => done();
          img.onerror = () => resolve();
        });

      const loadFrame = (index: number) => {
        const img = ensureImage(index);
        if (!img) return Promise.resolve();
        return waitForImage(img).then(() => {
          if (cancelled) return;
          // Frame đúng index vừa sẵn → thay thế fallback đang hiện.
          const current = Math.round(counter.frame);
          if (index === current && lastDrawnSrc !== index) {
            lastFrame = -1;
            drawFrame(current);
          }
        });
      };

      const updateProgressUi = () => {
        if (!hasLoader) return;
        const ratio = progress.value;
        gsap.set(progressBar, { scaleX: ratio });
        progressLabel!.textContent = `${Math.round(ratio * 100)}%`;
      };

      /** Chỉ chờ eager set — progress bar theo eagerCount, không theo cả 89. */
      const loadEagerFrames = () => {
        let loaded = 0;
        return Promise.all(
          Array.from({ length: eagerCount }, (_, i) =>
            loadFrame(i).then(() => {
              if (cancelled) return;
              loaded += 1;
              if (!hasLoader) return;
              progressTween?.kill();
              progressTween = gsap.to(progress, {
                value: loaded / eagerCount,
                duration: reduceMotion ? 0 : 0.28,
                ease: 'power2.out',
                onUpdate: updateProgressUi,
              });
            })
          )
        );
      };

      /** Tải phần còn lại theo chunk lúc idle — không khoá scroll. */
      const loadRestInBackground = () => {
        let next = eagerCount;
        const schedule = (fn: () => void) => {
          const ric = (
            window as unknown as {
              requestIdleCallback?: (
                cb: () => void,
                opts?: { timeout: number }
              ) => number;
            }
          ).requestIdleCallback;
          if (typeof ric === 'function') {
            bgIdleId = ric(fn, { timeout: 400 });
            return;
          }
          bgTimeoutId = window.setTimeout(fn, 32);
        };

        const pump = () => {
          if (cancelled || next >= frameCount) return;
          const end = Math.min(frameCount, next + BG_LOAD_CHUNK);
          const batch: Promise<void>[] = [];
          for (let i = next; i < end; i++) batch.push(loadFrame(i));
          next = end;
          void Promise.all(batch).then(() => {
            if (cancelled || next >= frameCount) return;
            schedule(pump);
          });
        };

        schedule(pump);
      };

      const hasScrolledPastStart = () => {
        const el = resolveInScroller(startSelector, scroller);
        if (!el) return false;
        const top = el.getBoundingClientRect().top;
        const base = scroller ? scroller.getBoundingClientRect().top : 0;
        return top - base < -8;
      };

      // Editor (scroller element): giữ scrub lag như apps. /p + Lenis: scrub
      // tức thì — Lenis đã smooth sẵn, scrub:1.1 sẽ tạo lag kép.
      const scrubAmount: number | boolean = scroller ? 1.1 : true;
      const SCRUB_RETRY_MAX = 12;
      let scrubRetryRaf = 0;
      let scrubRetries = 0;

      const buildScrub = (startEl: HTMLElement, endEl: HTMLElement) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: startEl,
            scroller,
            start: 'top top',
            endTrigger: endEl,
            end: 'bottom bottom',
            scrub: scrubAmount,
            invalidateOnRefresh: true,
            // Không pin — overlay đã fixed; pin sẽ chèn spacer vào layout block khác.
          },
        });

        tl.to(
          counter,
          {
            frame: frameCount - 1,
            ease: 'none',
            snap: 'frame',
            onUpdate: render,
          },
          0
        );

        // Scale chia chặng để cú thu nhỏ không rơi một phát.
        const scaleDelta = SCALE_TO - startScale;
        const scaleEarly = startScale + scaleDelta * 0.12;
        const scaleMid = startScale + scaleDelta * 0.55;
        const scaleLate = startScale + scaleDelta * 0.88;

        gsap.set(inner, { scale: startScale });
        tl.to(inner, { scale: scaleEarly, ease: 'none', duration: 0.28 }, 0.05);
        tl.to(inner, { scale: scaleMid, ease: 'none', duration: 0.32 }, 0.33);
        tl.to(inner, { scale: scaleLate, ease: 'none', duration: 0.22 }, 0.65);
        tl.to(inner, { scale: SCALE_TO, ease: 'none', duration: 0.18 }, 0.87);

        // Y parallax: dìm xuống → nhấc lên → lắng dưới tâm một chút.
        tl.fromTo(
          parallax,
          { y: () => getStartY() },
          {
            y: () => getDipY(),
            ease: 'none',
            duration: 0.22,
            immediateRender: true,
          },
          0
        );
        tl.to(
          parallax,
          { y: () => getPeakY(), ease: 'none', duration: 0.48 },
          0.22
        );
        tl.to(parallax, { y: Y_END, ease: 'none', duration: 0.3 }, 0.7);

        // Khi block kế tiếp đã phủ kín khung nhìn thì ngừng vẽ overlay.
        ScrollTrigger.create({
          trigger: endEl,
          scroller,
          start: 'bottom top',
          onEnter: () => gsap.set(wrapper, { visibility: 'hidden' }),
          onLeaveBack: () => gsap.set(wrapper, { visibility: 'visible' }),
        });
      };

      /**
       * Resolve Element ngoài context scope. Sibling chưa hydrate → rAF retry
       * vài nhịp rồi abort sạch (không tạo ST với selector hỏng).
       */
      const setupScrub = () => {
        if (cancelled) return;
        const startEl = resolveInScroller(startSelector, scroller);
        const endEl = resolveInScroller(endSelector, scroller);
        if (!startEl || !endEl) {
          if (scrubRetries < SCRUB_RETRY_MAX) {
            scrubRetries += 1;
            scrubRetryRaf = requestAnimationFrame(setupScrub);
            return;
          }
          return;
        }
        scrubRetries = 0;
        buildScrub(startEl, endEl);
        requestRefresh();
      };

      const startReveal = () => {
        resizeCanvas();
        gsap.set(parallax, { y: getStartY() });
        gsap.set(inner, { transformOrigin: '50% 50%', scale: startScale });

        if (reduceMotion) {
          counter.frame = frameCount - 1;
          gsap.set(parallax, { y: Y_END });
          gsap.set(inner, { scale: SCALE_TO });
          render();
          gsap.to(wrapper, { autoAlpha: 1, duration: 0.4, ease: 'power1.out' });
          return;
        }

        // Đang ở giữa trang — bỏ intro rewind để scrub khớp vị trí scroll.
        if (hasScrolledPastStart()) {
          counter.frame = 0;
          render();
          gsap.to(wrapper, { autoAlpha: 1, duration: 0.4, ease: 'power1.out' });
          setupScrub();
          return;
        }

        // Init: tua frame 15 → 1 + nhịp scale (nhỏ → to → nhỏ về startScale).
        const introScaleFrom = startScale * 0.84;
        const introScaleDip = startScale * 0.95;

        counter.frame = introIndex;
        gsap.set(inner, { scale: introScaleFrom });
        render();
        gsap.to(wrapper, { autoAlpha: 1, duration: 0.4, ease: 'power1.out' });

        introTl = gsap.timeline({
          onComplete: () => {
            introTl = null;
            if (cancelled) return;
            gsap.set(inner, { scale: startScale });
            setupScrub();
          },
        });

        introTl.to(
          counter,
          {
            frame: 0,
            duration: INTRO_DURATION,
            ease: 'power2.out',
            onUpdate: render,
          },
          0
        );
        introTl.to(
          inner,
          {
            scale: startScale,
            duration: INTRO_DURATION * 0.55,
            ease: 'power2.out',
          },
          0
        );
        introTl.to(
          inner,
          {
            scale: introScaleDip,
            duration: INTRO_DURATION * 0.25,
            ease: 'power1.inOut',
          },
          INTRO_DURATION * 0.55
        );
        introTl.to(
          inner,
          {
            scale: startScale,
            duration: INTRO_DURATION * 0.2,
            ease: 'power2.out',
          },
          INTRO_DURATION * 0.8
        );
      };

      const playExitThenReveal = () => {
        breatheTl?.kill();
        breatheTl = null;
        progressTween?.kill();
        progressTween = null;
        progress.value = 1;
        updateProgressUi();

        const finish = () => {
          exitTl = null;
          unlockScroll();
          if (cancelled) return;
          if (hasLoader) {
            loader!.setAttribute('aria-busy', 'false');
            gsap.set(loader, { autoAlpha: 0, pointerEvents: 'none' });
          }
          startReveal();
        };

        if (!hasLoader || reduceMotion) {
          finish();
          return;
        }

        exitTl = gsap.timeline({ onComplete: finish });
        exitTl.to(
          progressBar,
          { scaleX: 1, duration: 0.2, ease: 'power2.out' },
          0
        );
        exitTl.to(
          loaderContent,
          {
            y: -28,
            autoAlpha: 0,
            scale: 1.08,
            duration: 0.55,
            ease: 'power3.inOut',
          },
          0.12
        );
        exitTl.to(
          curtain,
          { yPercent: -100, duration: 0.7, ease: 'power3.inOut' },
          0.28
        );
        exitTl.to(
          loader,
          { autoAlpha: 0, duration: 0.2, ease: 'power1.out' },
          0.85
        );
      };

      // ── Loader enter + breathe trong lúc frame decode ──
      if (hasLoader) {
        lockScroll();
        gsap.set(progressBar, { scaleX: 0, transformOrigin: 'left center' });
        gsap.set(curtain, { yPercent: 0 });
        gsap.set(loaderContent, { autoAlpha: 1 });
        gsap.set(logo, { scale: 0.88, autoAlpha: 0 });

        if (reduceMotion) {
          gsap.set(logo, { scale: 1, autoAlpha: 1 });
        } else {
          gsap.to(logo, {
            scale: 1,
            autoAlpha: 1,
            duration: 0.7,
            ease: 'power3.out',
          });
          breatheTl = gsap.timeline({ repeat: -1, yoyo: true, delay: 0.7 });
          breatheTl.to(logo, {
            scale: 1.045,
            duration: 1.35,
            ease: 'sine.inOut',
          });
        }
      }

      resizeCanvas();
      // Ghim tư thế đầu ngay để frame đầu tiên đã đúng crop.
      gsap.set(parallax, { y: getStartY() });
      gsap.set(inner, { transformOrigin: '50% 50%', scale: startScale });

      void loadEagerFrames().then(() => {
        if (cancelled) return;
        playExitThenReveal();
        // Phần còn lại tải nền sau khi curtain mở — không chặn scroll.
        loadRestInBackground();
      });

      const onResize = () => {
        resizeCanvas();
        render();
        requestRefresh();
      };
      window.addEventListener('resize', onResize);
      const ro = new ResizeObserver(onResize);
      if (inFrame && portalHost) ro.observe(portalHost);
      else if (scroller) ro.observe(scroller);

      return () => {
        cancelled = true;
        if (scrubRetryRaf) cancelAnimationFrame(scrubRetryRaf);
        if (bgIdleId) {
          const cic = (
            window as unknown as {
              cancelIdleCallback?: (id: number) => void;
            }
          ).cancelIdleCallback;
          cic?.(bgIdleId);
        }
        if (bgTimeoutId) window.clearTimeout(bgTimeoutId);
        introTl?.kill();
        breatheTl?.kill();
        exitTl?.kill();
        progressTween?.kill();
        unlockScroll();
        window.removeEventListener('resize', onResize);
        ro.disconnect();
      };
    },
    [
      isCanvas,
      hasRoot,
      inFrame,
      portalHost,
      startSelector,
      endSelector,
      frameCount,
      frameSrc,
      framePad,
      showLoader,
    ]
  );

  // ── Canvas editor + thumbnail/mini-preview: poster tĩnh, KHÔNG overlay ──
  if (showPoster) {
    const posterSrc = resolveBelgoFrameSrc(
      frameSrc,
      Math.max(1, Math.round(frameCount * 0.62)),
      framePad
    );
    const metaRow = (label: string, key: string, value: string) => (
      <div className='flex items-baseline gap-2'>
        <span className='text-3xs shrink-0 tracking-widest text-neutral-500 uppercase'>
          {label}
        </span>
        <span
          data-element-key={key}
          className={selectableClass(activeKey === key, 'font-mono text-xs')}
          style={composeStyle({ color: '#EDE6D6' }, styleOf(key))}
        >
          {value}
        </span>
      </div>
    );

    return (
      <section
        ref={rootRef}
        data-canvas-edit={isCanvas ? 'true' : undefined}
        className={cn('@container relative w-full', className)}
        style={composeStyle(
          { backgroundColor: LOADER_BG, minHeight: 320 },
          blockBackgroundStyle(background)
        )}
      >
        <style>{BELGO_FONT_CSS}</style>

        <div className='flex flex-col gap-6 px-[6cqi] py-[6cqi] @2xl:flex-row @2xl:items-center'>
          <div
            className='relative shrink-0 overflow-hidden'
            style={{ width: 'min(100%, 220px)', aspectRatio: '1556 / 2048' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterSrc}
              alt=''
              className='h-full w-full object-contain'
            />
          </div>

          <div className='flex min-w-0 flex-1 flex-col gap-3'>
            <p
              className='m-0 text-xs tracking-[0.28em] uppercase'
              style={{ fontFamily: BELGO_FONT_DISPLAY, color: BELGO_GOLD }}
            >
              Scroll frame sequence · {frameCount} frames
            </p>
            <p className='m-0 max-w-md text-xs leading-relaxed text-neutral-400'>
              Overlay chỉ chạy ở PreviewMode và trang /p — canvas hiện poster
              tĩnh để sửa cấu hình. Vùng scrub neo vào block khác qua selector
              bên dưới.
            </p>

            <div className='flex flex-col gap-1.5 pt-1'>
              {metaRow('Từ', 'startSelector', startSelector)}
              {metaRow('Đến', 'endSelector', endSelector)}
              {metaRow('Frame', 'frameSrc', frameSrc)}
              <div className='flex flex-wrap gap-x-6 gap-y-1.5'>
                {metaRow('Số frame', 'frameCount', String(frameCount))}
                {metaRow('Pad', 'framePad', String(framePad))}
              </div>
            </div>

            {showLoader ? (
              <div className='mt-2 flex items-center gap-3'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={loaderLogoUrl}
                  alt={loaderLogoAlt}
                  data-element-key='loaderLogoUrl'
                  className={selectableClass(
                    activeKey === 'loaderLogoUrl',
                    'h-8 w-auto'
                  )}
                  style={styleOf('loaderLogoUrl')}
                />
                <span
                  data-element-key='loaderLabel'
                  className={selectableClass(activeKey === 'loaderLabel')}
                  style={composeStyle(
                    {
                      fontFamily: BELGO_FONT_DISPLAY,
                      fontSize: 11,
                      letterSpacing: '0.32em',
                      color: 'rgba(237, 230, 214, 0.7)',
                    },
                    styleOf('loaderLabel')
                  )}
                >
                  {loaderLabel}
                </span>
                <span
                  style={{
                    fontFamily: BELGO_FONT_DISPLAY,
                    fontSize: 11,
                    letterSpacing: '0.2em',
                    color: BELGO_GOLD,
                  }}
                >
                  0%
                </span>
                {metaRow('Alt', 'loaderLogoAlt', loaderLogoAlt)}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  const overlay = (
    <>
      {showLoader ? (
        <div
          ref={loaderRef}
          role='status'
          aria-busy='true'
          aria-live='polite'
          aria-label={loaderLogoAlt}
          className={cn(
            'z-120 flex items-center justify-center overflow-hidden',
            inFrame ? 'absolute inset-0' : 'fixed inset-0'
          )}
          style={{ backgroundColor: LOADER_BG }}
        >
          <div
            ref={curtainRef}
            aria-hidden='true'
            className='pointer-events-none absolute inset-0'
            style={{ backgroundColor: LOADER_BG }}
          />

          <div
            ref={loaderContentRef}
            className='relative z-10 flex flex-col items-center px-6'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={logoRef}
              src={loaderLogoUrl}
              alt={loaderLogoAlt}
              data-element-key='loaderLogoUrl'
              className={selectableClass(
                activeKey === 'loaderLogoUrl',
                'h-12 w-auto will-change-transform @2xl:h-16'
              )}
              style={styleOf('loaderLogoUrl')}
            />

            <div className='mt-10 flex w-[min(72cqi,220px)] flex-col items-center gap-3'>
              <div
                className='h-px w-full overflow-hidden'
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                aria-hidden='true'
              >
                <div
                  ref={progressBarRef}
                  className='h-full w-full origin-left will-change-transform'
                  style={{
                    backgroundColor: BELGO_GOLD,
                    transform: 'scaleX(0)',
                  }}
                />
              </div>

              <p
                className='m-0 flex items-baseline gap-3'
                style={{
                  fontFamily: BELGO_FONT_DISPLAY,
                  fontSize: 11,
                  letterSpacing: '0.32em',
                  color: 'rgba(237, 230, 214, 0.7)',
                }}
              >
                <span
                  data-element-key='loaderLabel'
                  className={selectableClass(activeKey === 'loaderLabel')}
                  style={styleOf('loaderLabel')}
                >
                  {loaderLabel}
                </span>
                <span
                  ref={progressLabelRef}
                  className='tabular-nums'
                  style={{ letterSpacing: '0.2em', color: BELGO_GOLD }}
                >
                  0%
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div
        ref={wrapperRef}
        aria-hidden='true'
        className={cn(
          'pointer-events-none z-30 opacity-0',
          inFrame ? 'absolute inset-0' : 'fixed inset-0'
        )}
      >
        <div
          ref={parallaxRef}
          className='absolute inset-0 will-change-transform'
        >
          <div
            ref={innerRef}
            className='absolute inset-0 will-change-transform'
          >
            <canvas ref={canvasRef} className='block h-full w-full' />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <section
      ref={rootRef}
      className={cn(
        '@container relative w-full',
        useOverlay && 'h-0 overflow-visible',
        className
      )}
      style={blockBackgroundStyle(background)}
    >
      <style>{BELGO_FONT_CSS}</style>
      {useOverlay && portalHost ? createPortal(overlay, portalHost) : null}
    </section>
  );
}
