'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/portal-v2/format';
import {
  auditedTouchpoints,
  tpFlowStats,
  leaksForTouchpoint,
  scoreColor,
  scoreSoft,
  stageLeaks,
  stageScore,
  tpOffSources,
  tpState,
  type SourceStatusMap,
} from '@/lib/portal-v2/journey-audit/helpers';
import type {
  AuditDropoff,
  AuditFlow,
  AuditFlowEdge,
  AuditHandoff,
  AuditJourney,
  AuditSource,
} from '@/lib/portal-v2/journey-audit/types';
import { GhostCard } from '@/components/organisms/portal-v2/journey-audit/GhostCard';
import { TouchpointCard } from '@/components/organisms/portal-v2/journey-audit/TouchpointCard';

type JourneyBoardProps = {
  journey: AuditJourney;
  flow: AuditFlow;
  conns: AuditFlowEdge[];
  dropoff: AuditDropoff | null;
  sources: AuditSource[];
  statuses: SourceStatusMap;
  selectedTpId: string | null;
  onOpenTp: (tpId: string) => void;
  onGoLeak: (leakId: string) => void;
  onConnectSource: (providerId: string) => void;
};

const HANDOFF_TONE: Record<AuditHandoff['severity'], string> = {
  ok: 'border-[var(--pv2-success)] bg-[color-mix(in_srgb,var(--pv2-success)_10%,var(--pv2-paper))] text-[var(--pv2-success)]',
  warn: 'border-[var(--pv2-warning)] bg-[color-mix(in_srgb,var(--pv2-warning)_12%,var(--pv2-paper))] text-[color-mix(in_srgb,var(--pv2-warning)_80%,var(--pv2-ink))]',
  crit: 'border-[var(--pv2-error)] bg-[color-mix(in_srgb,var(--pv2-error)_9%,var(--pv2-paper))] text-[var(--pv2-error)]',
};

/** Board Quality: cột stage 264px + handoff connector crit/warn/ok ở giữa. */
export const JourneyBoard = ({
  journey,
  flow,
  conns,
  dropoff,
  sources,
  statuses,
  selectedTpId,
  onOpenTp,
  onGoLeak,
  onConnectSource,
}: JourneyBoardProps) => {
  const t = useTranslations('portalV2.journeyAudit');

  return (
    <div className='flex-1 overflow-auto px-5 pt-3.5 pb-6'>
      <div className='flex min-w-max items-stretch'>
        {journey.stages.map((stage, stageIndex) => {
          const avg = stageScore(stage, statuses);
          const leaks = stageLeaks(dropoff, stage);
          const stageRisk = leaks.reduce((total, leak) => total + leak.usd, 0);
          const topLeak = [...leaks].sort((a, b) => b.usd - a.usd)[0];
          const handoff =
            stageIndex < journey.stages.length - 1
              ? (journey.handoffs[stageIndex] ?? null)
              : null;

          return (
            <div key={stage.key} className='flex items-stretch'>
              <section className='flex w-[264px] shrink-0 flex-col overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
                <div className='border-b border-[var(--pv2-hair)] px-4 pt-3.5 pb-3'>
                  <div className='flex items-center gap-2 font-[family-name:var(--pv2-disp)] text-[15px] font-bold tracking-[-0.01em] text-[var(--pv2-ink)]'>
                    <span aria-hidden>{stage.icon}</span>
                    {stage.name}
                    <span
                      className='ml-auto rounded-[var(--pv2-r-sm)] px-2 py-0.5 text-xs font-semibold'
                      style={
                        avg == null
                          ? {
                              color: 'var(--pv2-faint)',
                              background: 'var(--pv2-canvas)',
                            }
                          : {
                              color: scoreColor(avg),
                              background: scoreSoft(avg),
                            }
                      }
                    >
                      {avg ?? '—'}
                    </span>
                  </div>
                  <p className='text-2xs mt-1.5 leading-relaxed text-[var(--pv2-mut)]'>
                    <span className='mb-0.5 block text-[9px] font-semibold tracking-[0.1em] text-[var(--pv2-faint)] uppercase'>
                      {t('stageObjective')}
                    </span>
                    {stage.objective}
                  </p>
                  {topLeak ? (
                    <button
                      type='button'
                      onClick={() => onGoLeak(topLeak.id)}
                      title={t('stageLossTitle')}
                      className='text-2xs mt-2 w-full rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-error)_30%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_8%,var(--pv2-paper))] px-2.5 py-1.5 text-left font-bold text-[var(--pv2-error)] transition-colors hover:bg-[color-mix(in_srgb,var(--pv2-error)_14%,var(--pv2-paper))]'
                    >
                      {t('stageLoss', { amount: formatMoney(stageRisk) })}
                    </button>
                  ) : null}
                </div>
                <div className='flex flex-1 flex-col gap-2.5 p-3'>
                  {stage.touchpoints.map(tp => {
                    const state = tpState(tp, statuses);
                    if (state === 'off') {
                      return (
                        <GhostCard
                          key={tp.id}
                          tp={tp}
                          needSources={tpOffSources(tp, sources)}
                          leaks={leaksForTouchpoint(dropoff, tp.id)}
                          onConnect={onConnectSource}
                        />
                      );
                    }
                    return (
                      <TouchpointCard
                        key={tp.id}
                        tp={tp}
                        stale={state === 'stale'}
                        selected={tp.id === selectedTpId}
                        stats={tpFlowStats(flow, conns, tp)}
                        sources={sources}
                        estimated={tp.traffic?.estimated ?? flow.estimated}
                        onOpen={() => onOpenTp(tp.id)}
                      />
                    );
                  })}
                  {auditedTouchpoints(stage, statuses).length === 0 &&
                  stage.touchpoints.length === 0 ? (
                    <p className='text-2xs px-2 py-4 text-center text-[var(--pv2-faint)]'>
                      {t('stageEmpty')}
                    </p>
                  ) : null}
                </div>
              </section>

              {handoff ? (
                <div className='relative flex w-[52px] shrink-0 flex-col items-center pt-16'>
                  <span
                    aria-hidden
                    className='absolute top-[84px] right-0 left-0 h-0.5 bg-[var(--pv2-hair)]'
                  />
                  <button
                    type='button'
                    title={handoff.note}
                    onClick={() => toast(`${handoff.label}: ${handoff.note}`)}
                    className={cn(
                      'relative z-[1] grid size-[34px] place-items-center rounded-full border-2 text-[13px] transition-transform hover:scale-110',
                      HANDOFF_TONE[handoff.severity]
                    )}
                  >
                    {handoff.severity === 'ok'
                      ? '✓'
                      : handoff.severity === 'warn'
                        ? '!'
                        : '✕'}
                  </button>
                  <span className='mt-2 text-center text-[8.5px] leading-tight font-bold tracking-[0.08em] text-[var(--pv2-faint)] uppercase'>
                    {handoff.label}
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
