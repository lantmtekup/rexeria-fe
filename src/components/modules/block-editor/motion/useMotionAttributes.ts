'use client';

/**
 * Motion Attribute System — runtime T1/T2.
 *
 * Block gọi `useMotionAttributes(rootRef)` MỘT lần rồi gắn hiệu ứng bằng
 * attribute trong JSX:
 *
 *   <h2 data-motion="char-reveal" data-motion-start="top 85%">…</h2>
 *   <li data-motion-group data-motion-start="top 80%">
 *     <div data-motion="fade-up" data-motion-distance="30" … />
 *     <span data-motion="scale-pop" data-motion-delay="0.3" />
 *   </li>
 *
 * Vocabulary (đầy đủ trong docs/landing-motion-foundation.md):
 *  - data-motion="<effect-id>"           — id trong motionLibrary
 *  - data-motion-duration|delay|stagger  — giây
 *  - data-motion-ease                    — GSAP ease string
 *  - data-motion-distance                — px, override biên độ (effect có distanceVar)
 *  - data-motion-origin                  — transform-origin
 *  - data-motion-trigger                 — in-view (default) | scrub | load
 *  - data-motion-start|end               — ScrollTrigger start/end
 *  - data-motion-scrub                   — số (smoothing) | mặc định true
 *  - data-motion-once                    — "true" = chạy 1 lần (mặc định play/reverse)
 *  - data-motion-trigger-target          — self (default) | root | CSS selector trong root
 *  - data-motion-end-target              — như trên, cho endTrigger (scrub)
 *  - data-motion-group (trên container)  — các data-motion bên trong dùng chung 1
 *    ScrollTrigger trên container; container nhận start/once; con offset bằng delay.
 *
 * Tuân contract R1–R6 (docs/landing-motion-foundation.md): scroller từ
 * LandingMotion, invalidateOnRefresh, gsap.context revert, refresh tập trung.
 * Tự skip trên editor edit-canvas (rest state ổn định) và prefers-reduced-motion.
 */
import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import { useLandingMotion } from './LandingMotion';
import {
  getMotionEffect,
  type MotionEffect,
  type MotionTriggerKind,
} from './motionLibrary';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

interface ParsedMotion {
  el: HTMLElement;
  effect: MotionEffect;
  from: Record<string, unknown>;
  to: Record<string, unknown>;
  duration: number;
  delay: number;
  ease: string;
  stagger?: number;
  trigger: MotionTriggerKind;
  start: string;
  end: string;
  scrub: number | boolean;
  once: boolean;
  triggerTarget?: string;
  endTarget?: string;
}

function attr(el: HTMLElement, name: string): string | undefined {
  const v = el.getAttribute(`data-motion-${name}`);
  return v === null || v === '' ? undefined : v;
}

function numAttr(el: HTMLElement, name: string): number | undefined {
  const raw = attr(el, name);
  if (raw === undefined) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function parseElement(el: HTMLElement): ParsedMotion | null {
  const id = el.getAttribute('data-motion') ?? '';
  const effect = getMotionEffect(id);
  if (!effect) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(`[motion-attributes] effect không tồn tại: "${id}"`, el);
    }
    return null;
  }

  const from: Record<string, unknown> = { ...effect.from };
  const to: Record<string, unknown> = { ...effect.to };

  const distance = numAttr(el, 'distance');
  if (distance !== undefined && effect.distanceVar) {
    const base = Number(effect.from[effect.distanceVar] ?? 1);
    from[effect.distanceVar] = (base < 0 ? -1 : 1) * Math.abs(distance);
  }
  const origin = attr(el, 'origin');
  if (origin) from.transformOrigin = origin;

  const trigger =
    (attr(el, 'trigger') as MotionTriggerKind) ?? effect.defaults.trigger;

  return {
    el,
    effect,
    from,
    to,
    duration: numAttr(el, 'duration') ?? effect.defaults.duration,
    delay: numAttr(el, 'delay') ?? 0,
    ease: attr(el, 'ease') ?? effect.defaults.ease,
    stagger: numAttr(el, 'stagger') ?? effect.defaults.stagger,
    trigger,
    start:
      attr(el, 'start') ??
      effect.defaults.start ??
      (trigger === 'scrub' ? 'top bottom' : 'top 85%'),
    end: attr(el, 'end') ?? 'bottom top',
    scrub: numAttr(el, 'scrub') ?? true,
    once: attr(el, 'once') === 'true',
    triggerTarget: attr(el, 'trigger-target'),
    endTarget: attr(el, 'end-target'),
  };
}

function resolveTarget(
  root: HTMLElement,
  spec: string | undefined,
  fallback: HTMLElement
): HTMLElement {
  if (!spec || spec === 'self') return fallback;
  if (spec === 'root') return root;
  return root.querySelector<HTMLElement>(spec) ?? fallback;
}

/** Thêm tween của 1 element vào timeline tại vị trí `position` (giây). */
function addTween(
  tl: gsap.core.Timeline,
  parsed: ParsedMotion,
  position: number,
  splits: SplitText[]
) {
  const { el, effect, from, to, duration, ease, stagger } = parsed;
  if (effect.split) {
    const split = new SplitText(el, {
      type: effect.split,
      mask: effect.split,
    });
    splits.push(split);
    const pieces =
      effect.split === 'chars'
        ? split.chars
        : effect.split === 'words'
          ? split.words
          : split.lines;
    if (!pieces.length) return;
    tl.fromTo(pieces, from, { ...to, duration, ease, stagger }, position);
    return;
  }
  tl.fromTo(el, from, { ...to, duration, ease }, position);
}

function buildFromAttributes(
  root: HTMLElement,
  scroller: HTMLElement | undefined,
  splits: SplitText[]
) {
  const parsed = Array.from(root.querySelectorAll<HTMLElement>('[data-motion]'))
    .map(parseElement)
    .filter((p): p is ParsedMotion => p !== null);
  if (!parsed.length) return;

  // Gom nhóm: element in-view nằm trong container [data-motion-group] (thuộc
  // root) chia sẻ 1 ScrollTrigger trên container — choreograph bằng delay.
  const groups = new Map<HTMLElement, ParsedMotion[]>();
  const standalone: ParsedMotion[] = [];
  for (const p of parsed) {
    const container =
      p.trigger === 'in-view'
        ? p.el.closest<HTMLElement>('[data-motion-group]')
        : null;
    if (container && root.contains(container)) {
      const list = groups.get(container) ?? [];
      list.push(p);
      groups.set(container, list);
    } else {
      standalone.push(p);
    }
  }

  for (const [container, members] of groups) {
    const start = attr(container, 'start') ?? 'top 85%';
    const once = attr(container, 'once') === 'true';
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        scroller,
        start,
        invalidateOnRefresh: true,
        ...(once
          ? { once: true }
          : { toggleActions: 'play none none reverse' }),
      },
    });
    for (const m of members) addTween(tl, m, m.delay, splits);
  }

  for (const p of standalone) {
    if (p.trigger === 'scrub') {
      const triggerEl = resolveTarget(root, p.triggerTarget, p.el);
      const endEl = p.endTarget
        ? resolveTarget(root, p.endTarget, triggerEl)
        : undefined;
      gsap.fromTo(p.el, p.from, {
        ...p.to,
        duration: p.duration,
        ease: p.ease,
        scrollTrigger: {
          trigger: triggerEl,
          scroller,
          start: p.start,
          ...(endEl ? { endTrigger: endEl } : {}),
          end: p.end,
          scrub: p.scrub,
          invalidateOnRefresh: true,
        },
      });
      continue;
    }

    if (p.trigger === 'load') {
      const tl = gsap.timeline();
      addTween(tl, p, p.delay, splits);
      continue;
    }

    // in-view độc lập — trigger là chính element (hoặc trigger-target).
    const triggerEl = resolveTarget(root, p.triggerTarget, p.el);
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerEl,
        scroller,
        start: p.start,
        invalidateOnRefresh: true,
        ...(p.once
          ? { once: true }
          : { toggleActions: 'play none none reverse' }),
      },
    });
    addTween(tl, p, p.delay, splits);
  }
}

/**
 * Quét `[data-motion]` trong block và build GSAP từ motionLibrary.
 *
 * Cấu trúc + contract y hệt `useBlockMotion` (scroller/requestRefresh từ
 * LandingMotion, gsap.context scope root, revert khi unmount); tách riêng vì
 * cần revert cả SplitText (useBlockMotion bỏ qua return của builder).
 *
 * `deps`: truyền khi DOM element có data-motion thay đổi theo state (vd số
 * lượng item list) để rebuild.
 */
export function useMotionAttributes(
  rootRef: React.RefObject<HTMLElement | null>,
  deps: React.DependencyList = []
): void {
  const { scroller, requestRefresh } = useLandingMotion();

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Edit-canvas: giữ rest state để editor ổn định (SplitText mutate DOM).
    if (root.closest('[data-testid="active-block-preview"]')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const splits: SplitText[] = [];
    const ctx = gsap.context(() => {
      buildFromAttributes(root, scroller ?? undefined, splits);
    }, root);
    requestRefresh();
    return () => {
      ctx.revert();
      for (const s of splits) s.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroller, requestRefresh, ...deps]);
}
