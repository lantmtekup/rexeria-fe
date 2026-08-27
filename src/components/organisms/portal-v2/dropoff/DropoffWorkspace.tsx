'use client';

import { Database, SquareStack } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { cn } from '@/lib/cn';
import { formatCount, formatMoney } from '@/lib/portal-v2/format';
import {
  analyticsOn,
  analyticsSources,
  auditedTouchpoints,
  findTouchpoint,
  sourceStatusMap,
} from '@/lib/portal-v2/journey-audit/helpers';
import {
  crossHref,
  writeDropoffParams,
  type DropoffViewState,
} from '@/lib/portal-v2/journey-audit/params';
import { useAuditSources } from '@/lib/portal-v2/journey-audit/sourcesStore';
import type { JourneyAuditBundle } from '@/lib/portal-v2/journey-audit/types';
import type { DropoffBundle } from '@/services/portal-v2/journeyAudit';
import { ChannelTable } from '@/components/organisms/portal-v2/dropoff/ChannelTable';
import { DropoffFunnelChart } from '@/components/organisms/portal-v2/dropoff/DropoffFunnelChart';
import { LeakDetail } from '@/components/organisms/portal-v2/dropoff/LeakDetail';
import { LeakList } from '@/components/organisms/portal-v2/dropoff/LeakList';

type DropoffWorkspaceProps = {
  bundle: JourneyAuditBundle;
  dropoffBundle: DropoffBundle;
  initialState: DropoffViewState;
  initialError: string | null;
};

const StepHeading = ({
  n,
  children,
}: {
  n: number;
  children: React.ReactNode;
}) => (
  <h3 className='mb-3 flex items-center gap-2.5 font-[family-name:var(--pv2-disp)] text-[17px] font-bold tracking-[-0.01em] text-[var(--pv2-ink)]'>
    <span className='grid size-6 shrink-0 place-items-center rounded-full bg-[var(--pv2-electric)] text-xs font-semibold text-[var(--pv2-paper)]'>
      {n}
    </span>
    {children}
  </h3>
);

/** Màn Drop-off: story header, phễu 3 hàng, leak xếp hạng + chẩn đoán, kênh. */
export const DropoffWorkspace = ({
  bundle,
  dropoffBundle,
  initialState,
  initialError,
}: DropoffWorkspaceProps) => {
  const t = useTranslations('portalV2.dropoff');
  const router = useRouter();
  const sources = useAuditSources(bundle.sources);
  const statuses = useMemo(() => sourceStatusMap(sources), [sources]);

  const [productId, setProductId] = useState<string>(() => {
    const found = bundle.products.find(p => p.id === initialState.productId);
    return found?.id ?? bundle.products[0]?.id ?? '';
  });
  const product =
    bundle.products.find(p => p.id === productId) ?? bundle.products[0];
  const journey = product ? bundle.journeys[product.auditId] : undefined;
  const dropoff = product
    ? (dropoffBundle.dropoffs[product.auditId] ?? null)
    : null;

  const [selectedLeakId, setSelectedLeakId] = useState<string | null>(
    initialState.leakId
  );
  const ranked = useMemo(
    () => (dropoff ? [...dropoff.leaks].sort((a, b) => b.usd - a.usd) : []),
    [dropoff]
  );
  const selected =
    ranked.find(leak => leak.id === selectedLeakId) ?? ranked[0] ?? null;

  useEffect(() => {
    writeDropoffParams({
      productId: product?.id ?? null,
      leakId: selected?.id ?? null,
    });
  }, [product?.id, selected?.id]);

  if (!product || !journey) return null;

  const tpNameOf = (touchpointId: string): string =>
    findTouchpoint(journey, touchpointId)?.tp.name ?? touchpointId;
  const stageNameOf = (touchpointId: string): string | null =>
    findTouchpoint(journey, touchpointId)?.stage.name ?? null;

  const goJourney = (params: Record<string, string | null> = {}) =>
    router.push(
      crossHref('/portal-v2/journey-audit', { product: product.id, ...params })
    );
  const goSources = () => router.push(crossHref('/portal-v2/sources', {}));

  const header = (
    <header className='mb-5 flex flex-wrap items-start gap-5'>
      <div>
        <p className='text-[10px] font-bold tracking-[0.16em] text-[var(--pv2-electric)] uppercase'>
          {t('eyebrow')}
        </p>
        <h1 className='mt-1 font-[family-name:var(--pv2-disp)] text-[1.75rem] font-extrabold tracking-[-0.02em] text-[var(--pv2-ink)] md:text-[1.875rem]'>
          {t('title')}
        </h1>
        <p className='mt-2 max-w-[680px] text-sm leading-relaxed text-[var(--pv2-mut)]'>
          {t('subtitle', { product: product.name })}
        </p>
      </div>
      <div className='ml-auto flex flex-wrap items-center gap-2.5 pt-6'>
        {bundle.products.length > 1 ? (
          <select
            value={product.id}
            onChange={event => {
              setProductId(event.target.value);
              setSelectedLeakId(null);
            }}
            aria-label={t('productPicker')}
            className='h-[34px] max-w-[240px] rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2 text-xs text-[var(--pv2-ink)]'
          >
            {bundle.products.map(row => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        ) : null}
        <Button variant='ghost' onClick={goSources}>
          <Database aria-hidden />
          {t('manageSources')}
        </Button>
        <Button variant='ghost' onClick={() => goJourney()}>
          <SquareStack aria-hidden />
          {t('openJourney')}
        </Button>
      </div>
    </header>
  );

  if (!analyticsOn(sources)) {
    return (
      <div className='w-full px-5 pt-7 pb-16 md:px-8'>
        <div className='mx-auto w-full max-w-[1240px]'>
          {header}
          <div className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-8 py-16 text-center'>
            <p aria-hidden className='mb-2.5 text-3xl'>
              🔌
            </p>
            <p className='mb-1.5 text-[15px] font-semibold text-[var(--pv2-ink)]'>
              {t('lockedTitle')}
            </p>
            <p className='mx-auto mb-5 max-w-[520px] text-[13px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('lockedBody', {
                sources: analyticsSources(sources)
                  .map(source => source.name)
                  .join(` ${t('or')} `),
              })}
            </p>
            <Button variant='primary' onClick={goSources}>
              {t('lockedCta')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!dropoff || !selected) {
    return (
      <div className='w-full px-5 pt-7 pb-16 md:px-8'>
        <div className='mx-auto w-full max-w-[1240px]'>
          {header}
          <p className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] p-8 text-center text-[13px] text-[var(--pv2-faint)]'>
            {t('noFunnel')}
          </p>
        </div>
      </div>
    );
  }

  const total = dropoff.steps[0]?.count ?? 0;
  const buyers = dropoff.steps[dropoff.steps.length - 1]?.count ?? 0;
  const risk = ranked.reduce((sum, leak) => sum + leak.usd, 0);
  const selectedFound = findTouchpoint(journey, selected.touchpointId);

  return (
    <div className='w-full px-5 pt-7 pb-16 md:px-8'>
      <div className='mx-auto w-full max-w-[1240px]'>
        {header}
        {initialError || dropoffBundle.error ? (
          <p className='mb-4 rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-error)_30%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_6%,var(--pv2-paper))] px-4 py-2.5 text-xs text-[var(--pv2-error)]'>
            {initialError ?? dropoffBundle.error}
          </p>
        ) : null}

        <div className='mb-5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 py-4'>
          <p className='text-base leading-relaxed text-[var(--pv2-mut)] [&_b]:font-bold [&_b]:text-[var(--pv2-ink)]'>
            {t.rich('storyLine', {
              total: formatCount(total),
              product: product.name,
              buyers: formatCount(buyers),
              lost: formatCount(Math.max(0, total - buyers)),
              risk: formatMoney(risk),
              count: ranked.length,
              b: chunks => <b>{chunks}</b>,
              red: chunks => (
                <b className='text-[var(--pv2-error)]'>{chunks}</b>
              ),
            })}
          </p>
          <div className='mt-3.5 flex flex-wrap items-center gap-3 border-t border-[var(--pv2-hair)] pt-3'>
            <span className='rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)] px-3 py-1.5 text-xs text-[var(--pv2-mut)] [&_b]:text-[var(--pv2-ink)]'>
              <b>{t('bridgeJourneyLabel')}</b> — {t('bridgeJourneyDesc')}
            </span>
            <span className='font-bold text-[var(--pv2-electric)]'>→</span>
            <span className='rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)] px-3 py-1.5 text-xs text-[var(--pv2-mut)] [&_b]:text-[var(--pv2-ink)]'>
              <b>{t('bridgeThisLabel')}</b> — {t('bridgeThisDesc')}
            </span>
            <span className='min-w-[220px] flex-1 text-xs leading-snug text-[var(--pv2-faint)]'>
              {t('bridgeNote')}
            </span>
          </div>
        </div>

        <StepHeading n={1}>{t('step1')}</StepHeading>
        <div className='mb-5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 pt-4 pb-3'>
          <p className='mb-1 flex justify-end'>
            <span
              className={cn(
                'text-3xs rounded-full px-2.5 py-0.5 font-bold tracking-[0.06em] uppercase',
                dropoff.measured
                  ? 'bg-[color-mix(in_srgb,var(--pv2-success)_10%,var(--pv2-paper))] text-[var(--pv2-success)]'
                  : 'bg-[color-mix(in_srgb,var(--pv2-warning)_12%,var(--pv2-paper))] text-[color-mix(in_srgb,var(--pv2-warning)_80%,var(--pv2-ink))]'
              )}
            >
              {dropoff.measured ? t('measuredTag') : t('estimatedTag')}
            </span>
          </p>
          <DropoffFunnelChart
            dropoff={dropoff}
            stages={journey.stages.map(stage => ({
              name: stage.name,
              auditedCount: auditedTouchpoints(stage, statuses).length,
            }))}
            selectedLeakId={selected.id}
            tpNameOf={tpNameOf}
            onSelectLeak={setSelectedLeakId}
            onOpenStage={() => goJourney()}
          />
          <p className='text-2xs pt-2 leading-relaxed text-[var(--pv2-faint)] [&_b]:text-[var(--pv2-mut)]'>
            {t.rich('funnelNote', { b: chunks => <b>{chunks}</b> })}
          </p>
        </div>

        <StepHeading n={2}>{t('step2')}</StepHeading>
        <div className='mb-5 grid items-start gap-4 lg:grid-cols-[minmax(320px,420px)_1fr]'>
          <LeakList
            leaks={ranked}
            selectedId={selected.id}
            stageNameOf={stageNameOf}
            tpNameOf={tpNameOf}
            onSelect={setSelectedLeakId}
          />
          <LeakDetail
            leak={selected}
            dropoff={dropoff}
            sources={sources}
            stageName={stageNameOf(selected.touchpointId)}
            tpName={tpNameOf(selected.touchpointId)}
            tpScore={selectedFound?.tp.score ?? null}
            onOpenTouchpoint={() => goJourney({ tp: selected.touchpointId })}
          />
        </div>

        <StepHeading n={3}>{t('step3')}</StepHeading>
        <ChannelTable dropoff={dropoff} onSelectLeak={setSelectedLeakId} />

        <div className='mt-5 rounded-[var(--pv2-r)] bg-[var(--pv2-ink)] px-5 py-4 text-[color-mix(in_srgb,var(--pv2-paper)_88%,var(--pv2-ink))]'>
          <h3 className='mb-2.5 font-[family-name:var(--pv2-disp)] text-[15px] font-bold text-[var(--pv2-paper)]'>
            {t('patternsTitle')}
          </h3>
          {dropoffBundle.patterns.map((pattern, index) => (
            <p
              key={pattern.title}
              className='flex gap-2.5 border-t border-[color-mix(in_srgb,var(--pv2-paper)_9%,transparent)] py-1.5 text-[13px] leading-relaxed first:border-t-0'
            >
              <span className='shrink-0 font-semibold text-[color-mix(in_srgb,var(--pv2-electric)_60%,var(--pv2-paper))]'>
                {index + 1}
              </span>
              <span>
                <b className='text-[var(--pv2-paper)]'>{pattern.title}</b>{' '}
                {pattern.body}
              </span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
