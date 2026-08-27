'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { cn } from '@/lib/cn';
import type { AuthorizeOutcome } from '@/lib/portal-v2/journey-audit/authorize';
import type {
  AuditSource,
  WizardAccount,
  WizardConfig,
} from '@/lib/portal-v2/journey-audit/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type { RxGA4Property } from '@/services/rexer-v2/types/sources';
import {
  SyncRows,
  WizardStepBody,
} from '@/components/organisms/portal-v2/sources/wizard-steps';

type ConnectWizardProps = {
  source: AuditSource | null;
  config: WizardConfig | null;
  open: boolean;
  /** live = có BE thật: bước authorize gọi POST /v1/sources/:key/connect. */
  live: boolean;
  onClose: () => void;
  /** Authorize thật — 'stub' thì wizard tiếp tục demo, 'opened' đã mở popup. */
  onAuthorize?: (
    provider: string,
    fields: Record<string, string>
  ) => Promise<AuthorizeOutcome | 'error'>;
  /** Sync (demo) xong — caller mutate store nguồn và toast. */
  onComplete: (provider: string, doneStats: string, doneMsg: string) => void;
  onOpenJourney: () => void;
};

/**
 * Wizard connect per-provider theo SRC_AUTH của prototype. Live mode: bước
 * cuối trước sync gọi authorize thật; provider stub (chưa cấu hình OAuth trên
 * deployment) rơi tiếp vào sync demo. GA4: bước chọn property đọc/ghi
 * `/v1/sources/ga4/properties` khi BE trả được (sau callback thật).
 */
export const ConnectWizard = ({
  source,
  config,
  open,
  live,
  onClose,
  onAuthorize,
  onComplete,
  onOpenJourney,
}: ConnectWizardProps) => {
  const t = useTranslations('portalV2.sources');
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [syncDone, setSyncDone] = useState(0);
  const [finished, setFinished] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);
  const [ga4Properties, setGa4Properties] = useState<RxGA4Property[] | null>(
    null
  );

  useEffect(() => {
    if (open) {
      setStepIndex(0);
      setSelections({});
      setFieldValues({});
      setSyncDone(0);
      setFinished(false);
      setAuthorizing(false);
      setGa4Properties(null);
    }
  }, [open, config?.provider]);

  const step = config?.steps[stepIndex] ?? null;
  const doneStep = useMemo(() => {
    const last = config?.steps[config.steps.length - 1];
    return last?.kind === 'sync' ? last : null;
  }, [config]);

  // GA4 live: bước picker đọc property thật; 409 (chưa có creds sau stub
  // handshake) thì giữ danh sách demo của config.
  useEffect(() => {
    if (!open || !live || source?.provider !== 'ga4') return;
    if (step?.kind !== 'picker' || ga4Properties !== null) return;
    let cancelled = false;
    rexerV2Api.sources
      .ga4Properties()
      .then(res => {
        if (!cancelled) setGa4Properties(res.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setGa4Properties([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, live, source?.provider, step?.kind, ga4Properties]);

  const syncStep = step?.kind === 'sync' ? step : null;
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

  const ga4Live = live && source.provider === 'ga4' && !!ga4Properties?.length;
  const pickerAccounts = (accounts: WizardAccount[]): WizardAccount[] =>
    ga4Live
      ? ga4Properties!.map(item => ({
          bg: '#F9AB00',
          initials: 'GA',
          name: item.display_name || item.property,
          sub: `${item.property} · ${item.account}`,
        }))
      : accounts;

  const handleNext = async () => {
    if (step.kind === 'sync') return;
    // GA4 live: chốt property đã chọn trước khi rời bước picker.
    if (ga4Live && step.kind === 'picker') {
      const index = selections[step.accountsKey] ?? 0;
      const chosen = ga4Properties![index];
      if (chosen) {
        try {
          await rexerV2Api.sources.selectGA4Property({
            property: chosen.property,
            display_name: chosen.display_name,
          });
        } catch {
          // BE chưa nhận (stub creds) — wizard demo vẫn đi tiếp.
        }
      }
    }
    const next = config.steps[stepIndex + 1];
    if (live && onAuthorize && next?.kind === 'sync') {
      setAuthorizing(true);
      const outcome = await onAuthorize(source.provider, fieldValues);
      setAuthorizing(false);
      if (outcome === 'opened') {
        onClose();
        return;
      }
      if (outcome === 'error') return;
      // 'stub' → sync demo như prototype.
    }
    setStepIndex(index => index + 1);
  };

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
            <Button
              variant='primary'
              disabled={authorizing}
              onClick={() => {
                void handleNext();
              }}
            >
              {authorizing ? t('wizardAuthorizing') : step.cta}
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
          step={
            step.kind === 'picker'
              ? { ...step, accounts: pickerAccounts(step.accounts) }
              : step
          }
          selections={selections}
          onSelect={(key, index) =>
            setSelections(prev => ({ ...prev, [key]: index }))
          }
          fieldValues={fieldValues}
          onFieldChange={(label, value) =>
            setFieldValues(prev => ({ ...prev, [label]: value }))
          }
        />
      )}
    </Modal>
  );
};

/** Toast tiêu chuẩn cho kết quả authorize — dùng chung Journey/Sources. */
export const toastAuthorizeOutcome = (
  outcome: AuthorizeOutcome,
  name: string,
  messages: { pending: string; opened: string }
): void => {
  if (outcome === 'stub') toast(messages.pending);
  else toast(messages.opened);
};
