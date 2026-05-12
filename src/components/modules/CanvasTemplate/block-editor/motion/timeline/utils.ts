import {
  BLOCK_ROOT_KEY,
  type BlockMotion,
  type MotionEasing,
  type MotionKeyframe,
  type MotionProperty,
  type MotionTrack,
} from '../types';

export const SNAP_MS = 50;
export const PROPERTIES: readonly MotionProperty[] = [
  'opacity',
  'x',
  'y',
  'scale',
  'rotate',
  'blur',
] as const;

export const PROPERTY_DEFAULT: Record<MotionProperty, number> = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
  blur: 0,
};

export const PROPERTY_LABEL: Record<MotionProperty, string> = {
  opacity: 'Opacity',
  x: 'X (px)',
  y: 'Y (px)',
  scale: 'Scale',
  rotate: 'Rotate (°)',
  blur: 'Blur (px)',
};

export const EASING_OPTIONS: { value: MotionEasing; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'power1.out', label: 'Power1 Out' },
  { value: 'power1.inOut', label: 'Power1 InOut' },
  { value: 'power2.out', label: 'Power2 Out (default)' },
  { value: 'power2.in', label: 'Power2 In' },
  { value: 'power2.inOut', label: 'Power2 InOut' },
  { value: 'power3.out', label: 'Power3 Out' },
  { value: 'power3.in', label: 'Power3 In' },
  { value: 'power3.inOut', label: 'Power3 InOut' },
  { value: 'sine.out', label: 'Sine Out' },
  { value: 'sine.in', label: 'Sine In' },
  { value: 'sine.inOut', label: 'Sine InOut' },
  { value: 'expo.out', label: 'Expo Out' },
  { value: 'back.out', label: 'Back Out' },
];

export function snapTime(ms: number, snap = SNAP_MS): number {
  return Math.max(0, Math.round(ms / snap) * snap);
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function easingLabel(e: MotionEasing | undefined): string {
  if (!e) return 'power2.out';
  if (typeof e === 'string') {
    return EASING_OPTIONS.find(o => o.value === e)?.label ?? e;
  }
  return `cubic-bezier(${e.cubicBezier.join(', ')})`;
}

export function emptyMotion(): BlockMotion {
  return {
    tracks: [],
    duration: 1500,
    trigger: 'in-view',
    repeat: 0,
    yoyo: false,
    enabled: true,
  };
}

export function makeKeyframe(time: number): MotionKeyframe {
  return {
    time: snapTime(time),
    values: { opacity: 1 },
    easing: 'power2.out',
  };
}

export function addTrack(motion: BlockMotion, elementKey: string): BlockMotion {
  if (motion.tracks.some(t => t.elementKey === elementKey)) return motion;
  const track: MotionTrack = {
    elementKey,
    keyframes: [
      { time: 0, values: { opacity: 0, y: 24 }, easing: 'power2.out' },
      { time: snapTime(motion.duration * 0.6), values: { opacity: 1, y: 0 } },
    ],
  };
  return { ...motion, tracks: [...motion.tracks, track] };
}

export function removeTrack(
  motion: BlockMotion,
  elementKey: string
): BlockMotion {
  return {
    ...motion,
    tracks: motion.tracks.filter(t => t.elementKey !== elementKey),
  };
}

export function updateTrack(
  motion: BlockMotion,
  elementKey: string,
  patch: (t: MotionTrack) => MotionTrack
): BlockMotion {
  return {
    ...motion,
    tracks: motion.tracks.map(t =>
      t.elementKey === elementKey ? patch(t) : t
    ),
  };
}

export function addKeyframe(
  motion: BlockMotion,
  elementKey: string,
  atMs: number
): BlockMotion {
  return updateTrack(motion, elementKey, t => {
    const next = [...t.keyframes, makeKeyframe(atMs)].sort(
      (a, b) => a.time - b.time
    );
    return { ...t, keyframes: next };
  });
}

export function removeKeyframe(
  motion: BlockMotion,
  elementKey: string,
  index: number
): BlockMotion {
  return updateTrack(motion, elementKey, t => ({
    ...t,
    keyframes: t.keyframes.filter((_, i) => i !== index),
  }));
}

export function patchKeyframe(
  motion: BlockMotion,
  elementKey: string,
  index: number,
  patch: Partial<MotionKeyframe>
): BlockMotion {
  return updateTrack(motion, elementKey, t => {
    const next = t.keyframes.map((kf, i) =>
      i === index ? { ...kf, ...patch } : kf
    );
    next.sort((a, b) => a.time - b.time);
    return { ...t, keyframes: next };
  });
}

/** Resolve a friendly element label from its data-element-key. */
export function elementLabel(key: string): string {
  if (key === BLOCK_ROOT_KEY) return 'Toàn block';
  if (key === '__background__') return 'Nền';
  return key
    .replace(/^_+/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, m => m.toUpperCase());
}
