import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type { Page } from '@/services/rexer/types';

/**
 * Dấu Proven của một trải nghiệm — đọc/ghi cột THẬT trên BE.
 *
 * Bản trước nhét vào `pages.type_metadata.proven` vì schema của `main` không
 * có cột nào chứa nó. Nhánh v2 có cột thật (`models.Page.Proven`,
 * `models.Template.Proven`) và `POST /v1/experiences/{id}/proven` ghi đúng vào
 * đó. Giữ chỗ cũ nữa là tự chuốc lấy cảnh người dùng bấm Proven mà Automation
 * không thấy gì — hub đọc cột, không đọc metadata.
 *
 * Proven là dấu THỦ CÔNG do người dùng bấm, không suy ra từ số liệu (demo:
 * "a manual curation mark. It never touches the numbers"). Số đo hiển thị bên
 * cạnh nó và tự suy biến về "chưa đo" khi chưa chạy.
 */

/** Khoá cũ trong `type_metadata`, chỉ còn để ĐỌC dữ liệu đã đánh dấu trước đây. */
const LEGACY_PROVEN_KEY = 'proven';

/**
 * Đọc dấu Proven.
 *
 * Ưu tiên cột thật; nếu BE chưa trả (deployment v1) thì rơi về khoá cũ trong
 * `type_metadata` để những trang đã đánh dấu bằng bản trước không mất dấu.
 */
export const readProven = (
  page: Pick<Page, 'type_metadata'> & { proven?: boolean }
): boolean => {
  if (typeof page.proven === 'boolean') return page.proven;
  const meta = page.type_metadata as Record<string, unknown> | undefined;
  return meta?.[LEGACY_PROVEN_KEY] === true;
};

/**
 * Bật/tắt dấu Proven. BE tự nhận id là template hay copy rồi ghi đúng bảng.
 *
 * Lưu ý: đánh dấu một COPY không đưa nó vào hub Automation — hub chỉ đọc
 * template. Muốn vậy phải `promoteToLibrary` trước.
 */
export const setExperienceProven = async (
  experienceId: string,
  proven: boolean
): Promise<boolean> =>
  (await rexerV2Api.experiences.setProven(experienceId, proven)).proven;
