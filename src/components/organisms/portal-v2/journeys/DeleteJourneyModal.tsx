'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type DeleteJourneyModalProps = {
  journey: Journey;
  /** How many campaign copies would be orphaned — a blueprint is never alone. */
  copies: number;
  onClose: () => void;
  onConfirm: () => void;
};

export const DeleteJourneyModal = ({
  journey,
  copies,
  onClose,
  onConfirm,
}: DeleteJourneyModalProps) => {
  const t = useTranslations('portalV2.journeys');

  return (
    <Modal
      open
      onClose={onClose}
      title={t('deleteTitle')}
      subtitle={journey.name}
      footer={
        <>
          <span className='flex-1' />
          <Button variant='ghost' size='sm' onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant='danger' size='sm' onClick={onConfirm}>
            {t('delete')}
          </Button>
        </>
      }
    >
      <p className='text-[13.5px] leading-relaxed text-[var(--pv2-slate-500)]'>
        {t('deleteBody')}
      </p>
      {copies > 0 ? (
        <p className='mt-3 rounded-[10px] bg-amber-50 px-4 py-3 text-[12.5px] leading-relaxed text-amber-950'>
          {t('deleteCopiesWarning', { count: copies })}
        </p>
      ) : null}
    </Modal>
  );
};
