'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';

type MediaAlertsProps = {
  loadError: string | null;
  expiringCount: number;
  onReviewExpiring: () => void;
};

export const MediaAlerts = ({
  loadError,
  expiringCount,
  onReviewExpiring,
}: MediaAlertsProps) => {
  const t = useTranslations('portalV2.media');

  return (
    <>
      {loadError ? (
        <div className='mb-4 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-3 text-[12.5px] text-[var(--pv2-mut)]'>
          <span className='font-semibold text-[var(--pv2-ink)]'>
            {t('loadError')}
          </span>{' '}
          {loadError}
        </div>
      ) : null}

      {expiringCount ? (
        <div className='mb-4 flex items-start gap-3 rounded-[var(--pv2-r)] border border-[color-mix(in_srgb,var(--pv2-error)_25%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_8%,transparent)] px-4 py-3'>
          <AlertTriangle
            className='mt-0.5 size-4 shrink-0 text-[var(--pv2-error)]'
            strokeWidth={2}
            aria-hidden
          />
          <div className='min-w-0 flex-1'>
            <p className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
              {t('expiringWarning', { count: expiringCount })}
            </p>
            <p className='mt-0.5 text-[12px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('expiringWarningBody')}
            </p>
          </div>
          <Button variant='ghost' size='sm' onClick={onReviewExpiring}>
            {t('review')}
          </Button>
        </div>
      ) : null}
    </>
  );
};
