import type { Experiment } from '@/lib/portal-v2/experiments/types';

type ExperimentDailyChartProps = {
  experiment: Experiment;
  controlLabel: string;
  variantLabel: string;
  emptyLabel: string;
  ariaLabel: string;
};

export const ExperimentDailyChart = ({
  experiment,
  controlLabel,
  variantLabel,
  emptyLabel,
  ariaLabel,
}: ExperimentDailyChartProps) => {
  if (!experiment.daily.length) {
    return (
      <div className='grid min-h-44 place-items-center rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-5 text-center text-xs text-[var(--pv2-faint)]'>
        {emptyLabel}
      </div>
    );
  }

  const width = 760;
  const height = 230;
  const paddingX = 42;
  const paddingTop = 22;
  const paddingBottom = 38;
  const values = experiment.daily.flat();
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const spread = Math.max(maximum - minimum, 0.5);
  const floor = Math.max(0, minimum - spread * 0.25);
  const ceiling = maximum + spread * 0.25;

  const pointX = (index: number): number =>
    paddingX +
    (index / Math.max(experiment.daily.length - 1, 1)) * (width - paddingX * 2);
  const pointY = (value: number): number =>
    paddingTop +
    ((ceiling - value) / Math.max(ceiling - floor, 0.1)) *
      (height - paddingTop - paddingBottom);
  const controlPoints = experiment.daily
    .map(([control], index) => `${pointX(index)},${pointY(control)}`)
    .join(' ');
  const variantPoints = experiment.daily
    .map(([, variant], index) => `${pointX(index)},${pointY(variant)}`)
    .join(' ');

  return (
    <div className='overflow-x-auto'>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role='img'
        aria-label={ariaLabel}
        className='min-w-155'
      >
        {[0, 0.5, 1].map(position => {
          const y =
            paddingTop + position * (height - paddingTop - paddingBottom);
          const value = ceiling - position * (ceiling - floor);
          return (
            <g key={position}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke='var(--pv2-hair)'
                strokeWidth='1'
              />
              <text
                x={paddingX - 8}
                y={y + 4}
                textAnchor='end'
                fill='var(--pv2-faint)'
                fontSize='10'
              >
                {value.toFixed(1)}%
              </text>
            </g>
          );
        })}
        <polyline
          points={controlPoints}
          fill='none'
          stroke='var(--pv2-faint)'
          strokeWidth='2'
          strokeDasharray='5 5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <polyline
          points={variantPoints}
          fill='none'
          stroke='var(--pv2-electric)'
          strokeWidth='3'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        {experiment.daily.map(([control, variant], index) => (
          <g key={`${control}-${variant}-${index}`}>
            <circle
              cx={pointX(index)}
              cy={pointY(control)}
              r='3'
              fill='var(--pv2-paper)'
              stroke='var(--pv2-faint)'
              strokeWidth='1.5'
            />
            <circle
              cx={pointX(index)}
              cy={pointY(variant)}
              r='3.5'
              fill='var(--pv2-paper)'
              stroke='var(--pv2-electric)'
              strokeWidth='2'
            />
            <text
              x={pointX(index)}
              y={height - 14}
              textAnchor='middle'
              fill='var(--pv2-faint)'
              fontSize='9'
            >
              {index + 1}
            </text>
          </g>
        ))}
      </svg>
      <div className='mt-1 flex justify-end gap-4 text-[10px] text-[var(--pv2-mut)]'>
        <span className='inline-flex items-center gap-1.5'>
          <span className='h-px w-5 border-t border-dashed border-[var(--pv2-faint)]' />
          {controlLabel}
        </span>
        <span className='inline-flex items-center gap-1.5'>
          <span className='h-0.5 w-5 bg-[var(--pv2-electric)]' />
          {variantLabel}
        </span>
      </div>
    </div>
  );
};
