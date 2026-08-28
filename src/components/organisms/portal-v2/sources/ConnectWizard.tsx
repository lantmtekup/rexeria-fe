'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { cn } from '@/lib/cn';
import {
  openAuthorizePopup,
  requestAuthorize,
  waitForConnection,
} from '@/lib/portal-v2/journey-audit/authorize';
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

type AuthState = 'idle' | 'authorizing' | 'waiting' | 'blocked';

type ConnectWizardProps = {
  source: AuditSource | null;
  config: WizardConfig | null;
  open: boolean;
  /** live = có BE thật: bước authorize gọi POST /v1/sources/:key/connect. */
  live: boolean;
  onClose: () => void;
  /** Sync DEMO xong (provider stub) — caller mutate store demo và toast. */
  onComplete: (provider: string, doneStats: string, doneMsg: string) => void;
  /** Connection THẬT đã về (poll thấy sau callback) — caller toast + refetch
   *  sources/journey (router.refresh). */
  onLiveConnected: (name: string) => void;
  onOpenJourney: () => void;
};

/**
 * Wizard connect per-provider theo SRC_AUTH của prototype.
 *
 * Live mode, bước cuối trước sync:
 * - authorize_url stub → sync demo như prototype (provider chưa cấu hình).
 * - URL thật → mở popup rồi poll `GET /v1/sources` (~3s) tới khi connection
 *   của provider chuyển `connected` (connect mới lẫn Reconnect); popup đóng
 *   thì poll thêm một nhịp cuối. Thấy rồi: GA4 nhảy sang bước chọn property
 *   thật (`GET/POST /v1/sources/ga4/properties`) rồi mới success; provider
 *   khác vào thẳng màn success + refetch. Popup bị chặn → hướng dẫn + retry.
 */
export const ConnectWizard = ({
  source,
  config,
  open,
  live,
  onClose,
  onComplete,
  onLiveConnected,
  onOpenJourney,
}: ConnectWizardProps) => {
  const t = useTranslations('portalV2.sources');
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [syncDone, setSyncDone] = useState(0);
  const [finished, setFinished] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [blockedUrl, setBlockedUrl] = useState<string | null>(null);
  const [ga4Properties, setGa4Properties] = useState<RxGA4Property[] | null>(
    null
  );
  /** Wizard đóng/unmount → watcher dừng ngay, không đụng state nữa. */
  const cancelRef = useRef(false);
  /** Connection thật đã về trong phiên wizard này (đừng authorize lại). */
  const authorizedRef = useRef(false);

  useEffect(() => {
    if (open) {
      cancelRef.current = false;
      authorizedRef.current = false;
      setStepIndex(0);
      setSelections({});
      setFieldValues({});
      setSyncDone(0);
      setFinished(false);
      setLiveConnected(false);
      setAuthState('idle');
      setBlockedUrl(null);
      setGa4Properties(null);
    }
    return () => {
      cancelRef.current = true;
    };
  }, [open, config?.provider]);

  const step = config?.steps[stepIndex] ?? null;
  const doneStep = useMemo(() => {
    const last = config?.steps[config.steps.length - 1];
    return last?.kind === 'sync' ? last : null;
  }, [config]);

  // GA4 live: bước picker đọc property thật; lỗi (409 khi chưa có creds sau
  // handshake stub) thì giữ danh sách demo của config.
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

  const provider = source.provider;
  const ga4Live = live && provider === 'ga4' && !!ga4Properties?.length;
  const pickerAccounts = (accounts: WizardAccount[]): WizardAccount[] =>
    ga4Live
      ? ga4Properties!.map(item => ({
          bg: '#F9AB00',
          initials: 'GA',
          name: item.display_name || item.property,
          sub: `${item.property} · ${item.account}`,
        }))
      : accounts;

  const finishLive = () => {
    setLiveConnected(true);
    setFinished(true);
    onLiveConnected(source.name);
  };

  /** Authorize thật + theo dõi connection về (mục 1 vòng 3). */
  const startAuthorize = async (retryUrl?: string) => {
    setAuthState('authorizing');
    setBlockedUrl(null);
    let url = retryUrl ?? null;
    if (!url) {
      try {
        const result = await requestAuthorize(
          provider,
          provider === 'shopify' ? fieldValues['Store domain'] : undefined
        );
        if (cancelRef.current) return;
        if (result.kind === 'stub') {
          toast(t('toastAuthorizePending', { name: source.name }));
          setAuthState('idle');
          setStepIndex(index => index + 1); // sync demo như prototype
          return;
        }
        url = result.url;
      } catch (err) {
        if (cancelRef.current) return;
        toast.error(err instanceof Error ? err.message : t('actionFailed'));
        setAuthState('idle');
        return;
      }
    }

    const popup = openAuthorizePopup(url);
    if (!popup) {
      setBlockedUrl(url);
      setAuthState('blocked');
      return;
    }
    setAuthState('waiting');
    const connection = await waitForConnection(provider, {
      popupClosed: () => popup.closed,
      cancelled: () => cancelRef.current,
    });
    if (cancelRef.current) return;
    if (!connection) {
      setAuthState('idle');
      toast(t('wizardAuthTimeout', { name: source.name }));
      return;
    }
    setAuthState('idle');
    authorizedRef.current = true;
    if (provider === 'ga4') {
      // Connection về rồi → sang bước chọn property THẬT trước khi success.
      toast.success(t('wizardGa4PickProperty'));
      setGa4Properties(null);
      const pickerIndex = config.steps.findIndex(
        item => item.kind === 'picker'
      );
      if (pickerIndex >= 0) {
        setStepIndex(pickerIndex);
        return;
      }
    }
    finishLive();
  };

  const handleNext = async () => {
    if (step.kind === 'sync') return;
    if (ga4Live && step.kind === 'picker') {
      const index = selections[step.accountsKey] ?? 0;
      const chosen = ga4Properties![index];
      if (chosen) {
        try {
          await rexerV2Api.sources.selectGA4Property({
            property: chosen.property,
            display_name: chosen.display_name,
          });
        } catch (err) {
          if (authorizedRef.current) {
            // Creds thật mà chọn property hỏng thì phải nói, không đi tiếp.
            toast.error(err instanceof Error ? err.message : t('actionFailed'));
            return;
          }
          // Demo creds — wizard demo vẫn đi tiếp.
        }
      }
      if (authorizedRef.current) {
        finishLive();
        return;
      }
    }
    const next = config.steps[stepIndex + 1];
    if (live && next?.kind === 'sync' && !authorizedRef.current) {
      await startAuthorize();
      return;
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
              {liveConnected ? t('wizardLiveStats') : doneStep.done.stats}
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
            {liveConnected ? t('wizardLiveMsg') : doneStep.done.msg}
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

  const busy = authState === 'authorizing' || authState === 'waiting';

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
              <Button
                variant='ghost'
                disabled={busy}
                onClick={() => setStepIndex(i => i - 1)}
              >
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
              disabled={busy}
              onClick={() => {
                void handleNext();
              }}
            >
              {authState === 'authorizing'
                ? t('wizardAuthorizing')
                : authState === 'waiting'
                  ? t('wizardWaitingShort')
                  : step.cta}
            </Button>
          </>
        )
      }
    >
      {stepper}
      {authState === 'waiting' ? (
        <p className='mb-3.5 flex items-center gap-2.5 rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-electric)_25%,var(--pv2-hair))] bg-[var(--pv2-electric-soft)] px-3 py-2.5 text-xs leading-relaxed text-[var(--pv2-ink)]'>
          <span
            aria-hidden
            className='inline-block size-[13px] shrink-0 animate-spin rounded-full border-2 border-[var(--pv2-hair)] border-t-[var(--pv2-electric)]'
          />
          {t('wizardWaiting')}
        </p>
      ) : null}
      {authState === 'blocked' ? (
        <div className='mb-3.5 rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-warning)_40%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-warning)_8%,var(--pv2-paper))] px-3 py-2.5 text-xs leading-relaxed text-[color-mix(in_srgb,var(--pv2-warning)_75%,var(--pv2-ink))]'>
          {t('wizardPopupBlocked')}
          <Button
            variant='ghost'
            size='sm'
            className='mt-2 block'
            onClick={() => {
              void startAuthorize(blockedUrl ?? undefined);
            }}
          >
            {t('wizardRetry')}
          </Button>
        </div>
      ) : null}
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
