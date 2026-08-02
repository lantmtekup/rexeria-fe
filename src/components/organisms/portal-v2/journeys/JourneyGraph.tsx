'use client';

import { useId } from 'react';

import { cn } from '@/lib/cn';
import {
  JOURNEY_KINDS,
  JOURNEY_KIND_STYLE,
} from '@/lib/portal-v2/journeys/constants';
import { orderNodes } from '@/lib/portal-v2/journeys/helpers';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type JourneyGraphProps = {
  journey: Journey;
  selectedId: string | null;
  onSelect: (nodeId: string) => void;
};

/* Node box + the gaps between them. The canvas is read-only in P0, so the
   geometry is fixed rather than draggable — same layered picture every time. */
const W = 96;
const H = 46;
const GX = 52;
const GY = 20;
const PAD = 14;

const truncate = (s: string, n = 16) =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s;

export const JourneyGraph = ({
  journey,
  selectedId,
  onSelect,
}: JourneyGraphProps) => {
  const markerId = useId().replace(/:/g, '');
  const layout = orderNodes(journey);

  if (!layout.length) return null;

  const cols = Math.max(...layout.map(o => o.col)) + 1;
  const rows = Math.max(...layout.map(o => o.row)) + 1;
  const width = PAD * 2 + cols * W + (cols - 1) * GX;
  const height = PAD * 2 + rows * H + (rows - 1) * GY;

  const x = (col: number) => PAD + col * (W + GX);
  const y = (row: number) => PAD + row * (H + GY);

  const pos = new Map(
    layout.map(o => [o.node.id, { x: x(o.col), y: y(o.row) }])
  );

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
            const mx = x1 + (x2 - x1) / 2;
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

        {layout.map(({ node, col, row }) => {
          const style = JOURNEY_KIND_STYLE[node.kind];
          const selected = node.id === selectedId;
          const nx = x(col);
          const ny = y(row);

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
                fontSize={8}
                fontWeight={800}
                letterSpacing={0.6}
              >
                {JOURNEY_KINDS[node.kind].name.toUpperCase()}
              </text>
              <text
                x={nx + 11}
                y={ny + 33}
                fill='var(--pv2-ink)'
                fontSize={10.5}
                fontWeight={600}
              >
                {truncate(node.name)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
