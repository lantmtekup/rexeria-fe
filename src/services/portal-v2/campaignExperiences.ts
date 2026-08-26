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
 * bản ghi trong state. BE không dùng công thức đó: gắn một TRẢI NGHIỆM GỐC
 * thì nó tự fork và tự cấp id (R1 — chiến dịch không bao giờ giữ trải nghiệm
 * gốc), nên id suy ra ở FE trỏ vào hư không ngay lần tải lại đầu tiên.
 */

const toCampaignExperience = (x: RxExperience): CampaignExperience => ({
  id: x.id,
  name: x.name,
  slug: x.slug ?? '',
  summary: x.summary ?? '',
  // BE BỎ QUA `signal_coverage` với loại không đo được, và danh sách
  // `/experiences` cũng không trả nó — số thật chỉ có ở `/experiences/{id}/
  // coverage`. Giữ nguyên `null`, KHÔNG quy về 0: hai chuyện đó khác nhau, và
  // gộp chúng làm cổng ship chặn oan (đo thật 100% mà báo "chưa đo đủ").
  coverage: typeof x.signal_coverage === 'number' ? x.signal_coverage : null,
  productId: x.subject?.product_id ?? null,
  template: x.is_template,
  origin: x.origin_id,
  campaign: x.campaign_id,
  itemId: x.item_id,
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
 * trải nghiệm gốc hệ thống + block của MỌI brand), nên hộp chọn của một
 * chiến dịch hiện ra hàng trăm mục không thuộc về brand đang xem. Dùng lại
 * đúng bộ lọc "thư viện của brand" ở trang `portal-v2/experiences`
 * (`fetchExperienceLibrary`/`experienceLibrary.ts`): ba `COPY_STATES` cộng
 * trải nghiệm gốc do chính brand sở hữu — không phải toàn bộ Exchange.
 *
 * Lấy CẢ trải nghiệm gốc lẫn copy: hộp chọn cần trải nghiệm gốc để fork, còn
 * các thẻ đã gắn cần bản copy để hiện tên.
 */
export const fetchCampaignExperienceLibrary = async (
  brandId: string | null
): Promise<CampaignExperience[]> => {
  try {
    const common = brandId ? { brand_id: brandId } : {};

    // `ownIds` chỉ nhánh lọc trải nghiệm gốc cần — 3 nhánh COPY_STATES bên
    // dưới không đụng tới nó. `await` ở TRONG closure này (thay vì ở ngoài,
    // chặn cả `Promise.all`) để 3 nhánh kia không phải chờ xong lookup trải
    // nghiệm gốc mới được bắt đầu tải song song.
    const fetchOwnTemplates = async (): Promise<RxExperience[]> => {
      const ownIds = await fetchOwnTemplateIds();
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
