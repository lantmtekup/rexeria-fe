'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { cn } from '@/lib/cn';
import { FORK_CAMPAIGNS } from '@/lib/portal-v2/journeys/constants';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type ForkJourneyModalProps = {
  journey: Journey;
  /** Campaign ids that already carry a copy of this blueprint. */
  forkedInto: string[];
  onClose: () => void;
  onPick: (campaignId: string, campaignName: string) => void;
};

export const ForkJourneyModal = ({
  journey,
  forkedInto,
  onClose,
  onPick,
}: ForkJourneyModalProps) => {
  const t = useTranslations('portalV2.journeys');

  return (
    <Modal
      open
      onClose={onClose}
      title={t('forkTitle')}
      subtitle={t('forkSubtitle', { name: journey.name })}
      footer={
        <>
          <span className='text-[11.5px] text-[var(--pv2-faint)]'>
            {t('forkNote')}
          </span>
          <span className='flex-1' />
          <Button variant='ghost' size='sm' onClick={onClose}>
            {t('cancel')}
          </Button>
        </>
      }
    >
      <div className='flex flex-col gap-2'>
        {FORK_CAMPAIGNS.map(campaign => {
          const already = forkedInto.includes(campaign.id);
          return (
            <button
              key={campaign.id}
              type='button'
              onClick={() => onPick(campaign.id, campaign.name)}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-[var(--pv2-r-sm)] border px-3.5 py-3 text-left',
                'border-[var(--pv2-hair)] bg-[var(--pv2-paper)] transition-colors',
                'hover:border-[var(--pv2-electric)]',
                'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
              )}
            >
              <span className='min-w-0 flex-1'>
                <span className='block truncate text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
                  {campaign.name}
                </span>
                <span className='mt-0.5 block truncate text-[11.5px] text-[var(--pv2-faint)]'>
                  {campaign.status} · {campaign.owner}
                </span>
              </span>
              {already ? (
                <span className='inline-flex shrink-0 items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--pv2-success)_14%,transparent)] px-2.5 py-1 text-[10px] font-bold text-[#0e9d6e] uppercase'>
                  <Check className='size-3' strokeWidth={3} aria-hidden />
                  {t('forkAlready')}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </Modal>
  );
};
