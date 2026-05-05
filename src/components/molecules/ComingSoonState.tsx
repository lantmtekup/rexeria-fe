'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, Sparkles } from 'lucide-react';

import { cn } from '@/lib/cn';

interface ComingSoonStateProps {
  /** Page title shown above the message. */
  title: string;
  /** Subtitle / explanation. */
  description?: string;
  /** Lucide icon component to render in the badge. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional back link config. */
  backHref?: string;
  backLabel?: string;
  className?: string;
}

/**
 * Shared placeholder for routes that exist in the sidebar / settings hub
 * but haven't been implemented yet. Avoids 404 on links.
 */
export function ComingSoonState({
  title,
  description,
  icon: Icon = Sparkles,
  backHref,
  backLabel,
  className,
}: ComingSoonStateProps) {
  return (
    <div className={cn('mx-auto w-full max-w-[1100px] px-8 py-6', className)}>
      {backHref && (
        <div className='flex items-center gap-2 text-xs'>
          <Link
            href={backHref}
            className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1'
          >
            <ChevronLeft className='size-3.5' /> {backLabel ?? 'Back'}
          </Link>
        </div>
      )}

      <div className='border-border bg-background mt-4 flex flex-col items-center justify-center gap-3 rounded-xl border p-12 text-center'>
        <span className='bg-primary/10 text-primary inline-flex size-14 items-center justify-center rounded-2xl'>
          <Icon className='size-6' />
        </span>
        <h1 className='text-foreground text-2xl font-semibold'>{title}</h1>
        {description && (
          <p className='text-muted-foreground max-w-md text-sm'>
            {description}
          </p>
        )}
        <span className='border-border text-muted-foreground rounded-pill mt-2 inline-flex items-center gap-1.5 border px-3 py-1 text-xs font-medium'>
          <Sparkles className='size-3' />
          Đang phát triển — sẽ ra mắt sớm
        </span>
      </div>
    </div>
  );
}
