'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Loader2, RotateCcw, Sparkles, Trash2, X } from 'lucide-react';

import { Textarea } from '@/components/atoms/textarea';
import { cn } from '@/lib/cn';

import type { ElementKind } from '../resolveElementKind';
import type { Block, BlockBackground, BlockContent, Lang } from '../types';
import {
  CONTROL_H,
  CONTROL_H_INNER,
  ICON_SM,
  TEXT_CONTROL,
  TEXT_META,
} from './tokens';
import { useElementActions } from './useElementActions';

interface SelectionToolbarProps {
  block: Block;
  lang: Lang;
  /** Content for the variant currently being edited. */
  content: BlockContent;
  selectedKey: string;
  kind: ElementKind;
  label: string;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
  onUpdateBackground: (next: BlockBackground | undefined) => void;
  onResetStyle: () => void;
  onClose: () => void;
}

/**
 * Actions-only bar for the current selection, docked to the canvas corner.
 *
 * Deliberately NOT anchored to the element: a rect-following bar has to
 * re-measure on zoom, pan, canvas scroll and every content keystroke, which
 * users read as the bar jumping around, and a whole-block selection like
 * `__background__` would push it off-screen. Style and content controls live in
 * the sidebar inspector, so this only carries the four verbs.
 */
export function SelectionToolbar({
  block,
  lang,
  content,
  selectedKey,
  kind,
  label,
  onContentChange,
  onUpdateBackground,
  onResetStyle,
  onClose,
}: SelectionToolbarProps) {
  const actions = useElementActions({
    block,
    lang,
    content,
    selectedKey,
    kind,
    label,
    onContentChange,
    onUpdateBackground,
    onResetStyle,
    onClose,
  });

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-lg bg-neutral-900 px-1 text-white shadow-lg ring-1 ring-black/10',
        CONTROL_H
      )}
    >
      <span
        className={cn(
          'max-w-28 truncate px-1.5 font-semibold tracking-wider text-white/70 uppercase',
          TEXT_META
        )}
      >
        {label}
      </span>
      <span className='mx-0.5 h-4 w-px bg-white/15' aria-hidden />

      <AiButton onAi={actions.runAi} blockType={block.blockType} />

      <BarBtn
        label='Khôi phục style mặc định'
        onClick={onResetStyle}
        disabled={kind === 'background'}
      >
        <RotateCcw className={ICON_SM} />
      </BarBtn>
      <BarBtn label='Xoá nội dung' onClick={actions.deleteContent} danger>
        <Trash2 className={ICON_SM} />
      </BarBtn>
      <BarBtn label='Bỏ chọn' onClick={onClose}>
        <X className={ICON_SM} />
      </BarBtn>
    </div>
  );
}

function BarBtn({
  label,
  onClick,
  disabled = false,
  danger = false,
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
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'flex w-6 cursor-pointer items-center justify-center rounded-md text-white/70 transition-colors',
        CONTROL_H_INNER,
        danger
          ? 'hover:bg-rose-500/20 hover:text-rose-300'
          : 'hover:bg-white/10 hover:text-white',
        disabled && 'cursor-not-allowed opacity-30 hover:bg-transparent'
      )}
    >
      {children}
    </button>
  );
}

function AiButton({
  onAi,
  blockType,
}: {
  onAi: (prompt: string) => Promise<void>;
  blockType: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await onAi(prompt);
      setPrompt('');
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type='button'
          aria-label='AI tạo nội dung'
          title='AI tạo nội dung'
          className={cn(
            'flex cursor-pointer items-center gap-1 rounded-md px-1.5 font-semibold tracking-wide text-white/90 transition-colors hover:bg-white/10 hover:text-white',
            CONTROL_H_INNER,
            TEXT_META
          )}
        >
          <Sparkles className={cn('text-sky-300', ICON_SM)} />
          AI
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align='start'
          sideOffset={8}
          collisionPadding={12}
          className='border-border bg-background z-50 w-80 rounded-lg border p-3 shadow-xl outline-none'
        >
          <div className='mb-2 flex items-center gap-2'>
            <Sparkles className={cn('text-violet-500', ICON_SM)} />
            <span
              className={cn(
                'text-foreground font-semibold tracking-wider uppercase',
                TEXT_META
              )}
            >
              AI tạo nội dung
            </span>
            <span
              className={cn(
                'text-content-muted ml-auto font-mono tracking-tight',
                TEXT_META
              )}
            >
              {blockType.replace('_', ' ')}
            </span>
          </div>
          <Textarea
            autoFocus
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !busy) {
                e.preventDefault();
                void submit();
              }
            }}
            placeholder='Mô tả gì bạn muốn AI viết… (⌘+Enter để gửi)'
            className={cn(
              'border-border bg-background min-h-20 resize-none leading-5',
              TEXT_CONTROL
            )}
          />
          <div className='mt-2 flex items-center justify-between'>
            <span
              className={cn(
                'text-content-muted font-mono tracking-tight',
                TEXT_META
              )}
            >
              ⌘ Enter
            </span>
            <button
              type='button'
              onClick={() => void submit()}
              disabled={busy}
              className={cn(
                'bg-foreground text-background flex cursor-pointer items-center gap-1.5 rounded-md px-3 font-semibold tracking-tight transition-opacity hover:opacity-90 disabled:opacity-50',
                CONTROL_H,
                TEXT_CONTROL
              )}
            >
              {busy ? (
                <>
                  <Loader2 className={cn('animate-spin', ICON_SM)} />
                  Đang tạo…
                </>
              ) : (
                <>
                  <Sparkles className={cn('text-violet-300', ICON_SM)} />
                  Tạo
                </>
              )}
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
