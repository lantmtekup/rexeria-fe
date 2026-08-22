import { rexerApi } from '@/services/rexer/endpoints';

/**
 * Đổi tên + cover riêng của một experience — cả hai đi qua `PATCH /v1/pages/{id}`
 * (không phải endpoint v2 riêng: đây là field-level update trên chính bản ghi
 * page, `rexerV2Api.experiences` chưa có `update`).
 *
 * `thumbnailUrl` rỗng xoá cover riêng, quay về ảnh kế thừa từ trải nghiệm gốc
 * (BE: `custom_thumbnail_url` NULL, `resolveCopyThumbnails` rơi về
 * `OriginTemplateID`) — cùng quy ước với Product/Template.
 */
export const updateExperienceDetails = async (
  experienceId: string,
  patch: { name: string; thumbnailUrl: string }
): Promise<{ name: string; thumbnailUrl: string | null }> => {
  const page = await rexerApi.pages.update(experienceId, {
    name: patch.name,
    thumbnail_url: patch.thumbnailUrl,
  });
  return {
    name: page.name,
    // BE trả `page` thô, chưa qua `resolveCopyThumbnails` — không phải nguồn
    // đáng tin cho ảnh cuối cùng khi vừa xoá cover riêng (rơi về trải nghiệm gốc thì
    // response này vẫn trống). Ưu tiên giá trị người dùng vừa đặt; rỗng thì để
    // caller tự quyết định fallback hiển thị.
    thumbnailUrl: patch.thumbnailUrl || (page.thumbnail_url ?? null),
  };
};
