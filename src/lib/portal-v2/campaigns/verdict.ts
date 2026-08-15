import { ITEM_STATUS, TRUST_FLOOR } from '@/lib/portal-v2/campaigns/constants';
import { deriveStage } from '@/lib/portal-v2/campaigns/helpers';
import { campReadiness } from '@/lib/portal-v2/campaigns/readiness';
import { itemShipGate } from '@/lib/portal-v2/campaigns/shipGate';
import type {
  CampaignExperience,
  CampaignHealth,
  CampaignVerdict,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import type {
  PulseCampaignCard,
  PulseSubjectRow,
} from '@/lib/portal-v2/analytics/pulseView';
import type { Journey } from '@/lib/portal-v2/journeys/types';

/**
 * What the numbers say.
 *
 * Every figure on the Run and Learn phases derives from `/v1/intel/campaigns`
 * (+ `/intel/overview` for the fields that endpoint doesn't carry — see
 * `services/portal-v2/campaignFacts.ts`), the same source Analytics reads.
 * Nothing is computed here from a mock fact table any more: `MOCK_FACT_ROWS`
 * kept a fixed set of campaign ids (`m1`..`m6`) that never matched a real
 * campaign's id, so every real campaign's verdict silently came back `null`.
 *
 * `card` MUST come from the bulk (unfiltered) `/intel/campaigns` fetch, never
 * from a `campaign_id`-filtered one — the latter always reports `lift: null`
 * for the campaign row itself (BE pools against sibling campaigns, and
 * filtering by `campaign_id` removes every sibling before the pool runs; see
 * `campaignFacts.ts`). `subjects` may come from a `campaign_id`-filtered
 * `expand=subjects` call — subject-level lift pools against sibling SUBJECTS
 * in the same campaign, unaffected by that filter.
 */

/** A subject needs this much traffic before its lift means anything. */
const minVolume = (sessions: number): number => Math.max(200, sessions * 0.05);

export type CampaignVerdictExtra = {
  leads?: number;
  cac?: number;
  /** null = `/intel/trust` wasn't fetched or failed — distinct from a measured 0%. */
  trust?: number | null;
  /** From a `campaign_id`-scoped `expand=subjects` call — absent at board level. */
  subjects?: PulseSubjectRow[];
};

/**
 * Maps one `/intel/campaigns` row to what the UI shows. `card` is undefined
 * for a campaign with no rows in the bulk board fetch, or when the detail
 * fetch hasn't resolved yet — both mean "nothing measured", not zero.
 */
export const campVerdict = (
  card: PulseCampaignCard | null | undefined,
  extra: CampaignVerdictExtra = {}
): CampaignVerdict | null => {
  if (!card || !card.sessions) return null;

  // Best/worst hạng mục: BE đã gộp theo `item_id` trong `subjects[]`, chỉ còn
  // lọc dưới sàn lưu lượng rồi xếp theo lift. `lift: null` (không có đối
  // chứng) tính là 0 — cùng quy ước với lift cấp chiến dịch bên dưới.
  const floor = minVolume(card.sessions);
  const ranked = (extra.subjects ?? [])
    .filter(s => s.sessions >= floor)
    .map(s => ({ name: s.name, lift: s.lift ?? 0 }))
    .sort((a, b) => b.lift - a.lift);

  return {
    sessions: card.sessions,
    converted: card.converted,
    leads: extra.leads ?? 0,
    revenue: card.revenue,
    spend: card.spend,
    cvr: card.cvr,
    // null (không đối chứng) ⇒ 0, đúng quy ước `liftOf` cũ khi thiếu control.
    lift: card.lift ?? 0,
    roas: card.spend ? card.revenue / card.spend : 0,
    roi: card.roi ?? 0,
    cac: extra.cac ?? (card.converted ? card.spend / card.converted : 0),
    trust: extra.trust ?? null,
    best: ranked.length ? ranked[0] : null,
    worst: ranked.length > 1 ? ranked[ranked.length - 1] : null,
  };
};

/* ── health ─────────────────────────────────────────────────────────────── */

const pct = (ratio: number): number => Math.round(ratio * 100);

/**
 * The operating state, in priority order (prototype `campHealth`, :14545).
 *
 * At risk beats delayed beats valuable: a campaign that is behind AND winning is
 * still behind, and the person reading this card needs the problem first.
 *
 * `verdict` and `earnedBar` are passed in rather than computed here — this
 * function used to call `campVerdict`/`earnedBar()` itself, both reading a
 * mock table synchronously. Real verdicts come from `/v1/intel/*`, an async
 * fetch the caller owns (board-level bulk fetch, or a per-campaign detail
 * fetch when a campaign is opened).
 */
export const campHealth = (
  campaign: CampaignView,
  verdict: CampaignVerdict | null,
  experiences: CampaignExperience[],
  today: string,
  journeys: Journey[],
  earnedBar: number | null
): CampaignHealth => {
  const stage = deriveStage(campaign);
  const live = stage === 'live';
  const started = Boolean(campaign.startDate && campaign.startDate <= today);

  if (stage === 'done') {
    return {
      state: 'complete',
      whyKey: verdict ? 'whyCompleteRoi' : 'whyComplete',
      values: verdict ? { roi: pct(verdict.roi) } : undefined,
    };
  }

  if (verdict && (live || started) && verdict.lift < 0) {
    return {
      state: 'risk',
      whyKey: 'whyBelowControl',
      values: { lift: pct(Math.abs(verdict.lift)) },
    };
  }

  if (
    verdict &&
    live &&
    verdict.trust !== null &&
    verdict.trust < TRUST_FLOOR
  ) {
    return {
      state: 'risk',
      whyKey: 'whyUntrusted',
      values: { trust: pct(verdict.trust) },
    };
  }

  const blocked = campaign.items.filter(
    item =>
      item.due !== null &&
      item.due < today &&
      ITEM_STATUS[item.status].step < ITEM_STATUS.ready.step &&
      !itemShipGate(item, experiences).ok
  ).length;

  if (blocked) {
    return { state: 'risk', whyKey: 'whyBlocked', values: { count: blocked } };
  }

  if (started && !live) {
    return { state: 'delayed', whyKey: 'whyStartedNotLive' };
  }

  const late = campaign.items.filter(
    item =>
      item.due !== null &&
      item.due < today &&
      ITEM_STATUS[item.status].step < ITEM_STATUS.ready.step
  ).length;

  if (late) {
    return { state: 'delayed', whyKey: 'whyLate', values: { count: late } };
  }

  if (!live) {
    const readiness = campReadiness(campaign, experiences, journeys);
    if (readiness.score < 100) {
      return {
        state: 'delayed',
        whyKey: 'whyPlanIncomplete',
        values: { score: readiness.score },
      };
    }
  }

  if (
    verdict &&
    live &&
    earnedBar !== null &&
    verdict.lift >= earnedBar &&
    verdict.roi > 0 &&
    verdict.sessions >= 1000
  ) {
    return {
      state: 'valuable',
      whyKey: 'whyValuable',
      values: { lift: pct(verdict.lift), roas: verdict.roas.toFixed(1) },
    };
  }

  return { state: 'healthy', whyKey: 'whyHealthy' };
};
