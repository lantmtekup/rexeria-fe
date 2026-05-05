import * as React from 'react';

import { cn } from '@/lib/cn';

export type StatusTone = 'success' | 'danger' | 'warning' | 'neutral';

const toneMap: Record<StatusTone, string> = {
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
  neutral: 'bg-neutral-400',
};

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  /** pixel size */
  size?: number;
}

function StatusDot({
  tone = 'neutral',
  size = 8,
  className,
  style,
  ...props
}: StatusDotProps) {
  return (
    <span
      aria-hidden
      className={cn('inline-block rounded-full', toneMap[tone], className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    />
  );
}

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  children: React.ReactNode;
}

/** Dot + label composite — `● Active`, `● Stop` */
function StatusIndicator({
  tone = 'neutral',
  children,
  className,
  ...props
}: StatusIndicatorProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-sm', className)}
      {...props}
    >
      <StatusDot tone={tone} />
      <span>{children}</span>
    </span>
  );
}

export { StatusDot, StatusIndicator };
