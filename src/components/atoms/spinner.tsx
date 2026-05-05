import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/cn';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

function Spinner({ size = 16, className, ...props }: SpinnerProps) {
  return (
    <span
      role='status'
      aria-label='Loading'
      className={cn('inline-flex', className)}
      {...props}
    >
      <Loader2
        className='animate-spin text-current'
        width={size}
        height={size}
      />
    </span>
  );
}

export { Spinner };
