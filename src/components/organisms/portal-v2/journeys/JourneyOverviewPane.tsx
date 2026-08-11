'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { objectivePillStyle } from '@/lib/portal-v2/experiences/roleStyles';
import { JOURNEY_OBJECTIVES } from '@/lib/portal-v2/journeys/constants';
import {
  countNodesOfKind,
  journeyHome,
} from '@/lib/portal-v2/journeys/helpers';
import type { PersonaOption } from '@/services/portal-v2/journeyAudience';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type JourneyOverviewPaneProps = {
  journey: Journey;
  /** Chân dung của brand — `brand_profiles.audience`. */
  personas?: PersonaOption[];
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
  personas = [],
}: JourneyOverviewPaneProps) => {
  const t = useTranslations('portalV2.journeys');
  const pill = objectivePillStyle(journey.obj);
  const objectiveLabelKey =
    JOURNEY_OBJECTIVES.find(o => o.id === journey.obj)?.labelKey ??
    'objInsight';
  // Chân dung do người soạn chọn; tên lấy từ hồ sơ brand chứ không suy ra.
  const persona = personas.find(p => p.id === journey.personaId) ?? null;

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
      </Row>
    </div>
  );
};
