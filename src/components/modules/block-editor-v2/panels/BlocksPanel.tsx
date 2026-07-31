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
import { GripVertical, Plus, X } from 'lucide-react';

import { cn } from '@/lib/cn';

import { BlockSceneThumb } from '../BlockSceneThumb';
import type { Block, Lang } from '@/components/modules/block-editor/types';

/**
 * The blocks in the current page, as a vertical list.
 *
 * Was the 100px `BlockSceneRail` pinned to the right edge, then full-width 16:9
 * cards in this panel. The cards were ~160px tall each, so a page of ten blocks
 * showed four — and reordering meant scrolling to find the other six. Rows put
 * the thumbnail beside the name instead of above it: same recognition, a third
 * of the height.
 *
 * The drag handle is its own target here. In the old rail the entire card was
 * both the drag handle and the click target, so a slightly-draggy click could
 * reorder the page when you only meant to switch blocks.
 */

interface BlocksPanelProps {
  blocks: Block[];
  activeId: string | null;
  lang: Lang;
  onSelect: (id: string) => void;
  onAdd?: () => void;
  onRemove?: (id: string) => void;
  onReorder?: (nextOrder: Block[]) => void;
}

export function BlocksPanel({
  blocks,
  activeId,
  lang,
  onSelect,
  onAdd,
  onRemove,
  onReorder,
}: BlocksPanelProps) {
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

  const addButton = (
    <button
      type='button'
      onClick={onAdd}
      aria-label='Thêm block'
      className='mt-1 flex w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-[var(--pv2-hair)] py-2 text-xs font-medium text-[var(--pv2-mut)] transition-colors hover:border-[var(--pv2-electric)] hover:text-[var(--pv2-electric)]'
    >
      <Plus className='size-3.5' />
      Thêm block
    </button>
  );

  if (blocks.length === 0) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-2 p-3 text-center'>
        <p className='text-2xs text-[var(--pv2-mut)]'>
          Trang này chưa có block nào.
        </p>
        {addButton}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map(b => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className='flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2'>
          {blocks.map((block, index) => (
            <SortableBlockCard
              key={block.id}
              block={block}
              index={index}
              lang={lang}
              active={block.id === activeId}
              onSelect={onSelect}
              onRemove={onRemove}
            />
          ))}
          {addButton}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableBlockCard({
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

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group relative flex h-14 shrink-0 items-center gap-2 rounded-md pr-1 pl-0.5 transition-colors',
        active
          ? 'bg-[var(--pv2-electric-soft)]'
          : 'hover:bg-[var(--pv2-paper)]',
        hidden && 'opacity-50',
        isDragging && 'z-10'
      )}
    >
      <span
        {...attributes}
        {...listeners}
        aria-label={`Kéo để sắp xếp ${block.name}`}
        className='shrink-0 cursor-grab text-[var(--pv2-slate-300)] transition-colors group-hover:text-[var(--pv2-mut)] active:cursor-grabbing'
      >
        <GripVertical className='size-3.5' />
      </span>

      {/*
        Div (not button): BlockSceneThumb renders the real block tree, which
        may contain <button>/<input>. Nesting those under a <button> is invalid
        HTML and triggers a React hydration error. Same pattern as BlockTabBar.
      */}
      <div
        role='button'
        tabIndex={0}
        data-testid={`block-tab-${block.blockType}`}
        data-active={active ? 'true' : 'false'}
        onClick={() => onSelect(block.id)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(block.id);
          }
        }}
        title={`${index + 1}. ${block.name}`}
        className='flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left'
      >
        <span
          aria-hidden
          className={cn(
            'pointer-events-none relative h-11 w-18 shrink-0 overflow-hidden rounded-sm bg-[var(--pv2-paper)] ring-1 transition-colors',
            active ? 'ring-[var(--pv2-electric)]' : 'ring-[var(--pv2-hair)]'
          )}
        >
          <BlockSceneThumb block={block} lang={lang} />
        </span>
        <span
          className={cn(
            'text-2xs min-w-0 flex-1 truncate font-medium',
            active ? 'text-[var(--pv2-ink)]' : 'text-[var(--pv2-mut)]'
          )}
        >
          {index + 1}. {block.name}
        </span>
      </div>

      {onRemove && (
        <button
          type='button'
          onClick={e => {
            e.stopPropagation();
            onRemove(block.id);
          }}
          aria-label='Xoá block'
          className={cn(
            'flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-[var(--pv2-faint)] transition-colors',
            'hover:bg-[var(--pv2-paper)] hover:text-[var(--pv2-error)]',
            'focus-visible:opacity-100',
            active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
          <X className='size-3.5' />
        </button>
      )}
    </div>
  );
}
