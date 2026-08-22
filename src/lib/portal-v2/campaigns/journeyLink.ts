import {
  campaignJourneyId,
  journeyOriginOf,
  subjectName,
  subjectRef,
  syncItemStage,
} from '@/lib/portal-v2/campaigns/helpers';
import {
  MOCK_CAMPAIGN_EXPERIENCES,
  experienceCopyId,
  forkExperience,
} from '@/lib/portal-v2/campaigns/mock';
import type {
  CampaignExperience,
  CampaignItem,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import { forkJourney } from '@/lib/portal-v2/journeys/helpers';
import type { Journey } from '@/lib/portal-v2/journeys/types';

/**
 * Campaigns ↔ Journeys.
 *
 * A journey blueprint belongs to nobody. Using one in a campaign forks a copy —
 * copy-on-use — and the copy belongs to exactly one campaign, records its
 * origin, and earns its own numbers. Editing the copy never touches the
 * blueprint (prototype `cpQuietFork`, rexer-demo-v3.html :30884).
 *
 * Routing a journey onto a campaign also carries the route's experiences down
 * onto every subject: that is what makes a journey a plan for work rather than a
 * diagram.
 */

/** Experience masters linked on a journey graph — read from node `x`. */
export const routeMastersFromJourney = (journey: Journey | null): string[] =>
  journey?.nodes.filter(n => n.x).map(n => n.x!) ?? [];

export const routeMastersForBlueprint = (
  blueprintId: string | null,
  journeys: Journey[]
): string[] => {
  if (!blueprintId) return [];
  const blueprint = journeys.find(j => j.id === blueprintId && j.template);
  return routeMastersFromJourney(blueprint ?? null);
};

export const routeMastersForCampaign = (
  campaign: CampaignView,
  journeys: Journey[]
): string[] => {
  const fork = journeyForCampaign(journeys, campaign);
  if (fork) return routeMastersFromJourney(fork);
  return routeMastersForBlueprint(journeyOriginOf(campaign), journeys);
};

/** Stage count for a blueprint picker row. */
export const routeMastersFor = (
  blueprintId: string | null,
  journeys: Journey[]
): string[] => routeMastersForBlueprint(blueprintId, journeys);

export const journeyForCampaign = (
  journeys: Journey[],
  campaign: CampaignView
): Journey | null =>
  campaign.journeyId
    ? (journeys.find(j => j.id === campaign.journeyId) ?? null)
    : null;

export const blueprintJourneys = (journeys: Journey[]): Journey[] =>
  journeys.filter(j => j.template);

/**
 * How much of the route the work actually carries. A journey stage with no
 * experience under it is a hole the shopper walks into — the plan gate counts
 * them (prototype `campRouteCoverage`, :20850).
 */
export const routeCoverage = (
  campaign: CampaignView,
  experiences: CampaignExperience[],
  journeys: Journey[]
): { need: string[]; carried: number; total: number } => {
  const wanted = routeMastersForCampaign(campaign, journeys);
  if (!wanted.length) return { need: [], carried: 0, total: 0 };

  const carriedOrigins = new Set(
    experiences
      .filter(e => !e.template && e.campaign === campaign.id)
      .map(e => e.origin)
      .filter((origin): origin is string => Boolean(origin))
  );

  const need = wanted.filter(origin => !carriedOrigins.has(origin));
  return { need, carried: wanted.length - need.length, total: wanted.length };
};

/* ── forking ────────────────────────────────────────────────────────────── */

export type ForkOutcome = {
  campaign: CampaignView;
  journeys: Journey[];
  experiences: CampaignExperience[];
};

const master = (
  experiences: CampaignExperience[],
  id: string
): CampaignExperience | null =>
  experiences.find(e => e.id === id && e.template) ?? null;

/**
 * Carry one master down onto one subject, if it is not already there. Returns
 * the copy's id either way, so the caller can attach it without caring whether
 * this call was the one that minted it.
 */
const carryMasterToItem = (
  campaign: CampaignView,
  item: CampaignItem,
  masterId: string,
  experiences: CampaignExperience[],
  productNames: Record<string, string>
): { id: string; experiences: CampaignExperience[] } => {
  const ref = subjectRef(item);
  const copyId = experienceCopyId(masterId, campaign.id, ref);
  if (experiences.some(e => e.id === copyId)) {
    return { id: copyId, experiences };
  }

  const source = master(experiences, masterId);
  if (!source) return { id: copyId, experiences };

  const label = subjectName(item, productNames) || ref;
  const copy = forkExperience(source, campaign.id, campaign.name, ref, label);
  return { id: copyId, experiences: [...experiences, copy] };
};

/**
 * Attach every experience the campaign's route asks for onto every subject that
 * does not already carry it. Nothing is removed: a subject can hold work the
 * route never mentioned.
 *
 * `attach` gọi thẳng `POST /campaigns/{id}/items/{itemId}/experiences` (BE tự
 * fork trải nghiệm gốc thành bản copy thật, xem `campaignExperiences.ts`) — bản trước
 * tự dựng bản copy giả ở FE (`carryMasterToItem`/`forkExperience`), hiện toast
 * "đã gắn" nhưng chưa hề chạm BE, nên tải lại trang là mất sạch và ship gate lại
 * báo thiếu. Một hạng mục lỗi (BE từ chối) không chặn các hạng mục còn lại.
 */
export const bindRouteToItems = async (
  campaign: CampaignView,
  experiences: CampaignExperience[],
  journeys: Journey[],
  attach: (itemId: string, masterId: string) => Promise<CampaignExperience>
): Promise<{ campaign: CampaignView; experiences: CampaignExperience[] }> => {
  const wanted = routeMastersForCampaign(campaign, journeys);
  if (!wanted.length) return { campaign, experiences };

  let nextExperiences = experiences;
  const items: CampaignItem[] = [];
  for (const item of campaign.items) {
    let expIds = [...item.expIds];
    for (const masterId of wanted) {
      const already = expIds.some(
        id => nextExperiences.find(e => e.id === id)?.origin === masterId
      );
      if (already) continue;
      try {
        const copy = await attach(item.id, masterId);
        nextExperiences = [
          ...nextExperiences.filter(e => e.id !== copy.id),
          copy,
        ];
        expIds = [...expIds, copy.id];
      } catch {
        /* BE từ chối một hạng mục (hết quyền, item vừa bị xoá…) — bỏ qua nó,
           đừng để một hạng mục hỏng chặn cả loạt còn lại. */
      }
    }
    items.push(syncItemStage({ ...item, expIds }));
  }

  return { campaign: { ...campaign, items }, experiences: nextExperiences };
};

/**
 * Bring a campaign's declared fork into existence.
 *
 * A campaign owns the statement "I run this route", and the fork is derived from
 * it rather than the other way round. Duplicating is where that matters: the
 * copy's fork id is minted from its own campaign id before anything exists to
 * back it, and this is what makes it real.
 */
/**
 * Nối chiến dịch với bản fork hành trình của nó.
 *
 * Liên kết nằm ở PHÍA journey (`journeys.campaign_id`) — `CampaignV2` không có
 * trường `journey_id` nào cả. Nhưng màn chiến dịch lại tra bằng
 * `campaign.journeyId`, nên không có bước ghép này thì fork chạy đúng ở server
 * mà dải "The journey" vẫn trống.
 *
 * Phải chạy lại sau MỌI lần nạp lại một chiến dịch: `GET /campaigns/{id}` cũng
 * không trả trường đó, nên gán thẳng kết quả vào state sẽ xoá mất liên kết.
 */
export const withJourneyLinks = (
  campaigns: CampaignView[],
  journeys: Journey[]
): CampaignView[] => {
  const byCampaign = new Map<string, string>();
  journeys.forEach(j => {
    if (j.campaign && !j.template) byCampaign.set(j.campaign, j.id);
  });
  return campaigns.map(c => {
    const journeyId = byCampaign.get(c.id) ?? null;
    return journeyId === c.journeyId ? c : { ...c, journeyId };
  });
};

export const ensureCampaignJourneys = (
  journeys: Journey[],
  campaigns: CampaignView[]
): Journey[] => {
  let next = journeys;
  for (const campaign of campaigns) {
    if (!campaign.journeyId) continue;
    if (next.some(j => j.id === campaign.journeyId)) continue;

    const origin = journeyOriginOf(campaign);
    if (!origin) continue;
    const forked = forkJourney(next, origin, campaign.id, campaign.name);
    if (forked) next = forked.list;
  }
  return next;
};

/**
 * The mirror of `ensureCampaignJourneys` for experiences: a duplicate's items
 * already point at copy ids derived from its own campaign id, so the copies have
 * to be minted to match.
 */
export const ensureCampaignExperiences = (
  experiences: CampaignExperience[],
  campaigns: CampaignView[],
  productNames: Record<string, string>
): CampaignExperience[] => {
  let next = experiences;
  for (const campaign of campaigns) {
    for (const item of campaign.items) {
      for (const expId of item.expIds) {
        if (next.some(e => e.id === expId)) continue;

        /* `x-{origin}-{campaign}-{subject}` — the origin is the master to fork. */
        const origin = expId.split('-')[1];
        const carried = carryMasterToItem(
          campaign,
          item,
          origin,
          next,
          productNames
        );
        next = carried.experiences;
      }
    }
  }
  return next;
};

/** The library as a campaign sees it at boot, before anything is forked. */
export const seedExperiences = (): CampaignExperience[] =>
  structuredClone(MOCK_CAMPAIGN_EXPERIENCES);

/** The fork id a campaign would get from this blueprint. */
export const previewJourneyId = campaignJourneyId;
