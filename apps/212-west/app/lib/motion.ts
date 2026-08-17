'use client';

import gsap from 'gsap';

import { Observer } from 'gsap/Observer';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(Observer, ScrollTrigger);

ScrollTrigger.config({ ignoreMobileResize: true });

export const MQ = {
  mobile: '(max-width: 767px)',
  desktop: '(min-width: 768px)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const;

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

export { gsap, Observer, ScrollTrigger };
