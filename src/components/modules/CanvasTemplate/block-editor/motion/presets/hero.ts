import gsap from 'gsap';

import { motionRegistry } from '../registry';
import { CASCADE_S, INTENSITY_MULT, SPEED, amplitude } from '../tokens';
import type { MotionPreset } from '../types';

/** Helper: build a base ScrollTrigger config consistent across presets. */
function makeTrigger(
  trigger: Element | null,
  scrollerEl: HTMLElement | null | undefined
) {
  return trigger
    ? {
        trigger,
        start: 'top 85%',
        once: true,
        scroller: scrollerEl ?? undefined,
      }
    : undefined;
}

/* ── 1. hero.fade-up-stagger ─────────────────────────────────────── */
const heroFadeUpStagger: MotionPreset = {
  id: 'hero.fade-up-stagger',
  category: 'entrance',
  scope: 'children',
  blockTypes: ['hero_split', 'hero_overlay'],
  name: { vi: 'Hiện lên + cascade', en: 'Fade Up Stagger' },
  description: {
    vi: 'Các phần của hero lần lượt hiện từ dưới lên',
    en: 'Hero parts rise sequentially',
  },
  thumbHint: '⬆',
  knobs: { speed: true, intensity: true, cascade: true },
  build: ({ target, config, device, attachTriggers, scrollerEl }) => {
    const targets = Array.isArray(target) ? target : [target];
    if (!targets.length) return null;
    const { duration, ease } = SPEED[config.speed];
    const tl = gsap.timeline({
      paused: !attachTriggers,
      delay: (config.delay ?? 0) / 1000,
      scrollTrigger: attachTriggers
        ? makeTrigger(targets[0], scrollerEl)
        : undefined,
    });
    tl.from(targets, {
      y: 40 * amplitude(config.intensity, device),
      opacity: 0,
      duration,
      ease,
      stagger: CASCADE_S[config.cascade],
    });
    return tl;
  },
};

/* ── 2. hero.mask-reveal-up ──────────────────────────────────────── */
const heroMaskRevealUp: MotionPreset = {
  id: 'hero.mask-reveal-up',
  category: 'entrance',
  scope: 'children',
  blockTypes: ['hero_split', 'hero_overlay'],
  name: { vi: 'Vén mặt nạ lên', en: 'Mask Reveal Up' },
  description: {
    vi: 'Tiêu đề được vén từ dưới lên như rèm sân khấu',
    en: 'Title is unveiled like a curtain',
  },
  thumbHint: '▔',
  knobs: { speed: true, intensity: false, cascade: true },
  build: ({ target, config, attachTriggers, scrollerEl }) => {
    const targets = Array.isArray(target) ? target : [target];
    if (!targets.length) return null;
    const { duration, ease } = SPEED[config.speed];
    const tl = gsap.timeline({
      paused: !attachTriggers,
      delay: (config.delay ?? 0) / 1000,
      scrollTrigger: attachTriggers
        ? makeTrigger(targets[0], scrollerEl)
        : undefined,
    });
    tl.from(targets, {
      clipPath: 'inset(100% 0 0 0)',
      opacity: 0,
      duration,
      ease,
      stagger: CASCADE_S[config.cascade],
    });
    return tl;
  },
};

/* ── 3. hero.slide-from-right ────────────────────────────────────── */
const heroSlideFromRight: MotionPreset = {
  id: 'hero.slide-from-right',
  category: 'entrance',
  scope: 'children',
  blockTypes: ['hero_split', 'hero_overlay'],
  name: { vi: 'Lướt từ phải', en: 'Slide From Right' },
  description: {
    vi: 'Các phần lần lượt lướt từ phải vào',
    en: 'Parts slide in from the right',
  },
  thumbHint: '→',
  knobs: { speed: true, intensity: true, cascade: true },
  build: ({ target, config, device, attachTriggers, scrollerEl }) => {
    const targets = Array.isArray(target) ? target : [target];
    if (!targets.length) return null;
    const { duration, ease } = SPEED[config.speed];
    const tl = gsap.timeline({
      paused: !attachTriggers,
      delay: (config.delay ?? 0) / 1000,
      scrollTrigger: attachTriggers
        ? makeTrigger(targets[0], scrollerEl)
        : undefined,
    });
    tl.from(targets, {
      x: 60 * amplitude(config.intensity, device),
      opacity: 0,
      duration,
      ease,
      stagger: CASCADE_S[config.cascade],
    });
    return tl;
  },
};

/* ── 4. hero.scale-in ────────────────────────────────────────────── */
const heroScaleIn: MotionPreset = {
  id: 'hero.scale-in',
  category: 'entrance',
  scope: 'block',
  blockTypes: ['hero_split', 'hero_overlay'],
  name: { vi: 'Phồng vào', en: 'Scale In' },
  description: {
    vi: 'Cả block scale từ 1.05 → 1 + fade',
    en: 'Whole block scales 1.05 → 1 with fade',
  },
  thumbHint: '◉',
  knobs: { speed: true, intensity: true, cascade: false },
  build: ({ target, config, device, attachTriggers, scrollerEl }) => {
    const el = Array.isArray(target) ? target[0] : target;
    if (!el) return null;
    const { duration, ease } = SPEED[config.speed];
    const scaleDelta = 0.05 * amplitude(config.intensity, device);
    return gsap.from(el, {
      scale: 1 + scaleDelta,
      opacity: 0,
      duration,
      ease,
      delay: (config.delay ?? 0) / 1000,
      paused: !attachTriggers,
      scrollTrigger: attachTriggers ? makeTrigger(el, scrollerEl) : undefined,
    });
  },
};

/* ── 5. hero.parallax-soft (scroll-progress) ─────────────────────── */
const heroParallaxSoft: MotionPreset = {
  id: 'hero.parallax-soft',
  category: 'scroll',
  scope: 'element',
  blockTypes: ['hero_split', 'hero_overlay'],
  elementKinds: ['image'],
  name: { vi: 'Parallax nhẹ', en: 'Soft Parallax' },
  description: {
    vi: 'Ảnh dịch chuyển nhẹ theo cuộn — chiều sâu ảo',
    en: 'Image drifts subtly with scroll',
  },
  thumbHint: '↕',
  knobs: { speed: false, intensity: true, cascade: false },
  build: ({ target, config, attachTriggers, scrollerEl }) => {
    const el = Array.isArray(target) ? target[0] : target;
    if (!el || !attachTriggers) return null;
    const depth = -10 * INTENSITY_MULT[config.intensity];
    return gsap.to(el, {
      yPercent: depth,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.4,
        scroller: scrollerEl ?? undefined,
      },
    });
  },
};

/* ── 6. hero.image-float (ambient) ───────────────────────────────── */
const heroImageFloat: MotionPreset = {
  id: 'hero.image-float',
  category: 'ambient',
  scope: 'element',
  blockTypes: ['hero_split', 'hero_overlay'],
  elementKinds: ['image'],
  name: { vi: 'Ảnh trôi nhẹ', en: 'Image Float' },
  description: {
    vi: 'Ảnh hero nâng-hạ nhẹ liên tục',
    en: 'Hero image gently floats',
  },
  thumbHint: '~',
  knobs: { speed: false, intensity: true, cascade: false },
  build: ({ target, config, device }) => {
    const el = Array.isArray(target) ? target[0] : target;
    if (!el) return null;
    const range = 3 * amplitude(config.intensity, device);
    return gsap.to(el, {
      y: range,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      duration: 4,
    });
  },
};

motionRegistry.register(heroFadeUpStagger);
motionRegistry.register(heroMaskRevealUp);
motionRegistry.register(heroSlideFromRight);
motionRegistry.register(heroScaleIn);
motionRegistry.register(heroParallaxSoft);
motionRegistry.register(heroImageFloat);
