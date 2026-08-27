'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { cn } from '@/lib/cn';
import { formatCount, formatMoney } from '@/lib/portal-v2/format';
import {
  grade,
  scoreColor,
  scoreSoft,
  type FlowStats,
} from '@/lib/portal-v2/journey-audit/helpers';
import type {
  AuditDims,
  AuditLeak,
  AuditSource,
  AuditTouchpoint,
} from '@/lib/portal-v2/journey-audit/types';
import { TouchpointSnapshot } from '@/components/organisms/portal-v2/journey-audit/TouchpointSnapshot';

const DIM_KEYS: Array<{ key: keyof AuditDims; labelKey: string }> = [
  { key: 'messageMatch', labelKey: 'dimMessageMatch' },
  { key: 'loadSpeed', labelKey: 'dimLoadSpeed' },
  { key: 'brandConsistency', labelKey: 'dimBrandConsistency' },
  { key: 'friction', labelKey: 'dimFriction' },
  { key: 'accessibility', labelKey: 'dimAccessibility' },
];

const FINDING_TONE: Record<string, { box: string; chip: string }> = {
  crit: {
    box: 'border-[color-mix(in_srgb,var(--pv2-error)_30%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_4%,var(--pv2-paper))]',
    chip: 'bg-[color-mix(in_srgb,var(--pv2-error)_10%,var(--pv2-paper))] text-[var(--pv2-error)]',
  },
  warn: {
    box: 'border-[color-mix(in_srgb,var(--pv2-warning)_35%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-warning)_5%,var(--pv2-paper))]',
    chip: 'bg-[color-mix(in_srgb,var(--pv2-warning)_14%,var(--pv2-paper))] text-[color-mix(in_srgb,var(--pv2-warning)_80%,var(--pv2-ink))]',
  },
  good: {
    box: 'border-[color-mix(in_srgb,var(--pv2-success)_30%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-success)_4%,var(--pv2-paper))]',
    chip: 'bg-[color-mix(in_srgb,var(--pv2-success)_10%,var(--pv2-paper))] text-[var(--pv2-success)]',
  },
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className='text-3xs mb-2.5 font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
    {children}
  </h4>
);

const FlowRow = ({
  name,
  volume,
  max,
  tag,
}: {
  name: string;
  volume: number;
  max: number;
  tag?: { label: string; tone: 'crit' | 'warn' } | null;
}) => (
  <div className='mb-2 flex items-center gap-2.5 text-xs'>
    <span className='min-w-0 flex-1 truncate text-[var(--pv2-mut)]'>
      {name}
      {tag ? (
        <span
          className={cn(
            'text-3xs ml-1.5 rounded-[5px] px-1.5 py-px font-bold',
            tag.tone === 'crit'
              ? 'bg-[color-mix(in_srgb,var(--pv2-error)_10%,var(--pv2-paper))] text-[var(--pv2-error)]'
              : 'bg-[color-mix(in_srgb,var(--pv2-warning)_14%,var(--pv2-paper))] text-[color-mix(in_srgb,var(--pv2-warning)_80%,var(--pv2-ink))]'
          )}
        >
          {tag.label}
        </span>
      ) : null}
    </span>
    <span className='h-[7px] w-16 shrink-0 overflow-hidden rounded-full bg-[var(--pv2-canvas)]'>
      <i
        className='block h-full rounded-full bg-[var(--pv2-electric)]'
        style={{ width: `${Math.max(3, Math.round((100 * volume) / max))}%` }}
      />
    </span>
    <b className='text-2xs w-11 shrink-0 text-right font-semibold text-[var(--pv2-ink)]'>
      {formatCount(volume)}
    </b>
  </div>
);

export type DrawerContext = {
  tp: AuditTouchpoint;
  stageName: string;
  stale: boolean;
  stats: FlowStats | null;
  leaks: AuditLeak[];
  downstream: number;
};

type TouchpointDrawerProps = {
  context: DrawerContext | null;
  productName: string;
  productSlug: string;
  sources: AuditSource[];
  /** id touchpoint → tên hiển thị (cạnh flow chỉ mang id). */
  nameOf: (tpId: string) => string;
  onClose: () => void;
  onGoLeak: (leakId: string) => void;
  onGoFlow: (tpId: string) => void;
  onConnectSource: (providerId: string) => void;
};

/** Slide-over phải ~420px — chi tiết audit của một touchpoint. */
export const TouchpointDrawer = ({
  context,
  productName,
  productSlug,
  sources,
  nameOf,
  onClose,
  onGoLeak,
  onGoFlow,
  onConnectSource,
}: TouchpointDrawerProps) => {
  const t = useTranslations('portalV2.journeyAudit');
  if (!context) return null;
  const { tp, stageName, stale, stats, leaks, downstream } = context;
  const captured =
    sources.find(source => source.id === tp.sourceIds[0])?.name ??
    'ReXeR Public Crawl';

  const inRows: Array<{ name: string; volume: number }> = [];
  if (stats?.direct) {
    inRows.push({ name: t('directArrivals'), volume: stats.direct });
  }
  stats?.inEdges.forEach(edgeItem => {
    inRows.push({ name: nameOf(edgeItem.from), volume: edgeItem.volume });
  });
  inRows.sort((a, b) => b.volume - a.volume);
  const outRows = [...(stats?.outEdges ?? [])].sort(
    (a, b) => b.volume - a.volume
  );
  const inMax = Math.max(1, ...inRows.map(row => row.volume));
  const outMax = Math.max(1, ...outRows.map(row => row.volume));

  return (
    <>
      <button
        type='button'
        aria-label={t('drawerClose')}
        tabIndex={-1}
        onClick={onClose}
        className='fixed inset-0 z-[45] cursor-default bg-black/20'
      />
      <aside
        aria-label={t('drawerAria')}
        className='fixed top-[var(--pv2-top)] right-0 bottom-0 z-[46] flex w-[420px] max-w-[92vw] flex-col border-l border-[var(--pv2-hair)] bg-[var(--pv2-paper)] shadow-[var(--pv2-sh-soft)]'
      >
        <header className='shrink-0 border-b border-[var(--pv2-hair)] px-5 pt-4 pb-3.5'>
          <div className='flex items-start gap-3'>
            <span
              aria-hidden
              className='grid size-10 shrink-0 place-items-center rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)] text-[19px]'
            >
              {tp.icon}
            </span>
            <div className='min-w-0'>
              <h3 className='font-[family-name:var(--pv2-disp)] text-[17px] leading-tight font-bold text-[var(--pv2-ink)]'>
                {tp.name}
              </h3>
              <p className='text-2xs mt-0.5 truncate text-[var(--pv2-faint)]'>
                {productName} › {stageName} › {tp.channel}
              </p>
            </div>
            <button
              type='button'
              aria-label={t('drawerClose')}
              onClick={onClose}
              className='ml-auto grid size-8 shrink-0 place-items-center rounded-[var(--pv2-r-sm)] text-[var(--pv2-faint)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]'
            >
              <X className='size-4' aria-hidden />
            </button>
          </div>
          <div className='mt-3 flex items-center gap-3'>
            <span
              className='text-[26px] font-semibold'
              style={{ color: scoreColor(tp.score) }}
            >
              {tp.score}
            </span>
            <span
              className='text-2xs rounded-[var(--pv2-r-sm)] px-2 py-0.5 font-bold'
              style={{
                color: scoreColor(tp.score),
                background: scoreSoft(tp.score),
              }}
            >
              {t('gradeLabel', { grade: grade(tp.score) })}
            </span>
            <span className='text-2xs ml-auto text-right leading-snug text-[var(--pv2-faint)]'>
              {t('drawerLastCrawl')}
              <br />
              {t('drawerAuditVersion')}
            </span>
          </div>
        </header>

        <div className='min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-7'>
          {stale ? (
            <p className='mb-4 rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-warning)_35%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-warning)_6%,var(--pv2-paper))] px-3 py-2.5 text-xs leading-relaxed text-[var(--pv2-mut)]'>
              <b className='mr-1.5 text-[color-mix(in_srgb,var(--pv2-warning)_80%,var(--pv2-ink))]'>
                {t('staleFlag').toUpperCase()}
              </b>
              {t('staleBanner')}
            </p>
          ) : null}

          <TouchpointSnapshot
            tp={tp}
            productSlug={productSlug}
            capturedVia={captured}
          />

          {leaks.map(leak => (
            <section key={leak.id} className='mb-5'>
              <SectionTitle>{t('revenueImpact')}</SectionTitle>
              <div className='flex items-center gap-2.5 rounded-[var(--pv2-r)] border border-[color-mix(in_srgb,var(--pv2-error)_28%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_3%,var(--pv2-paper))] px-3 py-2.5'>
                <span aria-hidden className='shrink-0 text-[17px]'>
                  💸
                </span>
                <span className='min-w-0 text-xs leading-snug'>
                  <b className='text-[var(--pv2-ink)]'>{leak.title}</b>
                  <br />
                  <span className='text-2xs text-[var(--pv2-faint)]'>
                    {t('revenueImpactSub', { conf: leak.confidence })}
                  </span>
                </span>
                <span className='ml-auto shrink-0 text-right'>
                  <span className='block text-[13px] font-semibold text-[var(--pv2-error)]'>
                    {t('revenueLost', { amount: formatMoney(leak.usd) })}
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='mt-1'
                    onClick={() => onGoLeak(leak.id)}
                  >
                    {t('seeAnalysis')}
                  </Button>
                </span>
              </div>
            </section>
          ))}

          {stats && (stats.arrive || inRows.length || outRows.length) ? (
            <section className='mb-5'>
              <SectionTitle>{t('trafficTitle')}</SectionTitle>
              <div className='mb-3.5 grid grid-cols-3 gap-2.5'>
                <span>
                  <b className='block text-[17px] font-semibold text-[var(--pv2-ink)]'>
                    {formatCount(stats.arrive)}
                  </b>
                  <span className='text-3xs text-[var(--pv2-faint)]'>
                    {t('arrivePerMonth')}
                  </span>
                </span>
                <span>
                  <b className='block text-[17px] font-semibold text-[var(--pv2-success)]'>
                    {formatCount(stats.cont)}
                  </b>
                  <span className='text-3xs text-[var(--pv2-faint)]'>
                    {t('continueOn')}
                  </span>
                </span>
                <span>
                  <b className='block text-[17px] font-semibold text-[var(--pv2-error)]'>
                    {formatCount(stats.leave)}
                  </b>
                  <span className='text-3xs text-[var(--pv2-faint)]'>
                    {t('leaveHere')}
                    {stats.arrive
                      ? ` (${Math.round((100 * stats.leave) / stats.arrive)}%)`
                      : ''}
                  </span>
                </span>
              </div>
              <p className='text-3xs mb-2 font-bold tracking-[0.08em] text-[var(--pv2-faint)] uppercase'>
                {t('whereFrom')}
              </p>
              {inRows.length ? (
                inRows.map(row => (
                  <FlowRow
                    key={row.name}
                    name={row.name}
                    volume={row.volume}
                    max={inMax}
                  />
                ))
              ) : (
                <p className='mb-2 text-xs text-[var(--pv2-faint)] italic'>
                  {t('entryDoor')}
                </p>
              )}
              <p className='text-3xs mt-3 mb-2 font-bold tracking-[0.08em] text-[var(--pv2-faint)] uppercase'>
                {t('whereNext')}
              </p>
              {outRows.length ? (
                outRows.map(edgeItem => (
                  <FlowRow
                    key={edgeItem.to}
                    name={nameOf(edgeItem.to)}
                    volume={edgeItem.volume}
                    max={outMax}
                    tag={
                      edgeItem.type === 'broken'
                        ? { label: t('linkBroken'), tone: 'crit' }
                        : edgeItem.type === 'weak'
                          ? { label: t('leaky'), tone: 'warn' }
                          : null
                    }
                  />
                ))
              ) : (
                <p className='mb-2 text-xs text-[var(--pv2-faint)] italic'>
                  {t('journeyEnds')}
                </p>
              )}
              {stats.influence.length ? (
                <p className='text-2xs mt-2 border-t border-dashed border-[var(--pv2-hair)] pt-2 leading-relaxed text-[var(--pv2-faint)]'>
                  ↩{' '}
                  {t('influenceNote', {
                    names: stats.influence.map(e => nameOf(e.from)).join(', '),
                  })}
                </p>
              ) : null}
              <p className='mt-2 rounded-[var(--pv2-r-sm)] bg-[var(--pv2-electric-soft)] px-3 py-2 text-xs leading-relaxed text-[var(--pv2-electric)]'>
                ◆{' '}
                {downstream
                  ? t('upstreamNote', { count: downstream })
                  : t('endpointNote')}
                <button
                  type='button'
                  onClick={() => onGoFlow(tp.id)}
                  className='text-2xs mt-1 block font-semibold hover:underline'
                >
                  {t('seeInFlow')} →
                </button>
              </p>
            </section>
          ) : null}

          <section className='mb-5'>
            <SectionTitle>{t('auditSources')}</SectionTitle>
            {tp.sourceIds.map(sourceId => {
              const source = sources.find(item => item.id === sourceId);
              if (!source) return null;
              return (
                <div
                  key={sourceId}
                  className='mb-2 flex items-center gap-2.5 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] px-3 py-2 text-xs'
                >
                  <span aria-hidden className='text-base'>
                    {source.icon}
                  </span>
                  <b className='text-[var(--pv2-ink)]'>{source.name}</b>
                  {source.status === 'connected' ? (
                    <span className='font-semibold text-[var(--pv2-success)]'>
                      ● {t('sourceLive', { sync: source.lastSync ?? '' })}
                    </span>
                  ) : source.status === 'attention' ? (
                    <span className='font-semibold text-[var(--pv2-warning)]'>
                      ⚠ {t('sourceStale', { sync: source.lastSync ?? '' })}
                    </span>
                  ) : (
                    <span className='text-[var(--pv2-faint)]'>
                      ○ {t('sourceNotConnected')}
                    </span>
                  )}
                  {source.status !== 'connected' ? (
                    <Button
                      variant='primary'
                      size='sm'
                      className='ml-auto'
                      onClick={() => onConnectSource(source.provider)}
                    >
                      {source.status === 'attention'
                        ? t('reconnect')
                        : t('connect')}
                    </Button>
                  ) : null}
                </div>
              );
            })}
          </section>

          <section className='mb-5'>
            <SectionTitle>{t('dimensions')}</SectionTitle>
            {DIM_KEYS.map(({ key, labelKey }) => {
              const value = tp.dims[key];
              return (
                <div key={key} className='mb-2 flex items-center gap-2.5'>
                  <span className='w-[128px] shrink-0 text-xs font-medium text-[var(--pv2-mut)]'>
                    {t(labelKey)}
                  </span>
                  <span className='h-[7px] flex-1 overflow-hidden rounded-full bg-[var(--pv2-canvas)]'>
                    <i
                      className='block h-full rounded-full'
                      style={{
                        width: `${value}%`,
                        background: scoreColor(value),
                      }}
                    />
                  </span>
                  <span
                    className='text-2xs w-[30px] shrink-0 text-right font-semibold'
                    style={{ color: scoreColor(value) }}
                  >
                    {value}
                  </span>
                </div>
              );
            })}
          </section>

          <section className='mb-5'>
            <SectionTitle>
              {t('findingsTitle', { count: tp.findings.length })}
            </SectionTitle>
            {tp.findings.map(finding => {
              const tone = FINDING_TONE[finding.severity];
              return (
                <div
                  key={finding.text}
                  className={cn(
                    'mb-2 flex gap-2.5 rounded-[var(--pv2-r-sm)] border px-3 py-2.5 text-xs leading-relaxed text-[var(--pv2-ink)]',
                    tone.box
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 h-fit shrink-0 rounded-[5px] px-1.5 py-px text-[9.5px] font-bold tracking-[0.06em]',
                      tone.chip
                    )}
                  >
                    {finding.severity === 'crit'
                      ? t('sevCritical')
                      : finding.severity === 'warn'
                        ? t('sevWarning')
                        : t('sevStrength')}
                  </span>
                  <span>{finding.text}</span>
                </div>
              );
            })}
          </section>

          <section>
            <SectionTitle>{t('recommendation')}</SectionTitle>
            <div className='rounded-[var(--pv2-r)] border border-[color-mix(in_srgb,var(--pv2-electric)_25%,var(--pv2-hair))] bg-[var(--pv2-electric-soft)] px-3.5 py-3 text-xs leading-relaxed text-[var(--pv2-ink)]'>
              <b className='text-2xs mb-1.5 flex items-center gap-1.5 font-bold tracking-[0.08em] text-[var(--pv2-electric)] uppercase'>
                ◆ {t('nextBestAction')}
              </b>
              {tp.recommendation}
            </div>
          </section>
        </div>

        <footer className='flex shrink-0 gap-2.5 border-t border-[var(--pv2-hair)] px-5 py-3.5'>
          <Button
            variant='ghost'
            className='flex-1'
            onClick={() => toast(t('toastOpportunity'))}
          >
            {t('createOpportunity')}
          </Button>
          <Button
            variant='primary'
            className='flex-1'
            onClick={() => toast(t('toastViewLive'))}
          >
            {t('viewLive')}
          </Button>
        </footer>
      </aside>
    </>
  );
};
