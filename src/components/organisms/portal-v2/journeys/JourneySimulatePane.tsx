'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { FilterChips } from '@/components/molecules/portal-v2/FilterChips';
import { cn } from '@/lib/cn';
import { formatCount, formatLift } from '@/lib/portal-v2/experiences/helpers';
import {
  JOURNEY_KINDS,
  JOURNEY_KIND_STYLE,
  JOURNEY_SEGMENTS,
  segmentById,
} from '@/lib/portal-v2/journeys/constants';
import { walkJourney } from '@/lib/portal-v2/journeys/helpers';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type JourneySimulatePaneProps = {
  journey: Journey;
  /** The whole list: a blueprint's numbers are its copies' numbers. */
  journeys: Journey[];
};

export const JourneySimulatePane = ({
  journey,
  journeys,
}: JourneySimulatePaneProps) => {
  const t = useTranslations('portalV2.journeys');
  const [segId, setSegId] = useState<string>('all');

  const stages = useMemo(
    () => walkJourney(journeys, journey, segId),
    [journeys, journey, segId]
  );

  const peak = stages.reduce((max, s) => Math.max(max, s.reached ?? 0), 0);
  const hasNumbers = stages.some(s => s.reached !== null);
  const segment = segmentById(segId);

  const options = [
    { id: 'all', label: t('segmentAll') },
    ...JOURNEY_SEGMENTS.map(s => ({ id: s.id, label: s.n })),
  ];

  return (
    <div>
      <FilterChips inline options={options} value={segId} onChange={setSegId} />

      {segment ? (
        <p className='mt-2.5 max-w-[68ch] text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
          {segment.want}
        </p>
      ) : null}

      {!hasNumbers ? (
        <div className='mt-4 rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-8 py-12 text-center'>
          <p className='text-[14px] font-semibold text-[var(--pv2-ink)]'>
            {t('noRunTitle')}
          </p>
          <p className='mt-1.5 text-[13px] text-[var(--pv2-faint)]'>
            {t('noRunHint')}
          </p>
        </div>
      ) : (
        <>
          <div className='mt-4 flex flex-col gap-2'>
            {stages.map(stage => {
              const style = JOURNEY_KIND_STYLE[stage.node.kind];

              if (stage.node.kind !== 'experience') {
                return (
                  <div
                    key={stage.node.id}
                    className='flex items-center gap-2 py-px text-[11.5px] text-[var(--pv2-faint)]'
                  >
                    <span
                      className='size-1.5 shrink-0 rounded-full'
                      style={{ background: style.dot }}
                      aria-hidden
                    />
                    <span className='font-semibold text-[var(--pv2-mut)]'>
                      {stage.node.name}
                    </span>
                    <span>· {JOURNEY_KINDS[stage.node.kind].name}</span>
                  </div>
                );
              }

              const pct =
                peak && stage.reached ? (stage.reached / peak) * 100 : 0;

              return (
                <div
                  key={stage.node.id}
                  className='grid items-center gap-3 sm:grid-cols-[190px_minmax(0,1fr)_76px]'
                >
                  <div className='min-w-0'>
                    <b className='block truncate text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
                      {stage.node.name}
                    </b>
                    <span className='block truncate text-[10.5px] text-[var(--pv2-faint)]'>
                      {stage.node.xName ?? t('inspectorNoLink')}
                    </span>
                  </div>

                  <div className='h-[9px] overflow-hidden rounded-full bg-[var(--pv2-canvas)]'>
                    <span
                      className='block h-full rounded-full bg-[var(--pv2-violet)]'
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className='text-left sm:text-right'>
                    {stage.reached === null ? (
                      <span className='text-[11px] text-[var(--pv2-faint)]'>
                        {t('stageUnrun')}
                      </span>
                    ) : (
                      <>
                        <span className='block font-[family-name:var(--pv2-disp)] text-[13px] font-bold text-[var(--pv2-ink)] tabular-nums'>
                          {formatCount(stage.reached)}
                        </span>
                        {stage.stats ? (
                          <span
                            className={cn(
                              'block text-[10.5px] font-semibold tabular-nums',
                              stage.stats.lift >= 0
                                ? 'text-[#0e9d6e]'
                                : 'text-[#9a2436]'
                            )}
                          >
                            {formatLift(stage.stats.lift)}
                          </span>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className='mt-4 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3 py-2.5 text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
            {t('walkNote')}
          </p>
        </>
      )}
    </div>
  );
};
