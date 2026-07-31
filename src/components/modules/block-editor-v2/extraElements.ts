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
} from '@/components/modules/block-editor/types';

/** Default size per kind — sensible starting box dimensions in px. */
const DEFAULT_SIZE: Record<ExtraElementKind, ExtraSize> = {
  text: { width: 200, height: 48 },
  edit_text: { width: 280, height: 44 },
  photo: { width: 240, height: 180 },
  video: { width: 480, height: 270 },
  // Hotspot pin chip. Bump from 28→36 so the symbol + ring are obvious on
  // first add (28×28 with a thick ring left almost no room for the label).
  hotspot: { width: 36, height: 36 },
  compare: { width: 480, height: 320 },
  range: { width: 280, height: 56 },
  countdown: { width: 360, height: 120 },
  reveal: { width: 320, height: 240 },
  spin_wheel: { width: 320, height: 320 },
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
    case 'compare':
      return {
        id,
        kind: 'compare',
        position,
        size,
        zIndex: 1,
        content: {
          beforeUrl:
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
          afterUrl:
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80',
          defaultRatio: 0.5,
          beforeAlt: 'Trước',
          afterAlt: 'Sau',
        },
        style: { borderRadius: 8 },
      };
    case 'range':
      return {
        id,
        kind: 'range',
        position,
        size,
        zIndex: 1,
        content: {
          fieldName: 'range_value',
          label: 'Giá trị',
          min: 0,
          max: 100,
          step: 1,
          defaultValue: 50,
          showValue: true,
        },
        style: {
          ...baseStyle,
          backgroundColor: '#0ea5e9',
          color: '#0a0a0a',
        },
      };
    case 'countdown': {
      // 7 days into the future by default so the timer ticks visibly.
      const target = new Date();
      target.setDate(target.getDate() + 7);
      return {
        id,
        kind: 'countdown',
        position,
        size,
        zIndex: 5,
        content: {
          targetIso: target.toISOString(),
          units: ['days', 'hours', 'minutes', 'seconds'],
          label: 'Còn',
          expiredText: 'Đã kết thúc',
          style: 'flat',
        },
        style: {
          ...baseStyle,
          fontSize: 28,
          fontWeight: 700,
          color: '#0a0a0a',
          textAlign: 'center',
        },
      };
    }
    case 'reveal':
      return {
        id,
        kind: 'reveal',
        position,
        size,
        zIndex: 4,
        content: {
          coverUrl:
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
          revealUrl:
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
          mode: 'scratch',
          brushSize: 60,
        },
        style: { borderRadius: 8 },
      };
    case 'spin_wheel':
      return {
        id,
        kind: 'spin_wheel',
        position,
        size,
        zIndex: 6,
        content: {
          segments: [
            { id: 's1', label: '10%', color: '#0ea5e9', prize: 'Giảm 10%' },
            { id: 's2', label: '5%', color: '#a855f7', prize: 'Giảm 5%' },
            { id: 's3', label: '20%', color: '#22c55e', prize: 'Giảm 20%' },
            { id: 's4', label: 'Thử lại', color: '#64748b' },
            {
              id: 's5',
              label: 'Free ship',
              color: '#f59e0b',
              prize: 'Miễn phí ship',
            },
            { id: 's6', label: '15%', color: '#ef4444', prize: 'Giảm 15%' },
          ],
          spinDurationMs: 4000,
          buttonLabel: 'Quay',
        },
        style: {
          ...baseStyle,
          color: '#ffffff',
          fontWeight: 700,
        },
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
          imageUrl: '',
          ctaText: '',
          ctaUrl: '',
          trigger: 'click',
        },
        // Bright sky-blue pin with white text + thick white ring so it stays
        // visible on photos of any palette (was previously white-on-white,
        // effectively invisible over bright stock imagery).
        style: {
          backgroundColor: '#0ea5e9',
          color: '#ffffff',
          borderRadius: 999,
          fontSize: 16,
          fontWeight: 700,
          fontFamily: 'inter',
          borderColor: '#ffffff',
          borderWidth: 3,
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
