'use client';

/**
 * One block's slot on the full-page canvas: the outline that tells the author
 * where the block starts and ends, its name, and the actions that only make
 * sense at block level (insert, duplicate, hide, move, delete).
 *
 * The frame is deliberately drawn with a pseudo-element ring rather than a
 * border or padding — the page has to read as a continuous landing page, so
 * nothing here may take part in layout or shift the block by a single pixel.
 */

import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/cn';

import { FLOATING, R_FLOATING } from './chrome';

import type { Block } from '@/components/modules/block-editor/types';

export interface PageCanvasBlockActions {
  onAddAfter: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  onToggleVisible: (blockId: string) => void;
  onMove: (blockId: string, direction: -1 | 1) => void;
  onRemove: (blockId: string) => void;
}

interface PageCanvasBlockFrameProps {
  block: Block;
  index: number;
  total: number;
  active: boolean;
  /** Hidden while the motion runtime is playing or an inline edit is open. */
  chromeVisible: boolean;
  actions: PageCanvasBlockActions;
  children: React.ReactNode;
}

export function PageCanvasBlockFrame({
  block,
  index,
  total,
  active,
  chromeVisible,
  actions,
  children,
}: PageCanvasBlockFrameProps) {
  const hidden = block.isVisible === false;

  return (
    <div
      data-block-id={block.id}
      data-block-index={index}
      data-block-active={active ? 'true' : undefined}
      className={cn(
        // Ring + label are drawn by absolutely-positioned children so the
        // wrapper itself stays a plain box: no border, no padding, nothing
        // that could shift the block or make it a containing block for sticky.
        'group/block relative',
        hidden && 'opacity-40'
      )}
    >
      {children}

      {chromeVisible && (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 z-20 transition-[box-shadow] duration-100',
            active
              ? 'shadow-[inset_0_0_0_2px_var(--pv2-electric)]'
              : 'group-hover/block:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--pv2-electric)_45%,transparent)]'
          )}
        />
      )}

      {chromeVisible && (
        <div className='pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-2'>
          <span
            className={cn(
              'truncate rounded px-1.5 py-0.5 text-[11px] font-medium tracking-wide transition-opacity',
              active
                ? 'bg-[var(--pv2-electric)] text-white'
                : 'bg-black/55 text-white/90 opacity-0 group-hover/block:opacity-100'
            )}
          >
            {index + 1}. {block.name}
            {hidden && ' · ẩn'}
          </span>

          {active && (
            <div
              data-canvas-edit-chip-root='true'
              className={cn(
                'pointer-events-auto flex items-center gap-0.5 bg-[var(--pv2-paper)] p-1',
                R_FLOATING,
                FLOATING
              )}
              // A bare pointerdown here reads as "empty canvas" to the element
              // layer and would clear the selection behind the bar.
              onPointerDown={e => e.stopPropagation()}
            >
              <FrameAction
                label='Thêm block bên dưới'
                onClick={() => actions.onAddAfter(block.id)}
              >
                <Plus className='size-3.5' />
              </FrameAction>
              <FrameAction
                label='Nhân bản block'
                onClick={() => actions.onDuplicate(block.id)}
              >
                <Copy className='size-3.5' />
              </FrameAction>
              <FrameAction
                label={hidden ? 'Hiện block' : 'Ẩn block'}
                onClick={() => actions.onToggleVisible(block.id)}
              >
                {hidden ? (
                  <EyeOff className='size-3.5' />
                ) : (
                  <Eye className='size-3.5' />
                )}
              </FrameAction>
              <FrameAction
                label='Di chuyển lên'
                disabled={index === 0}
                onClick={() => actions.onMove(block.id, -1)}
              >
                <ArrowUp className='size-3.5' />
              </FrameAction>
              <FrameAction
                label='Di chuyển xuống'
                disabled={index === total - 1}
                onClick={() => actions.onMove(block.id, 1)}
              >
                <ArrowDown className='size-3.5' />
              </FrameAction>
              <FrameAction
                label='Xoá block'
                danger
                onClick={() => actions.onRemove(block.id)}
              >
                <Trash2 className='size-3.5' />
              </FrameAction>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FrameAction({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'flex size-7 cursor-pointer items-center justify-center rounded-sm transition-colors',
        'text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]',
        danger &&
          'hover:bg-[var(--pv2-error)]/10 hover:text-[var(--pv2-error)]',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
      )}
    >
      {children}
    </button>
  );
}
