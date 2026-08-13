'use client';

import { CheckCircle2, OctagonX } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { EXPERIMENT_SHIP_GATE } from '@/lib/portal-v2/mining/constants';
import { getExperimentLift } from '@/lib/portal-v2/mining/helpers';
import type { MiningExperiment } from '@/lib/portal-v2/mining/types';

type ExperimentEndModalProps = {
  experiment: MiningExperiment | null;
  open: boolean;
  onClose: () => void;
  onStop: () => void;
  onConclude: () => void;
};

export const ExperimentEndModal = ({
  experiment,
  open,
  onClose,
  onStop,
  onConclude,
}: ExperimentEndModalProps) => {
  const t = useTranslations('portalV2.experiments');
  if (!experiment) return null;

  const gateOpen = experiment.sig >= EXPERIMENT_SHIP_GATE;
  const lift = getExperimentLift(experiment);
  const verdict = lift > 0 ? t('statusWon') : t('statusLost');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={gateOpen ? t('concludeTitle') : t('stopTitle')}
      subtitle={experiment.name}
      footer={
        <>
          <Button variant='ghost' onClick={onClose}>
            {t('cancel')}
          </Button>
          {gateOpen ? (
            <Button variant='primary' onClick={onConclude}>
              <CheckCircle2 aria-hidden />
              {t('concludeAction')}
            </Button>
          ) : (
            <Button variant='danger' onClick={onStop}>
              <OctagonX aria-hidden />
              {t('stopAction')}
            </Button>
          )}
        </>
      }
    >
      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-px overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-hair)]'>
          <div className='bg-[var(--pv2-paper)] p-4'>
            <span className='text-[10px] font-bold tracking-[0.1em] text-[var(--pv2-faint)] uppercase'>
              {t('significance')}
            </span>
            <strong className='mt-1 block font-[family-name:var(--pv2-disp)] text-2xl text-[var(--pv2-ink)]'>
              {experiment.sig}%
            </strong>
          </div>
          <div className='bg-[var(--pv2-paper)] p-4'>
            <span className='text-[10px] font-bold tracking-[0.1em] text-[var(--pv2-faint)] uppercase'>
              {t('gate')}
            </span>
            <strong className='mt-1 block font-[family-name:var(--pv2-disp)] text-2xl text-[var(--pv2-ink)]'>
              {EXPERIMENT_SHIP_GATE}%
            </strong>
          </div>
        </div>
        <p className='text-[13px] leading-6 text-[var(--pv2-mut)]'>
          {gateOpen
            ? t('concludeBody', {
                verdict,
                lift: `${lift >= 0 ? '+' : ''}${lift.toFixed(1)}%`,
              })
            : t('stopBody', {
                remaining: EXPERIMENT_SHIP_GATE - experiment.sig,
              })}
        </p>
        <p className='border-l-2 border-[var(--pv2-electric)] bg-[var(--pv2-canvas)] px-3 py-2 text-[11px] leading-5 text-[var(--pv2-mut)]'>
          {gateOpen ? t('concludeLaw') : t('stopLaw')}
        </p>
      </div>
    </Modal>
  );
};
