import type { CampaignExperience } from '@/lib/portal-v2/campaigns/types';
import {
  COPY_STATES,
  fetchExperienceState,
  fetchOwnTemplateIds,
} from '@/services/portal-v2/experienceLibrary';
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

/**
 * Thư viện trải nghiệm để chọn gắn — CHỈ trải nghiệm của brand đang thao tác.
 *
 * Hộp chọn trước đây liệt kê `MOCK_CAMPAIGN_EXPERIENCES` (Holiday Gift Edit,
 * The Clean Edit…), một dòng nội dung mỹ phẩm không tồn tại. Gắn một trong số
 * đó là gửi lên BE một id không có thật.
 *
 * Bản kế tiếp gọi thẳng `state: 'all'` — tức nguyên thư viện Exchange (mọi
 * template hệ thống + block của MỌI brand), nên hộp chọn của một chiến dịch
 * hiện ra hàng trăm mục không thuộc về brand đang xem. Dùng lại đúng bộ lọc
 * "thư viện của brand" ở trang `portal-v2/experiences`
 * (`fetchExperienceLibrary`/`experienceLibrary.ts`): ba `COPY_STATES` cộng
 * template do chính brand sở hữu — không phải toàn bộ Exchange.
 *
 * Lấy CẢ template lẫn copy: hộp chọn cần template để fork, còn các thẻ đã gắn
 * cần bản copy để hiện tên.
 */
export const fetchCampaignExperienceLibrary = async (
  brandId: string | null
): Promise<CampaignExperience[]> => {
  try {
    const common = brandId ? { brand_id: brandId } : {};
    const ownIds = await fetchOwnTemplateIds();

    const fetchOwnTemplates = async (): Promise<RxExperience[]> => {
      if (!ownIds || ownIds.size === 0) return [];
      const all = await fetchExperienceState(common, 'templates');
      return all.filter(x => ownIds.has(x.id));
    };

    const chunks = await Promise.all([
      ...COPY_STATES.map(s => fetchExperienceState(common, s)),
      fetchOwnTemplates(),
    ]);

    const seen = new Set<string>();
    return chunks
      .flat()
      .filter(x => {
        if (seen.has(x.id)) return false;
        seen.add(x.id);
        return true;
      })
      .map(toCampaignExperience);
  } catch {
    return [];
  }
};
