'use client';

import { X } from 'lucide-react';
import { useEffect, useId, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  'aria-label'?: string;
};

export const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide = false,
  'aria-label': ariaLabel,
}: ModalProps) => {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className='fixed inset-0 z-[calc(var(--pv2-z-top)+10)] flex items-end justify-center p-4 sm:items-center'
      role='presentation'
    >
      <button
        type='button'
        aria-label='Close dialog overlay'
        className='absolute inset-0 cursor-default bg-black/40'
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        aria-label={ariaLabel}
        className={cn(
          'relative flex max-h-[min(90vh,820px)] w-full flex-col overflow-hidden',
          'rounded-[var(--pv2-r-lg)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
          'shadow-[var(--pv2-sh-soft)]',
          wide ? 'max-w-[920px]' : 'max-w-[520px]'
        )}
      >
        <div className='flex shrink-0 items-start justify-between gap-4 border-b border-[var(--pv2-hair)] px-5 py-4'>
          <div className='min-w-0'>
            <h2
              id={titleId}
              className='font-[family-name:var(--pv2-disp)] text-[1.125rem] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'
            >
              {title}
            </h2>
            {subtitle ? (
              <p className='mt-0.5 text-[13px] text-[var(--pv2-mut)]'>
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type='button'
            aria-label='Close'
            tabIndex={0}
            onClick={onClose}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClose();
              }
            }}
            className={cn(
              'grid size-8 shrink-0 place-items-center rounded-[var(--pv2-r)]',
              'text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2'
            )}
          >
            <X className='size-4' strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto px-5 py-4'>
          {children}
        </div>

        {footer ? (
          <div className='flex shrink-0 flex-wrap items-center gap-2 border-t border-[var(--pv2-hair)] px-5 py-4'>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
};
