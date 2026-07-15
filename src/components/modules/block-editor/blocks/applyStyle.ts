import * as React from 'react';

import { resolveColorValue, resolveFontValue } from '@/lib/brand-kit';
import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStyle,
  ElementStylesMap,
} from '../types';

/**
 * Build an inline style for a given element key. Returns `undefined` if no
 * override is set so the renderer falls through to its default classes.
 */
export function elementStyleOf(
  styles: ElementStylesMap | undefined,
  key: string
): React.CSSProperties | undefined {
  if (!styles) return undefined;
  const s: ElementStyle | undefined = styles[key];
  if (!s) return undefined;
  const out: React.CSSProperties = {};
  // Controlled tokens (`token:primary`) resolve to CSS vars; legacy raw values
  // (a `#hex` color or a font id) pass through for back-compat.
  if (s.color) out.color = resolveColorValue(s.color);
  if (typeof s.fontSize === 'number') out.fontSize = `${s.fontSize}px`;
  if (typeof s.fontWeight === 'number') out.fontWeight = s.fontWeight;
  if (s.fontStyle) out.fontStyle = s.fontStyle;
  if (s.textDecoration) out.textDecoration = s.textDecoration;
  if (s.textAlign) out.textAlign = s.textAlign;
  if (s.fontFamily) out.fontFamily = resolveFontValue(s.fontFamily);
  if (s.backgroundColor)
    out.backgroundColor = resolveColorValue(s.backgroundColor);
  if (typeof s.opacity === 'number') out.opacity = s.opacity;
  if (Object.keys(out).length === 0) return undefined;
  return out;
}

/**
 * Visual hint classes for a selectable canvas element. Adds:
 * - cursor pointer
 * - dashed outline on hover
 * - solid ring when active
 * Combine with the element's existing classes via cn().
 */
/**
 * Build inline style for the block's root from a BlockBackground override.
 * Inline `backgroundColor` / `backgroundImage` win over the block's default
 * Tailwind classes, so this is safe to merge with existing className.
 */
export function blockBackgroundStyle(
  bg: BlockBackground | undefined
): React.CSSProperties | undefined {
  if (!bg) return undefined;
  const out: React.CSSProperties = {};
  if (bg.color) out.backgroundColor = resolveColorValue(bg.color);
  if (bg.imageUrl) {
    const safe = bg.imageUrl.replace(/"/g, '%22');
    out.backgroundImage = `url("${safe}")`;
    out.backgroundSize = 'cover';
    out.backgroundPosition = 'center';
  }
  if (Object.keys(out).length === 0) return undefined;
  return out;
}

export function selectableClass(active: boolean, base?: string): string {
  return cn(
    'cursor-pointer outline-offset-2 transition-[outline] duration-100 hover:outline hover:outline-1 hover:outline-dashed hover:outline-sky-400',
    active && 'outline outline-2 outline-sky-500 hover:outline-sky-500',
    base
  );
}

/**
 * Translate the block's `elementOrder` array into an inline `order` style for
 * a given element key. CSS `order` only takes effect within siblings of the
 * same flex container — so this naturally constrains reorder to "stackable"
 * elements within the same parent.
 *
 * Returns undefined for keys not in the order array, letting them keep their
 * natural DOM position. Pass through `additionalStyle` to merge with any
 * existing per-element style (color/font etc).
 */
/**
 * Apply a free-form drag offset as `transform: translate(...)`. Stays inside
 * the flex slot so siblings don't shift — used by the canvas drag handler.
 * Returns undefined for keys without an offset (or with zero offset) so we
 * don't bloat the inline style attribute.
 */
export function positionStyle(
  positions: ElementPositionsMap | undefined,
  key: string
): React.CSSProperties | undefined {
  const p = positions?.[key];
  if (!p) return undefined;
  if (p.x === 0 && p.y === 0) return undefined;
  return { transform: `translate(${p.x}px, ${p.y}px)` };
}

/**
 * Merge any number of partial CSSProperties into a single object, dropping
 * undefined parts. Returns `undefined` when no part contributed anything so
 * callers can omit the `style` prop entirely.
 */
export function composeStyle(
  ...parts: Array<React.CSSProperties | undefined>
): React.CSSProperties | undefined {
  const out: React.CSSProperties = {};
  let touched = false;
  for (const p of parts) {
    if (!p) continue;
    Object.assign(out, p);
    touched = true;
  }
  return touched ? out : undefined;
}

export function orderStyle(
  order: string[] | undefined,
  key: string,
  additionalStyle?: React.CSSProperties
): React.CSSProperties | undefined {
  const idx = order ? order.indexOf(key) : -1;
  if (idx === -1) return additionalStyle;
  return { order: idx, ...additionalStyle };
}
