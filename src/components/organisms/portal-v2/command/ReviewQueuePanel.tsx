'use client';

import Link from 'next/link';

import { OwnerAvatar } from '@/components/organisms/portal-v2/command/OwnerAvatar';
import { SectionHead } from '@/components/organisms/portal-v2/command/SectionHead';
import { initialsOf } from '@/lib/portal-v2/command/helpers';
import type { ReviewRequest } from '@/lib/portal-v2/command/types';
import { cn } from '@/lib/cn';

type ReviewQueuePanelProps = {
  reviews: ReviewRequest[];
  /** Name of the signed-in user, so their own queue reads differently. */
  userName: string;
  t: (key: string, values?: Record<string, string | number>) => string;
};

/** Waiting on a person is the cheapest delay to fix and the easiest to forget. */
export const ReviewQueuePanel = ({
  reviews,
  userName,
  t,
}: ReviewQueuePanelProps) => (
  <section>
    <SectionHead
      title={t('reviewHeading')}
      subtitle={t('reviewSub')}
      className='mb-3'
    />
    <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4'>
      {reviews.length ? (
        reviews.map(review => {
          const isMine = review.reviewer === userName;
          return (
            <Link
              key={review.id}
              href={review.href}
              className={cn(
                'flex items-center gap-3 border-b border-[var(--pv2-hair)] py-3 last:border-b-0',
                'transition-colors hover:bg-[var(--pv2-canvas)]',
                'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none'
              )}
            >
              <OwnerAvatar
                initials={initialsOf(review.reviewer)}
                label={t('reviewerLabel', { name: review.reviewer })}
              />
              <span className='min-w-0 flex-1'>
                <span className='block truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                  {review.experienceName}
                </span>
                <span className='block truncate text-[12px] text-[var(--pv2-faint)]'>
                  {review.campaignName}
                  {' · '}
                  {isMine
                    ? t('reviewWaitingOnYou')
                    : t('reviewWaitingOn', { name: review.reviewer })}
                </span>
              </span>
              <span
                className={cn(
                  'text-[11.5px] font-semibold whitespace-nowrap tabular-nums',
                  review.waitingDays >= 3
                    ? 'text-[var(--pv2-warning)]'
                    : 'text-[var(--pv2-faint)]'
                )}
              >
                {t('waitingDays', { count: review.waitingDays })}
              </span>
            </Link>
          );
        })
      ) : (
        <div className='py-6 text-center'>
          <p className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
            {t('reviewEmptyTitle')}
          </p>
          <p className='mt-1 text-[12.5px] text-[var(--pv2-faint)]'>
            {t('reviewEmptyBody')}
          </p>
        </div>
      )}
    </div>
  </section>
);
