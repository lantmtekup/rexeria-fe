'use client';

import * as React from 'react';
import { PanelRightClose } from 'lucide-react';

import { cn } from '@/lib/cn';

import { LayersPanel } from './LayersPanel';
import { MotionPanel } from './motion/ui/MotionPanel';
import type { MotionConfig } from './motion/types';
import type { Block, Device } from './types';

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
  /** Block-level motion (for inheritance display in motion tab). */
  blockMotion?: MotionConfig | null;
  /** Element-level motion override for the currently selected element. */
  elementMotion?: MotionConfig | null;
  onChangeElementMotion?: (
    elementKey: string,
    next: MotionConfig | null
  ) => void;
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
  blockMotion = null,
  elementMotion = null,
  onChangeElementMotion,
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
        <span className='ml-auto flex items-center px-3 text-[10px] text-neutral-400'>
          {isMotion ? 'Element override' : 'Kéo để sắp xếp · Click để sửa'}
        </span>
        {onCollapse && (
          <button
            type='button'
            aria-label='Ẩn bảng lớp'
            onClick={onCollapse}
            className='flex size-9 cursor-pointer items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
          >
            <PanelRightClose className='size-4' />
          </button>
        )}
      </div>

      <div className='flex-1 overflow-y-auto'>
        {isMotion ? (
          <MotionPanel
            blockType={block.blockType}
            selectedElementKey={selectedElementKey}
            blockConfig={blockMotion}
            elementConfig={elementMotion}
            onApplyElement={next => {
              if (!selectedElementKey) return;
              onChangeElementMotion?.(selectedElementKey, next);
            }}
          />
        ) : (
          <LayersPanel
            block={block}
            device={device}
            selectedKey={selectedElementKey}
            onSelectKey={onSelectElement}
            onReorder={onReorderElements}
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
