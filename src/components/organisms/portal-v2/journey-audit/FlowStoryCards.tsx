'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { formatCount } from '@/lib/portal-v2/format';

export type FlowStorySummary = {
  entryCount: number;
  entryVolume: number;
  hubName: string;
  hubInbound: number;
  hubDownstream: number;
  hubArrive: number;
  worstName: string;
  worstLeave: number;
  worstLeavePct: number;
  brokenNotes: string[];
  weakNotes: string[];
  loopCount: number;
  loopVolume: number;
  loopNames: string[];
};

/** Story panel 4 card dưới flow map — cửa vào, hub, leak lớn nhất, loop. */
export const FlowStoryCards = ({ story }: { story: FlowStorySummary }) => {
  const t = useTranslations('portalV2.journeyAudit');
  const card =
    'rounded-[var(--pv2-r)] border bg-[var(--pv2-paper)] px-4 py-3.5';
  return (
    <div className='mt-4 grid gap-3.5 md:grid-cols-2 xl:grid-cols-4'>
      <div className={cn(card, 'border-[var(--pv2-hair)]')}>
        <h4 className='mb-1.5 font-[family-name:var(--pv2-disp)] text-[15px] font-bold text-[var(--pv2-ink)]'>
          {t('storyEntryTitle', {
            count: story.entryCount,
            volume: formatCount(story.entryVolume),
          })}
        </h4>
        <p className='text-xs leading-relaxed text-[var(--pv2-mut)]'>
          {t('storyEntryBody', { count: story.entryCount })}
        </p>
      </div>
      <div className={cn(card, 'border-[var(--pv2-hair)]')}>
        <h4 className='mb-1.5 font-[family-name:var(--pv2-disp)] text-[15px] font-bold text-[var(--pv2-ink)]'>
          {t('storyHubTitle', { name: story.hubName })}
        </h4>
        <p className='text-xs leading-relaxed text-[var(--pv2-mut)]'>
          {t('storyHubBody', {
            inbound: story.hubInbound,
            downstream: story.hubDownstream,
            volume: formatCount(story.hubArrive),
          })}
        </p>
      </div>
      <div
        className={cn(
          card,
          'border-[color-mix(in_srgb,var(--pv2-error)_30%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_3%,var(--pv2-paper))]'
        )}
      >
        <h4 className='mb-1.5 font-[family-name:var(--pv2-disp)] text-[15px] font-bold text-[var(--pv2-ink)]'>
          {t('storyLeakTitle', { name: story.worstName })}
        </h4>
        <p className='text-xs leading-relaxed text-[var(--pv2-mut)]'>
          {t('storyLeakBody', {
            volume: formatCount(story.worstLeave),
            pct: story.worstLeavePct,
          })}
          {story.brokenNotes.length
            ? ` ${t('storyLeakBroken', { notes: story.brokenNotes.join('; ') })}`
            : ''}
          {story.weakNotes.length
            ? ` ${t('storyLeakWeak', { notes: story.weakNotes.join('; ') })}`
            : ''}
        </p>
      </div>
      <div
        className={cn(
          card,
          story.loopCount
            ? 'border-[color-mix(in_srgb,var(--pv2-success)_30%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-success)_3%,var(--pv2-paper))]'
            : 'border-[color-mix(in_srgb,var(--pv2-error)_30%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_3%,var(--pv2-paper))]'
        )}
      >
        <h4 className='mb-1.5 font-[family-name:var(--pv2-disp)] text-[15px] font-bold text-[var(--pv2-ink)]'>
          {t('storyLoopsTitle', {
            count: story.loopCount,
            volume: formatCount(story.loopVolume),
          })}
        </h4>
        <p className='text-xs leading-relaxed text-[var(--pv2-mut)]'>
          {story.loopCount
            ? t('storyLoopsBody', {
                volume: formatCount(story.loopVolume),
                names: story.loopNames.join(', '),
              })
            : t('storyNoLoops')}
        </p>
      </div>
    </div>
  );
};
