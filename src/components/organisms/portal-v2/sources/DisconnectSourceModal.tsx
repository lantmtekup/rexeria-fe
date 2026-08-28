'use client';

import { Unplug } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import type { AuditSource } from '@/lib/portal-v2/journey-audit/types';

type DisconnectSourceModalProps = {
  source: AuditSource | null;
  /** Số touchpoint sẽ thành ghost (demo); null = không đếm được (live). */
  feeds: number | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

/** Xác nhận ngắt kết nối — lịch sử giữ lại, touchpoint mất nguồn thành ghost
 *  và điểm stage tính lại ngay (FR-D9). */
export const DisconnectSourceModal = ({
  source,
  feeds,
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
        {feeds == null
          ? t('disconnectBodyLive', { name: source.name })
          : feeds
            ? t('disconnectBody', { name: source.name, count: feeds })
            : t('disconnectBodyNone', { name: source.name })}
      </p>
    </Modal>
  );
};
