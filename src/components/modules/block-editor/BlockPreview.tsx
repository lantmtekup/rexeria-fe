'use client';

import { LocateFixed } from 'lucide-react';
import * as React from 'react';

import { brandKitToCssVars, DEFAULT_PREVIEW_KIT } from '@/lib/brand-kit';
import { cn } from '@/lib/cn';

import { CanvasElementEditChip } from './CanvasElementEditChip';
import { LinkNav } from './links/LinkNav';
import { DEVICE_FRAME_WIDTH } from './deviceFrame';
import { ExtraElementOverlay } from './ExtraElementOverlay';
import { RenderBlock } from './blocks/renderBlock';
import { isInspectorKind } from './inspector/kinds';
import { SelectionToolbar } from './inspector/SelectionToolbar';
import { LandingMotionRoot } from './motion/LandingMotion';
import { MotionBlockRoot, MotionProvider } from './motion/runtime';
import type { BlockMotion, EditorMode } from './motion/types';
import {
  isInlineTextKey,
  resolveElementMeta,
  resolveLinkAnchorKey,
  resolveSiblingLinkKey,
} from './resolveElementKind';
import {
  readVariant,
  type Block,
  type BlockBackground,
  type BlockContent,
  type Device,
  type Lang,
} from './types';

interface BlockPreviewProps {
  block: Block;
  lang: Lang;
  device: Device;
  zoom: number;
  selectedElementKey: string | null;
  /** Key currently being edited inline (double-click). Null when not editing. */
  editingKey: string | null;
  onSelectElement: (key: string | null, rect: DOMRect | null) => void;
  /** Triggered by double-click on a text element. */
  onStartInlineEdit: (key: string) => void;
  /** Called on blur / Enter / Esc with the final string value. */
  onCommitInlineEdit: (key: string, value: string) => void;
  onCancelInlineEdit: () => void;
  /**
   * Persist a new x/y offset for an element after a canvas drag completes.
   * Coordinates are in unscaled CSS pixels (delta already divided by zoom).
   */
  onCommitElementPosition?: (
    key: string,
    pos: { x: number; y: number }
  ) => void;
  /**
   * Patch active block content — used by the canvas hover chip (image upload)
   * and the floating selection toolbar (AI / delete), which needs the
   * functional form to read the previous value.
   */
  onContentChange?: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
  /**
   * Clear every style override on the selected element. Powers the floating
   * selection toolbar's reset action.
   */
  onResetElementStyle?: () => void;
  /** Replace the block-level background (selection toolbar delete on `__background__`). */
  onUpdateBackground?: (next: BlockBackground | undefined) => void;
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
   * the device frame fully in the visible canvas surface (clamped 20–100%).
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
  onSelectExtraElement?: (id: string | null) => void;
  onCommitExtraElementPosition?: (
    id: string,
    pos: { x: number; y: number }
  ) => void;
}

const ZOOM_MIN = 25;
const ZOOM_MAX = 200;

const clampZoom = (n: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, n));

/**
 * Canvas surface padding — must mirror the `p-8 pb-20` classes on the surface
 * element. `pb-20` clears the floating zoom bar. Both the fit-zoom math and
 * the pan clamp measure against this padded box.
 */
const SURFACE_PAD_X = 64;
const SURFACE_PAD_TOP = 32;
const SURFACE_PAD_BOTTOM = 80;

/**
 * Free-drag guard: an element must keep at least this many (unscaled) px
 * inside the device frame. Without it a drag can park content far outside the
 * frame where it is invisible on canvas AND on `/p` — unrecoverable except by
 * undo, which users rarely reach for after a few more edits.
 */
const DRAG_MIN_VISIBLE = 32;

const clampTo = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/** Apply free-drag bounds when they exist; pass the raw value through when the
 *  element was already outside the frame (bounds === null). */
function clampDrag(
  x: number,
  y: number,
  bounds: { minX: number; maxX: number; minY: number; maxY: number } | null
) {
  if (!bounds) return { x, y };
  return {
    x: clampTo(x, bounds.minX, bounds.maxX),
    y: clampTo(y, bounds.minY, bounds.maxY),
  };
}

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
  'cg_3d_slider',
  'pnj_variant',
  'pnj_details',
  'mint_discover',
  'mint_vault_collection',
  'mint_vault_reveal',
  'delvaux_hero',
  'delvaux_variant',
  'gambit_product_overview',
  'gambit_product_details',
  'gambit_brand_heritage',
  'gambit_related_products',
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
  'belgo_footer',
  'belgo_more_flavors',
  'west72_hero',
]);

/** Overlay chrome (header/nav) — canvas căn top, không center tạo khoảng hở. */
const OVERLAY_TOP_BLOCK_TYPES = new Set<Block['blockType']>([
  'westly_header',
  'lecool_header',
  'pnj_header',
  'belgo_header',
  'delvaux_header',
  'springs_header',
  'cite_flow_header',
  'cool_hunter_section_progress',
]);

/**
 * Resolve a canvas element by key. When a block duplicates the same
 * `data-element-key` across responsive variants (one hidden via CSS), prefer
 * the node that currently has a layout box so hover/chip/inline-edit bind to
 * the visible instance — not the first match in DOM order.
 */
function findElementByKey(
  surface: HTMLElement,
  key: string
): HTMLElement | null {
  const nodes = surface.querySelectorAll<HTMLElement>(
    `[data-element-key="${CSS.escape(key)}"]`
  );
  if (nodes.length === 0) return null;
  if (nodes.length === 1) return nodes[0];
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return node;
  }
  return nodes[0];
}

/**
 * Node kind 'text' nhưng bên trong chỉ có media (video / ảnh / iframe) và
 * không có chữ nào — ví dụ `real_estate_location.videoUrl` bọc `<video>`.
 *
 * Bật contenteditable lên node này là MẤT DỮ LIỆU: commit lấy `el.textContent`
 * → chuỗi rỗng → ghi đè URL, media biến mất. Field vẫn sửa được qua inspector /
 * panel Lớp, nên ở đây chỉ chọn chứ không vào inline edit.
 */
function isMediaOnlyNode(el: HTMLElement | null): boolean {
  if (!el) return false;
  if ((el.textContent ?? '').trim() !== '') return false;
  return !!el.querySelector('video, img, picture, iframe, canvas, svg');
}

/** Keep hover alive while the pointer travels from element → edit chip. */
function isPointerInChipCorridor(
  clientX: number,
  clientY: number,
  elementRect: DOMRect,
  wideChip: boolean
): boolean {
  const chipWidth = wideChip ? 148 : 104;
  const chipHeight = 28;
  const bridge = 32;
  const anchorX = elementRect.right;
  const anchorY = elementRect.top;
  return (
    clientX >= anchorX - chipWidth - bridge &&
    clientX <= anchorX + bridge &&
    clientY >= anchorY - chipHeight - 8 - bridge &&
    clientY <= anchorY + bridge
  );
}

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
        const next = clampZoom(zoomRef.current * Math.exp(-dy * 0.008));
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

  // ── Free-form drag (Figma-style) ─────────────────────────────────────
  // Pointer is captured to the surface so the drag survives the cursor
  // wandering across other elements. Coordinates are stored in unscaled
  // CSS pixels — we divide by `scale` so a 100px drag at 50% zoom moves
  // the element 200px in its own coord space, matching how the user
  // perceives it on a zoomed canvas.
  const dragRef = React.useRef<{
    el: HTMLElement;
    key: string;
    startClientX: number;
    startClientY: number;
    baseX: number;
    baseY: number;
    /** Allowed x/y range so the element keeps `DRAG_MIN_VISIBLE` px inside the
     *  device frame. Null when the element already sits outside — clamping it
     *  then would yank it back on the first pixel of drag. */
    bounds: { minX: number; maxX: number; minY: number; maxY: number } | null;
    /** Set to true once the pointer has moved past the drag threshold. */
    active: boolean;
  } | null>(null);
  // Set true on pointerup of a real drag; consumed by the next click event
  // so a drag doesn't also trigger element selection toggling.
  const justDraggedRef = React.useRef(false);
  // Key text được tương tác gần nhất. Double-click vào title nằm trong flow có
  // thể để click thứ 2 rơi xuống nền (toolbar chọn đẩy element vài px) → selection
  // bị ghi đè bằng `__background__`. Ref này giữ key text từ click thứ NHẤT để
  // handleDoubleClick fallback chính xác (ổn định cho mọi block).
  const lastTextKeyRef = React.useRef<string | null>(null);

  // ── Hover edit chip ──────────────────────────────────────────────────
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);
  const [hoveredRect, setHoveredRect] = React.useState<DOMRect | null>(null);
  /** Image field currently showing the upload popover (opened by click). */
  const [imageEditKey, setImageEditKey] = React.useState<string | null>(null);
  /** Link field currently showing the link picker popover (opened by click). */
  const [linkEditKey, setLinkEditKey] = React.useState<string | null>(null);
  const chipPointerInsideRef = React.useRef(false);
  const hoverClearTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const imagePopoverOpen = imageEditKey !== null;
  const linkPopoverOpen = linkEditKey !== null;
  const canvasPopoverOpen = imagePopoverOpen || linkPopoverOpen;
  const canvasPopoverOpenRef = React.useRef(canvasPopoverOpen);
  canvasPopoverOpenRef.current = canvasPopoverOpen;

  const canShowHoverChrome =
    device !== 'tablet' &&
    !editingKey &&
    motionMode !== 'preview' &&
    !spaceHeld &&
    !isPanning;

  const cancelHoverClear = React.useCallback(() => {
    if (hoverClearTimerRef.current == null) return;
    clearTimeout(hoverClearTimerRef.current);
    hoverClearTimerRef.current = null;
  }, []);

  // Delay clear so the pointer can cross the gap between element → chip
  // without the chip unmounting mid-travel.
  const clearHover = React.useCallback(() => {
    if (chipPointerInsideRef.current || canvasPopoverOpenRef.current) return;
    cancelHoverClear();
    hoverClearTimerRef.current = setTimeout(() => {
      hoverClearTimerRef.current = null;
      if (chipPointerInsideRef.current || canvasPopoverOpenRef.current) return;
      setHoveredKey(null);
      setHoveredRect(null);
    }, 160);
  }, [cancelHoverClear]);

  const forceClearHover = React.useCallback(() => {
    cancelHoverClear();
    chipPointerInsideRef.current = false;
    setHoveredKey(null);
    setHoveredRect(null);
  }, [cancelHoverClear]);

  const setHoverFromElement = React.useCallback(
    (el: HTMLElement, key: string) => {
      cancelHoverClear();
      setHoveredKey(key);
      setHoveredRect(el.getBoundingClientRect());
    },
    [cancelHoverClear]
  );

  React.useEffect(() => () => cancelHoverClear(), [cancelHoverClear]);

  /**
   * Activate exactly one element — never falls back to another key.
   * Text → inline edit now; image → upload popover now; link → link picker now.
   */
  const activateElement = React.useCallback(
    (key: string, rect: DOMRect) => {
      if (device === 'tablet' || motionMode === 'preview') return;

      const meta = resolveElementMeta(block.blockType, key);
      onSelectElement(key, rect);
      setHoveredKey(key);
      setHoveredRect(rect);

      if (meta.kind === 'text') {
        setImageEditKey(null);
        setLinkEditKey(null);
        const el = surfaceRef.current
          ? findElementByKey(surfaceRef.current, key)
          : null;
        if (isInlineTextKey(block.blockType, key) && !isMediaOnlyNode(el)) {
          lastTextKeyRef.current = key;
          onStartInlineEdit(key);
        }
        return;
      }

      if (meta.kind === 'image') {
        setLinkEditKey(null);
        setImageEditKey(key);
        return;
      }

      if (meta.kind === 'link') {
        setImageEditKey(null);
        setLinkEditKey(key);
        return;
      }

      // background / complex arrays → select so ElementToolbar shows controls
      setImageEditKey(null);
      setLinkEditKey(null);
    },
    [block.blockType, device, motionMode, onSelectElement, onStartInlineEdit]
  );

  const openLinkEditor = React.useCallback(
    (key: string, rect: DOMRect) => {
      if (device === 'tablet' || motionMode === 'preview') return;
      setImageEditKey(null);
      setLinkEditKey(key);
      onSelectElement(key, rect);
      const anchorKey = resolveLinkAnchorKey(block.blockType, key);
      if (anchorKey !== key) {
        setHoveredKey(anchorKey);
        setHoveredRect(rect);
      }
    },
    [block.blockType, device, motionMode, onSelectElement]
  );

  // Remeasure chip anchor when zoom/pan/content shifts under a sticky hover.
  React.useEffect(() => {
    const chipKey =
      imageEditKey ??
      hoveredKey ??
      (linkEditKey ? resolveLinkAnchorKey(block.blockType, linkEditKey) : null);
    if (!chipKey || !surfaceRef.current) return;
    const anchorKey = resolveLinkAnchorKey(block.blockType, chipKey);
    const el =
      findElementByKey(surfaceRef.current, anchorKey) ??
      findElementByKey(surfaceRef.current, chipKey);
    if (!el) {
      if (!canvasPopoverOpenRef.current) {
        setHoveredKey(null);
        setHoveredRect(null);
      }
      return;
    }
    setHoveredRect(el.getBoundingClientRect());
  }, [
    hoveredKey,
    imageEditKey,
    linkEditKey,
    zoom,
    pan,
    block,
    lang,
    device,
    block.blockType,
  ]);

  // Soft hover ring via DOM attr (avoids Tailwind breakage on keys like features[0].label).
  React.useEffect(() => {
    if (!surfaceRef.current) return;
    const prev = surfaceRef.current.querySelectorAll<HTMLElement>(
      '[data-canvas-hovered="true"]'
    );
    prev.forEach(n => n.removeAttribute('data-canvas-hovered'));
    if (!hoveredKey || !canShowHoverChrome) return;
    if (hoveredKey === selectedElementKey) return;
    const el = findElementByKey(surfaceRef.current, hoveredKey);
    el?.setAttribute('data-canvas-hovered', 'true');
  }, [hoveredKey, canShowHoverChrome, selectedElementKey, block, lang, device]);

  // Drop hover when entering inline edit / tablet / motion preview.
  // Keep chip alive while an image/link popover is open so edit isn't interrupted.
  React.useEffect(() => {
    if (canShowHoverChrome || canvasPopoverOpen) return;
    chipPointerInsideRef.current = false;
    setHoveredKey(null);
    setHoveredRect(null);
    setImageEditKey(null);
    setLinkEditKey(null);
  }, [canShowHoverChrome, canvasPopoverOpen]);

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

    if (device === 'tablet') return; // tablet variant is read-only
    if (e.button !== 0) return; // primary button only
    const target = e.target as HTMLElement;
    const el = target.closest<HTMLElement>('[data-element-key]');
    if (!el || !surfaceRef.current?.contains(el)) return;
    const key = el.getAttribute('data-element-key');
    if (!key || key.startsWith('__')) return; // skip the block background
    // First click selects; a second pointerdown on the SAME selected element
    // initiates the drag. Without this, dragging from a row that wasn't
    // selected yet would feel like an accidental move.
    if (key !== selectedElementKey) return;
    const base = positions?.[key] ?? { x: 0, y: 0 };
    dragRef.current = {
      el,
      key,
      startClientX: e.clientX,
      startClientY: e.clientY,
      baseX: base.x,
      baseY: base.y,
      bounds: computeDragBounds(el, base),
      active: false,
    };
    surfaceRef.current?.setPointerCapture(e.pointerId);
  };

  /**
   * Translate "stay inside the frame" into the offset space the drag writes.
   * `L`/`T` (element position relative to the frame) already include `base`,
   * so the allowed offset is the base shifted by the slack on each side.
   * Returns null when the element is currently outside the frame — an existing
   * design may intentionally park something there, and clamping would move it.
   */
  function computeDragBounds(el: HTMLElement, base: { x: number; y: number }) {
    const frame = innerRef.current;
    if (!frame) return null;
    const fr = frame.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const s = scale || 1;
    if (er.width === 0 && er.height === 0) return null;
    const L = (er.left - fr.left) / s;
    const T = (er.top - fr.top) / s;
    const W = er.width / s;
    const H = er.height / s;
    const frameW = baseWidth;
    const frameH = innerHeight > 0 ? innerHeight : fr.height / s;
    const bounds = {
      minX: base.x + (DRAG_MIN_VISIBLE - W - L),
      maxX: base.x + (frameW - DRAG_MIN_VISIBLE - L),
      minY: base.y + (DRAG_MIN_VISIBLE - H - T),
      maxY: base.y + (frameH - DRAG_MIN_VISIBLE - T),
    };
    const inside =
      base.x >= bounds.minX &&
      base.x <= bounds.maxX &&
      base.y >= bounds.minY &&
      base.y <= bounds.maxY;
    return inside ? bounds : null;
  }

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

    const d = dragRef.current;
    if (d) {
      const dxRaw = e.clientX - d.startClientX;
      const dyRaw = e.clientY - d.startClientY;
      if (!d.active && Math.hypot(dxRaw, dyRaw) < 4) return;
      d.active = true;
      const safeScale = scale || 1;
      const { x, y } = clampDrag(
        d.baseX + dxRaw / safeScale,
        d.baseY + dyRaw / safeScale,
        d.bounds
      );
      // Direct DOM write — no React state during move. React's next render
      // (after pointerup → onCommitElementPosition) will land the same value
      // via positionStyle so there's no visual jump.
      d.el.style.transform = `translate(${x}px, ${y}px)`;
      d.el.style.cursor = 'grabbing';
      clearHover();
      return;
    }

    // Hover → edit chip (skip while chip/popover holds pointer).
    if (!canShowHoverChrome) {
      clearHover();
      return;
    }
    if (chipPointerInsideRef.current || canvasPopoverOpenRef.current) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    // Corridor from element top-right to chip — prevents clear/switch while
    // crossing the gap (sticky nav items sit close; without this the chip
    // jumps away or unmounts before the pointer reaches it).
    if (hoveredKey && hoveredRect) {
      const wideChip = !!resolveSiblingLinkKey(block.blockType, hoveredKey);
      if (isPointerInChipCorridor(clientX, clientY, hoveredRect, wideChip)) {
        cancelHoverClear();
        return;
      }
    }

    const target = e.target as HTMLElement;
    if (target.closest('[data-canvas-edit-chip-root]')) return;
    const el = target.closest<HTMLElement>('[data-element-key]');
    if (el && surfaceRef.current?.contains(el)) {
      const key = el.getAttribute('data-element-key');
      if (key) {
        if (key !== hoveredKey) {
          if (hoveredKey && hoveredRect) {
            const wideChip = !!resolveSiblingLinkKey(
              block.blockType,
              hoveredKey
            );
            if (
              isPointerInChipCorridor(clientX, clientY, hoveredRect, wideChip)
            ) {
              cancelHoverClear();
              return;
            }
          }
          setHoverFromElement(el, key);
        }
        return;
      }
    }
    clearHover();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = panRef.current;
    if (p) {
      panRef.current = null;
      setIsPanning(false);
      surfaceRef.current?.releasePointerCapture?.(e.pointerId);
      if (p.active) justDraggedRef.current = true;
      return;
    }

    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    surfaceRef.current?.releasePointerCapture?.(e.pointerId);
    d.el.style.cursor = '';
    if (!d.active) return; // no real drag — let the click handler select
    const safeScale = scale || 1;
    const pos = clampDrag(
      d.baseX + (e.clientX - d.startClientX) / safeScale,
      d.baseY + (e.clientY - d.startClientY) / safeScale,
      d.bounds
    );
    const x = Math.round(pos.x);
    const y = Math.round(pos.y);
    onCommitElementPosition?.(d.key, { x, y });
    justDraggedRef.current = true;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If the gesture that just ended was a real drag, swallow the synthetic
    // click so selection doesn't toggle off the moved element.
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    // Clicks inside an actively-editing element should NOT change selection
    // (user is positioning caret / selecting text within the editable region).
    if (editingKey) {
      const target = e.target as HTMLElement;
      if (target.closest('[data-inline-editing="true"]')) return;
    }
    // Chip handles its own click via onActivate — don't double-fire.
    if ((e.target as HTMLElement).closest('[data-canvas-edit-chip-root]')) {
      return;
    }
    // Clicks inside the image popover portal must not activate another element.
    if (
      (e.target as HTMLElement).closest('[data-radix-popper-content-wrapper]')
    ) {
      return;
    }

    const target = e.target as HTMLElement;
    const el = target.closest<HTMLElement>('[data-element-key]');
    const key =
      el && surfaceRef.current?.contains(el)
        ? el.getAttribute('data-element-key')
        : null;

    // While image/link popover is open: click elsewhere only dismisses — does NOT
    // activate whatever sits under the pointer (other items need their own
    // hover + click).
    if (imageEditKey) {
      if (key === imageEditKey) return;
      setImageEditKey(null);
      forceClearHover();
      onSelectElement(null, null);
      return;
    }
    if (linkEditKey) {
      const anchorKey = resolveLinkAnchorKey(block.blockType, linkEditKey);
      if (key === linkEditKey || key === anchorKey) return;
      setLinkEditKey(null);
      forceClearHover();
      onSelectElement(null, null);
      return;
    }

    if (key && el) {
      // Exact element under the pointer only — never fall back to another item.
      activateElement(key, el.getBoundingClientRect());
      return;
    }

    // Click outside any element → clear selection; do not touch others.
    setImageEditKey(null);
    setLinkEditKey(null);
    forceClearHover();
    onSelectElement(null, null);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-canvas-edit-chip-root]')) {
      return;
    }
    const target = e.target as HTMLElement;
    const el = target.closest<HTMLElement>('[data-element-key]');
    const key =
      el && surfaceRef.current?.contains(el)
        ? el.getAttribute('data-element-key')
        : null;
    // Exact key only — no lastTextKey / selectedKey fallback onto other items.
    if (!key || !isInlineTextKey(block.blockType, key)) return;
    activateElement(key, el!.getBoundingClientRect());
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
    return Math.min(100, Math.max(20, fitPct));
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

  // Drive contenteditable via DOM when entering edit mode. Pure DOM manipulation
  // keeps each block component dumb (no editing concerns).
  React.useEffect(() => {
    if (!editingKey || !surfaceRef.current) return;
    const el = findElementByKey(surfaceRef.current, editingKey);
    if (!el) return;
    // Chặn lần cuối trước khi gắn contenteditable, cho mọi lối vào inline edit
    // (canvas, chip, panel Lớp) — xem `isMediaOnlyNode`.
    if (isMediaOnlyNode(el)) {
      onCancelInlineEdit();
      return;
    }

    el.setAttribute('contenteditable', 'plaintext-only');
    el.setAttribute('data-inline-editing', 'true');
    el.spellcheck = false;
    el.focus();

    // Select all text so user can immediately overwrite by typing.
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    const commit = () => {
      const next = (el.textContent ?? '').trim();
      onCommitInlineEdit(editingKey, next);
    };
    const cancel = () => onCancelInlineEdit();

    const onBlur = () => commit();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        // Commit on Enter; Shift+Enter inserts a soft newline (browser default).
        e.preventDefault();
        commit();
      }
    };

    el.addEventListener('blur', onBlur);
    el.addEventListener('keydown', onKey);

    return () => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-inline-editing');
      el.removeEventListener('blur', onBlur);
      el.removeEventListener('keydown', onKey);
    };
  }, [editingKey, onCommitInlineEdit, onCancelInlineEdit]);

  // Chip anchors to the hovered element, or the image/link being edited if popover is open.
  const chipDisplayKey =
    imageEditKey ??
    hoveredKey ??
    (linkEditKey ? resolveLinkAnchorKey(block.blockType, linkEditKey) : null);
  const chipRect = React.useMemo(() => {
    if (!chipDisplayKey || !surfaceRef.current) return hoveredRect;
    const anchorKey = resolveLinkAnchorKey(block.blockType, chipDisplayKey);
    if (chipDisplayKey === hoveredKey && hoveredRect) return hoveredRect;
    const el =
      findElementByKey(surfaceRef.current, anchorKey) ??
      findElementByKey(surfaceRef.current, chipDisplayKey);
    return el?.getBoundingClientRect() ?? hoveredRect;
  }, [
    chipDisplayKey,
    hoveredKey,
    hoveredRect,
    zoom,
    pan,
    block,
    lang,
    device,
    block.blockType,
  ]);

  const chipMeta =
    chipDisplayKey && (canShowHoverChrome || canvasPopoverOpen)
      ? resolveElementMeta(block.blockType, chipDisplayKey)
      : null;
  const chipAnchorKey = chipDisplayKey
    ? resolveLinkAnchorKey(block.blockType, chipDisplayKey)
    : null;
  const siblingLinkKey =
    chipAnchorKey && chipMeta?.kind === 'text'
      ? resolveSiblingLinkKey(block.blockType, chipAnchorKey)
      : null;
  const linkFieldKey =
    linkEditKey ??
    (chipMeta?.kind === 'link' ? chipDisplayKey : siblingLinkKey) ??
    chipDisplayKey ??
    '';

  const isOffOrigin = pan.x !== 0 || pan.y !== 0;

  // ── Selection toolbar ─────────────────────────────────────────────────────
  // Docked to a fixed corner of the canvas, NOT anchored to the element rect.
  // An element-anchored bar has to re-measure on zoom, pan, surface scroll and
  // every content keystroke — which reads as the bar jumping around — and for
  // `__background__` the rect is the whole block, parking it off-screen.
  // Style/content controls live in the sidebar inspector; only kinds it handles
  // get this bar, the rest still use the legacy toolbar above the canvas.
  const selectedMeta =
    selectedElementKey && device !== 'tablet'
      ? resolveElementMeta(block.blockType, selectedElementKey)
      : null;

  const showSelectionToolbar =
    !!selectedElementKey &&
    !!selectedMeta &&
    isInspectorKind(selectedMeta.kind) &&
    !editingKey &&
    !selectedExtraElementId &&
    !imageEditKey &&
    !linkEditKey &&
    !!onContentChange &&
    !!onResetElementStyle &&
    !!onUpdateBackground;

  return (
    <div
      ref={surfaceRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={() => {
        if (chipPointerInsideRef.current || canvasPopoverOpen) return;
        clearHover();
      }}
      data-selected-key={selectedElementKey ?? ''}
      className={cn(
        'relative flex flex-1 touch-none overflow-hidden p-8 pb-20',
        OVERLAY_TOP_BLOCK_TYPES.has(block.blockType)
          ? 'items-start justify-center pt-4'
          : 'items-center justify-center',
        '[&_[data-inline-editing=true]]:cursor-text [&_[data-inline-editing=true]]:rounded-sm [&_[data-inline-editing=true]]:bg-sky-50/80 [&_[data-inline-editing=true]]:outline [&_[data-inline-editing=true]]:outline-2 [&_[data-inline-editing=true]]:outline-offset-2 [&_[data-inline-editing=true]]:outline-sky-500',
        '[&_[data-canvas-hovered=true]]:cursor-pointer [&_[data-canvas-hovered=true]]:outline [&_[data-canvas-hovered=true]]:outline-1 [&_[data-canvas-hovered=true]]:outline-offset-2 [&_[data-canvas-hovered=true]]:outline-sky-400/70',
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
                'relative w-full overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-black/5',
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
                onSelect={id => onSelectExtraElement?.(id)}
                onCommitPosition={(id, pos) =>
                  onCommitExtraElementPosition?.(id, pos)
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
          'absolute bottom-3 left-3 z-30 flex cursor-pointer items-center gap-1.5 rounded-md border bg-white/95 px-2.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur transition-colors',
          isOffOrigin
            ? 'border-sky-300 text-sky-700 hover:bg-sky-50'
            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
        )}
      >
        <LocateFixed className='size-3.5' />
        Về giữa
      </button>

      {(chipDisplayKey &&
        chipRect &&
        chipMeta &&
        surfaceRef.current &&
        (canShowHoverChrome || canvasPopoverOpen) && (
          <CanvasElementEditChip
            elementKey={chipDisplayKey}
            meta={chipMeta}
            rect={chipRect}
            surfaceEl={surfaceRef.current}
            content={content}
            blockType={block.blockType}
            imageOpen={imageEditKey === chipDisplayKey}
            onImageOpenChange={open => {
              if (open) {
                setImageEditKey(chipDisplayKey);
                onSelectElement(chipDisplayKey, chipRect);
              } else {
                setImageEditKey(null);
                if (!chipPointerInsideRef.current) {
                  forceClearHover();
                }
              }
            }}
            linkOpen={linkPopoverOpen}
            onLinkOpenChange={open => {
              if (!open) {
                setLinkEditKey(null);
                if (!chipPointerInsideRef.current) {
                  forceClearHover();
                }
              }
            }}
            linkFieldKey={linkFieldKey}
            siblingLinkKey={siblingLinkKey}
            onOpenLink={key => openLinkEditor(key, chipRect)}
            onActivate={key => {
              const anchorKey = resolveLinkAnchorKey(block.blockType, key);
              const el = surfaceRef.current
                ? (findElementByKey(surfaceRef.current, anchorKey) ??
                  findElementByKey(surfaceRef.current, key))
                : null;
              const rect = el?.getBoundingClientRect() ?? chipRect;
              activateElement(key, rect);
            }}
            onContentChange={next => onContentChange?.(next)}
            onChipPointerEnter={() => {
              cancelHoverClear();
              chipPointerInsideRef.current = true;
            }}
            onChipPointerLeave={() => {
              chipPointerInsideRef.current = false;
              if (!canvasPopoverOpen) {
                clearHover();
              }
            }}
          />
        )) ||
        null}

      {showSelectionToolbar && (
        <div
          data-canvas-edit-chip-root='true'
          className='absolute top-3 left-3 z-30'
          // A bare pointerdown out here reads as "empty canvas" and starts a pan.
          onPointerDown={e => e.stopPropagation()}
        >
          <SelectionToolbar
            block={block}
            lang={lang}
            content={content}
            selectedKey={selectedElementKey!}
            kind={selectedMeta!.kind}
            label={selectedMeta!.label}
            onContentChange={onContentChange!}
            onUpdateBackground={onUpdateBackground!}
            onResetStyle={onResetElementStyle!}
            onClose={() => onSelectElement(null, null)}
          />
        </div>
      )}
    </div>
  );
}
