'use client';

import * as React from 'react';

import { AvatarStack } from '@/components/atoms/avatar';
import {
  StatusIndicator,
  type StatusTone,
} from '@/components/atoms/status-dot';
import { cn } from '@/lib/cn';

export interface MarketingCardProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'title'
> {
  title: string;
  createdAt: string;
  members: { name: string; src?: string }[];
  campaigns: number | string;
  status?: { tone: StatusTone; label: string };
}

/**
 * Wide card summarising a Marketing instance — title + create date on the left,
 * then three aligned columns for Member / Campaigns / Status.
 */
function MarketingCard({
  title,
  createdAt,
  members,
  campaigns,
  status,
  className,
  ...props
}: MarketingCardProps) {
  return (
    <article
      className={cn(
        'bg-muted/60 hover:bg-muted flex cursor-pointer flex-col gap-3 rounded-xl p-5 transition-colors',
        className
      )}
      {...props}
    >
      <div>
        <p className='text-foreground text-base font-semibold tracking-[-0.02em]'>
          {title}
        </p>
        <p className='text-content-muted text-xs'>Create: {createdAt}</p>
      </div>
      <div className='grid grid-cols-3 gap-4 text-sm'>
        <div className='flex flex-col gap-1'>
          <span className='text-content-muted text-xs font-semibold'>
            Member
          </span>
          <AvatarStack avatars={members} size='sm' max={4} />
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-content-muted text-xs font-semibold'>
            Campaign
          </span>
          <span className='text-foreground text-base font-semibold tabular-nums'>
            {campaigns}
          </span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-content-muted text-xs font-semibold'>
            Status
          </span>
          {status && (
            <StatusIndicator tone={status.tone}>{status.label}</StatusIndicator>
          )}
        </div>
      </div>
    </article>
  );
}

export { MarketingCard };
