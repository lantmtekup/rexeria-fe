'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import type { MediaDeleteTarget } from '@/lib/portal-v2/media/types';

type MediaDeleteConfirmModalProps = {
  target: MediaDeleteTarget | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const MediaDeleteConfirmModal = ({
  target,
  deleting,
  onCancel,
  onConfirm,
}: MediaDeleteConfirmModalProps) => {
  const t = useTranslations('portalV2.media');

  if (!target) return null;

  const message =
    target.kind === 'single'
      ? t('confirmDelete', { name: target.asset.name })
      : t('confirmBulkDelete', { count: target.count });

  const footer = (
    <>
      <Button variant='ghost' disabled={deleting} onClick={onCancel}>
        {t('cancel')}
      </Button>
      <span className='flex-1' />
      <Button variant='danger' disabled={deleting} onClick={onConfirm}>
        <Trash2 className='size-3.5' strokeWidth={2} aria-hidden />
        {t('delete')}
      </Button>
    </>
  );

  return (
    <Modal
      open
      onClose={onCancel}
      title={t('confirmDeleteTitle')}
      footer={footer}
    >
      <p className='text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
        {message}
      </p>
    </Modal>
  );
};
