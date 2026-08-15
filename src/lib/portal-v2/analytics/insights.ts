import {
  buildPulseFacts,
  experienceRows,
  trackingCoverage,
} from '@/lib/portal-v2/analytics/facts';
import { retentionFunnel, rollup } from '@/lib/portal-v2/analytics/helpers';
import type {
  BlockInsightItem,
  InsightFunnel,
  InsightItem,
  InsightSplit,
  JourneyInsightItem,
  ProductInsightItem,
  PulseFactRow,
} from '@/lib/portal-v2/analytics/types';
import { MOCK_CAMPAIGN_EXPERIENCES } from '@/lib/portal-v2/campaigns/mock';
import { MOCK_JOURNEYS } from '@/lib/portal-v2/journeys/mock';

/**
 * Rankings tab — bảng xếp hạng toàn thư viện brand.
 *
 * `experiences`/`products` ráp thật rồi — xem `services/portal-v2/rankingsFacts.ts`
 * (`/intel/experiences`, `/intel/subjects`). `journeys`/`blocks` VẪN dùng mock
 * dưới đây: BE chưa có `/intel/journeys` (docs/be-analytics-gaps-2026-08-13.md
 * mục 1.4) và chưa có endpoint gộp block theo cả thư viện. `RankingsPanel.tsx`
 * chỉ gọi `insItems()` cho hai loại này — đường experiences/products bị bỏ
 * khỏi hàm để không còn ai gọi nhầm về mock nữa.
 */

const insSplit = (rows: PulseFactRow[]): InsightSplit[] => {
  const groups = new Map<string, PulseFactRow[]>();
  for (const row of rows) {
    groups.set(row.campaignId, [...(groups.get(row.campaignId) ?? []), row]);
  }

  return [...groups.entries()].map(([campaignId, group]) => ({
    campaignId,
    campaignName: group[0]?.campaignName ?? campaignId,
    rollup: rollup(group),
  }));
};

/** Exported for `rankingsFacts.ts` — the real experiences/products path needs
 *  the exact same cross-campaign-variance formula the mock path uses. */
export const insVar = (splits: InsightSplit[]): number | null => {
  const lifts = splits
    .map(split => split.rollup.lift)
    .filter(value => Number.isFinite(value));
  if (lifts.length < 2) return null;
  const mean = lifts.reduce((total, value) => total + value, 0) / lifts.length;
  return Math.sqrt(
    lifts.reduce((total, value) => total + (value - mean) ** 2, 0) /
      lifts.length
  );
};

const insFunnel = (total: ReturnType<typeof rollup>): InsightFunnel => {
  const steps = retentionFunnel(total);
  const valid = steps.filter(step => step.rate != null);
  return {
    steps,
    weakest: valid.length
      ? valid.reduce((a, b) => (b.rate! < a.rate! ? b : a))
      : null,
    strongest: valid.length
      ? valid.reduce((a, b) => (b.rate! > a.rate! ? b : a))
      : null,
  };
};

const insBlocks = (): BlockInsightItem[] => {
  const output: BlockInsightItem[] = [];
  const templates = MOCK_CAMPAIGN_EXPERIENCES.filter(item => item.template);

  for (const template of templates) {
    const rows = experienceRows(template.id);
    if (!rows.length) continue;
    const blockCount = rows[0]!.blocks.length;

    for (let index = 0; index < blockCount; index += 1) {
      const blockRows = rows.map(row => row.blocks[index]).filter(Boolean);
      if (!blockRows.length) continue;

      const views = blockRows.reduce((total, block) => total + block.views, 0);
      const inter = blockRows.reduce((total, block) => total + block.inter, 0);
      const exits = blockRows.reduce((total, block) => total + block.exits, 0);
      const done = blockRows.reduce((total, block) => total + block.done, 0);
      const dwell =
        views === 0
          ? 0
          : blockRows.reduce(
              (total, block) => total + block.dwell * block.views,
              0
            ) / views;
      const comps = blockRows.flatMap(block => block.comps);
      const assist = comps.length
        ? comps.reduce((total, comp) => total + comp.assist, 0) / comps.length
        : null;

      output.push({
        type: 'blocks',
        id: `${template.id}:${index}`,
        name: blockRows[0]!.name,
        sub: template.name,
        role: blockRows[0]!.role,
        blockIndex: index,
        originId: template.id,
        rows,
        views,
        interRate: views ? inter / views : 0,
        exitRate: views ? exits / views : 0,
        doneRate: views ? done / views : 0,
        dwell,
        assist,
        tracked: comps.length,
        campaigns: new Set(rows.map(row => row.campaignId)).size,
      });
    }
  }

  return output;
};

/** `journeys` + `blocks` only — `experiences`/`products` come from real API now. */
export const insItems = (type: InsightItem['type']): InsightItem[] => {
  if (type === 'blocks') return insBlocks();

  if (type === 'journeys') {
    return MOCK_JOURNEYS.filter(journey => journey.template)
      .map(journey => {
        const copies = MOCK_JOURNEYS.filter(
          copy => !copy.template && copy.origin === journey.id
        );
        const campaignIds = copies.map(copy => copy.campaign).filter(Boolean);
        const rows = buildPulseFacts().filter(row =>
          campaignIds.includes(row.campaignId)
        );
        if (!rows.length) return null;
        const total = rollup(rows);
        const splits = insSplit(rows);
        const item: JourneyInsightItem = {
          type: 'journeys',
          id: journey.id,
          name: journey.name,
          rows,
          rollup: total,
          splits,
          campaigns: splits.length,
          variance: insVar(splits),
          funnel: insFunnel(total),
          completion: total.cvr,
        };
        return item;
      })
      .filter((item): item is JourneyInsightItem => item !== null);
  }

  return [];
};

export const findInsightItem = (
  type: InsightItem['type'],
  id: string,
  items?: InsightItem[]
): InsightItem | null =>
  (items ?? insItems(type)).find(item => item.id === id) ?? null;

export const sortInsightItems = (
  type: InsightItem['type'],
  items: InsightItem[]
): InsightItem[] => {
  const copy = [...items];
  if (type === 'products') {
    return copy.sort(
      (a, b) =>
        (b as ProductInsightItem).rollup.revenue -
        (a as ProductInsightItem).rollup.revenue
    );
  }
  if (type === 'blocks') {
    return copy.sort((a, b) => {
      const left = b as BlockInsightItem;
      const right = a as BlockInsightItem;
      const leftAssist = left.assist ?? -1;
      const rightAssist = right.assist ?? -1;
      return leftAssist - rightAssist || left.interRate - right.interRate;
    });
  }
  return copy.sort((a, b) => {
    const baseA = a as { rollup: { lift: number; sessions: number } };
    const baseB = b as { rollup: { lift: number; sessions: number } };
    return (
      baseB.rollup.lift - baseA.rollup.lift ||
      baseB.rollup.sessions - baseA.rollup.sessions
    );
  });
};

export const portfolioTrackingCoverage = (): number => {
  const rows = buildPulseFacts();
  const total = rollup(rows);
  if (!total.sessions) return 0;
  const { pct } = trackingCoverage(rows);
  return pct;
};
