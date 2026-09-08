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

type ReplayTriggerOptions = {
  trigger: Element;
  start: string;
  end?: string;
  timeline: gsap.core.Timeline;
  enabled?: () => boolean;
};

/**
 * Chạy lại timeline mỗi lần section vào khung nhìn thay vì `once: true`.
 * Cuộn lên qua `start` thì tua ngược (còn nhìn thấy nên cần animate),
 * ra hẳn khỏi màn ở `end` thì reset tức thời để lần sau chạy trọn vẹn.
 */
export function createReplayTrigger({
  trigger,
  start,
  end = 'bottom top',
  timeline,
  enabled,
}: ReplayTriggerOptions) {
  const blocked = () => enabled !== undefined && !enabled();

  return ScrollTrigger.create({
    trigger,
    start,
    end,
    onEnter: () => {
      if (blocked()) return;
      timeline.play();
    },
    onEnterBack: () => {
      if (blocked()) return;
      timeline.play();
    },
    onLeave: () => {
      if (blocked()) return;
      timeline.pause(0);
    },
    onLeaveBack: () => {
      if (blocked()) return;
      timeline.reverse();
    },
  });
}

export { gsap, Observer, ScrollTrigger };
