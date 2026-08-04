'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { nodeById } from '@/lib/portal-v2/journeys/helpers';
import type {
  JourneyEdgeRef,
  Point,
  RoutedEdge,
} from '@/lib/portal-v2/journeys/routing';
import type { Journey } from '@/lib/portal-v2/journeys/types';

/**
 * The routes, and the controls that edit them.
 *
 * TWO EXPORTS BECAUSE THERE ARE TWO COORDINATE SYSTEMS. The lines belong on the
 * floor: they have to move with the cards, pan with the floor and scale with the
 * zoom. The buttons that edit them do not — a cut button that shrinks to five
 * pixels at 40% zoom is a button nobody can press. So `EdgeLayer` draws inside
 * the transformed layer and `EdgeControls` draws in viewport space, over it.
 *
 * EACH ROUTE IS PAINTED TWICE: a stroke of the canvas colour underneath, then
 * the line. Drawn in order, that makes a crossing readable — the route in front
 * visibly breaks the one behind instead of fusing with it into an X nobody can
 * follow.
 */

export const EDGE_IDLE = 'var(--pv2-slate-300)';
export const EDGE_HOVER = 'var(--pv2-faint)';
export const EDGE_ON = 'var(--pv2-electric)';
export const EDGE_CUT = 'var(--pv2-error)';

/** Screen-space clearance the route controls keep from the stroke itself. */
const CONTROL_GAP = 7;

const MARKERS: [string, string][] = [
  ['idle', EDGE_IDLE],
  ['hover', EDGE_HOVER],
  ['on', EDGE_ON],
  ['cut', EDGE_CUT],
];

export type EdgePreview = {
  d: string;
  stroke: string;
  /** Nothing decided yet — the line says so. */
  dashed: boolean;
  arrow: boolean;
};

type EdgeLayerProps = {
  draft: Journey;
  routed: RoutedEdge[];
  width: number;
  height: number;
  selectedKey: string | null;
  hoverKey: string | null;
  /** The route being moved by a handle drag — drawn as a ghost of itself. */
  ghostKey: string | null;
  /** A gesture is in flight, so hit areas must not answer the pointer. */
  busy: boolean;
  /** Hit stroke in floor units, widened as the zoom shrinks. */
  hitWidth: number;
  preview: EdgePreview | null;
  onHover: (key: string) => void;
  /** Takes the key that LEFT, so entering a neighbour cannot be undone by it. */
  onLeave: (key: string) => void;
  onSelect: (edge: JourneyEdgeRef) => void;
};

export const EdgeLayer = ({
  draft,
  routed,
  width,
  height,
  selectedKey,
  hoverKey,
  ghostKey,
  busy,
  hitWidth,
  preview,
  onHover,
  onLeave,
  onSelect,
}: EdgeLayerProps) => {
  const t = useTranslations('portalV2.journeys');

  const nameOf = (id: string) => nodeById(draft, id)?.name ?? id;

  /* Selected last, hovered next-to-last: the route being worked on is the one
     whose halo breaks the others, not the one buried under them. */
  const rank = (edge: RoutedEdge) =>
    edge.key === selectedKey ? 2 : edge.key === hoverKey ? 1 : 0;
  const drawOrder = [...routed].sort((a, b) => rank(a) - rank(b));

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className='pointer-events-none absolute top-0 left-0 overflow-visible'
    >
      <defs>
        {MARKERS.map(([name, fill]) => (
          <marker
            key={name}
            id={`journey-edge-arrow-${name}`}
            viewBox='0 0 10 10'
            refX={9.4}
            refY={5}
            markerWidth={10}
            markerHeight={10}
            /* Fixed size: the arrowhead must not grow just because the selected
               route is drawn a pixel thicker. */
            markerUnits='userSpaceOnUse'
            orient='auto'
          >
            <path d='M0.6 0.8 L9.6 5 L0.6 9.2 L3 5 z' fill={fill} />
          </marker>
        ))}
      </defs>

      {drawOrder.map(edge => {
        const on = edge.key === selectedKey;
        const hot = edge.key === hoverKey;
        const ghost = edge.key === ghostKey;
        const dim = Boolean((selectedKey && !on) || (preview && !ghost));
        const state = on ? 'on' : hot ? 'hover' : 'idle';
        const stroke = on ? EDGE_ON : hot ? EDGE_HOVER : EDGE_IDLE;
        const stroked = on ? 2.6 : hot ? 2.2 : 1.6;
        const label = t('edgeAria', {
          from: nameOf(edge.from),
          to: nameOf(edge.to),
        });

        return (
          <g
            key={edge.key}
            opacity={ghost ? 0.25 : dim ? 0.32 : 1}
            style={{ transition: 'opacity 120ms' }}
          >
            <title>{label}</title>

            <path
              d={edge.d}
              fill='none'
              stroke='var(--pv2-canvas)'
              strokeWidth={stroked + 5}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d={edge.d}
              fill='none'
              stroke={stroke}
              strokeWidth={stroked}
              strokeLinecap='round'
              strokeLinejoin='round'
              markerEnd={`url(#journey-edge-arrow-${state})`}
            />

            {/* The line is under 3px; the target is not. */}
            <path
              d={edge.d}
              fill='none'
              stroke='transparent'
              strokeWidth={hitWidth}
              tabIndex={0}
              role='button'
              aria-label={label}
              style={{
                /* Silenced mid-gesture: the drag hit-tests the floor itself, and
                   a line sliding under the cursor must not light up. */
                pointerEvents: busy ? 'none' : 'stroke',
                cursor: 'pointer',
                outline: 'none',
              }}
              onPointerEnter={() => onHover(edge.key)}
              onPointerLeave={() => onLeave(edge.key)}
              onFocus={() => onSelect({ from: edge.from, to: edge.to })}
              onPointerDown={e => {
                e.stopPropagation();
                onSelect({ from: edge.from, to: edge.to });
              }}
            />
          </g>
        );
      })}

      {preview ? (
        <>
          <path
            d={preview.d}
            fill='none'
            stroke='var(--pv2-canvas)'
            strokeWidth={7}
            strokeLinecap='round'
          />
          <path
            d={preview.d}
            fill='none'
            stroke={preview.stroke}
            strokeWidth={2.4}
            strokeLinecap='round'
            strokeDasharray={preview.dashed ? '6 5' : undefined}
            markerEnd={
              preview.arrow ? 'url(#journey-edge-arrow-on)' : undefined
            }
          />
        </>
      ) : null}
    </svg>
  );
};

type EdgeControlsProps = {
  draft: Journey;
  /** What the cut button belongs to: the selection, else what is hovered. */
  active: RoutedEdge | null;
  /** Handles appear on the selection only — hovering must not clutter. */
  selected: RoutedEdge | null;
  toScreen: (point: Point) => { left: number; top: number };
  onHover: (key: string) => void;
  onLeave: (key: string) => void;
  onCut: (edge: JourneyEdgeRef) => void;
  onGrab: (
    edge: RoutedEdge,
    end: 'head' | 'tail',
    e: React.PointerEvent
  ) => void;
};

export const EdgeControls = ({
  draft,
  active,
  selected,
  toScreen,
  onHover,
  onLeave,
  onCut,
  onGrab,
}: EdgeControlsProps) => {
  const t = useTranslations('portalV2.journeys');
  const nameOf = (id: string) => nodeById(draft, id)?.name ?? id;

  return (
    <>
      {/* STEPPED OFF THE LINE, AND CLEAR OF IT. The midpoint is exactly where
          the cursor is when the route is hovered, so a cut button drawn there
          lands under the pointer and the click meant to SELECT the route
          deletes it instead. The button therefore sits beside the line, and its
          box stops short of the line as well: padding alone would bridge the
          gap for the hover but would ALSO cover the stroke, which swallows the
          same click just as thoroughly. */}
      {active ? (
        <div
          className={cn(
            'absolute z-10 flex',
            active.midAxis === 'h'
              ? '-translate-x-1/2 -translate-y-full items-end pb-1.5'
              : '-translate-y-1/2 items-center pl-1.5'
          )}
          style={(() => {
            const at = toScreen(active.mid);
            return active.midAxis === 'h'
              ? { ...at, top: at.top - CONTROL_GAP }
              : { ...at, left: at.left + CONTROL_GAP };
          })()}
          onPointerDown={e => e.stopPropagation()}
          onPointerEnter={() => onHover(active.key)}
          onPointerLeave={() => onLeave(active.key)}
        >
          <button
            type='button'
            aria-label={t('cutRouteAria', {
              from: nameOf(active.from),
              to: nameOf(active.to),
            })}
            title={t('cutRoute')}
            onClick={() => onCut({ from: active.from, to: active.to })}
            className={cn(
              'grid size-[22px] cursor-pointer place-items-center rounded-full',
              'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-[var(--pv2-mut)]',
              'shadow-[var(--pv2-sh-sm)] transition-colors',
              'hover:border-[var(--pv2-error)] hover:bg-[var(--pv2-error)] hover:text-[var(--pv2-paper)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
            )}
          >
            <X className='size-3' strokeWidth={2.6} aria-hidden />
          </button>
        </div>
      ) : null}

      {/* Both ends of the selected route are handles. This is the whole answer
          to "the route is drawn, now change it": grab an end, drop it
          elsewhere. */}
      {selected
        ? (
            [
              {
                end: 'tail' as const,
                at: selected.start,
                label: t('edgeHandleFrom'),
              },
              {
                end: 'head' as const,
                at: selected.end,
                label: t('edgeHandleTo'),
              },
            ] as const
          ).map(handle => (
            <button
              key={handle.end}
              type='button'
              aria-label={handle.label}
              title={handle.label}
              onPointerDown={e => onGrab(selected, handle.end, e)}
              className={cn(
                'absolute z-10 size-[13px] -translate-x-1/2 -translate-y-1/2 cursor-crosshair rounded-full',
                'border-2 border-[var(--pv2-paper)] bg-[var(--pv2-electric)]',
                'shadow-[0_0_0_2px_color-mix(in_srgb,var(--pv2-electric)_25%,transparent)]',
                'transition-transform hover:scale-125',
                'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
              )}
              style={toScreen(handle.at)}
            />
          ))
        : null}
    </>
  );
};
