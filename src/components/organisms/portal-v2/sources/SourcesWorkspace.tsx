'use client';

import { Search, SquareStack } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { GlossaryTip } from '@/components/molecules/portal-v2/GlossaryTip';
import { cn } from '@/lib/cn';
import {
  coverageHint,
  stageCoverage,
} from '@/lib/portal-v2/journey-audit/helpers';
import {
  AUDIT_SOURCE_CATEGORIES,
  MOCK_AUDIT_JOURNEYS,
} from '@/lib/portal-v2/journey-audit/mock';
import { crossHref } from '@/lib/portal-v2/journey-audit/params';
import {
  openAuthorizePopup,
  openBlankPopup,
  requestAuthorize,
} from '@/lib/portal-v2/journey-audit/authorize';
import {
  connectAuditSource,
  disconnectAuditSource,
  useAuditSources,
} from '@/lib/portal-v2/journey-audit/sourcesStore';
import { FEATURE_EVENT, trackFeature } from '@/lib/analytics/featureEvents';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type {
  AuditSource,
  WizardConfig,
} from '@/lib/portal-v2/journey-audit/types';
import { ConnectWizard } from '@/components/organisms/portal-v2/sources/ConnectWizard';
import { CoverageMeter } from '@/components/organisms/portal-v2/sources/CoverageMeter';
import { DisconnectSourceModal } from '@/components/organisms/portal-v2/sources/DisconnectSourceModal';
import { SourceCard } from '@/components/organisms/portal-v2/sources/SourceCard';

type SourcesWorkspaceProps = {
  initialSources: AuditSource[];
  wizards: Record<string, WizardConfig>;
  /** true = connections/catalog thật từ BE — mutations gọi API + refresh. */
  live: boolean;
  initialError: string | null;
};

/** Provider OAuth mở popup NGAY khi bấm Connect (không form nào trước đó);
 *  shopify cần bước Store nên popup mở ở CTA của bước đó trong wizard. */
const INSTANT_OAUTH_PROVIDERS = new Set([
  'ga4',
  'meta',
  'tiktokads',
  'tiktokshop',
  'klaviyo',
]);

/** Số touchpoint mà một nguồn nuôi, tính trên mọi journey audit (mock Phase 1). */
const feedsOf = (sourceId: string): number =>
  Object.values(MOCK_AUDIT_JOURNEYS).reduce(
    (total, journey) =>
      total +
      journey.stages.reduce(
        (sum, stage) =>
          sum +
          stage.touchpoints.filter(tp => tp.source_ids.includes(sourceId))
            .length,
        0
      ),
    0
  );

export const SourcesWorkspace = ({
  initialSources,
  wizards,
  live,
  initialError,
}: SourcesWorkspaceProps) => {
  const t = useTranslations('portalV2.sources');
  const router = useRouter();

  // Return leg của OAuth mode=redirect (popup bị chặn): callback 302 về
  // /portal-v2/sources?connected=<id> | ?error=<code> — toast rồi dọn URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectedId = params.get('connected');
    const errorCode = params.get('error');
    if (!connectedId && !errorCode) return;
    if (connectedId) toast.success(t('toastConnected'));
    if (errorCode) toast.error(errorCode);
    params.delete('connected');
    params.delete('error');
    const rest = params.toString();
    window.history.replaceState(
      null,
      '',
      window.location.pathname + (rest ? `?${rest}` : '')
    );
    router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const sources = useAuditSources(initialSources);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [wizardProvider, setWizardProvider] = useState<string | null>(null);
  /** Popup trống mở đồng bộ trong click Connect (instant OAuth). */
  const instantPopupRef = useRef<Window | null>(null);
  const [wizardInstant, setWizardInstant] = useState(false);
  const [pendingDisconnectId, setPendingDisconnectId] = useState<string | null>(
    null
  );

  const coverage = useMemo(() => stageCoverage(sources), [sources]);
  const hint = useMemo(
    () => coverageHint(coverage, sources),
    [coverage, sources]
  );
  const covByStage = useMemo(
    () => Object.fromEntries(coverage.map(item => [item.stage, item])),
    [coverage]
  );

  const attention = sources.filter(source => source.status === 'attention');
  const connected = sources.filter(source => source.status === 'connected');
  const available = sources.filter(source => source.status === 'available');

  const recommended = useMemo(
    () =>
      available
        .map(source => ({
          source,
          weight: Math.max(
            ...source.stages.map(stage => {
              const cov = covByStage[stage];
              if (!cov) return 0;
              if (cov.state === 'gap') return 3;
              if (cov.state === 'weak') return 2;
              return cov.live === 1 ? 1 : 0;
            })
          ),
        }))
        .filter(item => item.weight >= 1)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3),
    [available, covByStage]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return available
      .filter(source => category === 'All' || source.category === category)
      .filter(
        source =>
          !q ||
          source.name.toLowerCase().includes(q) ||
          source.category.toLowerCase().includes(q) ||
          (source.value ?? '').toLowerCase().includes(q)
      );
  }, [available, category, query]);

  const pendingDisconnect =
    sources.find(source => source.id === pendingDisconnectId) ?? null;
  const wizardSource =
    sources.find(source => source.provider === wizardProvider) ?? null;
  const wizardConfig = wizardProvider
    ? (wizards[wizardProvider] ?? null)
    : null;

  /** Connection thật về (wizard poll thấy sau OAuth callback). */
  const handleLiveConnected = (name: string) => {
    toast.success(t('toastConnectedLive', { name }));
    // Refetch để sources + journey ăn connection mới (điểm stage tính lại).
    router.refresh();
  };

  const handleConnect = (providerId: string) => {
    if (live && INSTANT_OAUTH_PROVIDERS.has(providerId)) {
      // Popup TRỐNG mở NGAY trong user gesture này — wizard sẽ điều hướng nó
      // tới authorize_url thật (hoặc đóng lại nếu BE trả stub → demo).
      instantPopupRef.current = openBlankPopup();
      setWizardInstant(true);
      setWizardProvider(providerId);
      return;
    }
    setWizardInstant(false);
    if (!wizards[providerId]) {
      if (live) {
        // Provider chưa có stepper riêng — vẫn đi qua authorize thật, không
        // theo dõi popup (đường hiếm; mọi provider của catalog đều có config).
        void requestAuthorize(providerId)
          .then(result => {
            if (result.kind === 'stub') {
              toast(t('toastAuthorizePending', { name: providerId }));
            } else if (result.kind === 'connected') {
              handleLiveConnected(providerId);
            } else if (openAuthorizePopup(result.url)) {
              toast(t('toastAuthorizeOpened', { name: providerId }));
            } else {
              toast.error(t('wizardPopupBlocked'));
            }
          })
          .catch((err: unknown) => {
            toast.error(err instanceof Error ? err.message : t('actionFailed'));
          });
        return;
      }
      connectAuditSource(providerId);
      toast.success(t('toastConnected'));
      return;
    }
    setWizardProvider(providerId);
  };

  const handleSync = async (source: AuditSource) => {
    if (!live) {
      toast(t('toastSyncQueued', { name: source.name }));
      return;
    }
    try {
      const res = await rexerV2Api.sources.sync(source.id);
      // Chỉ đếm khi đã thành công — lẫn lần thất bại vào thì con số không còn
      // phân biệt được "tính năng có người dùng" với "tính năng đang hỏng".
      trackFeature(FEATURE_EVENT.sourceSync, { provider: source.provider });
      toast.success(
        res.queued
          ? t('toastSyncQueuedJob', { name: source.name, id: res.job_id ?? '' })
          : t('toastSyncedNow', { name: source.name })
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('actionFailed'));
    }
  };

  const handleDisconnect = async () => {
    if (!pendingDisconnect) return;
    if (live) {
      try {
        await rexerV2Api.sources.remove(pendingDisconnect.id);
        trackFeature(FEATURE_EVENT.sourceDisconnect, {
          provider: pendingDisconnect.provider,
        });
        setPendingDisconnectId(null);
        toast.success(
          t('toastDisconnectedLive', { name: pendingDisconnect.name })
        );
        // Refetch để journey/coverage tính lại điểm ngay (FR-D9).
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('actionFailed'));
      }
      return;
    }
    disconnectAuditSource(pendingDisconnect.id);
    setPendingDisconnectId(null);
    toast.success(
      t('toastDisconnected', { count: feedsOf(pendingDisconnect.id) })
    );
  };

  const reasonFor = (source: AuditSource): string =>
    source.stages
      .filter(stage => {
        const cov = covByStage[stage];
        return cov && (cov.state !== 'ok' || cov.live < 2);
      })
      .join(', ') || source.stages.join(', ');

  const card = (source: AuditSource, reason?: string | null) => (
    <SourceCard
      key={source.id}
      source={source}
      feeds={live ? null : feedsOf(source.id)}
      reason={reason}
      onConnect={handleConnect}
      onDisconnect={setPendingDisconnectId}
      onSync={item => {
        void handleSync(item);
      }}
    />
  );

  const section = (
    title: string,
    sub: string | null,
    cards: React.ReactNode[]
  ) =>
    cards.length ? (
      <section className='mx-auto mb-8 w-full max-w-[1240px]'>
        <h2 className='font-[family-name:var(--pv2-disp)] text-base font-bold text-[var(--pv2-ink)]'>
          {title}
        </h2>
        {sub ? (
          <p className='mb-3.5 text-xs text-[var(--pv2-faint)]'>{sub}</p>
        ) : (
          <div className='mb-3.5' />
        )}
        <div className='grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3'>
          {cards}
        </div>
      </section>
    ) : null;

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='w-full px-5 pt-7 pb-16 md:px-8'>
        <header className='mx-auto mb-5 flex w-full max-w-[1240px] flex-wrap items-start gap-5'>
          <div>
            <p className='text-[10px] font-bold tracking-[0.16em] text-[var(--pv2-electric)] uppercase'>
              {t('eyebrow')}
            </p>
            <h1 className='mt-1 font-[family-name:var(--pv2-disp)] text-[1.75rem] font-extrabold tracking-[-0.02em] text-[var(--pv2-ink)] md:text-[1.875rem]'>
              {t('title')}
            </h1>
            <p className='mt-2 max-w-[640px] text-sm leading-relaxed text-[var(--pv2-mut)]'>
              {t('subtitle')} <GlossaryTip term='journeyCoverage' />
            </p>
          </div>
          <div className='ml-auto pt-6'>
            <Button
              variant='ghost'
              onClick={() =>
                router.push(crossHref('/portal-v2/journey-audit', {}))
              }
            >
              <SquareStack aria-hidden />
              {t('openJourney')}
            </Button>
          </div>
        </header>

        {initialError ? (
          <p className='mx-auto mb-4 w-full max-w-[1240px] rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-error)_30%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_6%,var(--pv2-paper))] px-4 py-2.5 text-xs text-[var(--pv2-error)]'>
            {initialError}
          </p>
        ) : null}

        <CoverageMeter coverage={coverage} hint={hint} />

        {section(
          t('needsAttention'),
          t('needsAttentionSub'),
          attention.map(source => card(source))
        )}
        {section(
          `${t('connected')} · ${connected.length}`,
          null,
          connected.map(source => card(source))
        )}
        {section(
          t('recommendedNext'),
          t('recommendedSub'),
          recommended.map(item => card(item.source, reasonFor(item.source)))
        )}

        <section className='mx-auto w-full max-w-[1240px]'>
          <h2 className='font-[family-name:var(--pv2-disp)] text-base font-bold text-[var(--pv2-ink)]'>
            {t('allSources')}{' '}
            <span className='text-xs font-medium text-[var(--pv2-faint)]'>
              {t('allAvailable', { count: filtered.length })}
            </span>
          </h2>
          <p className='mb-3.5 text-xs text-[var(--pv2-faint)]'>
            {t('allSub')}
          </p>
          <div className='mb-3.5 flex flex-wrap items-center gap-2.5'>
            <label className='flex min-w-[220px] flex-1 items-center gap-2 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3 py-2 sm:max-w-[340px]'>
              <Search
                className='size-3.5 shrink-0 text-[var(--pv2-faint)]'
                aria-hidden
              />
              <input
                type='text'
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder={t('searchPlaceholder')}
                className='w-full bg-transparent text-[13px] text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)]'
              />
            </label>
            <div className='flex flex-wrap gap-2'>
              {['All', ...AUDIT_SOURCE_CATEGORIES].map(item => (
                <button
                  key={item}
                  type='button'
                  onClick={() => setCategory(item)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                    item === category
                      ? 'border-[var(--pv2-ink)] bg-[var(--pv2-ink)] text-[var(--pv2-paper)]'
                      : 'border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)]'
                  )}
                >
                  {item === 'All' ? t('allCategory') : item}
                </button>
              ))}
            </div>
          </div>
          {filtered.length ? (
            <div className='grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3'>
              {filtered.map(source => card(source))}
            </div>
          ) : (
            <p className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] p-8 text-center text-[13px] text-[var(--pv2-faint)]'>
              {t('searchEmpty')}
            </p>
          )}
        </section>
      </div>

      <DisconnectSourceModal
        source={pendingDisconnect}
        feeds={
          live ? null : pendingDisconnect ? feedsOf(pendingDisconnect.id) : 0
        }
        open={Boolean(pendingDisconnect)}
        onClose={() => setPendingDisconnectId(null)}
        onConfirm={() => {
          void handleDisconnect();
        }}
      />
      <ConnectWizard
        source={wizardSource}
        config={wizardConfig}
        open={Boolean(wizardProvider)}
        live={live}
        instantOAuth={wizardInstant}
        instantPopup={instantPopupRef.current}
        onClose={() => setWizardProvider(null)}
        onComplete={(provider, doneStats, doneMsg) => {
          connectAuditSource(provider, doneStats);
          toast.success(doneMsg);
        }}
        onLiveConnected={handleLiveConnected}
        onOpenJourney={() =>
          router.push(crossHref('/portal-v2/journey-audit', {}))
        }
      />
    </div>
  );
};
