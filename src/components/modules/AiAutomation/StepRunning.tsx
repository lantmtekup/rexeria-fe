'use client';

import { AlertTriangle } from 'lucide-react';

import { cn } from '@/lib/cn';

import { RunStatusIcon } from './_bits';
import type { RunItem } from './_shared';

const STATUS_TEXT: Record<RunItem['status'], string> = {
  enqueuing: 'đang gửi…',
  queued: 'hàng đợi',
  running: 'AI đang viết…',
  succeeded: '',
  failed: '',
};

export function StepRunning({ items }: { items: RunItem[] }) {
  const done = items.filter(i => i.status === 'succeeded').length;
  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h2 className='text-sm font-semibold'>
          AI đang map sản phẩm → landing
        </h2>
        <span className='text-content-muted text-xs'>
          {done}/{items.length} xong
        </span>
      </div>
      <ul className='divide-border border-border divide-y overflow-hidden rounded-xl border'>
        {items.map(it => (
          <li key={it.productId} className='flex items-center gap-3 px-4 py-3'>
            <RunStatusIcon status={it.status} />
            <span className='flex-1 truncate text-sm font-medium'>
              {it.productName}
            </span>
            <span
              className={cn(
                'text-xs',
                it.status === 'failed' ? 'text-danger' : 'text-content-muted'
              )}
            >
              {it.status === 'succeeded' && it.output ? (
                <span className='inline-flex items-center gap-1.5'>
                  {it.output.applied.blocks_rewritten} block ·{' '}
                  {it.output.applied.fields_rewritten} field ·{' '}
                  {it.output.applied.image_bindings_replaced} ảnh
                  {it.output.source === 'stub' && (
                    <AlertTriangle className='text-warning size-3' />
                  )}
                </span>
              ) : it.status === 'failed' ? (
                (it.error ?? 'lỗi')
              ) : (
                STATUS_TEXT[it.status]
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
