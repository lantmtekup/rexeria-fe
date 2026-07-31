'use client';

import * as React from 'react';

import {
  editingVariantOf,
  type Device,
  type EditingVariant,
  type Lang,
} from '@/components/modules/block-editor/types';

/**
 * UI state for canvas display: language, device frame and zoom.
 *
 * Zoom has two sources of truth: the user can drag the slider (sticky) or
 * the canvas can auto-fit when the device frame changes (overridden as
 * soon as the user touches the slider — gated by `userTouchedZoomRef`).
 */
export interface UseDeviceLangApi {
  lang: Lang;
  device: Device;
  zoom: number;
  /** Variant the editor writes mutations into. Tablet → desktop (read-only). */
  editVariant: EditingVariant;
  setLang: (next: Lang) => void;
  setDevice: (next: Device) => void;
  setZoom: (next: number) => void;
  /** Apply an auto-fit zoom suggestion from BlockPreview — silently ignored
   *  if the user has already moved the slider, unless `force` is set (used
   *  for blocks that render incorrectly away from 100%, e.g. sticky/pin
   *  scroll-reveal blocks — see STICKY_SCROLL_BLOCK_TYPES in BlockPreview). */
  applyAutoFitZoom: (pct: number, force?: boolean) => void;
}

export function useDeviceLang(
  initial: { lang?: Lang; device?: Device; zoom?: number } = {}
): UseDeviceLangApi {
  const [lang, setLang] = React.useState<Lang>(initial.lang ?? 'vi');
  const [device, setDevice] = React.useState<Device>(
    initial.device ?? 'desktop'
  );
  const [zoom, setZoomRaw] = React.useState<number>(initial.zoom ?? 100);
  const userTouchedRef = React.useRef(false);

  const setZoom = React.useCallback((next: number) => {
    userTouchedRef.current = true;
    setZoomRaw(next);
  }, []);

  const applyAutoFitZoom = React.useCallback((pct: number, force = false) => {
    if (userTouchedRef.current && !force) return;
    setZoomRaw(pct);
  }, []);

  return {
    lang,
    device,
    zoom,
    editVariant: editingVariantOf(device),
    setLang,
    setDevice,
    setZoom,
    applyAutoFitZoom,
  };
}
