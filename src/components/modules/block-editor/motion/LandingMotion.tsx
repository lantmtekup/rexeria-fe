'use client';

/**
 * P1 — Nền GSAP DUY NHẤT cho landing (cả /p lẫn editor canvas).
 *
 * `LandingMotionRoot` sở hữu toàn bộ phần dùng chung:
 *  - register ScrollTrigger 1 lần;
 *  - Lenis (desktop, khi scroller = window — tức /p) + đồng bộ gsap.ticker +
 *    ScrollTrigger.update;
 *  - REFRESH tập trung: on mount / window 'load' / fonts.ready / ResizeObserver
 *    nội dung → ScrollTrigger.refresh() (đây là thứ thiếu khiến scrub/pin "không
 *    chạy" khi block load ảnh bất đồng bộ);
 *  - cấp `scroller` đúng theo context (window cho /p, phần tử canvas cho editor).
 *
 * Block KHÔNG tự tạo Lenis / tự nghe scroll. Dùng `useBlockMotion` (contract).
 */
import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { useContainerMobile } from '../blocks/useContainerMobile';

gsap.registerPlugin(ScrollTrigger);

interface LandingMotionValue {
  /** Scroller cho ScrollTrigger: phần tử (editor canvas) hoặc null = window (/p). */
  scroller: HTMLElement | null;
  /** Yêu cầu refresh ScrollTrigger (debounce + vài nhịp trễ bắt ảnh load). */
  requestRefresh: () => void;
}

const LandingMotionContext = React.createContext<LandingMotionValue>({
  scroller: null,
  requestRefresh: () => {},
});

export function LandingMotionRoot({
  children,
  scrollerRef,
  enableSmooth = true,
}: {
  children: React.ReactNode;
  /** Editor: phần tử canvas cuộn. Bỏ trống → scroller = window (/p). */
  scrollerRef?: React.RefObject<HTMLElement | null>;
  /** Bật Lenis smooth-scroll (chỉ áp khi scroller = window). */
  enableSmooth?: boolean;
}) {
  const [scroller, setScroller] = React.useState<HTMLElement | null>(null);

  // Refresh tập trung — debounce + 3 nhịp trễ để bắt layout shift do ảnh load.
  const requestRefresh = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    [0, 250, 800].forEach(d =>
      window.setTimeout(() => ScrollTrigger.refresh(), d)
    );
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = scrollerRef?.current ?? null;
    setScroller(el);

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const useLenis = enableSmooth && !reduce && isDesktop && !el; // Lenis chỉ cho window-scroller

    let lenis: Lenis | null = null;
    let tickerCb: ((t: number) => void) | null = null;
    if (useLenis) {
      lenis = new Lenis({ lerp: 0.12, duration: 1.0 });
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      tickerCb = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(tickerCb);
      gsap.ticker.lagSmoothing(0);
    }

    // Refresh khi: mount, fonts ready, ảnh/layout đổi (ResizeObserver), window load.
    requestRefresh();
    document.fonts?.ready?.then(() => requestRefresh());
    const onLoad = () => requestRefresh();
    window.addEventListener('load', onLoad);

    const target = el ?? document.documentElement;
    let rT: number | null = null;
    const ro = new ResizeObserver(() => {
      if (rT) window.clearTimeout(rT);
      rT = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    ro.observe(target);

    return () => {
      window.removeEventListener('load', onLoad);
      ro.disconnect();
      if (rT) window.clearTimeout(rT);
      if (tickerCb) gsap.ticker.remove(tickerCb);
      if (lenis) {
        lenis.destroy();
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
    };
  }, [scrollerRef, enableSmooth, requestRefresh]);

  const value = React.useMemo(
    () => ({ scroller, requestRefresh }),
    [scroller, requestRefresh]
  );
  return (
    <LandingMotionContext.Provider value={value}>
      {children}
    </LandingMotionContext.Provider>
  );
}

/**
 * Truy cập nền cho block PHỨC TẠP (tự quản gsap.context + cleanup riêng, vd hero
 * canvas frame-scrub). Vẫn phải dùng `scroller` cho mọi ScrollTrigger + gọi
 * `requestRefresh()` sau khi media load — KHÔNG tự tạo Lenis/matchMedia.
 */
export function useLandingMotion(): LandingMotionValue {
  return React.useContext(LandingMotionContext);
}

interface BlockMotionApi {
  /** Truyền vào MỌI `scrollTrigger.scroller` của block (đồng bộ /p & editor). */
  scroller: HTMLElement | undefined;
  /** isMobile đo theo container (khung block), không viewport. */
  isMobile: boolean;
  /** Gọi sau khi media (ảnh/canvas) của block load xong. */
  requestRefresh: () => void;
}

/**
 * Contract animation cho block. Thay cho useEffect+gsap thủ công:
 *
 *   useBlockMotion(rootRef, ({ scroller, isMobile, requestRefresh }) => {
 *     gsap.to(el, { y: 60, scrollTrigger: { trigger: el, scroller, scrub: 1 } });
 *   });
 *
 * Tự: tạo gsap.context scope theo root, revert khi unmount, refresh sau build.
 */
export function useBlockMotion(
  rootRef: React.RefObject<HTMLElement | null>,
  build: (api: BlockMotionApi) => void,
  deps: React.DependencyList = []
) {
  const { scroller, requestRefresh } = React.useContext(LandingMotionContext);
  const isMobile = useContainerMobile(rootRef);
  // build mới nhất giữ trong ref để effect không phụ thuộc identity của closure.
  const buildRef = React.useRef(build);
  buildRef.current = build;

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      buildRef.current({
        scroller: scroller ?? undefined,
        isMobile,
        requestRefresh,
      });
    }, root);
    requestRefresh();
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroller, isMobile, requestRefresh, ...deps]);
}
