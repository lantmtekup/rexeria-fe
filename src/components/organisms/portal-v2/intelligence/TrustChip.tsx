'use client';

import { useTranslations } from 'next-intl';

import { Modal } from '@/components/molecules/portal-v2/Modal';
import { cn } from '@/lib/cn';
import type { IntelTrust } from '@/lib/portal-v2/intelligence/types';

type TrustChipProps = {
  trust: IntelTrust;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

const trustTone = (score: number): string => {
  if (score >= 85) return 'text-[var(--pv2-success)]';
  if (score >= 70) return 'text-[var(--pv2-warning)]';
  return 'text-[var(--pv2-error)]';
};

export const TrustChip = ({ trust, open, onOpen, onClose }: TrustChipProps) => {
  const t = useTranslations('portalV2.intelligence');

  return (
    <>
      <button
        type='button'
        onClick={onOpen}
        title={t('trust.chipTitle')}
        className='inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3 py-1.5 text-left transition-colors hover:border-[var(--pv2-ink)]'
      >
        {trust.score < 70 ? (
          <span className='grid size-4 place-items-center rounded-full bg-[var(--pv2-error)] text-[10px] font-bold text-white'>
            !
          </span>
        ) : null}
        <span
          className={cn(
            'font-[family-name:var(--pv2-disp)] text-[15px] font-bold',
            trustTone(trust.score)
          )}
        >
          {trust.score}
        </span>
        <span className='text-[11px] text-[var(--pv2-mut)]'>
          {t('trust.chipLabel')}
        </span>
      </button>

      <Modal
        open={open}
        onClose={onClose}
        title={t('trust.modalTitle')}
        subtitle={t('trust.modalSubtitle', {
          freshness: trust.freshness,
          schema: trust.schema,
        })}
        wide
      >
        <div className='space-y-4'>
          <div className='flex items-baseline gap-3'>
            <span
              className={cn(
                'font-[family-name:var(--pv2-disp)] text-4xl font-bold tracking-[-0.04em]',
                trustTone(trust.score)
              )}
            >
              {trust.score}
            </span>
            <span className='text-[13px] text-[var(--pv2-mut)]'>
              {t('trust.coverage', { pct: trust.coverage })}
            </span>
          </div>

          <ul className='divide-y divide-[var(--pv2-hair)] rounded-[var(--pv2-r-md)] border border-[var(--pv2-hair)]'>
            {trust.issues.map(issue => (
              <li key={issue.title} className='px-4 py-3'>
                <div className='flex items-start gap-2'>
                  <span
                    className={cn(
                      'mt-0.5 size-2 shrink-0 rounded-full',
                      issue.severity === 'warn'
                        ? 'bg-[var(--pv2-warning)]'
                        : 'bg-[var(--pv2-success)]'
                    )}
                    aria-hidden
                  />
                  <div className='min-w-0'>
                    <p className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
                      {issue.title}
                    </p>
                    <p className='mt-0.5 text-[12px] leading-relaxed text-[var(--pv2-mut)]'>
                      {issue.detail}
                    </p>
                    {issue.fix ? (
                      <p className='mt-1 text-[11.5px] font-medium text-[var(--pv2-electric)]'>
                        {issue.fix}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </>
  );
};
