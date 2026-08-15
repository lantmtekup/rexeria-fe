'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PulseMetricHead } from '@/components/organisms/portal-v2/analytics/PulseMetricHead';
import { PulseRow } from '@/components/organisms/portal-v2/analytics/PulseRow';
import {
  fmtAssist,
  fmtCount,
  fmtLift,
  fmtMoney,
  fmtPct,
} from '@/lib/portal-v2/analytics/helpers';
import type {
  BlockInsightItem,
  ExperienceInsightItem,
  InsightItem,
  JourneyInsightItem,
  ProductInsightItem,
} from '@/lib/portal-v2/analytics/types';
import { cn } from '@/lib/cn';

type RankingCareerProps = {
  item: InsightItem;
  onBack: () => void;
};

/**
 * `experiences` reports a real, session-weighted coverage aggregate from the
 * BE (`/intel/experiences`) — used directly. `products` is real too but the
 * BE doesn't compute a per-subject coverage aggregate (§2.2-style gap), so it
 * has none yet — `null`, not a rows-based guess. `journeys` still runs on
 * mock `PulseFactRow[]` (see `insights.ts`) and keeps the old per-row calc
 * until it, too, is wired to a real endpoint.
 */
const coveragePctOf = (
  item: ExperienceInsightItem | ProductInsightItem | JourneyInsightItem
): number | null => {
  if (item.type === 'experiences') {
    return item.coveragePct != null ? Math.round(item.coveragePct * 100) : null;
  }
  if (item.type === 'products') return null;
  if (!item.rows.length) return null;
  return Math.round(
    (item.rows.reduce((sum, row) => sum + row.coveragePct * row.sessions, 0) /
      Math.max(item.rollup.sessions, 1)) *
      100
  );
};

export const RankingCareer = ({ item, onBack }: RankingCareerProps) => {
  const t = useTranslations('portalV2.analytics');

  if (item.type === 'blocks') {
    return (
      <BlockCareer item={item} onBack={onBack} title={t('rankings.blocks')} />
    );
  }

  const base = item as
    | ExperienceInsightItem
    | ProductInsightItem
    | JourneyInsightItem;
  const splits = [...base.splits].sort(
    (a, b) => (b.rollup.lift ?? -1) - (a.rollup.lift ?? -1)
  );

  const consistency =
    base.variance == null
      ? t('rankings.consistencySingle')
      : base.variance < 0.1
        ? t('rankings.consistencyStable', {
            points: Math.round(base.variance * 100),
            campaigns: base.campaigns,
          })
        : t('rankings.consistencyVariable', {
            points: Math.round(base.variance * 100),
            campaigns: base.campaigns,
          });

  return (
    <div className='flex flex-col gap-5'>
      <button
        type='button'
        onClick={onBack}
        className='inline-flex items-center gap-2 text-[12.5px] font-semibold text-[var(--pv2-electric)]'
      >
        <ArrowLeft className='size-4' aria-hidden />
        {t('rankings.back', { type: t(`rankings.${item.type}`) })}
      </button>

      <PulseMetricHead
        rollup={base.rollup}
        coveragePct={coveragePctOf(base)}
        labels={{
          sessions: t('metrics.sessions'),
          conversion: t('metrics.conversion'),
          revenue: t('metrics.revenue'),
          roas: t('metrics.roas'),
          coverage: t('metrics.coverage'),
        }}
      />

      {item.type === 'experiences' ? (
        <ExperienceSignature item={item as ExperienceInsightItem} />
      ) : null}
      {item.type === 'products' ? (
        <ProductSignature item={item as ProductInsightItem} />
      ) : null}
      {item.type === 'journeys' ? (
        <JourneySignature item={item as JourneyInsightItem} />
      ) : null}

      <section>
        <p className='mb-3 text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
          {t('rankings.trackRecord')}
        </p>
        <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
          {splits.map(split => (
            <PulseRow
              key={split.campaignId}
              title={split.campaignName}
              subtitle={`${fmtCount(split.rollup.sessions)} sessions`}
              metrics={[
                `${fmtPct(split.rollup.cvr)} cvr`,
                `${fmtLift(split.rollup.lift)} lift`,
              ]}
            />
          ))}
        </div>
      </section>

      <p className='text-[11.5px] leading-relaxed text-[var(--pv2-faint)]'>
        {consistency}
        {base.rollup.sessions < 500 ? ` ${t('rankings.thinSample')}` : ''}{' '}
        {t('rankings.disclaimer')}
      </p>
    </div>
  );
};

const SignatureGrid = ({
  cells,
}: {
  cells: { label: string; value: string }[];
}) => (
  <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
    {cells.map(cell => (
      <div
        key={cell.label}
        className='rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3 py-3'
      >
        <p className='text-[10px] font-bold tracking-[0.1em] text-[var(--pv2-faint)] uppercase'>
          {cell.label}
        </p>
        <strong className='mt-1 block text-[14px] text-[var(--pv2-ink)]'>
          {cell.value}
        </strong>
      </div>
    ))}
  </div>
);

const FunnelBars = ({
  steps,
  weakestName,
}: {
  steps: { name: string; rate: number | null }[];
  weakestName: string | null;
}) => (
  <div className='mt-4 space-y-2'>
    {steps.map(step => (
      <div
        key={step.name}
        className='grid grid-cols-[minmax(0,1.2fr)_1fr_auto] items-center gap-3'
      >
        <span className='truncate text-[12px] text-[var(--pv2-mut)]'>
          {step.name}
        </span>
        <span className='h-2 overflow-hidden rounded-full bg-[var(--pv2-canvas)]'>
          <span
            className={cn(
              'block h-full rounded-full',
              weakestName === step.name
                ? 'bg-[var(--pv2-error)]'
                : 'bg-[var(--pv2-electric)]'
            )}
            style={{
              width: `${step.rate != null ? Math.round(step.rate * 100) : 0}%`,
            }}
          />
        </span>
        <span className='text-[12px] text-[var(--pv2-ink)] tabular-nums'>
          {fmtPct(step.rate)}
        </span>
      </div>
    ))}
  </div>
);

const ExperienceSignature = ({ item }: { item: ExperienceInsightItem }) => {
  const t = useTranslations('portalV2.analytics');
  return (
    <section>
      <p className='mb-3 text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
        {t('rankings.contribution')}
      </p>
      <SignatureGrid
        cells={[
          { label: t('rankings.funnelRole'), value: item.role ?? '—' },
          {
            label: t('rankings.bestChannel'),
            value: item.bestChannel?.channel ?? '—',
          },
          {
            label: t('rankings.engagementDepth'),
            value: item.depth != null ? fmtPct(item.depth) : '—',
          },
          {
            label: t('metrics.revenue'),
            value: fmtMoney(item.rollup.revenue),
          },
        ]}
      />
      <FunnelBars
        steps={item.funnel.steps}
        weakestName={item.funnel.weakest?.name ?? null}
      />
    </section>
  );
};

const ProductSignature = ({ item }: { item: ProductInsightItem }) => {
  const t = useTranslations('portalV2.analytics');
  return (
    <section>
      <p className='mb-3 text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
        {t('rankings.contribution')}
      </p>
      <SignatureGrid
        cells={[
          { label: t('metrics.revenue'), value: fmtMoney(item.rollup.revenue) },
          { label: t('rankings.aov'), value: fmtMoney(item.aov) },
          {
            label: t('rankings.cac'),
            value: item.cac != null ? fmtMoney(item.cac) : '—',
          },
          {
            label: t('rankings.sellsBestVia'),
            value: item.bestExp?.name ?? '—',
          },
        ]}
      />
    </section>
  );
};

const JourneySignature = ({ item }: { item: JourneyInsightItem }) => {
  const t = useTranslations('portalV2.analytics');
  return (
    <section>
      <p className='mb-3 text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
        {t('rankings.contribution')}
      </p>
      <SignatureGrid
        cells={[
          {
            label: t('rankings.completion'),
            value: fmtPct(item.completion),
          },
          {
            label: t('rankings.weakestStage'),
            value: item.funnel.weakest
              ? (item.funnel.weakest.name.split('→')[1] ??
                item.funnel.weakest.name)
              : '—',
          },
          {
            label: t('rankings.strongestStep'),
            value: item.funnel.strongest
              ? (item.funnel.strongest.name.split('→')[1] ??
                item.funnel.strongest.name)
              : '—',
          },
          {
            label: t('rankings.consistencyLabel'),
            value:
              item.variance == null
                ? 'n/a'
                : item.variance < 0.1
                  ? t('rankings.consistent')
                  : t('rankings.variable'),
          },
        ]}
      />
      <FunnelBars
        steps={item.funnel.steps}
        weakestName={item.funnel.weakest?.name ?? null}
      />
    </section>
  );
};

const BlockCareer = ({
  item,
  onBack,
  title,
}: {
  item: BlockInsightItem;
  onBack: () => void;
  title: string;
}) => {
  const t = useTranslations('portalV2.analytics');
  const byCampaign = new Map<
    string,
    { name: string; views: number; inter: number; exits: number }
  >();

  item.rows.forEach(row => {
    const block = row.blocks[item.blockIndex];
    if (!block) return;
    const current = byCampaign.get(row.campaignId) ?? {
      name: row.campaignName,
      views: 0,
      inter: 0,
      exits: 0,
    };
    current.views += block.views;
    current.inter += block.inter;
    current.exits += block.exits;
    byCampaign.set(row.campaignId, current);
  });

  return (
    <div className='flex flex-col gap-5'>
      <button
        type='button'
        onClick={onBack}
        className='inline-flex items-center gap-2 text-[12.5px] font-semibold text-[var(--pv2-electric)]'
      >
        <ArrowLeft className='size-4' aria-hidden />
        {t('rankings.back', { type: title })}
      </button>

      <div className='grid grid-cols-2 gap-px overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-hair)] sm:grid-cols-4'>
        {[
          [fmtPct(item.interRate), t('block.interaction')],
          [fmtPct(item.exitRate), t('block.exit')],
          [fmtPct(item.doneRate), t('block.completion')],
          [`${Math.round(item.dwell)}s`, t('block.dwell')],
        ].map(([value, label]) => (
          <div key={label} className='bg-[var(--pv2-paper)] px-4 py-4'>
            <p className='text-[10px] font-bold tracking-[0.11em] text-[var(--pv2-faint)] uppercase'>
              {label}
            </p>
            <strong className='mt-1 block text-xl text-[var(--pv2-ink)]'>
              {value}
            </strong>
          </div>
        ))}
      </div>

      <SignatureGrid
        cells={[
          { label: t('rankings.role'), value: item.role },
          {
            label: t('rankings.assist'),
            value:
              item.assist != null
                ? fmtAssist(item.assist)
                : t('rankings.untracked'),
          },
          { label: t('rankings.livesIn'), value: item.sub },
          { label: t('rankings.campaignCount'), value: String(item.campaigns) },
        ]}
      />

      <section>
        <p className='mb-3 text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
          {t('rankings.blockHold')}
        </p>
        <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
          {[...byCampaign.values()].map(campaign => (
            <PulseRow
              key={campaign.name}
              title={campaign.name}
              subtitle={`${fmtCount(campaign.views)} views`}
              metrics={[
                `${fmtPct(campaign.views ? campaign.inter / campaign.views : 0)} interact`,
                `${fmtPct(campaign.views ? campaign.exits / campaign.views : 0)} exit`,
              ]}
            />
          ))}
        </div>
      </section>

      <p className='text-[11.5px] leading-relaxed text-[var(--pv2-faint)]'>
        {t('rankings.blockDisclaimer')}
      </p>
    </div>
  );
};
