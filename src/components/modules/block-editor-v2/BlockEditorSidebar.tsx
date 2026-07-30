'use client';

import * as React from 'react';
import { PanelRightClose } from 'lucide-react';

import { cn } from '@/lib/cn';

import { InspectorPanel } from './inspector/InspectorPanel';
import { MotionLayersPanel } from './motion/MotionLayersPanel';
import type { BlockMotion } from '@/components/modules/block-editor/motion/types';
import type {
  Block,
  BlockBackground,
  BlockContent,
  Device,
  ElementStyle,
  Lang,
} from '@/components/modules/block-editor/types';

/**
 * 'layers' is gone — the layer tree moved to the left rail, where it sits with
 * the other navigation surfaces (blocks, pages) instead of sharing a tab strip
 * with the property inspector. Two nav levels in one column fought each other.
 */
export type SidebarTab = 'design' | 'motion';

interface BlockEditorSidebarProps {
  block: Block;
  device: Device;
  /** Language variant being edited — the inspector reads content from it. */
  lang: Lang;
  selectedElementKey: string | null;
  onCollapse?: () => void;
  /** Sidebar tab — 'design' (default) or 'motion'. */
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
}

export function BlockEditorSidebar({
  block,
  device,
  lang,
  selectedElementKey,
  onCollapse,
  activeTab = 'design',
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
}: BlockEditorSidebarProps) {
  return (
    <aside
      // 300px (was 252) so an inspector row fits `label + control` without
      // wrapping — the layers tree never needed the extra width, the property
      // rows do.
      className='flex w-75 shrink-0 flex-col border-l border-[var(--pv2-hair)] bg-[var(--pv2-canvas)]'
      data-testid='block-editor-sidebar'
    >
      {/* Tab strip */}
      <div className='flex h-9 items-stretch border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
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
            // Was "Ẩn bảng lớp" — the layers tab moved to the rail, this panel
            // is the design panel now, and the reopen button already says so.
            aria-label='Ẩn bảng thiết kế'
            onClick={onCollapse}
            className='ml-auto flex size-8 cursor-pointer items-center justify-center rounded-md text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]'
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

        {/* Explicit pv2 paper below, not `bg-background`: the shadcn token
            flips under `.dark` while its `bg-white` siblings here do not,
            which left the editor half-inverted. This route is light-locked. */}
        {activeTab === 'design' && (
          <div className='flex min-h-full flex-col bg-[var(--pv2-paper)]'>
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
        active
          ? 'text-[var(--pv2-ink)]'
          : 'text-[var(--pv2-faint)] hover:text-[var(--pv2-mut)]'
      )}
    >
      {children}
      {active && (
        <span className='absolute right-3 bottom-0 left-3 h-0.5 rounded-t bg-[var(--pv2-electric)]' />
      )}
    </button>
  );
}
