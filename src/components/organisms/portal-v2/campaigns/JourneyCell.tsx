'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import {
  stageFitExact,
  type SubjectLane,
  type SubjectLaneCard,
} from '@/lib/portal-v2/campaigns/subjectLane';
import { JOURNEY_KIND_STYLE } from '@/lib/portal-v2/journeys/constants';
import type { JourneyNodeKind } from '@/lib/portal-v2/journeys/types';

type JourneyCellProps = {
  lane: SubjectLane;
  subjectKind: 'product' | 'topic';
  /** Opens the product lens on the campaign journey (prototype `jpjourney`). */
  onOpen?: () => void;
  /** Optional — focus a stage when the lens opens. */
  onNodeClick?: (nodeId: string) => void;
};

const dotBase =
  'inline-block size-[9px] shrink-0 rounded-full transition-colors';

/**
 * `.jcell` — the route in miniature (prototype `journeyCell`, :26234).
 *
 * Clicking the cell (or a dot) opens the subject's lens on the journey editor —
 * not the item modal. That split matches demo-v3: the row is the route, the
 * subject column is where you edit the work.
 */
export const JourneyCell = ({
  lane,
  subjectKind,
  onOpen,
  onNodeClick,
}: JourneyCellProps) => {
  const t = useTranslations('portalV2.campaigns');

  if (!lane.journey) {
    return (
      <span className='text-[11.5px] text-[var(--pv2-faint)]'>
        {t('jcellNoJourney')}
      </span>
    );
  }

  const expCards = lane.cards.filter(
    card => card.node.kind === 'experience' && card.node.x
  );
  const exact = expCards.filter(card => stageFitExact(card.fit)).length;
  const expTot = expCards.length;

  const openCard = lane.cards.find(
    card =>
      card.node.kind === 'experience' &&
      card.node.x &&
      !card.mine &&
      !card.other
  );

  const subline = openCard
    ? t('jcellNextUnbuilt', { name: openCard.node.name })
    : exact === expTot
      ? t('jcellEveryMatch', {
          kind:
            subjectKind === 'product'
              ? t('jcellKindProduct')
              : t('jcellKindSubject'),
        })
      : t('jcellMatchEdit', { exact, edit: expTot - exact });

  const offSuffix = lane.off.length
    ? t('jcellOffJourney', { count: lane.off.length })
    : null;

  const ariaSummary = offSuffix ? `${subline} ${offSuffix}` : subline;
  const interactive = Boolean(onOpen);

  const handleCellClick = () => {
    onOpen?.();
  };

  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (onNodeClick) {
      onNodeClick(nodeId);
      return;
    }
    onOpen?.();
  };

  return (
    <button
      type='button'
      disabled={!interactive}
      onClick={handleCellClick}
      className={cn(
        'flex min-w-[230px] flex-col gap-1.5 text-left',
        interactive &&
          'cursor-pointer rounded-[6px] transition-colors hover:bg-[var(--pv2-canvas)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
      )}
      aria-label={t('jcellOpenLens', {
        journey: lane.journey.name,
        summary: ariaSummary,
      })}
    >
      <span className='text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
        {lane.journey.name}
      </span>

      <span className='flex items-center' aria-hidden>
        {lane.cards.map((card, index) => (
          <span key={card.node.id} className='flex items-center'>
            {index > 0 ? (
              <span className='mx-0.5 h-px w-2 bg-[var(--pv2-hair)]' />
            ) : null}
            <JourneyDot
              card={card}
              interactive={interactive}
              onClick={e => handleNodeClick(e, card.node.id)}
            />
          </span>
        ))}
      </span>

      <span className='text-[11px] leading-snug'>
        <span
          className={cn(
            'font-semibold',
            openCard || exact < expTot
              ? 'text-[color-mix(in_srgb,var(--pv2-error)_82%,var(--pv2-ink))]'
              : 'text-[color-mix(in_srgb,var(--pv2-success)_82%,var(--pv2-ink))]'
          )}
        >
          {subline}
        </span>
        {offSuffix ? (
          <span className='ml-1 font-medium text-[var(--pv2-faint)]'>
            {offSuffix}
          </span>
        ) : null}
      </span>
    </button>
  );
};

const JourneyDot = ({
  card,
  interactive,
  onClick,
}: {
  card: SubjectLaneCard;
  interactive: boolean;
  onClick: (e: React.MouseEvent) => void;
}) => {
  const t = useTranslations('portalV2.journeys');
  const { node, mine, other, fit, label } = card;
  const kind = node.kind as JourneyNodeKind;
  const style = JOURNEY_KIND_STYLE[kind] ?? JOURNEY_KIND_STYLE.experience;

  const title = label
    ? `${node.name} · ${label.ok ? '✓' : '!'} ${t(label.labelKey)}`
    : node.name;

  const dotClass = (() => {
    if (node.kind !== 'experience' || !node.x) {
      return cn(dotBase, 'opacity-40');
    }
    if (stageFitExact(fit)) {
      return cn(
        dotBase,
        'bg-[var(--pv2-success)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--pv2-success)_22%,transparent)]'
      );
    }
    if (!mine && !other) {
      return cn(
        dotBase,
        'bg-[var(--pv2-paper)] ring-2 ring-inset ring-[color-mix(in_srgb,var(--pv2-error)_65%,transparent)]'
      );
    }
    return cn(
      dotBase,
      'bg-[color-mix(in_srgb,var(--pv2-error)_78%,var(--pv2-ink))]',
      'shadow-[0_0_0_2px_color-mix(in_srgb,var(--pv2-error)_18%,transparent)]'
    );
  })();

  if (!interactive) {
    return (
      <span
        className={dotClass}
        style={
          node.kind !== 'experience' || !node.x
            ? { background: style.dot }
            : undefined
        }
        title={title}
      />
    );
  }

  return (
    <span
      role='presentation'
      onClick={onClick}
      className={cn(dotClass, 'cursor-pointer hover:scale-110')}
      style={
        node.kind !== 'experience' || !node.x
          ? { background: style.dot }
          : undefined
      }
      title={title}
    />
  );
};

/** The route summary shown once, above the work table. */
export const JourneyCellLegend = ({
  journeyName,
}: {
  journeyName: string | null;
}) => {
  const t = useTranslations('portalV2.campaigns');
  if (!journeyName) return null;
  return (
    <span className='inline-flex items-center gap-1.5 text-[12px] text-[var(--pv2-mut)]'>
      {t('jcellLegend', { name: journeyName })}
    </span>
  );
};
