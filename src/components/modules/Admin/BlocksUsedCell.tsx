'use client';

/**
 * "Blocks" cell dùng chung cho các bảng admin (templates / landing pages) —
 * popover liệt kê block dùng trong 1 item, click 1 block → mở preview thật
 * (nội dung đã lưu) ở tab mới qua `/dev/blocks?inline=<key>`.
 *
 * Block ở đây là bản copy inline (trong canvas_blueprint), không có id thư
 * viện Blocks, nên không dùng được `/dev/blocks?id=` — phải stash JSON vào
 * localStorage rồi đọc lại ở tab mới (xem `dev/blocks/page.tsx` mode 'inline').
 */

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown, ExternalLink, Layers, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';

import {
  BLOCK_TYPE_META,
  type Block,
} from '@/components/modules/block-editor/types';

/** Key gắn timestamp+random để không bị đè khi user click liên tiếp nhiều block. */
export function openInlineBlockPreview(block: Block) {
  const key = `dev-blocks-inline:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  try {
    window.localStorage.setItem(key, JSON.stringify(block));
  } catch {
    toast.error('Không thể mở preview block (lỗi lưu tạm dữ liệu).');
    return;
  }
  window.open(
    `/dev/blocks?inline=${encodeURIComponent(key)}`,
    '_blank',
    'noopener'
  );
}

export function BlocksUsedCell({
  state,
}: {
  state: Block[] | 'loading' | 'error' | undefined;
}) {
  if (state === undefined || state === 'loading') {
    return (
      <span className='text-content-muted inline-flex items-center gap-1 text-xs'>
        <RefreshCwIcon className='size-3 animate-spin' /> …
      </span>
    );
  }
  if (state === 'error') {
    return <span className='text-content-muted text-xs'>-</span>;
  }
  if (state.length === 0) {
    return <span className='text-content-muted text-xs'>0 block</span>;
  }
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type='button'
          className='border-border text-content-muted hover:bg-muted bg-background inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium'
        >
          <Layers className='size-3' />
          {state.length} block{state.length > 1 ? 's' : ''}
          <ChevronDown className='size-3 opacity-60' />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align='start'
          sideOffset={4}
          className='border-border bg-background z-50 w-64 rounded-lg border p-1.5 shadow-lg'
        >
          <div className='max-h-72 overflow-y-auto'>
            {state.map((b, i) => (
              <button
                key={`${b.id}:${i}`}
                type='button'
                onClick={() => openInlineBlockPreview(b)}
                className='hover:bg-muted flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-xs'
              >
                <span className='min-w-0'>
                  <span className='block truncate font-medium'>{b.name}</span>
                  <span className='text-content-muted text-3xs block truncate'>
                    {BLOCK_TYPE_META[b.blockType]?.label ?? b.blockType}
                  </span>
                </span>
                <ExternalLink className='text-content-muted size-3 shrink-0' />
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
