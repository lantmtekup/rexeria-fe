'use client';

import { useTranslations } from 'next-intl';
import { useRef, type Dispatch, type SetStateAction } from 'react';

import type { ViewTransform } from '@/components/organisms/portal-v2/journeys/editor/EditorCanvas';
import { cn } from '@/lib/cn';
import { JOURNEY_KIND_STYLE } from '@/lib/portal-v2/journeys/constants';
import {
  NODE_H,
  NODE_W,
  journeyEdges,
  type FloorBounds,
} from '@/lib/portal-v2/journeys/editor';
import { nodeById } from '@/lib/portal-v2/journeys/helpers';
import type { Journey, JourneyNodeKind } from '@/lib/portal-v2/journeys/types';

/**
 * The whole journey at a glance, bottom right of the floor.
 *
 * A graph can be dragged anywhere — including above and to the left of where the
 * layout began, now that dragging is unclamped — so there has to be one place
 * that always shows all of it. The lit rectangle is the part currently on screen;
 * clicking or scrubbing inside moves the viewport there, which is also how a node
 * that has been parked off-screen gets found again.
 */

const BOX_W = 192;
const BOX_H = 124;
/** Space reserved for the chrome label strip above the SVG floor. */
const LABEL_H = 22;
const FLOOR_H = BOX_H - LABEL_H;
/** A three-node graph should not be rendered at ten times life size. */
const MAX_SCALE = 0.38;

const NODE_OPACITY: Record<JourneyNodeKind, number> = {
  entry: 0.55,
  experience: 0.92,
  decision: 0.9,
  action: 0.88,
  outcome: 0.55,
};

type EditorMinimapProps = {
  draft: Journey;
  bounds: FloorBounds;
  view: ViewTransform;
  /** The canvas viewport, in CSS pixels. */
  viewport: { width: number; height: number };
  onViewChange: Dispatch<SetStateAction<ViewTransform>>;
};

export const EditorMinimap = ({
  draft,
  bounds,
  view,
  viewport,
  onViewChange,
}: EditorMinimapProps) => {
  const t = useTranslations('portalV2.journeys');
  const floorRef = useRef<HTMLButtonElement>(null);

  const scale = Math.min(
    BOX_W / bounds.width,
    FLOOR_H / bounds.height,
    MAX_SCALE
  );
  /* Centre whatever the scale left over, so a small graph sits in the middle
     rather than hugging the top-left corner. */
  const offsetX = (BOX_W - bounds.width * scale) / 2;
  const offsetY = (FLOOR_H - bounds.height * scale) / 2;

  const toBox = (x: number, y: number) => ({
    x: offsetX + (x - bounds.minX) * scale,
    y: offsetY + (y - bounds.minY) * scale,
  });

  /* The floor region the viewport currently shows. */
  const shown = {
    ...toBox(-view.panX / view.zoom, -view.panY / view.zoom),
    w: (viewport.width / view.zoom) * scale,
    h: (viewport.height / view.zoom) * scale,
  };

  /** Put the floor point under the cursor at the centre of the viewport. */
  const centreOn = (clientX: number, clientY: number) => {
    const rect = floorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const floorX = bounds.minX + (clientX - rect.left - offsetX) / scale;
    const floorY = bounds.minY + (clientY - rect.top - offsetY) / scale;
    onViewChange(prev => ({
      ...prev,
      panX: viewport.width / 2 - floorX * prev.zoom,
      panY: viewport.height / 2 - floorY * prev.zoom,
    }));
  };

  const edges = journeyEdges(draft);
  const patternId = `pv2-mm-dots-${draft.id}`;

  return (
    <div
      className={cn(
        'absolute right-4 bottom-4 z-10 overflow-hidden',
        'rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]',
        'bg-[var(--pv2-paper)]/90 shadow-[var(--pv2-sh-sm),0_8px_24px_rgba(14,17,23,0.06)]',
        'backdrop-blur-[6px]',
        'ring-1 ring-white/60 ring-inset',
        'transition-[border-color,box-shadow] duration-150',
        'hover:border-[color-mix(in_srgb,var(--pv2-electric)_28%,var(--pv2-hair))]',
        'hover:shadow-[var(--pv2-sh-soft)]',
        'focus-within:border-[color-mix(in_srgb,var(--pv2-electric)_40%,var(--pv2-hair))]',
        'focus-within:ring-2 focus-within:ring-[var(--pv2-electric)]/30'
      )}
      style={{ width: BOX_W, height: BOX_H }}
    >
      <div className='flex h-[22px] items-center justify-between border-b border-[var(--pv2-hair)]/80 px-2.5'>
        <span className='text-[10px] font-semibold tracking-[0.04em] text-[var(--pv2-faint)] uppercase'>
          {t('minimapLabel')}
        </span>
        <span className='text-[10px] text-[var(--pv2-faint)]/80 tabular-nums'>
          {draft.nodes.length}
        </span>
      </div>

      <button
        ref={floorRef}
        type='button'
        aria-label={t('minimapAria')}
        title={t('minimapAria')}
        onPointerDown={e => {
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          centreOn(e.clientX, e.clientY);
        }}
        onPointerMove={e => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
          centreOn(e.clientX, e.clientY);
        }}
        className={cn(
          'block cursor-crosshair overflow-hidden p-0',
          'focus-visible:outline-none'
        )}
        style={{ width: BOX_W, height: FLOOR_H }}
      >
        <svg width={BOX_W} height={FLOOR_H} aria-hidden>
          <defs>
            <pattern
              id={patternId}
              width={8}
              height={8}
              patternUnits='userSpaceOnUse'
            >
              <circle
                cx={1}
                cy={1}
                r={0.7}
                fill='var(--pv2-slate-300)'
                opacity={0.55}
              />
            </pattern>
          </defs>

          <rect width={BOX_W} height={FLOOR_H} fill='var(--pv2-canvas)' />
          <rect width={BOX_W} height={FLOOR_H} fill={`url(#${patternId})`} />

          {edges.map(edge => {
            const from = nodeById(draft, edge.from);
            const to = nodeById(draft, edge.to);
            if (!from || !to) return null;
            const a = toBox(
              (from.px ?? 0) + NODE_W,
              (from.py ?? 0) + NODE_H / 2
            );
            const b = toBox(to.px ?? 0, (to.py ?? 0) + NODE_H / 2);
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke='color-mix(in srgb, var(--pv2-ink) 16%, transparent)'
                strokeWidth={1}
                strokeLinecap='round'
              />
            );
          })}

          {draft.nodes.map(node => {
            const at = toBox(node.px ?? 0, node.py ?? 0);
            const w = Math.max(5, NODE_W * scale);
            const h = Math.max(3.5, NODE_H * scale);
            return (
              <rect
                key={node.id}
                x={at.x}
                y={at.y}
                width={w}
                height={h}
                rx={Math.min(2.5, h / 2)}
                fill={JOURNEY_KIND_STYLE[node.kind].dot}
                opacity={NODE_OPACITY[node.kind]}
              />
            );
          })}

          {/* What is on screen right now. Clipped by the button's overflow. */}
          <rect
            x={shown.x}
            y={shown.y}
            width={Math.max(8, shown.w)}
            height={Math.max(8, shown.h)}
            rx={3}
            fill='color-mix(in srgb, var(--pv2-electric) 10%, transparent)'
            stroke='var(--pv2-electric)'
            strokeWidth={1.25}
          />
        </svg>
      </button>
    </div>
  );
};
