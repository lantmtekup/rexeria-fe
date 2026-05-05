/**
 * Motion model for canvas-template blocks. See docs/be-motion-spec.md (TBD)
 * for the persisted shape; this file is the FE-side source of truth.
 *
 * - `MotionConfig` is what gets stored on `Block.motion`.
 * - `MotionPreset` is the recipe registered in `MotionRegistry`.
 * - Tokens (speed/intensity/cascade) are intentionally categorical so the
 *   editor stays jargon-free. `motion/tokens.ts` maps them to GSAP values.
 */
import type { gsap } from 'gsap';

import type { BlockType, Device } from '../types';

export type MotionTrigger =
  | 'load'
  | 'in-view'
  | 'scroll-progress'
  | 'hover'
  | 'tap'
  | 'focus';

export type MotionSpeed = 'slow' | 'normal' | 'fast';
export type MotionIntensity = 'subtle' | 'normal' | 'dramatic';
export type MotionCascade = 'off' | 'normal' | 'slow';

export interface MotionConfig {
  /** Namespaced kebab-case id, e.g. "hero.fade-up-stagger". */
  presetId: string;
  speed: MotionSpeed;
  intensity: MotionIntensity;
  cascade: MotionCascade;
  /** Extra delay in ms (power-user override). Clamped to [0, 5000]. */
  delay?: number;
  /** Default true. False = bypass at runtime, keep config for toggle. */
  enabled?: boolean;
}

export type MotionElementKind =
  | 'text'
  | 'image'
  | 'button'
  | 'icon'
  | 'card'
  | 'group';

export type MotionScope = 'block' | 'children' | 'element';
export type MotionCategory = 'entrance' | 'hover' | 'ambient' | 'scroll';

export interface MotionPresetCopy {
  vi: string;
  en: string;
}

export interface MotionRecipeInput {
  /** One element for `scope:'block'|'element'`, an array for `scope:'children'`. */
  target: HTMLElement | HTMLElement[];
  config: MotionConfig;
  device: Device;
  /** Whether to attach ScrollTrigger / hover handlers. False in editor-paused. */
  attachTriggers: boolean;
  /** Canvas scroll container — ScrollTrigger scope. Optional. */
  scrollerEl?: HTMLElement | null;
}

/**
 * Pure factory that builds a GSAP timeline/tween or returns null if the
 * preset cannot run (eg prefers-reduced-motion handled at registry level).
 */
export type MotionRecipeFn = (
  input: MotionRecipeInput
) => gsap.core.Timeline | gsap.core.Tween | null;

export interface MotionPreset {
  id: string;
  category: MotionCategory;
  scope: MotionScope;
  /** Restrict to specific block types. Omit = available for any block. */
  blockTypes?: BlockType[];
  /** Restrict to specific element kinds (text/image/button/...). */
  elementKinds?: MotionElementKind[];
  name: MotionPresetCopy;
  description: MotionPresetCopy;
  /** /motion-preview/<id>.gif (1.5s loop, 240×140). */
  previewGif?: string;
  /** Fallback emoji/icon when no GIF exists yet. */
  thumbHint?: string;
  /** Which knobs are meaningful for this preset. */
  knobs: { speed?: boolean; intensity?: boolean; cascade?: boolean };
  build: MotionRecipeFn;
}

/** Block-level + element-overrides. Per-device for amplitude tuning. */
export interface BlockMotionMap {
  block?: MotionConfig;
  elements?: Record<string, MotionConfig>;
}

export type EditorMode = 'edit' | 'preview' | 'production';

export const DEFAULT_MOTION_CONFIG = (presetId: string): MotionConfig => ({
  presetId,
  speed: 'normal',
  intensity: 'normal',
  cascade: 'normal',
  enabled: true,
});
