import { scoreColor } from '@/lib/portal-v2/journey-audit/helpers';
import { cn } from '@/lib/cn';

type ScoreRingProps = {
  score: number;
  size: number;
  stroke: number;
  className?: string;
  numberClassName?: string;
};

/** Vòng điểm SVG của prototype (`ring()`) — số ở giữa, màu theo ngưỡng điểm. */
export const ScoreRing = ({
  score,
  size,
  stroke,
  className,
  numberClassName,
}: ScoreRingProps) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  return (
    <span
      className={cn('relative inline-block', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
        className='-rotate-90'
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='var(--pv2-hair)'
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke={scoreColor(score)}
          strokeWidth={stroke}
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        className={cn(
          'absolute inset-0 grid place-items-center font-semibold',
          numberClassName
        )}
        style={{ color: scoreColor(score) }}
      >
        {score}
      </span>
    </span>
  );
};
