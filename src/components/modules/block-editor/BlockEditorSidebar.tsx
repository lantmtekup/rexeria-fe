'use client';

import * as React from 'react';
import { PanelRightClose } from 'lucide-react';

import { cn } from '@/lib/cn';

import { LayersPanel } from './LayersPanel';
import { MotionLayersPanel } from './motion/MotionLayersPanel';
import type { BlockMotion } from './motion/types';
import type { Block, Device, ExtraElementKind } from './types';

type SidebarTab = 'layers' | 'motion';

interface BlockEditorSidebarProps {
  block: Block;
  device: Device;
  selectedElementKey: string | null;
  onSelectElement: (key: string | null) => void;
  onReorderElements?: (nextOrder: string[]) => void;
  onCollapse?: () => void;
  /** Sidebar tab — 'layers' (default) or 'motion'. */
  activeTab?: SidebarTab;
  onChangeTab?: (tab: SidebarTab) => void;
  /** Stored motion for the current device variant. */
  motion?: BlockMotion;
  onChangeMotion?: (next: BlockMotion | null) => void;
  onOpenMotionEditor?: () => void;
  onPlayMotionPreview?: () => void;
  /** Audition a single element's animation. Triggered when user picks a preset. */
  onPlayElementPreview?: (elementKey: string) => void;
  isMotionPreviewing?: boolean;
  // ── ExtraElements (free-drag user-added objects) ──────────────────────
  selectedExtraElementId?: string | null;
  onAddExtraElement?: (kind: ExtraElementKind) => void;
  onSelectExtraElement?: (id: string | null) => void;
  onRemoveExtraElement?: (id: string) => void;
}

export function BlockEditorSidebar({
  block,
  device,
  selectedElementKey,
  onSelectElement,
  onReorderElements,
  onCollapse,
  activeTab = 'layers',
  onChangeTab,
  motion,
  onChangeMotion,
  onOpenMotionEditor,
  onPlayMotionPreview,
  onPlayElementPreview,
  isMotionPreviewing,
  selectedExtraElementId,
  onAddExtraElement,
  onSelectExtraElement,
  onRemoveExtraElement,
}: BlockEditorSidebarProps) {
  const isMotion = activeTab === 'motion';
  return (
    <aside
      className='flex w-[280px] shrink-0 flex-col border-l border-neutral-200 bg-neutral-50'
      data-testid='block-editor-sidebar'
    >
      {/* Tab strip */}
      <div className='flex items-stretch border-b border-neutral-200 bg-white'>
        <TabBtn
          active={!isMotion}
          onClick={() => onChangeTab?.('layers')}
          testId='sidebar-tab-layers'
        >
          Lớp
        </TabBtn>
        <TabBtn
          active={isMotion}
          onClick={() => onChangeTab?.('motion')}
          testId='sidebar-tab-motion'
        >
          Motion
        </TabBtn>
        {onCollapse && (
          <button
            type='button'
            aria-label='Ẩn bảng lớp'
            onClick={onCollapse}
            className='ml-auto flex size-9 cursor-pointer items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
          >
            <PanelRightClose className='size-4' />
          </button>
        )}
      </div>

      <div className='flex-1 overflow-y-auto'>
        {isMotion ? (
          <MotionLayersPanel
            block={block}
            device={device}
            motion={motion}
            onChange={next => onChangeMotion?.(next)}
            onOpenAdvanced={() => onOpenMotionEditor?.()}
            onPlayPreview={onPlayMotionPreview}
            onPlayElementPreview={onPlayElementPreview}
            isPreviewing={isMotionPreviewing ?? false}
          />
        ) : (
          <LayersPanel
            block={block}
            device={device}
            selectedKey={selectedElementKey}
            onSelectKey={onSelectElement}
            onReorder={onReorderElements}
            selectedExtraElementId={selectedExtraElementId}
            onAddExtraElement={onAddExtraElement}
            onSelectExtraElement={onSelectExtraElement}
            onRemoveExtraElement={onRemoveExtraElement}
          />
        )}
      </div>
    </aside>
  );
}

function TabBtn({
  active,
  onClick,
  testId,
  children,
}: {
  active: boolean;
  onClick: () => void;
  testId?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      data-testid={testId}
      data-active={active ? 'true' : 'false'}
      className={cn(
        'relative flex h-9 cursor-pointer items-center px-4 text-xs font-semibold tracking-widest uppercase transition-colors',
        active ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-700'
      )}
    >
      {children}
      {active && (
        <span className='absolute right-3 bottom-0 left-3 h-0.5 rounded-t bg-neutral-900' />
      )}
    </button>
  );
}
