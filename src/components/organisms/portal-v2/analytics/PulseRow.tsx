import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/cn';

type PulseRowProps = {
  title: string;
  subtitle?: string;
  metrics: string[];
  coverage?: string;
  coverageLow?: boolean;
  onClick?: () => void;
  className?: string;
};

export const PulseRow = ({
  title,
  subtitle,
  metrics,
  coverage,
  coverageLow = false,
  onClick,
  className,
}: PulseRowProps) => {
  const interactive = Boolean(onClick);

  return (
    <button
      type='button'
      onClick={onClick}
      disabled={!interactive}
      className={cn(
        'grid w-full grid-cols-1 items-start gap-2 border-b border-[var(--pv2-hair)] px-4 py-3.5 text-left transition-colors last:border-b-0 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))] md:items-center md:gap-3',
        interactive &&
          'cursor-pointer hover:bg-[var(--pv2-canvas)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
        !interactive && 'cursor-default',
        className
      )}
    >
      <span className='min-w-0'>
        <strong className='block truncate text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
          {title}
        </strong>
        {subtitle ? (
          <span className='mt-0.5 block truncate text-[11.5px] text-[var(--pv2-mut)]'>
            {subtitle}
          </span>
        ) : null}
      </span>
      {metrics.map(metric => (
        <span
          key={metric}
          className='text-[12px] text-[var(--pv2-mut)] md:text-right'
        >
          {metric}
        </span>
      ))}
      {coverage ? (
        <span
          className={cn(
            'text-[11px] font-semibold md:text-right',
            coverageLow ? 'text-[var(--pv2-error)]' : 'text-[var(--pv2-faint)]'
          )}
        >
          {coverage}
        </span>
      ) : null}
      {interactive ? (
        <ChevronRight
          className='hidden size-4 shrink-0 text-[var(--pv2-faint)] md:col-start-[-1] md:block'
          aria-hidden
        />
      ) : null}
    </button>
  );
};
