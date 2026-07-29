import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);

// Thanh địa chỉ mobile ẩn/hiện làm đổi viewport height → ScrollTrigger refresh
// và pin bị nhảy. Bỏ qua resize do browser chrome gây ra.
ScrollTrigger.config({ ignoreMobileResize: true });

export const MQ = {
  mobile: '(max-width: 767px)',
  desktop: '(min-width: 768px)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const;

/** Conditions dùng chung cho gsap.matchMedia của mọi section. */
export const MOTION_CONDITIONS = {
  isMobile: MQ.mobile,
  isDesktop: MQ.desktop,
  reduce: MQ.reduce,
};

export type MotionConditions = {
  isMobile: boolean;
  isDesktop: boolean;
  reduce: boolean;
};

export { gsap, ScrollTrigger, CustomEase };
