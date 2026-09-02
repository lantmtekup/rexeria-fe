'use client';

import { LocateFixed } from 'lucide-react';
import * as React from 'react';

import { brandKitToCssVars, DEFAULT_PREVIEW_KIT } from '@/lib/brand-kit';
import { cn } from '@/lib/cn';

import { FLOATING, R_FLOATING } from './chrome';

import { CanvasElementChrome } from './CanvasElementChrome';
import { CANVAS_SURFACE_CHROME_CLASS } from './canvasSurfaceClass';
import { CANVAS_ZOOM_MIN, clampCanvasZoom } from './canvasZoom';
import { LinkNav } from '@/components/modules/block-editor/links/LinkNav';
import { DEVICE_FRAME_WIDTH } from '@/components/modules/block-editor/deviceFrame';
import { ExtraElementOverlay } from './ExtraElementOverlay';
import { RenderBlock } from '@/components/modules/block-editor/blocks/renderBlock';
import { useCanvasElementLayer } from './hooks/useCanvasElementLayer';
import { LandingMotionRoot } from '@/components/modules/block-editor/motion/LandingMotion';
import {
  MotionBlockRoot,
  MotionProvider,
} from '@/components/modules/block-editor/motion/runtime';
import type {
  BlockMotion,
  EditorMode,
} from '@/components/modules/block-editor/motion/types';
import {
  readVariant,
  type Block,
  type BlockBackground,
  type BlockContent,
  type Device,
  type Lang,
} from '@/components/modules/block-editor/types';

interface BlockPreviewProps {
  block: Block;
  lang: Lang;
  device: Device;
  zoom: number;
  selectedElementKey: string | null;
  /** Key currently being edited inline (double-click). Null when not editing. */
  editingKey: string | null;
  /**
   * Element callbacks all carry the owning block id — the artboard only ever
   * has one, but `PageCanvas` shares these handlers and a commit can land
   * after the active block has already changed.
   */
  onSelectElement: (
    blockId: string | null,
    key: string | null,
    rect: DOMRect | null
  ) => void;
  /** Triggered by double-click on a text element. */
  onStartInlineEdit: (blockId: string, key: string) => void;
  /** Called on blur / Enter / Esc with the final string value. */
  onCommitInlineEdit: (blockId: string, key: string, value: string) => void;
  onCancelInlineEdit: () => void;
  /**
   * Persist a new x/y offset for an element after a canvas drag completes.
   * Coordinates are in unscaled CSS pixels (delta already divided by zoom).
   */
  onCommitElementPosition?: (
    blockId: string,
    key: string,
    pos: { x: number; y: number }
  ) => void;
  /**
   * Patch block content — used by the canvas hover chip (image upload)
   * and the floating selection toolbar (AI / delete), which needs the
   * functional form to read the previous value.
   */
  onContentChange?: (
    blockId: string,
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
  /**
   * Clear every style override on the selected element. Powers the floating
   * selection toolbar's reset action.
   */
  onResetElementStyle?: (blockId: string, key: string) => void;
  /** Replace the block-level background (selection toolbar delete on `__background__`). */
  onUpdateBackground?: (
    blockId: string,
    next: BlockBackground | undefined
  ) => void;
  /** Open the Media tab on the left rail from the image edit chip. */
  onBrowseLibrary?: () => void;
  /** Editor lifecycle for motion subsystem. Default 'edit' (no-op). */
  motionMode?: EditorMode;
  /**
   * Increments on every "Play preview" click. Threaded through to
   * `MotionProvider` so the runtime can force a timeline rebuild + replay
   * even when `motionMode` is already `'preview'` (otherwise the dep set in
   * useGSAP is value-equal across re-clicks and the timeline doesn't restart).
   */
  motionPreviewNonce?: number;
  /**
   * When set, runtime animates only this element's track (single-element
   * audition triggered by picking a preset on the sidebar panel).
   */
  motionPreviewElement?: string | null;
  /**
   * Fired on mount + whenever `device` changes with the zoom % needed to fit
   * the device frame fully in the visible canvas surface (capped at 100%).
   * BlockEditor uses this to auto-fit so users don't have to scroll on first
   * load when the desktop frame (1440px) is wider than the viewport.
   */
  onAutoFitZoom?: (percentage: number, force?: boolean) => void;
  /** Ctrl/Cmd + wheel zoom — same clamp as BlockTabBar ZoomControls. */
  onZoomChange?: (zoom: number) => void;
  /**
   * Increment to force fit-to-frame: recalculate zoom, apply with `force`,
   * and reset pan offset to origin.
   */
  fitRequestKey?: number;
  // ── ExtraElements (free-drag user-added objects) ────────────────────────
  selectedExtraElementId?: string | null;
  onSelectExtraElement?: (blockId: string, id: string | null) => void;
  onCommitExtraElementPosition?: (
    blockId: string,
    id: string,
    pos: { x: number; y: number }
  ) => void;
}

/**
 * Canvas surface padding — must mirror the `p-8 pb-20` classes on the surface
 * element. `pb-20` clears the floating zoom bar. Both the fit-zoom math and
 * the pan clamp measure against this padded box.
 */
const SURFACE_PAD_X = 64;
const SURFACE_PAD_TOP = 32;
const SURFACE_PAD_BOTTOM = 80;

const clampTo = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/**
 * Block types that pin content with native `position: sticky` + viewport
 * (`dvh`) units instead of GSAP `pin` (docs/landing-motion-foundation.md §5).
 * `sticky` mis-measures inside a `transform: scale()` ancestor, so the
 * auto-fit-to-width zoom (which wraps the canvas in exactly that transform)
 * must not shrink these below 100% — otherwise the sticky stage renders
 * blank/misplaced in the editor even though `/p` always renders correctly.
 *
 * This is only a cheap PRE-FILTER: most of these blocks now fork on
 * `useIsCanvasEdit` and drop the sticky stage on canvas (HeroScroll renders a
 * flat 2×2 grid there), so forcing 100% just pushed a frame far wider than the
 * viewport and made the initial view overflow. `hasStickyStage()` confirms
 * against the real DOM before we give up on fitting.
 */
const STICKY_SCROLL_BLOCK_TYPES = new Set<Block['blockType']>([
  'hero_scroll',
  'altura_olympus',
  'framer_aestha_editorial',
  'framer_ignitex_step',
  'framer_perform_about',
  'framer_perform_pricing',
  'framer_purevisuals_hero',
  'housent_our_excellence',
  'readymag_case_section',
  'scroll_mattis',
  'the_grand_location',
  'the_grand_discover',
  'the_grand_service',
  'cg_radga_horizontal',
  'pnj_variant',
  'pnj_details',
  'mint_discover',
  'mint_vault_collection',
  'mint_vault_reveal',
  'delvaux_hero',
  'delvaux_variant',
  'cool_hunter_hero',
  'westly_hero',
  'westly_showcase',
  'westly_scene',
  'westly_residences',
  'westly_reveal',
  'cool_hunter_story',
  'cool_hunter_gallery',
  'cool_hunter_product',
  'cool_hunter_quote',
  'belgo_more_flavors',
  'belgo_footer',
]);

/** Overlay chrome (header/nav) — canvas căn top, không center tạo khoảng hở. */
const OVERLAY_TOP_BLOCK_TYPES = new Set<Block['blockType']>([
  'westly_header',
  'pnj_header',
  'belgo_header',
  'delvaux_header',
  'springs_header',
]);

export function BlockPreview({
  block,
  lang,
  device,
  zoom,
  selectedElementKey,
  editingKey,
  onSelectElement,
  onStartInlineEdit,
  onCommitInlineEdit,
  onCancelInlineEdit,
  motionMode = 'edit',
  motionPreviewNonce = 0,
  motionPreviewElement = null,
  onAutoFitZoom,
  onZoomChange,
  fitRequestKey = 0,
  onCommitElementPosition,
  onContentChange,
  onResetElementStyle,
  onUpdateBackground,
  onBrowseLibrary,
  selectedExtraElementId = null,
  onSelectExtraElement,
  onCommitExtraElementPosition,
}: BlockPreviewProps) {
  const langContent = lang === 'vi' ? block.contentVi : block.contentEn;
  const content = readVariant(langContent, device) ?? langContent.desktop;
  const styles = readVariant(block.elementStyles, device);
  const background = readVariant(block.background, device);
  const order = readVariant(block.elementOrder, device);
  const positions = readVariant(block.elementPositions, device);
  const baseWidth = DEVICE_FRAME_WIDTH[device];
  const scale = zoom / 100;
  const surfaceRef = React.useRef<HTMLDivElement>(null);

  // Resolve motion config for the current device variant. The stored shape
  // matches `BlockMotion` 1:1 (track-based timeline). In edit mode the
  // runtime no-ops, so this can run unconditionally.
  const motionForDevice = readVariant(block.motion, device) as
    | BlockMotion
    | undefined;
  const effectiveMode: EditorMode = motionMode;

  // Device frame element + its measured (unscaled) height. Declared up here
  // because the pan clamp needs the content size.
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [innerHeight, setInnerHeight] = React.useState<number>(0);

  // ── Canvas pan (Figma-style) ─────────────────────────────────────────
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [spaceHeld, setSpaceHeld] = React.useState(false);
  const [isPanning, setIsPanning] = React.useState(false);
  const panRef = React.useRef<{
    startClientX: number;
    startClientY: number;
    baseX: number;
    baseY: number;
    active: boolean;
  } | null>(null);

  /**
   * Keep the device frame inside the visible surface. The frame is centred by
   * flex at `pan = 0`, so the reachable offset on each axis is half the
   * difference between content and viewport — whichever is bigger. That covers
   * both directions with one formula:
   *
   *   - content larger than viewport → pan until an edge lines up with the
   *     viewport edge (this is how you scroll a tall block);
   *   - content smaller → pan until the frame touches the viewport edge.
   *
   * Either way the frame can never be pushed fully out of sight, which used to
   * strand users on an empty canvas with no way back except reloading.
   */
  const clampPan = React.useCallback(
    (p: { x: number; y: number }) => {
      const surface = surfaceRef.current;
      if (!surface) return p;
      // Overlay chrome (header/nav) is top-aligned with `pt-4`, everything
      // else is vertically centred — the reachable range differs.
      const topAligned = OVERLAY_TOP_BLOCK_TYPES.has(block.blockType);
      const padTop = topAligned ? 16 : SURFACE_PAD_TOP;
      const viewW = Math.max(0, surface.clientWidth - SURFACE_PAD_X);
      const viewH = Math.max(
        0,
        surface.clientHeight - padTop - SURFACE_PAD_BOTTOM
      );
      const contentW = baseWidth * scale;
      const contentH = innerHeight * scale;
      const maxX = Math.abs(contentW - viewW) / 2;
      // Height not measured yet (first paint) → don't allow vertical drift.
      const slackY = contentH > 0 ? viewH - contentH : 0;
      const [minY, maxY] = topAligned
        ? [Math.min(0, slackY), Math.max(0, slackY)]
        : [-Math.abs(slackY) / 2, Math.abs(slackY) / 2];
      return {
        x: clampTo(p.x, -maxX, maxX),
        y: clampTo(p.y, minY, maxY),
      };
    },
    [baseWidth, scale, innerHeight, block.blockType]
  );
  // Wheel/touch listeners are bound once with `[]` — they read the live clamp
  // through this ref instead of re-binding on every zoom/resize.
  const clampPanRef = React.useRef(clampPan);
  clampPanRef.current = clampPan;

  /** Clamp the current offset — after zoom out, device switch or resize the
   *  previously-valid pan can fall outside the new bounds. */
  const reclampPan = React.useCallback(() => {
    setPan(p => {
      const next = clampPan(p);
      return next.x === p.x && next.y === p.y ? p : next;
    });
  }, [clampPan]);

  React.useEffect(() => {
    reclampPan();
  }, [reclampPan]);

  React.useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => reclampPan());
    ro.observe(el);
    return () => ro.disconnect();
  }, [reclampPan]);

  React.useEffect(() => {
    const isTypingTarget = (t: EventTarget | null) => {
      if (!(t instanceof HTMLElement)) return false;
      const tag = t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT')
        return true;
      return t.isContentEditable || !!t.closest('[contenteditable]');
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      if (isTypingTarget(e.target) || editingKey) return;
      e.preventDefault();
      setSpaceHeld(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      setSpaceHeld(false);
    };
    const onBlur = () => setSpaceHeld(false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [editingKey]);

  // Ctrl/Cmd + wheel → zoom (pinch on trackpad). Plain wheel / two-finger
  // swipe → pan the canvas (Figma-style). Refs keep the listener stable.
  const zoomRef = React.useRef(zoom);
  zoomRef.current = zoom;
  const onZoomChangeRef = React.useRef(onZoomChange);
  onZoomChangeRef.current = onZoomChange;
  const panStateRef = React.useRef(pan);
  panStateRef.current = pan;
  const editingKeyRef = React.useRef(editingKey);
  editingKeyRef.current = editingKey;

  React.useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;

    const normalizeDelta = (e: WheelEvent) => {
      let dx = e.deltaX;
      let dy = e.deltaY;
      if (e.deltaMode === 1) {
        dx *= 16;
        dy *= 16;
      } else if (e.deltaMode === 2) {
        dx *= 320;
        dy *= 320;
      }
      return { dx, dy };
    };

    const onWheel = (e: WheelEvent) => {
      // Don't steal scroll while typing in an input / contenteditable.
      if (editingKeyRef.current) {
        const t = e.target;
        if (
          t instanceof HTMLElement &&
          (t.isContentEditable ||
            t.closest('[contenteditable]') ||
            t.closest('input, textarea, select'))
        ) {
          return;
        }
      }

      // Pinch-to-zoom (trackpad) / Ctrl+wheel (mouse).
      if (e.ctrlKey || e.metaKey) {
        if (!onZoomChangeRef.current) return;
        e.preventDefault();
        const { dy } = normalizeDelta(e);
        const next = clampCanvasZoom(zoomRef.current * Math.exp(-dy * 0.008));
        const rounded = Math.round(next);
        if (rounded === Math.round(zoomRef.current)) return;
        onZoomChangeRef.current(rounded);
        return;
      }

      // Two-finger swipe / mouse wheel → pan canvas.
      const { dx, dy } = normalizeDelta(e);
      if (dx === 0 && dy === 0) return;
      e.preventDefault();
      const cur = panStateRef.current;
      const next = clampPanRef.current({ x: cur.x - dx, y: cur.y - dy });
      if (next.x === cur.x && next.y === cur.y) return;
      panStateRef.current = next;
      setPan(next);
    };

    // Touch: two fingers drag → pan (phones / iPad).
    const touchPanRef: {
      active: boolean;
      startMidX: number;
      startMidY: number;
      baseX: number;
      baseY: number;
    } = {
      active: false,
      startMidX: 0,
      startMidY: 0,
      baseX: 0,
      baseY: 0,
    };

    const midPoint = (touches: TouchList) => {
      const a = touches[0];
      const b = touches[1];
      return {
        x: (a.clientX + b.clientX) / 2,
        y: (a.clientY + b.clientY) / 2,
      };
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) {
        touchPanRef.active = false;
        return;
      }
      const mid = midPoint(e.touches);
      const cur = panStateRef.current;
      touchPanRef.active = true;
      touchPanRef.startMidX = mid.x;
      touchPanRef.startMidY = mid.y;
      touchPanRef.baseX = cur.x;
      touchPanRef.baseY = cur.y;
      setIsPanning(true);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchPanRef.active || e.touches.length !== 2) return;
      e.preventDefault();
      const mid = midPoint(e.touches);
      const next = clampPanRef.current({
        x: touchPanRef.baseX + (mid.x - touchPanRef.startMidX),
        y: touchPanRef.baseY + (mid.y - touchPanRef.startMidY),
      });
      panStateRef.current = next;
      setPan(next);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchPanRef.active = false;
        setIsPanning(false);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  // ── Element interactions (shared with PageCanvas) ────────────────────
  const layer = useCanvasElementLayer({
    surfaceRef,
    lang,
    device,
    motionMode: effectiveMode,
    zoom,
    panX: pan.x,
    panY: pan.y,
    dataToken: block,
    selectedBlockId: selectedElementKey ? block.id : null,
    selectedElementKey,
    editingKey,
    interactionsSuspended: spaceHeld || isPanning,
    selectionToolbarSuppressed: !!selectedExtraElementId,
    resolveTarget: el => {
      const key = el.getAttribute('data-element-key');
      const root = innerRef.current;
      if (!key || !root) return null;
      return { block, key, el, root };
    },
    blockById: id => (id === block.id ? block : null),
    blockRoot: id => (id === block.id ? innerRef.current : null),
    contentOf: () => content,
    positionsOf: () => positions,
    onSelectElement,
    onStartInlineEdit,
    onCommitInlineEdit,
    onCancelInlineEdit,
    onCommitElementPosition,
    onContentChange,
    onResetElementStyle,
    onUpdateBackground,
    onBrowseLibrary,
  });

  /** True when pointer is on the device frame (any data-element-key). */
  const isOnDeviceFrame = (target: HTMLElement) => {
    const el = target.closest<HTMLElement>('[data-element-key]');
    return !!(el && surfaceRef.current?.contains(el));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (editingKey) return;

    // Canvas pan: middle mouse, Space+left, or left on true empty (outside frame).
    const wantsPan =
      e.button === 1 ||
      (e.button === 0 && spaceHeld) ||
      (e.button === 0 && !isOnDeviceFrame(e.target as HTMLElement));

    if (wantsPan) {
      e.preventDefault();
      panRef.current = {
        startClientX: e.clientX,
        startClientY: e.clientY,
        baseX: pan.x,
        baseY: pan.y,
        active: false,
      };
      setIsPanning(true);
      surfaceRef.current?.setPointerCapture(e.pointerId);
      return;
    }

    layer.onPointerDown(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = panRef.current;
    if (p) {
      const dx = e.clientX - p.startClientX;
      const dy = e.clientY - p.startClientY;
      if (!p.active && Math.hypot(dx, dy) < 4) return;
      p.active = true;
      setPan(clampPan({ x: p.baseX + dx, y: p.baseY + dy }));
      return;
    }
    layer.onPointerMove(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = panRef.current;
    if (p) {
      panRef.current = null;
      setIsPanning(false);
      surfaceRef.current?.releasePointerCapture?.(e.pointerId);
      if (p.active) layer.markDragged();
      return;
    }
    layer.onPointerUp(e);
  };

  // Track the inner content's natural (unscaled) height so the outer wrapper
  // can reserve `scaledWidth × scaledHeight` in layout flow — and so Fit can
  // contain the frame in both axes (width + height) like design tools.
  // (`innerRef` / `innerHeight` are declared above — the pan clamp needs them.)
  React.useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => {
      setInnerHeight(el.offsetHeight);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [block, lang, device]);

  /**
   * Does the block, AS RENDERED ON CANVAS, actually depend on `position:
   * sticky`? Type alone isn't enough — the `isCanvas` fork usually replaces
   * the sticky stage with a flat layout, and only a real sticky node is
   * broken by the `transform: scale()` that zoom applies.
   */
  const hasStickyStage = React.useCallback((): boolean => {
    if (!STICKY_SCROLL_BLOCK_TYPES.has(block.blockType)) return false;
    const root = innerRef.current;
    if (!root) return true; // not rendered yet — assume the worst, re-checked
    for (const node of root.querySelectorAll<HTMLElement>('*')) {
      if (getComputedStyle(node).position === 'sticky') return true;
    }
    return false;
  }, [block.blockType]);

  // Auto-fit zoom on mount + device change. Contain the device frame in the
  // visible canvas (width AND height), clamped 20–100%. Blocks that really do
  // pin with sticky stay at 100% (transform: scale breaks sticky).
  const computeFitZoom = React.useCallback((): number | null => {
    if (hasStickyStage()) return 100;
    if (!surfaceRef.current) return null;
    const surface = surfaceRef.current;
    const innerWidth = Math.max(0, surface.clientWidth - SURFACE_PAD_X);
    const innerHeightAvail = Math.max(
      0,
      surface.clientHeight - SURFACE_PAD_TOP - SURFACE_PAD_BOTTOM
    );
    if (innerWidth <= 0) return null;

    const fitW = (innerWidth / baseWidth) * 100;
    const contentH = innerHeight > 0 ? innerHeight : null;
    const fitH =
      contentH && innerHeightAvail > 0
        ? (innerHeightAvail / contentH) * 100
        : fitW;
    const fitPct = Math.floor(Math.min(fitW, fitH));
    return Math.min(100, Math.max(CANVAS_ZOOM_MIN, fitPct));
  }, [baseWidth, hasStickyStage, innerHeight]);

  /** Sticky blocks are pushed to 100% ONCE per (block, device). The effect
   *  re-runs on every content remeasure, and forcing there would keep yanking
   *  the slider back to 100% while the user is zooming. */
  const forcedZoomKeyRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!onAutoFitZoom) return;
    const key = `${block.id}:${device}`;
    if (hasStickyStage()) {
      if (forcedZoomKeyRef.current === key) return;
      forcedZoomKeyRef.current = key;
      onAutoFitZoom(100, true);
      return;
    }
    forcedZoomKeyRef.current = null;
    const clamped = computeFitZoom();
    if (clamped == null) return;
    onAutoFitZoom(clamped);
  }, [device, block.id, onAutoFitZoom, computeFitZoom, hasStickyStage]);

  /** Back to the initial view: frame centred + zoom re-fitted to the surface. */
  const resetView = React.useCallback(() => {
    setPan({ x: 0, y: 0 });
    const clamped = computeFitZoom();
    if (clamped == null || !onAutoFitZoom) return;
    onAutoFitZoom(clamped, true);
  }, [computeFitZoom, onAutoFitZoom]);

  // Manual Fit button (zoom bar) — same reset, driven by a counter prop.
  const prevFitKeyRef = React.useRef(fitRequestKey);
  React.useEffect(() => {
    if (fitRequestKey === prevFitKeyRef.current) return;
    prevFitKeyRef.current = fitRequestKey;
    resetView();
  }, [fitRequestKey, resetView]);

  // Shift+0 — the "I'm lost" escape hatch, mirroring design tools.
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '0' || !e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }
      const t = e.target;
      if (
        t instanceof HTMLElement &&
        (t.isContentEditable ||
          t.closest('[contenteditable]') ||
          t.closest('input, textarea, select'))
      ) {
        return;
      }
      e.preventDefault();
      resetView();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [resetView]);

  const isOffOrigin = pan.x !== 0 || pan.y !== 0;

  return (
    <div
      ref={surfaceRef}
      onClick={layer.onClick}
      onDoubleClick={layer.onDoubleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={layer.onPointerLeave}
      data-selected-key={selectedElementKey ?? ''}
      className={cn(
        'relative flex flex-1 touch-none overflow-hidden p-8 pb-20',
        OVERLAY_TOP_BLOCK_TYPES.has(block.blockType)
          ? 'items-start justify-center pt-4'
          : 'items-center justify-center',
        CANVAS_SURFACE_CHROME_CLASS,
        // Selected element gets a grab cursor so users know it's draggable.
        // Bracket-targeting via `data-element-key` matches the selected key.
        selectedElementKey &&
          !selectedElementKey.startsWith('__') &&
          device !== 'tablet' &&
          !spaceHeld &&
          `[&_[data-element-key="${selectedElementKey}"]]:cursor-grab`,
        (spaceHeld || isPanning) && 'cursor-grab',
        isPanning && 'cursor-grabbing'
      )}
      style={{
        backgroundColor: '#f3f1ec',
        backgroundImage:
          'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      {/*
        Outer wrapper reserves `scaledWidth × scaledHeight` in layout so the
        surface scrollbar reflects what the user actually sees. Without it,
        `transform: scale(...)` shrinks the visual but leaves the layout box
        at the original 1440/834/390 width → horizontal scroll appears even
        when the rendered artwork fits. Pan translate lives here (not on the
        scaled inner) so sticky/pin blocks keep a clean containing block.
      */}
      <LandingMotionRoot scrollerRef={surfaceRef} enableSmooth={false}>
        <div
          className='shrink-0'
          style={{
            width: baseWidth * scale,
            height: innerHeight * scale,
            transform:
              pan.x !== 0 || pan.y !== 0
                ? `translate(${pan.x}px, ${pan.y}px)`
                : undefined,
          }}
        >
          <div
            ref={innerRef}
            // `@container` stays on the original-sized element so container
            // queries (`@2xl:` / `@4xl:`) match the *logical* device width
            // (1440 / 834 / 390) — independent of the user-controlled zoom.
            className='@container origin-top-left'
            style={{
              width: baseWidth,
              // Omit `transform` entirely at 100% instead of `scale(1)` — ANY
              // non-`none` transform value (even an identity scale) makes the
              // browser treat this ancestor as a new containing block, which
              // breaks native `position: sticky` in blocks like HeroScroll
              // (docs/landing-motion-foundation.md §5). Only apply the scale
              // when actually zooming, so sticky/pin blocks render correctly
              // at 100%.
              ...(scale !== 1 ? { transform: `scale(${scale})` } : {}),
              // Preview brand-kit tokens so `token:*` element styles resolve to
              // sensible colors/fonts while authoring (real per-brand kit fills
              // these at render).
              ...brandKitToCssVars(DEFAULT_PREVIEW_KIT),
            }}
          >
            <div
              data-element-key='__background__'
              data-testid='active-block-preview'
              className={cn(
                // The ring stays: this card sits on the dotted canvas and the
                // block's own background can be any colour, so it needs a
                // defined edge that a shadow alone does not give it.
                'relative w-full overflow-hidden rounded-md bg-white ring-1 ring-black/5',
                FLOATING,
                selectedElementKey === '__background__' &&
                  'outline outline-2 outline-offset-2 outline-sky-500'
              )}
            >
              {/* Blocks the anchor clicks that would otherwise navigate the
                  whole admin app away when a CTA is clicked while editing.
                  Capture phase, and deliberately does NOT stopPropagation, so
                  element selection still works. */}
              <LinkNav mode='canvas'>
                <MotionProvider
                  mode={effectiveMode}
                  motion={motionForDevice}
                  scrollerEl={surfaceRef.current}
                  previewNonce={motionPreviewNonce}
                  previewElement={motionPreviewElement}
                >
                  <MotionBlockRoot>
                    {/*
                Re-mount RenderBlock when block/device/lang change so the
                CSS `animate-in` keyframes fire fresh on every tab switch
                (otherwise React reconciles same nodes → no animation).
              */}
                    <RenderBlock
                      key={`${block.id}:${device}:${lang}`}
                      block={block}
                      content={content}
                      styles={styles}
                      background={background}
                      order={order}
                      positions={positions}
                      activeKey={selectedElementKey}
                    />
                  </MotionBlockRoot>
                </MotionProvider>
              </LinkNav>
              {/* User-added free-drag elements layered on top of the block. */}
              <ExtraElementOverlay
                elements={block.extraElements ?? []}
                selectedId={selectedExtraElementId}
                scale={scale}
                readOnly={device === 'tablet'}
                onSelect={id => onSelectExtraElement?.(block.id, id)}
                onCommitPosition={(id, pos) =>
                  onCommitExtraElementPosition?.(block.id, id, pos)
                }
              />
            </div>
          </div>
        </div>
      </LandingMotionRoot>

      {/* Escape hatch — always reachable, highlighted once the view has been
          moved off centre so a lost user knows where to click. */}
      <button
        type='button'
        onPointerDown={e => e.stopPropagation()}
        onClick={e => {
          e.stopPropagation();
          resetView();
        }}
        title='Đưa canvas về vị trí ban đầu (Shift+0)'
        className={cn(
          'absolute bottom-3 left-3 z-30 flex cursor-pointer items-center gap-1.5 bg-[var(--pv2-paper)] px-2.5 py-1.5 text-xs font-medium transition-colors',
          R_FLOATING,
          FLOATING,
          isOffOrigin
            ? 'text-[var(--pv2-electric)]'
            : 'text-[var(--pv2-mut)] hover:text-[var(--pv2-ink)]'
        )}
      >
        <LocateFixed className='size-3.5' />
        Về giữa
      </button>

      <CanvasElementChrome layer={layer} />
    </div>
  );
}
