import gsap from 'gsap';

import { motionRegistry } from '../registry';
import { CASCADE_S, INTENSITY_MULT, SPEED, amplitude } from '../tokens';
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

/* ── 13. gallery.mosaic-stagger ──────────────────────────────────── */
const mosaicStagger: MotionPreset = {
  id: 'gallery.mosaic-stagger',
  category: 'entrance',
  scope: 'children',
  blockTypes: ['photo_gallery'],
  name: { vi: 'Mosaic ngẫu nhiên', en: 'Mosaic Stagger' },
  description: {
    vi: 'Ảnh xuất hiện ngẫu nhiên, cảm giác sống động',
    en: 'Photos appear in random order — organic feel',
  },
  thumbHint: '▦',
  knobs: { speed: true, intensity: true, cascade: true },
  build: ({ target, config, device, attachTriggers, scrollerEl }) => {
    const targets = Array.isArray(target) ? target : [target];
    if (!targets.length) return null;
    const { duration } = SPEED[config.speed];
    const scaleFrom = 1 - 0.04 * amplitude(config.intensity, device);
    return gsap
      .timeline({
        paused: !attachTriggers,
        delay: (config.delay ?? 0) / 1000,
        scrollTrigger: attachTriggers
          ? TRIGGER(targets[0], scrollerEl)
          : undefined,
      })
      .from(targets, {
        scale: scaleFrom,
        opacity: 0,
        duration,
        ease: 'power2.out',
        stagger: { amount: 0.6, from: 'random' },
      });
  },
};

/* ── 14. gallery.parallax-tilt (scroll) ──────────────────────────── */
const parallaxTilt: MotionPreset = {
  id: 'gallery.parallax-tilt',
  category: 'scroll',
  scope: 'children',
  blockTypes: ['photo_gallery'],
  name: { vi: 'Lệch chiều sâu', en: 'Parallax Tilt' },
  description: {
    vi: 'Mỗi ảnh dịch theo chiều khác — ảo giác 3D',
    en: 'Each photo drifts at a different rate — 3D effect',
  },
  thumbHint: '⇅',
  knobs: { speed: false, intensity: true, cascade: false },
  build: ({ target, config, attachTriggers, scrollerEl }) => {
    const targets = Array.isArray(target) ? target : [target];
    if (!targets.length || !attachTriggers) return null;
    const amp = INTENSITY_MULT[config.intensity];
    targets.forEach((el, i) => {
      const offset = ((i % 3) - 1) * 5 * amp;
      gsap.to(el, {
        yPercent: offset,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
          scroller: scrollerEl ?? undefined,
        },
      });
    });
    return null;
  },
};

/* ── 15. gallery.cascade-zoom ────────────────────────────────────── */
const cascadeZoom: MotionPreset = {
  id: 'gallery.cascade-zoom',
  category: 'entrance',
  scope: 'children',
  blockTypes: ['photo_gallery'],
  name: { vi: 'Zoom + xoá nét', en: 'Cascade Zoom' },
  description: {
    vi: 'Ảnh scale 0.85 + blur dần rõ',
    en: 'Photos scale up from 0.85 with blur fading',
  },
  thumbHint: '✦',
  knobs: { speed: true, intensity: true, cascade: true },
  build: ({ target, config, device, attachTriggers, scrollerEl }) => {
    const targets = Array.isArray(target) ? target : [target];
    if (!targets.length) return null;
    const { duration } = SPEED[config.speed];
    const amp = amplitude(config.intensity, device);
    return gsap
      .timeline({
        paused: !attachTriggers,
        delay: (config.delay ?? 0) / 1000,
        scrollTrigger: attachTriggers
          ? TRIGGER(targets[0], scrollerEl)
          : undefined,
      })
      .from(targets, {
        scale: 1 - 0.15 * amp,
        filter: `blur(${10 * amp}px)`,
        opacity: 0,
        duration,
        ease: 'power3.out',
        stagger: CASCADE_S[config.cascade] || 0.12,
      });
  },
};

/* ── 16. gallery.photo-zoom-on-hover ─────────────────────────────── */
const photoZoomOnHover: MotionPreset = {
  id: 'gallery.photo-zoom-on-hover',
  category: 'hover',
  scope: 'children',
  blockTypes: ['photo_gallery'],
  name: { vi: 'Phóng to khi hover', en: 'Photo Zoom Hover' },
  description: {
    vi: 'Ảnh scale 1.04 + sáng hơn nhẹ khi hover',
    en: 'Photo scales 1.04 with brightness lift on hover',
  },
  thumbHint: '🔍',
  knobs: { speed: false, intensity: true, cascade: false },
  build: ({ target, config, device }) => {
    const targets = Array.isArray(target) ? target : [target];
    if (!targets.length) return null;
    const amp = amplitude(config.intensity, device);
    targets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        gsap.to(el, {
          scale: 1 + 0.04 * amp,
          filter: 'brightness(1.05)',
          duration: 0.4,
          ease: 'power2.out',
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          scale: 1,
          filter: 'brightness(1)',
          duration: 0.4,
          ease: 'power2.out',
        });
      });
    });
    return null;
  },
};

/* ── 17. gallery.caption-rise-on-hover ───────────────────────────── */
const captionRiseOnHover: MotionPreset = {
  id: 'gallery.caption-rise-on-hover',
  category: 'hover',
  scope: 'children',
  blockTypes: ['photo_gallery'],
  name: { vi: 'Caption hiện khi hover', en: 'Caption Rise On Hover' },
  description: {
    vi: 'Caption trồi từ dưới khi hover ảnh',
    en: 'Caption rises from below on photo hover',
  },
  thumbHint: '⤴',
  knobs: { speed: true, intensity: false, cascade: false },
  build: ({ target, config }) => {
    const targets = Array.isArray(target) ? target : [target];
    if (!targets.length) return null;
    const { duration, ease } = SPEED[config.speed];
    targets.forEach(card => {
      const caption = card.querySelector<HTMLElement>('[data-photo-caption]');
      if (!caption) return;
      gsap.set(caption, { yPercent: 100, opacity: 0 });
      card.addEventListener('mouseenter', () => {
        gsap.to(caption, { yPercent: 0, opacity: 1, duration, ease });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(caption, { yPercent: 100, opacity: 0, duration, ease });
      });
    });
    return null;
  },
};

/* ── 18. gallery.scroll-bound-horizontal (scroll-progress) ───────── */
const scrollBoundHorizontal: MotionPreset = {
  id: 'gallery.scroll-bound-horizontal',
  category: 'scroll',
  scope: 'block',
  blockTypes: ['photo_gallery'],
  name: { vi: 'Cuộn ngang theo dọc', en: 'Horizontal Scroll' },
  description: {
    vi: 'Gallery dịch ngang theo cuộn dọc — Framer signature',
    en: 'Gallery scrolls horizontally as user scrolls vertically',
  },
  thumbHint: '⇆',
  knobs: { speed: false, intensity: true, cascade: false },
  build: ({ target, config, attachTriggers, scrollerEl }) => {
    const root = Array.isArray(target) ? target[0] : target;
    if (!root || !attachTriggers) return null;
    const track =
      root.querySelector<HTMLElement>('[data-gallery-track]') ?? root;
    const distance = 75 * INTENSITY_MULT[config.intensity];
    return gsap.to(track, {
      xPercent: -distance,
      ease: 'none',
      scrollTrigger: {
        trigger: root,
        pin: true,
        scrub: 0.5,
        end: '+=200%',
        scroller: scrollerEl ?? undefined,
      },
    });
  },
};

motionRegistry.register(mosaicStagger);
motionRegistry.register(parallaxTilt);
motionRegistry.register(cascadeZoom);
motionRegistry.register(photoZoomOnHover);
motionRegistry.register(captionRiseOnHover);
motionRegistry.register(scrollBoundHorizontal);
