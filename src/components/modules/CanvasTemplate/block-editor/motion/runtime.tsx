'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { SplitText } from 'gsap/SplitText';
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
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText, useGSAP);
  gsap.config({ nullTargetWarn: false });
}

interface MotionContextValue {
  mode: EditorMode;
  motion?: BlockMotion;
  motionKit?: MotionKitConfig;
  scrollerEl?: HTMLElement | null;
  /**
   * When provided (including 0), the runtime builds the timeline paused and
   * seeks to this ms position on every change; auto-play and ScrollTrigger
   * arming are skipped. The timeline editor uses this to drive the preview
   * from its scrubable playhead.
   */
  scrubMs?: number | null;
  /**
   * Bumped by the editor on every "Play preview" click. Surfaced here so
   * MotionBlockRoot can include it in useGSAP deps — without it, re-clicking
   * Play while already in preview mode is a no-op (no deps changed).
   */
  previewNonce?: number;
  /**
   * When set, the runtime only animates the track whose `elementKey` matches.
   * Used by the sidebar panel for "preview-on-pick" — clicking a preset on
   * row X plays just X's animation so the user can audition it without
   * playing the whole-block timeline.
   */
  previewElement?: string | null;
}

const MotionContext = React.createContext<MotionContextValue | null>(null);

/**
 * Brand/site-level motion personality (from the active motion_kit). Applied to
 * every block timeline: durations are multiplied by `durationScale` and a track
 * with no easing of its own falls back to `easing`. One knob, whole site.
 */
export interface MotionKitConfig {
  easing?: string;
  durationScale?: number;
}

export interface MotionProviderProps {
  mode: EditorMode;
  motion?: BlockMotion;
  motionKit?: MotionKitConfig;
  scrollerEl?: HTMLElement | null;
  scrubMs?: number | null;
  previewNonce?: number;
  previewElement?: string | null;
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
  motionKit,
  scrollerEl,
  scrubMs,
  previewNonce,
  previewElement,
  children,
}: MotionProviderProps) {
  const value = React.useMemo<MotionContextValue>(
    () => ({
      mode,
      motion,
      motionKit,
      scrollerEl,
      scrubMs,
      previewNonce,
      previewElement,
    }),
    [mode, motion, motionKit, scrollerEl, scrubMs, previewNonce, previewElement]
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
function resolveEase(easing: MotionEasing | string | undefined): string {
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
  motion: BlockMotion,
  previewElement?: string | null,
  motionKit?: MotionKitConfig
): gsap.core.Timeline | null {
  if (motion.enabled === false) return null;
  // When previewing a single element, narrow to just that track. Skip repeat
  // so the audition doesn't loop on the user.
  const tracks = previewElement
    ? motion.tracks.filter(t => t.elementKey === previewElement)
    : motion.tracks;
  if (!tracks.length) return null;

  const tl = gsap.timeline({
    paused: true,
    repeat: previewElement ? 0 : (motion.repeat ?? 0),
    yoyo: previewElement ? false : (motion.yoyo ?? false),
  });

  const scale =
    motionKit?.durationScale && motionKit.durationScale > 0
      ? motionKit.durationScale
      : 1;

  for (const track of tracks) {
    const target = resolveTarget(root, track.elementKey);
    if (!target) continue;
    addTrack(tl, target, track, motionKit);
  }

  // Pad the timeline to the configured duration so repeat/yoyo behave even
  // when the last keyframe lands before `duration`. Single-element preview
  // doesn't need padding — its track's own duration is fine. Scale by the
  // motion kit so padding matches the scaled tween durations.
  if (!previewElement) {
    const totalSec = (Math.max(motion.duration, 0) / 1000) * scale;
    if (tl.duration() < totalSec) tl.set({}, {}, totalSec);
  }

  return tl;
}

/**
 * mask-reveal: tách text target thành lines/words (SplitText + mask), stagger
 * yPercent 100→0 + opacity. SplitText tạo trong scope useGSAP nên context.revert
 * tự khôi phục DOM khi cleanup. Bỏ qua nếu target rỗng text.
 */
function addSplitReveal(
  tl: gsap.core.Timeline,
  target: HTMLElement,
  track: MotionTrack
) {
  const splitType = track.split;
  if (!splitType) return;
  target.style.animation = 'none';
  const kfs = [...track.keyframes].sort((a, b) => a.time - b.time);
  const startMs = kfs[0]?.time ?? 0;
  const endMs = kfs[kfs.length - 1]?.time ?? startMs + 600;
  const start = startMs / 1000;
  const dur = Math.max(0.3, (endMs - startMs) / 1000);
  const ease = resolveEase(kfs[0]?.easing);

  const split = new SplitText(target, {
    type: splitType,
    mask: splitType,
    linesClass: 'mr-line',
    wordsClass: 'mr-word',
  });
  const pieces = splitType === 'words' ? split.words : split.lines;
  if (!pieces.length) return;

  tl.set(pieces, { yPercent: 110, opacity: 0 }, start);
  tl.to(
    pieces,
    {
      yPercent: 0,
      opacity: 1,
      duration: dur,
      ease,
      stagger: Math.min(0.12, dur / pieces.length),
    },
    start
  );
}

function addTrack(
  tl: gsap.core.Timeline,
  target: HTMLElement,
  track: MotionTrack,
  motionKit?: MotionKitConfig
) {
  if (track.split) {
    addSplitReveal(tl, target, track);
    return;
  }

  const scale =
    motionKit?.durationScale && motionKit.durationScale > 0
      ? motionKit.durationScale
      : 1;
  const keyframes: MotionKeyframe[] = [...track.keyframes].sort(
    (a, b) => a.time - b.time
  );
  if (!keyframes.length) return;

  // Disable any baseline CSS animation on the target while GSAP drives it.
  // Several blocks (e.g. HeroSplit) bake in reveal animations like
  // `animate-soft-rise` whose @keyframes animate `transform` — when the CSS
  // animation is in its `fill: both` state it overrides inline `transform`
  // set by GSAP, silently neutralising the preset. useGSAP's context.revert()
  // on cleanup restores the original style.
  target.style.animation = 'none';

  const first = keyframes[0]!;
  // Seed initial state at t=0 so the element doesn't flash its rest-state
  // before the first keyframe fires.
  tl.set(target, toGsapVars(first.values), 0);

  for (let i = 1; i < keyframes.length; i++) {
    const prev = keyframes[i - 1]!;
    const cur = keyframes[i]!;
    // Scale duration + start offset by the motion kit so the whole timeline
    // speeds up / slows down together; fall back to the kit easing when the
    // keyframe declares none.
    const duration = Math.max(0, ((cur.time - prev.time) / 1000) * scale);
    const ease = resolveEase(prev.easing ?? motionKit?.easing);
    tl.to(
      target,
      { ...toGsapVars(cur.values), duration, ease },
      (prev.time / 1000) * scale
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
  const tlRef = React.useRef<gsap.core.Timeline | null>(null);
  const ctx = useMotionContext();
  const isScrub = ctx?.scrubMs != null;

  // Kill baseline CSS animations on every tracked element as soon as the
  // block mounts (or motion config changes). Blocks like HeroSplit/HeroOverlay
  // ship with @keyframes (animate-soft-rise / animate-reveal-x) that hold
  // elements at opacity:0 during their animation-delay phase. If the user
  // auditions a preset within that delay window, GSAP plays the audition on
  // one element while the others are still invisible behind their CSS delay
  // — the canvas looks blank. Disabling the CSS animation unconditionally
  // (any editor mode) makes the element settle at its natural rest state
  // immediately so GSAP is the sole animation driver from then on.
  React.useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !ctx?.motion?.tracks?.length) return;
    const cleanups: Array<() => void> = [];
    for (const track of ctx.motion.tracks) {
      const target = resolveTarget(root, track.elementKey);
      if (!target) continue;
      const prev = target.style.animation;
      target.style.animation = 'none';
      cleanups.push(() => {
        target.style.animation = prev;
      });
    }
    return () => {
      for (const fn of cleanups) fn();
    };
  }, [ctx?.motion]);

  useGSAP(
    () => {
      tlRef.current = null;
      if (!ctx) return;
      if (ctx.mode === 'edit') return;
      if (!ctx.motion) return;
      if (!ref.current) return;
      if (shouldSkipForA11y()) return;

      const root = ref.current;
      const tl = buildTimeline(
        root,
        ctx.motion,
        ctx.previewElement,
        ctx.motionKit
      );
      if (!tl) return;
      tlRef.current = tl;

      if (isScrub) {
        // External driver: stay paused, just seek to current scrub position.
        // Trigger semantics (in-view, scroll-progress) don't apply inside the
        // editor preview — they're production runtime concerns.
        tl.seek(Math.max(0, (ctx.scrubMs ?? 0) / 1000), false);
        return;
      }

      // Editor preview always plays immediately. The trigger config
      // (`in-view`, `scroll-progress`) is for the production runtime where
      // the user actually scrolls — relying on ScrollTrigger inside the
      // editor preview is unreliable (the block is usually already in
      // viewport, and `once: true` would only fire on the first preview).
      if (ctx.mode === 'preview') {
        tl.play(0);
        return;
      }

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
      // in-view (default). `start: 'center bottom'` fires when the centre of
      // the block reaches the viewport bottom — geometrically equivalent to
      // "50% of the block has scrolled in", which is what feels right for
      // landing-page reveal animations. The previous threshold ('top 85%')
      // fired the moment a sliver of the block peeked in, so the animation
      // played before the user could actually see what was animating.
      ScrollTrigger.create({
        trigger: root,
        scroller: ctx.scrollerEl ?? undefined,
        start: 'center bottom',
        once: true,
        onEnter: () => tl.play(0),
      });
    },
    {
      dependencies: [
        ctx?.mode,
        ctx?.motion,
        ctx?.motionKit,
        ctx?.scrollerEl,
        ctx?.previewNonce,
        ctx?.previewElement,
        isScrub,
      ],
      scope: ref,
    }
  );

  // Live seek when `scrubMs` changes — avoids the cost of rebuilding the
  // whole timeline on every pointer-move while dragging the playhead.
  React.useEffect(() => {
    if (!isScrub) return;
    const tl = tlRef.current;
    if (!tl) return;
    tl.seek(Math.max(0, (ctx?.scrubMs ?? 0) / 1000), false);
  }, [isScrub, ctx?.scrubMs]);

  // No `data-element-key` here — the BlockPreview click handler walks the
  // closest `[data-element-key]` ancestor, so adding one would shadow
  // `__background__` and break "click background to deselect".
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
