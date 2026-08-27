'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { formatCount } from '@/lib/portal-v2/format';
import {
  auditedTouchpoints,
  downstreamCount,
  flowStats,
  inboundEdges,
  isEntry,
  isIsland,
  outboundEdges,
  scoreColor,
  type SourceStatusMap,
} from '@/lib/portal-v2/journey-audit/helpers';
import type {
  AuditFlow,
  AuditFlowEdge,
  AuditFlowEdgeType,
  AuditJourney,
  AuditTouchpoint,
} from '@/lib/portal-v2/journey-audit/types';
import {
  FlowStoryCards,
  type FlowStorySummary,
} from '@/components/organisms/portal-v2/journey-audit/FlowStoryCards';

const LINK_STYLE: Record<
  AuditFlowEdgeType,
  { color: string; dash: string; width: number; labelKey: string }
> = {
  path: {
    color: 'var(--pv2-electric)',
    dash: '',
    width: 2,
    labelKey: 'legendPath',
  },
  weak: {
    color: 'var(--pv2-warning)',
    dash: '6 4',
    width: 2,
    labelKey: 'legendWeak',
  },
  influence: {
    color: 'var(--pv2-faint)',
    dash: '2 4',
    width: 1.6,
    labelKey: 'legendInfluence',
  },
  loop: {
    color: 'var(--pv2-success)',
    dash: '',
    width: 2,
    labelKey: 'legendLoop',
  },
  broken: {
    color: 'var(--pv2-error)',
    dash: '5 4',
    width: 2,
    labelKey: 'legendBroken',
  },
};

const NW = 176;
const NH = 62;
const COLW = 238;
const GUT = 118;
const SPINE_Y = 96;
const SUP_Y = 196;
const ROWH = 84;

type NodePos = {
  x: number;
  y: number;
  ci: number;
  lane: 0 | 1;
  tp: AuditTouchpoint;
};

type FlowCanvasProps = {
  journey: AuditJourney;
  flow: AuditFlow;
  conns: AuditFlowEdge[];
  statuses: SourceStatusMap;
  selectedId: string | null;
  onSelect: (tpId: string) => void;
  onOpenTp: (tpId: string) => void;
};

/**
 * Flow map: spine (đường đông khách nhất) trên một hàng, supporting xếp dưới
 * cột stage của nó, return loops chạy rail dưới cùng — 5 loại cạnh
 * path/weak/influence/loop/broken, độ dày cạnh theo lượng người.
 */
export const FlowCanvas = ({
  journey,
  flow,
  conns,
  statuses,
  selectedId,
  onSelect,
  onOpenTp,
}: FlowCanvasProps) => {
  const t = useTranslations('portalV2.journeyAudit');

  const model = useMemo(() => {
    const cols = journey.stages.map(stage =>
      auditedTouchpoints(stage, statuses)
    );
    const all = cols.flat();
    if (!all.length) return null;
    const ids = all.map(tp => tp.id);
    const nameOf = (id: string): string =>
      all.find(tp => tp.id === id)?.name ?? id;

    const sel =
      selectedId && ids.includes(selectedId)
        ? selectedId
        : [...ids].sort(
            (a, b) =>
              flowStats(flow, conns, b).leave - flowStats(flow, conns, a).leave
          )[0];

    /* 1. spine — đường volume lớn nhất khách thật sự đi */
    const colOf: Record<string, number> = {};
    cols.forEach((tps, ci) => tps.forEach(tp => (colOf[tp.id] = ci)));
    const fwd = (id: string) =>
      outboundEdges(conns, id)
        .filter(e => e.type === 'path' || e.type === 'weak')
        .filter(e => colOf[e.to] > colOf[id]);
    const start =
      ids
        .filter(id => isEntry(conns, id))
        .sort(
          (a, b) =>
            flowStats(flow, conns, b).arrive - flowStats(flow, conns, a).arrive
        )[0] ?? ids[0];
    const spine = new Set<string>([start]);
    let cursor = start;
    for (let guard = 0; guard < 12; guard += 1) {
      const next = fwd(cursor).sort((a, b) => b.volume - a.volume)[0];
      if (!next || spine.has(next.to)) break;
      spine.add(next.to);
      cursor = next.to;
    }
    ids.forEach(id => {
      if (
        !spine.has(id) &&
        inboundEdges(conns, id).some(
          e => spine.has(e.from) && colOf[id] > colOf[e.from]
        ) &&
        fwd(id).some(e => spine.has(e.to))
      ) {
        spine.add(id);
      }
    });

    /* 2. lanes */
    const pos: Record<string, NodePos> = {};
    cols.forEach((tps, ci) => {
      const x = GUT + 18 + ci * COLW;
      const onSpine = tps.filter(tp => spine.has(tp.id));
      const support = tps
        .filter(tp => !spine.has(tp.id))
        .sort(
          (a, b) =>
            flowStats(flow, conns, b.id).arrive -
            flowStats(flow, conns, a.id).arrive
        );
      onSpine.forEach((tp, i) => {
        pos[tp.id] = { x, y: SPINE_Y + i * ROWH, ci, lane: 0, tp };
      });
      support.forEach((tp, i) => {
        pos[tp.id] = {
          x,
          y:
            SUP_Y +
            (onSpine.length > 1 ? (onSpine.length - 1) * ROWH : 0) +
            i * ROWH,
          ci,
          lane: 1,
          tp,
        };
      });
    });
    const maxY = Math.max(...Object.values(pos).map(p => p.y)) + NH;
    const RAIL = maxY + 46;
    const loopLinks = conns.filter(
      e => pos[e.from] && pos[e.to] && pos[e.to].ci <= pos[e.from].ci
    );
    const H = RAIL + loopLinks.length * 24 + 30;
    const W = GUT + 18 + cols.length * COLW;
    const maxVolume = Math.max(1, ...conns.map(e => e.volume));

    /* story summary */
    const entries = ids.filter(
      id => isEntry(conns, id) && !isIsland(conns, id)
    );
    const broken = conns.filter(e => e.type === 'broken');
    const weak = conns.filter(e => e.type === 'weak');
    const loops = conns.filter(e => e.type === 'loop');
    const hub = ids
      .map(id => ({
        id,
        downstream: downstreamCount(conns, id),
        inbound: inboundEdges(conns, id).length,
      }))
      .sort((a, b) => b.inbound + b.downstream - (a.inbound + a.downstream))[0];
    const worst = ids
      .map(id => ({ id, stats: flowStats(flow, conns, id) }))
      .sort((a, b) => b.stats.leave - a.stats.leave)[0];
    const story: FlowStorySummary = {
      entryCount: entries.length,
      entryVolume: entries.reduce(
        (total, id) => total + flowStats(flow, conns, id).arrive,
        0
      ),
      hubName: nameOf(hub.id),
      hubInbound: hub.inbound,
      hubDownstream: hub.downstream,
      hubArrive: flowStats(flow, conns, hub.id).arrive,
      worstName: nameOf(worst.id),
      worstLeave: worst.stats.leave,
      worstLeavePct: worst.stats.arrive
        ? Math.round((100 * worst.stats.leave) / worst.stats.arrive)
        : 0,
      brokenNotes: broken.map(
        e =>
          `${nameOf(e.from)} → ${nameOf(e.to)}${e.note ? ` (${e.note})` : ''}`
      ),
      weakNotes: weak.map(e => e.note ?? '').filter(Boolean),
      loopCount: loops.length,
      loopVolume: loops.reduce((total, e) => total + e.volume, 0),
      loopNames: loops.map(e => nameOf(e.from)),
    };

    return { pos, sel, RAIL, H, W, maxVolume, story };
  }, [journey, flow, conns, statuses, selectedId]);

  if (!model) {
    return (
      <div className='flex-1 px-5 pt-3.5 pb-6'>
        <p className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] p-8 text-center text-[13px] text-[var(--pv2-faint)]'>
          {t('flowEmpty')}
        </p>
      </div>
    );
  }

  const { pos, sel, RAIL, H, W, maxVolume, story } = model;

  /* links + labels */
  const links: React.ReactNode[] = [];
  const labels: React.ReactNode[] = [];
  const chip = (
    key: string,
    x: number,
    y: number,
    text: string,
    color: string,
    lit: boolean
  ) =>
    labels.push(
      <g key={key} opacity={lit ? 1 : 0.45}>
        <rect
          x={x - 24}
          y={y - 9}
          width='48'
          height='16'
          rx='8'
          fill='var(--pv2-paper)'
          stroke={color}
          strokeOpacity='.25'
        />
        <text
          x={x}
          y={y + 3}
          textAnchor='middle'
          fontSize='9.5'
          fontWeight='600'
          fill={color}
        >
          {text}
        </text>
      </g>
    );

  let railIndex = 0;
  conns.forEach((e, index) => {
    const A = pos[e.from];
    const B = pos[e.to];
    if (!A || !B) return;
    const style = LINK_STYLE[e.type];
    const lit = e.from === sel || e.to === sel;
    const weight =
      e.type === 'influence'
        ? 1.5
        : Math.max(1.5, Math.min(7, 1.5 + (5.5 * e.volume) / maxVolume));
    const opacity = lit ? 1 : 0.3;
    const marker = `url(#ja-ar-${e.type})`;
    const key = `${e.from}-${e.to}-${index}`;
    const back = B.ci <= A.ci;
    if (back) {
      const ry = RAIL + railIndex * 24;
      railIndex += 1;
      const sx = A.x + NW / 2;
      const tx = B.x + NW / 2;
      const dir = tx > sx ? 1 : -1;
      const d = `M${sx},${A.y + NH} L${sx},${ry - 10} Q${sx},${ry} ${sx + dir * 10},${ry} L${tx - dir * 10},${ry} Q${tx},${ry} ${tx},${ry - 10} L${tx},${B.y + NH + 6}`;
      links.push(
        <path
          key={key}
          d={d}
          fill='none'
          stroke={style.color}
          strokeWidth={weight}
          strokeDasharray={style.dash || undefined}
          markerEnd={marker}
          opacity={opacity}
          strokeLinejoin='round'
        />
      );
      if (e.type === 'broken') {
        labels.push(
          <g key={`${key}-lbl`}>
            <rect
              x={(sx + tx) / 2 - 32}
              y={ry - 9}
              width='64'
              height='16'
              rx='8'
              fill='var(--pv2-paper)'
              stroke='var(--pv2-error)'
            />
            <text
              x={(sx + tx) / 2}
              y={ry + 3}
              textAnchor='middle'
              fontSize='9'
              fontWeight='700'
              fill='var(--pv2-error)'
            >
              {t('flowZeroArrive')}
            </text>
          </g>
        );
      } else {
        chip(
          `${key}-lbl`,
          (sx + tx) / 2,
          ry,
          formatCount(e.volume),
          style.color,
          lit
        );
      }
    } else if (A.lane !== B.lane) {
      const sx = A.x + NW / 2;
      const sy = A.lane > B.lane ? A.y : A.y + NH;
      const ty = A.lane > B.lane ? B.y + NH : B.y;
      const tx = B.x + NW / 2;
      const d = `M${sx},${sy} C${sx},${(sy + ty) / 2} ${tx},${(sy + ty) / 2} ${tx},${ty}`;
      links.push(
        <path
          key={key}
          d={d}
          fill='none'
          stroke={style.color}
          strokeWidth={weight}
          strokeDasharray={style.dash || undefined}
          markerEnd={marker}
          opacity={opacity}
        />
      );
      if (e.volume)
        chip(
          `${key}-lbl`,
          (sx + tx) / 2,
          (sy + ty) / 2,
          formatCount(e.volume),
          style.color,
          lit
        );
    } else {
      const sx = A.x + NW;
      const sy = A.y + NH / 2;
      const tx = B.x;
      const ty = B.y + NH / 2;
      const dx = Math.max(40, (tx - sx) / 2);
      const d =
        sy === ty
          ? `M${sx},${sy} L${tx},${ty}`
          : `M${sx},${sy} C${sx + dx},${sy} ${tx - dx},${ty} ${tx},${ty}`;
      links.push(
        <path
          key={key}
          d={d}
          fill='none'
          stroke={style.color}
          strokeWidth={weight}
          strokeDasharray={style.dash || undefined}
          markerEnd={marker}
          opacity={opacity}
        />
      );
      if (e.volume)
        chip(
          `${key}-lbl`,
          (sx + tx) / 2,
          (sy + ty) / 2 - 11,
          formatCount(e.volume),
          style.color,
          lit
        );
    }
  });

  const laneLabel = (y: number, title: string, sub: string) => (
    <>
      <text
        x={GUT}
        y={y}
        textAnchor='end'
        fontSize='8'
        fontWeight='700'
        letterSpacing='1.1'
        fill='var(--pv2-faint)'
      >
        {title}
      </text>
      <text
        x={GUT}
        y={y + 12}
        textAnchor='end'
        fontSize='8'
        fill='var(--pv2-faint)'
      >
        {sub}
      </text>
    </>
  );
  const supportYs = Object.values(pos)
    .filter(p => p.lane === 1)
    .map(p => p.y);
  const hasLoops = story.loopCount > 0 || railIndex > 0;

  return (
    <div className='flex-1 overflow-auto px-5 pt-3.5 pb-6'>
      <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 pt-4 pb-3'>
        <div className='overflow-x-auto pb-1'>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{ minWidth: W }}
            className='block w-full overflow-visible'
            role='img'
            aria-label={t('flowAria')}
          >
            <defs>
              {Object.entries(LINK_STYLE).map(([type, style]) => (
                <marker
                  key={type}
                  id={`ja-ar-${type}`}
                  viewBox='0 0 12 12'
                  refX='10.5'
                  refY='6'
                  markerUnits='userSpaceOnUse'
                  markerWidth='12'
                  markerHeight='12'
                  orient='auto'
                >
                  <path d='M1.5,1.5 L11,6 L1.5,10.5 z' fill={style.color} />
                </marker>
              ))}
            </defs>
            {journey.stages.map((stage, ci) => (
              <g key={stage.key}>
                <text
                  x={GUT + 18 + ci * COLW + NW / 2}
                  y='32'
                  textAnchor='middle'
                  fontSize='11.5'
                  fontWeight='700'
                  fill='var(--pv2-mut)'
                >
                  {stage.name}
                </text>
                <line
                  x1={GUT + 18 + ci * COLW - 14}
                  y1='46'
                  x2={GUT + 18 + ci * COLW + NW + 14}
                  y2='46'
                  stroke='var(--pv2-hair)'
                />
              </g>
            ))}
            {laneLabel(SPINE_Y + 24, t('flowMainPath'), t('flowMainPathSub'))}
            {supportYs.length
              ? laneLabel(
                  Math.min(...supportYs) + 24,
                  t('flowSupporting'),
                  t('flowSupportingSub')
                )
              : null}
            {hasLoops
              ? laneLabel(
                  RAIL + 4,
                  t('flowReturnLoops'),
                  t('flowReturnLoopsSub')
                )
              : null}
            <line
              x1={GUT + 8}
              y1='20'
              x2={GUT + 8}
              y2={H - 20}
              stroke='var(--pv2-hair)'
            />
            {links}
            {labels}
            {Object.entries(pos).map(([id, q]) => {
              const stats = flowStats(flow, conns, id);
              const entry = isEntry(conns, id);
              const island = isIsland(conns, id);
              const active = id === sel;
              const short =
                q.tp.name.length > 22
                  ? `${q.tp.name.slice(0, 21)}…`
                  : q.tp.name;
              const dropPct = stats.arrive
                ? Math.round((100 * stats.leave) / stats.arrive)
                : 0;
              const sev = stats.isEnd
                ? 'var(--pv2-faint)'
                : dropPct >= 80
                  ? 'var(--pv2-error)'
                  : dropPct >= 55
                    ? 'var(--pv2-warning)'
                    : 'var(--pv2-success)';
              return (
                <g
                  key={id}
                  role='button'
                  aria-label={q.tp.name}
                  className='cursor-pointer'
                  onClick={() => {
                    onSelect(id);
                    onOpenTp(id);
                  }}
                >
                  <rect
                    x={q.x}
                    y={q.y}
                    width={NW}
                    height={NH}
                    rx='11'
                    fill={
                      active ? 'var(--pv2-electric-soft)' : 'var(--pv2-paper)'
                    }
                    stroke={
                      active
                        ? 'var(--pv2-electric)'
                        : island
                          ? 'var(--pv2-error)'
                          : q.lane === 0
                            ? 'color-mix(in srgb, var(--pv2-electric) 32%, var(--pv2-hair))'
                            : 'var(--pv2-hair)'
                    }
                    strokeWidth={active ? 2.2 : island ? 1.8 : 1.2}
                    strokeDasharray={island ? '5 4' : undefined}
                  />
                  <rect
                    x={q.x}
                    y={q.y}
                    width='4'
                    height={NH}
                    rx='2'
                    fill={scoreColor(q.tp.score)}
                  />
                  <text
                    x={q.x + 14}
                    y={q.y + 20}
                    fontSize='12'
                    fontWeight='600'
                    fill='var(--pv2-ink)'
                  >
                    {short}
                  </text>
                  <text
                    x={q.x + 14}
                    y={q.y + 36}
                    fontSize='10'
                    fill='var(--pv2-mut)'
                  >
                    {t('flowNodeMeta', {
                      volume: formatCount(stats.arrive),
                      score: q.tp.score,
                    })}
                  </text>
                  <text x={q.x + 14} y={q.y + 51} fontSize='9.5' fill={sev}>
                    {stats.isEnd
                      ? t('trafficEndpoint')
                      : t('flowNodeLeave', {
                          rate: stats.rate,
                          leave: formatCount(stats.leave),
                        })}
                  </text>
                  {entry ? (
                    <circle
                      cx={q.x + NW - 13}
                      cy={q.y + 14}
                      r='4.5'
                      fill='var(--pv2-electric)'
                    />
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>
        <div className='mt-3 flex flex-wrap items-center gap-4 border-t border-[var(--pv2-hair)] pt-3'>
          {Object.entries(LINK_STYLE).map(([type, style]) => (
            <span
              key={type}
              className='text-2xs flex items-center gap-1.5 font-medium text-[var(--pv2-mut)]'
            >
              <svg width='30' height='8' aria-hidden>
                <line
                  x1='0'
                  y1='4'
                  x2='26'
                  y2='4'
                  stroke={style.color}
                  strokeWidth={style.width}
                  strokeDasharray={style.dash || undefined}
                />
              </svg>
              {t(style.labelKey)}
            </span>
          ))}
          <span className='text-2xs flex items-center gap-1.5 font-medium text-[var(--pv2-mut)]'>
            <span className='size-2 rounded-full bg-[var(--pv2-electric)]' />
            {t('legendEntry')}
          </span>
          <span className='text-2xs flex items-center gap-1.5 font-medium text-[var(--pv2-mut)]'>
            <span className='size-2.5 rounded-[3px] border-[1.6px] border-dashed border-[var(--pv2-error)]' />
            {t('legendIsolated')}
          </span>
          <span className='text-2xs ml-auto text-[var(--pv2-faint)]'>
            {t('legendThickness')}
          </span>
        </div>
      </div>
      <FlowStoryCards story={story} />
    </div>
  );
};
