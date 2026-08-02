'use client';

import { ImageOff, ShieldAlert, Unplug, UserPlus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/molecules/portal-v2/Button';
import { OwnerAvatar } from '@/components/organisms/portal-v2/command/OwnerAvatar';
import { BLOCKER_STYLE } from '@/lib/portal-v2/command/constants';
import { initialsOf } from '@/lib/portal-v2/command/helpers';
import type {
  BlockerReason,
  DeployBlocker,
} from '@/lib/portal-v2/command/types';
import { cn } from '@/lib/cn';

type BlockedPanelProps = {
  blockers: DeployBlocker[];
  t: (key: string, values?: Record<string, string | number>) => string;
  onFix?: (blocker: DeployBlocker) => void;
};

const REASON_ICON: Record<BlockerReason, typeof ImageOff> = {
  'media-expired': ImageOff,
  'missing-channel': Unplug,
  'brand-approval': ShieldAlert,
  'no-owner': UserPlus,
};

const BlockerRow = ({
  blocker,
  t,
  onFix,
}: {
  blocker: DeployBlocker;
  t: BlockedPanelProps['t'];
  onFix?: BlockedPanelProps['onFix'];
}) => {
  const style = BLOCKER_STYLE[blocker.reason];
  const Icon = REASON_ICON[blocker.reason];
  const tone =
    style.tone === 'error' ? 'var(--pv2-error)' : 'var(--pv2-warning)';

  return (
    <div className='flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[var(--pv2-hair)] py-3.5 last:border-b-0'>
      <span
        className='flex size-8 shrink-0 items-center justify-center rounded-[var(--pv2-r-sm)]'
        style={{
          background: `color-mix(in srgb, ${tone} 12%, transparent)`,
          color: tone,
        }}
        aria-hidden
      >
        <Icon className='size-3.5' strokeWidth={2.2} />
      </span>

      <div className='min-w-0 flex-1 basis-[220px]'>
        <p className='flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
          {blocker.experienceName}
          <span
            className='rounded-md px-1.5 py-px text-[10.5px] font-semibold'
            style={{
              background: `color-mix(in srgb, ${tone} 12%, transparent)`,
              color: tone,
            }}
          >
            {t(style.labelKey)}
          </span>
        </p>
        <p className='mt-0.5 text-[12.5px] leading-relaxed text-[var(--pv2-faint)]'>
          {blocker.campaignName}
          {' · '}
          {blocker.detail}
        </p>
      </div>

      <span className='text-[12px] font-semibold whitespace-nowrap text-[var(--pv2-mut)] tabular-nums'>
        {t('stuckDays', { count: blocker.waitingDays })}
      </span>

      <OwnerAvatar
        initials={blocker.owner ? initialsOf(blocker.owner) : null}
        label={blocker.owner ?? t('noOwnerLabel')}
      />

      <Button variant='ghost' size='sm' asChild>
        <Link href={blocker.href} onClick={() => onFix?.(blocker)}>
          {t(blocker.fixLabelKey)}
        </Link>
      </Button>
    </div>
  );
};

/**
 * The plan's headline requirement for this module: work that is finished but
 * cannot ship. It sits directly under the KPIs because nothing else on the page
 * costs more per day of being ignored.
 */
export const BlockedPanel = ({ blockers, t, onFix }: BlockedPanelProps) => {
  const worst = blockers.some(b => BLOCKER_STYLE[b.reason].tone === 'error');

  return (
    <section
      className={cn(
        'overflow-hidden rounded-[var(--pv2-r)] border bg-[var(--pv2-paper)]',
        blockers.length && worst
          ? 'border-[color-mix(in_srgb,var(--pv2-error)_35%,var(--pv2-hair))]'
          : 'border-[var(--pv2-hair)]'
      )}
    >
      <div className='flex flex-wrap items-center justify-between gap-2 border-b border-[var(--pv2-hair)] px-4 py-2.5 sm:px-5'>
        <div>
          <h2 className='font-[family-name:var(--pv2-disp)] text-[14px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
            {t('blockedHeading')}
          </h2>
          <p className='mt-0.5 text-[12.5px] text-[var(--pv2-faint)]'>
            {t('blockedSub')}
          </p>
        </div>
        {blockers.length ? (
          <span className='rounded-md bg-[color-mix(in_srgb,var(--pv2-error)_12%,transparent)] px-2 py-0.5 text-[11.5px] font-semibold text-[var(--pv2-error)] tabular-nums'>
            {t('blockedCount', { count: blockers.length })}
          </span>
        ) : null}
      </div>

      <div className='px-4 sm:px-5'>
        {blockers.length ? (
          blockers.map(blocker => (
            <BlockerRow
              key={blocker.id}
              blocker={blocker}
              t={t}
              onFix={onFix}
            />
          ))
        ) : (
          <div className='py-7 text-center'>
            <p className='text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
              {t('blockedEmptyTitle')}
            </p>
            <p className='mt-1 text-[12.5px] text-[var(--pv2-faint)]'>
              {t('blockedEmptyBody')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
