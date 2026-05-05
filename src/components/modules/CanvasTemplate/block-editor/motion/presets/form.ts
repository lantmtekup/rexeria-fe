import gsap from 'gsap';

import { motionRegistry } from '../registry';
import { CASCADE_S, SPEED, amplitude } from '../tokens';
import type { MotionPreset } from '../types';

const TRIGGER = (
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

/* ── 19. form.field-cascade ──────────────────────────────────────── */
const fieldCascade: MotionPreset = {
  id: 'form.field-cascade',
  category: 'entrance',
  scope: 'children',
  blockTypes: ['booking_form'],
  name: { vi: 'Cascade các field', en: 'Field Cascade' },
  description: {
    vi: 'Các field trồi từ dưới lên lần lượt',
    en: 'Form fields rise sequentially',
  },
  thumbHint: '▤',
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
          ? TRIGGER(targets[0], scrollerEl)
          : undefined,
      })
      .from(targets, {
        y: 60 * amplitude(config.intensity, device),
        opacity: 0,
        duration,
        ease,
        stagger: CASCADE_S[config.cascade] || 0.07,
      });
  },
};

/* ── 20. form.focus-ring-spring (focus state) ────────────────────── */
const focusRingSpring: MotionPreset = {
  id: 'form.focus-ring-spring',
  category: 'hover', // user-intent → run regardless of reduced-motion
  scope: 'element',
  blockTypes: ['booking_form'],
  name: { vi: 'Ring spring khi focus', en: 'Focus Ring Spring' },
  description: {
    vi: 'Ring focus bật ra với spring khi click vào field',
    en: 'Focus ring springs out when field is focused',
  },
  thumbHint: '◎',
  knobs: { speed: false, intensity: false, cascade: false },
  build: ({ target }) => {
    const el = Array.isArray(target) ? target[0] : target;
    if (!el) return null;
    const ring = el.querySelector<HTMLElement>('[data-focus-ring]');
    if (!ring) return null;
    gsap.set(ring, { scale: 0, opacity: 0, transformOrigin: 'center' });
    el.addEventListener('focusin', () => {
      gsap.fromTo(
        ring,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }
      );
    });
    el.addEventListener('focusout', () => {
      gsap.to(ring, { scale: 0, opacity: 0, duration: 0.2 });
    });
    return null;
  },
};

/* ── 21. form.error-shake ────────────────────────────────────────── */
const errorShake: MotionPreset = {
  id: 'form.error-shake',
  category: 'hover', // user-intent state, never auto-played at scroll
  scope: 'element',
  blockTypes: ['booking_form'],
  name: { vi: 'Rung khi sai', en: 'Error Shake' },
  description: {
    vi: 'Field rung lắc nhẹ khi validate fail',
    en: 'Field shakes briefly on validation fail',
  },
  thumbHint: '⚠',
  knobs: { speed: false, intensity: false, cascade: false },
  build: ({ target }) => {
    const el = Array.isArray(target) ? target[0] : target;
    if (!el) return null;
    // Triggered imperatively by app code via custom event 'rexer:error'.
    const handler = () => {
      gsap.fromTo(
        el,
        { x: 4 },
        { x: 0, duration: 0.04, repeat: 5, yoyo: true, ease: 'power1.inOut' }
      );
    };
    el.addEventListener('rexer:error', handler);
    return null;
  },
};

/* ── 22. form.success-morph ──────────────────────────────────────── */
const successMorph: MotionPreset = {
  id: 'form.success-morph',
  category: 'hover',
  scope: 'element',
  blockTypes: ['booking_form'],
  elementKinds: ['button'],
  name: { vi: 'Submit → tick xanh', en: 'Success Morph' },
  description: {
    vi: 'Nút submit biến thành dấu tick xanh khi thành công',
    en: 'Submit button morphs into green tick on success',
  },
  thumbHint: '✓',
  knobs: { speed: false, intensity: false, cascade: false },
  build: ({ target }) => {
    const el = Array.isArray(target) ? target[0] : target;
    if (!el) return null;
    // Triggered imperatively via custom event 'rexer:success'.
    const handler = () => {
      gsap
        .timeline()
        .to(el, {
          backgroundColor: '#10b981',
          scale: 1.05,
          duration: 0.2,
          ease: 'power2.out',
        })
        .to(el, { scale: 1, duration: 0.15, ease: 'power2.out' });
    };
    el.addEventListener('rexer:success', handler);
    return null;
  },
};

motionRegistry.register(fieldCascade);
motionRegistry.register(focusRingSpring);
motionRegistry.register(errorShake);
motionRegistry.register(successMorph);
