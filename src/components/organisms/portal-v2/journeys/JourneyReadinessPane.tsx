'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { JourneyArchitectCard } from '@/components/organisms/portal-v2/journeys/JourneyArchitectCard';
import { JourneyCheckRow } from '@/components/organisms/portal-v2/journeys/JourneyCheckRow';
import { cn } from '@/lib/cn';
import {
  JOURNEY_KINDS,
  READINESS_BANDS,
} from '@/lib/portal-v2/journeys/constants';
import {
  journeyGaps,
  journeyReadiness,
} from '@/lib/portal-v2/journeys/helpers';
import type {
  Journey,
  JourneyEditorPendingAction,
  JourneyReview,
} from '@/lib/portal-v2/journeys/types';

type JourneyReadinessPaneProps = {
  journey: Journey;
  review: JourneyReview | null;
  onApplyArchitect: (action: JourneyEditorPendingAction) => void;
};

const bandColour = (score: number) => {
  if (score >= READINESS_BANDS.ok) return 'var(--pv2-success)';
  if (score >= READINESS_BANDS.warn) return 'var(--pv2-warning)';
  return 'var(--pv2-error)';
};

export const JourneyReadinessPane = ({
  journey,
  review,
  onApplyArchitect,
}: JourneyReadinessPaneProps) => {
  const t = useTranslations('portalV2.journeys');
  const readiness = useMemo(() => journeyReadiness(journey), [journey]);
  const gaps = useMemo(() => journeyGaps(journey), [journey]);
  const isReady = readiness.missing.length === 0;
  /* Đã sẵn sàng thì checklist đóng mặc định — không cần đọc lại thứ đã qua. */
  const [showChecklist, setShowChecklist] = useState(!isReady);

  return (
    <div>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
        <span
          className='font-[family-name:var(--pv2-disp)] text-[1.75rem] font-bold tabular-nums'
          style={{ color: bandColour(readiness.score) }}
        >
          {readiness.score}%
        </span>
        <div className='min-w-[180px] flex-1'>
          <div className='h-2 overflow-hidden rounded-full bg-[var(--pv2-canvas)]'>
            <span
              className='block h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none'
              style={{
                width: `${readiness.score}%`,
                background: bandColour(readiness.score),
              }}
            />
          </div>
          <p className='mt-1.5 text-[12px] text-[var(--pv2-mut)]'>
            {readiness.missing.length
              ? t('readyMissing', { count: readiness.missing.length })
              : t('readyAll')}
          </p>
        </div>
      </div>

      {isReady ? (
        <button
          type='button'
          onClick={() => setShowChecklist(v => !v)}
          className='mt-4 cursor-pointer text-[12px] font-semibold text-[var(--pv2-violet)] hover:underline'
        >
          {showChecklist ? t('hideChecklist') : t('showChecklist')}
        </button>
      ) : null}

      {showChecklist ? (
        <div className='mt-3 flex flex-col gap-1.5 border-t border-[var(--pv2-hair)] pt-4'>
          {readiness.checks.map(check => (
            <JourneyCheckRow key={check.msg} check={check} />
          ))}
        </div>
      ) : null}

      <h3 className='mt-6 font-[family-name:var(--pv2-disp)] text-[15px] font-semibold text-[var(--pv2-ink)]'>
        {t('readyNeedsTitle')}
      </h3>

      {gaps.length ? (
        <div className='mt-2'>
          {gaps.map(gap => (
            <div
              key={`${gap.node.id}-${gap.need}`}
              className={cn(
                'flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--pv2-hair)] py-2',
                'text-[12px] last:border-b-0'
              )}
            >
              <b className='min-w-[150px] text-[12px] font-semibold text-[var(--pv2-ink)]'>
                {gap.node.name}
              </b>
              <span className='text-[10.5px] font-bold tracking-[0.05em] text-[var(--pv2-faint)] uppercase'>
                {JOURNEY_KINDS[gap.node.kind].name}
              </span>
              <span className='text-[var(--pv2-mut)]'>{gap.need}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className='mt-2 text-[12.5px] text-[var(--pv2-mut)]'>
          {t('readyNeedsNone')}
        </p>
      )}

      <JourneyArchitectCard review={review} onApply={onApplyArchitect} />
    </div>
  );
};
