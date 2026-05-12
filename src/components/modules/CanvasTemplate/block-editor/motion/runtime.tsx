'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';

import {
  BLOCK_ROOT_KEY,
  type BlockMotion,
  type EditorMode,
  type MotionEasing,
  type MotionKeyframe,
  type MotionProperty,
  type MotionTrack,
} from './types';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);
  gsap.config({ nullTargetWarn: false });
}

interface MotionContextValue {
  mode: EditorMode;
  motion?: BlockMotion;
  scrollerEl?: HTMLElement | null;
}

const MotionContext = React.createContext<MotionContextValue | null>(null);

export interface MotionProviderProps {
  mode: EditorMode;
  motion?: BlockMotion;
  scrollerEl?: HTMLElement | null;
  children: React.ReactNode;
}

/**
 * Provides the block's motion timeline config to `MotionBlockRoot`. Wrap
 * each block's render tree with this; the root reads context and builds a
 * single GSAP timeline targeting `[data-element-key]` descendants.
 */
export function MotionProvider({
  mode,
  motion,
  scrollerEl,
  children,
}: MotionProviderProps) {
  const value = React.useMemo<MotionContextValue>(
    () => ({ mode, motion, scrollerEl }),
    [mode, motion, scrollerEl]
  );
  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}

export function useMotionContext(): MotionContextValue | null {
  return React.useContext(MotionContext);
}

const PROPERTY_TO_GSAP: Record<MotionProperty, string> = {
  opacity: 'opacity',
  x: 'x',
  y: 'y',
  scale: 'scale',
  rotate: 'rotate',
  blur: 'filter',
};

/** Format a single property value into the form GSAP expects. */
function gsapValue(prop: MotionProperty, value: number): unknown {
  if (prop === 'blur') return `blur(${value}px)`;
  return value;
}

/** Convert a kf.values map into a GSAP vars object. */
function toGsapVars(
  values: Partial<Record<MotionProperty, number>>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [prop, val] of Object.entries(values) as Array<
    [MotionProperty, number]
  >) {
    if (val === undefined) continue;
    out[PROPERTY_TO_GSAP[prop]] = gsapValue(prop, val);
  }
  return out;
}

/**
 * Resolve an easing token to the string GSAP wants. Cubic-bezier easings
 * register a CustomEase on first use and reuse the named id afterward.
 */
function resolveEase(easing: MotionEasing | undefined): string {
  if (!easing) return 'power2.out';
  if (typeof easing === 'string') return easing;
  const [a, b, c, d] = easing.cubicBezier;
  const id = `cb_${a}_${b}_${c}_${d}`.replace(/[.-]/g, '_');
  if (!CustomEase.get(id)) {
    CustomEase.create(id, `M0,0 C${a},${b} ${c},${d} 1,1`);
  }
  return id;
}

/**
 * Resolve a track's target element. Returns null when the element is not
 * present in the rendered DOM (eg. block variant doesn't include it).
 */
function resolveTarget(
  root: HTMLElement,
  elementKey: string
): HTMLElement | null {
  if (elementKey === BLOCK_ROOT_KEY) return root;
  return root.querySelector<HTMLElement>(
    `[data-element-key="${CSS.escape(elementKey)}"]`
  );
}

function buildTimeline(
  root: HTMLElement,
  motion: BlockMotion
): gsap.core.Timeline | null {
  if (motion.enabled === false) return null;
  if (!motion.tracks.length) return null;

  const tl = gsap.timeline({
    paused: true,
    repeat: motion.repeat ?? 0,
    yoyo: motion.yoyo ?? false,
  });

  for (const track of motion.tracks) {
    const target = resolveTarget(root, track.elementKey);
    if (!target) continue;
    addTrack(tl, target, track);
  }

  // Pad the timeline to the configured duration so repeat/yoyo behave even
  // when the last keyframe lands before `duration`.
  const totalSec = Math.max(motion.duration, 0) / 1000;
  if (tl.duration() < totalSec) tl.set({}, {}, totalSec);

  return tl;
}

function addTrack(
  tl: gsap.core.Timeline,
  target: HTMLElement,
  track: MotionTrack
) {
  const keyframes: MotionKeyframe[] = [...track.keyframes].sort(
    (a, b) => a.time - b.time
  );
  if (!keyframes.length) return;

  const first = keyframes[0]!;
  // Seed initial state at t=0 so the element doesn't flash its rest-state
  // before the first keyframe fires.
  tl.set(target, toGsapVars(first.values), 0);

  for (let i = 1; i < keyframes.length; i++) {
    const prev = keyframes[i - 1]!;
    const cur = keyframes[i]!;
    const duration = Math.max(0, (cur.time - prev.time) / 1000);
    const ease = resolveEase(prev.easing);
    tl.to(
      target,
      { ...toGsapVars(cur.values), duration, ease },
      prev.time / 1000
    );
  }
}

function shouldSkipForA11y(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  );
}

export interface MotionBlockRootProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * Wraps each block's outer container. On mount (or motion-config change),
 * builds the GSAP timeline from `ctx.motion.tracks` and arms it according
 * to `ctx.motion.trigger`:
 *  - `load` (or any trigger in editor preview): play immediately
 *  - `in-view`: ScrollTrigger fires on first intersection
 *  - `scroll-progress`: ScrollTrigger scrubs timeline to scroll
 *
 * In `mode='edit'` no animation runs — the editor needs the rest state to
 * remain stable while the user drags / edits. The runtime still attaches
 * the ref and re-runs whenever `mode` flips back to preview/production.
 */
export function MotionBlockRoot({ className, children }: MotionBlockRootProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const ctx = useMotionContext();

  useGSAP(
    () => {
      if (!ctx) return;
      if (ctx.mode === 'edit') return;
      if (!ctx.motion) return;
      if (!ref.current) return;
      if (shouldSkipForA11y()) return;

      const root = ref.current;
      const tl = buildTimeline(root, ctx.motion);
      if (!tl) return;

      const trigger = ctx.motion.trigger ?? 'in-view';

      if (trigger === 'load') {
        tl.play(0);
        return;
      }
      if (trigger === 'scroll-progress') {
        ScrollTrigger.create({
          trigger: root,
          scroller: ctx.scrollerEl ?? undefined,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          animation: tl,
        });
        return;
      }
      // in-view (default)
      ScrollTrigger.create({
        trigger: root,
        scroller: ctx.scrollerEl ?? undefined,
        start: 'top 85%',
        once: true,
        onEnter: () => tl.play(0),
      });
    },
    {
      dependencies: [ctx?.mode, ctx?.motion, ctx?.scrollerEl],
      scope: ref,
    }
  );

  // No `data-element-key` here — the BlockPreview click handler walks the
  // closest `[data-element-key]` ancestor, so adding one would shadow
  // `__background__` and break "click background to deselect".
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
