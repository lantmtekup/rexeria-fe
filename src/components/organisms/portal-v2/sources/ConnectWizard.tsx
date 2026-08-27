'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { cn } from '@/lib/cn';
import type {
  AuditSource,
  WizardConfig,
} from '@/lib/portal-v2/journey-audit/types';
import {
  SyncRows,
  WizardStepBody,
} from '@/components/organisms/portal-v2/sources/wizard-steps';

type ConnectWizardProps = {
  source: AuditSource | null;
  config: WizardConfig | null;
  open: boolean;
  onClose: () => void;
  /** Sync xong (demo) — caller mutate store nguồn và toast. */
  onComplete: (provider: string, doneStats: string, doneMsg: string) => void;
  onOpenJourney: () => void;
};

/**
 * Wizard connect chạy CHẾ ĐỘ DEMO như prototype: stepper per-provider theo
 * SRC_AUTH — popup OAuth mô phỏng, scopes read-only, sync progress từng dòng,
 * màn success. Không gọi BE; connect mutate state client.
 */
export const ConnectWizard = ({
  source,
  config,
  open,
  onClose,
  onComplete,
  onOpenJourney,
}: ConnectWizardProps) => {
  const t = useTranslations('portalV2.sources');
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [syncDone, setSyncDone] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (open) {
      setStepIndex(0);
      setSelections({});
      setSyncDone(0);
      setFinished(false);
    }
  }, [open, config?.provider]);

  const step = config?.steps[stepIndex] ?? null;
  const syncStep = step?.kind === 'sync' ? step : null;
  const doneStep = useMemo(() => {
    const last = config?.steps[config.steps.length - 1];
    return last?.kind === 'sync' ? last : null;
  }, [config]);

  useEffect(() => {
    if (!open || !syncStep || finished) return;
    if (syncDone < syncStep.rows.length) {
      const timer = setTimeout(
        () => setSyncDone(count => count + 1),
        syncDone === 0 ? 500 : 650
      );
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setFinished(true);
      if (source) {
        onComplete(source.provider, syncStep.done.stats, syncStep.done.msg);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [open, syncStep, syncDone, finished, source, onComplete]);

  if (!source || !config || !step) return null;

  const stepper = (
    <div className='mb-4 flex gap-1.5'>
      {config.steps.map((item, index) => (
        <span
          key={item.title}
          className={cn(
            'text-3xs flex-1 font-bold tracking-[0.04em] uppercase',
            index < stepIndex || finished
              ? 'text-[var(--pv2-success)]'
              : index === stepIndex
                ? 'text-[var(--pv2-electric)]'
                : 'text-[var(--pv2-faint)]'
          )}
        >
          <i
            className={cn(
              'mb-1 block h-1 rounded-full',
              index < stepIndex || finished
                ? 'bg-[var(--pv2-success)]'
                : index === stepIndex
                  ? 'bg-[var(--pv2-electric)]'
                  : 'bg-[var(--pv2-hair)]'
            )}
          />
          {item.title}
        </span>
      ))}
    </div>
  );

  if (finished && doneStep) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={t('wizardConnectedTitle', { name: source.name })}
        subtitle={t('wizardConnectedSub', { auth: source.auth })}
        footer={
          <>
            <span className='text-2xs mr-auto text-[var(--pv2-faint)]'>
              {doneStep.done.stats}
            </span>
            <Button variant='ghost' onClick={onClose}>
              {t('wizardClose')}
            </Button>
            <Button
              variant='primary'
              onClick={() => {
                onClose();
                onOpenJourney();
              }}
            >
              {t('wizardOpenJourney')}
            </Button>
          </>
        }
      >
        <div className='px-2 py-5 text-center'>
          <span className='mx-auto mb-3 grid size-[54px] place-items-center rounded-full bg-[color-mix(in_srgb,var(--pv2-success)_10%,var(--pv2-paper))] text-[26px] text-[var(--pv2-success)]'>
            ✓
          </span>
          <h3 className='mb-1.5 font-[family-name:var(--pv2-disp)] text-lg font-bold text-[var(--pv2-ink)]'>
            {t('wizardFeeding', { name: source.name })}
          </h3>
          <p className='mx-auto max-w-[400px] text-xs leading-relaxed text-[var(--pv2-mut)]'>
            {doneStep.done.msg}
          </p>
          {source.unlocks ? (
            <p className='mx-auto mt-3.5 max-w-[420px] rounded-[var(--pv2-r-sm)] bg-[color-mix(in_srgb,var(--pv2-success)_8%,var(--pv2-paper))] px-3 py-2.5 text-left text-xs text-[var(--pv2-mut)]'>
              ＋ {source.unlocks}
            </p>
          ) : null}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('wizardTitle', { name: source.name })}
      subtitle={`${source.auth} · ${t('wizardReadOnly')} · ${source.category}`}
      footer={
        step.kind === 'sync' ? undefined : (
          <>
            {stepIndex > 0 ? (
              <Button variant='ghost' onClick={() => setStepIndex(i => i - 1)}>
                ‹ {t('wizardBack')}
              </Button>
            ) : (
              <Button variant='ghost' onClick={onClose}>
                {t('wizardCancel')}
              </Button>
            )}
            <span className='text-2xs mr-auto text-[var(--pv2-faint)]'>
              🔒 {t('wizardFootNote')}
            </span>
            <Button variant='primary' onClick={() => setStepIndex(i => i + 1)}>
              {step.cta}
            </Button>
          </>
        )
      }
    >
      {stepper}
      {step.kind === 'sync' ? (
        <div>
          <p className='mb-3.5 text-[13px] leading-relaxed text-[var(--pv2-mut)]'>
            {t('wizardSyncLead', { name: source.name })}
          </p>
          <SyncRows rows={step.rows} doneCount={syncDone} />
        </div>
      ) : (
        <WizardStepBody
          step={step}
          selections={selections}
          onSelect={(key, index) =>
            setSelections(prev => ({ ...prev, [key]: index }))
          }
        />
      )}
    </Modal>
  );
};
