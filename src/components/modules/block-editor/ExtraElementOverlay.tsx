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
  /** Same guard as BlockPreview's fixed-element drag: keep the object partly
   *  inside the frame so it can't be parked somewhere invisible. Null when it
   *  already starts outside (don't yank an intentional overflow back in). */
  bounds: { minX: number; maxX: number; minY: number; maxY: number } | null;
  active: boolean;
}

/** Unscaled px of an element that must stay inside the block frame. */
const MIN_VISIBLE = 32;

const clampTo = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

function clampDrag(x: number, y: number, b: DragState['bounds']) {
  if (!b) return { x, y };
  return {
    x: clampTo(x, b.minX, b.maxX),
    y: clampTo(y, b.minY, b.maxY),
  };
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
  const rootRef = React.useRef<HTMLDivElement>(null);

  /** Frame bounds in the element's own (unscaled) coordinate space. */
  const computeBounds = (el: ExtraElement): DragState['bounds'] => {
    const root = rootRef.current;
    if (!root) return null;
    const safe = scale || 1;
    const rect = root.getBoundingClientRect();
    const frameW = rect.width / safe;
    const frameH = rect.height / safe;
    if (frameW <= 0 || frameH <= 0) return null;
    const bounds = {
      minX: MIN_VISIBLE - el.size.width,
      maxX: frameW - MIN_VISIBLE,
      minY: MIN_VISIBLE - el.size.height,
      maxY: frameH - MIN_VISIBLE,
    };
    const inside =
      el.position.x >= bounds.minX &&
      el.position.x <= bounds.maxX &&
      el.position.y >= bounds.minY &&
      el.position.y <= bounds.maxY;
    return inside ? bounds : null;
  };

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
      bounds: computeBounds(el),
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
    const { x, y } = clampDrag(
      d.baseX + dxRaw / safe,
      d.baseY + dyRaw / safe,
      d.bounds
    );
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
    const pos = clampDrag(
      d.baseX + (e.clientX - d.startClientX) / safe,
      d.baseY + (e.clientY - d.startClientY) / safe,
      d.bounds
    );
    onCommitPosition(d.id, { x: Math.round(pos.x), y: Math.round(pos.y) });
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
    <div ref={rootRef} className='pointer-events-none absolute inset-0'>
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
  // Glass — semi-transparent fill + backdrop blur. Overrides whatever
  // `backgroundColor` was set so the tint actually wins.
  const glassBg = s.glass
    ? (s.glassTint ?? 'rgba(255,255,255,0.12)')
    : undefined;
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
    backgroundColor: glassBg ?? s.backgroundColor,
    borderRadius: s.borderRadius,
    borderColor: s.borderColor,
    borderWidth: s.borderWidth,
    borderStyle: s.borderWidth ? 'solid' : undefined,
    padding: s.padding,
    opacity: s.opacity,
    // Backdrop-filter is the engine behind glassmorphism. WebKit needs the
    // prefixed property — we set both via casting.
    ...(s.glass
      ? {
          backdropFilter: 'blur(14px) saturate(140%)',
          WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        }
      : null),
  } as React.CSSProperties;

  const content = (() => {
    switch (el.kind) {
      case 'text':
        return <TextRenderer el={el} baseStyle={baseStyle} />;
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
        return <PhotoRenderer el={el} baseStyle={baseStyle} />;
      case 'video':
        return (
          <div
            style={baseStyle}
            className='text-3xs flex items-center justify-center bg-black text-white'
          >
            Video:{' '}
            {el.content.source === 'url'
              ? el.content.url || '(URL)'
              : el.content.mediaId || '(media)'}
          </div>
        );
      case 'hotspot':
        return <HotspotPin el={el} />;
      case 'compare':
        return <CompareSlider el={el} baseStyle={baseStyle} />;
      case 'range':
        return <RangeSlider el={el} baseStyle={baseStyle} />;
      case 'countdown':
        return <CountdownRenderer el={el} baseStyle={baseStyle} />;
      case 'reveal':
        return <RevealRenderer el={el} baseStyle={baseStyle} />;
      case 'spin_wheel':
        return <SpinWheelRenderer el={el} baseStyle={baseStyle} />;
    }
  })();

  // Border-beam: wrap content with an absolutely-positioned conic-gradient
  // ring that animates via `rotate`. Sits BEHIND the renderer (negative
  // inset) so the beam glow extends just outside the element's footprint.
  if (s.beamColor) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: s.borderRadius,
        }}
      >
        <BeamFrame
          color={s.beamColor}
          speedSec={s.beamSpeedSec ?? 3}
          radius={s.borderRadius ?? 0}
        />
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {content}
        </div>
      </div>
    );
  }
  return content;
}

/**
 * Conic-gradient ring rotating around an element's bounding box. Pure CSS
 * (transform: rotate animated) so it doesn't cost a render thread tick.
 */
function BeamFrame({
  color,
  speedSec,
  radius,
}: {
  color: string;
  speedSec: number;
  radius: number;
}) {
  return (
    <>
      <style>{`
        @keyframes rx-beam-rotate { from { transform: rotate(0) } to { transform: rotate(360deg) } }
      `}</style>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: -2,
          padding: 2,
          borderRadius: radius ? radius + 2 : 0,
          background: `conic-gradient(from 0deg, transparent 0%, ${color} 18%, transparent 32%, transparent 100%)`,
          animation: `rx-beam-rotate ${speedSec}s linear infinite`,
          // Mask out the centre so only the rim shows.
          WebkitMask:
            'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

/**
 * Before/after image compare. Top image is masked by `clip-path: inset()`
 * which is updated as the user drags the divider. Works in both editor and
 * public render — gesture is purely client-side, no state persisted on drag
 * (only the default ratio is saved via the toolbar).
 */
function CompareSlider({
  el,
  baseStyle,
}: {
  el: import('./types').CompareExtraElement;
  baseStyle: React.CSSProperties;
}) {
  const initial = clampRatio(el.content.defaultRatio ?? 0.5);
  const [ratio, setRatio] = React.useState(initial);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  // Re-sync when the toolbar pushes a new default ratio.
  React.useEffect(() => {
    setRatio(clampRatio(el.content.defaultRatio ?? 0.5));
  }, [el.content.defaultRatio]);

  const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const box = wrapperRef.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    const r = clampRatio((e.clientX - box.left) / box.width);
    setRatio(r);
  };
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    handlePointer(e);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    e.stopPropagation();
    handlePointer(e);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    e.stopPropagation();
    dragging.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const c = el.content;
  return (
    <div
      ref={wrapperRef}
      style={{ ...baseStyle, overflow: 'hidden' }}
      className='relative bg-neutral-100 select-none'
    >
      {/* After image — full size, sits underneath. */}
      {c.afterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={c.afterUrl}
          alt={c.afterAlt ?? ''}
          draggable={false}
          className='pointer-events-none absolute inset-0 size-full object-cover'
        />
      ) : null}
      {/* Before image — masked from the right based on ratio. */}
      {c.beforeUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={c.beforeUrl}
          alt={c.beforeAlt ?? ''}
          draggable={false}
          style={{ clipPath: `inset(0 ${(1 - ratio) * 100}% 0 0)` }}
          className='pointer-events-none absolute inset-0 size-full object-cover'
        />
      ) : null}
      {/* Draggable divider. */}
      <div
        role='separator'
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ left: `${ratio * 100}%` }}
        className='absolute top-0 bottom-0 z-10 -translate-x-1/2 cursor-ew-resize'
      >
        <span className='absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]' />
        <span className='absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-700 shadow-md ring-1 ring-black/10'>
          ⇆
        </span>
      </div>
      {(c.beforeAlt || c.afterAlt) && (
        <>
          {c.beforeAlt ? (
            <span className='text-3xs pointer-events-none absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 font-semibold tracking-wider text-white uppercase'>
              {c.beforeAlt}
            </span>
          ) : null}
          {c.afterAlt ? (
            <span className='text-3xs pointer-events-none absolute top-2 right-2 rounded bg-black/60 px-2 py-0.5 font-semibold tracking-wider text-white uppercase'>
              {c.afterAlt}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}

function clampRatio(r: number): number {
  return Math.max(0.02, Math.min(0.98, r));
}

/**
 * Fire `true` exactly once, when the element first enters the viewport.
 * Used by text animation modes so they run on view (not on mount).
 */
function useInView(ref: React.RefObject<Element | null>): boolean {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, inView]);
  return inView;
}

/**
 * Format a number for the counter renderer: decimals + optional thousand
 * separator (vi-VN locale).
 */
function formatCounter(v: number, decimals: number, sep: boolean): string {
  const rounded = Number(v.toFixed(decimals));
  return sep
    ? rounded.toLocaleString('vi-VN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : rounded.toFixed(decimals);
}

/**
 * Text element renderer with optional animation variants. Priority order:
 *   counter > marquee > animation > plain.
 * Animations fire once on first viewport entry — re-render does not replay.
 */
function TextRenderer({
  el,
  baseStyle,
}: {
  el: import('./types').TextExtraElement;
  baseStyle: React.CSSProperties;
}) {
  const c = el.content;
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  // ── Counter mode ────────────────────────────────────────────────────
  if (c.counter && typeof c.counter.to === 'number') {
    return (
      <CounterText
        el={el}
        baseStyle={baseStyle}
        wrapperRef={ref}
        inView={inView}
      />
    );
  }

  // ── Marquee mode ────────────────────────────────────────────────────
  if (c.marquee) {
    const speed = c.marquee.speedSec ?? 12;
    const dir = c.marquee.direction === 'right' ? 'normal' : 'normal';
    const animationName =
      c.marquee.direction === 'right' ? 'rx-marquee-right' : 'rx-marquee-left';
    return (
      <div
        ref={ref}
        style={{ ...baseStyle, overflow: 'hidden' }}
        className='relative flex items-center whitespace-nowrap'
      >
        {/* Inline keyframes are local to overlay so a single mount carries
            its own keyframes without polluting global CSS. */}
        <style>{`
          @keyframes rx-marquee-left { from { transform: translateX(0) } to { transform: translateX(-50%) } }
          @keyframes rx-marquee-right { from { transform: translateX(-50%) } to { transform: translateX(0) } }
        `}</style>
        <div
          className='flex shrink-0 gap-12 pl-12'
          style={{
            animation: `${animationName} ${speed}s linear infinite`,
            animationDirection: dir,
          }}
        >
          <span>{c.text}</span>
          <span aria-hidden>{c.text}</span>
        </div>
      </div>
    );
  }

  // ── Animation modes ──────────────────────────────────────────────────
  if (c.animation && c.animation !== 'none') {
    return (
      <AnimatedText
        el={el}
        baseStyle={baseStyle}
        wrapperRef={ref}
        inView={inView}
      />
    );
  }

  // ── Plain text ───────────────────────────────────────────────────────
  return (
    <div
      ref={ref}
      style={{ ...baseStyle, overflow: 'hidden' }}
      className='flex items-center'
    >
      {c.text || <span className='text-neutral-400 italic'>Text trống</span>}
    </div>
  );
}

function CounterText({
  el,
  baseStyle,
  wrapperRef,
  inView,
}: {
  el: import('./types').TextExtraElement;
  baseStyle: React.CSSProperties;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  inView: boolean;
}) {
  const conf = el.content.counter!;
  const from = conf.from ?? 0;
  const to = conf.to;
  const duration = conf.durationMs ?? 1600;
  const decimals = conf.decimals ?? 0;
  const sep = conf.thousandSep ?? false;
  const [value, setValue] = React.useState(from);
  React.useEffect(() => {
    if (!inView) {
      setValue(from);
      return;
    }
    let raf: number;
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      const p = Math.min(1, elapsed / Math.max(1, duration));
      // ease-out cubic for a natural decel.
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, from, to, duration]);
  return (
    <div
      ref={wrapperRef}
      style={{ ...baseStyle, overflow: 'hidden' }}
      className='flex items-center tabular-nums'
    >
      <span>
        {conf.prefix ?? ''}
        {formatCounter(value, decimals, sep)}
        {conf.suffix ?? ''}
      </span>
    </div>
  );
}

function AnimatedText({
  el,
  baseStyle,
  wrapperRef,
  inView,
}: {
  el: import('./types').TextExtraElement;
  baseStyle: React.CSSProperties;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  inView: boolean;
}) {
  const mode = el.content.animation;
  const dur = el.content.animationDurationMs ?? 700;
  const text = el.content.text ?? '';

  if (mode === 'typewriter') {
    // Reveal one char at a time. Use a synthetic mask via opacity-controlled
    // spans for accessibility (text still in DOM for screen readers).
    return (
      <div
        ref={wrapperRef}
        style={{ ...baseStyle, overflow: 'hidden' }}
        className='flex items-center'
      >
        <span aria-label={text}>
          {text.split('').map((ch, i) => (
            <span
              key={i}
              aria-hidden
              style={{
                display: 'inline-block',
                opacity: inView ? 1 : 0,
                transform: inView ? 'none' : 'translateY(2px)',
                transition: `opacity 90ms linear, transform 90ms linear`,
                transitionDelay: inView
                  ? `${(i / Math.max(1, text.length)) * dur}ms`
                  : '0ms',
              }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </span>
      </div>
    );
  }

  // fade-up / split-slide-up share the same wrapper-level transform; for
  // split-slide-up we wrap each WORD so they stagger independently.
  if (mode === 'split-slide-up') {
    const words = text.split(/(\s+)/);
    return (
      <div
        ref={wrapperRef}
        style={{ ...baseStyle, overflow: 'hidden' }}
        className='flex items-center'
      >
        <span aria-label={text}>
          {words.map((w, i) =>
            /\s/.test(w) ? (
              <span key={i}>{w}</span>
            ) : (
              <span
                key={i}
                aria-hidden
                style={{
                  display: 'inline-block',
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity ${dur}ms cubic-bezier(0.22,1,0.36,1), transform ${dur}ms cubic-bezier(0.22,1,0.36,1)`,
                  transitionDelay: inView ? `${i * 60}ms` : '0ms',
                }}
              >
                {w}
              </span>
            )
          )}
        </span>
      </div>
    );
  }

  // fade-up (default fallback)
  return (
    <div
      ref={wrapperRef}
      style={{
        ...baseStyle,
        overflow: 'hidden',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity ${dur}ms ease-out, transform ${dur}ms ease-out`,
      }}
      className='flex items-center'
    >
      {text}
    </div>
  );
}

/**
 * Photo element renderer. Resolves mediaId → URL via the media library
 * (placeholder), supports a 2-sided flip variant when `flipMediaId` is set.
 *
 * NOTE: mediaId-to-URL resolution is still placeholder — when the media
 * pipeline lands we render real `<img>` tags. For now we show the id chip
 * so the toolbar/edit experience stays usable.
 */
function PhotoRenderer({
  el,
  baseStyle,
}: {
  el: import('./types').PhotoExtraElement;
  baseStyle: React.CSSProperties;
}) {
  const [flipped, setFlipped] = React.useState(false);
  const c = el.content;

  if (!c.mediaId) {
    return (
      <div
        style={baseStyle}
        className='text-3xs flex items-center justify-center bg-neutral-100 text-neutral-400'
      >
        Chưa chọn ảnh
      </div>
    );
  }

  // ── Flip-card variant ────────────────────────────────────────────────
  if (c.flipMediaId) {
    const isHover = c.flipMode === 'hover';
    const handleTap = () => {
      if (!isHover) setFlipped(f => !f);
    };
    const onEnter = isHover ? () => setFlipped(true) : undefined;
    const onLeave = isHover ? () => setFlipped(false) : undefined;
    return (
      <div
        style={{ ...baseStyle, perspective: 1000, background: 'transparent' }}
        onClick={handleTap}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        className='cursor-pointer'
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <FlipFace mediaId={c.mediaId} alt={c.alt ?? ''} side='front' />
          <FlipFace mediaId={c.flipMediaId} alt={c.alt ?? ''} side='back' />
        </div>
      </div>
    );
  }

  // ── Single-sided photo (current behaviour) ───────────────────────────
  return (
    <div
      style={baseStyle}
      className='text-3xs flex items-center justify-center bg-neutral-100 text-neutral-500'
    >
      Photo: {c.mediaId.slice(0, 8)}…
    </div>
  );
}

function FlipFace({
  mediaId,
  alt,
  side,
}: {
  mediaId: string;
  alt: string;
  side: 'front' | 'back';
}) {
  return (
    <div
      role='img'
      aria-label={alt}
      style={{
        position: 'absolute',
        inset: 0,
        backfaceVisibility: 'hidden',
        transform: side === 'back' ? 'rotateY(180deg)' : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: side === 'front' ? '#f3f4f6' : '#e5e7eb',
        color: '#525252',
        fontSize: 10,
        borderRadius: 'inherit',
        overflow: 'hidden',
      }}
    >
      Photo: {mediaId.slice(0, 8)}…
    </div>
  );
}

/**
 * Range slider input. Renders a labelled <input type=range> with live value
 * + optional unit suffix. The container fills baseStyle.width × height; the
 * track sits inside with padding.
 */
function RangeSlider({
  el,
  baseStyle,
}: {
  el: import('./types').RangeExtraElement;
  baseStyle: React.CSSProperties;
}) {
  const c = el.content;
  const [value, setValue] = React.useState(c.defaultValue ?? c.min);
  React.useEffect(() => {
    setValue(c.defaultValue ?? c.min);
  }, [c.defaultValue, c.min]);
  const showValue = c.showValue !== false;
  const accent = el.style?.backgroundColor ?? '#0ea5e9';
  return (
    <div
      style={{ ...baseStyle, padding: el.style?.padding ?? 8 }}
      className='flex flex-col justify-center gap-1'
      onPointerDown={e => e.stopPropagation()}
    >
      {(c.label || showValue) && (
        <div className='text-2xs flex items-center justify-between font-medium text-neutral-600'>
          {c.label ? <span>{c.label}</span> : <span />}
          {showValue ? (
            <span className='text-neutral-900 tabular-nums'>
              {value}
              {c.unit ?? ''}
            </span>
          ) : null}
        </div>
      )}
      <input
        type='range'
        name={c.fieldName}
        min={c.min}
        max={c.max}
        step={c.step ?? 1}
        value={value}
        onChange={e => setValue(Number(e.target.value))}
        style={{ accentColor: accent }}
        className='h-2 w-full cursor-pointer'
      />
    </div>
  );
}

/**
 * Countdown timer. Ticks every second, renders selected units (days /
 * hours / minutes / seconds). On reaching target time → shows
 * `expiredText`.
 */
function CountdownRenderer({
  el,
  baseStyle,
}: {
  el: import('./types').CountdownExtraElement;
  baseStyle: React.CSSProperties;
}) {
  const c = el.content;
  const units = c.units ?? ['days', 'hours', 'minutes', 'seconds'];
  const target = React.useMemo(() => {
    const t = Date.parse(c.targetIso);
    return Number.isFinite(t) ? t : Date.now();
  }, [c.targetIso]);
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const expired = diff === 0;
  const secs = Math.floor(diff / 1000);
  const parts: Record<'days' | 'hours' | 'minutes' | 'seconds', number> = {
    days: Math.floor(secs / 86400),
    hours: Math.floor((secs % 86400) / 3600),
    minutes: Math.floor((secs % 3600) / 60),
    seconds: secs % 60,
  };
  const UNIT_LABEL: Record<string, string> = {
    days: 'ngày',
    hours: 'giờ',
    minutes: 'phút',
    seconds: 'giây',
  };
  return (
    <div
      style={{ ...baseStyle, padding: el.style?.padding ?? 12 }}
      className='flex flex-col items-center justify-center gap-1'
    >
      {c.label ? (
        <span
          className='font-medium tracking-wide text-neutral-500 uppercase'
          style={{
            fontSize: Math.max(10, (baseStyle.fontSize as number) / 2.4),
          }}
        >
          {c.label}
        </span>
      ) : null}
      {expired ? (
        <span className='font-semibold tabular-nums'>
          {c.expiredText ?? 'Đã kết thúc'}
        </span>
      ) : (
        <div className='flex items-end gap-3 tabular-nums'>
          {units.map(u => (
            <div key={u} className='flex flex-col items-center'>
              <span
                className={cn(
                  'font-bold',
                  c.style === 'flip' &&
                    'rounded-md bg-neutral-900 px-2.5 py-1 text-white shadow-inner'
                )}
              >
                {String(parts[u]).padStart(2, '0')}
              </span>
              <span
                className='font-medium tracking-wide text-neutral-500 uppercase'
                style={{ fontSize: 9 }}
              >
                {UNIT_LABEL[u]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Reveal element — `coverUrl` overlaid on top of `revealUrl`, gradually
 * cleared by interaction. Mode-specific gesture:
 *   - scratch / spotlight: paint with cursor onto a 2D canvas mask
 *   - peel: cover slides off in a diagonal as user drags
 *   - tap: single tap fades the cover entirely
 */
function RevealRenderer({
  el,
  baseStyle,
}: {
  el: import('./types').RevealExtraElement;
  baseStyle: React.CSSProperties;
}) {
  const c = el.content;
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const dragRef = React.useRef(false);
  const [tapped, setTapped] = React.useState(false);
  const [peelProgress, setPeelProgress] = React.useState(0);

  // For scratch / spotlight: paint the cover image onto canvas and erase
  // pixels along the pointer path via destination-out compositing.
  React.useEffect(() => {
    if (c.mode !== 'scratch' && c.mode !== 'spotlight') return;
    const canvas = canvasRef.current;
    const wrap = wrapperRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const box = wrap.getBoundingClientRect();
    canvas.width = box.width * dpr;
    canvas.height = box.height * dpr;
    canvas.style.width = `${box.width}px`;
    canvas.style.height = `${box.height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, box.width, box.height);
    };
    img.src = c.coverUrl;
  }, [c.mode, c.coverUrl]);

  const erase = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const wrap = wrapperRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const box = wrap.getBoundingClientRect();
    const x = clientX - box.left;
    const y = clientY - box.top;
    const r = c.brushSize ?? 60;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (c.mode === 'tap') {
      setTapped(true);
      return;
    }
    if (c.mode === 'peel') {
      dragRef.current = true;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      return;
    }
    if (c.mode === 'scratch') {
      dragRef.current = true;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      erase(e.clientX, e.clientY);
    }
    if (c.mode === 'spotlight') {
      erase(e.clientX, e.clientY);
    }
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = wrapperRef.current;
    if (!wrap) return;
    if (c.mode === 'spotlight') {
      // Spotlight follows pointer constantly; keep a small "halo" by
      // re-drawing cover then erasing a circle. Simpler implementation:
      // wipe and erase on each move within the canvas region.
      const box = wrap.getBoundingClientRect();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      // Restore cover region under cursor by drawing back the full image
      // then erasing the new circle.
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, box.width, box.height);
        erase(e.clientX, e.clientY);
      };
      // Cache image draw — avoid re-decode each frame in real use; for the
      // overlay editor this is acceptable.
      img.src = c.coverUrl;
      return;
    }
    if (!dragRef.current) return;
    if (c.mode === 'scratch') {
      erase(e.clientX, e.clientY);
    }
    if (c.mode === 'peel') {
      const box = wrap.getBoundingClientRect();
      const dx = (e.clientX - box.left) / Math.max(1, box.width);
      const dy = (e.clientY - box.top) / Math.max(1, box.height);
      // 0..1 — how far the cover has slid diagonally off the panel.
      const p = Math.max(0, Math.min(1, (dx + dy) / 2));
      setPeelProgress(p);
    }
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      ref={wrapperRef}
      style={{ ...baseStyle, overflow: 'hidden' }}
      className='relative bg-neutral-200 select-none'
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Reveal image (underneath) */}
      {c.revealUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={c.revealUrl}
          alt=''
          draggable={false}
          className='pointer-events-none absolute inset-0 size-full object-cover'
        />
      ) : null}

      {/* Mode-specific cover */}
      {c.mode === 'scratch' || c.mode === 'spotlight' ? (
        <canvas
          ref={canvasRef}
          className='absolute inset-0 size-full'
          aria-label='Scratch surface'
        />
      ) : c.mode === 'peel' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={c.coverUrl}
          alt=''
          draggable={false}
          style={{
            transform: `translate(${peelProgress * 100}%, ${peelProgress * 100}%) rotate(${peelProgress * 18}deg)`,
            transformOrigin: '0% 0%',
            transition: dragRef.current
              ? 'none'
              : 'transform 320ms cubic-bezier(0.22,1,0.36,1)',
            boxShadow:
              peelProgress > 0 ? '0 12px 24px rgba(0,0,0,0.25)' : undefined,
          }}
          className='pointer-events-none absolute inset-0 size-full object-cover'
        />
      ) : (
        // tap mode
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={c.coverUrl}
          alt=''
          draggable={false}
          style={{
            opacity: tapped ? 0 : 1,
            transition: 'opacity 700ms ease',
          }}
          className='pointer-events-none absolute inset-0 size-full object-cover'
        />
      )}
      {/* Hint badge */}
      <span className='text-3xs pointer-events-none absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 font-semibold tracking-wider text-white uppercase'>
        {c.mode}
      </span>
    </div>
  );
}

/**
 * Spin wheel — SVG wedges, single button to spin. Result chosen by
 * weight; rotation lands so the chosen wedge points up.
 */
function SpinWheelRenderer({
  el,
  baseStyle,
}: {
  el: import('./types').SpinWheelExtraElement;
  baseStyle: React.CSSProperties;
}) {
  const c = el.content;
  const segments =
    c.segments.length > 0
      ? c.segments
      : [{ id: 'fallback', label: '—', color: '#94a3b8' }];
  const totalWeight = segments.reduce((acc, s) => acc + (s.weight ?? 1), 0);
  const duration = c.spinDurationMs ?? 4000;
  const [rotation, setRotation] = React.useState(0);
  const [winner, setWinner] = React.useState<string | null>(null);
  const spinning = React.useRef(false);

  const spin = () => {
    if (spinning.current) return;
    spinning.current = true;
    setWinner(null);
    // Pick weighted random segment.
    const r = Math.random() * totalWeight;
    let acc = 0;
    let chosenIdx = 0;
    for (let i = 0; i < segments.length; i++) {
      acc += segments[i].weight ?? 1;
      if (r < acc) {
        chosenIdx = i;
        break;
      }
    }
    const segAngle = 360 / segments.length;
    // Land with the chosen segment's centre at the top (12 o'clock). Add
    // 4-7 full rotations for visual flourish.
    const targetAngle =
      360 * (4 + Math.floor(Math.random() * 4)) -
      (chosenIdx * segAngle + segAngle / 2);
    setRotation(prev => prev + targetAngle);
    setTimeout(() => {
      spinning.current = false;
      setWinner(segments[chosenIdx].prize ?? segments[chosenIdx].label);
    }, duration);
  };

  const size = Math.min(
    typeof baseStyle.width === 'number' ? baseStyle.width : 320,
    typeof baseStyle.height === 'number' ? baseStyle.height : 320
  );
  const radius = (size - 20) / 2;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div
      style={{ ...baseStyle, padding: 8 }}
      className='relative flex flex-col items-center justify-center gap-2'
    >
      <div className='relative' style={{ width: size, height: size }}>
        {/* Pointer indicator — small triangle at the top. */}
        <div
          aria-hidden
          className='absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1'
          style={{
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '16px solid #0a0a0a',
          }}
        />
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: `transform ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
          }}
        >
          {segments.map((seg, i) => {
            const startAngle = (i / segments.length) * 2 * Math.PI;
            const endAngle = ((i + 1) / segments.length) * 2 * Math.PI;
            const x1 = cx + radius * Math.cos(startAngle - Math.PI / 2);
            const y1 = cy + radius * Math.sin(startAngle - Math.PI / 2);
            const x2 = cx + radius * Math.cos(endAngle - Math.PI / 2);
            const y2 = cy + radius * Math.sin(endAngle - Math.PI / 2);
            const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
            const labelAngle = (startAngle + endAngle) / 2 - Math.PI / 2;
            const lx = cx + radius * 0.62 * Math.cos(labelAngle);
            const ly = cy + radius * 0.62 * Math.sin(labelAngle);
            return (
              <g key={seg.id}>
                <path
                  d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={seg.color ?? '#0ea5e9'}
                  stroke='white'
                  strokeWidth={2}
                />
                <text
                  x={lx}
                  y={ly}
                  fill='white'
                  fontSize={Math.max(11, size / 22)}
                  fontWeight={700}
                  textAnchor='middle'
                  dominantBaseline='middle'
                  transform={`rotate(${(labelAngle * 180) / Math.PI + 90} ${lx} ${ly})`}
                >
                  {seg.label}
                </text>
              </g>
            );
          })}
          {/* Centre hub */}
          <circle
            cx={cx}
            cy={cy}
            r={size / 14}
            fill='#ffffff'
            stroke='#0a0a0a'
            strokeWidth={2}
          />
        </svg>
      </div>
      <button
        type='button'
        onClick={spin}
        className='rounded-pill mt-1 bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-neutral-700'
      >
        {c.buttonLabel ?? 'Quay'}
      </button>
      {winner ? (
        <span
          className='text-2xs mt-1 rounded-md bg-emerald-100 px-2 py-1 font-semibold text-emerald-900'
          aria-live='polite'
        >
          🎉 {winner}
        </span>
      ) : null}
    </div>
  );
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
      {/* Outer ping ring — always a bright sky-blue regardless of the pin's
          fill so the pulse stays visible even when the chip itself is white
          (legacy default). Sits BEHIND the button so the label stays legible. */}
      <span
        aria-hidden
        className='pointer-events-none absolute inset-0 -m-1 animate-ping rounded-full bg-sky-500 opacity-60'
      />
      <button
        type='button'
        onClick={e => {
          e.stopPropagation();
          setOpen(v => !v);
        }}
        className='relative flex size-full items-center justify-center font-bold shadow-[0_0_0_4px_rgba(255,255,255,0.35),0_4px_12px_rgba(0,0,0,0.4)] transition-transform hover:scale-110'
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
        <span>{el.content.pinLabel ?? '+'}</span>
      </button>
      {open ? (
        // Fullscreen backdrop + centred modal. Sits OUTSIDE the pin's flow
        // (still inside the React tree) and uses `position: fixed` so it
        // covers the editor surface even when the pin lives in a corner.
        <div
          className='fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/70 p-4 backdrop-blur-sm'
          onClick={e => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <div
            className='relative w-full max-w-md overflow-hidden rounded-xl bg-white text-left shadow-2xl ring-1 ring-black/10'
            onClick={e => e.stopPropagation()}
          >
            {el.content.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={el.content.imageUrl}
                alt=''
                className='h-44 w-full object-cover'
              />
            ) : null}
            <button
              type='button'
              onClick={e => {
                e.stopPropagation();
                setOpen(false);
              }}
              aria-label='Đóng'
              className={
                'absolute top-2 right-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white hover:text-neutral-900'
              }
            >
              ×
            </button>
            <div className='space-y-2 p-4'>
              <h3 className='text-base font-semibold tracking-tight text-neutral-900'>
                {el.content.title || 'Tiêu đề'}
              </h3>
              {el.content.body ? (
                <p className='text-sm leading-relaxed whitespace-pre-line text-neutral-600'>
                  {el.content.body}
                </p>
              ) : null}
              {el.content.ctaText ? (
                <a
                  href={el.content.ctaUrl || '#'}
                  onClick={e => e.stopPropagation()}
                  className='rounded-pill mt-1 inline-flex h-9 items-center bg-neutral-900 px-4 text-xs font-semibold text-white hover:bg-neutral-700'
                  target={el.content.ctaUrl ? '_blank' : undefined}
                  rel='noreferrer'
                >
                  {el.content.ctaText}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
