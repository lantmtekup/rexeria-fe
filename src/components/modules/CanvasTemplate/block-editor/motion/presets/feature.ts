import gsap from 'gsap';

import { motionRegistry } from '../registry';
import { CASCADE_S, INTENSITY_MULT, SPEED, amplitude } from '../tokens';
import type { MotionPreset } from '../types';

const SCROLLER_TRIGGER = (
  trigger: Element | null,
  scrollerEl: HTMLElement | null | undefined
) =>
  trigger
    ? {
        trigger,
        start: 'top 85%',
        once: true,
        scroller: scrollerEl ?? undefined,
      }
    : undefined;

/* ── 7. feature.cards-rise ───────────────────────────────────────── */
const cardsRise: MotionPreset = {
  id: 'feature.cards-rise',
  category: 'entrance',
  scope: 'children',
  blockTypes: ['feature_section'],
  name: { vi: 'Thẻ trồi lên', en: 'Cards Rise' },
  description: {
    vi: 'Các thẻ feature trồi từ dưới lên với cascade',
    en: 'Feature cards rise from below sequentially',
  },
  thumbHint: '⏶',
  knobs: { speed: true, intensity: true, cascade: true },
  build: ({ target, config, device, attachTriggers, scrollerEl }) => {
    const targets = Array.isArray(target) ? target : [target];
    if (!targets.length) return null;
    const { duration, ease } = SPEED[config.speed];
    return gsap
      .timeline({
        paused: !attachTriggers,
        delay: (config.delay ?? 0) / 1000,
        scrollTrigger: attachTriggers
          ? SCROLLER_TRIGGER(targets[0], scrollerEl)
          : undefined,
      })
      .from(targets, {
        y: 50 * amplitude(config.intensity, device),
        opacity: 0,
        duration,
        ease,
        stagger: CASCADE_S[config.cascade] || 0.1,
      });
  },
};

/* ── 8. feature.cards-fan-in ─────────────────────────────────────── */
const cardsFanIn: MotionPreset = {
  id: 'feature.cards-fan-in',
  category: 'entrance',
  scope: 'children',
  blockTypes: ['feature_section'],
  name: { vi: 'Mở quạt', en: 'Fan In' },
  description: {
    vi: 'Các thẻ stagger từ giữa ra, hơi xoay nhẹ',
    en: 'Cards stagger out from center with slight rotation',
  },
  thumbHint: '◢◣',
  knobs: { speed: true, intensity: true, cascade: true },
  build: ({ target, config, device, attachTriggers, scrollerEl }) => {
    const targets = Array.isArray(target) ? target : [target];
    if (!targets.length) return null;
    const { duration, ease } = SPEED[config.speed];
    const mid = (targets.length - 1) / 2;
    const yBase = 40 * amplitude(config.intensity, device);
    const rotBase = 2 * INTENSITY_MULT[config.intensity];
    const tl = gsap.timeline({
      paused: !attachTriggers,
      delay: (config.delay ?? 0) / 1000,
      scrollTrigger: attachTriggers
        ? SCROLLER_TRIGGER(targets[0], scrollerEl)
        : undefined,
    });
    tl.from(targets, {
      y: yBase,
      rotateZ: (i: number) => (i - mid) * rotBase,
      opacity: 0,
      duration,
      ease,
      stagger: CASCADE_S[config.cascade] || 0.08,
    });
    return tl;
  },
};

/* ── 9. feature.cards-scale-in ───────────────────────────────────── */
const cardsScaleIn: MotionPreset = {
  id: 'feature.cards-scale-in',
  category: 'entrance',
  scope: 'children',
  blockTypes: ['feature_section'],
  name: { vi: 'Phồng từng thẻ', en: 'Cards Scale In' },
  description: {
    vi: 'Cards scale 0.92 → 1 + fade, stagger',
    en: 'Cards scale 0.92 → 1 with fade and stagger',
  },
  thumbHint: '⌘',
  knobs: { speed: true, intensity: true, cascade: true },
  build: ({ target, config, device, attachTriggers, scrollerEl }) => {
    const targets = Array.isArray(target) ? target : [target];
    if (!targets.length) return null;
    const { duration } = SPEED[config.speed];
    const scaleFrom = 1 - 0.08 * amplitude(config.intensity, device);
    return gsap
      .timeline({
        paused: !attachTriggers,
        delay: (config.delay ?? 0) / 1000,
        scrollTrigger: attachTriggers
          ? SCROLLER_TRIGGER(targets[0], scrollerEl)
          : undefined,
      })
      .from(targets, {
        scale: scaleFrom,
        opacity: 0,
        duration,
        ease: 'back.out(1.4)',
        stagger: CASCADE_S[config.cascade] || 0.08,
      });
  },
};

/* ── 10. feature.icon-pop ────────────────────────────────────────── */
const iconPop: MotionPreset = {
  id: 'feature.icon-pop',
  category: 'entrance',
  scope: 'children',
  blockTypes: ['feature_section'],
  elementKinds: ['icon'],
  name: { vi: 'Pop từng icon', en: 'Icon Pop' },
  description: {
    vi: 'Icon scale 0 → 1 với spring, hơi delay',
    en: 'Icons spring from 0 → 1 with delay',
  },
  thumbHint: '💥',
  knobs: { speed: true, intensity: false, cascade: true },
  build: ({ target, config, attachTriggers, scrollerEl }) => {
    const targets = Array.isArray(target) ? target : [target];
    if (!targets.length) return null;
    const { duration } = SPEED[config.speed];
    return gsap
      .timeline({
        paused: !attachTriggers,
        delay: 0.2 + (config.delay ?? 0) / 1000,
        scrollTrigger: attachTriggers
          ? SCROLLER_TRIGGER(targets[0], scrollerEl)
          : undefined,
      })
      .from(targets, {
        scale: 0,
        duration,
        ease: 'back.out(2)',
        stagger: CASCADE_S[config.cascade] || 0.06,
      });
  },
};

/* ── 11. feature.card-hover-lift (hover) ─────────────────────────── */
const cardHoverLift: MotionPreset = {
  id: 'feature.card-hover-lift',
  category: 'hover',
  scope: 'children',
  blockTypes: ['feature_section'],
  name: { vi: 'Thẻ nâng khi hover', en: 'Card Hover Lift' },
  description: {
    vi: 'Thẻ dịch lên 4px + đổ bóng khi hover',
    en: 'Card lifts -4px with shadow on hover',
  },
  thumbHint: '⤴',
  knobs: { speed: false, intensity: true, cascade: false },
  build: ({ target, config, device }) => {
    const targets = Array.isArray(target) ? target : [target];
    if (!targets.length) return null;
    const lift = -4 * amplitude(config.intensity, device);
    targets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        gsap.to(el, {
          y: lift,
          boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
          duration: 0.3,
          ease: 'power2.out',
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          y: 0,
          boxShadow: '0 0 0 rgba(0,0,0,0)',
          duration: 0.3,
          ease: 'power2.out',
        });
      });
    });
    return null;
  },
};

/* ── 12. feature.icon-spin-on-hover (hover) ──────────────────────── */
const iconSpinOnHover: MotionPreset = {
  id: 'feature.icon-spin-on-hover',
  category: 'hover',
  scope: 'children',
  blockTypes: ['feature_section'],
  elementKinds: ['icon'],
  name: { vi: 'Icon xoáy khi hover', en: 'Icon Spin Hover' },
  description: {
    vi: 'Icon scale 1.15 + xoay 6° khi hover',
    en: 'Icon scales 1.15 and rotates 6° on hover',
  },
  thumbHint: '↻',
  knobs: { speed: false, intensity: true, cascade: false },
  build: ({ target, config, device }) => {
    const targets = Array.isArray(target) ? target : [target];
    if (!targets.length) return null;
    const amp = amplitude(config.intensity, device);
    targets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        gsap.to(el, {
          scale: 1 + 0.15 * amp,
          rotate: 6 * amp,
          duration: 0.3,
          ease: 'power2.out',
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          scale: 1,
          rotate: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      });
    });
    return null;
  },
};

motionRegistry.register(cardsRise);
motionRegistry.register(cardsFanIn);
motionRegistry.register(cardsScaleIn);
motionRegistry.register(iconPop);
motionRegistry.register(cardHoverLift);
motionRegistry.register(iconSpinOnHover);
