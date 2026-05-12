'use client';

import * as React from 'react';
import { Clapperboard, PanelRightClose } from 'lucide-react';

import { cn } from '@/lib/cn';

import { LayersPanel } from './LayersPanel';
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
  /** Number of tracks on the active block — surfaced in the Motion tab. */
  motionTrackCount?: number;
  onOpenMotionEditor?: () => void;
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
  motionTrackCount = 0,
  onOpenMotionEditor,
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
          <MotionTabBody
            trackCount={motionTrackCount}
            onOpen={onOpenMotionEditor}
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

function MotionTabBody({
  trackCount,
  onOpen,
}: {
  trackCount: number;
  onOpen?: () => void;
}) {
  return (
    <div className='flex flex-col gap-3 px-4 py-5 text-[11px] text-neutral-500'>
      <div className='rounded-md border border-neutral-200 bg-white p-3'>
        <span className='font-mono text-[10px] tracking-[0.14em] text-neutral-400 uppercase'>
          Block hiện tại
        </span>
        <p className='mt-1 text-[12px] font-semibold text-neutral-900'>
          {trackCount === 0
            ? 'Chưa có track nào'
            : `${trackCount} track đang chạy`}
        </p>
      </div>
      <button
        type='button'
        onClick={onOpen}
        data-testid='sidebar-open-motion-editor'
        className='flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md bg-neutral-900 px-3 text-[11px] font-semibold text-white transition-colors hover:bg-neutral-700'
      >
        <Clapperboard className='size-3.5' />
        Mở timeline editor
      </button>
      <p className='leading-relaxed text-neutral-400'>
        Timeline mở ở chế độ full-screen. Phím tắt: <kbd>M</kbd> để mở nhanh,
        <kbd>Esc</kbd> đóng.
      </p>
    </div>
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
