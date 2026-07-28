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
import { Plus, X } from 'lucide-react';

import { cn } from '@/lib/cn';

import { ZoomControls } from './CanvasZoomBar';
import { BlockSceneThumb } from './BlockSceneThumb';
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
    <div className='pointer-events-none absolute inset-x-0 bottom-0 z-20 px-2 pb-2'>
      <div className='pointer-events-auto flex items-end gap-2 rounded-lg border border-neutral-200/90 bg-white/95 px-2 py-1.5 shadow-md backdrop-blur-sm'>
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
            <div className='flex min-w-0 flex-1 items-end gap-1.5 overflow-x-auto pb-0.5'>
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
                className='ml-0.5 flex h-[52px] w-[68px] shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-700'
              >
                <Plus className='size-3.5' />
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
        'flex w-[88px] shrink-0 flex-col gap-0.5',
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
        <BlockSceneThumb block={block} lang={lang} />

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
          'text-3xs truncate px-0.5 font-medium',
          active ? 'text-neutral-900' : 'text-neutral-500'
        )}
        title={`${index + 1}. ${block.name}`}
      >
        {index + 1}. {block.name}
      </span>
    </div>
  );
}
