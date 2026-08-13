'use client';

import { Unplug } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import type { MiningSource } from '@/lib/portal-v2/mining/types';

type DisconnectSourceModalProps = {
  source: MiningSource | null;
  citations: number;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const DisconnectSourceModal = ({
  source,
  citations,
  open,
  onClose,
  onConfirm,
}: DisconnectSourceModalProps) => {
  const t = useTranslations('portalV2.sources');
  if (!source) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('disconnectTitle', { name: source.name })}
      footer={
        <>
          <Button variant='ghost' onClick={onClose}>
            {t('keepIt')}
          </Button>
          <Button variant='danger' onClick={onConfirm}>
            <Unplug aria-hidden />
            {t('disconnect')}
          </Button>
        </>
      }
    >
      <p className='text-[13px] leading-6 text-[var(--pv2-mut)]'>
        {citations
          ? t('disconnectCited', { name: source.name, count: citations })
          : t('disconnectUncited', { name: source.name })}
      </p>
    </Modal>
  );
};
