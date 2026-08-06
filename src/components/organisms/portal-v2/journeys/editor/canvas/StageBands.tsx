'use client';

import { Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import type { ViewTransform } from '@/components/organisms/portal-v2/journeys/editor/EditorCanvas';
import { cn } from '@/lib/cn';
import {
  BAND_ADD_W,
  BAND_W,
  type StagePulse,
} from '@/lib/portal-v2/journeys/stages';
import type { JourneyStage } from '@/lib/portal-v2/journeys/types';

/**
 * The phase columns: tinted stripes, and the header that names each one.
 *
 * DRAWN IN VIEWPORT SPACE, NOT ON THE FLOOR. A band is a full-height vertical
 * stripe, so only its x has anything to do with the floor — pinning the headers
 * to the top edge instead of to the top of the drawing means the phase you are
 * working in stays named however far down the column you scroll, and the label
 * stays readable at 40% zoom instead of shrinking into a smear.
 *
 * TWO EXPORTS, BECAUSE A BAND STRADDLES THE CONTENT. The stripe is backdrop and
 * has to sit UNDER the cards and routes; the header is chrome and has to sit
 * OVER them, or the floor layer swallows every click meant for it. So the
 * canvas draws `StageBands` before the floor and `StageHeaders` after it.
 *
 * The header is where a phase is edited: click the name to rename it, `✕` to
 * remove an empty one. There is no menu, because there is nothing else a phase
 * can do.
 */

const HEADER_H = 44;

type BandGeometry = {
  stages: JourneyStage[];
  view: ViewTransform;
};

const bandLeftOf = ({ view }: BandGeometry, index: number) =>
  index * BAND_W * view.zoom + view.panX;

type StageBandsProps = BandGeometry & {
  /** The band a dragged card would land in. */
  dropStage: number | null;
};

/** The stripes. Backdrop, so they are drawn under the floor and never listen. */
export const StageBands = ({ stages, view, dropStage }: StageBandsProps) => (
  <>
    {stages.map((stage, index) => (
      <div
        key={stage.id}
        className={cn(
          'pointer-events-none absolute top-0 bottom-0 transition-colors duration-150',
          /* One hairline on the right only: two adjacent bands would otherwise
             draw a two-pixel seam between them. */
          'border-r border-[var(--pv2-hair)]'
        )}
        style={{
          left: bandLeftOf({ stages, view }, index),
          width: BAND_W * view.zoom,
          /* Alternating bands are a wash over the canvas, never paper: the
             cards ARE paper, and a paper card on a paper band disappears. */
          background:
            dropStage === index
              ? 'var(--pv2-electric-soft)'
              : index % 2
                ? 'color-mix(in srgb, var(--pv2-electric) 4%, transparent)'
                : 'transparent',
        }}
      />
    ))}
  </>
);

type StageHeadersProps = BandGeometry & {
  /** Cards per phase, same order. */
  counts: number[];
  pulse: StagePulse[];
  /** False once removing another phase would stop the picture reading as one. */
  canRemove: boolean;
  /** Subject lens — names are labels, not editors. */
  readOnly?: boolean;
  onRename: (index: number, name: string) => void;
  onRemove: (index: number) => void;
  /** Append a phase to the right of the last one. */
  onAdd: () => void;
};

/** The names and their numbers. Chrome, so they are drawn over the floor. */
export const StageHeaders = ({
  stages,
  counts,
  pulse,
  view,
  canRemove,
  readOnly = false,
  onRename,
  onRemove,
  onAdd,
}: StageHeadersProps) => {
  const t = useTranslations('portalV2.journeys');

  const bandLeft = (index: number) => bandLeftOf({ stages, view }, index);

  return (
    <>
      {stages.map((stage, index) => {
        const count = counts[index] ?? 0;
        const numbers = pulse[index];

        const measured =
          numbers?.conv !== null && numbers?.conv !== undefined
            ? t('stageConv', { pct: numbers.conv.toFixed(1) })
            : numbers?.reached != null
              ? t('stageReached', { count: numbers.reached.toLocaleString() })
              : null;

        return (
          <div
            key={stage.id}
            className='absolute top-0 z-10 flex flex-col justify-center gap-0.5 overflow-hidden border-b border-[var(--pv2-hair)] bg-[var(--pv2-canvas)]/85 px-3 backdrop-blur-[2px]'
            style={{
              left: bandLeft(index),
              width: BAND_W * view.zoom,
              height: HEADER_H,
            }}
          >
            <div className='flex items-center gap-1'>
              {readOnly ? (
                <span
                  className={cn(
                    'h-[17px] min-w-0 flex-1 truncate px-1',
                    'text-[11px] leading-[17px] font-bold tracking-[0.06em] text-[var(--pv2-ink)] uppercase'
                  )}
                >
                  {stage.name}
                </span>
              ) : (
                <StageName
                  name={stage.name}
                  onCommit={name => onRename(index, name)}
                />
              )}
              {!readOnly && count === 0 && canRemove ? (
                <button
                  type='button'
                  aria-label={t('stageRemoveAria', { name: stage.name })}
                  title={t('stageRemove')}
                  onClick={() => onRemove(index)}
                  onPointerDown={e => e.stopPropagation()}
                  className={cn(
                    'grid size-[18px] shrink-0 cursor-pointer place-items-center rounded-[var(--pv2-r-sm)]',
                    'text-[var(--pv2-faint)] transition-colors',
                    'hover:bg-[color-mix(in_srgb,var(--pv2-error)_12%,transparent)] hover:text-[var(--pv2-error)]',
                    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                  )}
                >
                  <X className='size-3' strokeWidth={2.6} aria-hidden />
                </button>
              ) : null}
            </div>

            <p
              className={cn(
                'truncate text-[10.5px] leading-none',
                measured
                  ? 'font-semibold text-[var(--pv2-mut)] tabular-nums'
                  : 'text-[var(--pv2-faint)]'
              )}
            >
              {measured ??
                (count ? t('stageNodeCount', { count }) : stage.hint)}
            </p>
          </div>
        );
      })}

      {/* The next column, where the next column would go.
          Adding a phase used to live only inside the Phases dialog, which is
          the right place to RE-ORDER the spine and the wrong place to discover
          that it can grow at all. This is the end of the rail: dashed, so it
          reads as a slot rather than a phase, and fixed-size like the rest of
          the chrome so it stays legible at 40% zoom. */}
      {!readOnly ? (
        <button
          type='button'
          title={t('stageAddPhaseHint')}
          onPointerDown={e => e.stopPropagation()}
          onClick={onAdd}
          className={cn(
            'absolute top-0 z-10 flex cursor-pointer items-center gap-1.5 px-3',
            'border-b border-l border-dashed border-[var(--pv2-hair)] bg-[var(--pv2-canvas)]/85 backdrop-blur-[2px]',
            'text-[11px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase',
            'transition-colors hover:bg-[var(--pv2-electric-soft)] hover:text-[var(--pv2-electric)]',
            'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
          )}
          style={{
            left: bandLeft(stages.length),
            width: BAND_ADD_W,
            height: HEADER_H,
          }}
        >
          <Plus className='size-3.5 shrink-0' strokeWidth={2.6} aria-hidden />
          {t('stageAddPhase')}
        </button>
      ) : null}
    </>
  );
};

/**
 * The phase's name, editable where it is written.
 *
 * A controlled input rather than `contenteditable`: React and a
 * browser-managed editable node fight over the same DOM, and the loser is
 * always the caret.
 */
const StageName = ({
  name,
  onCommit,
}: {
  name: string;
  onCommit: (name: string) => void;
}) => {
  const t = useTranslations('portalV2.journeys');
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (value.trim() !== name) onCommit(value);
  };

  if (!editing) {
    return (
      <button
        type='button'
        title={t('stageRename')}
        onPointerDown={e => e.stopPropagation()}
        onClick={() => {
          setValue(name);
          setEditing(true);
        }}
        className={cn(
          'h-[17px] min-w-0 flex-1 truncate rounded-[3px] px-1 text-left',
          'text-[11px] leading-[17px] font-bold tracking-[0.06em] text-[var(--pv2-ink)] uppercase',
          'cursor-text hover:bg-[var(--pv2-paper)]',
          'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
        )}
      >
        {name}
      </button>
    );
  }

  /* The label is uppercase by CSS, not by content. Typing in a box that
     SHOUTS back is unpleasant and hides what is actually stored, so the field
     shows the word as it will be saved — and stays on the same line, at the
     same size, so nothing jumps when the caret appears. */
  return (
    <input
      ref={inputRef}
      value={value}
      aria-label={t('stageRename')}
      onChange={e => setValue(e.target.value)}
      onPointerDown={e => e.stopPropagation()}
      onBlur={commit}
      onKeyDown={e => {
        e.stopPropagation();
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') setEditing(false);
      }}
      className={cn(
        'h-[17px] min-w-0 flex-1 truncate rounded-[3px] px-1 py-0',
        'bg-[var(--pv2-paper)] text-[11px] leading-none font-semibold text-[var(--pv2-ink)]',
        'border border-[var(--pv2-electric)] outline-none'
      )}
    />
  );
};
