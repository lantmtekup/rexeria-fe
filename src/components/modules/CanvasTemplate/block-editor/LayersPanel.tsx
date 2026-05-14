'use client';

import * as React from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FormInput,
  Grid3x3,
  GripVertical,
  Image as ImageIcon,
  ListChecks,
  MousePointerClick,
  Paintbrush,
  Pilcrow,
  SquareDashed,
  Type,
} from 'lucide-react';

import { cn } from '@/lib/cn';

import { AddExtraElementButton } from './AddExtraElementButton';
import { ExtraElementsList } from './ExtraElementsList';
import {
  editingVariantOf,
  hasMobileOverride,
  readVariant,
  type Block,
  type BlockType,
  type Device,
  type ExtraElementKind,
} from './types';

export interface LayerElement {
  key: string;
  label: string;
  icon: React.ElementType;
}

interface LayersPanelProps {
  block: Block;
  device: Device;
  selectedKey: string | null;
  onSelectKey: (key: string | null) => void;
  /** Persist a new order to the block's elementOrder field. */
  onReorder?: (nextOrder: string[]) => void;
  /** ExtraElements (free-drag user-added objects). Optional — when omitted
   *  the panel hides the "+ Thêm element" affordance entirely. */
  selectedExtraElementId?: string | null;
  onAddExtraElement?: (kind: ExtraElementKind) => void;
  onSelectExtraElement?: (id: string | null) => void;
  onRemoveExtraElement?: (id: string) => void;
}

export const BACKGROUND_LAYER_KEY = '__background__';

const BACKGROUND_LAYER: LayerElement = {
  key: BACKGROUND_LAYER_KEY,
  label: 'Nền (màu / ảnh)',
  icon: Paintbrush,
};

export const ELEMENTS_BY_TYPE: Partial<Record<BlockType, LayerElement[]>> = {
  hero_split: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'imageUrl', label: 'Ảnh hero', icon: ImageIcon },
    { key: 'stats', label: 'Thống kê', icon: SquareDashed },
    { key: 'ctaText', label: 'Nút CTA', icon: MousePointerClick },
  ],
  hero_overlay: [
    BACKGROUND_LAYER,
    { key: 'tag', label: 'Tag', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'subtitle', label: 'Mô tả', icon: Pilcrow },
    { key: 'backgroundUrl', label: 'Ảnh nền', icon: ImageIcon },
    { key: 'ctaText', label: 'Nút CTA', icon: MousePointerClick },
  ],
  feature_section: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'features', label: 'Danh sách tiện ích', icon: Grid3x3 },
  ],
  photo_gallery: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'photos', label: 'Bộ ảnh', icon: ImageIcon },
  ],
  booking_form: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'reasons', label: 'Lý do', icon: ListChecks },
    { key: 'submitText', label: 'Nút gửi', icon: MousePointerClick },
    { key: 'noteText', label: 'Ghi chú', icon: FormInput },
  ],
  cta_section: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'subtitle', label: 'Mô tả', icon: Pilcrow },
    { key: 'backgroundUrl', label: 'Ảnh nền', icon: ImageIcon },
    { key: 'primaryText', label: 'CTA chính', icon: MousePointerClick },
    { key: 'secondaryText', label: 'CTA phụ', icon: MousePointerClick },
  ],
};

export function LayersPanel({
  block,
  device,
  selectedKey,
  onSelectKey,
  onReorder,
  selectedExtraElementId = null,
  onAddExtraElement,
  onSelectExtraElement,
  onRemoveExtraElement,
}: LayersPanelProps) {
  const extras = block.extraElements ?? [];
  const showExtraSection = !!onAddExtraElement;
  const baseElements = React.useMemo(
    () => ELEMENTS_BY_TYPE[block.blockType] ?? [],
    [block.blockType]
  );

  // Stored order for the active variant (or fall back to the natural order).
  // Background layer is never reorderable so we keep it pinned at top.
  const variant = editingVariantOf(device);
  const storedOrder = readVariant(block.elementOrder, device);
  const naturalOrder = React.useMemo(
    () => baseElements.map(e => e.key),
    [baseElements]
  );
  // Merge: any keys in storedOrder first (filtered to existing), then any
  // baseElement keys not yet in stored order (handles new fields gracefully).
  const order = React.useMemo<string[]>(() => {
    if (!storedOrder?.length) return naturalOrder;
    const set = new Set(storedOrder);
    const merged = [
      ...storedOrder.filter(k => baseElements.some(e => e.key === k)),
      ...naturalOrder.filter(k => !set.has(k)),
    ];
    return merged;
  }, [storedOrder, naturalOrder, baseElements]);

  const orderedElements = React.useMemo(
    () =>
      order
        .map(key => baseElements.find(e => e.key === key))
        .filter((e): e is LayerElement => Boolean(e)),
    [order, baseElements]
  );

  // Mouse + touch sensors split — TouchSensor needs a small delay to
  // distinguish drag from scroll on mobile. MouseSensor uses distance so
  // a quick click stays a click. KeyboardSensor enables a11y reorder.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Track drag state for the status banner — gives users a visible cue that
  // dnd-kit picked up their pointer (vs. silent failure when sensors don't fire).
  const [dragState, setDragState] = React.useState<{
    activeKey: string | null;
    overKey: string | null;
    didReorder: boolean;
  }>({ activeKey: null, overKey: null, didReorder: false });

  const handleDragStart = (event: DragStartEvent) => {
    setDragState({
      activeKey: event.active.id as string,
      overKey: null,
      didReorder: false,
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    setDragState(s => ({ ...s, overKey: (event.over?.id as string) ?? null }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    let didReorder = false;
    if (over && active.id !== over.id) {
      const oldIndex = order.indexOf(active.id as string);
      const newIndex = order.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        const next = arrayMove(order, oldIndex, newIndex);
        onReorder?.(next);
        didReorder = true;
      }
    }
    setDragState({ activeKey: null, overKey: null, didReorder });
    // Clear `didReorder` flash after a short delay.
    if (didReorder) {
      window.setTimeout(
        () => setDragState(s => ({ ...s, didReorder: false })),
        1200
      );
    }
  };

  const handleDragCancel = () => {
    setDragState({ activeKey: null, overKey: null, didReorder: false });
  };

  const labelOf = (key: string | null) =>
    key ? (baseElements.find(e => e.key === key)?.label ?? key) : null;

  // Suppress unused warning for `variant` — kept for potential future variant-aware UI.
  void variant;

  if (!orderedElements.length) {
    return (
      <div className='p-4 text-xs text-neutral-500'>
        Block <strong>{block.name}</strong> chưa khai báo các phần tử lớp.
      </div>
    );
  }

  // Drive a visible status banner so users can confirm the drag system is alive.
  const isDragging = dragState.activeKey !== null;
  const statusTone = isDragging
    ? 'bg-sky-50 text-sky-700 ring-sky-200'
    : dragState.didReorder
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      : 'bg-neutral-50 text-neutral-600 ring-neutral-200';
  const statusLabel = isDragging
    ? `Đang kéo: ${labelOf(dragState.activeKey)}` +
      (dragState.overKey && dragState.overKey !== dragState.activeKey
        ? ` → thả vào ${labelOf(dragState.overKey)}`
        : '')
    : dragState.didReorder
      ? '✓ Đã đổi thứ tự'
      : 'Sẵn sàng — kéo lớp để sắp xếp';

  return (
    <div
      className='flex flex-col gap-2 p-3'
      data-drag-state={isDragging ? 'dragging' : 'idle'}
    >
      {showExtraSection ? (
        <section className='flex flex-col gap-1.5 rounded-md bg-white p-2 ring-1 ring-neutral-200'>
          <AddExtraElementButton onPick={kind => onAddExtraElement?.(kind)} />
          {extras.length > 0 ? (
            <ExtraElementsList
              elements={extras}
              selectedId={selectedExtraElementId}
              onSelect={id => onSelectExtraElement?.(id)}
              onRemove={id => onRemoveExtraElement?.(id)}
            />
          ) : null}
        </section>
      ) : null}

      {/* Status banner — visible drag state for debugging / UX confirmation. */}
      <div
        className={cn(
          'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium ring-1 transition-colors',
          statusTone
        )}
        role='status'
        aria-live='polite'
      >
        <span
          className={cn(
            'size-1.5 shrink-0 rounded-full',
            isDragging
              ? 'animate-pulse bg-sky-500'
              : dragState.didReorder
                ? 'bg-emerald-500'
                : 'bg-neutral-400'
          )}
        />
        <span className='flex-1 truncate'>{statusLabel}</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={orderedElements.map(e => e.key)}
          strategy={verticalListSortingStrategy}
        >
          <div className='flex flex-col gap-1.5'>
            {orderedElements.map(element => {
              const isOver = dragState.overKey === element.key;
              const overFromAbove =
                isOver &&
                dragState.activeKey !== null &&
                order.indexOf(dragState.activeKey) > order.indexOf(element.key);
              return (
                <LayerRow
                  key={element.key}
                  element={element}
                  active={selectedKey === element.key}
                  isAnyDragging={dragState.activeKey !== null}
                  dropIndicator={
                    isOver ? (overFromAbove ? 'above' : 'below') : null
                  }
                  hasStyle={
                    element.key === BACKGROUND_LAYER_KEY
                      ? !!block.background?.desktop
                      : !!block.elementStyles?.desktop?.[element.key]
                  }
                  color={
                    element.key === BACKGROUND_LAYER_KEY
                      ? block.background?.desktop?.color
                      : block.elementStyles?.desktop?.[element.key]?.color
                  }
                  mobileOverride={hasMobileOverride(block, element.key)}
                  onSelect={() =>
                    onSelectKey(
                      selectedKey === element.key ? null : element.key
                    )
                  }
                />
              );
            })}
          </div>
        </SortableContext>

        {/* Floating ghost — Figma/Canva style drag preview. */}
        <DragOverlay
          dropAnimation={{
            duration: 180,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1)',
          }}
        >
          {dragState.activeKey
            ? (() => {
                const el = baseElements.find(
                  e => e.key === dragState.activeKey
                );
                if (!el) return null;
                return <DragGhost element={el} />;
              })()
            : null}
        </DragOverlay>
      </DndContext>
      <p className='mt-1 text-[10px] text-neutral-400'>
        Click 1 lớp để mở popup chỉnh sửa. Kéo (≥4px) để sắp xếp lại.
      </p>
    </div>
  );
}

function LayerRow({
  element,
  active,
  color,
  mobileOverride,
  isAnyDragging,
  dropIndicator,
  onSelect,
}: {
  element: LayerElement;
  active: boolean;
  hasStyle: boolean;
  color?: string;
  mobileOverride?: boolean;
  /** True when ANY row is being dragged (used to dim non-target rows). */
  isAnyDragging: boolean;
  /** Where the drop indicator line should render relative to this row. */
  dropIndicator: 'above' | 'below' | null;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.key });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = element.icon;

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      data-testid={`layer-row-${element.key}`}
      data-layer-key={element.key}
      data-dragging={isDragging ? 'true' : undefined}
      className={cn(
        'group relative flex items-center gap-2 rounded-md border bg-white px-2 py-2 transition-all select-none',
        active
          ? 'border-sky-500 ring-1 ring-sky-500'
          : 'border-neutral-200 hover:border-sky-400 hover:bg-sky-50/50',
        // Source row while being dragged: faded + flat (Figma pattern)
        isDragging && 'opacity-30',
        // Other rows while ANY row is being dragged: subtle non-interactive
        !isDragging && isAnyDragging && 'cursor-default'
      )}
    >
      {/* ── Drop indicator line (Figma/Canva style) ────────────────────── */}
      {dropIndicator && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -right-1 -left-1 z-20 flex items-center',
            dropIndicator === 'above' ? '-top-1' : '-bottom-1'
          )}
        >
          {/* Round terminator */}
          <span className='size-2 rounded-full bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,0.18)]' />
          {/* Animated line */}
          <span className='-ml-0.5 h-0.5 flex-1 rounded-full bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,0.18)]' />
          <span className='size-2 rounded-full bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,0.18)]' />
        </span>
      )}

      {/* ── Dedicated drag handle (clearer affordance, like Notion/Figma) */}
      <button
        ref={setActivatorNodeRef}
        type='button'
        {...attributes}
        {...listeners}
        aria-label={`Kéo để sắp xếp ${element.label}`}
        title='Kéo để sắp xếp'
        data-testid={`layer-drag-handle-${element.key}`}
        className={cn(
          'flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded transition-colors select-none active:cursor-grabbing',
          'text-neutral-300 hover:bg-sky-100 hover:text-sky-700',
          isDragging && 'cursor-grabbing bg-sky-100 text-sky-700'
        )}
      >
        <GripVertical className='size-4' />
      </button>

      {/* ── Click target for selection (separate from drag) ──────────── */}
      <button
        type='button'
        onClick={onSelect}
        className='flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left'
      >
        <Icon className='size-3.5 shrink-0 text-neutral-500' />
        <span className='flex-1 truncate text-xs text-neutral-700 group-hover:text-neutral-900'>
          {element.label}
        </span>
        {color && (
          <span
            aria-hidden
            className='size-3 shrink-0 rounded-sm border border-neutral-200'
            style={{ backgroundColor: color }}
          />
        )}
        {mobileOverride && (
          <span
            aria-label='Đã tuỳ biến cho mobile'
            title='Đã tuỳ biến cho mobile'
            data-testid='layer-mobile-badge'
            className='inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-tight text-emerald-700 ring-1 ring-emerald-200/80'
          >
            📱
          </span>
        )}
      </button>
    </div>
  );
}

// ─── Drag ghost — floating preview that follows the cursor ────────────────

function DragGhost({ element }: { element: LayerElement }) {
  const Icon = element.icon;
  return (
    <div
      className='flex cursor-grabbing items-center gap-2 rounded-md border border-sky-400 bg-white px-2 py-2 shadow-2xl ring-2 ring-sky-300/60'
      style={{
        // Slight tilt for tactile feel — matches Figma/Canva drag preview.
        transform: 'rotate(-2deg) scale(1.02)',
      }}
    >
      <span className='flex size-7 shrink-0 items-center justify-center rounded bg-sky-100 text-sky-700'>
        <GripVertical className='size-4' />
      </span>
      <Icon className='size-3.5 shrink-0 text-neutral-500' />
      <span className='text-xs font-semibold text-neutral-900'>
        {element.label}
      </span>
    </div>
  );
}
