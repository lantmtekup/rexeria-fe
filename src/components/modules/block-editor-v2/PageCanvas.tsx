'use client';

/**
 * The full-page canvas: every block of the active page stacked into one
 * continuous landing page that is edited in place.
 *
 * The artboard (`BlockPreview`) shows one block at a time and is still the
 * right tool for zooming into a single section; this surface answers the other
 * question — "what does the page actually look like?" — without giving up
 * click-to-select, inline text edit, the image/link chip or free-drag. Both
 * modes run the exact same interaction model through `useCanvasElementLayer`.
 *
 * Blocks keep rendering their `useIsCanvasEdit` branch here (the page root
 * carries `data-testid="active-block-preview"`), so sticky/pin stages stay
 * flattened. That is what makes the page both scrollable at a sane length and
 * safe to `transform: scale()` for zoom — a real sticky stage mis-measures
 * inside a scaled ancestor (docs/landing-motion-foundation.md §5).
 */

import * as React from 'react';

import { brandKitToCssVars, DEFAULT_PREVIEW_KIT } from '@/lib/brand-kit';
import { cn } from '@/lib/cn';

import {
  CanvasElementChip,
  CanvasSelectionToolbarDock,
} from './CanvasElementChrome';
import { CANVAS_SURFACE_CHROME_CLASS } from './canvasSurfaceClass';
import { clampCanvasZoom } from './canvasZoom';
import { ExtraElementOverlay } from './ExtraElementOverlay';
import {
  PageCanvasBlockFrame,
  type PageCanvasBlockActions,
} from './PageCanvasBlockFrame';
import { useCanvasElementLayer } from './hooks/useCanvasElementLayer';
import { DEVICE_FRAME_WIDTH } from '@/components/modules/block-editor/deviceFrame';
import { RenderBlock } from '@/components/modules/block-editor/blocks/renderBlock';
import { LinkNav } from '@/components/modules/block-editor/links/LinkNav';
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

interface PageCanvasProps {
  /** Every block of the active page, in order. Hidden ones included. */
  blocks: Block[];
  activeBlockId: string | null;
  lang: Lang;
  device: Device;
  zoom: number;
  selectedElementKey: string | null;
  editingKey: string | null;
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
  blockActions: PageCanvasBlockActions;
  motionMode?: EditorMode;
  motionPreviewNonce?: number;
  motionPreviewElement?: string | null;
  /** Fit the WHOLE page on mount / device change — same contract as the
   *  artboard, but contained on both axes rather than width only. */
  onAutoFitZoom?: (percentage: number, force?: boolean) => void;
  onZoomChange?: (zoom: number) => void;
  fitRequestKey?: number;
  selectedExtraElementId?: string | null;
  onSelectExtraElement?: (blockId: string, id: string | null) => void;
  onCommitExtraElementPosition?: (
    blockId: string,
    id: string,
    pos: { x: number; y: number }
  ) => void;
}

/**
 * Mirror the `p-8 pb-20` on the surface. Fit measures against the padded box,
 * and the zoom anchor math needs the page wrapper's offset inside it.
 */
const SURFACE_PAD_X = 64;
const SURFACE_PAD_LEFT = 32;
const SURFACE_PAD_TOP = 32;
const SURFACE_PAD_BOTTOM = 80;

export function PageCanvas({
  blocks,
  activeBlockId,
  lang,
  device,
  zoom,
  selectedElementKey,
  editingKey,
  onSelectElement,
  onStartInlineEdit,
  onCommitInlineEdit,
  onCancelInlineEdit,
  onCommitElementPosition,
  onContentChange,
  onResetElementStyle,
  onUpdateBackground,
  blockActions,
  motionMode = 'edit',
  motionPreviewNonce = 0,
  motionPreviewElement = null,
  onAutoFitZoom,
  onZoomChange,
  fitRequestKey = 0,
  selectedExtraElementId = null,
  onSelectExtraElement,
  onCommitExtraElementPosition,
}: PageCanvasProps) {
  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const pageRef = React.useRef<HTMLDivElement>(null);
  /** Sizing wrapper (`mx-auto`) — the wheel-zoom gesture resizes it directly. */
  const sizerRef = React.useRef<HTMLDivElement>(null);
  const [pageHeight, setPageHeight] = React.useState(0);
  const pageHeightRef = React.useRef(0);

  const baseWidth = DEVICE_FRAME_WIDTH[device];
  const baseWidthRef = React.useRef(baseWidth);
  baseWidthRef.current = baseWidth;
  const scale = zoom / 100;

  /**
   * True once the author has driven the viewport themselves (wheel, pan,
   * click). Gates the auto-fit: before any interaction the fit may re-run as
   * late-loading images grow the page; after it, never yank the view again.
   */
  const interactedRef = React.useRef(false);

  // ── Canvas pan (Figma-style, same gestures as the block artboard) ──────
  // Pan moves the REAL scroll offsets rather than a translate: this surface
  // is the scroller that pin/scrub motion measures against.
  const [spaceHeld, setSpaceHeld] = React.useState(false);
  const [isPanning, setIsPanning] = React.useState(false);
  const panRef = React.useRef<{
    startClientX: number;
    startClientY: number;
    baseLeft: number;
    baseTop: number;
    active: boolean;
  } | null>(null);

  const blockById = React.useCallback(
    (id: string) => blocks.find(b => b.id === id) ?? null,
    [blocks]
  );

  const blockRoot = React.useCallback((id: string) => {
    const surface = surfaceRef.current;
    if (!surface) return null;
    return surface.querySelector<HTMLElement>(
      `[data-block-id="${CSS.escape(id)}"]`
    );
  }, []);

  const contentOf = React.useCallback(
    (block: Block) => {
      const langContent = lang === 'vi' ? block.contentVi : block.contentEn;
      return readVariant(langContent, device) ?? langContent.desktop;
    },
    [lang, device]
  );

  const positionsOf = React.useCallback(
    (block: Block) => readVariant(block.elementPositions, device),
    [device]
  );

  const layer = useCanvasElementLayer({
    surfaceRef,
    lang,
    device,
    motionMode,
    zoom,
    dataToken: blocks,
    selectedBlockId: selectedElementKey ? activeBlockId : null,
    selectedElementKey,
    editingKey,
    interactionsSuspended: spaceHeld || isPanning,
    selectionToolbarSuppressed: !!selectedExtraElementId,
    resolveTarget: el => {
      const key = el.getAttribute('data-element-key');
      const root = el.closest<HTMLElement>('[data-block-id]');
      const id = root?.getAttribute('data-block-id');
      const block = id ? blockById(id) : null;
      if (!key || !root || !block) return null;
      return { block, key, el, root };
    },
    blockById,
    blockRoot,
    contentOf,
    positionsOf,
    onSelectElement,
    onStartInlineEdit,
    onCommitInlineEdit,
    onCancelInlineEdit,
    onCommitElementPosition,
    onContentChange,
    onResetElementStyle,
    onUpdateBackground,
  });

  // Measure the page so the zoom wrapper can reserve `height × scale` in
  // layout — without it the scrollbar describes the unscaled height and the
  // surface scrolls far past the end of the page at 50% zoom.
  React.useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const measure = () => {
      pageHeightRef.current = el.offsetHeight;
      setPageHeight(el.offsetHeight);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [blocks, lang, device]);

  /**
   * Left edge of the page wrapper inside the scrolled content. The wrapper is
   * `mx-auto`, so it recentres as the scaled width changes — the anchor math
   * has to account for that or zooming drifts sideways.
   */
  const wrapperLeftAt = React.useCallback(
    (s: number) => {
      const surface = surfaceRef.current;
      if (!surface) return SURFACE_PAD_LEFT;
      const slack = surface.clientWidth - SURFACE_PAD_X - baseWidth * s;
      return SURFACE_PAD_LEFT + Math.max(0, slack / 2);
    },
    [baseWidth]
  );
  // The wheel listener is bound once with `[]` — it reads the live math
  // through this ref instead of re-binding on device change.
  const wrapperLeftAtRef = React.useRef(wrapperLeftAt);
  wrapperLeftAtRef.current = wrapperLeftAt;

  /**
   * Viewport as of the last committed zoom. Once React re-renders at the new
   * scale the pre-zoom scroll offsets are gone, and they are exactly what the
   * anchor math needs — so they are mirrored here on every scroll.
   */
  const lastViewRef = React.useRef({ scale, scrollLeft: 0, scrollTop: 0 });
  /**
   * Fit asks for the top of the page instead of an anchored zoom. The tick is
   * what guarantees the layout effect runs: the requested zoom can come back
   * identical (or be ignored because the author already moved the slider), and
   * a ref alone would then sit armed and fire on some later, unrelated zoom.
   */
  const pendingResetRef = React.useRef(false);
  const [viewResetTick, setViewResetTick] = React.useState(0);
  const requestViewReset = React.useCallback(() => {
    pendingResetRef.current = true;
    setViewResetTick(t => t + 1);
  }, []);

  React.useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const onScroll = () => {
      lastViewRef.current.scrollLeft = el.scrollLeft;
      lastViewRef.current.scrollTop = el.scrollTop;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Keep the viewport centre fixed across a zoom change coming from the
  // slider / +– buttons. (Wheel zoom never reaches this branch: the gesture
  // handler applies its own cursor-anchored correction and syncs
  // `lastViewRef`, so `prev.scale === scale` here by the time it commits.)
  // Layout effect, so the corrected scroll lands in the same frame as the new
  // scale — a plain effect paints one frame at the wrong offset and reads as
  // a jump.
  React.useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const prev = lastViewRef.current;
    if (pendingResetRef.current) {
      pendingResetRef.current = false;
      surface.scrollTop = 0;
      surface.scrollLeft = 0;
    } else if (prev.scale !== scale && prev.scale > 0) {
      const anchor = {
        x: surface.clientWidth / 2,
        y: surface.clientHeight / 2,
      };
      // Page-space point currently under the anchor …
      const px =
        (prev.scrollLeft + anchor.x - wrapperLeftAt(prev.scale)) / prev.scale;
      const py = (prev.scrollTop + anchor.y - SURFACE_PAD_TOP) / prev.scale;
      // … put it back under the anchor at the new scale.
      surface.scrollLeft = px * scale + wrapperLeftAt(scale) - anchor.x;
      surface.scrollTop = py * scale + SURFACE_PAD_TOP - anchor.y;
    }
    lastViewRef.current = {
      scale,
      scrollLeft: surface.scrollLeft,
      scrollTop: surface.scrollTop,
    };
  }, [scale, wrapperLeftAt, viewResetTick]);

  // Ctrl/Cmd + wheel → zoom. Plain wheel stays native scroll: this surface is
  // a real scroller (blocks pin/scrub against it), unlike the panned artboard.
  //
  // The gesture is applied straight to the DOM (transform + sizer + scroll)
  // once per animation frame and only COMMITTED to React state after the
  // wheel goes quiet. Committing per tick re-renders every block on the page,
  // which is what made pinch-zoom stutter; and the zoom stays fractional
  // through the gesture — rounding to integers made small pinch deltas a
  // no-op at page-fit percentages (~8%), so the zoom felt stuck.
  const zoomRef = React.useRef(zoom);
  zoomRef.current = zoom;
  const onZoomChangeRef = React.useRef(onZoomChange);
  onZoomChangeRef.current = onZoomChange;

  React.useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    let raf = 0;
    let commitTimer: ReturnType<typeof setTimeout> | null = null;
    /** Live zoom while the gesture runs; null when idle (state is authority). */
    let gestureZoom: number | null = null;
    let anchor = { x: 0, y: 0 };

    const applyGestureFrame = () => {
      raf = 0;
      const surface = surfaceRef.current;
      const page = pageRef.current;
      const sizer = sizerRef.current;
      if (!surface || !page || !sizer || gestureZoom == null) return;
      const s = gestureZoom / 100;
      const prev = lastViewRef.current;
      if (s === prev.scale || prev.scale <= 0) return;
      sizer.style.width = `${baseWidthRef.current * s}px`;
      sizer.style.height = `${pageHeightRef.current * s}px`;
      page.style.transform = s === 1 ? '' : `scale(${s})`;
      // Same anchor math as the layout effect: keep the page-space point
      // under the cursor fixed across the scale change.
      const px =
        (prev.scrollLeft + anchor.x - wrapperLeftAtRef.current(prev.scale)) /
        prev.scale;
      const py = (prev.scrollTop + anchor.y - SURFACE_PAD_TOP) / prev.scale;
      surface.scrollLeft = px * s + wrapperLeftAtRef.current(s) - anchor.x;
      surface.scrollTop = py * s + SURFACE_PAD_TOP - anchor.y;
      // Mirror into lastViewRef so the layout effect sees "already applied"
      // when the commit lands and does not re-anchor a second time.
      lastViewRef.current = {
        scale: s,
        scrollLeft: surface.scrollLeft,
        scrollTop: surface.scrollTop,
      };
    };

    const onWheel = (e: WheelEvent) => {
      interactedRef.current = true;
      if (!e.ctrlKey && !e.metaKey) return;
      if (!onZoomChangeRef.current) return;
      e.preventDefault();
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= 320;
      const rect = el.getBoundingClientRect();
      anchor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const base = gestureZoom ?? zoomRef.current;
      gestureZoom = clampCanvasZoom(base * Math.exp(-dy * 0.008));
      if (!raf) raf = requestAnimationFrame(applyGestureFrame);
      if (commitTimer) clearTimeout(commitTimer);
      commitTimer = setTimeout(() => {
        commitTimer = null;
        if (gestureZoom == null) return;
        const settled = gestureZoom;
        gestureZoom = null;
        onZoomChangeRef.current?.(settled);
      }, 140);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (raf) cancelAnimationFrame(raf);
      if (commitTimer) clearTimeout(commitTimer);
    };
  }, []);

  /**
   * Fit CONTAINS the page — both axes. "Xem cả trang" is the whole point of
   * this mode, so a 12-section page opens at whatever percentage shows all of
   * it (see `CANVAS_ZOOM_MIN`), never cropped to the first section.
   */
  const computeFitZoom = React.useCallback((): number | null => {
    const surface = surfaceRef.current;
    if (!surface) return null;
    const availW = Math.max(0, surface.clientWidth - SURFACE_PAD_X);
    const availH = Math.max(
      0,
      surface.clientHeight - SURFACE_PAD_TOP - SURFACE_PAD_BOTTOM
    );
    if (availW <= 0) return null;
    const fitW = (availW / baseWidth) * 100;
    const fitH =
      pageHeight > 0 && availH > 0 ? (availH / pageHeight) * 100 : fitW;
    return clampCanvasZoom(Math.min(100, Math.floor(Math.min(fitW, fitH))));
  }, [baseWidth, pageHeight]);

  /**
   * Auto-fit on mount / device change. A single fit is not enough: the first
   * `pageHeight` lands before images and fonts finish, the page keeps growing
   * for a moment, and a fit taken too early opens the editor mis-framed. So
   * the fit KEEPS TRACKING pageHeight — but only inside a short settle window
   * and only until the author touches the viewport, so a content edit made
   * minutes later never yanks the zoom back.
   */
  const fittedDeviceRef = React.useRef<Device | null>(null);
  const fitDeadlineRef = React.useRef(0);
  React.useEffect(() => {
    interactedRef.current = false;
    fitDeadlineRef.current = performance.now() + 3000;
  }, [device]);
  React.useEffect(() => {
    if (!onAutoFitZoom || pageHeight <= 0) return;
    const firstFit = fittedDeviceRef.current !== device;
    if (
      !firstFit &&
      (interactedRef.current || performance.now() > fitDeadlineRef.current)
    ) {
      return;
    }
    const clamped = computeFitZoom();
    if (clamped == null) return;
    fittedDeviceRef.current = device;
    requestViewReset();
    onAutoFitZoom(clamped);
  }, [device, pageHeight, onAutoFitZoom, computeFitZoom, requestViewReset]);

  const prevFitKeyRef = React.useRef(fitRequestKey);
  React.useEffect(() => {
    if (fitRequestKey === prevFitKeyRef.current) return;
    prevFitKeyRef.current = fitRequestKey;
    const clamped = computeFitZoom();
    if (clamped == null || !onAutoFitZoom) return;
    requestViewReset();
    onAutoFitZoom(clamped, true);
  }, [fitRequestKey, computeFitZoom, onAutoFitZoom, requestViewReset]);

  // Selecting a block elsewhere (blocks panel, layers, add) has to bring it on
  // screen. Skip when it is already visible so clicking straight on the canvas
  // never yanks the page.
  React.useEffect(() => {
    if (!activeBlockId) return;
    const surface = surfaceRef.current;
    const el = blockRoot(activeBlockId);
    if (!surface || !el) return;
    const sr = surface.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    if (er.top < sr.bottom - 40 && er.bottom > sr.top + 40) return;
    el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [activeBlockId, blockRoot]);

  // Hold Space → pan with left-drag, exactly like the block artboard.
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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    interactedRef.current = true;
    if (editingKey) return;
    const surface = surfaceRef.current;
    if (!surface) return;
    // A press on the native scrollbar must stay native.
    const rect = surface.getBoundingClientRect();
    if (
      e.clientX - rect.left >= surface.clientWidth ||
      e.clientY - rect.top >= surface.clientHeight
    ) {
      return;
    }
    // Pan: middle mouse, Space+left, or left on true empty canvas (the dotted
    // area around the page — anything inside a block frame keeps selecting).
    const wantsPan =
      e.button === 1 ||
      (e.button === 0 && spaceHeld) ||
      (e.button === 0 && !(e.target as HTMLElement).closest('[data-block-id]'));
    if (wantsPan) {
      e.preventDefault();
      panRef.current = {
        startClientX: e.clientX,
        startClientY: e.clientY,
        baseLeft: surface.scrollLeft,
        baseTop: surface.scrollTop,
        active: false,
      };
      setIsPanning(true);
      surface.setPointerCapture(e.pointerId);
      return;
    }
    layer.onPointerDown(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = panRef.current;
    if (p) {
      const surface = surfaceRef.current;
      if (!surface) return;
      const dx = e.clientX - p.startClientX;
      const dy = e.clientY - p.startClientY;
      if (!p.active && Math.hypot(dx, dy) < 4) return;
      p.active = true;
      surface.scrollLeft = p.baseLeft - dx;
      surface.scrollTop = p.baseTop - dy;
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
      // Swallow the trailing click after a real drag so it doesn't deselect.
      if (p.active) layer.markDragged();
      return;
    }
    layer.onPointerUp(e);
  };

  const chromeVisible = motionMode !== 'preview' && !editingKey;

  return (
    // Two boxes on purpose: the scroller holds the page and the element-
    // anchored chip, the outer box holds the corner-docked toolbar — which
    // would scroll off the top if it lived inside the scroller.
    <div className='relative flex min-h-0 flex-1 flex-col'>
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
          'relative min-h-0 flex-1 overflow-auto p-8 pb-20',
          CANVAS_SURFACE_CHROME_CLASS,
          // Grab cursor only inside the active block — the same element key
          // exists in every other block on the page.
          selectedElementKey &&
            !selectedElementKey.startsWith('__') &&
            device !== 'tablet' &&
            !spaceHeld &&
            `[&_[data-block-active=true]_[data-element-key="${selectedElementKey}"]]:cursor-grab`,
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
        <LandingMotionRoot scrollerRef={surfaceRef} enableSmooth={false}>
          {/* Reserves the SCALED box in layout so the scrollbar matches what is
            actually painted (`transform: scale` alone leaves the layout box at
            the unscaled 1440/834/390). */}
          <div
            ref={sizerRef}
            className='mx-auto'
            style={{
              width: baseWidth * scale,
              height: pageHeight * scale,
            }}
          >
            <div
              ref={pageRef}
              // `@container` sits on the unscaled element so container queries
              // match the logical device width, independent of zoom.
              className='@container origin-top-left'
              data-testid='active-block-preview'
              style={{
                width: baseWidth,
                ...(scale !== 1 ? { transform: `scale(${scale})` } : {}),
                ...brandKitToCssVars(DEFAULT_PREVIEW_KIT),
              }}
            >
              {/* Swallow CTA navigation while editing — same guard the artboard
                uses, applied once for the whole page. */}
              <LinkNav mode='canvas'>
                {blocks.map((block, index) => {
                  const active = block.id === activeBlockId;
                  const content = contentOf(block);
                  const motion = readVariant(block.motion, device) as
                    | BlockMotion
                    | undefined;
                  return (
                    <PageCanvasBlockFrame
                      key={block.id}
                      block={block}
                      index={index}
                      total={blocks.length}
                      active={active}
                      chromeVisible={chromeVisible}
                      actions={blockActions}
                    >
                      <div
                        data-element-key='__background__'
                        className={cn(
                          'relative w-full',
                          active &&
                            selectedElementKey === '__background__' &&
                            'outline-2 -outline-offset-2 outline-sky-500'
                        )}
                      >
                        <MotionProvider
                          mode={motionMode}
                          motion={motion}
                          scrollerEl={surfaceRef.current}
                          previewNonce={active ? motionPreviewNonce : 0}
                          previewElement={active ? motionPreviewElement : null}
                        >
                          <MotionBlockRoot>
                            <RenderBlock
                              key={`${block.id}:${device}:${lang}`}
                              block={block}
                              content={content}
                              styles={readVariant(block.elementStyles, device)}
                              background={readVariant(block.background, device)}
                              order={readVariant(block.elementOrder, device)}
                              positions={positionsOf(block)}
                              activeKey={active ? selectedElementKey : null}
                            />
                          </MotionBlockRoot>
                        </MotionProvider>
                        <ExtraElementOverlay
                          elements={block.extraElements ?? []}
                          selectedId={active ? selectedExtraElementId : null}
                          scale={scale}
                          readOnly={device === 'tablet'}
                          onSelect={id => onSelectExtraElement?.(block.id, id)}
                          onCommitPosition={(id, pos) =>
                            onCommitExtraElementPosition?.(block.id, id, pos)
                          }
                        />
                      </div>
                    </PageCanvasBlockFrame>
                  );
                })}
              </LinkNav>
            </div>
          </div>
        </LandingMotionRoot>

        <CanvasElementChip layer={layer} />
      </div>

      <CanvasSelectionToolbarDock layer={layer} />
    </div>
  );
}
