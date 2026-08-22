import {
  COPY_STATES,
  fetchExperienceState,
} from '@/services/portal-v2/experienceLibrary';

/**
 * Trải nghiệm THẬT đã gắn với một sản phẩm — tab Trải nghiệm ở modal sản
 * phẩm trước đây đọc `MOCK_PRODUCT_EXPERIENCE_LINKS`, một hằng số RỖNG
 * (mọi trải nghiệm trong dữ liệu mẫu đều là trải nghiệm gốc, `subject: null`), nên tab luôn
 * trống dù sản phẩm đã có bản copy thật.
 *
 * `RxExperienceListQuery` không có tham số lọc theo sản phẩm — lọc lại ở FE
 * theo `subject.product_id`, cùng cách `campaignExperiences.ts` đọc field
 * này khi ráp bảng chọn trải nghiệm cho hạng mục chiến dịch.
 */
export type ProductExperienceRow = {
  id: string;
  name: string;
  proven: boolean;
  category: 'collection' | 'blocks';
  campaignId: string | null;
};

export const fetchProductExperienceLinks = async (
  productId: string,
  brandId?: string | null
): Promise<ProductExperienceRow[]> => {
  const common = { ...(brandId ? { brand_id: brandId } : {}) };
  const chunks = await Promise.all(
    COPY_STATES.map(s => fetchExperienceState(common, s))
  );

  const seen = new Set<string>();
  return chunks
    .flat()
    .filter(x => {
      if (x.subject?.product_id !== productId) return false;
      if (seen.has(x.id)) return false;
      seen.add(x.id);
      return true;
    })
    .map(x => ({
      id: x.id,
      name: x.name,
      proven: x.proven,
      category:
        x.category === 'blocks' ? ('blocks' as const) : ('collection' as const),
      campaignId: x.campaign_id,
    }));
};
