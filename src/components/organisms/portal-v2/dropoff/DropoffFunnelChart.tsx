'use client';

import { useTranslations } from 'next-intl';

import { formatCount, formatMoney } from '@/lib/portal-v2/format';
import type { AuditDropoff } from '@/lib/portal-v2/journey-audit/types';

export type FunnelStageMeta = {
  name: string;
  auditedCount: number;
};

type DropoffFunnelChartProps = {
  dropoff: AuditDropoff;
  stages: FunnelStageMeta[];
  selectedLeakId: string | null;
  tpNameOf: (touchpointId: string) => string;
  onSelectLeak: (leakId: string) => void;
  onOpenStage: () => void;
};

/**
 * Phễu 3 hàng của prototype: funnel bars (người còn lại) · stage responsible
 * (so benchmark ±5pts) · leak badges (chi phí, click để chẩn đoán).
 */
export const DropoffFunnelChart = ({
  dropoff,
  stages,
  selectedLeakId,
  tpNameOf,
  onSelectLeak,
  onOpenStage,
}: DropoffFunnelChartProps) => {
  const t = useTranslations('portalV2.dropoff');
  const steps = dropoff.steps;
  const n = steps.length;
  if (n < 2) return null;

  const W = 1000;
  const H = 236;
  const GUT = 132;
  const padR = 36;
  const cx = (i: number): number =>
    GUT + 18 + (i * (W - GUT - 18 - padR)) / (n - 1);
  const v0 = steps[0].count || 1;
  const barCy = 70;
  const maxH = 46;
  const bw = 38;
  const bh = (i: number): number => Math.max(11, (maxH * steps[i].count) / v0);
  const RIB_Y = 104;
  const RIB_H = 58;
  const TAG_Y = 176;
  const TAG_H = 40;

  const rowLabel = (y: number, text: string) => (
    <text
      x={GUT}
      y={y}
      textAnchor='end'
      fontSize='8'
      fontWeight='700'
      letterSpacing='1.1'
      fill='var(--pv2-faint)'
    >
      {text}
    </text>
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio='xMidYMid meet'
      className='block w-full'
      role='img'
      aria-label={t('funnelAria')}
    >
      {rowLabel(28, t('rowFunnel'))}
      {rowLabel(40, t('rowFunnelSub'))}
      {rowLabel(RIB_Y + 22, t('rowStage'))}
      {rowLabel(RIB_Y + 34, t('rowStageSub'))}
      {rowLabel(TAG_Y + 18, t('rowCost'))}
      {rowLabel(TAG_Y + 30, t('rowCostSub'))}
      <line
        x1={GUT + 8}
        y1='8'
        x2={GUT + 8}
        y2={TAG_Y + TAG_H}
        stroke='var(--pv2-hair)'
      />
      {steps.map((step, i) => (
        <g key={step.key}>
          <line
            x1={cx(i)}
            y1='40'
            x2={cx(i)}
            y2={barCy + maxH / 2 + 4}
            stroke='var(--pv2-hair)'
            strokeDasharray='2 4'
            opacity='.8'
          />
          <text
            x={cx(i)}
            y='18'
            textAnchor='middle'
            fontSize='10.5'
            fill='var(--pv2-faint)'
          >
            {step.label}
          </text>
          <text
            x={cx(i)}
            y='35'
            textAnchor='middle'
            fontSize='14'
            fontWeight='700'
            fill='var(--pv2-ink)'
          >
            {formatCount(step.count)}
          </text>
        </g>
      ))}
      {steps.slice(0, -1).map((step, i) => {
        const x1 = cx(i) + bw / 2;
        const x2 = cx(i + 1) - bw / 2;
        const h1 = bh(i);
        const h2 = bh(i + 1);
        const mx = (x1 + x2) / 2;
        return (
          <path
            key={`flow-${step.key}`}
            d={`M${x1},${barCy - h1 / 2} C${mx},${barCy - h1 / 2} ${mx},${barCy - h2 / 2} ${x2},${barCy - h2 / 2} L${x2},${barCy + h2 / 2} C${mx},${barCy + h2 / 2} ${mx},${barCy + h1 / 2} ${x1},${barCy + h1 / 2} Z`}
            fill='var(--pv2-electric)'
            opacity='.09'
          />
        );
      })}
      {steps.map((step, i) => (
        <rect
          key={`bar-${step.key}`}
          x={cx(i) - bw / 2}
          y={barCy - bh(i) / 2}
          width={bw}
          height={bh(i)}
          rx='7'
          fill='var(--pv2-electric)'
        />
      ))}
      {steps.slice(0, -1).map((step, i) => {
        const x1 = cx(i) + 6;
        const x2 = cx(i + 1) - 6;
        const mx = (x1 + x2) / 2;
        const w = x2 - x1;
        const conv = Math.round(
          (100 * steps[i + 1].count) / (steps[i].count || 1)
        );
        const lost = steps[i].count - steps[i + 1].count;
        const bench = dropoff.benchmarks[i];
        const delta = bench == null ? 0 : conv - bench;
        const worse = bench != null && delta <= -5;
        const better = bench != null && delta >= 5;
        const verdict =
          bench == null
            ? ''
            : worse
              ? t('belowTypical', { pts: Math.abs(delta) })
              : better
                ? t('aboveTypical', { pts: delta })
                : t('typical');
        const color = worse
          ? 'var(--pv2-error)'
          : better
            ? 'var(--pv2-success)'
            : 'var(--pv2-faint)';
        const stage = stages[i];
        return (
          <g
            key={`seg-${step.key}`}
            role='button'
            aria-label={stage?.name ?? ''}
            className='cursor-pointer'
            onClick={onOpenStage}
          >
            <rect
              x={x1}
              y={RIB_Y}
              width={w}
              height={RIB_H}
              rx='9'
              fill={
                worse
                  ? 'color-mix(in srgb, var(--pv2-error) 6%, var(--pv2-paper))'
                  : better
                    ? 'color-mix(in srgb, var(--pv2-success) 6%, var(--pv2-paper))'
                    : 'var(--pv2-canvas)'
              }
              stroke={
                worse
                  ? 'color-mix(in srgb, var(--pv2-error) 30%, var(--pv2-hair))'
                  : better
                    ? 'color-mix(in srgb, var(--pv2-success) 30%, var(--pv2-hair))'
                    : 'var(--pv2-hair)'
              }
            />
            <text
              x={mx}
              y={RIB_Y + 13}
              textAnchor='middle'
              fontSize='8.5'
              fontWeight='700'
              letterSpacing='.5'
              fill={
                worse
                  ? 'var(--pv2-error)'
                  : better
                    ? 'var(--pv2-success)'
                    : 'var(--pv2-mut)'
              }
            >
              {stage
                ? `${stage.name.toUpperCase()} · ${t('touchpointsCount', { count: stage.auditedCount })}`
                : ''}
            </text>
            <text
              x={mx}
              y={RIB_Y + 35}
              textAnchor='middle'
              fontSize='14'
              fontWeight='600'
              fill='var(--pv2-ink)'
            >
              {conv}%
              <tspan
                fontSize='9.5'
                fontWeight='500'
                fill='var(--pv2-faint)'
                dx='4'
              >
                {t('segContinue')}
              </tspan>
            </text>
            <text
              x={mx}
              y={RIB_Y + 47}
              textAnchor='middle'
              fontSize='9.5'
              fill='var(--pv2-mut)'
            >
              {t('segLeave', {
                lost: formatCount(lost),
                total: formatCount(steps[i].count),
              })}
            </text>
            <text
              x={mx}
              y={RIB_Y + 56}
              textAnchor='middle'
              fontSize='8.5'
              fill={color}
            >
              {worse ? '▼ ' : better ? '▲ ' : ''}
              {verdict}
            </text>
          </g>
        );
      })}
      {dropoff.leaks.map(leak => {
        const x1 = cx(leak.fromStep) + 6;
        const x2 = cx(leak.toStep) - 6;
        const mx = (x1 + x2) / 2;
        const tw = Math.min(158, x2 - x1 - 18);
        const active = leak.id === selectedLeakId;
        return (
          <g
            key={leak.id}
            role='button'
            aria-label={leak.title}
            className='cursor-pointer'
            onClick={() => onSelectLeak(leak.id)}
          >
            <line
              x1={mx}
              y1={RIB_Y + RIB_H}
              x2={mx}
              y2={TAG_Y}
              stroke='var(--pv2-error)'
              strokeWidth='1.2'
              strokeDasharray='2 3'
              opacity='.8'
            />
            <rect
              x={mx - tw / 2}
              y={TAG_Y}
              width={tw}
              height={TAG_H}
              rx='9'
              fill={active ? 'var(--pv2-error)' : 'var(--pv2-paper)'}
              stroke='var(--pv2-error)'
              strokeWidth='1.3'
            />
            <text
              x={mx}
              y={TAG_Y + 18}
              textAnchor='middle'
              fontSize='12'
              fontWeight='700'
              fill={active ? 'var(--pv2-paper)' : 'var(--pv2-error)'}
            >
              −{formatMoney(leak.usd)}/mo
            </text>
            <text
              x={mx}
              y={TAG_Y + 31}
              textAnchor='middle'
              fontSize='8.5'
              fill={active ? 'var(--pv2-paper)' : 'var(--pv2-faint)'}
              opacity={active ? 0.9 : 1}
            >
              {(() => {
                const name = tpNameOf(leak.touchpointId);
                return name.length > 22 ? `${name.slice(0, 21)}…` : name;
              })()}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
