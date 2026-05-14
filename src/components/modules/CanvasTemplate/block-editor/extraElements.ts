/**
 * Pure helpers for `Block.extraElements` mutations. All functions return a
 * NEW Block when something changes (immutable update style — matches the
 * editor's existing patch flow).
 *
 * Spec: `docs/be-extra-elements-spec.md`.
 */

import type {
  Block,
  ExtraElement,
  ExtraElementKind,
  ExtraPosition,
  ExtraSize,
} from './types';

/** Default size per kind — sensible starting box dimensions in px. */
const DEFAULT_SIZE: Record<ExtraElementKind, ExtraSize> = {
  text: { width: 200, height: 48 },
  edit_text: { width: 280, height: 44 },
  photo: { width: 240, height: 180 },
  video: { width: 480, height: 270 },
  // Hotspot pin is a small dot — popover floats from it; size = pin chip.
  hotspot: { width: 28, height: 28 },
};

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `el_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
  return `el_${Math.random().toString(36).slice(2, 14)}`;
}

/**
 * Factory — builds a fresh ExtraElement of the given kind with sensible
 * defaults. The caller places it on canvas at the given position.
 */
export function makeExtraElement(
  kind: ExtraElementKind,
  position: ExtraPosition
): ExtraElement {
  const id = newId();
  const size = DEFAULT_SIZE[kind];
  const baseStyle = {
    fontFamily: 'inter',
    fontSize: 16,
    color: '#0a0a0a',
  } as const;

  switch (kind) {
    case 'text':
      return {
        id,
        kind: 'text',
        position,
        size,
        zIndex: 1,
        content: { text: 'Text mới' },
        style: { ...baseStyle, fontWeight: 600 },
      };
    case 'edit_text':
      return {
        id,
        kind: 'edit_text',
        position,
        size,
        zIndex: 1,
        content: {
          placeholder: 'Nhập…',
          fieldName: `field_${id.slice(3, 9)}`,
          inputType: 'text',
          isRequired: false,
        },
        style: {
          ...baseStyle,
          backgroundColor: '#fff',
          borderColor: '#e5e5e5',
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
        },
      };
    case 'photo':
      return {
        id,
        kind: 'photo',
        position,
        size,
        zIndex: 1,
        content: { mediaId: '' },
        style: { borderRadius: 12, objectFit: 'cover' },
      };
    case 'video':
      return {
        id,
        kind: 'video',
        position,
        size,
        zIndex: 1,
        content: { source: 'url', url: '' },
        style: { controls: true },
      };
    case 'hotspot':
      return {
        id,
        kind: 'hotspot',
        position,
        size,
        zIndex: 10, // hotspots float above content by default
        content: {
          pinLabel: '+',
          title: 'Tiêu đề popup',
          body: 'Mô tả chi tiết khi user click vào pin.',
          trigger: 'click',
        },
        style: {
          backgroundColor: '#ffffff',
          color: '#0a0a0a',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 700,
          fontFamily: 'inter',
          borderColor: '#0a0a0a',
          borderWidth: 2,
        },
      };
  }
}

export function getExtraElement(
  block: Block,
  elementId: string
): ExtraElement | undefined {
  return block.extraElements?.find(e => e.id === elementId);
}

export function addExtraElement(block: Block, el: ExtraElement): Block {
  return {
    ...block,
    extraElements: [...(block.extraElements ?? []), el],
  };
}

export function removeExtraElement(block: Block, elementId: string): Block {
  if (!block.extraElements?.length) return block;
  return {
    ...block,
    extraElements: block.extraElements.filter(e => e.id !== elementId),
  };
}

/**
 * Patch one element. The `patch` arg is merged shallowly into the matching
 * element; `content` and `style` are deep-merged one level so callers can
 * pass partials (e.g. `{ content: { text: 'foo' } }`).
 */
export function patchExtraElement(
  block: Block,
  elementId: string,
  patch: Partial<ExtraElement>
): Block {
  if (!block.extraElements?.length) return block;
  return {
    ...block,
    extraElements: block.extraElements.map(e => {
      if (e.id !== elementId) return e;
      // Discriminated union merge — TS can't track narrowing across spread,
      // so we cast via `unknown` once after building the merged shape.
      const patchContent =
        (patch as { content?: Record<string, unknown> }).content ?? null;
      const patchStyle =
        (patch as { style?: Record<string, unknown> }).style ?? null;
      const merged = {
        ...e,
        ...patch,
        kind: e.kind, // preserve discriminator
        content: patchContent
          ? {
              ...(e.content as unknown as Record<string, unknown>),
              ...patchContent,
            }
          : e.content,
        style: patchStyle ? { ...(e.style ?? {}), ...patchStyle } : e.style,
      };
      return merged as unknown as ExtraElement;
    }),
  };
}

/** Convenience: bring to front (zIndex = max + 1). */
export function bringToFront(block: Block, elementId: string): Block {
  const els = block.extraElements ?? [];
  const max = els.reduce((m, e) => Math.max(m, e.zIndex ?? 0), 0);
  return patchExtraElement(block, elementId, { zIndex: max + 1 });
}

/** Convenience: send to back (zIndex = min - 1, floor at 0). */
export function sendToBack(block: Block, elementId: string): Block {
  const els = block.extraElements ?? [];
  const min = els.reduce(
    (m, e) => Math.min(m, e.zIndex ?? 0),
    Number.POSITIVE_INFINITY
  );
  return patchExtraElement(block, elementId, {
    zIndex: Math.max(0, (Number.isFinite(min) ? min : 0) - 1),
  });
}
