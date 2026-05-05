import type { MotionCascade, MotionIntensity, MotionSpeed } from './types';

/**
 * Categorical tokens → numeric GSAP values. Centralised so changing the
 * "feel" of the whole product is a one-file edit. Recipes MUST use these
 * tokens rather than baking magic numbers, otherwise tuning gets lost.
 */
export const SPEED: Record<MotionSpeed, { duration: number; ease: string }> = {
  slow: { duration: 1.2, ease: 'power2.out' },
  normal: { duration: 0.7, ease: 'power3.out' },
  fast: { duration: 0.4, ease: 'power3.out' },
};

/** Multiplier applied to an "amplitude" base (translate distance, scale delta, blur radius). */
export const INTENSITY_MULT: Record<MotionIntensity, number> = {
  subtle: 0.4,
  normal: 1.0,
  dramatic: 1.8,
};

/** Stagger between children, in seconds. `off` disables stagger entirely. */
export const CASCADE_S: Record<MotionCascade, number> = {
  off: 0,
  normal: 0.08,
  slow: 0.16,
};

/** Mobile motion is dampened to reduce CPU + perceived motion sickness. */
export const MOBILE_AMPLITUDE_MULT = 0.6;

/** Final amplitude factor combining intensity + device. */
export function amplitude(
  intensity: MotionIntensity,
  device: 'desktop' | 'mobile' | 'tablet'
): number {
  const base = INTENSITY_MULT[intensity];
  return device === 'mobile' ? base * MOBILE_AMPLITUDE_MULT : base;
}
