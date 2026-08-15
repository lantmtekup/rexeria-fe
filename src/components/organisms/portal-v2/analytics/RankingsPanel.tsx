'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { PulseRow } from '@/components/organisms/portal-v2/analytics/PulseRow';
import { INSIGHT_TYPES } from '@/lib/portal-v2/analytics/constants';
import {
  findInsightItem,
  insItems,
  sortInsightItems,
} from '@/lib/portal-v2/analytics/insights';
import {
  clearInsightObject,
  openInsightCareer,
} from '@/lib/portal-v2/analytics/params';
import type {
  BlockInsightItem,
  ExperienceInsightItem,
  InsightItem,
  InsightType,
  JourneyInsightItem,
  ProductInsightItem,
  PulseViewState,
} from '@/lib/portal-v2/analytics/types';
import {
  fmtAssist,
  fmtCount,
  fmtLift,
  fmtMoney,
  fmtPct,
} from '@/lib/portal-v2/analytics/helpers';
import { cn } from '@/lib/cn';
import {
  fetchExperienceRankings,
  fetchProductRankings,
} from '@/services/portal-v2/rankingsFacts';

import { RankingCareer } from '@/components/organisms/portal-v2/analytics/RankingCareer';

type RankingsPanelProps = {
  state: PulseViewState;
  onStateChange: (state: PulseViewState) => void;
  brandId: string | null;
};

/** `experiences`/`products` read `/intel/experiences`/`/intel/subjects` —
 *  real. `journeys`/`blocks` still run `insItems()`'s mock — see insights.ts. */
const REAL_TYPES: ReadonlySet<InsightType> = new Set([
  'experiences',
  'products',
]);

export const RankingsPanel = ({
  state,
  onStateChange,
  brandId,
}: RankingsPanelProps) => {
  const t = useTranslations('portalV2.analytics');
  const type = state.insightType;
  const real = REAL_TYPES.has(type);

  const [realItems, setRealItems] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(real);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!real) return;
    let alive = true;
    setLoading(true);
    setError(null);
    const fetcher =
      type === 'experiences' ? fetchExperienceRankings : fetchProductRankings;
    void fetcher(brandId).then(res => {
      if (!alive) return;
      setRealItems(res.items);
      setError(res.error);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [type, real, brandId]);

  const items = sortInsightItems(type, real ? realItems : insItems(type));

  if (state.insightObjectId) {
    const selected = findInsightItem(type, state.insightObjectId, items);
    if (selected) {
      return (
        <RankingCareer
          item={selected}
          onBack={() => onStateChange(clearInsightObject(state))}
        />
      );
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      {/*
        `journeys`/`blocks` CHƯA nối API: chưa endpoint nào gộp theo cả thư
        viện (xem docs/be-analytics-gaps). `experiences`/`products` đã ráp
        `/intel/experiences`/`/intel/subjects` thật — không cần cảnh báo nữa.
      */}
      {!real ? (
        <p className='rounded-[var(--pv2-r-sm)] border border-[var(--pv2-warning)] bg-[color-mix(in_srgb,var(--pv2-warning)_10%,transparent)] px-3 py-2 text-[12.5px] text-[var(--pv2-ink)]'>
          {t('empty.mockNotice')}
        </p>
      ) : null}

      <div className='flex flex-wrap gap-2'>
        {INSIGHT_TYPES.map(option => (
          <button
            key={option.id}
            type='button'
            onClick={() =>
              onStateChange({
                ...state,
                insightType: option.id,
                insightObjectId: null,
              })
            }
            className={cn(
              'rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors',
              type === option.id
                ? 'border-[var(--pv2-ink)] bg-[var(--pv2-ink)] text-[var(--pv2-paper)]'
                : 'border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-[var(--pv2-mut)] hover:border-[var(--pv2-ink)]'
            )}
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>

      <p className='text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
        {t(`rankings.intro.${type}`)}
      </p>

      {real && loading ? (
        <p className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-4 py-8 text-center text-[13px] text-[var(--pv2-faint)]'>
          {t('loading')}
        </p>
      ) : real && error ? (
        <p className='rounded-[var(--pv2-r-sm)] border border-[var(--pv2-error)] px-3 py-2 text-[12.5px] text-[var(--pv2-error)]'>
          {t('empty.rankingsError')}
        </p>
      ) : !items.length ? (
        <p className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-4 py-8 text-center text-[13px] text-[var(--pv2-faint)]'>
          {t('empty.rankings')}
        </p>
      ) : (
        <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
          {items.map(item => (
            <RankingRow
              key={item.id}
              item={item}
              onOpen={() =>
                onStateChange(openInsightCareer(state, type, item.id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

const RankingRow = ({
  item,
  onOpen,
}: {
  item: InsightItem;
  onOpen: () => void;
}) => {
  const t = useTranslations('portalV2.analytics');

  if (item.type === 'blocks') {
    const block = item as BlockInsightItem;
    return (
      <PulseRow
        title={block.name}
        subtitle={`${block.sub} · ${block.role}${block.tracked ? '' : ` · ${t('rankings.untracked')}`}`}
        metrics={[
          `${fmtPct(block.interRate)} interact`,
          `${fmtPct(block.exitRate)} exit`,
          block.assist != null
            ? `${fmtAssist(block.assist)} assist`
            : t('rankings.untracked'),
        ]}
        onClick={onOpen}
      />
    );
  }

  const base = item as
    | ExperienceInsightItem
    | ProductInsightItem
    | JourneyInsightItem;
  const consistency =
    base.variance == null
      ? ''
      : base.variance < 0.1
        ? ` · ${t('rankings.consistent')}`
        : ` · ${t('rankings.variable')}`;

  let metrics: string[] = [];
  if (item.type === 'products') {
    const product = item as ProductInsightItem;
    metrics = [
      fmtMoney(product.rollup.revenue),
      fmtMoney(product.aov),
      product.bestExp
        ? t('rankings.sellsVia', { name: product.bestExp.name })
        : fmtPct(product.rollup.cvr),
    ];
  } else if (item.type === 'journeys') {
    const journey = item as JourneyInsightItem;
    metrics = [
      `${fmtPct(journey.completion)} complete`,
      journey.funnel.weakest
        ? t('rankings.leaksAt', {
            stage:
              journey.funnel.weakest.name.split('→')[1] ??
              journey.funnel.weakest.name,
          })
        : '—',
      `${fmtLift(journey.rollup.lift)} lift${consistency}`,
    ];
  } else {
    const experience = item as ExperienceInsightItem;
    metrics = [
      experience.role ?? '—',
      `${fmtLift(experience.rollup.lift)} lift${consistency}`,
      experience.bestChannel
        ? t('rankings.bestOn', { channel: experience.bestChannel.channel })
        : fmtPct(experience.rollup.cvr),
    ];
  }

  return (
    <PulseRow
      title={base.name}
      subtitle={t('rankings.rowMeta', {
        campaigns: base.campaigns,
        sessions: fmtCount(base.rollup.sessions),
      })}
      metrics={metrics}
      onClick={onOpen}
    />
  );
};
