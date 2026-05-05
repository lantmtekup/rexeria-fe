'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import type { Device } from '../types';

import { motionRegistry } from './registry';
import './presets'; // side-effect: register presets

import type { BlockMotionMap, EditorMode, MotionConfig } from './types';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.config({ nullTargetWarn: false });
}

interface MotionContextValue {
  mode: EditorMode;
  device: Device;
  /** Block-scope motion config (resolved for the current device variant). */
  blockMotion?: MotionConfig;
  /** Per-element overrides keyed by element key. */
  elementMotions?: Record<string, MotionConfig>;
  /** Canvas scroll container — passed to ScrollTrigger.scroller. */
  scrollerEl?: HTMLElement | null;
}

const MotionContext = React.createContext<MotionContextValue | null>(null);

export interface MotionProviderProps {
  mode: EditorMode;
  device: Device;
  motion?: BlockMotionMap;
  scrollerEl?: HTMLElement | null;
  children: React.ReactNode;
}

/**
 * Provides motion config for the children of a block. Wrap the block render
 * tree (eg. inside `BlockPreview`).
 *
 * The provider only owns *configuration*; building/playing timelines is
 * done by `<MotionElement>` and `<MotionBlockRoot>` consumers.
 */
export function MotionProvider({
  mode,
  device,
  motion,
  scrollerEl,
  children,
}: MotionProviderProps) {
  const value = React.useMemo<MotionContextValue>(
    () => ({
      mode,
      device,
      blockMotion: motion?.block,
      elementMotions: motion?.elements,
      scrollerEl,
    }),
    [mode, device, motion?.block, motion?.elements, scrollerEl]
  );
  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}

export function useMotionContext(): MotionContextValue | null {
  return React.useContext(MotionContext);
}

/**
 * Resolve motion config for a single element key — returns the override
 * if present, otherwise the block-level config (so element inherits by
 * default). `null` means no motion configured.
 */
export function useElementMotion(elementKey: string): MotionConfig | null {
  const ctx = useMotionContext();
  if (!ctx) return null;
  return ctx.elementMotions?.[elementKey] ?? null;
}

/**
 * Wrap a single animatable element. The wrapper builds its own timeline
 * only when an element-specific override exists. Block-level motion is
 * orchestrated by `<MotionBlockRoot>` (see below) which targets all
 * children with `data-motion-key`.
 */
export interface MotionElementProps {
  elementKey: string;
  className?: string;
  children: React.ReactNode;
}

export function MotionElement({
  elementKey,
  className,
  children,
}: MotionElementProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const ctx = useMotionContext();
  const override = ctx?.elementMotions?.[elementKey] ?? null;

  useGSAP(
    () => {
      if (!ctx) return;
      if (ctx.mode === 'edit') return;
      if (!override) return; // block-level handled by root
      if (!ref.current) return;
      motionRegistry.build({
        config: override,
        target: ref.current,
        device: ctx.device,
        attachTriggers: ctx.mode === 'preview' || ctx.mode === 'production',
        scrollerEl: ctx.scrollerEl,
      });
    },
    {
      dependencies: [ctx?.mode, ctx?.device, override?.presetId],
      scope: ref,
    }
  );

  return (
    <div ref={ref} data-motion-key={elementKey} className={className}>
      {children}
    </div>
  );
}

/**
 * Block-level motion driver. Wrap each block's outer container with this.
 * On mount (or mode change), it queries DOM for all `[data-motion-key]`
 * children and builds the block-scope preset against them.
 *
 * For `scope:'children'` presets the registry receives the full array.
 * For `scope:'block'` presets it receives the root element.
 */
export interface MotionBlockRootProps {
  className?: string;
  children: React.ReactNode;
}

export function MotionBlockRoot({ className, children }: MotionBlockRootProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const ctx = useMotionContext();

  useGSAP(
    () => {
      if (!ctx) return;
      if (ctx.mode === 'edit') return;
      if (!ctx.blockMotion) return;
      if (!ref.current) return;

      const preset = motionRegistry.get(ctx.blockMotion.presetId);
      if (!preset) return;

      const root = ref.current;
      // For `scope:'children'`, target every animatable element. Block
      // renderers already mark elements with `data-element-key` for click
      // selection; reuse that. System keys (prefix `__`) are excluded so
      // background containers don't get pulled into stagger.
      const target: HTMLElement | HTMLElement[] =
        preset.scope === 'children'
          ? Array.from(
              root.querySelectorAll<HTMLElement>(
                '[data-element-key]:not([data-element-key^="__"])'
              )
            )
          : root;

      motionRegistry.build({
        config: ctx.blockMotion,
        target,
        device: ctx.device,
        attachTriggers: ctx.mode === 'preview' || ctx.mode === 'production',
        scrollerEl: ctx.scrollerEl,
      });
    },
    {
      dependencies: [
        ctx?.mode,
        ctx?.device,
        ctx?.blockMotion?.presetId,
        ctx?.blockMotion?.speed,
        ctx?.blockMotion?.intensity,
        ctx?.blockMotion?.cascade,
        ctx?.blockMotion?.enabled,
      ],
      scope: ref,
    }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
