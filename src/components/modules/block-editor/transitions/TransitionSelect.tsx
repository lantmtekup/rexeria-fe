'use client';

import * as React from 'react';
import { Check, ChevronDown, Zap } from 'lucide-react';

import { cn } from '@/lib/cn';

import {
  TEMPLATE_TRANSITIONS,
  asTransition,
  type TemplateTransition,
} from './TemplateTransitions';

/**
 * Selector transition cấp template — "ÁP DỤNG CHO CẢ COLLECTION". Dropdown 6
 * preset (Không/Fade/Roll-up/Swipe/Tabs/Parallax) kèm mô tả. Dùng trong editor.
 */
export function TransitionSelect({
  value,
  onChange,
  className,
  placement = 'up',
  variant = 'default',
}: {
  value: string;
  onChange: (v: TemplateTransition) => void;
  className?: string;
  /** Hướng mở dropdown: 'up' (mặc định, khi nổi ở đáy) hoặc 'down' (header). */
  placement?: 'up' | 'down';
  /** `compact` — một dòng, nhỏ gọn cho header. */
  variant?: 'default' | 'compact';
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const current = asTransition(value);
  const currentMeta = TEMPLATE_TRANSITIONS.find(o => o.id === current);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      {open && (
        <div
          className={cn(
            'border-border absolute left-0 z-50 w-80 overflow-hidden rounded-xl border bg-white shadow-xl',
            placement === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'
          )}
        >
          <div className='text-3xs text-content-muted border-border border-b px-4 py-2.5 font-semibold tracking-[0.18em] uppercase'>
            Transition · áp dụng cho cả collection
          </div>
          <ul className='max-h-[60vh] overflow-y-auto py-1'>
            {TEMPLATE_TRANSITIONS.map(o => {
              const active = o.id === current;
              return (
                <li key={o.id}>
                  <button
                    type='button'
                    onClick={() => {
                      onChange(o.id);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors',
                      active ? 'bg-primary/5' : 'hover:bg-muted'
                    )}
                  >
                    <div className='min-w-0 flex-1'>
                      <div
                        className={cn(
                          'text-sm font-semibold',
                          active ? 'text-primary' : 'text-foreground'
                        )}
                      >
                        {o.label}
                      </div>
                      <div className='text-content-muted text-xs'>{o.desc}</div>
                    </div>
                    {active && (
                      <Check className='text-primary mt-0.5 size-4 shrink-0' />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        title={`Transition: ${currentMeta?.label ?? current}`}
        aria-label={`Transition: ${currentMeta?.label ?? current}`}
        className={cn(
          'border-border flex items-center gap-1.5 rounded-md border bg-white text-left shadow-sm transition hover:bg-neutral-50',
          variant === 'compact'
            ? 'h-7 max-w-[9.5rem] px-2'
            : 'w-44 gap-2 rounded-lg px-3 py-2'
        )}
      >
        <Zap
          className={cn(
            'text-primary shrink-0',
            variant === 'compact' ? 'size-3.5' : 'size-4'
          )}
        />
        <span className='min-w-0 flex-1'>
          {variant === 'default' && (
            <span className='text-3xs text-content-muted block leading-none font-semibold tracking-[0.16em] uppercase'>
              Transition
            </span>
          )}
          <span
            className={cn(
              'text-foreground block truncate font-semibold',
              variant === 'compact' ? 'text-2xs' : 'text-sm'
            )}
          >
            {currentMeta?.label}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'text-content-muted shrink-0',
            variant === 'compact' ? 'size-3' : 'size-4'
          )}
        />
      </button>
    </div>
  );
}
