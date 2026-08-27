'use client';

import { PanelLeftOpen, ScanSearch } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { cn } from '@/lib/cn';
import {
  countAuditedTouchpoints,
  countFindings,
  countOffTouchpoints,
  downstreamCount,
  findTouchpoint,
  flowStats,
  leaksForTouchpoint,
  liveConns,
  productScore,
  sourceStatusMap,
  stageScore,
  totalRisk,
  tpState,
} from '@/lib/portal-v2/journey-audit/helpers';
import { MOCK_WIZARDS } from '@/lib/portal-v2/journey-audit/mock';
import {
  crossHref,
  writeJourneyAuditParams,
  type AuditLens,
  type JourneyAuditViewState,
} from '@/lib/portal-v2/journey-audit/params';
import {
  connectAuditSource,
  useAuditSources,
} from '@/lib/portal-v2/journey-audit/sourcesStore';
import type {
  AuditDropoff,
  JourneyAuditBundle,
} from '@/lib/portal-v2/journey-audit/types';
import { AuditSummary } from '@/components/organisms/portal-v2/journey-audit/AuditSummary';
import { ExperiencePulse } from '@/components/organisms/portal-v2/journey-audit/ExperiencePulse';
import { FlowCanvas } from '@/components/organisms/portal-v2/journey-audit/FlowCanvas';
import { JourneyBoard } from '@/components/organisms/portal-v2/journey-audit/JourneyBoard';
import { ProductRail } from '@/components/organisms/portal-v2/journey-audit/ProductRail';
import {
  TouchpointDrawer,
  type DrawerContext,
} from '@/components/organisms/portal-v2/journey-audit/TouchpointDrawer';
import { ConnectWizard } from '@/components/organisms/portal-v2/sources/ConnectWizard';

type JourneyAuditWorkspaceProps = {
  bundle: JourneyAuditBundle;
  dropoffs: Record<string, AuditDropoff>;
  initialState: JourneyAuditViewState;
  initialError: string | null;
};

/**
 * Màn Journey: rail sản phẩm collapsible + summary + Experience Pulse + lens
 * Quality/Flow trên cùng một canvas — đổi lens không refetch (client state).
 */
export const JourneyAuditWorkspace = ({
  bundle,
  dropoffs,
  initialState,
  initialError,
}: JourneyAuditWorkspaceProps) => {
  const t = useTranslations('portalV2.journeyAudit');
  const router = useRouter();

  const [productId, setProductId] = useState<string>(() => {
    const found = bundle.products.find(p => p.id === initialState.productId);
    return found?.id ?? bundle.products[0]?.id ?? '';
  });
  const [lens, setLens] = useState<AuditLens>(initialState.lens);
  const [drawerTpId, setDrawerTpId] = useState<string | null>(
    initialState.touchpointId
  );
  const [flowSel, setFlowSel] = useState<string | null>(null);
  const [railOpen, setRailOpen] = useState(true);
  const [headerOpen, setHeaderOpen] = useState(true);
  const [wizardProvider, setWizardProvider] = useState<string | null>(null);

  const product =
    bundle.products.find(p => p.id === productId) ?? bundle.products[0];
  const journey = product ? bundle.journeys[product.auditId] : undefined;
  const flow = product ? bundle.flows[product.auditId] : undefined;
  const dropoff = product ? (dropoffs[product.auditId] ?? null) : null;

  const sources = useAuditSources(bundle.sources);
  const statuses = useMemo(() => sourceStatusMap(sources), [sources]);
  const conns = useMemo(
    () => (journey && flow ? liveConns(flow, journey, statuses) : []),
    [journey, flow, statuses]
  );

  useEffect(() => {
    writeJourneyAuditParams({
      productId: product?.id ?? null,
      lens,
      touchpointId: drawerTpId,
    });
  }, [product?.id, lens, drawerTpId]);

  const wizardSource =
    sources.find(source => source.provider === wizardProvider) ?? null;
  const wizardConfig = wizardProvider
    ? (MOCK_WIZARDS[wizardProvider] ?? null)
    : null;

  const openWizard = useCallback(
    (providerId: string) => {
      if (!MOCK_WIZARDS[providerId]) {
        connectAuditSource(providerId);
        toast.success(t('toastConnected'));
        return;
      }
      setWizardProvider(providerId);
    },
    [t]
  );

  const handleWizardComplete = useCallback(
    (provider: string, doneStats: string, doneMsg: string) => {
      connectAuditSource(provider, doneStats);
      toast.success(doneMsg);
    },
    []
  );

  if (!product || !journey || !flow) return null;

  const goLeak = (leakId: string) =>
    router.push(
      crossHref('/portal-v2/dropoff', { product: product.id, leak: leakId })
    );
  const goSources = () => router.push(crossHref('/portal-v2/sources', {}));

  const stats = {
    productName: product.name,
    score: productScore(journey, statuses),
    critical: countFindings(journey, statuses, 'crit'),
    warnings: countFindings(journey, statuses, 'warn'),
    strengths: countFindings(journey, statuses, 'good'),
    brokenHandoffs: journey.handoffs.filter(h => h.severity !== 'ok').length,
    auditedCount: countAuditedTouchpoints(journey, statuses),
    stageCount: journey.stages.length,
    offCount: countOffTouchpoints(journey, statuses),
    totalRisk: totalRisk(dropoff),
  };

  const drawerContext: DrawerContext | null = (() => {
    if (!drawerTpId) return null;
    const found = findTouchpoint(journey, drawerTpId);
    if (!found) return null;
    const state = tpState(found.tp, statuses);
    if (state === 'off') return null;
    return {
      tp: found.tp,
      stageName: found.stage.name,
      stale: state === 'stale',
      stats: flowStats(flow, conns, found.tp.id),
      leaks: leaksForTouchpoint(dropoff, found.tp.id),
      downstream: downstreamCount(conns, found.tp.id),
    };
  })();

  const nameOf = (tpId: string): string =>
    findTouchpoint(journey, tpId)?.tp.name ?? tpId;

  return (
    <div className='relative flex min-h-0 flex-1 flex-col'>
      <header className='flex flex-wrap items-center gap-3 border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 py-2.5'>
        <p className='min-w-0 truncate text-[13px] text-[var(--pv2-faint)]'>
          <span className='text-[10px] font-bold tracking-[0.16em] text-[var(--pv2-electric)] uppercase'>
            {t('eyebrow')}
          </span>
          <span className='mx-2 text-[var(--pv2-hair)]'>›</span>
          <b className='font-semibold text-[var(--pv2-ink)]'>{product.name}</b>
        </p>
        <div className='ml-auto flex items-center gap-2.5'>
          {stats.score != null ? (
            <span className='flex items-center gap-2 rounded-full border border-[var(--pv2-hair)] py-1 pr-3 pl-1.5 text-xs text-[var(--pv2-mut)]'>
              <span
                className='text-2xs grid size-[26px] place-items-center rounded-full font-semibold text-[var(--pv2-paper)]'
                style={{
                  background:
                    stats.score >= 80
                      ? 'var(--pv2-success)'
                      : stats.score >= 65
                        ? 'var(--pv2-warning)'
                        : 'var(--pv2-error)',
                }}
              >
                {stats.score}
              </span>
              {t('experienceScore')}
            </span>
          ) : null}
          <Button variant='primary' onClick={() => toast(t('toastRunQueued'))}>
            <ScanSearch aria-hidden />
            {t('runAudit')}
          </Button>
        </div>
      </header>

      {initialError ? (
        <p className='border-b border-[color-mix(in_srgb,var(--pv2-error)_30%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_6%,var(--pv2-paper))] px-5 py-2 text-xs text-[var(--pv2-error)]'>
          {initialError}
        </p>
      ) : null}

      <div className='relative flex min-h-0 flex-1'>
        {railOpen ? (
          <ProductRail
            products={bundle.products}
            activeId={product.id}
            onSelect={id => {
              setProductId(id);
              setDrawerTpId(null);
              setFlowSel(null);
            }}
            onCollapse={() => setRailOpen(false)}
          />
        ) : (
          <button
            type='button'
            onClick={() => setRailOpen(true)}
            title={t('showPanel')}
            aria-label={t('showPanel')}
            className='absolute top-14 left-0 z-20 grid h-10 w-[22px] place-items-center rounded-r-[9px] border border-l-0 border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-xs text-[var(--pv2-faint)] shadow-[var(--pv2-sh-sm)] hover:text-[var(--pv2-electric)]'
          >
            <PanelLeftOpen className='size-3.5' aria-hidden />
          </button>
        )}

        <main className='flex min-w-0 flex-1 flex-col'>
          <div className='mx-5 mt-3.5 flex items-start gap-3 rounded-[var(--pv2-r)] border border-[color-mix(in_srgb,var(--pv2-warning)_35%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-warning)_6%,var(--pv2-paper))] px-4 py-2.5'>
            <span className='mt-0.5 shrink-0 rounded-[6px] bg-[color-mix(in_srgb,var(--pv2-warning)_20%,var(--pv2-paper))] px-2 py-1 text-[9.5px] font-bold tracking-[0.1em] text-[color-mix(in_srgb,var(--pv2-warning)_80%,var(--pv2-ink))]'>
              {t('provenanceTag')}
            </span>
            <p className='text-xs leading-relaxed text-[color-mix(in_srgb,var(--pv2-warning)_60%,var(--pv2-ink))]'>
              {t('provenanceBody')}
            </p>
          </div>

          {headerOpen ? (
            <>
              <AuditSummary
                stats={stats}
                onOpenSources={goSources}
                onOpenDropoff={() =>
                  router.push(
                    crossHref('/portal-v2/dropoff', { product: product.id })
                  )
                }
                compact={false}
              />
              <ExperiencePulse
                points={journey.stages.map(stage => ({
                  stageName: stage.name,
                  score: stageScore(stage, statuses),
                }))}
              />
            </>
          ) : (
            <AuditSummary
              stats={stats}
              onOpenSources={goSources}
              onOpenDropoff={() =>
                router.push(
                  crossHref('/portal-v2/dropoff', { product: product.id })
                )
              }
              compact
            />
          )}

          <div className='flex flex-wrap items-center gap-3.5 px-5 pt-3.5'>
            <div
              role='tablist'
              aria-label={t('lensAria')}
              className='flex gap-1 rounded-[var(--pv2-r)] bg-[color-mix(in_srgb,var(--pv2-hair)_60%,var(--pv2-canvas))] p-1'
            >
              {(
                [
                  ['quality', 'lensQuality', 'lensQualityHint'],
                  ['flow', 'lensFlow', 'lensFlowHint'],
                ] as const
              ).map(([id, labelKey, hintKey]) => (
                <button
                  key={id}
                  type='button'
                  role='tab'
                  aria-selected={lens === id}
                  onClick={() => setLens(id)}
                  className={cn(
                    'flex flex-col items-start rounded-[9px] px-3.5 py-1.5 text-left transition-colors',
                    lens === id
                      ? 'bg-[var(--pv2-paper)] shadow-[var(--pv2-sh-sm)]'
                      : 'hover:bg-[color-mix(in_srgb,var(--pv2-paper)_55%,transparent)]'
                  )}
                >
                  <b
                    className={cn(
                      'text-[13px] font-semibold',
                      lens === id
                        ? 'text-[var(--pv2-electric)]'
                        : 'text-[var(--pv2-mut)]'
                    )}
                  >
                    {t(labelKey)}
                  </b>
                  <span className='text-3xs text-[var(--pv2-faint)]'>
                    {t(hintKey)}
                  </span>
                </button>
              ))}
            </div>
            <span className='text-xs text-[var(--pv2-faint)]'>
              {lens === 'quality' ? t('lensQualityDesc') : t('lensFlowDesc')}
            </span>
            <button
              type='button'
              onClick={() => setHeaderOpen(open => !open)}
              className='ml-auto rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3 py-1.5 text-xs font-semibold text-[var(--pv2-mut)] hover:text-[var(--pv2-electric)]'
            >
              {headerOpen ? `⌃ ${t('hideSummary')}` : `⌄ ${t('showSummary')}`}
            </button>
          </div>

          {lens === 'quality' ? (
            <JourneyBoard
              journey={journey}
              flow={flow}
              conns={conns}
              dropoff={dropoff}
              sources={sources}
              statuses={statuses}
              selectedTpId={drawerTpId}
              onOpenTp={setDrawerTpId}
              onGoLeak={goLeak}
              onConnectSource={openWizard}
            />
          ) : (
            <FlowCanvas
              journey={journey}
              flow={flow}
              conns={conns}
              statuses={statuses}
              selectedId={flowSel}
              onSelect={setFlowSel}
              onOpenTp={setDrawerTpId}
            />
          )}
        </main>
      </div>

      <TouchpointDrawer
        context={drawerContext}
        productName={product.name}
        productSlug={product.auditId}
        sources={sources}
        nameOf={nameOf}
        onClose={() => setDrawerTpId(null)}
        onGoLeak={goLeak}
        onGoFlow={tpId => {
          setDrawerTpId(null);
          setLens('flow');
          setFlowSel(tpId);
        }}
        onConnectSource={openWizard}
      />

      <ConnectWizard
        source={wizardSource}
        config={wizardConfig}
        open={Boolean(wizardProvider)}
        onClose={() => setWizardProvider(null)}
        onComplete={handleWizardComplete}
        onOpenJourney={() => setWizardProvider(null)}
      />
    </div>
  );
};
