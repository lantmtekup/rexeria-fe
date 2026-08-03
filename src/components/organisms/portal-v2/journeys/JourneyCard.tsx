'use client';

import { Copy, Trash2, Waypoints } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { KeyboardEvent, MouseEvent } from 'react';

import { JourneyCover } from '@/components/organisms/portal-v2/journeys/JourneyCover';
import { cn } from '@/lib/cn';
import { formatCount, formatLift } from '@/lib/portal-v2/experiences/helpers';
import { objectivePillStyle } from '@/lib/portal-v2/experiences/roleStyles';
import { JOURNEY_OBJECTIVES } from '@/lib/portal-v2/journeys/constants';
import {
  countNodesOfKind,
  journeyHome,
  journeyReadiness,
} from '@/lib/portal-v2/journeys/helpers';
import type { Journey, JourneyStats } from '@/lib/portal-v2/journeys/types';

type JourneyCardProps = {
  journey: Journey;
  stats: JourneyStats | null;
  onOpen: (journey: Journey) => void;
  onDuplicate: (journey: Journey) => void;
  onDelete: (journey: Journey) => void;
};

const cardShell = cn(
  'group flex cursor-pointer flex-col overflow-hidden rounded-[var(--pv2-r)]',
  'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
  'transition-[box-shadow,border-color] duration-[140ms]',
  'hover:border-[color-mix(in_srgb,var(--pv2-violet)_35%,var(--pv2-hair))] hover:shadow-[var(--pv2-sh-soft)]',
  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none'
);

const actionButton = cn(
  'grid size-7 cursor-pointer place-items-center rounded-[8px]',
  'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] shadow-[var(--pv2-sh-sm)]',
  'transition-colors focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
);

const objectiveLabelKey = (obj: Journey['obj']) =>
  JOURNEY_OBJECTIVES.find(o => o.id === obj)?.labelKey ?? 'objInsight';

export const JourneyCard = ({
  journey,
  stats,
  onOpen,
  onDuplicate,
  onDelete,
}: JourneyCardProps) => {
  const t = useTranslations('portalV2.journeys');
  const pill = objectivePillStyle(journey.obj);
  const readiness = journeyReadiness(journey);

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    /* The hover actions live inside the card's click target. */
    if ((e.target as HTMLElement).closest('[data-journey-action]')) return;
    onOpen(journey);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(journey);
    }
  };

  return (
    <article
      role='button'
      tabIndex={0}
      aria-label={t('openJourneyAria', { name: journey.name })}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cardShell}
    >
      <div className='relative'>
        <JourneyCover />

        <div
          className={cn(
            'absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity',
            'group-focus-within:opacity-100 group-hover:opacity-100',
            '[@media(hover:none)]:opacity-100'
          )}
        >
          <button
            type='button'
            data-journey-action='true'
            title={t('duplicate')}
            aria-label={t('duplicateAria', { name: journey.name })}
            onClick={() => onDuplicate(journey)}
            className={cn(
              actionButton,
              'text-[var(--pv2-mut)] hover:text-[var(--pv2-ink)]'
            )}
          >
            <Copy className='size-3.5' strokeWidth={2} aria-hidden />
          </button>
          <button
            type='button'
            data-journey-action='true'
            title={t('delete')}
            aria-label={t('deleteAria', { name: journey.name })}
            onClick={() => onDelete(journey)}
            className={cn(
              actionButton,
              'text-[var(--pv2-error)] hover:bg-[var(--pv2-canvas)]'
            )}
          >
            <Trash2 className='size-3.5' strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>

      {/* Three rows, one job each: what it is · how it is classified · what it
          has earned. Anything quieter than that lives in the footer. */}
      <div className='flex flex-1 flex-col gap-2.5 px-3.5 pt-3 pb-3.5'>
        <div className='flex min-w-0 flex-col gap-0.5'>
          <h3 className='truncate text-left text-[14px] font-semibold tracking-[-0.01em] text-[var(--pv2-ink)]'>
            {journey.name}
          </h3>
          <p
            className='truncate text-[11px] text-[var(--pv2-faint)]'
            title={journey.tagline}
          >
            {journey.tagline}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-1.5'>
          <span
            className='inline-flex items-center rounded-full px-2 py-[3px] text-[9.5px] font-bold tracking-[0.05em] uppercase'
            style={{ background: pill.bg, color: pill.fg }}
          >
            {t(objectiveLabelKey(journey.obj))}
          </span>

          <span
            title={journeyHome(journey)}
            className='inline-flex items-center rounded-full border border-[var(--pv2-hair)] px-2 py-[2.5px] text-[10.5px] font-medium text-[var(--pv2-mut)]'
          >
            {journey.template ? t('badgeBlueprint') : t('badgeCopy')}
          </span>
        </div>

        <div className='mt-auto flex flex-wrap items-center gap-1.5'>
          {stats ? (
            <>
              <span
                className={cn(
                  'text-[12px] font-bold tabular-nums',
                  stats.lift >= 0 ? 'text-[#0e9d6e]' : 'text-[#9a2436]'
                )}
              >
                {formatLift(stats.lift)}
              </span>
              <span className='text-[11px] text-[var(--pv2-faint)] tabular-nums'>
                {t('sessionsAssisted', { count: formatCount(stats.sessions) })}
              </span>
            </>
          ) : (
            <>
              <span
                title={t('notYetRunHint')}
                className='inline-flex cursor-help rounded-full bg-[var(--pv2-canvas)] px-2 py-[2.5px] text-[9px] font-extrabold tracking-[0.05em] text-[var(--pv2-faint)] uppercase'
              >
                {t('notYetRun')}
              </span>
              <span className='text-[11px] text-[var(--pv2-faint)] tabular-nums'>
                {t('readyScore', { score: readiness.score })}
              </span>
            </>
          )}
        </div>
      </div>

      <div className='flex items-center gap-2 border-t border-[var(--pv2-hair)] px-3.5 py-2.5 text-[11px] text-[var(--pv2-faint)]'>
        <Waypoints
          className='size-3.5 shrink-0'
          strokeWidth={2.2}
          aria-hidden
        />
        <span className='truncate'>
          {t('nodeCount', {
            nodes: journey.nodes.length,
            experiences: countNodesOfKind(journey, 'experience'),
          })}
        </span>
        <span className='flex-1' />
        <span className='shrink-0 tabular-nums'>{journey.updated}</span>
      </div>
    </article>
  );
};
