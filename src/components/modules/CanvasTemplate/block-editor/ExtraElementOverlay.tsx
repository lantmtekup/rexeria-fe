'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';
import { findFont } from '@/lib/fonts';

import type { ExtraElement, ExtraPosition, HotspotExtraElement } from './types';

interface Props {
  elements: ExtraElement[];
  selectedId: string | null;
  /** Inverse of canvas zoom so 100px drag at 50% zoom moves 200px in the
   *  element's own coord space (matches BlockPreview's fixed-element drag). */
  scale: number;
  readOnly?: boolean;
  onSelect: (id: string | null) => void;
  onCommitPosition: (id: string, pos: ExtraPosition) => void;
  /**
   * When true, this overlay is rendering the published view (not the
   * editor) — fires `rexer:track` events on element interaction per the
   * `tracking` config. In editor mode we never emit so analytics don't
   * spam during design.
   */
  emitTracking?: boolean;
}

interface DragState {
  id: string;
  el: HTMLElement;
  startClientX: number;
  startClientY: number;
  baseX: number;
  baseY: number;
  active: boolean;
}

/**
 * Absolutely-positioned overlay rendering every `ExtraElement` on top of
 * the block content. Each element is self-draggable (pointer events) —
 * unlike the fixed elements which require a "select first, drag second"
 * gesture, extra elements drag immediately on pointerdown.
 *
 * Drag math mirrors BlockPreview's free-drag: write `transform` directly
 * during move (no React render), commit absolute position on pointerup.
 */
export function ExtraElementOverlay({
  elements,
  selectedId,
  scale,
  readOnly,
  onSelect,
  onCommitPosition,
  emitTracking,
}: Props) {
  const dragRef = React.useRef<DragState | null>(null);
  const justDraggedRef = React.useRef(false);

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    el: ExtraElement
  ) => {
    if (readOnly) return;
    if (e.button !== 0) return;
    const target = e.currentTarget;
    dragRef.current = {
      id: el.id,
      el: target,
      startClientX: e.clientX,
      startClientY: e.clientY,
      baseX: el.position.x,
      baseY: el.position.y,
      active: false,
    };
    target.setPointerCapture(e.pointerId);
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dxRaw = e.clientX - d.startClientX;
    const dyRaw = e.clientY - d.startClientY;
    if (!d.active && Math.hypot(dxRaw, dyRaw) < 4) return;
    d.active = true;
    const safe = scale || 1;
    const x = d.baseX + dxRaw / safe;
    const y = d.baseY + dyRaw / safe;
    d.el.style.left = `${x}px`;
    d.el.style.top = `${y}px`;
    d.el.style.cursor = 'grabbing';
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    d.el.releasePointerCapture?.(e.pointerId);
    d.el.style.cursor = '';
    if (!d.active) return;
    const safe = scale || 1;
    const x = Math.round(d.baseX + (e.clientX - d.startClientX) / safe);
    const y = Math.round(d.baseY + (e.clientY - d.startClientY) / safe);
    onCommitPosition(d.id, { x, y });
    justDraggedRef.current = true;
  };

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement>,
    el: ExtraElement
  ) => {
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    e.stopPropagation();
    // Public view: fire tracking event when configured. Editor view never
    // emits so designers don't spam analytics while building.
    if (emitTracking && el.tracking?.eventName) {
      const {
        enabled = true,
        eventName,
        eventCategory,
        customData,
      } = el.tracking;
      if (enabled && typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('rexer:track', {
            detail: {
              eventName,
              eventCategory,
              elementId: el.id,
              elementKind: el.kind,
              customData,
            },
          })
        );
      }
    }
    onSelect(el.id);
  };

  if (elements.length === 0) return null;

  return (
    <div className='pointer-events-none absolute inset-0'>
      {elements.map(el => {
        const selected = el.id === selectedId;
        return (
          <div
            key={el.id}
            data-extra-element-id={el.id}
            onPointerDown={e => handlePointerDown(e, el)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={e => handleClick(e, el)}
            className={cn(
              'pointer-events-auto absolute cursor-grab select-none',
              selected
                ? 'outline outline-2 outline-offset-2 outline-sky-500'
                : 'hover:outline hover:outline-1 hover:outline-sky-400 hover:outline-dashed'
            )}
            style={{
              left: el.position.x,
              top: el.position.y,
              width: el.size.width,
              height: el.size.height,
              zIndex: el.zIndex ?? 1,
              transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
            }}
          >
            <RenderExtraElement el={el} />
          </div>
        );
      })}
    </div>
  );
}

function RenderExtraElement({ el }: { el: ExtraElement }) {
  const s = el.style ?? {};
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    color: s.color,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    fontStyle: s.fontStyle,
    fontFamily: s.fontFamily ? findFont(s.fontFamily).family : undefined,
    textAlign: s.textAlign,
    textDecoration: s.textDecoration,
    lineHeight: s.lineHeight,
    letterSpacing: s.letterSpacing,
    backgroundColor: s.backgroundColor,
    borderRadius: s.borderRadius,
    borderColor: s.borderColor,
    borderWidth: s.borderWidth,
    borderStyle: s.borderWidth ? 'solid' : undefined,
    padding: s.padding,
    opacity: s.opacity,
  };

  switch (el.kind) {
    case 'text':
      return (
        <div
          style={{ ...baseStyle, overflow: 'hidden' }}
          className='flex items-center'
        >
          {el.content.text || (
            <span className='text-neutral-400 italic'>Text trống</span>
          )}
        </div>
      );
    case 'edit_text':
      return el.content.inputType === 'textarea' ? (
        <textarea
          placeholder={el.content.placeholder}
          defaultValue={el.content.defaultValue}
          maxLength={el.content.maxLength}
          required={el.content.isRequired}
          name={el.content.fieldName}
          // In editor, prevent typing from triggering save / unintended state.
          // Public render will be a real form input.
          onChange={() => {}}
          style={{ ...baseStyle, resize: 'none' }}
        />
      ) : (
        <input
          type={el.content.inputType}
          placeholder={el.content.placeholder}
          defaultValue={el.content.defaultValue}
          maxLength={el.content.maxLength}
          required={el.content.isRequired}
          name={el.content.fieldName}
          onChange={() => {}}
          style={baseStyle}
        />
      );
    case 'photo':
      if (!el.content.mediaId) {
        return (
          <div
            style={baseStyle}
            className='flex items-center justify-center bg-neutral-100 text-[10px] text-neutral-400'
          >
            Chưa chọn ảnh
          </div>
        );
      }
      // The mediaId resolves to a URL via a media fetch — placeholder for now;
      // a per-kind editor (Task 34) will wire ImagePicker and resolve src.
      return (
        <div
          style={baseStyle}
          className='flex items-center justify-center bg-neutral-100 text-[10px] text-neutral-500'
        >
          Photo: {el.content.mediaId.slice(0, 8)}…
        </div>
      );
    case 'video':
      return (
        <div
          style={baseStyle}
          className='flex items-center justify-center bg-black text-[10px] text-white'
        >
          Video:{' '}
          {el.content.source === 'url'
            ? el.content.url || '(URL)'
            : el.content.mediaId || '(media)'}
        </div>
      );
    case 'hotspot':
      return <HotspotPin el={el} />;
  }
}

/**
 * Hotspot renders as a pulsing pin. Click opens a small popover anchored
 * below the pin. In editor view we still show the popover toggle so the
 * designer can see / position it; in public view this is the actual UX.
 */
function HotspotPin({ el }: { el: HotspotExtraElement }) {
  const [open, setOpen] = React.useState(false);
  const s = el.style ?? {};
  return (
    <div className='relative size-full'>
      <button
        type='button'
        onClick={e => {
          e.stopPropagation();
          setOpen(v => !v);
        }}
        className='flex size-full items-center justify-center font-bold shadow-md transition-transform hover:scale-110'
        style={{
          backgroundColor: s.backgroundColor,
          color: s.color,
          borderRadius: s.borderRadius,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          borderColor: s.borderColor,
          borderWidth: s.borderWidth,
          borderStyle: s.borderWidth ? 'solid' : undefined,
        }}
      >
        <span className='absolute inset-0 animate-ping rounded-full bg-current opacity-30' />
        <span className='relative'>{el.content.pinLabel ?? '+'}</span>
      </button>
      {open ? (
        <div
          // Popover anchored just below pin, centered horizontally.
          className='absolute top-full left-1/2 z-50 mt-2 w-64 -translate-x-1/2 rounded-lg border bg-white p-3 text-left text-xs shadow-xl ring-1 ring-black/5'
          onClick={e => e.stopPropagation()}
        >
          <div className='flex items-start justify-between gap-2 pb-1'>
            <p className='text-sm font-semibold text-neutral-900'>
              {el.content.title || 'Tiêu đề'}
            </p>
            <button
              type='button'
              onClick={e => {
                e.stopPropagation();
                setOpen(false);
              }}
              className='text-neutral-400 hover:text-neutral-700'
              aria-label='Đóng'
            >
              ×
            </button>
          </div>
          {el.content.body ? (
            <p className='text-[11px] leading-4 whitespace-pre-line text-neutral-600'>
              {el.content.body}
            </p>
          ) : null}
          {el.content.ctaText ? (
            <a
              href={el.content.ctaUrl || '#'}
              onClick={e => e.stopPropagation()}
              className='mt-2 inline-flex h-7 items-center rounded-md bg-neutral-900 px-2.5 text-[11px] font-semibold text-white hover:bg-neutral-800'
              target={el.content.ctaUrl ? '_blank' : undefined}
              rel='noreferrer'
            >
              {el.content.ctaText}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
