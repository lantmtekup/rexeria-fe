import * as React from 'react';

import { cn } from '@/lib/cn';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

function Divider({
  orientation = 'horizontal',
  className,
  ...props
}: DividerProps) {
  return (
    <div
      role='separator'
      aria-orientation={orientation}
      className={cn(
        'bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      {...props}
    />
  );
}

export { Divider };
