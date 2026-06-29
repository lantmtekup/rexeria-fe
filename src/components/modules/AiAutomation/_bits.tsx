'use client';

import * as React from 'react';
import { Check, Eye, Sparkles, type LucideIcon } from 'lucide-react';

import { Spinner } from '@/components/atoms/spinner';
import { StatusDot } from '@/components/atoms/status-dot';
import { cn } from '@/lib/cn';

import type { RunStatus, Step } from './_shared';

const STEPS: { id: Step; label: string; sub: string }[] = [
  { id: 'template', label: 'Bản gốc', sub: 'Chọn trang khuôn' },
  { id: 'product', label: 'Sản phẩm', sub: 'Chọn sản phẩm' },
  { id: 'running', label: 'AI tạo', sub: 'Sinh landing' },
  { id: 'results', label: 'Kết quả', sub: 'Xem & xuất bản' },
];

/** Header gradient AI + thanh tiến trình 4 bước (chỉnh chu). Bước đã qua bấm
 *  được để quay lại (qua `onStepClick`); bước chưa tới thì khoá. */
export function WizardHeader({
  step,
  onStepClick,
}: {
  step: Step;
  onStepClick?: (step: Step) => void;
}) {
  const activeIdx = STEPS.findIndex(s => s.id === step);
  return (
    <header className='mb-8'>
      <div className='flex items-start gap-3'>
        <span className='bg-ai-gradient text-primary-600 flex size-11 shrink-0 items-center justify-center rounded-xl shadow-sm'>
          <Sparkles className='size-5' />
        </span>
        <div>
          <p className='text-primary text-2xs mb-0.5 font-semibold tracking-[0.12em] uppercase'>
            AI-Automation
          </p>
          <h1 className='text-2xl leading-tight font-bold tracking-tight'>
            Một bản gốc, nhiều landing
          </h1>
        </div>
      </div>

      <ol className='mt-7 flex items-center'>
        {STEPS.map((s, i) => {
          const state =
            i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'todo';
          const clickable = state === 'done' && !!onStepClick;
          const isLast = i === STEPS.length - 1;
          return (
            <li
              key={s.id}
              className={cn('flex items-center', !isLast && 'flex-1')}
            >
              <button
                type='button'
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(s.id)}
                className={cn(
                  'flex items-center gap-2.5 text-left',
                  clickable && 'cursor-pointer'
                )}
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                    state === 'active' &&
                      'bg-primary text-primary-foreground ring-primary/20 ring-4',
                    state === 'done' && 'bg-primary text-primary-foreground',
                    state === 'todo' &&
                      'border-border text-content-muted bg-background border'
                  )}
                >
                  {state === 'done' ? <Check className='size-4' /> : i + 1}
                </span>
                <span className='hidden flex-col leading-tight sm:flex'>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      state === 'todo'
                        ? 'text-content-muted'
                        : 'text-foreground'
                    )}
                  >
                    {s.label}
                  </span>
                  <span className='text-content-muted text-2xs'>{s.sub}</span>
                </span>
              </button>
              {!isLast && (
                <span
                  className={cn(
                    'mx-3 h-0.5 flex-1 rounded-full transition-colors',
                    i < activeIdx ? 'bg-primary' : 'bg-border'
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
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
