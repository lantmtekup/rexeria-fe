'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { TypeSwatch } from '@/components/molecules/portal-v2/campaigns-form';
import { WarnBox } from '@/components/molecules/portal-v2/product-form';
import {
  campExpCount,
  deriveStage,
  fmtRange,
} from '@/lib/portal-v2/campaigns/helpers';
import type { CampaignView } from '@/lib/portal-v2/campaigns/types';

type DeleteCampaignModalProps = {
  items: CampaignView[];
  onClose: () => void;
  onConfirm: () => void;
};

export const DeleteCampaignModal = ({
  items,
  onClose,
  onConfirm,
}: DeleteCampaignModalProps) => {
  const t = useTranslations('portalV2.campaigns');

  const single = items.length === 1;
  const live = items.filter(c => deriveStage(c) === 'live').length;
  const experiences = items.reduce((n, c) => n + campExpCount(c), 0);

  return (
    <Modal
      open
      onClose={onClose}
      title={
        single
          ? t('deleteOneTitle', { name: items[0]?.name ?? '' })
          : t('deleteManyTitle', { count: items.length })
      }
      subtitle={t('deleteSub')}
      footer={
        <>
          <Button variant='ghost' onClick={onClose}>
            {t('cancel')}
          </Button>
          <span className='flex-1' />
          <Button
            variant='primary'
            className='bg-[var(--pv2-error)] shadow-none hover:bg-[color-mix(in_srgb,var(--pv2-error)_80%,#000)]'
            onClick={onConfirm}
          >
            <Trash2 className='size-3.5' strokeWidth={2} aria-hidden />
            {single
              ? t('deleteCampaign')
              : t('deleteNCampaigns', { count: items.length })}
          </Button>
        </>
      }
    >
      {live ? (
        <WarnBox title={t('deleteLiveWarnTitle', { count: live })}>
          {t('deleteLiveWarnBody')}
        </WarnBox>
      ) : null}

      {experiences ? (
        <WarnBox title={t('deleteExpWarnTitle', { count: experiences })}>
          {t('deleteExpWarnBody')}
        </WarnBox>
      ) : null}

      <div className='flex flex-col gap-2'>
        {items.map(campaign => (
          <div
            key={campaign.id}
            className='flex items-center gap-3 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] px-3 py-2.5'
          >
            <TypeSwatch type={campaign.type} size={30} radius={8} />
            <span className='min-w-0 flex-1'>
              <span className='block truncate text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
                {campaign.name}
              </span>
              <span className='block truncate text-[11px] text-[var(--pv2-faint)]'>
                {fmtRange(campaign, t('ongoing'))} ·{' '}
                {t('subjectCount', { count: campaign.items.length })}
              </span>
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
};
