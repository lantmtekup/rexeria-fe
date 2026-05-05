import * as React from 'react';

import { cn } from '@/lib/cn';

export interface EmptyStateProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  /** Icon or illustration above the title */
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Primary + optional secondary CTAs rendered below */
  actions?: React.ReactNode;
}

/**
 * Shared empty-state block — used by Marketing Empty, Media Empty, AI-Agents
 * Empty, Product Empty, etc. Composition-first: pass the CTA buttons in via
 * `actions` so each caller can mix pill / primary / ghost as the design needs.
 */
function EmptyState({
  icon,
  title,
  description,
  actions,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className
      )}
      {...props}
    >
      {icon && (
        <div className='mb-2 flex items-center justify-center text-neutral-400'>
          {icon}
        </div>
      )}
      <div className='space-y-1'>
        <h3 className='text-foreground text-xl font-semibold'>{title}</h3>
        {description && (
          <p className='text-muted-foreground max-w-sm text-sm'>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className='mt-2 flex flex-col items-center gap-2 sm:flex-row'>
          {actions}
        </div>
      )}
    </div>
  );
}

export { EmptyState };
