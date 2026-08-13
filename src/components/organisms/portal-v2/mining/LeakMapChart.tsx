import { MINING_PHASE_LABELS } from '@/lib/portal-v2/mining/constants';
import {
  formatMiningCount,
  formatMiningMoney,
} from '@/lib/portal-v2/mining/helpers';
import type {
  MiningOpportunity,
  MiningStage,
} from '@/lib/portal-v2/mining/types';

type LeakMapChartProps = {
  stages: MiningStage[];
  opportunities: MiningOpportunity[];
  selectedId: string;
  onSelect: (id: string) => void;
  ariaLabel: string;
  riskLabel: string;
};

const centerX = (index: number): number => 80 + index * 210;
const barHeight = (count: number, max: number): number =>
  Math.max(13, (count / max) * 150);

export const LeakMapChart = ({
  stages,
  opportunities,
  selectedId,
  onSelect,
  ariaLabel,
  riskLabel,
}: LeakMapChartProps) => {
  const middleY = 145;
  const barWidth = 58;
  const maximum = stages[0]?.count || 1;
  const maxRisk = Math.max(...opportunities.map(item => item.risk), 1);

  return (
    <div className='w-full overflow-x-auto pb-1'>
      <svg
        viewBox='0 0 1000 360'
        role='img'
        aria-label={ariaLabel}
        className='min-w-190'
      >
        {stages.slice(1).map((stage, index) => {
          const currentIndex = index + 1;
          const previous = stages[index]!;
          const currentHeight = barHeight(stage.count, maximum);
          const previousHeight = barHeight(previous.count, maximum);
          const startX = centerX(index) + barWidth / 2 - 1;
          const finishX = centerX(currentIndex) - barWidth / 2 + 1;
          const controlX = (startX + finishX) / 2;
          const topStart = middleY - previousHeight / 2;
          const bottomStart = middleY + previousHeight / 2;
          const topFinish = middleY - currentHeight / 2;
          const bottomFinish = middleY + currentHeight / 2;
          const radius = 10;

          return (
            <path
              key={`flow-${stage.id}`}
              d={`M${startX + radius},${topStart} C${controlX},${topStart} ${controlX},${topFinish} ${finishX - radius},${topFinish} Q${finishX},${topFinish} ${finishX},${topFinish + radius} L${finishX},${bottomFinish - radius} Q${finishX},${bottomFinish} ${finishX - radius},${bottomFinish} C${controlX},${bottomFinish} ${controlX},${bottomStart} ${startX + radius},${bottomStart} Q${startX},${bottomStart} ${startX},${bottomStart - radius} L${startX},${topStart + radius} Q${startX},${topStart} ${startX + radius},${topStart} Z`}
              fill='var(--pv2-electric-soft)'
            />
          );
        })}

        {stages.map((stage, index) => {
          const height = barHeight(stage.count, maximum);
          return (
            <g key={stage.id}>
              <text
                x={centerX(index)}
                y='21'
                textAnchor='middle'
                fill='var(--pv2-mut)'
                fontSize='12'
              >
                {stage.label}
              </text>
              <text
                x={centerX(index)}
                y='43'
                textAnchor='middle'
                fill='var(--pv2-ink)'
                fontSize='15'
                fontWeight='700'
              >
                {formatMiningCount(stage.count)}
              </text>
              <text
                x={centerX(index)}
                y='59'
                textAnchor='middle'
                fill='var(--pv2-faint)'
                fontSize='9.5'
                letterSpacing='.5'
              >
                ≈ {MINING_PHASE_LABELS[stage.phase].toUpperCase()}
              </text>
              <rect
                x={centerX(index) - barWidth / 2}
                y={middleY - height / 2}
                width={barWidth}
                height={height}
                rx='10'
                fill='var(--pv2-electric)'
              />
            </g>
          );
        })}

        {opportunities.map(opportunity => {
          const nextStage = stages[opportunity.leakAfter + 1];
          if (!nextStage) return null;
          const startX = centerX(opportunity.leakAfter) + barWidth / 2;
          const finishX = centerX(opportunity.leakAfter + 1) - barWidth / 2;
          const x = (startX + finishX) / 2;
          const nextHeight = barHeight(nextStage.count, maximum);
          const depth =
            middleY + 80 + 16 + Math.round((opportunity.risk / maxRisk) * 42);
          const selected = opportunity.id === selectedId;

          return (
            <g
              key={opportunity.id}
              role='button'
              tabIndex={0}
              aria-label={`${opportunity.title}: ${formatMiningMoney(opportunity.risk)} ${riskLabel}`}
              className='cursor-pointer outline-none'
              onClick={() => onSelect(opportunity.id)}
              onKeyDown={event => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                onSelect(opportunity.id);
              }}
            >
              <line
                x1={x}
                y1={middleY + nextHeight / 2 + 10}
                x2={x}
                y2={depth}
                stroke='var(--pv2-error)'
                strokeWidth='2'
                strokeDasharray='2 6'
                opacity='.7'
              />
              <circle
                cx={x}
                cy={depth}
                r='5'
                fill='var(--pv2-error)'
                opacity='.85'
              />
              <rect
                x={x - 63}
                y={depth + 11}
                width='126'
                height='42'
                rx='10'
                fill={selected ? 'var(--pv2-error)' : 'var(--pv2-paper)'}
                stroke='var(--pv2-error)'
                strokeWidth={selected ? 2 : 1.2}
              />
              <text
                x={x}
                y={depth + 29}
                textAnchor='middle'
                fontSize='13'
                fontWeight='700'
                fill={selected ? 'var(--pv2-paper)' : 'var(--pv2-error)'}
              >
                −{formatMiningMoney(opportunity.risk)}
              </text>
              <text
                x={x}
                y={depth + 45}
                textAnchor='middle'
                fontSize='10'
                fill={selected ? 'var(--pv2-paper)' : 'var(--pv2-mut)'}
              >
                {riskLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
