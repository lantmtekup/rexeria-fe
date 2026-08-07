import type { CampaignExperience } from '@/lib/portal-v2/campaigns/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type { RxExperience } from '@/services/rexer-v2/types/experience';

/**
 * Trải nghiệm gắn vào một hạng mục chiến dịch.
 *
 * Bản trước tự suy id bản copy ở FE (`origin × campaign × subject`) rồi dựng
 * bản ghi trong state. BE không dùng công thức đó: gắn một TEMPLATE thì nó tự
 * fork và tự cấp id (R1 — chiến dịch không bao giờ giữ template), nên id suy ra
 * ở FE trỏ vào hư không ngay lần tải lại đầu tiên.
 */

const toCampaignExperience = (x: RxExperience): CampaignExperience => ({
  id: x.id,
  name: x.name,
  slug: x.slug ?? '',
  summary: x.summary ?? '',
  // BE BỎ QUA `signal_coverage` với loại không đo được ⇒ 0 nghĩa là chưa đo.
  coverage: typeof x.signal_coverage === 'number' ? x.signal_coverage : 0,
  productId: x.subject?.product_id ?? null,
  template: x.is_template,
  origin: x.origin_id,
  campaign: x.campaign_id,
});

export const attachExperienceToItem = async (
  campaignId: string,
  itemId: string,
  experienceId: string
): Promise<CampaignExperience> =>
  toCampaignExperience(
    await rexerV2Api.experiences.attachToItem(campaignId, itemId, experienceId)
  );

/** Gỡ = XOÁ bản copy. Không phải "bỏ liên kết" — bản copy biến mất. */
export const detachExperienceFromItem = (
  campaignId: string,
  itemId: string,
  experienceId: string
): Promise<void> =>
  rexerV2Api.experiences.detachFromItem(campaignId, itemId, experienceId);
