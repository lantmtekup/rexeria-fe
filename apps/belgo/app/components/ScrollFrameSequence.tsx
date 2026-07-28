'use client';

import { useEffect, useRef } from 'react';
import {
  gsap,
  MQ,
  MOTION_CONDITIONS,
  ScrollTrigger,
  type MotionConditions,
} from '@/app/lib/motion';

type ScrollFrameSequenceProps = {
  /** Element whose top marks the start of the scrub range (start: 'top top'). */
  startSelector: string;
  /** Element whose bottom marks the end of the scrub range (end: 'bottom bottom'). */
  endSelector: string;
  frameCount: number;
  /**
   * URL template with an `{i}` placeholder for the 1-based, zero-padded frame
   * index — e.g. '/assets/frame/frame-{i}.png'. (A plain string so server
   * components can pass it down.)
   */
  frameSrc: string;
  /** Zero-pad width for the frame index. */
  framePad?: number;
  /**
   * Start scale relative to canvas contain-fit size. Must stay ≤ 1 —
   * never larger than the original drawn size.
   */
  scaleFrom?: number;
  /** End scale (full bottle visible, smaller than original). */
  scaleTo?: number;
  /**
   * How much of the bottle is visible at scroll start (rest hangs below
   * the viewport bottom). `2/3` = top two-thirds showing.
   */
  visibleRatio?: number;
  /**
   * Extra downward push early in the scrub (fraction of startY) —
   * creates resistance before the bottle rises.
   */
  yParallaxDip?: number;
  /**
   * Peak upward overshoot as a fraction of viewport height
   * (negative direction). Larger = stronger parallax lift.
   */
  yParallaxPeak?: number;
  /**
   * Final Y offset below center (px) — small nudge so the cap
   * doesn’t sit flush under the fixed header.
   */
  yEnd?: number;
  /**
   * 1-based frame to start the init rewind from (plays down to frame 1).
   */
  introFromFrame?: number;
  /** Duration of the init rewind tween in seconds. */
  introDuration?: number;
  /** Sections rendered after the range need a higher z-index to cover the overlay. */
  zIndexClass?: string;
};

export default function ScrollFrameSequence({
  startSelector,
  endSelector,
  frameCount,
  frameSrc,
  framePad = 2,
  scaleFrom = 1,
  scaleTo = 0.8,
  visibleRatio = 0.74,
  yParallaxDip = 1.22,
  yParallaxPeak = 0.1,
  yEnd = 40,
  introFromFrame = 15,
  introDuration = 1,
  zIndexClass = 'z-30',
}: ScrollFrameSequenceProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderContentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressLabelRef = useRef<HTMLSpanElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const parallax = parallaxRef.current;
    const inner = innerRef.current;
    const canvas = canvasRef.current;
    const loader = loaderRef.current;
    const loaderContent = loaderContentRef.current;
    const logo = logoRef.current;
    const progressBar = progressBarRef.current;
    const progressLabel = progressLabelRef.current;
    const curtain = curtainRef.current;
    if (
      !wrapper ||
      !parallax ||
      !inner ||
      !canvas ||
      !loader ||
      !loaderContent ||
      !logo ||
      !progressBar ||
      !progressLabel ||
      !curtain
    ) {
      return;
    }

    // Transparent context — the sequence overlays page content.
    const ctx2d = canvas.getContext('2d', { alpha: true });
    if (!ctx2d) return;

    // Always start at top so intro + scrub stay in sync on reload.
    const prevScrollRestoration = history.scrollRestoration;
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const unlockScroll = () => {
      document.body.style.overflow = prevOverflow;
    };

    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = frameSrc.replace('{i}', String(i).padStart(framePad, '0'));
      images.push(img);
    }

    const counter = { frame: 0 };
    const progress = { value: 0 };
    let lastFrame = -1;
    let viewW = 0;
    let viewH = 0;
    let cancelled = false;
    let introTl: gsap.core.Timeline | null = null;
    let breatheTl: gsap.core.Timeline | null = null;
    let exitTl: gsap.core.Timeline | null = null;
    let progressTween: gsap.core.Tween | null = null;
    let setupScrub: (() => void) | null = null;

    const introIndex = Math.max(0, Math.min(introFromFrame, frameCount) - 1);
    const reduceMotion = window.matchMedia(MQ.reduce).matches;

    /** Contain-fit scale, never upscaling past native image pixels. */
    const getContainScale = (img: HTMLImageElement) =>
      Math.min(1, viewW / img.naturalWidth, viewH / img.naturalHeight);

    /**
     * Pixel Y offset so only `visibleRatio` of the drawn frame sits above
     * the viewport bottom (e.g. 2/3 visible, 1/3 below the fold).
     */
    const getStartY = () => {
      const img = images[0];
      if (!img?.naturalWidth) return viewH * (1 - visibleRatio);
      const drawnH = img.naturalHeight * getContainScale(img);
      const centeredTop = (viewH - drawnH) / 2;
      const targetTop = viewH - visibleRatio * drawnH;
      return targetTop - centeredTop;
    };

    // Cap start scale so we never enlarge past the contain-fit original.
    const startScale = Math.min(scaleFrom, 1);

    const getDipY = () => getStartY() * yParallaxDip;
    const getPeakY = () => -viewH * yParallaxPeak;

    const resizeCanvas = () => {
      viewW = window.innerWidth;
      viewH = window.innerHeight;
      const dprCap = window.matchMedia(MQ.mobile).matches ? 1 : 1.5;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      canvas.width = Math.round(viewW * dpr);
      canvas.height = Math.round(viewH * dpr);
      canvas.style.width = `${viewW}px`;
      canvas.style.height = `${viewH}px`;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastFrame = -1;
    };

    const drawFrame = (i: number) => {
      const img = images[i];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      // Contain-fit, never larger than native pixels — this is "kích thước gốc".
      const scale = getContainScale(img);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx2d.clearRect(0, 0, viewW, viewH);
      ctx2d.drawImage(img, (viewW - w) / 2, (viewH - h) / 2, w, h);
      lastFrame = i;
    };

    const render = () => {
      const i = Math.round(counter.frame);
      if (i === lastFrame) return;
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

    const updateProgressUi = () => {
      const ratio = progress.value;
      gsap.set(progressBar, { scaleX: ratio });
      progressLabel.textContent = `${Math.round(ratio * 100)}%`;
    };

    const loadAllFrames = () => {
      let loaded = 0;
      return Promise.all(
        images.map(img =>
          waitForImage(img).then(() => {
            if (cancelled) return;
            loaded += 1;
            const next = loaded / frameCount;
            progressTween?.kill();
            progressTween = gsap.to(progress, {
              value: next,
              duration: reduceMotion ? 0 : 0.28,
              ease: 'power2.out',
              onUpdate: updateProgressUi,
            });
          })
        )
      );
    };

    const hasScrolledPastStart = () => {
      const el = document.querySelector(startSelector);
      if (!el) return window.scrollY > 8;
      return el.getBoundingClientRect().top < -8;
    };

    // Loader enter + breathe while frames decode.
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

    resizeCanvas();

    // Pin initial pose immediately so the first paint is already cropped.
    // Parallax layer owns Y; inner owns scale — desynced for stronger depth.
    gsap.set(parallax, { y: getStartY() });
    gsap.set(inner, { transformOrigin: '50% 50%', scale: startScale });

    const mm = gsap.matchMedia();

    mm.add(MOTION_CONDITIONS, ctx => {
      const { reduce } = ctx.conditions as MotionConditions;

      if (reduce) {
        // Static full bottle at end size, no scrub / no intro.
        setupScrub = null;
        counter.frame = frameCount - 1;
        gsap.set(parallax, { y: yEnd });
        gsap.set(inner, { scale: scaleTo });
        return;
      }

      // Scrub is created after the intro rewind finishes (or when skipped).
      setupScrub = () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: startSelector,
            start: 'top top',
            endTrigger: endSelector,
            end: 'bottom bottom',
            // Higher scrub lag → floatier catch-up = stronger parallax feel.
            scrub: 1.1,
            invalidateOnRefresh: true,
            // No pin — the overlay is position:fixed already; pinning would
            // inject spacers into the existing sections' layout.
          },
        });

        // Frame sequence scrubbed to scroll.
        tl.to(
          counter,
          { frame: frameCount - 1, ease: 'none', onUpdate: render },
          0
        );

        // Scale in stages so the shrink never feels like one hard drop.
        const scaleDelta = scaleTo - startScale;
        const scaleEarly = startScale + scaleDelta * 0.12;
        const scaleMid = startScale + scaleDelta * 0.55;
        const scaleLate = startScale + scaleDelta * 0.88;

        gsap.set(inner, { scale: startScale });
        tl.to(inner, { scale: scaleEarly, ease: 'none', duration: 0.28 }, 0.05);
        tl.to(inner, { scale: scaleMid, ease: 'none', duration: 0.32 }, 0.33);
        tl.to(inner, { scale: scaleLate, ease: 'none', duration: 0.22 }, 0.65);
        tl.to(inner, { scale: scaleTo, ease: 'none', duration: 0.18 }, 0.87);

        // Y parallax: dip → lift → settle slightly below center.
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
        tl.to(parallax, { y: yEnd, ease: 'none', duration: 0.3 }, 0.7);

        // Once the following section fully covers the viewport, stop painting
        // the (hidden-behind-content) overlay.
        ScrollTrigger.create({
          trigger: endSelector,
          start: 'bottom top',
          onEnter: () => gsap.set(wrapper, { visibility: 'hidden' }),
          onLeaveBack: () => gsap.set(wrapper, { visibility: 'visible' }),
        });
      };
    });

    const startReveal = () => {
      resizeCanvas();
      gsap.set(parallax, { y: getStartY() });
      gsap.set(inner, { scale: startScale });

      const reduce = window.matchMedia(MQ.reduce).matches;
      if (reduce) {
        counter.frame = frameCount - 1;
        gsap.set(parallax, { y: yEnd });
        gsap.set(inner, { scale: scaleTo });
        render();
        gsap.to(wrapper, { autoAlpha: 1, duration: 0.4, ease: 'power1.out' });
        return;
      }

      // Already mid-page — skip rewind so scrub state matches scroll.
      if (hasScrolledPastStart()) {
        counter.frame = 0;
        render();
        gsap.to(wrapper, { autoAlpha: 1, duration: 0.4, ease: 'power1.out' });
        setupScrub?.();
        ScrollTrigger.refresh();
        return;
      }

      // Init: rewind frames 15 → 1 + scale pulse (nhỏ → to → nhỏ về startScale).
      // Scale stays ≤ startScale (never above original).
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
          setupScrub?.();
          ScrollTrigger.refresh();
        },
      });

      // Frame rewind.
      introTl.to(
        counter,
        {
          frame: 0,
          duration: introDuration,
          ease: 'power2.out',
          onUpdate: render,
        },
        0
      );

      // Scale: grow in → slight shrink back → settle at current start size.
      introTl.to(
        inner,
        {
          scale: startScale,
          duration: introDuration * 0.55,
          ease: 'power2.out',
        },
        0
      );
      introTl.to(
        inner,
        {
          scale: introScaleDip,
          duration: introDuration * 0.25,
          ease: 'power1.inOut',
        },
        introDuration * 0.55
      );
      introTl.to(
        inner,
        {
          scale: startScale,
          duration: introDuration * 0.2,
          ease: 'power2.out',
        },
        introDuration * 0.8
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
        if (cancelled) return;
        loader.setAttribute('aria-busy', 'false');
        gsap.set(loader, { autoAlpha: 0, pointerEvents: 'none' });
        unlockScroll();
        startReveal();
      };

      if (reduceMotion) {
        finish();
        return;
      }

      exitTl = gsap.timeline({ onComplete: finish });

      // Snap progress to full, then lift content + curtain wipe.
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

    const boot = async () => {
      await loadAllFrames();
      if (cancelled) return;
      playExitThenReveal();
    };

    void boot();

    const onResize = () => {
      resizeCanvas();
      render();
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      introTl?.kill();
      introTl = null;
      breatheTl?.kill();
      breatheTl = null;
      exitTl?.kill();
      exitTl = null;
      progressTween?.kill();
      progressTween = null;
      unlockScroll();
      window.removeEventListener('resize', onResize);
      mm.revert();
      if ('scrollRestoration' in history) {
        history.scrollRestoration = prevScrollRestoration;
      }
    };
  }, [
    startSelector,
    endSelector,
    frameCount,
    frameSrc,
    framePad,
    scaleFrom,
    scaleTo,
    visibleRatio,
    yParallaxDip,
    yParallaxPeak,
    yEnd,
    introFromFrame,
    introDuration,
  ]);

  return (
    <>
      <div
        ref={loaderRef}
        role='status'
        aria-busy='true'
        aria-live='polite'
        aria-label='Loading Belgo experience'
        className='fixed inset-0 z-120 flex items-center justify-center overflow-hidden'
        style={{ backgroundColor: '#1A120C' }}
      >
        <div
          ref={curtainRef}
          aria-hidden='true'
          className='pointer-events-none absolute inset-0'
          style={{ backgroundColor: '#1A120C' }}
        />

        <div
          ref={loaderContentRef}
          className='relative z-10 flex flex-col items-center px-6'
        >
          <img
            ref={logoRef}
            src='/assets/logo.svg'
            alt='Belgő'
            className='h-12 w-auto will-change-transform sm:h-14 md:h-16'
          />

          <div className='mt-10 flex w-[min(72vw,220px)] flex-col items-center gap-3'>
            <div
              className='h-px w-full overflow-hidden bg-white/15'
              aria-hidden='true'
            >
              <div
                ref={progressBarRef}
                className='h-full w-full origin-left will-change-transform'
                style={{ backgroundColor: '#C9A24B', transform: 'scaleX(0)' }}
              />
            </div>

            <p
              className='flex items-baseline gap-3 text-[11px] tracking-[0.32em] text-[#EDE6D6]/70'
              style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
            >
              <span>CRAFTING</span>
              <span
                ref={progressLabelRef}
                className='tracking-[0.2em] text-[#C9A24B] tabular-nums'
              >
                0%
              </span>
            </p>
          </div>
        </div>
      </div>

      <div
        ref={wrapperRef}
        aria-hidden='true'
        className={`pointer-events-none fixed inset-0 ${zIndexClass} opacity-0`}
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
}
