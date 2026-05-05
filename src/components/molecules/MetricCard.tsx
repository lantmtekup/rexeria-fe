import * as React from 'react';

import { cn } from '@/lib/cn';

export interface MetricCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  label: string;
  value: string | number;
  hint?: React.ReactNode;
}

/** Compact metric card used on the Home dashboard strip. */
function MetricCard({
  label,
  value,
  hint,
  className,
  ...props
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'border-border bg-background flex flex-col gap-1 rounded-xl border px-4 py-3',
        className
      )}
      {...props}
    >
      <span className='text-content-muted text-xs font-semibold'>{label}</span>
      <span className='text-2xl font-bold tracking-[-0.02em]'>{value}</span>
      {hint && <span className='text-content-muted text-xs'>{hint}</span>}
    </div>
  );
}

export { MetricCard };
