'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
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
import {
  Check,
  ChevronsUpDown,
  GripVertical,
  Home,
  Plus,
  X,
} from 'lucide-react';

import { cn } from '@/lib/cn';

import { BlockSceneThumb } from '../BlockSceneThumb';
import { FLOATING, R_FLOATING } from '../chrome';
import type { EditorPage } from '@/components/modules/block-editor/serialize';
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
  /**
   * Page context — the list above only ever shows ONE page's blocks, and with
   * several pages nothing in this panel said which. The switcher header names
   * the page and lets the user jump (or add) without leaving the Blocks tab.
   * All optional: block-direct mode has no pages at all.
   */
  pages?: EditorPage[];
  activePageId?: string;
  onSelectPage?: (id: string) => void;
  onAddPage?: () => void;
}

export function BlocksPanel({
  blocks,
  activeId,
  lang,
  onSelect,
  onAdd,
  onRemove,
  onReorder,
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
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

  const activePage = pages?.find(p => p.id === activePageId) ?? null;
  const pageSwitcher =
    pages && pages.length > 0 && activePage && onSelectPage ? (
      <PageSwitcher
        pages={pages}
        activePage={activePage}
        onSelectPage={onSelectPage}
        onAddPage={onAddPage}
      />
    ) : null;

  if (blocks.length === 0) {
    return (
      <div className='flex min-h-0 flex-1 flex-col'>
        {pageSwitcher}
        <div className='flex flex-1 flex-col items-center justify-center gap-2 p-3 text-center'>
          <p className='text-2xs text-[var(--pv2-mut)]'>
            Trang này chưa có block nào.
          </p>
          {addButton}
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {pageSwitcher}
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
    </div>
  );
}

/**
 * "Which page am I looking at?" header for the blocks list. Shows the active
 * page's name + slug; the popover lists every page (with its block count) to
 * switch, and offers "Thêm trang" so a multi-page flow never forces a detour
 * through the Pages tab.
 */
function PageSwitcher({
  pages,
  activePage,
  onSelectPage,
  onAddPage,
}: {
  pages: EditorPage[];
  activePage: EditorPage;
  onSelectPage: (id: string) => void;
  onAddPage?: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  const handleSelectPage = (id: string) => {
    setOpen(false);
    if (id !== activePage.id) onSelectPage(id);
  };

  const handleAddPage = () => {
    setOpen(false);
    onAddPage?.();
  };

  return (
    <div className='shrink-0 border-b border-[var(--pv2-hair)] px-2 py-1.5'>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          aria-label={`Trang hiện tại: ${activePage.name} — bấm để chuyển trang`}
          className='group flex w-full cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-[var(--pv2-paper)] data-[state=open]:bg-[var(--pv2-paper)]'
        >
          {activePage.isHome && (
            <Home className='size-3 shrink-0 text-[var(--pv2-mut)]' />
          )}
          <span className='flex min-w-0 flex-1 items-baseline gap-1.5'>
            <span className='text-2xs truncate font-semibold text-[var(--pv2-ink)]'>
              {activePage.name}
            </span>
            <span className='text-3xs shrink-0 text-[var(--pv2-faint)]'>
              /{activePage.slug}
            </span>
          </span>
          {pages.length > 1 && (
            <span className='text-3xs shrink-0 rounded-full bg-[var(--pv2-paper)] px-1.5 py-0.5 font-medium text-[var(--pv2-mut)] ring-1 ring-[var(--pv2-hair)]'>
              {pages.length} trang
            </span>
          )}
          <ChevronsUpDown className='size-3 shrink-0 text-[var(--pv2-faint)] transition-colors group-hover:text-[var(--pv2-mut)]' />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align='start'
            sideOffset={6}
            className={cn(
              'z-50 w-56 bg-[var(--pv2-paper)] p-1',
              R_FLOATING,
              FLOATING
            )}
          >
            {pages.map(page => {
              const isActive = page.id === activePage.id;
              return (
                <button
                  key={page.id}
                  type='button'
                  onClick={() => handleSelectPage(page.id)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-neutral-100',
                    isActive && 'bg-[var(--pv2-electric-soft)]'
                  )}
                >
                  <span className='flex min-w-0 flex-1 flex-col'>
                    <span className='flex min-w-0 items-center gap-1'>
                      {page.isHome && (
                        <Home className='size-3 shrink-0 text-[var(--pv2-mut)]' />
                      )}
                      <span className='text-2xs truncate font-medium text-[var(--pv2-ink)]'>
                        {page.name}
                      </span>
                    </span>
                    <span className='text-3xs truncate text-[var(--pv2-faint)]'>
                      /{page.slug} · {page.blocks.length} block
                    </span>
                  </span>
                  {isActive && (
                    <Check className='size-3.5 shrink-0 text-[var(--pv2-electric)]' />
                  )}
                </button>
              );
            })}

            {onAddPage && (
              <>
                <div className='mx-1 my-1 border-t border-[var(--pv2-hair)]' />
                <button
                  type='button'
                  onClick={handleAddPage}
                  className='flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-[var(--pv2-mut)] transition-colors hover:bg-neutral-100 hover:text-[var(--pv2-ink)]'
                >
                  <Plus className='size-3.5' />
                  Thêm trang
                </button>
              </>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
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
