'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { cn } from '@/lib/cn';
import {
  JOURNEY_KINDS,
  JOURNEY_KIND_ORDER,
  JOURNEY_KIND_STYLE,
} from '@/lib/portal-v2/journeys/constants';
import { BAND_W, NODE_W } from '@/lib/portal-v2/journeys/stages';
import type { JourneyNodeKind } from '@/lib/portal-v2/journeys/types';

/**
 * Adding a card, asked in the place the answer will land.
 *
 * The old left rail asked "which kind?" and left the author to drag the result
 * somewhere meaningful. In a floor with phases the question is always "what
 * happens in THIS phase", so the button lives at the foot of the column and the
 * new card appears directly above it. Kind and place, one gesture.
 *
 * THE PHASE'S NATURAL KIND LEADS. The first column is where shoppers arrive, so
 * it offers an entry first; everywhere else the answer is almost always a page,
 * so it offers an experience. The rest of the vocabulary follows underneath,
 * each with the one-line definition the rail used to teach.
 */

const GUTTER = (BAND_W - NODE_W) / 2;

type StageAddProps = {
  stage: number;
  name: string;
  /** Floor y of the foot of this column. */
  top: number;
  open: boolean;
  onToggle: (stage: number | null) => void;
};

/** The button. Lives on the floor, so it sits with the column it belongs to. */
export const StageAdd = ({
  stage,
  name,
  top,
  open,
  onToggle,
}: StageAddProps) => {
  const t = useTranslations('portalV2.journeys');

  return (
    <Button
      variant='dashed'
      size='sm'
      aria-expanded={open}
      title={t('stageAddCardAria', { name })}
      onPointerDown={e => e.stopPropagation()}
      onClick={() => onToggle(open ? null : stage)}
      className='absolute'
      style={{
        left: stage * BAND_W + GUTTER,
        top,
        width: NODE_W,
      }}
    >
      <Plus className='size-3' strokeWidth={2.6} aria-hidden />
      {t('stageAddCard', { name })}
    </Button>
  );
};

type KindFlyoutProps = {
  stage: number;
  name: string;
  /** Viewport position of the button this hangs from. */
  at: { left: number; top: number };
  onPick: (kind: JourneyNodeKind, stage: number) => void;
  onClose: () => void;
};

/**
 * The kind chooser. Viewport space, because a menu that scales with the zoom is
 * unreadable at 40% and absurd at 180%.
 */
export const KindFlyout = ({
  stage,
  name,
  at,
  onPick,
  onClose,
}: KindFlyoutProps) => {
  const t = useTranslations('portalV2.journeys');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const away = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      onClose();
    };
    /* Deferred a tick: the pointerdown that OPENED this would otherwise close
       it again on the very same gesture. */
    const timer = window.setTimeout(() => {
      window.addEventListener('pointerdown', away);
    }, 0);
    window.addEventListener('keydown', key, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', away);
      window.removeEventListener('keydown', key, true);
    };
  }, [onClose]);

  const lead: JourneyNodeKind = stage === 0 ? 'entry' : 'experience';
  const kinds = [lead, ...JOURNEY_KIND_ORDER.filter(kind => kind !== lead)];

  return (
    <div
      ref={panelRef}
      role='menu'
      aria-label={t('stageFlyTitle', { name })}
      className={cn(
        'absolute z-20 w-[236px] overflow-hidden rounded-[var(--pv2-r)] bg-[var(--pv2-paper)] p-1',
        'shadow-[var(--pv2-sh-soft)]'
      )}
      style={at}
      onPointerDown={e => e.stopPropagation()}
    >
      <p className='px-2 pt-1.5 pb-1 text-[10px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
        {t('stageFlyTitle', { name })}
      </p>

      {kinds.map(kind => {
        const meta = JOURNEY_KINDS[kind];
        const style = JOURNEY_KIND_STYLE[kind];

        return (
          <button
            key={kind}
            type='button'
            role='menuitem'
            onClick={() => onPick(kind, stage)}
            className={cn(
              'flex w-full cursor-pointer items-start gap-2.5 rounded-[var(--pv2-r-sm)] px-2 py-1.5 text-left',
              'transition-colors hover:bg-[var(--pv2-canvas)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
            )}
          >
            <span
              className='mt-[3px] size-2.5 shrink-0 rounded-full'
              style={{ background: style.dot }}
              aria-hidden
            />
            <span className='min-w-0 flex-1'>
              <span className='block text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
                {meta.name}
              </span>
              <span className='mt-0.5 block text-[10.5px] leading-snug text-[var(--pv2-faint)]'>
                {meta.d}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
