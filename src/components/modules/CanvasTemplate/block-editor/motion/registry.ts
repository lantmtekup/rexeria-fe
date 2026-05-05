import type { gsap } from 'gsap';

import type { BlockType, Device } from '../types';

import type {
  MotionCategory,
  MotionConfig,
  MotionElementKind,
  MotionPreset,
  MotionScope,
} from './types';

/**
 * Singleton registry of motion presets. Presets self-register on import via
 * `motion/presets/index.ts`. The runtime asks the registry to build a
 * timeline for a given `MotionConfig` + target element(s).
 *
 * The registry honours `prefers-reduced-motion` for non-hover/focus
 * categories — those only run on user intent, so reducing motion there
 * makes the UI feel broken.
 */
class MotionRegistryImpl {
  private presets = new Map<string, MotionPreset>();

  register(preset: MotionPreset): void {
    if (this.presets.has(preset.id)) {
      // eslint-disable-next-line no-console
      console.warn(`[motion] preset "${preset.id}" already registered`);
      return;
    }
    this.presets.set(preset.id, preset);
  }

  get(id: string): MotionPreset | undefined {
    return this.presets.get(id);
  }

  list(
    filter: {
      category?: MotionCategory;
      blockType?: BlockType;
      elementKind?: MotionElementKind;
      scope?: MotionScope;
    } = {}
  ): MotionPreset[] {
    return [...this.presets.values()].filter(p => {
      if (filter.category && p.category !== filter.category) return false;
      if (filter.scope && p.scope !== filter.scope) return false;
      if (
        filter.blockType &&
        p.blockTypes &&
        !p.blockTypes.includes(filter.blockType)
      ) {
        return false;
      }
      if (
        filter.elementKind &&
        p.elementKinds &&
        !p.elementKinds.includes(filter.elementKind)
      ) {
        return false;
      }
      return true;
    });
  }

  /**
   * Build the GSAP timeline for a config. Returns null when:
   *  - preset not found
   *  - config disabled
   *  - prefers-reduced-motion set and category is not user-intent
   */
  build(args: {
    config: MotionConfig;
    target: HTMLElement | HTMLElement[];
    device: Device;
    attachTriggers: boolean;
    scrollerEl?: HTMLElement | null;
  }): gsap.core.Timeline | gsap.core.Tween | null {
    const { config, target, device, attachTriggers, scrollerEl } = args;
    if (config.enabled === false) return null;
    const preset = this.presets.get(config.presetId);
    if (!preset) {
      // eslint-disable-next-line no-console
      console.warn(`[motion] unknown preset "${config.presetId}"`);
      return null;
    }
    if (this.shouldSkipForA11y(preset)) return null;

    return preset.build({
      target,
      config: this.normaliseConfig(config, preset),
      device,
      attachTriggers,
      scrollerEl,
    });
  }

  private shouldSkipForA11y(preset: MotionPreset): boolean {
    if (typeof window === 'undefined') return false;
    if (preset.category === 'hover' || preset.category === 'ambient') {
      // Hover is user-intent; ambient is subtle and we keep it (sub-2% scale).
      return false;
    }
    return (
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    );
  }

  /** Drop knobs the preset doesn't support; clamp delay. */
  private normaliseConfig(
    config: MotionConfig,
    preset: MotionPreset
  ): MotionConfig {
    return {
      ...config,
      cascade: preset.knobs.cascade ? config.cascade : 'off',
      delay:
        typeof config.delay === 'number'
          ? Math.max(0, Math.min(5000, config.delay))
          : undefined,
    };
  }
}

export const motionRegistry = new MotionRegistryImpl();
