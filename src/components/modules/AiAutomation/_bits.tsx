'use client';

import * as React from 'react';
import { Check, Eye, Sparkles, type LucideIcon } from 'lucide-react';

import { Spinner } from '@/components/atoms/spinner';
import { StatusDot } from '@/components/atoms/status-dot';
import { cn } from '@/lib/cn';

import type { RunStatus, Step } from './_shared';

const STEPS: { id: Step; label: string }[] = [
  { id: 'setup', label: 'Chọn' },
  { id: 'running', label: 'AI tạo' },
  { id: 'results', label: 'Kết quả' },
];

/** Header gradient AI + chỉ báo bước. */
export function WizardHeader({ step }: { step: Step }) {
  const activeIdx = STEPS.findIndex(s => s.id === step);
  return (
    <header className='mb-7'>
      <div className='flex items-center gap-3'>
        <span className='bg-ai-gradient text-primary-600 flex size-10 shrink-0 items-center justify-center rounded-xl'>
          <Sparkles className='size-5' />
        </span>
        <div>
          <h1 className='text-xl font-bold tracking-tight'>AI-Automation</h1>
          <p className='text-content-muted text-sm'>
            Nhân 1 trải nghiệm đã duyệt ra nhiều sản phẩm, AI tự map nội dung.
          </p>
        </div>
      </div>
      <ol className='mt-5 flex items-center gap-2'>
        {STEPS.map((s, i) => (
          <li key={s.id} className='flex items-center gap-2'>
            <span
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium',
                i <= activeIdx ? 'text-foreground' : 'text-content-muted'
              )}
            >
              <span
                className={cn(
                  'text-3xs flex size-5 items-center justify-center rounded-full font-semibold',
                  i < activeIdx
                    ? 'bg-primary text-primary-foreground'
                    : i === activeIdx
                      ? 'text-primary ring-primary ring-1'
                      : 'bg-muted text-content-muted'
                )}
              >
                {i < activeIdx ? <Check className='size-3' /> : i + 1}
              </span>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className='bg-border h-px w-8' aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </header>
  );
}

/** Icon trạng thái 1 job (StatusDot / Spinner). */
export function RunStatusIcon({ status }: { status: RunStatus }) {
  if (status === 'succeeded') return <StatusDot tone='success' size={10} />;
  if (status === 'failed') return <StatusDot tone='danger' size={10} />;
  if (status === 'running' || status === 'enqueuing')
    return <Spinner size={14} />;
  return <StatusDot tone='neutral' size={10} />;
}

/** Tile chọn (template / sản phẩm) — cover + nhãn + tick. `onPreview` (tùy
 *  chọn) thêm nút mắt xem trước; là button anh em (không lồng trong button chọn). */
export function SelectTile({
  label,
  imageUrl,
  selected,
  onClick,
  onPreview,
  fallbackIcon: Icon,
}: {
  label: string;
  imageUrl?: string | null;
  selected: boolean;
  onClick: () => void;
  onPreview?: () => void;
  fallbackIcon: LucideIcon;
}) {
  return (
    <div className='group relative'>
      <button
        type='button'
        onClick={onClick}
        aria-pressed={selected}
        className={cn(
          'focus-visible:ring-ring flex w-full flex-col overflow-hidden rounded-xl border text-left transition-colors focus-visible:ring-2 focus-visible:outline-none',
          selected
            ? 'border-primary ring-primary ring-1'
            : 'border-border hover:border-foreground/30'
        )}
      >
        <span className='bg-muted relative block aspect-[4/3] w-full overflow-hidden'>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=''
              className='h-full w-full object-cover'
              loading='lazy'
            />
          ) : (
            <span className='text-content-muted flex h-full items-center justify-center'>
              <Icon className='size-6' />
            </span>
          )}
          {selected && (
            <span className='bg-primary text-primary-foreground absolute top-2 right-2 flex size-5 items-center justify-center rounded-full shadow-sm'>
              <Check className='size-3' />
            </span>
          )}
        </span>
        <span className='truncate px-3 py-2 text-sm font-medium'>{label}</span>
      </button>
      {onPreview && (
        <button
          type='button'
          onClick={onPreview}
          aria-label={`Xem trước ${label}`}
          className='absolute top-2 left-2 flex size-7 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/65 focus-visible:opacity-100'
        >
          <Eye className='size-3.5' />
        </button>
      )}
    </div>
  );
}
