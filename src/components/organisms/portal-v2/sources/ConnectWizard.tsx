'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { cn } from '@/lib/cn';
import {
  openBlankPopup,
  requestAuthorize,
  waitForConnection,
} from '@/lib/portal-v2/journey-audit/authorize';
import type {
  AuditSource,
  WizardAccount,
  WizardConfig,
} from '@/lib/portal-v2/journey-audit/types';
import { statsLine } from '@/lib/portal-v2/journey-audit/sourcesView';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type {
  RxConnectSourceRequest,
  RxGA4Property,
  RxSourceConnection,
} from '@/services/rexer-v2/types/sources';
import {
  AccountRow,
  SyncRows,
  WizardStepBody,
} from '@/components/organisms/portal-v2/sources/wizard-steps';

type AuthState = 'idle' | 'authorizing' | 'syncing';

/** Trạng thái của flow OAuth THẬT (mode liveOAuth). */
type LiveStage =
  | 'authorizing'
  | 'waiting'
  | 'blocked'
  | 'timeout'
  | 'error'
  | 'property';

/**
 * Provider credential-based (Phase 4): connect là MỘT request có body — không
 * popup. Builder đọc giá trị hiệu lực của các field theo label trong config.
 */
const CREDENTIAL_BUILDERS: Record<
  string,
  (value: (label: string) => string) => RxConnectSourceRequest
> = {
  woocommerce: value => ({
    site_url: value('Site URL'),
    consumer_key: value('Consumer key'),
    consumer_secret: value('Consumer secret'),
  }),
  retail_feed: value => ({
    feed_url: value('Feed URL'),
    schedule: value('Pull schedule'),
    mapping: {
      sku: value('SKU column'),
      price: value('Price column'),
      name: value('Name column'),
      bullets: value('Bullets column'),
    },
  }),
  amazon: value => ({ listing_url: value('Listing URL') }),
};

const isUrlValue = (value: string): boolean =>
  /^(https?|sftp):\/\/\S+/i.test(value.trim());

type ConnectWizardProps = {
  source: AuditSource | null;
  config: WizardConfig | null;
  open: boolean;
  /** live = có BE thật: bước authorize gọi POST /v1/sources/:key/connect. */
  live: boolean;
  /**
   * OAuth THẬT tức thì: caller đã mở popup TRỐNG đồng bộ ngay trong click
   * "Connect" (chống popup-blocker) — wizard authorize ngay khi mở, KHÔNG đi
   * qua các bước account/consent mô phỏng.
   */
  instantOAuth?: boolean;
  /** Popup trống caller vừa mở trong user gesture (null = bị chặn). */
  instantPopup?: Window | null;
  onClose: () => void;
  /** Sync DEMO xong (provider stub) — caller mutate store demo và toast. */
  onComplete: (provider: string, doneStats: string, doneMsg: string) => void;
  /** Connection THẬT đã về (poll thấy sau callback) — caller toast + refetch
   *  sources/journey (router.refresh). */
  onLiveConnected: (name: string) => void;
  onOpenJourney: () => void;
};

/**
 * Wizard connect per-provider.
 *
 * Ba flow theo provider + môi trường:
 * - OAuth THẬT (mode liveOAuth): popup provider chính chủ mở NGAY trong user
 *   gesture (blank sync → navigate khi authorize_url về) — KHÔNG màn account/
 *   consent giả; wizard chỉ còn Authorize → (Property với GA4) → Done, poll
 *   `GET /v1/sources` tới khi connection về.
 * - Credential (woocommerce/retail_feed/amazon): form thật, submit một request.
 * - Demo (không live, hoặc BE trả stub vì provider chưa cấu hình OAuth): các
 *   bước mô phỏng của prototype giữ nguyên — chế độ trình diễn.
 */
export const ConnectWizard = ({
  source,
  config,
  open,
  live,
  instantOAuth = false,
  instantPopup = null,
  onClose,
  onComplete,
  onLiveConnected,
  onOpenJourney,
}: ConnectWizardProps) => {
  const t = useTranslations('portalV2.sources');
  const [mode, setMode] = useState<'config' | 'liveOAuth'>('config');
  const [liveStage, setLiveStage] = useState<LiveStage>('authorizing');
  const [liveError, setLiveError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [syncDone, setSyncDone] = useState(0);
  const [finished, setFinished] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [blockedUrl, setBlockedUrl] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [liveStats, setLiveStats] = useState<string | null>(null);
  const [ga4Properties, setGa4Properties] = useState<RxGA4Property[] | null>(
    null
  );
  /** Wizard đóng/unmount → watcher dừng ngay, không đụng state nữa. */
  const cancelRef = useRef(false);
  /** Connection thật đã về trong phiên wizard này (đừng authorize lại). */
  const authorizedRef = useRef(false);
  /** Chỉ auto-start instant OAuth một lần cho mỗi lượt mở wizard. */
  const instantStartedRef = useRef(false);
  /** Cầu nối cho effect instant (liveStart định nghĩa sau early-return). */
  const liveStartRef = useRef<((popup: Window | null) => void) | null>(null);

  useEffect(() => {
    if (open) {
      cancelRef.current = false;
      authorizedRef.current = false;
      instantStartedRef.current = false;
      setMode('config');
      setLiveStage('authorizing');
      setLiveError(null);
      setStepIndex(0);
      setSelections({});
      setFieldValues({});
      setSyncDone(0);
      setFinished(false);
      setLiveConnected(false);
      setAuthState('idle');
      setBlockedUrl(null);
      setStepError(null);
      setLiveStats(null);
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

  // GA4: nạp property thật cho bước Property (mode liveOAuth sau authorize,
  // hoặc bước picker demo khi creds đã có sẵn từ trước).
  const wantGa4Properties =
    open &&
    live &&
    source?.provider === 'ga4' &&
    ((mode === 'liveOAuth' && liveStage === 'property') ||
      (mode === 'config' && step?.kind === 'picker'));
  useEffect(() => {
    if (!wantGa4Properties || ga4Properties !== null) return;
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
  }, [wantGa4Properties, ga4Properties]);

  const syncStep = step?.kind === 'sync' ? step : null;
  useEffect(() => {
    if (!open || mode !== 'config' || !syncStep || finished) return;
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
  }, [open, mode, syncStep, syncDone, finished, source, onComplete]);

  // Instant OAuth: authorize NGAY khi wizard mở — popup trống đã được caller
  // mở đồng bộ trong click Connect.
  useEffect(() => {
    if (!open || !instantOAuth || instantStartedRef.current) return;
    if (!liveStartRef.current) return;
    instantStartedRef.current = true;
    setMode('liveOAuth');
    liveStartRef.current(instantPopup ?? null);
    // Cố ý chỉ chạy 1 lần mỗi lượt mở wizard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, instantOAuth, config?.provider]);

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
  const ga4PropertyAccounts: WizardAccount[] = (ga4Properties ?? []).map(
    item => ({
      bg: '#F9AB00',
      initials: 'GA',
      name: item.display_name || item.property,
      sub: `${item.property} · ${item.account}`,
    })
  );

  const finishLive = (connection?: RxSourceConnection) => {
    if (connection) {
      setLiveStats(statsLine(connection.stats, connection.external_account));
    }
    setLiveConnected(true);
    setFinished(true);
    onLiveConnected(source.name);
  };

  /** Giá trị hiệu lực của một field: user gõ ?? prefill trong config. */
  const effectiveValue = (label: string): string => {
    if (fieldValues[label] != null) return fieldValues[label].trim();
    for (const item of config.steps) {
      if (item.kind !== 'form') continue;
      const field = item.fields.find(f => f.label === label);
      if (field) return field.value.trim();
    }
    return '';
  };

  /** Validate cơ bản bước form: bắt buộc mọi field; label có "URL" → URL. */
  const validateFormStep = (): boolean => {
    if (step.kind !== 'form') return true;
    for (const field of step.fields) {
      const value = effectiveValue(field.label);
      if (!value) {
        setStepError(t('errRequiredFields'));
        return false;
      }
      if (/\bURL\b/i.test(field.label) && !isUrlValue(value)) {
        setStepError(t('errInvalidUrl', { label: field.label }));
        return false;
      }
    }
    return true;
  };

  /** Poll connection về trong lúc popup chính chủ đang mở. */
  const liveWatch = async (popup: Window) => {
    setLiveStage('waiting');
    const connection = await waitForConnection(provider, {
      popupClosed: () => popup.closed,
      cancelled: () => cancelRef.current,
    });
    if (cancelRef.current) return;
    if (!connection) {
      setLiveStage('timeout');
      return;
    }
    authorizedRef.current = true;
    if (provider === 'ga4') {
      // Connection về → bước chọn property THẬT rồi mới success.
      setGa4Properties(null);
      setLiveStage('property');
      return;
    }
    finishLive(connection);
  };

  /**
   * Flow OAuth THẬT. `popup` là cửa sổ TRỐNG đã mở đồng bộ trong user gesture
   * (null = bị chặn); có authorize_url thì điều hướng nó, stub thì đóng lại
   * và rơi về các bước demo.
   */
  const liveStart = async (popup: Window | null, retryUrl?: string) => {
    setLiveError(null);
    if (retryUrl) {
      if (!popup) {
        setBlockedUrl(retryUrl);
        setLiveStage('blocked');
        return;
      }
      popup.location.href = retryUrl;
      await liveWatch(popup);
      return;
    }
    setLiveStage('authorizing');
    try {
      const result = await requestAuthorize(
        provider,
        provider === 'shopify' ? { shop: effectiveValue('Store domain') } : {}
      );
      if (cancelRef.current) {
        popup?.close();
        return;
      }
      if (result.kind === 'stub') {
        // Provider chưa cấu hình OAuth trên deployment — demo mode trình diễn.
        popup?.close();
        toast(t('toastAuthorizePending', { name: source.name }));
        setMode('config');
        if (provider === 'shopify') setStepIndex(index => index + 1);
        return;
      }
      if (result.kind === 'connected') {
        popup?.close();
        authorizedRef.current = true;
        finishLive(result.connection);
        return;
      }
      setBlockedUrl(result.url);
      if (!popup || popup.closed) {
        setLiveStage('blocked');
        return;
      }
      popup.location.href = result.url;
      await liveWatch(popup);
    } catch (err) {
      if (cancelRef.current) return;
      popup?.close();
      setLiveError(err instanceof Error ? err.message : t('actionFailed'));
      setLiveStage('error');
    }
  };

  liveStartRef.current = popup => {
    void liveStart(popup);
  };

  /** Retry của mode liveOAuth — mở popup mới ĐỒNG BỘ trong click. */
  const handleLiveRetry = () => {
    const popup = openBlankPopup();
    void liveStart(popup, blockedUrl ?? undefined);
  };

  /** Chốt property GA4 (mode liveOAuth) rồi success. */
  const handleSelectProperty = async () => {
    const index = selections.liveGa4 ?? 0;
    const chosen = ga4Properties?.[index];
    if (!chosen) {
      finishLive();
      return;
    }
    try {
      await rexerV2Api.sources.selectGA4Property({
        property: chosen.property,
        display_name: chosen.display_name,
      });
      finishLive();
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : t('actionFailed'));
    }
  };

  /**
   * Connect credential-based (Phase 4): một request có body, không popup.
   * BE cũ chưa ship connector sẽ trả stub authorize_url → rơi về sync demo
   * như trước (backward-compat); BE mới trả {status:'connected', connection}.
   */
  const connectCredential = async (
    build: (value: (label: string) => string) => RxConnectSourceRequest
  ) => {
    setAuthState('authorizing');
    try {
      const result = await requestAuthorize(provider, build(effectiveValue));
      if (cancelRef.current) return;
      if (result.kind === 'stub') {
        toast(t('toastAuthorizePending', { name: source.name }));
        setAuthState('idle');
        setStepIndex(index => index + 1); // sync demo như prototype
        return;
      }
      if (result.kind === 'real') {
        // BE quyết định provider này vẫn cần OAuth — chuyển sang flow popup.
        // Không còn user gesture tươi ở đây nên popup có thể bị chặn — mode
        // liveOAuth sẽ hiện banner + nút retry (retry mở popup trong click).
        setAuthState('idle');
        setMode('liveOAuth');
        setBlockedUrl(result.url);
        setLiveStage('blocked');
        return;
      }
      // connected ngay — chờ ngắn cho job sync đầu đổ stats rồi success.
      authorizedRef.current = true;
      setLiveStats(
        statsLine(result.connection.stats, result.connection.external_account)
      );
      setAuthState('syncing');
      for (let attempt = 0; attempt < 3; attempt += 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        if (cancelRef.current) return;
        try {
          const items = (await rexerV2Api.sources.list()).items ?? [];
          const fresh = items.find(item => item.id === result.connection.id);
          const line = fresh
            ? statsLine(fresh.stats, fresh.external_account)
            : null;
          if (line) {
            setLiveStats(line);
            if (Object.keys(fresh?.stats ?? {}).length) break;
          }
        } catch {
          // nhịp sau thử lại
        }
      }
      if (cancelRef.current) return;
      setAuthState('idle');
      finishLive();
    } catch (err) {
      if (cancelRef.current) return;
      setAuthState('idle');
      // Lỗi verify (401/URL sai) đứng lại TẠI BƯỚC, không đi tiếp.
      setStepError(err instanceof Error ? err.message : t('actionFailed'));
    }
  };

  const handleNext = () => {
    if (step.kind === 'sync') return;
    setStepError(null);
    if (!validateFormStep()) return;
    const next = config.steps[stepIndex + 1];
    const isSubmitStep =
      live && next?.kind === 'sync' && !authorizedRef.current;

    if (isSubmitStep && !CREDENTIAL_BUILDERS[provider]) {
      // OAuth (shopify sau bước Store): mở popup trống NGAY — đồng bộ trong
      // click này, TRƯỚC mọi await — rồi authorize thật.
      const popup = openBlankPopup();
      setMode('liveOAuth');
      void liveStart(popup);
      return;
    }

    void (async () => {
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
              toast.error(
                err instanceof Error ? err.message : t('actionFailed')
              );
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
      if (isSubmitStep) {
        await connectCredential(CREDENTIAL_BUILDERS[provider]);
        return;
      }
      setStepIndex(index => index + 1);
    })();
  };

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
              {liveConnected
                ? (liveStats ?? t('wizardLiveStats'))
                : doneStep.done.stats}
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
          {liveConnected && liveStats?.toLowerCase().includes('blocked') ? (
            <p className='mx-auto mt-3 max-w-[420px] rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-warning)_40%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-warning)_8%,var(--pv2-paper))] px-3 py-2.5 text-left text-xs leading-relaxed text-[color-mix(in_srgb,var(--pv2-warning)_75%,var(--pv2-ink))]'>
              ⚠️ {t('wizardFetchBlockedNote')}
            </p>
          ) : null}
          {source.unlocks ? (
            <p className='mx-auto mt-3.5 max-w-[420px] rounded-[var(--pv2-r-sm)] bg-[color-mix(in_srgb,var(--pv2-success)_8%,var(--pv2-paper))] px-3 py-2.5 text-left text-xs text-[var(--pv2-mut)]'>
              ＋ {source.unlocks}
            </p>
          ) : null}
        </div>
      </Modal>
    );
  }

  /* ── mode liveOAuth: Authorize → (Property GA4) → Done, không màn giả ──── */
  if (mode === 'liveOAuth') {
    const liveSteps = [
      t('wizardStageAuthorize'),
      ...(provider === 'ga4' ? [t('wizardStageProperty')] : []),
      t('wizardStageDone'),
    ];
    const liveIndex = liveStage === 'property' ? 1 : 0;
    const spinnerRow = (label: string, tone: 'electric' | 'success') => (
      <p
        className={cn(
          'mb-3.5 flex items-center gap-2.5 rounded-[var(--pv2-r-sm)] border px-3 py-2.5 text-xs leading-relaxed text-[var(--pv2-ink)]',
          tone === 'electric'
            ? 'border-[color-mix(in_srgb,var(--pv2-electric)_25%,var(--pv2-hair))] bg-[var(--pv2-electric-soft)]'
            : 'border-[color-mix(in_srgb,var(--pv2-success)_30%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-success)_6%,var(--pv2-paper))]'
        )}
      >
        <span
          aria-hidden
          className={cn(
            'inline-block size-[13px] shrink-0 animate-spin rounded-full border-2 border-[var(--pv2-hair)]',
            tone === 'electric'
              ? 'border-t-[var(--pv2-electric)]'
              : 'border-t-[var(--pv2-success)]'
          )}
        />
        {label}
      </p>
    );
    const retryButton = (
      <Button
        variant='ghost'
        size='sm'
        className='mt-2'
        onClick={handleLiveRetry}
      >
        {t('wizardRetry')}
      </Button>
    );

    return (
      <Modal
        open={open}
        onClose={onClose}
        title={t('wizardTitle', { name: source.name })}
        subtitle={`${source.auth} · ${t('wizardReadOnly')} · ${source.category}`}
        footer={
          <>
            <Button variant='ghost' onClick={onClose}>
              {t('wizardCancel')}
            </Button>
            <span className='text-2xs mr-auto text-[var(--pv2-faint)]'>
              🔒 {t('wizardFootNote')}
            </span>
            {liveStage === 'property' ? (
              <Button
                variant='primary'
                disabled={ga4Properties === null}
                onClick={() => {
                  void handleSelectProperty();
                }}
              >
                {t('wizardSelectProperty')}
              </Button>
            ) : null}
          </>
        }
      >
        <div className='mb-4 flex gap-1.5'>
          {liveSteps.map((title, index) => (
            <span
              key={title}
              className={cn(
                'text-3xs flex-1 font-bold tracking-[0.04em] uppercase',
                index < liveIndex
                  ? 'text-[var(--pv2-success)]'
                  : index === liveIndex
                    ? 'text-[var(--pv2-electric)]'
                    : 'text-[var(--pv2-faint)]'
              )}
            >
              <i
                className={cn(
                  'mb-1 block h-1 rounded-full',
                  index < liveIndex
                    ? 'bg-[var(--pv2-success)]'
                    : index === liveIndex
                      ? 'bg-[var(--pv2-electric)]'
                      : 'bg-[var(--pv2-hair)]'
                )}
              />
              {title}
            </span>
          ))}
        </div>

        {liveStage === 'authorizing'
          ? spinnerRow(
              t('wizardOpeningPopup', { name: source.name }),
              'electric'
            )
          : null}
        {liveStage === 'waiting'
          ? spinnerRow(t('wizardWaiting'), 'electric')
          : null}
        {liveStage === 'blocked' ? (
          <div className='mb-3.5 rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-warning)_40%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-warning)_8%,var(--pv2-paper))] px-3 py-2.5 text-xs leading-relaxed text-[color-mix(in_srgb,var(--pv2-warning)_75%,var(--pv2-ink))]'>
            {t('wizardPopupBlocked')}
            {retryButton}
          </div>
        ) : null}
        {liveStage === 'timeout' ? (
          <div className='mb-3.5 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3 py-2.5 text-xs leading-relaxed text-[var(--pv2-mut)]'>
            {t('wizardAuthTimeout', { name: source.name })}
            {retryButton}
          </div>
        ) : null}
        {liveStage === 'error' ? (
          <div className='mb-3.5 rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-error)_35%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_6%,var(--pv2-paper))] px-3 py-2.5 text-xs leading-relaxed text-[var(--pv2-error)]'>
            {liveError ?? t('actionFailed')}
            {retryButton}
          </div>
        ) : null}
        {liveStage === 'property' ? (
          <div>
            {liveError ? (
              <p className='mb-3 rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-error)_35%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_6%,var(--pv2-paper))] px-3 py-2.5 text-xs leading-relaxed text-[var(--pv2-error)]'>
                {liveError}
              </p>
            ) : null}
            <p className='mb-3.5 text-[13px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('wizardGa4PickProperty')}
            </p>
            {ga4Properties === null ? (
              spinnerRow(t('wizardLoadingProperties'), 'electric')
            ) : ga4PropertyAccounts.length ? (
              ga4PropertyAccounts.map((account, index) => (
                <AccountRow
                  key={account.sub}
                  account={account}
                  selected={(selections.liveGa4 ?? 0) === index}
                  onSelect={() =>
                    setSelections(prev => ({ ...prev, liveGa4: index }))
                  }
                />
              ))
            ) : (
              <p className='rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3 py-2.5 text-xs leading-relaxed text-[var(--pv2-mut)]'>
                {t('wizardNoProperties')}
              </p>
            )}
          </div>
        ) : null}
      </Modal>
    );
  }

  const busy = authState === 'authorizing' || authState === 'syncing';

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
            <Button variant='primary' disabled={busy} onClick={handleNext}>
              {authState === 'authorizing'
                ? t('wizardAuthorizing')
                : authState === 'syncing'
                  ? t('wizardWaitingShort')
                  : step.cta}
            </Button>
          </>
        )
      }
    >
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
      {authState === 'syncing' ? (
        <p className='mb-3.5 flex items-center gap-2.5 rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-success)_30%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-success)_6%,var(--pv2-paper))] px-3 py-2.5 text-xs leading-relaxed text-[var(--pv2-ink)]'>
          <span
            aria-hidden
            className='inline-block size-[13px] shrink-0 animate-spin rounded-full border-2 border-[var(--pv2-hair)] border-t-[var(--pv2-success)]'
          />
          {t('wizardSyncingLive')}
        </p>
      ) : null}
      {stepError ? (
        <p className='mb-3.5 rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-error)_35%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_6%,var(--pv2-paper))] px-3 py-2.5 text-xs leading-relaxed text-[var(--pv2-error)]'>
          {stepError}
        </p>
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
          onFieldChange={(label, value) => {
            setStepError(null);
            setFieldValues(prev => ({ ...prev, [label]: value }));
          }}
        />
      )}
    </Modal>
  );
};
