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
import * as Popover from '@radix-ui/react-popover';
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

import type { EditorPage } from './serialize';

/**
 * Horizontal strip of the template's pages, mounted between the editor header
 * and the canvas row.
 *
 * Deliberately NOT folded into `BlockSceneRail`: that rail is a 100px column
 * with its own vertical `DndContext` where the whole tab is the drag handle.
 * Nesting a second `SortableContext` in the same scroller makes collision
 * detection and auto-scroll fight, 100px cannot show a name like "Danh sách
 * sản phẩm", and pages *contain* blocks so listing them in the same column
 * reads as siblings. Here the drag handle is separated from the click target
 * so reaching for a page tab never starts a drag.
 */

interface PageTabsBarProps {
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

export function PageTabsBar({
  pages,
  activePageId,
  onSelect,
  onAdd,
  onReorder,
  onDuplicate,
  onRemove,
  onSetHome,
  onOpenSettings,
}: PageTabsBarProps) {
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
    <div className='border-border bg-background flex h-9 shrink-0 items-stretch gap-1 overflow-x-auto border-b px-2'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pages.map(p => p.id)}
          strategy={horizontalListSortingStrategy}
        >
          {pages.map(page => (
            <SortablePageTab
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
        className='text-content-muted hover:text-foreground hover:bg-muted text-2xs my-1 inline-flex shrink-0 items-center gap-1 rounded-md px-2 font-medium transition-colors'
      >
        <Plus className='size-3.5' />
        Thêm trang
      </button>
    </div>
  );
}

interface PageTabProps {
  page: EditorPage;
  active: boolean;
  canRemove: boolean;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onSetHome: (id: string) => void;
  onOpenSettings: (id: string) => void;
}

function SortablePageTab({
  page,
  active,
  canRemove,
  onSelect,
  onDuplicate,
  onRemove,
  onSetHome,
  onOpenSettings,
}: PageTabProps) {
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
        'group my-1 flex shrink-0 items-center rounded-md pr-0.5 pl-1 transition-colors',
        active
          ? 'bg-muted text-foreground'
          : 'text-content-muted hover:bg-muted/60',
        isDragging && 'opacity-60'
      )}
    >
      {/* Handle is its own target — dragging must never be triggered by a
          plain click on the tab, which is how you switch pages. */}
      <span
        {...attributes}
        {...listeners}
        aria-label={`Kéo để sắp xếp ${page.name}`}
        className='text-muted-foreground/0 group-hover:text-muted-foreground cursor-grab transition-colors active:cursor-grabbing'
      >
        <GripVertical className='size-3' />
      </span>

      <button
        type='button'
        onClick={() => onSelect(page.id)}
        title={page.isHome ? 'Trang chủ' : `/${page.slug}`}
        className='text-2xs inline-flex max-w-[180px] items-center gap-1 px-1.5 py-1 font-medium'
      >
        {page.isHome && <Home className='size-3 shrink-0' />}
        <span className='truncate'>{page.name}</span>
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
  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent';

function PageActionMenu({
  page,
  canRemove,
  onDuplicate,
  onRemove,
  onSetHome,
  onOpenSettings,
}: Omit<PageTabProps, 'active' | 'onSelect'>) {
  const [open, setOpen] = React.useState(false);
  const run = (fn: (id: string) => void) => () => {
    setOpen(false);
    fn(page.id);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={`Hành động cho ${page.name}`}
        className='text-muted-foreground/0 group-hover:text-muted-foreground hover:text-foreground data-[state=open]:text-foreground rounded p-0.5 transition-colors'
      >
        <MoreVertical className='size-3' />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align='start'
          sideOffset={6}
          className='border-border bg-background z-50 w-48 rounded-lg border p-1 shadow-lg'
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
