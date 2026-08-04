'use client';

import { useId } from 'react';

import { cn } from '@/lib/cn';
import {
  JOURNEY_KINDS,
  JOURNEY_KIND_STYLE,
} from '@/lib/portal-v2/journeys/constants';
import { NODE_H, NODE_W } from '@/lib/portal-v2/journeys/editor';
import { orderNodes } from '@/lib/portal-v2/journeys/helpers';
import type { Journey, JourneyNode } from '@/lib/portal-v2/journeys/types';

type JourneyGraphProps = {
  journey: Journey;
  selectedId: string | null;
  onSelect: (nodeId: string) => void;
};

/* Two geometries, one picture.
   A journey nobody has arranged is drawn by the layered layout in a compact box.
   A journey that HAS been arranged in the editor is drawn where its author put
   it, at the editor's own box size — otherwise the read-only view would quietly
   disagree with the thing they just saved. */
const AUTO_W = 96;
const AUTO_H = 46;
const GX = 52;
const GY = 20;
const PAD = 14;

const truncate = (s: string, n: number) =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s;

type Placed = { node: JourneyNode; x: number; y: number };

export const JourneyGraph = ({
  journey,
  selectedId,
  onSelect,
}: JourneyGraphProps) => {
  const markerId = useId().replace(/:/g, '');
  const layout = orderNodes(journey);

  if (!layout.length) return null;

  /* All or nothing: one unplaced node would mix two coordinate systems and read
     as a mistake, so a partial graph falls back to the layered layout. */
  const handPlaced = journey.nodes.every(
    node => node.px !== undefined && node.py !== undefined
  );

  const W = handPlaced ? NODE_W : AUTO_W;
  const H = handPlaced ? NODE_H : AUTO_H;

  const raw: Placed[] = handPlaced
    ? journey.nodes.map(node => ({
        node,
        x: node.px ?? 0,
        y: node.py ?? 0,
      }))
    : layout.map(({ node, col, row }) => ({
        node,
        x: col * (AUTO_W + GX),
        y: row * (AUTO_H + GY),
      }));

  /* Shift to the origin so a floor the author panned away from does not open
     with a screenful of nothing. */
  const minX = Math.min(...raw.map(p => p.x));
  const minY = Math.min(...raw.map(p => p.y));
  const placed: Placed[] = raw.map(p => ({
    ...p,
    x: PAD + p.x - minX,
    y: PAD + p.y - minY,
  }));

  const width = Math.max(...placed.map(p => p.x)) + W + PAD;
  const height = Math.max(...placed.map(p => p.y)) + H + PAD;

  const pos = new Map(placed.map(p => [p.node.id, { x: p.x, y: p.y }]));

  const kindSize = handPlaced ? 9.5 : 8;
  const nameSize = handPlaced ? 12.5 : 10.5;
  const nameChars = handPlaced ? 24 : 16;

  return (
    <div className='overflow-x-auto'>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className='max-w-none'
        role='img'
        aria-label={journey.name}
      >
        <defs>
          <marker
            id={markerId}
            viewBox='0 0 8 8'
            refX={7}
            refY={4}
            markerWidth={7}
            markerHeight={7}
            orient='auto-start-reverse'
          >
            <path d='M0 0 L8 4 L0 8 z' fill='var(--pv2-slate-300)' />
          </marker>
        </defs>

        {journey.nodes.flatMap(node => {
          const from = pos.get(node.id);
          if (!from) return [];
          return node.to.flatMap(targetId => {
            const to = pos.get(targetId);
            if (!to) return [];
            const x1 = from.x + W;
            const y1 = from.y + H / 2;
            const x2 = to.x;
            const y2 = to.y + H / 2;
            const mx = Math.max(x1 + 20, x1 + (x2 - x1) / 2);
            return [
              <path
                key={`${node.id}-${targetId}`}
                d={`M ${x1} ${y1} L ${mx} ${y1} L ${mx} ${y2} L ${x2} ${y2}`}
                fill='none'
                stroke='var(--pv2-slate-300)'
                strokeWidth={1.5}
                markerEnd={`url(#${markerId})`}
              />,
            ];
          });
        })}

        {placed.map(({ node, x: nx, y: ny }) => {
          const style = JOURNEY_KIND_STYLE[node.kind];
          const selected = node.id === selectedId;

          return (
            <g
              key={node.id}
              role='button'
              tabIndex={0}
              aria-pressed={selected}
              aria-label={`${JOURNEY_KINDS[node.kind].name}: ${node.name}`}
              onClick={() => onSelect(node.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(node.id);
                }
              }}
              className={cn(
                'cursor-pointer outline-none',
                '[&>rect]:transition-[stroke,stroke-width] [&>rect]:duration-150'
              )}
            >
              <rect
                x={nx}
                y={ny}
                width={W}
                height={H}
                rx={10}
                fill={style.bg}
                stroke={selected ? 'var(--pv2-electric)' : 'var(--pv2-hair)'}
                strokeWidth={selected ? 2 : 1}
              />
              <circle cx={nx + 11} cy={ny + 14} r={3} fill={style.dot} />
              <text
                x={nx + 19}
                y={ny + 17}
                fill={style.fg}
                fontSize={kindSize}
                fontWeight={800}
                letterSpacing={0.6}
              >
                {JOURNEY_KINDS[node.kind].name.toUpperCase()}
              </text>
              <text
                x={nx + 11}
                y={ny + (handPlaced ? 38 : 33)}
                fill='var(--pv2-ink)'
                fontSize={nameSize}
                fontWeight={600}
              >
                {truncate(node.name, nameChars)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
