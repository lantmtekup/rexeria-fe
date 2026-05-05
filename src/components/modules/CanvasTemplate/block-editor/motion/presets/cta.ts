import gsap from 'gsap';

import { motionRegistry } from '../registry';
import { SPEED, amplitude } from '../tokens';
import type { MotionPreset } from '../types';

/* ── 23. cta.button-magnetic (hover) ─────────────────────────────── */
const buttonMagnetic: MotionPreset = {
  id: 'cta.button-magnetic',
  category: 'hover',
  scope: 'element',
  blockTypes: ['cta_section'],
  elementKinds: ['button'],
  name: { vi: 'Nút từ tính', en: 'Magnetic Button' },
  description: {
    vi: 'Nút hơi follow chuột trong vùng 80px',
    en: 'Button gently follows cursor within 80px radius',
  },
  thumbHint: '🧲',
  knobs: { speed: false, intensity: true, cascade: false },
  build: ({ target, config, device }) => {
    const el = Array.isArray(target) ? target[0] : target;
    if (!el) return null;
    const amp = amplitude(config.intensity, device);
    const radius = 80;
    const strength = 0.3 * amp;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      if (Math.hypot(dx, dy) > radius) return;
      gsap.to(el, {
        x: dx * strength,
        y: dy * strength,
        duration: 0.4,
        ease: 'power2.out',
      });
    };
    const reset = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    };
    const parent = el.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handleMove);
      parent.addEventListener('mouseleave', reset);
    }
    return null;
  },
};

/* ── 24. cta.button-breath (ambient) ─────────────────────────────── */
const buttonBreath: MotionPreset = {
  id: 'cta.button-breath',
  category: 'ambient',
  scope: 'element',
  blockTypes: ['cta_section'],
  elementKinds: ['button'],
  name: { vi: 'Nút thở nhẹ', en: 'Button Breath' },
  description: {
    vi: 'Nút phồng-xẹp rất nhẹ liên tục',
    en: 'Button gently breathes 1 ↔ 1.02',
  },
  thumbHint: '◯',
  knobs: { speed: false, intensity: true, cascade: false },
  build: ({ target, config, device }) => {
    const el = Array.isArray(target) ? target[0] : target;
    if (!el) return null;
    const delta = 0.02 * amplitude(config.intensity, device);
    return gsap.to(el, {
      scale: 1 + delta,
      repeat: -1,
      yoyo: true,
      duration: 3,
      ease: 'sine.inOut',
    });
  },
};

/* ── 25. cta.arrow-nudge (hover) ─────────────────────────────────── */
const arrowNudge: MotionPreset = {
  id: 'cta.arrow-nudge',
  category: 'hover',
  scope: 'element',
  blockTypes: ['cta_section'],
  elementKinds: ['button'],
  name: { vi: 'Mũi tên đẩy nhẹ', en: 'Arrow Nudge' },
  description: {
    vi: 'Mũi tên trong nút trượt nhẹ khi hover',
    en: 'Arrow inside button slides on hover',
  },
  thumbHint: '→',
  knobs: { speed: true, intensity: true, cascade: false },
  build: ({ target, config, device }) => {
    const el = Array.isArray(target) ? target[0] : target;
    if (!el) return null;
    const arrow = el.querySelector<HTMLElement>('[data-cta-arrow]') ?? el;
    const { duration, ease } = SPEED[config.speed];
    const dx = 4 * amplitude(config.intensity, device);
    el.addEventListener('mouseenter', () => {
      gsap.to(arrow, { x: dx, duration, ease });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(arrow, { x: 0, duration, ease });
    });
    return null;
  },
};

motionRegistry.register(buttonMagnetic);
motionRegistry.register(buttonBreath);
motionRegistry.register(arrowNudge);
