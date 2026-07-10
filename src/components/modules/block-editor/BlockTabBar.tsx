'use client';

import * as React from 'react';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Maximize, Maximize2, Minus, Plus, X } from 'lucide-react';

import { cn } from '@/lib/cn';

import { RenderBlock } from './blocks/renderBlock';
import type { Block, Lang } from './types';

interface BlockTabBarProps {
  blocks: Block[];
  activeId: string | null;
  lang: Lang;
  zoom: number;
  onSelect: (id: string) => void;
  onAdd?: () => void;
  onRemove?: (id: string) => void;
  onReorder?: (nextOrder: Block[]) => void;
  onZoomChange: (zoom: number) => void;
  /** Fit device frame to the visible canvas surface. */
  onFitToFrame?: () => void;
  /** Block mode: chỉ có 1 block nên ẩn dải tab + nút thêm, chỉ giữ thanh zoom. */
  hideTabs?: boolean;
}

const ZOOM_MIN = 25;
const ZOOM_MAX = 200;
const ZOOM_STEP = 5;

export function BlockTabBar({
  blocks,
  activeId,
  lang,
  zoom,
  onSelect,
  onAdd,
  onRemove,
  onReorder,
  onZoomChange,
  onFitToFrame,
  hideTabs,
}: BlockTabBarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  // Block mode: chỉ 1 block → bỏ dải tab + nút thêm, chỉ giữ thanh zoom (canh giữa).
  // Absolute trong cột canvas — không chiếm chiều cao; co theo panel Lớp mở/đóng.
  if (hideTabs) {
    return (
      <div className='pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-3'>
        <div className='pointer-events-auto rounded-lg shadow-lg'>
          <ZoomControls
            zoom={zoom}
            onChange={onZoomChange}
            onFitToFrame={onFitToFrame}
          />
        </div>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;
    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(blocks, oldIndex, newIndex));
  };

  return (
    <div className='pointer-events-none absolute inset-x-0 bottom-0 z-20 px-3 pb-3'>
      <div className='pointer-events-auto flex items-end gap-3 rounded-xl border border-neutral-200 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm'>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map(b => b.id)}
            strategy={horizontalListSortingStrategy}
          >
            {/* min-w-0: cho phép flex item co đúng cách để overflow-x-auto cuộn
              trong strip thay vì collapse rồi để nút "Thêm block" tràn đè lên
              ZoomControls ở viewport hẹp (QA F1). */}
            <div className='flex min-w-0 flex-1 items-end gap-2 overflow-x-auto pb-1'>
              {blocks.map((block, index) => (
                <SortableTab
                  key={block.id}
                  block={block}
                  index={index}
                  lang={lang}
                  active={block.id === activeId}
                  onSelect={onSelect}
                  onRemove={onRemove}
                />
              ))}
              <button
                type='button'
                onClick={onAdd}
                aria-label='Thêm block'
                className='ml-1 flex h-[64px] w-[88px] shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed border-neutral-300 text-neutral-500 transition-colors hover:border-neutral-900 hover:text-neutral-900'
              >
                <Plus className='size-4' />
              </button>
            </div>
          </SortableContext>
        </DndContext>

        <ZoomControls
          zoom={zoom}
          onChange={onZoomChange}
          onFitToFrame={onFitToFrame}
        />
      </div>
    </div>
  );
}

function SortableTab({
  block,
  index,
  lang,
  active,
  onSelect,
  onRemove,
}: {
  block: Block;
  index: number;
  lang: Lang;
  active: boolean;
  onSelect: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const hidden = !block.isVisible;
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex w-[112px] shrink-0 flex-col gap-1',
        isDragging && 'z-10'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        data-testid={`block-tab-${block.blockType}`}
        data-active={active ? 'true' : 'false'}
        className={cn(
          'group relative aspect-[16/9] w-full cursor-pointer overflow-hidden rounded-md border bg-white transition-all',
          active
            ? 'border-neutral-900 shadow-md ring-1 ring-neutral-900'
            : 'border-neutral-200 hover:border-neutral-400',
          hidden && 'opacity-50',
          isDragging && 'shadow-lg'
        )}
        onClick={() => onSelect(block.id)}
      >
        <ThumbnailRenderer block={block} lang={lang} />

        {active && onRemove && (
          <button
            type='button'
            onClick={e => {
              e.stopPropagation();
              onRemove(block.id);
            }}
            aria-label='Xoá block'
            className='absolute -top-1.5 -right-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full bg-rose-500 text-white shadow-md transition-transform hover:scale-110'
          >
            <X className='size-3' />
          </button>
        )}
      </div>

      <span
        className={cn(
          'text-3xs px-0.5 font-medium tracking-wide',
          active ? 'text-neutral-900' : 'text-neutral-500'
        )}
      >
        {index + 1}. {block.name.toUpperCase()}
      </span>
    </div>
  );
}

function ThumbnailRenderer({ block, lang }: { block: Block; lang: Lang }) {
  // Thumbnails always show the desktop variant (canvas tab bar previews
  // map to the canonical desktop layout, regardless of editor device mode).
  const langContent = lang === 'vi' ? block.contentVi : block.contentEn;
  const content = langContent.desktop;
  const styles = block.elementStyles?.desktop;
  const background = block.background?.desktop;
  const order = block.elementOrder?.desktop;
  const baseWidth = 1280;
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(0.087);

  React.useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect.width;
      setScale(Math.max(0.04, w / baseWidth));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const inner = (
    <RenderBlock
      block={block}
      content={content}
      styles={styles}
      background={background}
      order={order}
      fallback={
        <div className='text-3xs flex aspect-[16/9] w-full items-center justify-center bg-neutral-100 font-semibold tracking-widest text-neutral-400 uppercase'>
          {block.name}
        </div>
      }
    />
  );

  return (
    <div ref={ref} className='absolute inset-0 overflow-hidden'>
      <div
        className='origin-top-left'
        style={{
          width: baseWidth,
          transform: `scale(${scale})`,
        }}
      >
        {inner}
      </div>
    </div>
  );
}

function ZoomControls({
  zoom,
  onChange,
  onFitToFrame,
}: {
  zoom: number;
  onChange: (next: number) => void;
  onFitToFrame?: () => void;
}) {
  const clamp = (n: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, n));
  return (
    <div className='flex shrink-0 items-center gap-1.5 self-center rounded-md border border-neutral-200 bg-white px-2 py-1.5'>
      <button
        type='button'
        aria-label='Thu nhỏ'
        onClick={() => onChange(clamp(zoom - ZOOM_STEP))}
        disabled={zoom <= ZOOM_MIN}
        className='flex size-6 cursor-pointer items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
      >
        <Minus className='size-3.5' />
      </button>
      <input
        type='range'
        min={ZOOM_MIN}
        max={ZOOM_MAX}
        step={1}
        value={zoom}
        onChange={e => onChange(Number(e.target.value))}
        className='h-1 w-24 accent-neutral-900'
        aria-label='Mức zoom'
      />
      <button
        type='button'
        aria-label='Phóng to'
        onClick={() => onChange(clamp(zoom + ZOOM_STEP))}
        disabled={zoom >= ZOOM_MAX}
        className='flex size-6 cursor-pointer items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
      >
        <Plus className='size-3.5' />
      </button>
      <span className='text-2xs min-w-[36px] text-right font-medium text-neutral-600 tabular-nums'>
        {Math.round(zoom)}%
      </span>
      {onFitToFrame && (
        <button
          type='button'
          aria-label='Vừa khung hiện tại'
          title='Vừa khung hiện tại'
          onClick={onFitToFrame}
          className='flex size-6 cursor-pointer items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900'
        >
          <Maximize2 className='size-3.5' />
        </button>
      )}
      <button
        type='button'
        aria-label='Zoom 100%'
        title='Zoom 100%'
        onClick={() => onChange(100)}
        className='flex size-6 cursor-pointer items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900'
      >
        <Maximize className='size-3.5' />
      </button>
    </div>
  );
}
