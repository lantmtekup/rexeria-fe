'use client';

import { cn } from '@/lib/cn';

type FilterChipsProps<T extends string> = {
  label?: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  /** Inline chipbar only — label rendered by parent toolbar */
  inline?: boolean;
};

export const FilterChips = <T extends string>({
  label,
  options,
  value,
  onChange,
  inline = false,
}: FilterChipsProps<T>) => {
  const chipbar = (
    <div className='flex flex-wrap items-center gap-[7px]'>
      {options.map(opt => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type='button'
            aria-pressed={active}
            tabIndex={0}
            onClick={() => onChange(opt.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(opt.id);
              }
            }}
            className={cn(
              'inline-flex items-center rounded-full border px-3 py-1.5',
              'text-[12px] font-semibold transition-colors duration-150',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none',
              'active:scale-[0.98]',
              active
                ? 'border-[var(--pv2-ink)] bg-[var(--pv2-ink)] text-[var(--pv2-paper)]'
                : 'border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-[var(--pv2-mut)] hover:border-[color-mix(in_srgb,var(--pv2-violet)_35%,var(--pv2-hair))] hover:text-[var(--pv2-ink)]'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );

  if (inline) return chipbar;

  return (
    <div className='flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2'>
      {label ? (
        <span className='w-[72px] shrink-0 text-[11px] font-semibold tracking-[0.04em] text-[var(--pv2-faint)] uppercase'>
          {label}
        </span>
      ) : null}
      {chipbar}
    </div>
  );
};
