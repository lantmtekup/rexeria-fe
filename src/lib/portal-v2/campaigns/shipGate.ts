import {
  ITEM_DONE_STEP,
  ITEM_STATUS,
  SHIP_TRACK_FLOOR,
} from '@/lib/portal-v2/campaigns/constants';
import type {
  CampaignExperience,
  CampaignItem,
  CampaignItemStatus,
  ShipCheck,
  ShipGate,
} from '@/lib/portal-v2/campaigns/types';

/**
 * The four questions asked before a subject is allowed to ship
 * (prototype `itemShipGate`, rexer-demo-v3.html :20745).
 *
 * They are not style rules. Each one names a way a campaign has actually gone
 * wrong before: nothing built, a page selling the wrong product, a page nobody
 * can measure, and work with no date on it.
 */

const lookup = (
  experiences: CampaignExperience[],
  id: string
): CampaignExperience | null => experiences.find(e => e.id === id) ?? null;

/**
 * Does this copy speak about the subject it is filed under?
 *
 * A copy inherits its master's words. A master authored for one product, forked
 * onto a different one, is selling the wrong thing until somebody rewrites it —
 * which is what `adapted` records. Subject-agnostic masters (`productId: null`)
 * and topics fit anything by construction.
 */
export const speaksForSubject = (
  item: CampaignItem,
  experience: CampaignExperience
): boolean => {
  if (item.kind === 'topic') return true;
  if (experience.adapted) return true;
  if (experience.productId === null) return true;
  return experience.productId === item.productId;
};

export const itemShipGate = (
  item: CampaignItem,
  experiences: CampaignExperience[]
): ShipGate => {
  const attached = item.expIds
    .map(id => lookup(experiences, id))
    .filter((e): e is CampaignExperience => e !== null);

  const built = attached.length > 0;

  const checks: ShipCheck[] = [
    { id: 'built', ok: built },
    {
      id: 'words',
      ok: built && attached.every(e => speaksForSubject(item, e)),
    },
    /*
     * `coverage: null` = CHƯA ĐO ĐƯỢC, và một câu hỏi chưa trả lời không phải
     * là một câu trả lời "không". Danh sách `/experiences` không trả
     * `signal_coverage` (số thật chỉ có ở `/experiences/{id}/coverage`, nạp khi
     * mở chi tiết), nên trước đây mọi bản đính kèm đọc ra `0` và cổng này chặn
     * cả trang đã gắn đủ điểm đo — đo thật 100% mà báo "chưa đo đủ".
     *
     * Chưa đo thì KHÔNG chặn. Chỉ chặn khi đã đo và đo ra dưới sàn — đó mới là
     * điều cổng này sinh ra để nói: "shipping it teaches nothing".
     */
    {
      id: 'tracked',
      ok:
        built &&
        attached.every(
          e => e.coverage === null || e.coverage >= SHIP_TRACK_FLOOR
        ),
    },
    { id: 'dated', ok: item.due !== null || item.status === 'live' },
  ];

  const missing = checks.filter(c => !c.ok).map(c => c.id);
  return { ok: missing.length === 0, checks, missing };
};

/**
 * Ready and Live are the two stages that put work in front of a customer, so
 * they are the two the gate holds. Everything before them is internal and moves
 * freely — a build can be as broken as it needs to be while it is being built.
 */
export const stageNeedsGate = (status: CampaignItemStatus): boolean =>
  ITEM_STATUS[status].step >= ITEM_DONE_STEP;

/** Which stages this item may move to right now. */
export const allowedStages = (
  item: CampaignItem,
  experiences: CampaignExperience[]
): Set<CampaignItemStatus> => {
  const gate = itemShipGate(item, experiences);
  const flow: CampaignItemStatus[] = [
    'todo',
    'building',
    'review',
    'ready',
    'live',
  ];
  return new Set(
    flow.filter(
      status => gate.ok || !stageNeedsGate(status) || status === item.status
    )
  );
};
