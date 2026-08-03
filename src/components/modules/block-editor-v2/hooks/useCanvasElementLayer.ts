'use client';

/**
 * Every element-level interaction on a canvas surface: hover ring + edit chip,
 * click/double-click activation, free-drag, and the DOM-driven inline text
 * editor.
 *
 * Extracted from `BlockPreview` so the single-block artboard and the full-page
 * stage (`PageCanvas`) run the exact same interaction model instead of two
 * drifting copies. Everything the logic needs to know about *which* block it is
 * touching arrives through the resolver callbacks — the hook itself never
 * assumes there is only one block on screen.
 *
 * The two rules that make the multi-block case correct:
 *   1. every key lookup is scoped to the owning block's root element, because
 *      keys like `title` repeat in every block on the page;
 *   2. every callback carries the block id, because a commit (blur, pointerup)
 *      can land *after* the user has already clicked into another block.
 */

import * as React from 'react';

import {
  isInlineTextKey,
  resolveElementMeta,
  resolveLinkAnchorKey,
  resolveSiblingLinkKey,
  type ResolvedElementMeta,
} from '../resolveElementKind';
import { isInspectorKind } from '../inspector/kinds';
import type { EditorMode } from '@/components/modules/block-editor/motion/types';
import type {
  Block,
  BlockBackground,
  BlockContent,
  Device,
  ElementPositionsMap,
  Lang,
} from '@/components/modules/block-editor/types';

/**
 * Free-drag guard: an element must keep at least this many (unscaled) px
 * inside its block frame. Without it a drag can park content far outside the
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
 * Resolve a canvas element by key **within one block**. When a block
 * duplicates the same `data-element-key` across responsive variants (one
 * hidden via CSS), prefer the node that currently has a layout box so
 * hover/chip/inline-edit bind to the visible instance — not the first match in
 * DOM order.
 */
function findElementByKey(root: HTMLElement, key: string): HTMLElement | null {
  const nodes = root.querySelectorAll<HTMLElement>(
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

/** An element identified by its owning block — the unit this hook works in. */
export interface CanvasElementRef {
  blockId: string;
  key: string;
}

const sameRef = (a: CanvasElementRef | null, b: CanvasElementRef | null) =>
  !!a && !!b && a.blockId === b.blockId && a.key === b.key;

/** A `[data-element-key]` node resolved back to the block that owns it. */
export interface CanvasElementTarget {
  block: Block;
  key: string;
  el: HTMLElement;
  /** Scopes key lookups and free-drag bounds for this block. */
  root: HTMLElement;
}

export interface UseCanvasElementLayerOptions {
  /** The scrollable/pannable surface — pointer capture + chip positioning. */
  surfaceRef: React.RefObject<HTMLElement | null>;
  lang: Lang;
  device: Device;
  motionMode: EditorMode;
  /** Zoom %, so drag deltas map to unscaled block coordinates. */
  zoom: number;
  /** Pan offset (artboard only) — chip anchors re-measure when it moves. */
  panX?: number;
  panY?: number;
  /** Any value whose identity changes when block data changes — re-measures
   *  chip anchors after an edit reflows the layout. */
  dataToken?: unknown;
  selectedBlockId: string | null;
  selectedElementKey: string | null;
  editingKey: string | null;
  /** Pan / space-drag in progress — suppresses all hover chrome. */
  interactionsSuspended?: boolean;
  /** Another surface owns the toolbar right now (an extra element is
   *  selected), so the element selection toolbar must stay hidden. */
  selectionToolbarSuppressed?: boolean;

  /** Map a `[data-element-key]` node back to its block. */
  resolveTarget: (el: HTMLElement) => CanvasElementTarget | null;
  blockById: (blockId: string) => Block | null;
  /** Element that scopes key lookups for a block (its frame/root node). */
  blockRoot: (blockId: string) => HTMLElement | null;
  /** Content for the variant currently being edited. */
  contentOf: (block: Block) => BlockContent;
  positionsOf: (block: Block) => ElementPositionsMap | undefined;

  onSelectElement: (
    blockId: string | null,
    key: string | null,
    rect: DOMRect | null
  ) => void;
  onStartInlineEdit: (blockId: string, key: string) => void;
  onCommitInlineEdit: (blockId: string, key: string, value: string) => void;
  onCancelInlineEdit: () => void;
  onCommitElementPosition?: (
    blockId: string,
    key: string,
    pos: { x: number; y: number }
  ) => void;
  onContentChange?: (
    blockId: string,
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
  onResetElementStyle?: (blockId: string, key: string) => void;
  onUpdateBackground?: (
    blockId: string,
    next: BlockBackground | undefined
  ) => void;
}

/** Everything `CanvasElementChrome` needs to render the floating edit chip. */
export interface CanvasChipState {
  elementKey: string;
  meta: ResolvedElementMeta;
  rect: DOMRect;
  surfaceEl: HTMLElement;
  content: BlockContent;
  blockType: Block['blockType'];
  imageOpen: boolean;
  linkOpen: boolean;
  linkFieldKey: string;
  siblingLinkKey: string | null;
  onImageOpenChange: (open: boolean) => void;
  onLinkOpenChange: (open: boolean) => void;
  onOpenLink: (key: string) => void;
  onActivate: (key: string) => void;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
  onChipPointerEnter: () => void;
  onChipPointerLeave: () => void;
}

/** Everything `CanvasElementChrome` needs to render the selection toolbar. */
export interface CanvasSelectionToolbarState {
  block: Block;
  lang: Lang;
  content: BlockContent;
  selectedKey: string;
  kind: ResolvedElementMeta['kind'];
  label: string;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
  onUpdateBackground: (next: BlockBackground | undefined) => void;
  onResetStyle: () => void;
  onClose: () => void;
}

export interface CanvasElementLayer {
  /** Spread onto the canvas surface. Pan handling (artboard) runs first and
   *  delegates here; page mode passes them straight through. */
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerLeave: () => void;
  /** True while an image/link popover is open — hover must not be cleared. */
  popoverOpen: boolean;
  /** Tell the layer a pan gesture just ended so the synthetic click that
   *  follows doesn't clear the selection. */
  markDragged: () => void;
  chip: CanvasChipState | null;
  selectionToolbar: CanvasSelectionToolbarState | null;
}

export function useCanvasElementLayer(
  opts: UseCanvasElementLayerOptions
): CanvasElementLayer {
  const optsRef = React.useRef(opts);
  optsRef.current = opts;

  const {
    surfaceRef,
    lang,
    device,
    motionMode,
    zoom,
    panX = 0,
    panY = 0,
    dataToken,
    selectedBlockId,
    selectedElementKey,
    editingKey,
    interactionsSuspended = false,
  } = opts;

  const scale = zoom / 100;

  // ── Hover + popover state ────────────────────────────────────────────
  const [hovered, setHovered] = React.useState<CanvasElementRef | null>(null);
  const [hoveredRect, setHoveredRect] = React.useState<DOMRect | null>(null);
  /** Image field currently showing the upload popover (opened by click). */
  const [imageEdit, setImageEdit] = React.useState<CanvasElementRef | null>(
    null
  );
  /** Link field currently showing the link picker popover (opened by click). */
  const [linkEdit, setLinkEdit] = React.useState<CanvasElementRef | null>(null);
  const chipPointerInsideRef = React.useRef(false);
  const hoverClearTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  /** Block that owns the in-flight inline edit. A ref, not state: it is set
   *  synchronously before the parent flips `editingKey`, and the effect that
   *  wires `contenteditable` reads it on the very next commit. */
  const editingBlockIdRef = React.useRef<string | null>(null);

  const popoverOpen = imageEdit !== null || linkEdit !== null;
  const popoverOpenRef = React.useRef(popoverOpen);
  popoverOpenRef.current = popoverOpen;

  const canShowHoverChrome =
    device !== 'tablet' &&
    !editingKey &&
    motionMode !== 'preview' &&
    !interactionsSuspended;

  const blockTypeOf = React.useCallback(
    (blockId: string): Block['blockType'] | null =>
      optsRef.current.blockById(blockId)?.blockType ?? null,
    []
  );

  /** Resolve a ref to its live DOM node, scoped to the owning block. */
  const nodeFor = React.useCallback(
    (ref: CanvasElementRef | null): HTMLElement | null => {
      if (!ref) return null;
      const root = optsRef.current.blockRoot(ref.blockId);
      return root ? findElementByKey(root, ref.key) : null;
    },
    []
  );

  const cancelHoverClear = React.useCallback(() => {
    if (hoverClearTimerRef.current == null) return;
    clearTimeout(hoverClearTimerRef.current);
    hoverClearTimerRef.current = null;
  }, []);

  // Delay clear so the pointer can cross the gap between element → chip
  // without the chip unmounting mid-travel.
  const clearHover = React.useCallback(() => {
    if (chipPointerInsideRef.current || popoverOpenRef.current) return;
    cancelHoverClear();
    hoverClearTimerRef.current = setTimeout(() => {
      hoverClearTimerRef.current = null;
      if (chipPointerInsideRef.current || popoverOpenRef.current) return;
      setHovered(null);
      setHoveredRect(null);
    }, 160);
  }, [cancelHoverClear]);

  const forceClearHover = React.useCallback(() => {
    cancelHoverClear();
    chipPointerInsideRef.current = false;
    setHovered(null);
    setHoveredRect(null);
  }, [cancelHoverClear]);

  const setHoverFromElement = React.useCallback(
    (el: HTMLElement, ref: CanvasElementRef) => {
      cancelHoverClear();
      setHovered(ref);
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
    (blockId: string, key: string, rect: DOMRect) => {
      const o = optsRef.current;
      if (o.device === 'tablet' || o.motionMode === 'preview') return;
      const blockType = blockTypeOf(blockId);
      if (!blockType) return;

      const ref = { blockId, key };
      const meta = resolveElementMeta(blockType, key);
      o.onSelectElement(blockId, key, rect);
      setHovered(ref);
      setHoveredRect(rect);

      if (meta.kind === 'text') {
        setImageEdit(null);
        setLinkEdit(null);
        if (isInlineTextKey(blockType, key)) {
          editingBlockIdRef.current = blockId;
          o.onStartInlineEdit(blockId, key);
        }
        return;
      }

      if (meta.kind === 'image') {
        setLinkEdit(null);
        setImageEdit(ref);
        return;
      }

      if (meta.kind === 'link') {
        setImageEdit(null);
        setLinkEdit(ref);
        return;
      }

      // background / complex arrays → select so the inspector shows controls
      setImageEdit(null);
      setLinkEdit(null);
    },
    [blockTypeOf]
  );

  const openLinkEditor = React.useCallback(
    (blockId: string, key: string, rect: DOMRect) => {
      const o = optsRef.current;
      if (o.device === 'tablet' || o.motionMode === 'preview') return;
      const blockType = blockTypeOf(blockId);
      if (!blockType) return;
      setImageEdit(null);
      setLinkEdit({ blockId, key });
      o.onSelectElement(blockId, key, rect);
      const anchorKey = resolveLinkAnchorKey(blockType, key);
      if (anchorKey !== key) {
        setHovered({ blockId, key: anchorKey });
        setHoveredRect(rect);
      }
    },
    [blockTypeOf]
  );

  // Chip anchors to the hovered element, or the image/link being edited if a
  // popover holds it open.
  const chipRef: CanvasElementRef | null = React.useMemo(() => {
    if (imageEdit) return imageEdit;
    if (hovered) return hovered;
    if (!linkEdit) return null;
    const blockType = blockTypeOf(linkEdit.blockId);
    return blockType
      ? {
          blockId: linkEdit.blockId,
          key: resolveLinkAnchorKey(blockType, linkEdit.key),
        }
      : null;
  }, [imageEdit, hovered, linkEdit, blockTypeOf]);

  // Remeasure chip anchor when zoom/pan/content shifts under a sticky hover.
  React.useEffect(() => {
    if (!chipRef) return;
    const blockType = blockTypeOf(chipRef.blockId);
    const root = optsRef.current.blockRoot(chipRef.blockId);
    if (!blockType || !root) return;
    const anchorKey = resolveLinkAnchorKey(blockType, chipRef.key);
    const el =
      findElementByKey(root, anchorKey) ?? findElementByKey(root, chipRef.key);
    if (!el) {
      if (!popoverOpenRef.current) {
        setHovered(null);
        setHoveredRect(null);
      }
      return;
    }
    setHoveredRect(el.getBoundingClientRect());
  }, [chipRef, blockTypeOf, zoom, panX, panY, dataToken, lang, device]);

  // Soft hover ring via DOM attr (avoids Tailwind breakage on keys like
  // `features[0].label`).
  React.useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const prev = surface.querySelectorAll<HTMLElement>(
      '[data-canvas-hovered="true"]'
    );
    prev.forEach(n => n.removeAttribute('data-canvas-hovered'));
    if (!hovered || !canShowHoverChrome) return;
    if (
      hovered.blockId === selectedBlockId &&
      hovered.key === selectedElementKey
    ) {
      return;
    }
    nodeFor(hovered)?.setAttribute('data-canvas-hovered', 'true');
  }, [
    hovered,
    canShowHoverChrome,
    selectedBlockId,
    selectedElementKey,
    nodeFor,
    surfaceRef,
    dataToken,
    lang,
    device,
  ]);

  // Drop hover when entering inline edit / tablet / motion preview.
  // Keep the chip alive while an image/link popover is open so edit isn't
  // interrupted.
  React.useEffect(() => {
    if (canShowHoverChrome || popoverOpen) return;
    chipPointerInsideRef.current = false;
    setHovered(null);
    setHoveredRect(null);
    setImageEdit(null);
    setLinkEdit(null);
  }, [canShowHoverChrome, popoverOpen]);

  // ── Free-form drag (Figma-style) ─────────────────────────────────────
  // Pointer is captured to the surface so the drag survives the cursor
  // wandering across other elements. Coordinates are stored in unscaled CSS
  // pixels — we divide by `scale` so a 100px drag at 50% zoom moves the
  // element 200px in its own coord space, matching how the user perceives it.
  const dragRef = React.useRef<{
    el: HTMLElement;
    blockId: string;
    key: string;
    startClientX: number;
    startClientY: number;
    baseX: number;
    baseY: number;
    /** Allowed x/y range so the element keeps `DRAG_MIN_VISIBLE` px inside its
     *  block frame. Null when the element already sits outside — clamping it
     *  then would yank it back on the first pixel of drag. */
    bounds: { minX: number; maxX: number; minY: number; maxY: number } | null;
    active: boolean;
  } | null>(null);
  // Set true on pointerup of a real drag (or pan); consumed by the next click
  // so a drag doesn't also toggle element selection.
  const justDraggedRef = React.useRef(false);

  /**
   * Translate "stay inside the frame" into the offset space the drag writes.
   * `L`/`T` (element position relative to the frame) already include `base`,
   * so the allowed offset is the base shifted by the slack on each side.
   * Returns null when the element is currently outside the frame — an existing
   * design may intentionally park something there, and clamping would move it.
   */
  const computeDragBounds = React.useCallback(
    (
      el: HTMLElement,
      frame: HTMLElement | null,
      base: { x: number; y: number }
    ) => {
      if (!frame) return null;
      const fr = frame.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const s = scale || 1;
      if (er.width === 0 && er.height === 0) return null;
      const L = (er.left - fr.left) / s;
      const T = (er.top - fr.top) / s;
      const W = er.width / s;
      const H = er.height / s;
      const frameW = fr.width / s;
      const frameH = fr.height / s;
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
    },
    [scale]
  );

  const targetFromEvent = React.useCallback(
    (node: EventTarget | null): CanvasElementTarget | null => {
      if (!(node instanceof HTMLElement)) return null;
      const el = node.closest<HTMLElement>('[data-element-key]');
      if (!el || !surfaceRef.current?.contains(el)) return null;
      return optsRef.current.resolveTarget(el);
    },
    [surfaceRef]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (editingKey) return;
    if (device === 'tablet') return; // tablet variant is read-only
    if (e.button !== 0) return; // primary button only
    const target = targetFromEvent(e.target);
    if (!target) return;
    if (target.key.startsWith('__')) return; // skip the block background
    // First click selects; a second pointerdown on the SAME selected element
    // initiates the drag. Without this, dragging from a row that wasn't
    // selected yet would feel like an accidental move.
    if (
      target.key !== selectedElementKey ||
      target.block.id !== selectedBlockId
    ) {
      return;
    }
    const base = optsRef.current.positionsOf(target.block)?.[target.key] ?? {
      x: 0,
      y: 0,
    };
    dragRef.current = {
      el: target.el,
      blockId: target.block.id,
      key: target.key,
      startClientX: e.clientX,
      startClientY: e.clientY,
      baseX: base.x,
      baseY: base.y,
      bounds: computeDragBounds(target.el, target.root, base),
      active: false,
    };
    surfaceRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
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
    if (chipPointerInsideRef.current || popoverOpenRef.current) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    // Corridor from element top-right to chip — prevents clear/switch while
    // crossing the gap (sticky nav items sit close; without this the chip
    // jumps away or unmounts before the pointer reaches it).
    const inCorridor = () => {
      if (!hovered || !hoveredRect) return false;
      const blockType = blockTypeOf(hovered.blockId);
      const wideChip = blockType
        ? !!resolveSiblingLinkKey(blockType, hovered.key)
        : false;
      return isPointerInChipCorridor(clientX, clientY, hoveredRect, wideChip);
    };

    if (inCorridor()) {
      cancelHoverClear();
      return;
    }

    if ((e.target as HTMLElement).closest?.('[data-canvas-edit-chip-root]')) {
      return;
    }
    const target = targetFromEvent(e.target);
    if (target) {
      const ref = { blockId: target.block.id, key: target.key };
      if (!sameRef(ref, hovered)) {
        if (inCorridor()) {
          cancelHoverClear();
          return;
        }
        setHoverFromElement(target.el, ref);
      }
      return;
    }
    clearHover();
  };

  const onPointerUp = (e: React.PointerEvent) => {
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
    optsRef.current.onCommitElementPosition?.(d.blockId, d.key, {
      x: Math.round(pos.x),
      y: Math.round(pos.y),
    });
    justDraggedRef.current = true;
  };

  const onClick = (e: React.MouseEvent) => {
    // If the gesture that just ended was a real drag, swallow the synthetic
    // click so selection doesn't toggle off the moved element.
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    const node = e.target as HTMLElement;
    // Clicks inside an actively-editing element should NOT change selection
    // (user is positioning caret / selecting text within the editable region).
    if (editingKey && node.closest('[data-inline-editing="true"]')) return;
    // Chip handles its own click via onActivate — don't double-fire.
    if (node.closest('[data-canvas-edit-chip-root]')) return;
    // Clicks inside the image popover portal must not activate another element.
    if (node.closest('[data-radix-popper-content-wrapper]')) return;

    const target = targetFromEvent(node);
    const ref = target ? { blockId: target.block.id, key: target.key } : null;

    // While an image/link popover is open: click elsewhere only dismisses — it
    // does NOT activate whatever sits under the pointer (other items need
    // their own hover + click).
    if (imageEdit) {
      if (sameRef(ref, imageEdit)) return;
      setImageEdit(null);
      forceClearHover();
      optsRef.current.onSelectElement(null, null, null);
      return;
    }
    if (linkEdit) {
      const blockType = blockTypeOf(linkEdit.blockId);
      const anchorRef: CanvasElementRef | null = blockType
        ? {
            blockId: linkEdit.blockId,
            key: resolveLinkAnchorKey(blockType, linkEdit.key),
          }
        : null;
      if (sameRef(ref, linkEdit) || sameRef(ref, anchorRef)) return;
      setLinkEdit(null);
      forceClearHover();
      optsRef.current.onSelectElement(null, null, null);
      return;
    }

    if (target) {
      // Exact element under the pointer only — never fall back to another item.
      activateElement(
        target.block.id,
        target.key,
        target.el.getBoundingClientRect()
      );
      return;
    }

    // Click outside any element → clear selection; do not touch others.
    setImageEdit(null);
    setLinkEdit(null);
    forceClearHover();
    optsRef.current.onSelectElement(null, null, null);
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const node = e.target as HTMLElement;
    if (node.closest('[data-canvas-edit-chip-root]')) return;
    const target = targetFromEvent(node);
    if (!target) return;
    // Exact key only — no lastTextKey / selectedKey fallback onto other items.
    if (!isInlineTextKey(target.block.blockType, target.key)) return;
    activateElement(
      target.block.id,
      target.key,
      target.el.getBoundingClientRect()
    );
  };

  const onPointerLeave = () => {
    if (chipPointerInsideRef.current || popoverOpen) return;
    clearHover();
  };

  // Drive contenteditable via DOM when entering edit mode. Pure DOM
  // manipulation keeps each block component dumb (no editing concerns).
  React.useEffect(() => {
    if (!editingKey) return;
    const blockId =
      editingBlockIdRef.current ?? optsRef.current.selectedBlockId;
    if (!blockId) return;
    const root = optsRef.current.blockRoot(blockId);
    if (!root) return;
    const el = findElementByKey(root, editingKey);
    if (!el) return;

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
      optsRef.current.onCommitInlineEdit(blockId, editingKey, next);
    };

    const onBlur = () => commit();
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        optsRef.current.onCancelInlineEdit();
      } else if (ev.key === 'Enter' && !ev.shiftKey) {
        // Commit on Enter; Shift+Enter inserts a soft newline (browser default).
        ev.preventDefault();
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
      editingBlockIdRef.current = null;
    };
  }, [editingKey]);

  // ── Chip + selection toolbar props ───────────────────────────────────
  const chipBlock = chipRef ? opts.blockById(chipRef.blockId) : null;
  const chipRect = React.useMemo(() => {
    if (!chipRef || !chipBlock) return hoveredRect;
    if (sameRef(chipRef, hovered) && hoveredRect) return hoveredRect;
    const root = optsRef.current.blockRoot(chipRef.blockId);
    if (!root) return hoveredRect;
    const anchorKey = resolveLinkAnchorKey(chipBlock.blockType, chipRef.key);
    const el =
      findElementByKey(root, anchorKey) ?? findElementByKey(root, chipRef.key);
    return el?.getBoundingClientRect() ?? hoveredRect;
    // `dataToken`/`zoom`/`panX`/`panY` are layout inputs — the rect is stale
    // without them even though they aren't referenced directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chipRef,
    chipBlock,
    hovered,
    hoveredRect,
    zoom,
    panX,
    panY,
    dataToken,
    lang,
    device,
  ]);

  const surfaceEl = surfaceRef.current;

  let chip: CanvasChipState | null = null;
  if (
    chipRef &&
    chipBlock &&
    chipRect &&
    surfaceEl &&
    (canShowHoverChrome || popoverOpen)
  ) {
    const blockId = chipRef.blockId;
    const blockType = chipBlock.blockType;
    const meta = resolveElementMeta(blockType, chipRef.key);
    const anchorKey = resolveLinkAnchorKey(blockType, chipRef.key);
    const siblingLinkKey =
      meta.kind === 'text' ? resolveSiblingLinkKey(blockType, anchorKey) : null;
    const linkFieldKey =
      linkEdit?.key ??
      (meta.kind === 'link' ? chipRef.key : siblingLinkKey) ??
      chipRef.key;

    chip = {
      elementKey: chipRef.key,
      meta,
      rect: chipRect,
      surfaceEl,
      content: opts.contentOf(chipBlock),
      blockType,
      imageOpen: sameRef(imageEdit, chipRef),
      linkOpen: linkEdit !== null,
      linkFieldKey,
      siblingLinkKey,
      onImageOpenChange: open => {
        if (open) {
          setImageEdit(chipRef);
          optsRef.current.onSelectElement(blockId, chipRef.key, chipRect);
        } else {
          setImageEdit(null);
          if (!chipPointerInsideRef.current) forceClearHover();
        }
      },
      onLinkOpenChange: open => {
        if (open) return;
        setLinkEdit(null);
        if (!chipPointerInsideRef.current) forceClearHover();
      },
      onOpenLink: key => openLinkEditor(blockId, key, chipRect),
      onActivate: key => {
        const root = optsRef.current.blockRoot(blockId);
        const anchor = resolveLinkAnchorKey(blockType, key);
        const el = root
          ? (findElementByKey(root, anchor) ?? findElementByKey(root, key))
          : null;
        activateElement(blockId, key, el?.getBoundingClientRect() ?? chipRect);
      },
      onContentChange: next => optsRef.current.onContentChange?.(blockId, next),
      onChipPointerEnter: () => {
        cancelHoverClear();
        chipPointerInsideRef.current = true;
      },
      onChipPointerLeave: () => {
        chipPointerInsideRef.current = false;
        if (!popoverOpen) clearHover();
      },
    };
  }

  const selectedBlock = selectedBlockId
    ? opts.blockById(selectedBlockId)
    : null;
  const selectedMeta =
    selectedBlock && selectedElementKey && device !== 'tablet'
      ? resolveElementMeta(selectedBlock.blockType, selectedElementKey)
      : null;

  const selectionToolbar: CanvasSelectionToolbarState | null =
    selectedBlock &&
    selectedElementKey &&
    selectedMeta &&
    isInspectorKind(selectedMeta.kind) &&
    !opts.selectionToolbarSuppressed &&
    !editingKey &&
    !imageEdit &&
    !linkEdit &&
    opts.onContentChange &&
    opts.onResetElementStyle &&
    opts.onUpdateBackground
      ? {
          block: selectedBlock,
          lang,
          content: opts.contentOf(selectedBlock),
          selectedKey: selectedElementKey,
          kind: selectedMeta.kind,
          label: selectedMeta.label,
          onContentChange: next =>
            optsRef.current.onContentChange?.(selectedBlock.id, next),
          onUpdateBackground: next =>
            optsRef.current.onUpdateBackground?.(selectedBlock.id, next),
          onResetStyle: () =>
            optsRef.current.onResetElementStyle?.(
              selectedBlock.id,
              selectedElementKey
            ),
          onClose: () => optsRef.current.onSelectElement(null, null, null),
        }
      : null;

  return {
    onClick,
    onDoubleClick,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    popoverOpen,
    markDragged: () => {
      justDraggedRef.current = true;
    },
    chip,
    selectionToolbar,
  };
}
