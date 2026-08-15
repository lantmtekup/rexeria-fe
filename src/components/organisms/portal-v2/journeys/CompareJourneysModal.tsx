'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { JourneyCover } from '@/components/organisms/portal-v2/journeys/JourneyCover';
import { cn } from '@/lib/cn';
import { formatCount, formatLift } from '@/lib/portal-v2/experiences/helpers';
import { journeyHome, journeyStats } from '@/lib/portal-v2/journeys/helpers';
import type {
  Journey,
  JourneyCompareResult,
} from '@/lib/portal-v2/journeys/types';
import { fetchJourneyCompare } from '@/services/portal-v2/journeyMeasured';

type CompareJourneysModalProps = {
  journeys: Journey[];
  onClose: () => void;
  onOpenJourney: (id: string) => void;
};

const rowShell = cn(
  'flex w-full cursor-pointer items-center gap-3 rounded-[var(--pv2-r-sm)] border px-3 py-2.5 text-left transition-colors'
);

export const CompareJourneysModal = ({
  journeys,
  onClose,
  onOpenJourney,
}: CompareJourneysModalProps) => {
  const t = useTranslations('portalV2.journeys');
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<JourneyCompareResult | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const runCompare = async () => {
    if (selected.length !== 2) return;
    setLoading(true);
    const res = await fetchJourneyCompare(selected[0]!, selected[1]!);
    setLoading(false);
    setResult(res);
  };

  const journeyA = journeys.find(j => j.id === selected[0]);
  const journeyB = journeys.find(j => j.id === selected[1]);

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={t('compareTitle')}
      subtitle={t('compareSubtitle')}
      footer={
        result ? (
          <>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setResult(null);
              }}
            >
              {t('comparePickAgain')}
            </Button>
            <span className='flex-1' />
            <Button variant='ghost' size='sm' onClick={onClose}>
              {t('close')}
            </Button>
          </>
        ) : (
          <>
            <span className='text-[11.5px] text-[var(--pv2-faint)]'>
              {selected.length === 0
                ? t('comparePickTwo')
                : selected.length === 1
                  ? t('comparePickOneMore')
                  : t('comparePickReady')}
            </span>
            <span className='flex-1' />
            <Button variant='ghost' size='sm' onClick={onClose}>
              {t('close')}
            </Button>
            <Button
              size='sm'
              disabled={selected.length !== 2 || loading}
              onClick={() => void runCompare()}
            >
              {t('compareTheTwo')}
            </Button>
          </>
        )
      }
    >
      {result && journeyA && journeyB ? (
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[520px] border-collapse text-[12.5px]'>
            <thead>
              <tr>
                <th className='w-[140px]' />
                {[journeyA, journeyB].map(j => (
                  <th key={j.id} className='px-3 pb-3 text-left'>
                    <button
                      type='button'
                      onClick={() => onOpenJourney(j.id)}
                      className='cursor-pointer text-left font-semibold text-[var(--pv2-violet)] hover:underline'
                    >
                      {j.name}
                    </button>
                    <p className='mt-0.5 text-[11px] font-normal text-[var(--pv2-faint)]'>
                      {journeyHome(j)}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: t('compareRowSessions'),
                  a: formatCount(result.a.sessions),
                  b: formatCount(result.b.sessions),
                },
                {
                  label: t('compareRowCompletion'),
                  a: result.a.measured
                    ? `${(result.a.completionRate * 100).toFixed(1)}%`
                    : t('compareNotRun'),
                  b: result.b.measured
                    ? `${(result.b.completionRate * 100).toFixed(1)}%`
                    : t('compareNotRun'),
                },
                {
                  label: t('compareRowConfidence'),
                  a: result.a.confidenceTier,
                  b: result.b.confidenceTier,
                },
              ].map(row => (
                <tr
                  key={row.label}
                  className='border-t border-[var(--pv2-hair)]'
                >
                  <td className='py-2.5 text-[11px] font-bold tracking-[0.05em] text-[var(--pv2-faint)] uppercase'>
                    {row.label}
                  </td>
                  <td className='px-3 py-2.5 tabular-nums'>{row.a}</td>
                  <td className='px-3 py-2.5 tabular-nums'>{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {result.stages.length ? (
            <>
              <h3 className='mt-5 mb-2 font-[family-name:var(--pv2-disp)] text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
                {t('compareStagesTitle')}
              </h3>
              <div className='flex flex-col gap-1'>
                {result.stages.map(s => (
                  <div
                    key={s.key}
                    className='flex items-center gap-3 text-[12px] tabular-nums'
                  >
                    <span className='w-[120px] truncate text-[var(--pv2-mut)]'>
                      {s.key}
                    </span>
                    <span>{formatCount(s.aSessions)}</span>
                    <span className='text-[var(--pv2-faint)]'>→</span>
                    <span>{formatCount(s.bSessions)}</span>
                    <span
                      className={cn(
                        'font-semibold',
                        s.delta >= 0 ? 'text-[#0e9d6e]' : 'text-[#9a2436]'
                      )}
                    >
                      {s.delta >= 0 ? '+' : '−'}
                      {formatCount(Math.abs(s.delta))}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : loading ? (
        <p className='py-8 text-center text-[13px] text-[var(--pv2-faint)]'>
          {t('compareLoading')}
        </p>
      ) : (
        <div className='flex flex-col gap-1.5'>
          {journeys.map(j => {
            const isSelected = selected.includes(j.id);
            const stats = journeyStats(journeys, j);
            return (
              <button
                key={j.id}
                type='button'
                onClick={() => toggle(j.id)}
                className={cn(
                  rowShell,
                  isSelected
                    ? 'border-[var(--pv2-violet)] bg-[color-mix(in_srgb,var(--pv2-violet)_6%,transparent)]'
                    : 'border-[var(--pv2-hair)] bg-[var(--pv2-paper)] hover:border-[var(--pv2-mut)]'
                )}
              >
                <div className='size-8 shrink-0 overflow-hidden rounded-[6px]'>
                  <JourneyCover />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
                    {j.name}
                  </p>
                  <p className='truncate text-[11px] text-[var(--pv2-faint)]'>
                    {journeyHome(j)}
                  </p>
                </div>
                {stats ? (
                  <span
                    className={cn(
                      'shrink-0 text-[11.5px] font-bold tabular-nums',
                      stats.lift >= 0 ? 'text-[#0e9d6e]' : 'text-[#9a2436]'
                    )}
                  >
                    {formatLift(stats.lift)}
                  </span>
                ) : (
                  <span className='shrink-0 text-[10.5px] text-[var(--pv2-faint)] uppercase'>
                    {t('notYetRun')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
};
