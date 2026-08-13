import {
  formatMiningCount,
  formatMiningMoney,
} from '@/lib/portal-v2/mining/helpers';
import type { FunnelLeak, FunnelStep } from '@/lib/portal-v2/analytics/types';

type PulseFunnelChartProps = {
  steps: FunnelStep[];
  leaks: FunnelLeak[];
  ariaLabel: string;
  riskLabel: string;
};

const centerX = (index: number): number => 80 + index * 210;
const barHeight = (value: number, max: number): number =>
  Math.max(13, (value / max) * 150);

export const PulseFunnelChart = ({
  steps,
  leaks,
  ariaLabel,
  riskLabel,
}: PulseFunnelChartProps) => {
  const middleY = 145;
  const barWidth = 58;
  const maximum = steps[0]?.value || 1;
  const maxRisk = Math.max(...leaks.map(leak => leak.risk), 1);

  if (!steps.length || !steps[0]?.value) {
    return null;
  }

  return (
    <div className='w-full overflow-x-auto pb-1'>
      <svg
        viewBox='0 0 1000 360'
        role='img'
        aria-label={ariaLabel}
        className='min-w-190'
      >
        {steps.slice(1).map((step, index) => {
          const currentIndex = index + 1;
          const previous = steps[index]!;
          const currentHeight = barHeight(step.value, maximum);
          const previousHeight = barHeight(previous.value, maximum);
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
              key={`flow-${step.label}`}
              d={`M${startX + radius},${topStart} C${controlX},${topStart} ${controlX},${topFinish} ${finishX - radius},${topFinish} Q${finishX},${topFinish} ${finishX},${topFinish + radius} L${finishX},${bottomFinish - radius} Q${finishX},${bottomFinish} ${finishX - radius},${bottomFinish} C${controlX},${bottomFinish} ${controlX},${bottomStart} ${startX + radius},${bottomStart} Q${startX},${bottomStart} ${startX},${bottomStart - radius} L${startX},${topStart + radius} Q${startX},${topStart} ${startX + radius},${topStart} Z`}
              fill='var(--pv2-electric-soft)'
            />
          );
        })}

        {steps.map((step, index) => {
          const height = barHeight(step.value, maximum);
          return (
            <g key={step.label}>
              <text
                x={centerX(index)}
                y='21'
                textAnchor='middle'
                fill='var(--pv2-mut)'
                fontSize='12'
              >
                {step.label}
              </text>
              <text
                x={centerX(index)}
                y='43'
                textAnchor='middle'
                fill='var(--pv2-ink)'
                fontSize='15'
                fontWeight='700'
              >
                {formatMiningCount(step.value)}
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

        {leaks.map((leak, index) => {
          const nextStep = steps[index + 1];
          if (!nextStep) return null;
          const startX = centerX(index) + barWidth / 2;
          const finishX = centerX(index + 1) - barWidth / 2;
          const x = (startX + finishX) / 2;
          const nextHeight = barHeight(nextStep.value, maximum);
          const depth =
            middleY + 80 + 16 + Math.round((leak.risk / maxRisk) * 42);
          const hot = leak.risk === maxRisk;

          return (
            <g key={`${leak.after}-${leak.into}`}>
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
                fill={hot ? 'var(--pv2-error)' : 'var(--pv2-paper)'}
                stroke='var(--pv2-error)'
                strokeWidth={hot ? 2 : 1.2}
              />
              <text
                x={x}
                y={depth + 29}
                textAnchor='middle'
                fontSize='13'
                fontWeight='700'
                fill={hot ? 'var(--pv2-paper)' : 'var(--pv2-error)'}
              >
                −{formatMiningMoney(leak.risk)}
              </text>
              <text
                x={x}
                y={depth + 45}
                textAnchor='middle'
                fontSize='10'
                fill={hot ? 'var(--pv2-paper)' : 'var(--pv2-mut)'}
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
