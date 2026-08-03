/**
 * Track-based motion model for canvas-template blocks.
 *
 * A `BlockMotion` describes a single timeline scoped to one block. The
 * timeline is composed of `MotionTrack`s, each targeting one element key
 * (resolved via `[data-element-key="..."]` in the rendered DOM). Each track
 * holds an ordered list of `MotionKeyframe`s defining property values at
 * specific times — the runtime tweens between consecutive keyframes using
 * the `easing` of the leading keyframe.
 *
 * The reserved element key `__block__` targets the block root (the wrapper
 * rendered by `MotionBlockRoot`), useful for fading the entire section in.
 *
 * Shape is intentionally render-engine-agnostic — the runtime maps it to
 * GSAP today; swapping engines later only touches `runtime.tsx`.
 */

export type MotionTrigger = 'in-view' | 'load' | 'scroll-progress';

export type MotionProperty =
  | 'opacity'
  | 'x'
  | 'y'
  | 'scale'
  | 'rotate'
  | 'blur';

/**
 * Easing curve names. String form maps 1:1 to GSAP eases. Object form lets
 * the timeline editor emit a custom cubic-bezier — runtime registers it
 * via gsap CustomEase on demand.
 */
export type MotionEasing =
  | 'linear'
  | 'power1.in'
  | 'power1.out'
  | 'power1.inOut'
  | 'power2.in'
  | 'power2.out'
  | 'power2.inOut'
  | 'power3.in'
  | 'power3.out'
  | 'power3.inOut'
  | 'sine.in'
  | 'sine.out'
  | 'sine.inOut'
  | 'expo.out'
  | 'back.out'
  | { cubicBezier: [number, number, number, number] };

export type EditorMode = 'edit' | 'preview' | 'production';

export const BLOCK_ROOT_KEY = '__block__';

export interface MotionKeyframe {
  /** Time in ms from the start of the track. */
  time: number;
  /** Property values at this keyframe. Missing properties hold prior value. */
  values: Partial<Record<MotionProperty, number>>;
  /**
   * Easing FROM this keyframe TO the next. The last keyframe in a track
   * ignores `easing`. Defaults to 'power2.out' when omitted.
   */
  easing?: MotionEasing;
}

export interface MotionTrack {
  /** Element key target (matches `data-element-key`) or `__block__`. */
  elementKey: string;
  /** Ordered ascending by `time`. Runtime sorts defensively. */
  keyframes: MotionKeyframe[];
  /**
   * Khi set → runtime KHÔNG tween property thường mà tách text bằng SplitText
   * (lines/words) + mask (overflow hidden) rồi stagger yPercent reveal. Dùng
   * cho preset `mask-reveal`. Track không có `split` chạy như cũ.
   */
  split?: 'lines' | 'words';
}

export interface BlockMotion {
  tracks: MotionTrack[];
  /** Total duration in ms — runtime uses this to pad/clip the timeline. */
  duration: number;
  /** When to start. Default 'in-view'. */
  trigger?: MotionTrigger;
  /** 0 = play once; -1 = infinite; n>0 = play n+1 times. Default 0. */
  repeat?: number;
  /** Ping-pong on repeat. Default false. */
  yoyo?: boolean;
  /** Bypass at runtime, keep config for toggle. Default true. */
  enabled?: boolean;
}

export const DEFAULT_BLOCK_MOTION = (): BlockMotion => ({
  tracks: [],
  duration: 1000,
  trigger: 'in-view',
  repeat: 0,
  yoyo: false,
  enabled: true,
});
