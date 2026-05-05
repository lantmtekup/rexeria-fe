'use client';

import * as React from 'react';
import Link from 'next/link';

import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/cn';

export interface SectionHeaderProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  title: React.ReactNode;
  /** Optional "Show All" link target */
  showAllHref?: string;
  showAllLabel?: React.ReactNode;
  /** Override right-side actions entirely (ignores showAllHref when provided) */
  actions?: React.ReactNode;
}

/**
 * Dashboard section header — bold title on the left, a light-pill "Show All"
 * (or custom actions) on the right. Used at the top of Template / Product
 * columns on Home and on list views.
 */
function SectionHeader({
  title,
  showAllHref,
  showAllLabel = 'Show All',
  actions,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn('flex items-center justify-between gap-4 py-4', className)}
      {...props}
    >
      <h2 className='text-foreground text-2xl font-semibold tracking-[-0.02em]'>
        {title}
      </h2>
      {actions ??
        (showAllHref && (
          <Button
            asChild
            variant='pill-light'
            size='sm'
            className='px-4 text-xs'
          >
            <Link href={showAllHref}>{showAllLabel}</Link>
          </Button>
        ))}
    </div>
  );
}

export { SectionHeader };
