'use client';

import {
  AlertTriangle,
  ArrowRight,
  Check,
  ExternalLink,
  Loader2,
  Rocket,
  Sparkles,
  X,
} from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { Chip } from '@/components/atoms/chip';
import { Label } from '@/components/atoms/label';
import { cn } from '@/lib/cn';
import type { AIChannel, AIMultiChannelOutput } from '@/services/rexer/types';

import { RunStatusIcon } from './_bits';
import { CHANNELS, type RunItem } from './_shared';

interface Props {
  items: RunItem[];
  succeeded: RunItem[];
  onView: (pageId: string) => void;
  onRestart: () => void;
  mcPageId: string;
  setMcPageId: (v: string) => void;
  mcChannels: Set<AIChannel>;
  setMcChannels: (s: Set<AIChannel>) => void;
  mcRunning: boolean;
  mcResult: AIMultiChannelOutput | null;
  onMultiChannel: () => void;
}

const SELECT_CLASS =
  'border-border bg-background text-foreground h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function StepResults(props: Props) {
  const {
    items,
    succeeded,
    onView,
    onRestart,
    mcPageId,
    setMcPageId,
    mcChannels,
    setMcChannels,
    mcRunning,
    mcResult,
    onMultiChannel,
  } = props;

  const failed = items.filter(i => i.status === 'failed').length;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-sm font-semibold'>
          <span className='text-success flex size-5 items-center justify-center rounded-full bg-[var(--color-success-bg)]'>
            <Check className='size-3.5' />
          </span>
          {succeeded.length} landing đã tạo
          {failed > 0 && <span className='text-danger'>· {failed} lỗi</span>}
        </h2>
        <Button variant='neutral' size='sm' onClick={onRestart}>
          Làm lại
        </Button>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {items.map(it => (
          <div
            key={it.productId}
            className='border-border flex flex-col gap-2.5 rounded-xl border p-4'
          >
            <div className='flex items-center gap-2'>
              <RunStatusIcon status={it.status} />
              <span className='truncate text-sm font-medium'>
                {it.productName}
              </span>
            </div>
            {it.status === 'succeeded' && it.output ? (
              <>
                <p className='text-content-muted flex items-center gap-1.5 text-xs'>
                  {it.output.applied.fields_rewritten} field ·{' '}
                  {it.output.applied.image_bindings_replaced} ảnh
                  {it.output.source === 'stub' && (
                    <span className='text-warning inline-flex items-center gap-0.5'>
                      <AlertTriangle className='size-3' /> stub
                    </span>
                  )}
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onView(it.output!.page_id)}
                >
                  Xem trước <ArrowRight className='size-3.5' />
                </Button>
              </>
            ) : (
              <p className='text-danger text-xs'>{it.error ?? '—'}</p>
            )}
          </div>
        ))}
      </div>

      {/* Multi-channel */}
      {succeeded.length > 0 && (
        <section className='border-border bg-muted/30 space-y-4 rounded-xl border p-4'>
          <h3 className='flex items-center gap-1.5 text-sm font-semibold'>
            <Rocket className='size-4' /> Đẩy sang các kênh (1 chạm)
          </h3>
          <div className='flex flex-wrap items-end gap-4'>
            <div className='space-y-1'>
              <Label className='text-xs'>Landing nguồn</Label>
              <select
                value={mcPageId}
                onChange={e => setMcPageId(e.target.value)}
                className={cn(SELECT_CLASS, 'block')}
              >
                <option value=''>— chọn landing —</option>
                {succeeded.map(it => (
                  <option key={it.productId} value={it.output!.page_id}>
                    {it.productName}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex flex-wrap gap-1.5'>
              {CHANNELS.map(c => (
                <Chip
                  key={c.id}
                  selected={mcChannels.has(c.id)}
                  onClick={() => {
                    const next = new Set(mcChannels);
                    if (next.has(c.id)) next.delete(c.id);
                    else next.add(c.id);
                    setMcChannels(next);
                  }}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
            <Button
              variant='ai'
              size='sm'
              disabled={!mcPageId || mcChannels.size === 0 || mcRunning}
              onClick={onMultiChannel}
            >
              {mcRunning ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <Sparkles className='size-4' />
              )}
              Sinh biến thể kênh
            </Button>
          </div>

          {mcResult && (
            <ul className='divide-border border-border bg-background divide-y overflow-hidden rounded-lg border'>
              {mcResult.channels.map(ch => (
                <li
                  key={ch.channel}
                  className='flex items-center gap-2 px-3 py-2 text-sm'
                >
                  {ch.status === 'created' ? (
                    <Check className='text-success size-4' />
                  ) : (
                    <X className='text-danger size-4' />
                  )}
                  <span className='font-medium uppercase'>{ch.channel}</span>
                  {ch.status === 'created' ? (
                    <>
                      <span className='text-content-muted text-xs'>
                        {ch.blocks_kept} block giữ lại
                      </span>
                      <button
                        type='button'
                        onClick={() => ch.page_id && onView(ch.page_id)}
                        className='text-primary ml-auto inline-flex items-center gap-1 text-xs hover:underline'
                      >
                        Xem <ExternalLink className='size-3' />
                      </button>
                    </>
                  ) : (
                    <span className='text-danger ml-auto text-xs'>
                      {ch.error ?? 'lỗi'}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
