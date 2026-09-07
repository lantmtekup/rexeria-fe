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
 *  - data-motion-trigger                 — in-view (default) | scrub | load | loop |
 *                                          hover (play/reverse theo pointer, skip touch) |
 *                                          click (toggle)
 *  - data-motion-start|end               — ScrollTrigger start/end
 *  - data-motion-scrub                   — số (smoothing) | mặc định true
 *  - data-motion-once                    — "true" = chạy 1 lần (mặc định play/reverse)
 *  - data-motion-trigger-target          — self (default) | root | 'closest:<sel>' |
 *                                          CSS selector trong root; với hover/click
 *                                          đây là element NHẬN listener (card cha)
 *  - data-motion-end-target              — như trên, cho endTrigger (scrub)
 *  - data-motion-direction               — up|down|left|right (clip-reveal)
 *  - data-motion-axis                    — 'x' đổi line-draw sang trục ngang
 *  - data-motion-repeat|yoyo             — GSAP repeat (số, -1 = vô hạn) / "true"
 *  - data-motion-group (trên container)  — các data-motion bên trong dùng chung 1
 *    ScrollTrigger trên container; container nhận start/once; con offset bằng delay.
 *  - data-motion-stagger-children='0.12' — (trên group) con chưa khai delay nhận
 *    delay = index × bước — khỏi gắn delay tay từng item trong grid/list.
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
  CLIP_REVEAL_FROM,
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
  /** true khi dev khai delay tường minh — stagger-children không đè lên. */
  hasDelay: boolean;
  ease: string;
  stagger?: number;
  repeat?: number;
  yoyo: boolean;
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
    const v = effect.distanceVar;
    const sign = (n: unknown) => (Number(n ?? 1) < 0 ? -1 : 1);
    from[v] = sign(effect.from[v]) * Math.abs(distance);
    // symmetric (parallax): đổi cả 2 đầu ±d theo dấu gốc của mỗi đầu.
    if (effect.distanceMode === 'symmetric') {
      to[v] = sign(effect.to[v]) * Math.abs(distance);
    }
  }

  // clip-reveal: hướng mép reveal di chuyển (down = lộ từ trên xuống, default).
  const direction = attr(el, 'direction');
  if (effect.directional && direction && direction in CLIP_REVEAL_FROM) {
    from.clipPath =
      CLIP_REVEAL_FROM[direction as keyof typeof CLIP_REVEAL_FROM];
  }

  // line-draw ngang: data-motion-axis='x' đổi scaleY→scaleX + origin trái.
  if (attr(el, 'axis') === 'x' && 'scaleY' in from) {
    from.scaleX = from.scaleY;
    delete from.scaleY;
    if ('scaleY' in to) {
      to.scaleX = to.scaleY;
      delete to.scaleY;
    }
    from.transformOrigin = 'left center';
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
    hasDelay: attr(el, 'delay') !== undefined,
    ease: attr(el, 'ease') ?? effect.defaults.ease,
    stagger: numAttr(el, 'stagger') ?? effect.defaults.stagger,
    repeat: numAttr(el, 'repeat') ?? effect.defaults.repeat,
    yoyo: attr(el, 'yoyo') === 'true',
    trigger,
    start:
      attr(el, 'start') ??
      effect.defaults.start ??
      (trigger === 'scrub' ? 'top bottom' : 'top 85%'),
    end: attr(el, 'end') ?? effect.defaults.end ?? 'bottom top',
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
  // 'closest:.card' — leo lên tổ tiên gần nhất (cho element lặp trong list:
  // mỗi instance tự tìm card cha của CHÍNH NÓ, không dính card đầu tiên).
  if (spec.startsWith('closest:')) {
    return fallback.closest<HTMLElement>(spec.slice(8)) ?? fallback;
  }
  return root.querySelector<HTMLElement>(spec) ?? fallback;
}

/**
 * counter: tween textContent 0 → số parse từ text hiện tại, giữ prefix/suffix
 * (vd "+1,200 khách" → đếm 0→1200). Restore text gốc khi cleanup (GSAP revert
 * không đụng textContent).
 */
/**
 * echo-reveal: stagger các `[data-echo-layer]` trong container — từ ghost xa
 * (offset lớn) lên primary. Giữ opacity đích qua data-echo-opacity.
 */
function addEchoReveal(
  tl: gsap.core.Timeline,
  parsed: ParsedMotion,
  position: number
) {
  const container = parsed.el;
  const layers = Array.from(
    container.querySelectorAll<HTMLElement>('[data-echo-layer]')
  );
  if (!layers.length) return;

  const distance = Math.abs(Number(parsed.from.y ?? 32));
  const step = parsed.stagger ?? 0.07;

  const sorted = [...layers].sort(
    (a, b) =>
      parseFloat(b.dataset.echoOffset ?? '0') -
      parseFloat(a.dataset.echoOffset ?? '0')
  );

  sorted.forEach((layer, i) => {
    const offsetEm = parseFloat(layer.dataset.echoOffset ?? '0');
    const targetOpacity = parseFloat(layer.dataset.echoOpacity ?? '1');
    const fontSize = parseFloat(getComputedStyle(layer).fontSize) || 16;
    const targetY = offsetEm * fontSize;
    const startY = targetY + distance;

    tl.fromTo(
      layer,
      { opacity: 0, y: startY },
      {
        opacity: targetOpacity,
        y: targetY,
        duration: parsed.duration,
        ease: parsed.ease,
        immediateRender: false,
      },
      position + i * step
    );
  });
}

function addCounter(
  tl: gsap.core.Timeline,
  parsed: ParsedMotion,
  position: number,
  cleanups: Array<() => void>
) {
  const el = parsed.el;
  const original = el.textContent ?? '';
  const m = original.match(/-?\d[\d.,]*/);
  if (!m || m.index === undefined) return;
  const raw = m[0];
  const target = parseFloat(raw.replace(/,/g, ''));
  if (!Number.isFinite(target)) return;
  const decimals = raw.includes('.') ? (raw.split('.').pop()?.length ?? 0) : 0;
  const grouped = raw.includes(',');
  const prefix = original.slice(0, m.index);
  const suffix = original.slice(m.index + raw.length);
  const format = (v: number) => {
    if (decimals) return v.toFixed(decimals);
    const n = Math.round(v);
    return grouped ? n.toLocaleString('en-US') : String(n);
  };
  cleanups.push(() => {
    el.textContent = original;
  });
  // Seed 0 ngay khi build để không flash số đích trước khi trigger chạy.
  el.textContent = prefix + format(0) + suffix;
  const proxy = { val: 0 };
  tl.to(
    proxy,
    {
      val: target,
      duration: parsed.duration,
      ease: parsed.ease,
      onUpdate: () => {
        el.textContent = prefix + format(proxy.val) + suffix;
      },
    },
    position
  );
}

/** Thêm tween của 1 element vào timeline tại vị trí `position` (giây). */
function addTween(
  tl: gsap.core.Timeline,
  parsed: ParsedMotion,
  position: number,
  splits: SplitText[],
  cleanups: Array<() => void>,
  opts?: { immediateRender?: boolean }
) {
  const { el, effect, from, to, duration, ease, stagger, repeat, yoyo } =
    parsed;
  if (effect.special === 'counter') {
    addCounter(tl, parsed, position, cleanups);
    return;
  }
  if (effect.special === 'echo-reveal') {
    addEchoReveal(tl, parsed, position);
    return;
  }
  const extra = {
    ...(repeat !== undefined ? { repeat } : {}),
    ...(yoyo ? { yoyo: true } : {}),
    ...(opts?.immediateRender === false ? { immediateRender: false } : {}),
  };
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
    tl.fromTo(
      pieces,
      from,
      { ...to, duration, ease, stagger, ...extra },
      position
    );
    return;
  }
  tl.fromTo(el, from, { ...to, duration, ease, ...extra }, position);
}

function buildFromAttributes(
  root: HTMLElement,
  scroller: HTMLElement | undefined,
  splits: SplitText[],
  cleanups: Array<() => void>
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
    // stagger-children: con chưa khai delay tường minh nhận delay = index × bước.
    const staggerChildren = numAttr(container, 'stagger-children');
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
    members.forEach((m, i) => {
      const position =
        !m.hasDelay && staggerChildren !== undefined
          ? i * staggerChildren
          : m.delay;
      addTween(tl, m, position, splits, cleanups);
    });
  }

  for (const p of standalone) {
    // hover/click: timeline paused + event listener, không ScrollTrigger.
    // immediateRender:false — element giữ nguyên rest state tự nhiên cho tới
    // lần tương tác đầu (hover effect có from = rest nên không nhảy hình).
    if (p.trigger === 'hover' || p.trigger === 'click') {
      if (
        p.trigger === 'hover' &&
        !window.matchMedia('(hover: hover)').matches
      ) {
        continue; // touch device: giữ rest state, không bind hover
      }
      const tl = gsap.timeline({ paused: true });
      addTween(tl, p, p.delay, splits, cleanups, { immediateRender: false });
      const listenTarget = resolveTarget(root, p.triggerTarget, p.el);
      if (p.trigger === 'hover') {
        const enter = () => tl.play();
        const leave = () => tl.reverse();
        listenTarget.addEventListener('pointerenter', enter);
        listenTarget.addEventListener('pointerleave', leave);
        cleanups.push(() => {
          listenTarget.removeEventListener('pointerenter', enter);
          listenTarget.removeEventListener('pointerleave', leave);
        });
      } else {
        let on = false;
        const toggle = () => {
          on = !on;
          if (on) tl.play();
          else tl.reverse();
        };
        listenTarget.addEventListener('click', toggle);
        cleanups.push(() => listenTarget.removeEventListener('click', toggle));
      }
      continue;
    }

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

    // load & loop: play ngay, không ScrollTrigger (loop = repeat từ effect).
    if (p.trigger === 'load' || p.trigger === 'loop') {
      const tl = gsap.timeline();
      addTween(tl, p, p.delay, splits, cleanups);
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
    addTween(tl, p, p.delay, splits, cleanups);
  }
}

/** Có element nào trong root dùng effect phải SplitText không. */
function hasSplitEffect(root: HTMLElement): boolean {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-motion]')).some(
    el => getMotionEffect(el.getAttribute('data-motion') ?? '')?.split
  );
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
    const cleanups: Array<() => void> = [];
    let ctx: gsap.Context | null = null;
    let cancelled = false;

    const build = () => {
      if (cancelled || !rootRef.current) return;
      ctx = gsap.context(() => {
        buildFromAttributes(root, scroller ?? undefined, splits, cleanups);
      }, root);
      requestRefresh();
    };

    /**
     * SplitText type='lines' CHỐT vị trí ngắt dòng ngay lúc split. Chạy trước
     * khi webfont về thì đo bằng font fallback → dòng bị ngắt sai và sai đó
     * nằm lại vĩnh viễn (runtime này không revert split sau khi tween xong).
     * Nên đợi `document.fonts.ready` — đúng như bản apps làm trước khi split.
     * Chỉ đợi khi trong root thật sự có effect split, để effect khác chạy ngay.
     */
    if (hasSplitEffect(root) && document.fonts?.status !== 'loaded') {
      document.fonts.ready.then(build);
    } else {
      build();
    }

    return () => {
      cancelled = true;
      ctx?.revert();
      for (const s of splits) s.revert();
      for (const fn of cleanups) fn();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroller, requestRefresh, ...deps]);
}
