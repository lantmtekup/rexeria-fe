'use client';

import * as React from 'react';
import { PanelRightClose } from 'lucide-react';

import { cn } from '@/lib/cn';

import { InspectorPanel } from './inspector/InspectorPanel';
import { LayersPanel } from './LayersPanel';
import { MotionLayersPanel } from './motion/MotionLayersPanel';
import type { BlockMotion } from './motion/types';
import type {
  Block,
  BlockBackground,
  BlockContent,
  Device,
  ElementStyle,
  ExtraElementKind,
  Lang,
} from './types';

export type SidebarTab = 'layers' | 'design' | 'motion';

interface BlockEditorSidebarProps {
  block: Block;
  device: Device;
  /** Language variant being edited — the inspector reads content from it. */
  lang: Lang;
  selectedElementKey: string | null;
  onSelectElement: (key: string | null) => void;
  onReorderElements?: (nextOrder: string[]) => void;
  onCollapse?: () => void;
  /** Sidebar tab — 'layers' (default), 'design' or 'motion'. */
  activeTab?: SidebarTab;
  onChangeTab?: (tab: SidebarTab) => void;
  // ── Inspector ("Thiết kế") ─────────────────────────────────────────────
  onContentChange?: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
  onUpdateElementStyle?: (patch: ElementStyle) => void;
  onUpdateBackground?: (next: BlockBackground | undefined) => void;
  onSyncVariant?: (
    from: 'desktop' | 'mobile',
    to: 'desktop' | 'mobile'
  ) => void;
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
  lang,
  selectedElementKey,
  onSelectElement,
  onReorderElements,
  onCollapse,
  activeTab = 'layers',
  onChangeTab,
  onContentChange,
  onUpdateElementStyle,
  onUpdateBackground,
  onSyncVariant,
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
  return (
    <aside
      // 300px (was 252) so an inspector row fits `label + control` without
      // wrapping — the layers tree never needed the extra width, the property
      // rows do.
      className='flex w-75 shrink-0 flex-col border-l border-neutral-200 bg-neutral-50'
      data-testid='block-editor-sidebar'
    >
      {/* Tab strip */}
      <div className='flex h-9 items-stretch border-b border-neutral-200 bg-white'>
        <TabBtn
          active={activeTab === 'layers'}
          onClick={() => onChangeTab?.('layers')}
          testId='sidebar-tab-layers'
        >
          Lớp
        </TabBtn>
        <TabBtn
          active={activeTab === 'design'}
          onClick={() => onChangeTab?.('design')}
          testId='sidebar-tab-design'
        >
          Thiết kế
        </TabBtn>
        <TabBtn
          active={activeTab === 'motion'}
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
            className='ml-auto flex size-8 cursor-pointer items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
          >
            <PanelRightClose className='size-3.5' />
          </button>
        )}
      </div>

      <div className='flex-1 overflow-y-auto'>
        {activeTab === 'motion' && (
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
        )}

        {activeTab === 'design' && (
          <div className='bg-background flex min-h-full flex-col'>
            <InspectorPanel
              block={block}
              lang={lang}
              device={device}
              selectedKey={selectedElementKey}
              onContentChange={onContentChange ?? (() => {})}
              onUpdateStyle={onUpdateElementStyle ?? (() => {})}
              onUpdateBackground={onUpdateBackground ?? (() => {})}
              onSyncVariant={onSyncVariant}
            />
          </div>
        )}

        {activeTab === 'layers' && (
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
        'relative flex h-full cursor-pointer items-center px-3 text-xs font-semibold tracking-wide uppercase transition-colors',
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
