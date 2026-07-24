import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Thanh địa chỉ mobile ẩn/hiện làm đổi viewport height → ScrollTrigger refresh
// và pin bị nhảy. Bỏ qua resize do browser chrome gây ra.
ScrollTrigger.config({ ignoreMobileResize: true });

export const MQ = {
  mobile: '(max-width: 767px)',
  desktop: '(min-width: 768px)',
  reduce: '(prefers-reduced-motion: reduce)',
  // Gate cho mọi hiệu ứng chuột — tablet ≥768px vẫn là touch, không dùng isDesktop.
  finePointer: '(hover: hover) and (pointer: fine)',
} as const;

/** Conditions dùng chung cho gsap.matchMedia của mọi section. */
export const MOTION_CONDITIONS = {
  isMobile: MQ.mobile,
  isDesktop: MQ.desktop,
  reduce: MQ.reduce,
  finePointer: MQ.finePointer,
};

export type MotionConditions = {
  isMobile: boolean;
  isDesktop: boolean;
  reduce: boolean;
  finePointer: boolean;
};

type ScrollToTargetOptions = {
  duration?: number;
  ease?: string;
};

/**
 * Programmatic smooth scroll — drives ScrollTrigger scrub in sync.
 * ~0.55–0.75s from hero (balanced feel). Kills in-flight tweens so
 * scroll-up → click-again does not fight a stale tween.
 */
export const scrollToTarget = (
  target: string | Element,
  options: ScrollToTargetOptions = {}
) => {
  const el =
    typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  gsap.killTweensOf(window);

  const y = Math.round(el.getBoundingClientRect().top + window.scrollY);
  const distance = Math.abs(y - window.scrollY);
  if (distance < 2) return;

  const reduce = window.matchMedia(MQ.reduce).matches;
  if (reduce) {
    window.scrollTo(0, y);
    return;
  }

  const { ease = 'power2.inOut' } = options;
  // Full-viewport jump lands ~0.65s; short remaining distance stays snappy.
  const duration =
    options.duration ??
    gsap.utils.clamp(0.4, 0.75, (distance / window.innerHeight) * 0.65);

  const root = document.documentElement;
  const prevBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';

  gsap.to(window, {
    scrollTo: { y, autoKill: true },
    duration,
    ease,
    overwrite: true,
    onComplete: () => {
      root.style.scrollBehavior = prevBehavior;
    },
    onInterrupt: () => {
      root.style.scrollBehavior = prevBehavior;
    },
  });
};

export { gsap, ScrollTrigger };
