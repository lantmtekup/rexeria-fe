import { mapRexerMediaAssetToUi } from '@/lib/portal-v2/media/mapMediaAsset';
import type { MediaAsset } from '@/lib/portal-v2/media/types';
import { errorMessage } from '@/services/portal-v2/_error';
import { rexerApi } from '@/services/rexer/endpoints';

export type MediaUpdateResult =
  | { ok: true; asset: MediaAsset; error: null }
  | { ok: false; asset: null; error: string };

/**
 * PATCH /media/{id} — chỉ đồng bộ `tags`.
 *
 * TODO(BE): `UpdateMediaRequest` hiện chỉ có `original_filename | tags |
 * folder_id`. Các field UI đang cho sửa — `alt`, `caption`, `status`, `role` —
 * chưa có cột tương ứng nên KHÔNG gửi lên; chúng chỉ tồn tại ở state local và sẽ
 * mất sau lần refetch kế tiếp. Khi BE bổ sung, mở rộng payload ngay tại đây.
 *
 * TODO(UI): `original_filename` (rename) và `folder_id` (move) BE đã hỗ trợ nhưng
 * UI chưa có control — cố tình bỏ khỏi payload để PATCH không ghi đè giá trị BE
 * đang giữ.
 *
 * Asset trả về đã map qua `mapRexerMediaAssetToUi`, nên `alt` / `caption` /
 * `home` / `uses` / `links` là giá trị rỗng mặc định (BE không có field). Caller
 * chỉ được lấy `tags` từ đây, KHÔNG spread nguyên object vào state UI.
 */
export const updateMediaTags = async (
  id: string,
  tags: string[]
): Promise<MediaUpdateResult> => {
  try {
    const be = await rexerApi.media.update(id, { tags });
    return { ok: true, asset: mapRexerMediaAssetToUi(be), error: null };
  } catch (err) {
    return { ok: false, asset: null, error: errorMessage(err, 'Save failed') };
  }
};
