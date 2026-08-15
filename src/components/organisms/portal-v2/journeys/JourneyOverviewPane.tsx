'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { objectivePillStyle } from '@/lib/portal-v2/experiences/roleStyles';
import { JOURNEY_OBJECTIVES } from '@/lib/portal-v2/journeys/constants';
import {
  copiesOfJourney,
  countNodesOfKind,
  findJourney,
  journeyHome,
} from '@/lib/portal-v2/journeys/helpers';
import type { PersonaOption } from '@/services/portal-v2/journeyAudience';
import type { Journey, JourneyBenchmark } from '@/lib/portal-v2/journeys/types';

type JourneyOverviewPaneProps = {
  journey: Journey;
  journeys: Journey[];
  /** Chân dung của brand — `brand_profiles.audience`. */
  personas?: PersonaOption[];
  /** "The standard" — chỉ có khi journey/blueprint gốc của nó đã có bản copy chạy. */
  benchmark?: JourneyBenchmark | null;
  onOpenJourney: (id: string) => void;
};

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className='grid gap-1 border-b border-[var(--pv2-hair)] py-3.5 last:border-b-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4'>
    <span className='pt-0.5 text-[11px] font-bold tracking-[0.05em] text-[var(--pv2-faint)] uppercase'>
      {label}
    </span>
    <div className='min-w-0 text-[13.5px] leading-relaxed text-[var(--pv2-ink)]'>
      {children}
    </div>
  </div>
);

export const JourneyOverviewPane = ({
  journey,
  journeys,
  personas = [],
  benchmark = null,
  onOpenJourney,
}: JourneyOverviewPaneProps) => {
  const t = useTranslations('portalV2.journeys');
  const pill = objectivePillStyle(journey.obj);
  const objectiveLabelKey =
    JOURNEY_OBJECTIVES.find(o => o.id === journey.obj)?.labelKey ??
    'objInsight';
  // Chân dung do người soạn chọn; tên lấy từ hồ sơ brand chứ không suy ra.
  const persona = personas.find(p => p.id === journey.personaId) ?? null;
  const copies = copiesOfJourney(journeys, journey);
  const origin = findJourney(journeys, journey.origin);
  const stageTargetEntries = Object.entries(journey.stageTargets ?? {});
  const hasPlan =
    typeof journey.target === 'number' || stageTargetEntries.length > 0;
  // Node "khách nhìn thấy" — entry/experience/outcome; decision/action là node
  // hệ thống, không cần nội dung riêng để hiển thị cho khách.
  const facingNodes = journey.nodes.filter(n =>
    (['entry', 'experience', 'outcome'] as const).includes(
      n.kind as 'entry' | 'experience' | 'outcome'
    )
  );
  const withContent = facingNodes.filter(n =>
    n.kind === 'experience' ? Boolean(n.xName) : Boolean(n.d)
  );
  const contextCoverage = {
    withCtx: withContent.length,
    facing: facingNodes.length,
  };

  return (
    <div>
      <Row label={t('overName')}>
        <p className='font-[family-name:var(--pv2-disp)] font-semibold'>
          {journey.name}
        </p>
        <p className='mt-0.5 text-[12.5px] text-[var(--pv2-mut)]'>
          {journey.tagline}
        </p>
      </Row>

      <Row label={t('overDescription')}>
        <p className='max-w-[68ch] text-[var(--pv2-slate-500)]'>
          {journey.summary}
        </p>
      </Row>

      <Row label={t('overObjective')}>
        <span
          className='inline-flex rounded-full px-2.5 py-1 text-[9.5px] font-extrabold tracking-[0.05em] uppercase'
          style={{ background: pill.bg, color: pill.fg }}
        >
          {t(objectiveLabelKey)}
        </span>
      </Row>

      <Row label={t('overAudience')}>
        <p className='font-medium'>
          {persona ? persona.name : t('segmentAll')}
        </p>
        {persona ? (
          <p className='mt-0.5 max-w-[62ch] text-[12.5px] text-[var(--pv2-mut)]'>
            {t('personaBehaves', { seg: persona.behaves || '—' })}
          </p>
        ) : null}
      </Row>

      {!journey.template && journey.campaignName ? (
        <Row label={t('overCampaign')}>
          <p className='font-medium'>{journey.campaignName}</p>
        </Row>
      ) : null}

      <Row label={t('overProvenance')}>
        {journey.template ? (
          <>
            <p>
              {copies.length
                ? t('provenanceCopies', { count: copies.length })
                : t('provenanceNoCopies')}
            </p>
            {benchmark ? (
              <p className='mt-0.5 text-[12.5px] text-[var(--pv2-mut)]'>
                {t('provenanceStandard', {
                  cvr: benchmark.cvr.toFixed(1),
                  runs: benchmark.runs,
                })}
              </p>
            ) : null}
          </>
        ) : origin ? (
          <button
            type='button'
            onClick={() => onOpenJourney(origin.id)}
            className='cursor-pointer text-left font-medium text-[var(--pv2-violet)] hover:underline'
          >
            {t('provenanceForkedFrom', { name: origin.name })}
          </button>
        ) : (
          <p className='text-[var(--pv2-mut)]'>{t('provenanceNoOrigin')}</p>
        )}
      </Row>

      <Row label={t('overPlan')}>
        {hasPlan ? (
          <div className='flex flex-col gap-0.5 tabular-nums'>
            {typeof journey.target === 'number' ? (
              <p>
                {t('planConvertTarget', {
                  pct: (journey.target * 100).toFixed(1),
                })}
              </p>
            ) : null}
            {stageTargetEntries.map(([stageId, pct]) => {
              const stage = journey.stages?.find(s => s.id === stageId);
              return (
                <p key={stageId}>
                  {t('planStageTarget', {
                    stage: stage?.name ?? stageId,
                    pct,
                  })}
                </p>
              );
            })}
          </div>
        ) : (
          <p className='text-[var(--pv2-mut)]'>{t('planEmpty')}</p>
        )}
      </Row>

      <Row label={t('overStructure')}>
        <p className='tabular-nums'>
          {t('structureLine', {
            nodes: journey.nodes.length,
            experiences: countNodesOfKind(journey, 'experience'),
            decisions: countNodesOfKind(journey, 'decision'),
          })}
        </p>
        <p className='mt-0.5 text-[12.5px] text-[var(--pv2-mut)]'>
          {t('structureHome', { home: journeyHome(journey) })} ·{' '}
          {t('updatedAgo', { when: journey.updated })}
        </p>
        <p className='mt-0.5 text-[12.5px] text-[var(--pv2-mut)] tabular-nums'>
          {t('structureCoverage', contextCoverage)}
        </p>
      </Row>
    </div>
  );
};
