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
  Copy,
  GripVertical,
  Home,
  MoreVertical,
  Plus,
  Settings2,
  Trash2,
} from 'lucide-react';

import { cn } from '@/lib/cn';

import { FLOATING, R_FLOATING } from '../chrome';

import type { EditorPage } from '@/components/modules/block-editor/serialize';

/**
 * The template's pages, as a vertical list.
 *
 * Was `PageTabsBar`, a horizontal strip under the header. That file argued
 * against a vertical layout on the grounds that pages *contain* blocks, so
 * putting both in one column would read as siblings. That objection is gone:
 * pages and blocks are now separate rail destinations, never the same column.
 *
 * Going vertical buys the thing the horizontal bar could not have — a page name
 * that fits, and its slug underneath.
 */

interface PagesPanelProps {
  pages: EditorPage[];
  activePageId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onReorder: (next: EditorPage[]) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onSetHome: (id: string) => void;
  onOpenSettings: (id: string) => void;
}

export function PagesPanel({
  pages,
  activePageId,
  onSelect,
  onAdd,
  onReorder,
  onDuplicate,
  onRemove,
  onSetHome,
  onOpenSettings,
}: PagesPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = pages.findIndex(p => p.id === active.id);
    const newIndex = pages.findIndex(p => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(pages, oldIndex, newIndex));
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pages.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {pages.map(page => (
            <SortablePageRow
              key={page.id}
              page={page}
              active={page.id === activePageId}
              canRemove={pages.length > 1}
              onSelect={onSelect}
              onDuplicate={onDuplicate}
              onRemove={onRemove}
              onSetHome={onSetHome}
              onOpenSettings={onOpenSettings}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        type='button'
        onClick={onAdd}
        className='mt-1 flex w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-neutral-300 py-2 text-xs font-medium text-neutral-500 transition-colors hover:border-neutral-500 hover:text-neutral-800'
      >
        <Plus className='size-3.5' />
        Thêm trang
      </button>
    </div>
  );
}

interface PageRowProps {
  page: EditorPage;
  active: boolean;
  canRemove: boolean;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onSetHome: (id: string) => void;
  onOpenSettings: (id: string) => void;
}

function SortablePageRow({
  page,
  active,
  canRemove,
  onSelect,
  onDuplicate,
  onRemove,
  onSetHome,
  onOpenSettings,
}: PageRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group flex shrink-0 items-center gap-1 rounded-md pr-0.5 pl-1 transition-colors',
        active
          ? 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-ink)]'
          : 'text-[var(--pv2-mut)] hover:bg-[var(--pv2-paper)]',
        isDragging && 'opacity-60'
      )}
    >
      {/* Its own target — a plain click on the row switches pages, and must
          never be able to reorder the template by accident. */}
      <span
        {...attributes}
        {...listeners}
        aria-label={`Kéo để sắp xếp ${page.name}`}
        className='shrink-0 cursor-grab text-neutral-300 transition-colors group-hover:text-neutral-500 active:cursor-grabbing'
      >
        <GripVertical className='size-3' />
      </span>

      <button
        type='button'
        onClick={() => onSelect(page.id)}
        title={page.isHome ? 'Trang chủ' : `/${page.slug}`}
        className='flex min-w-0 flex-1 flex-col items-start py-1.5'
      >
        <span className='flex w-full min-w-0 items-center gap-1'>
          {page.isHome && <Home className='size-3 shrink-0' />}
          <span className='text-2xs w-full truncate text-left font-medium'>
            {page.name}
          </span>
        </span>
        <span className='text-3xs w-full truncate text-left text-neutral-400'>
          /{page.slug}
        </span>
      </button>

      <PageActionMenu
        page={page}
        canRemove={canRemove}
        onDuplicate={onDuplicate}
        onRemove={onRemove}
        onSetHome={onSetHome}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
}

const MENU_ITEM =
  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent';

function PageActionMenu({
  page,
  canRemove,
  onDuplicate,
  onRemove,
  onSetHome,
  onOpenSettings,
}: Omit<PageRowProps, 'active' | 'onSelect'>) {
  const [open, setOpen] = React.useState(false);
  const run = (fn: (id: string) => void) => () => {
    setOpen(false);
    fn(page.id);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={`Hành động cho ${page.name}`}
        className='shrink-0 rounded p-0.5 text-neutral-300 transition-colors group-hover:text-neutral-500 hover:text-neutral-900 data-[state=open]:text-neutral-900'
      >
        <MoreVertical className='size-3' />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align='start'
          sideOffset={6}
          className={cn(
            'z-50 w-48 bg-[var(--pv2-paper)] p-1',
            R_FLOATING,
            FLOATING
          )}
        >
          <button
            type='button'
            className={MENU_ITEM}
            onClick={run(onOpenSettings)}
          >
            <Settings2 className='size-3.5' />
            Đổi tên &amp; SEO
          </button>
          <button
            type='button'
            className={MENU_ITEM}
            onClick={run(onDuplicate)}
          >
            <Copy className='size-3.5' />
            Nhân bản trang
          </button>
          <button
            type='button'
            className={MENU_ITEM}
            disabled={page.isHome}
            title={page.isHome ? 'Đây đã là trang chủ' : undefined}
            onClick={run(onSetHome)}
          >
            <Home className='size-3.5' />
            Đặt làm trang chủ
          </button>
          <button
            type='button'
            className={cn(MENU_ITEM, 'text-red-600 hover:bg-red-50')}
            disabled={!canRemove}
            title={
              !canRemove ? 'Template phải còn ít nhất một trang' : undefined
            }
            onClick={run(onRemove)}
          >
            <Trash2 className='size-3.5' />
            Xoá trang
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
