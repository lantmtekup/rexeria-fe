/**
 * Animation presets for the simple-mode motion panel.
 *
 * A preset is just a sugar layer on top of `BlockMotion`: applying a preset
 * generates a two-keyframe track (start state → resolved state) at the right
 * delay and duration. Reading back from a track tries to detect which preset
 * it came from so the panel can show the user a friendly label; tracks that
 * don't match any preset surface as `'custom'` (edit via advanced timeline).
 */

import {
  type BlockMotion,
  type MotionEasing,
  type MotionKeyframe,
  type MotionProperty,
  type MotionTrack,
} from './types';

export type MotionPresetId =
  | 'none'
  | 'fade-in'
  | 'fade-up'
  | 'fade-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale-in'
  | 'zoom-in'
  | 'blur-in'
  | 'mask-reveal';

export interface MotionPresetMeta {
  id: MotionPresetId;
  label: string;
  /** Short description shown in dropdowns. */
  hint?: string;
}

export const PRESETS: readonly MotionPresetMeta[] = [
  { id: 'none', label: 'Không animate' },
  { id: 'fade-in', label: 'Fade In', hint: 'Hiện dần' },
  { id: 'fade-up', label: 'Fade Up', hint: 'Trượt lên + mờ' },
  { id: 'fade-down', label: 'Fade Down', hint: 'Trượt xuống + mờ' },
  { id: 'slide-left', label: 'Slide Left', hint: 'Trượt từ phải qua' },
  { id: 'slide-right', label: 'Slide Right', hint: 'Trượt từ trái qua' },
  { id: 'scale-in', label: 'Scale In', hint: 'Phóng nhẹ' },
  { id: 'zoom-in', label: 'Zoom In', hint: 'Zoom mạnh' },
  { id: 'blur-in', label: 'Blur In', hint: 'Mờ → nét' },
  {
    id: 'mask-reveal',
    label: 'Mask Reveal',
    hint: 'Chữ trượt lên qua mặt nạ (theo dòng)',
  },
] as const;

const DEFAULT_EASING: MotionEasing = 'power2.out';

interface PresetShape {
  from: Partial<Record<MotionProperty, number>>;
  to: Partial<Record<MotionProperty, number>>;
}

const SHAPES: Record<
  Exclude<MotionPresetId, 'none' | 'mask-reveal'>,
  PresetShape
> = {
  'fade-in': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  'fade-up': {
    from: { opacity: 0, y: 24 },
    to: { opacity: 1, y: 0 },
  },
  'fade-down': {
    from: { opacity: 0, y: -24 },
    to: { opacity: 1, y: 0 },
  },
  'slide-left': {
    from: { opacity: 0, x: 32 },
    to: { opacity: 1, x: 0 },
  },
  'slide-right': {
    from: { opacity: 0, x: -32 },
    to: { opacity: 1, x: 0 },
  },
  'scale-in': {
    from: { opacity: 0, scale: 0.92 },
    to: { opacity: 1, scale: 1 },
  },
  'zoom-in': {
    from: { opacity: 0, scale: 0.6 },
    to: { opacity: 1, scale: 1 },
  },
  'blur-in': {
    from: { opacity: 0, blur: 12 },
    to: { opacity: 1, blur: 0 },
  },
};

export const DEFAULT_PRESET_DURATION_MS = 600;
export const DEFAULT_PRESET_DELAY_MS = 0;

/**
 * Replace (or remove) a track for `elementKey` with one generated from
 * `presetId` + delay + duration. Also extends `motion.duration` so the
 * timeline fits the latest end-time.
 */
export function applyPreset(
  motion: BlockMotion,
  elementKey: string,
  presetId: MotionPresetId,
  delay: number,
  duration: number
): BlockMotion {
  const otherTracks = motion.tracks.filter(t => t.elementKey !== elementKey);

  if (presetId === 'none') {
    const nextDuration = recomputeMotionDuration(otherTracks, motion.duration);
    return { ...motion, tracks: otherTracks, duration: nextDuration };
  }

  // mask-reveal: track mang cờ `split` — runtime tự SplitText + stagger. Keyframe
  // opacity 0→1 chỉ để mang delay/duration (detectPreset đọc lại qua `split`).
  if (presetId === 'mask-reveal') {
    const start = Math.max(0, Math.round(delay));
    const end = start + Math.max(50, Math.round(duration));
    const track: MotionTrack = {
      elementKey,
      split: 'lines',
      keyframes: [
        { time: start, values: { opacity: 0 }, easing: DEFAULT_EASING },
        { time: end, values: { opacity: 1 } },
      ],
    };
    const nextTracks = [...otherTracks, track];
    return {
      ...motion,
      tracks: nextTracks,
      duration: recomputeMotionDuration(nextTracks, motion.duration),
    };
  }

  const shape = SHAPES[presetId];
  const start = Math.max(0, Math.round(delay));
  const end = start + Math.max(50, Math.round(duration));

  const track: MotionTrack = {
    elementKey,
    keyframes: [
      { time: start, values: shape.from, easing: DEFAULT_EASING },
      { time: end, values: shape.to },
    ],
  };

  const nextTracks = [...otherTracks, track];
  const nextDuration = recomputeMotionDuration(nextTracks, motion.duration);
  return { ...motion, tracks: nextTracks, duration: nextDuration };
}

/**
 * Detect whether a track was produced by `applyPreset`. Returns `'custom'`
 * when the shape isn't recognised (≠ 2 keyframes, mismatched values, etc).
 */
export function detectPreset(track: MotionTrack):
  | {
      kind: 'preset';
      presetId: MotionPresetId;
      delay: number;
      duration: number;
    }
  | { kind: 'custom' } {
  const kfs = track.keyframes;
  if (kfs.length !== 2) return { kind: 'custom' };
  const [a, b] = kfs;
  if (a.time > b.time) return { kind: 'custom' };

  // mask-reveal nhận diện qua cờ `split` (keyframe opacity trùng fade-in nên
  // phải check trước vòng SHAPES).
  if (track.split) {
    return {
      kind: 'preset',
      presetId: 'mask-reveal',
      delay: a.time,
      duration: b.time - a.time,
    };
  }

  for (const [presetId, shape] of Object.entries(SHAPES) as [
    Exclude<MotionPresetId, 'none'>,
    PresetShape,
  ][]) {
    if (valuesEqual(a.values, shape.from) && valuesEqual(b.values, shape.to)) {
      return {
        kind: 'preset',
        presetId,
        delay: a.time,
        duration: b.time - a.time,
      };
    }
  }
  return { kind: 'custom' };
}

function valuesEqual(
  a: Partial<Record<MotionProperty, number>>,
  b: Partial<Record<MotionProperty, number>>
): boolean {
  const keys = new Set([
    ...Object.keys(a),
    ...Object.keys(b),
  ]) as Set<MotionProperty>;
  for (const k of keys) {
    if (Math.abs((a[k] ?? 0) - (b[k] ?? 0)) > 0.001) return false;
  }
  return true;
}

function recomputeMotionDuration(
  tracks: MotionTrack[],
  current: number
): number {
  const maxEnd = tracks.reduce((acc, t) => {
    const last = t.keyframes[t.keyframes.length - 1];
    return Math.max(acc, last?.time ?? 0);
  }, 0);
  // Always at least 1000ms, never shrink below what's needed by tracks,
  // and never shrink below the caller's current duration.
  return Math.max(1000, maxEnd, current);
}

export function presetLabel(id: MotionPresetId): string {
  return PRESETS.find(p => p.id === id)?.label ?? id;
}

/** Read-only summary for a keyframe — used when surfacing 'custom' rows. */
export function describeKeyframe(kf: MotionKeyframe): string {
  const parts = Object.entries(kf.values).map(([k, v]) => `${k}:${v}`);
  return parts.join(', ');
}
