'use client';

import { Copy, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import {
  JOURNEY_KINDS,
  JOURNEY_KIND_STYLE,
} from '@/lib/portal-v2/journeys/constants';
import { NODE_H, NODE_W, compactCount } from '@/lib/portal-v2/journeys/stages';
import type { JourneyNode } from '@/lib/portal-v2/journeys/types';

/**
 * One card on the floor.
 *
 * HTML rather than SVG because it has to truncate three lines of text, hold a
 * row of real buttons, and be a focusable control. The read-only `JourneyGraph`
 * stays pure SVG because it only ever draws.
 *
 * EVERYTHING THE CARD IS, THE CARD SAYS. Its kind, its name, what it hands to,
 * how many shoppers reached it, and — when an experience node has no page
 * behind it — that it is unbound, in the error colour, before anyone opens the
 * inspector to find out. The actions that used to live only in the right-hand
 * panel are on it too: rename in place, duplicate, delete.
 */

export type LinkVerdict = 'connect' | 'disconnect' | 'keep' | 'none';

type NodeCardProps = {
  node: JourneyNode;
  subline: { text: string; warn: boolean };
  selected: boolean;
  /** A link is being pulled and this card is a candidate for it. */
  aiming: boolean;
  /** The link is currently over this card. */
  targeted: boolean;
  verdict: LinkVerdict;
  /** This card is the fixed end of the link being pulled. */
  anchored: boolean;
  linkMode: 'in' | 'out' | null;
  reached: number | null;
  onPointerDown: (e: React.PointerEvent) => void;
  onActivate: () => void;
  onPortDown: (mode: 'in' | 'out', e: React.PointerEvent) => void;
  onPortArm: (mode: 'in' | 'out') => void;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export const NodeCard = ({
  node,
  subline,
  selected,
  aiming,
  targeted,
  verdict,
  anchored,
  linkMode,
  reached,
  onPointerDown,
  onActivate,
  onPortDown,
  onPortArm,
  onRename,
  onDuplicate,
  onDelete,
}: NodeCardProps) => {
  const t = useTranslations('portalV2.journeys');
  const [renaming, setRenaming] = useState(false);

  const style = JOURNEY_KIND_STYLE[node.kind];
  const kind = JOURNEY_KINDS[node.kind];
  const unbound = node.kind === 'experience' && !node.xName;

  const showIn = linkMode === 'out' || targeted;
  const showOut = linkMode === 'in' || targeted;

  const actionClass = cn(
    'grid size-[18px] cursor-pointer place-items-center rounded-[var(--pv2-r-sm)]',
    'text-[var(--pv2-mut)] transition-colors hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]',
    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
  );

  return (
    <div
      className='group absolute'
      style={{ left: node.px ?? 0, top: node.py ?? 0 }}
    >
      <button
        type='button'
        aria-label={`${kind.name}: ${node.name}`}
        aria-pressed={selected}
        onPointerDown={onPointerDown}
        onKeyDown={e => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          onActivate();
        }}
        className={cn(
          'flex cursor-grab flex-col items-start gap-1 overflow-hidden rounded-[var(--pv2-r)] border px-3 py-2 text-left',
          'bg-[var(--pv2-paper)] transition-[border-color,box-shadow] duration-100',
          'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
          /* One ring for selection, one hairline the rest of the time. Never a
             border, a ring and a shadow arguing about the same edge. */
          unbound ? 'border-[var(--pv2-error)]' : 'border-[var(--pv2-hair)]',
          selected && 'ring-2 ring-[var(--pv2-electric)]',
          aiming && 'border-dashed',
          targeted &&
            (verdict === 'disconnect'
              ? 'border-solid border-[var(--pv2-error)] ring-2 ring-[var(--pv2-error)]'
              : 'border-solid border-[var(--pv2-electric)] ring-2 ring-[var(--pv2-electric)]')
        )}
        style={{ width: NODE_W, height: NODE_H }}
      >
        <span className='flex w-full items-center gap-1.5'>
          <span
            className='size-[7px] shrink-0 rounded-full'
            style={{ background: style.dot }}
            aria-hidden
          />
          <span
            className='truncate text-[8.5px] font-extrabold tracking-[0.07em] uppercase'
            style={{ color: unbound ? 'var(--pv2-error)' : style.fg }}
          >
            {unbound ? t('nodeUnbound', { kind: kind.name }) : kind.name}
          </span>
        </span>

        {renaming ? (
          <NodeName
            name={node.name}
            onCommit={name => {
              setRenaming(false);
              if (name.trim() && name !== node.name) onRename(name);
            }}
            onCancel={() => setRenaming(false)}
          />
        ) : (
          <span
            className='w-full truncate text-[12.5px] leading-tight font-semibold text-[var(--pv2-ink)]'
            title={t('cardRename')}
            onDoubleClick={e => {
              e.stopPropagation();
              setRenaming(true);
            }}
          >
            {node.name}
          </span>
        )}

        <span className='flex w-full items-center gap-1.5'>
          <span
            className={cn(
              'min-w-0 flex-1 truncate text-[10.5px]',
              subline.warn
                ? 'font-semibold text-[var(--pv2-error)]'
                : 'text-[var(--pv2-faint)]'
            )}
          >
            {subline.text}
          </span>
          {reached !== null ? (
            <span
              className='shrink-0 rounded-full bg-[var(--pv2-canvas)] px-1.5 text-[10px] font-bold text-[var(--pv2-mut)] tabular-nums'
              title={t('stageReached', { count: reached.toLocaleString() })}
            >
              {compactCount(reached)}
            </span>
          ) : null}
        </span>
      </button>

      {/* The card's own actions. Quiet until the card is under the pointer, so a
          floor of twelve cards is not also a floor of thirty-six buttons. */}
      <span
        role='group'
        aria-label={t('cardActionsAria', { name: node.name })}
        className={cn(
          'absolute top-1 right-1 flex items-center gap-0.5 rounded-[var(--pv2-r-sm)] bg-[var(--pv2-paper)] p-0.5',
          'pointer-events-none opacity-0 transition-opacity',
          'group-hover:pointer-events-auto group-hover:opacity-100',
          'focus-within:pointer-events-auto focus-within:opacity-100'
        )}
      >
        <button
          type='button'
          aria-label={t('cardEditAria', { name: node.name })}
          title={t('cardEdit')}
          onPointerDown={e => e.stopPropagation()}
          onClick={() => setRenaming(true)}
          className={actionClass}
        >
          <Pencil className='size-3' strokeWidth={2.2} aria-hidden />
        </button>
        <button
          type='button'
          aria-label={t('cardDuplicateAria', { name: node.name })}
          title={t('cardDuplicate')}
          onPointerDown={e => e.stopPropagation()}
          onClick={onDuplicate}
          className={actionClass}
        >
          <Copy className='size-3' strokeWidth={2.2} aria-hidden />
        </button>
        <button
          type='button'
          aria-label={t('cardDeleteAria', { name: node.name })}
          title={t('cardDelete')}
          onPointerDown={e => e.stopPropagation()}
          onClick={onDelete}
          className={cn(
            actionClass,
            'hover:bg-[color-mix(in_srgb,var(--pv2-error)_12%,transparent)] hover:text-[var(--pv2-error)]'
          )}
        >
          <Trash2 className='size-3' strokeWidth={2.2} aria-hidden />
        </button>
      </span>

      {/* The in-port. Hidden means gone, not transparent: a 14px invisible
          target on the card's left edge would swallow the drag meant to move
          the card. */}
      <button
        type='button'
        aria-label={t('portInAria', { name: node.name })}
        onPointerDown={e => onPortDown('in', e)}
        onKeyDown={e => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          onPortArm('in');
        }}
        className={cn(
          'absolute grid size-[14px] cursor-crosshair place-items-center rounded-full',
          'border-2 border-[var(--pv2-paper)] transition-[opacity,transform]',
          'pointer-events-none opacity-0',
          'group-hover:pointer-events-auto group-hover:opacity-100 hover:scale-125',
          'focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
          showIn && 'pointer-events-auto opacity-100',
          targeted && 'scale-125'
        )}
        style={{
          left: -7,
          top: NODE_H / 2 - 7,
          background:
            targeted && verdict === 'disconnect'
              ? 'var(--pv2-error)'
              : targeted || linkMode === 'in'
                ? 'var(--pv2-electric)'
                : 'var(--pv2-slate-300)',
        }}
      />

      {/* The out-port. Outcomes end the journey, so they have none. */}
      {node.kind !== 'outcome' ? (
        <button
          type='button'
          aria-label={t('portAria', { name: node.name })}
          onPointerDown={e => onPortDown('out', e)}
          onKeyDown={e => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            onPortArm('out');
          }}
          className={cn(
            'absolute grid size-[15px] cursor-crosshair place-items-center rounded-full',
            'border-2 border-[var(--pv2-paper)] transition-transform hover:scale-125',
            'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
            (showOut || anchored) && 'scale-125'
          )}
          style={{
            left: NODE_W - 7,
            top: NODE_H / 2 - 7,
            background:
              linkMode === 'out' && anchored
                ? 'var(--pv2-electric)'
                : 'var(--pv2-slate-300)',
          }}
        />
      ) : null}
    </div>
  );
};

/** The name, edited where it is written. Enter commits, Escape abandons. */
const NodeName = ({
  name,
  onCommit,
  onCancel,
}: {
  name: string;
  onCommit: (name: string) => void;
  onCancel: () => void;
}) => {
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  return (
    <input
      ref={inputRef}
      value={value}
      aria-label={name}
      onChange={e => setValue(e.target.value)}
      onPointerDown={e => e.stopPropagation()}
      onBlur={() => onCommit(value)}
      onKeyDown={e => {
        e.stopPropagation();
        if (e.key === 'Enter') onCommit(value);
        if (e.key === 'Escape') onCancel();
      }}
      className={cn(
        'w-full truncate rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)] px-1',
        'text-[12.5px] leading-tight font-semibold text-[var(--pv2-ink)]',
        'ring-2 ring-[var(--pv2-electric)] outline-none'
      )}
    />
  );
};
