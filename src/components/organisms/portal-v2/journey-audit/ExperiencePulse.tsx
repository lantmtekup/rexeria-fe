'use client';

import { useTranslations } from 'next-intl';

import { scoreColor } from '@/lib/portal-v2/journey-audit/helpers';

type PulsePoint = {
  stageName: string;
  score: number | null;
};

type ExperiencePulseProps = {
  points: PulsePoint[];
};

/**
 * Experience Pulse — đường trung bình điểm audit theo stage (SVG tay, mẫu
 * `renderPulse()` của prototype). Stage không nguồn vẽ chấm rời "no source".
 */
export const ExperiencePulse = ({ points }: ExperiencePulseProps) => {
  const t = useTranslations('portalV2.journeyAudit');
  const W = 1000;
  const H = 74;
  const padX = 60;
  const padY = 14;
  const stepX = (W - padX * 2) / Math.max(points.length - 1, 1);
  const y = (value: number): number =>
    padY + (H - padY * 2) * (1 - (value - 40) / 60); // thang 40..100

  const coords = points.map((point, index) =>
    point.score == null
      ? null
      : ([padX + index * stepX, y(Math.max(40, point.score))] as const)
  );
  const live = coords.filter((p): p is readonly [number, number] => p != null);
  const line = live
    .map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(' ');
  const area =
    live.length > 1
      ? `${line} L${live[live.length - 1][0]},${H} L${live[0][0]},${H} Z`
      : '';

  return (
    <div className='px-5 pt-3.5'>
      <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 pt-3 pb-1.5'>
        <div className='mb-0.5 flex items-baseline gap-2.5'>
          <h3 className='font-[family-name:var(--pv2-disp)] text-[13px] font-bold text-[var(--pv2-ink)]'>
            {t('pulseTitle')}
          </h3>
          <span className='text-2xs text-[var(--pv2-faint)]'>
            {t('pulseHint')}
          </span>
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio='none'
          className='block h-[74px] w-full'
          role='img'
          aria-label={t('pulseAria')}
        >
          <defs>
            <linearGradient id='ja-pulse-grad' x1='0' y1='0' x2='0' y2='1'>
              <stop
                offset='0'
                stopColor='var(--pv2-electric)'
                stopOpacity='.14'
              />
              <stop
                offset='1'
                stopColor='var(--pv2-electric)'
                stopOpacity='0'
              />
            </linearGradient>
          </defs>
          <line
            x1={padX}
            y1={y(80)}
            x2={W - padX}
            y2={y(80)}
            stroke='var(--pv2-success)'
            strokeOpacity='.35'
            strokeDasharray='3 5'
            strokeWidth='1'
          />
          <text
            x={W - padX + 6}
            y={y(80) + 3}
            fontSize='9'
            fill='var(--pv2-success)'
          >
            {t('pulseHealthy')}
          </text>
          {area ? <path d={area} fill='url(#ja-pulse-grad)' /> : null}
          {live.length > 1 ? (
            <path
              d={line}
              fill='none'
              stroke='var(--pv2-electric)'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          ) : null}
          {points.map((point, index) => {
            const x = padX + index * stepX;
            if (point.score == null) {
              return (
                <g key={point.stageName}>
                  <circle
                    cx={x}
                    cy={y(58)}
                    r='4.5'
                    fill='none'
                    stroke='var(--pv2-faint)'
                    strokeWidth='1.5'
                    strokeDasharray='2 2'
                  />
                  <text
                    x={x}
                    y={y(58) - 9}
                    textAnchor='middle'
                    fontSize='9'
                    fill='var(--pv2-faint)'
                  >
                    {t('pulseNoSource')}
                  </text>
                  <text
                    x={x}
                    y={H - 2}
                    textAnchor='middle'
                    fontSize='9.5'
                    fill='var(--pv2-faint)'
                  >
                    {point.stageName}
                  </text>
                </g>
              );
            }
            const p = coords[index]!;
            return (
              <g key={point.stageName}>
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r='4.5'
                  fill={scoreColor(point.score)}
                  stroke='var(--pv2-paper)'
                  strokeWidth='2'
                />
                <text
                  x={p[0]}
                  y={p[1] - 9}
                  textAnchor='middle'
                  fontSize='11'
                  fontWeight='600'
                  fill={scoreColor(point.score)}
                >
                  {point.score}
                </text>
                <text
                  x={p[0]}
                  y={H - 2}
                  textAnchor='middle'
                  fontSize='9.5'
                  fill='var(--pv2-faint)'
                >
                  {point.stageName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
