'use client';

import * as React from 'react';

import { brandKitToCssVars, DEFAULT_PREVIEW_KIT } from '@/lib/brand-kit';
import { cn } from '@/lib/cn';

import { ExtraElementOverlay } from './ExtraElementOverlay';
import { RenderBlock } from './blocks/renderBlock';
import { LandingMotionRoot } from './motion/LandingMotion';
import { MotionBlockRoot, MotionProvider } from './motion/runtime';
import type { BlockMotion, EditorMode } from './motion/types';
import { readVariant, type Block, type Device, type Lang } from './types';

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
   * load when the desktop frame (1280px) is wider than the viewport.
   */
  onAutoFitZoom?: (percentage: number) => void;
  // ── ExtraElements (free-drag user-added objects) ────────────────────────
  selectedExtraElementId?: string | null;
  onSelectExtraElement?: (id: string | null) => void;
  onCommitExtraElementPosition?: (
    id: string,
    pos: { x: number; y: number }
  ) => void;
}

const DEVICE_WIDTH: Record<Device, number> = {
  desktop: 1280,
  tablet: 834,
  mobile: 390,
};

/** Element keys that map to a single string field — eligible for inline edit. */
const TEXT_KEYS = new Set([
  'eyebrow',
  'title',
  'tag',
  'description',
  'subtitle',
  'ctaText',
  'submitText',
  'noteText',
  'primaryText',
  'secondaryText',
  'portfolioLabel',
  // ScrollMattis — chữ chạy + meta per slide
  'slide1BgWord',
  'slide2BgWord',
  'slide3BgWord',
  'slide1Title',
  'slide2Title',
  'slide3Title',
  'slide1Category1',
  'slide1Category2',
  'slide2Category1',
  'slide2Category2',
  'slide3Category1',
  'slide3Category2',
  'slide1Year',
  'slide2Year',
  'slide3Year',
  // AlturaOlympus features
  'features[0].label',
  'features[1].label',
  'features[2].label',
  'features[3].label',
  'features[4].label',
  'features[5].label',
  'heading',
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
  onCommitElementPosition,
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
  const baseWidth = DEVICE_WIDTH[device];
  const scale = zoom / 100;
  const surfaceRef = React.useRef<HTMLDivElement>(null);

  // Resolve motion config for the current device variant. The stored shape
  // matches `BlockMotion` 1:1 (track-based timeline). In edit mode the
  // runtime no-ops, so this can run unconditionally.
  const motionForDevice = readVariant(block.motion, device) as
    | BlockMotion
    | undefined;
  const effectiveMode: EditorMode = motionMode;

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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (editingKey) return;
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
      active: false,
    };
    surfaceRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dxRaw = e.clientX - d.startClientX;
    const dyRaw = e.clientY - d.startClientY;
    if (!d.active && Math.hypot(dxRaw, dyRaw) < 4) return;
    d.active = true;
    const safeScale = scale || 1;
    const x = d.baseX + dxRaw / safeScale;
    const y = d.baseY + dyRaw / safeScale;
    // Direct DOM write — no React state during move. React's next render
    // (after pointerup → onCommitElementPosition) will land the same value
    // via positionStyle so there's no visual jump.
    d.el.style.transform = `translate(${x}px, ${y}px)`;
    d.el.style.cursor = 'grabbing';
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    surfaceRef.current?.releasePointerCapture?.(e.pointerId);
    d.el.style.cursor = '';
    if (!d.active) return; // no real drag — let the click handler select
    const safeScale = scale || 1;
    const x = Math.round(d.baseX + (e.clientX - d.startClientX) / safeScale);
    const y = Math.round(d.baseY + (e.clientY - d.startClientY) / safeScale);
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
    const target = e.target as HTMLElement;
    const el = target.closest<HTMLElement>('[data-element-key]');
    if (el && surfaceRef.current?.contains(el)) {
      const key = el.getAttribute('data-element-key');
      if (!key) return;
      if (TEXT_KEYS.has(key)) lastTextKeyRef.current = key;
      onSelectElement(key, el.getBoundingClientRect());
      return;
    }
    onSelectElement(null, null);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const el = target.closest<HTMLElement>('[data-element-key]');
    let key =
      el && surfaceRef.current?.contains(el)
        ? el.getAttribute('data-element-key')
        : null;
    // Fallback: double-click có thể resolve về nền/section khi click thứ 2 lệch
    // (toolbar chọn đẩy flow element vài px giữa 2 nhịp click). Nếu đang chọn sẵn
    // 1 element text thì sửa luôn element đó → double-click-to-edit ổn định cho
    // mọi block (kể cả title nằm trong flow như Vault·Craft).
    if (!key || !TEXT_KEYS.has(key)) {
      const fallback =
        selectedElementKey && TEXT_KEYS.has(selectedElementKey)
          ? selectedElementKey
          : lastTextKeyRef.current;
      if (fallback && TEXT_KEYS.has(fallback)) key = fallback;
    }
    if (!key || !TEXT_KEYS.has(key)) return;
    onStartInlineEdit(key);
  };

  // Auto-fit zoom on mount + device change. Calculate `fit %` from current
  // surface width vs. device frame width. Without this, zoom stays at the
  // BlockEditor default (100%) and the desktop frame (1280px) overflows the
  // visible surface on typical laptop viewports → user sees scrollbar instead
  // of full block. We re-fire whenever `device` changes so toggling Mobile
  // (390px) → Desktop (1280px) refits properly.
  React.useEffect(() => {
    if (!onAutoFitZoom || !surfaceRef.current) return;
    const surface = surfaceRef.current;
    // Inner area = surface clientWidth minus the p-8 padding (32px each side).
    const innerWidth = Math.max(0, surface.clientWidth - 64);
    if (innerWidth <= 0) return;
    const fitPct = Math.floor((innerWidth / baseWidth) * 100);
    const clamped = Math.min(100, Math.max(20, fitPct));
    onAutoFitZoom(clamped);
  }, [device, baseWidth, onAutoFitZoom]);

  // Track the inner content's natural (unscaled) height so the outer wrapper
  // can reserve `scaledWidth × scaledHeight` in layout flow. Without this,
  // `transform: scale(...)` only shrinks the inner visually while the layout
  // box stays at the original size — surface horizontal scrollbar still
  // appears even when the visible artwork fits. ResizeObserver re-fires on
  // any content change (block switch, lang switch, inline edit, etc).
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [innerHeight, setInnerHeight] = React.useState<number>(0);
  React.useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => {
      // Height excluding the transform — read offsetHeight which reflects
      // the un-transformed layout height of the element.
      setInnerHeight(el.offsetHeight);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [block, lang, device]);

  // Drive contenteditable via DOM when entering edit mode. Pure DOM manipulation
  // keeps each block component dumb (no editing concerns).
  React.useEffect(() => {
    if (!editingKey || !surfaceRef.current) return;
    const el = surfaceRef.current.querySelector<HTMLElement>(
      `[data-element-key="${CSS.escape(editingKey)}"]`
    );
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

  return (
    <div
      ref={surfaceRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      data-selected-key={selectedElementKey ?? ''}
      className={cn(
        'relative flex flex-1 items-center justify-center overflow-auto bg-[#f3f1ec] p-8',
        '[&_[data-inline-editing=true]]:cursor-text [&_[data-inline-editing=true]]:rounded-sm [&_[data-inline-editing=true]]:bg-sky-50/80 [&_[data-inline-editing=true]]:outline [&_[data-inline-editing=true]]:outline-2 [&_[data-inline-editing=true]]:outline-offset-2 [&_[data-inline-editing=true]]:outline-sky-500',
        // Selected element gets a grab cursor so users know it's draggable.
        // Bracket-targeting via `data-element-key` matches the selected key.
        selectedElementKey &&
          !selectedElementKey.startsWith('__') &&
          device !== 'tablet' &&
          `[&_[data-element-key="${selectedElementKey}"]]:cursor-grab`
      )}
    >
      {/*
        Outer wrapper reserves `scaledWidth × scaledHeight` in layout so the
        surface scrollbar reflects what the user actually sees. Without it,
        `transform: scale(...)` shrinks the visual but leaves the layout box
        at the original 1280/834/390 width → horizontal scroll appears even
        when the rendered artwork fits.
      */}
      <LandingMotionRoot scrollerRef={surfaceRef} enableSmooth={false}>
        <div
          className='shrink-0'
          style={{
            width: baseWidth * scale,
            height: innerHeight * scale,
          }}
        >
          <div
            ref={innerRef}
            // `@container` stays on the original-sized element so container
            // queries (`@2xl:` / `@4xl:`) match the *logical* device width
            // (1280 / 834 / 390) — independent of the user-controlled zoom.
            className='@container origin-top-left transition-transform duration-150'
            style={{
              width: baseWidth,
              transform: `scale(${scale})`,
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
    </div>
  );
}
