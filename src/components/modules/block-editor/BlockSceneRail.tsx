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
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, X } from 'lucide-react';

import { cn } from '@/lib/cn';

import { BlockSceneThumb } from './BlockSceneThumb';
import type { Block, Lang } from './types';

interface BlockSceneRailProps {
  blocks: Block[];
  activeId: string | null;
  lang: Lang;
  onSelect: (id: string) => void;
  onAdd?: () => void;
  onRemove?: (id: string) => void;
  onReorder?: (nextOrder: Block[]) => void;
}

export function BlockSceneRail({
  blocks,
  activeId,
  lang,
  onSelect,
  onAdd,
  onRemove,
  onReorder,
}: BlockSceneRailProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;
    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(blocks, oldIndex, newIndex));
  };

  if (blocks.length === 0) {
    return (
      <aside className='flex w-[100px] shrink-0 flex-col border-l border-neutral-200/80 bg-neutral-50/90'>
        <div className='border-b border-neutral-200/80 px-2 py-2'>
          <span className='text-3xs font-semibold text-neutral-500'>
            blocks
          </span>
        </div>
        <div className='flex flex-1 flex-col items-center justify-center p-2'>
          <button
            type='button'
            onClick={onAdd}
            aria-label='Thêm block'
            className='flex aspect-[16/9] w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-700'
          >
            <Plus className='size-4' />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className='flex w-[100px] shrink-0 flex-col border-l border-neutral-200/80 bg-neutral-50/90'>
      <div className='shrink-0 border-b border-neutral-200/80 px-2 py-2'>
        <span className='text-3xs font-semibold text-neutral-500'>blocks</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className='flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto py-2.5 pr-2.5 pl-2'>
            {blocks.map((block, index) => (
              <SortableRailTab
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
              className='flex aspect-[16/9] w-full shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-700'
            >
              <Plus className='size-3.5' />
            </button>
          </div>
        </SortableContext>
      </DndContext>
    </aside>
  );
}

function SortableRailTab({
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
      className={cn('flex shrink-0 flex-col gap-0.5', isDragging && 'z-10')}
    >
      <div className='relative'>
        <div
          {...attributes}
          {...listeners}
          data-testid={`block-tab-${block.blockType}`}
          data-active={active ? 'true' : 'false'}
          className={cn(
            'group relative aspect-video w-full cursor-pointer overflow-hidden rounded-md border bg-white transition-all',
            active
              ? 'border-neutral-900 shadow-md ring-1 ring-neutral-900'
              : 'border-neutral-200 hover:border-neutral-400',
            hidden && 'opacity-50',
            isDragging && 'shadow-lg'
          )}
          onClick={() => onSelect(block.id)}
        >
          <BlockSceneThumb block={block} lang={lang} />
        </div>

        {active && onRemove && (
          <button
            type='button'
            onClick={e => {
              e.stopPropagation();
              onRemove(block.id);
            }}
            aria-label='Xoá block'
            className='absolute -top-1.5 -right-1.5 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full bg-rose-500 text-white shadow-md transition-transform hover:scale-110'
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
