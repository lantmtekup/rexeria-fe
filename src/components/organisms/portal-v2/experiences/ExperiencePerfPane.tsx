'use client';

import { useTranslations } from 'next-intl';

import {
  formatCount,
  formatLift,
  formatMoney,
  formatPct01,
} from '@/lib/portal-v2/experiences/helpers';
import type {
  ExperienceStats,
  ExperienceView,
} from '@/lib/portal-v2/experiences/types';
import { cn } from '@/lib/cn';

type ExperiencePerfPaneProps = {
  experience: ExperienceView;
  /** null = chưa chạy lần nào. Không phải "chạy rồi mà bằng 0". */
  stats: ExperienceStats | null;
};

const Kpi = ({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: string;
}) => (
  <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-3.5 py-3'>
    <span className='text-[11px] font-semibold tracking-[0.03em] text-[var(--pv2-faint)] uppercase'>
      {label}
    </span>
    <p
      className='mt-1 font-[family-name:var(--pv2-disp)] text-[1.375rem] leading-none font-bold tabular-nums'
      style={{ color: tone ?? 'var(--pv2-ink)' }}
    >
      {value}
    </p>
    <p className='mt-1.5 text-[11.5px] text-[var(--pv2-mut)]'>{sub}</p>
  </div>
);

/**
 * The stages, in order, each a subset of the one above it.
 *
 * `bar` used to be the funnel ROLE's colour (ATT amber … CON mint). The role is
 * gone; the measured funnel is not, so the stages keep their own ramp — one
 * hue darkening as the shopper goes deeper, which reads as progress rather
 * than as five unrelated categories.
 */
const FUNNEL_STAGES: {
  labelKey: string;
  bar: string;
  pick: (s: ExperienceStats) => number;
}[] = [
  {
    labelKey: 'funnelSessions',
    bar: 'color-mix(in srgb, var(--pv2-electric) 35%, transparent)',
    pick: s => s.sessions,
  },
  {
    labelKey: 'funnelEngaged',
    bar: 'color-mix(in srgb, var(--pv2-electric) 55%, transparent)',
    pick: s => s.engaged,
  },
  {
    labelKey: 'funnelExplored',
    bar: 'color-mix(in srgb, var(--pv2-electric) 75%, transparent)',
    pick: s => s.explored,
  },
  {
    labelKey: 'funnelConvinced',
    bar: 'var(--pv2-electric)',
    pick: s => s.convinced,
  },
  {
    labelKey: 'funnelConverted',
    bar: 'var(--pv2-success)',
    pick: s => s.converted,
  },
];

export const ExperiencePerfPane = ({
  experience,
  stats,
}: ExperiencePerfPaneProps) => {
  const t = useTranslations('portalV2.experiences');

  /* R5, structurally: no fact rows means no numbers — not zeroes, none. */
  if (!stats) {
    return (
      <div className='rounded-[var(--pv2-r-lg)] border border-dashed border-[var(--pv2-hair)] px-6 py-12 text-center'>
        <p className='font-[family-name:var(--pv2-disp)] text-[15px] font-bold text-[var(--pv2-ink)]'>
          {t('perfEmptyTitle')}
        </p>
        <p className='mx-auto mt-2 max-w-[52ch] text-[13px] leading-relaxed text-[var(--pv2-mut)]'>
          {t('perfEmptyBody')}
        </p>
      </div>
    );
  }

  const liftUp = stats.lift >= 0;

  return (
    <div className='grid gap-6 md:grid-cols-[minmax(0,1fr)_240px]'>
      <div className='min-w-0'>
        <div className='grid grid-cols-2 gap-2.5'>
          <Kpi
            label={t('kpiSessions')}
            value={formatCount(stats.sessions)}
            sub={t('kpiSessionsSub', { count: stats.campaigns })}
          />
          <Kpi
            label={t('kpiLift')}
            value={formatLift(stats.lift)}
            sub={t('kpiLiftSub')}
            tone={liftUp ? '#0e9d6e' : '#9a2436'}
          />
          <Kpi
            label={t('kpiCvr')}
            value={formatPct01(stats.cvr)}
            sub={t('kpiCvrSub')}
          />
          <Kpi
            label={t('kpiRevenue')}
            value={formatMoney(stats.revenue)}
            sub={t('kpiRevenueSub', { count: formatCount(stats.leads) })}
          />
        </div>

        <section className='mt-5 border-t border-[var(--pv2-hair)] pt-5'>
          <h3 className='font-[family-name:var(--pv2-disp)] text-[15px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
            {t('funnelHeading')}
          </h3>
          <ul className='mt-3 flex flex-col gap-2'>
            {FUNNEL_STAGES.map(stage => {
              const value = stage.pick(stats);
              const pct = stats.sessions ? (value / stats.sessions) * 100 : 0;
              return (
                <li key={stage.labelKey}>
                  <div className='flex items-baseline justify-between gap-3'>
                    <span className='text-[12px] font-semibold text-[var(--pv2-ink)]'>
                      {t(stage.labelKey)}
                    </span>
                    <span className='text-[12px] text-[var(--pv2-mut)] tabular-nums'>
                      {formatCount(value)}
                      <span className='ml-1.5 text-[var(--pv2-faint)]'>
                        {Math.round(pct)}%
                      </span>
                    </span>
                  </div>
                  <div className='mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--pv2-canvas)]'>
                    <span
                      className='block h-full rounded-full'
                      style={{ width: `${pct}%`, background: stage.bar }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className='mt-3 max-w-[62ch] text-[12px] leading-relaxed text-[var(--pv2-faint)]'>
            {t('funnelHint')}
          </p>
        </section>
      </div>

      <aside className='flex min-w-0 flex-col gap-3'>
        <section className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-3.5 py-3'>
          <h3 className='font-[family-name:var(--pv2-disp)] text-[13px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
            {t('whereItRuns')}
          </h3>
          <p className='mt-2 text-[11px] font-semibold tracking-[0.03em] text-[var(--pv2-faint)] uppercase'>
            {t('campaignLabel')}
          </p>
          <ul className='mt-1 flex flex-col gap-0.5'>
            {stats.campaignNames.map(name => (
              <li key={name} className='text-[12.5px] text-[var(--pv2-ink)]'>
                {name}
              </li>
            ))}
          </ul>
          <p className='mt-2.5 text-[11px] font-semibold tracking-[0.03em] text-[var(--pv2-faint)] uppercase'>
            {t('channelsLabel')}
          </p>
          <div className='mt-1 flex flex-wrap gap-1.5'>
            {stats.channels.map(channel => (
              <span
                key={channel}
                className='rounded-full border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-2 py-0.5 text-[11px] text-[var(--pv2-mut)]'
              >
                {channel}
              </span>
            ))}
          </div>
        </section>

        {/*
          Ẩn mục rỗng: `features`/`benefits` là chữ do người soạn, phần lớn bản
          ghi bỏ trống. Một tiêu đề không có gì bên dưới đọc như đang hỏng.
        */}
        {[
          { key: 'featuresHeading', items: experience.features },
          { key: 'benefitsHeading', items: experience.benefits },
        ]
          .filter(({ items }) => items.length > 0)
          .map(({ key, items }) => (
            <section
              key={key}
              className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-3.5 py-3'
            >
              <h3 className='font-[family-name:var(--pv2-disp)] text-[13px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
                {t(key)}
              </h3>
              <ul className={cn('mt-2 flex flex-col gap-1.5')}>
                {items.map(item => (
                  <li
                    key={item}
                    className='flex gap-2 text-[12px] leading-relaxed text-[var(--pv2-mut)]'
                  >
                    <span
                      className='mt-1.5 size-1 shrink-0 rounded-full bg-[var(--pv2-slate-300)]'
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </aside>
    </div>
  );
};
