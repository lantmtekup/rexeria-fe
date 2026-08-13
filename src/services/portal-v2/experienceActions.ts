import { v2ToExperienceView } from '@/lib/portal-v2/experiences/fromV2';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

/**
 * Nhân bản và xoá trải nghiệm — hai việc ghi mà màn thư viện chưa từng có,
 * dù BE đã mở đường từ lâu (`POST /experiences/{id}/duplicate`,
 * `DELETE /experiences/{id}`).
 */

/** Bản sao do SERVER dựng, kể cả tên và id. Đừng suy ở FE. */
export const duplicateExperience = async (
  experienceId: string
): Promise<ExperienceView> =>
  v2ToExperienceView(await rexerV2Api.experiences.duplicate(experienceId));

export const deleteExperience = (experienceId: string): Promise<void> =>
  rexerV2Api.experiences.remove(experienceId);

/**
 * Xoá nhiều. Chạy TUẦN TỰ chứ không `Promise.all`: đây là lệnh xoá, và một lô
 * song song hỏng giữa chừng để lại trạng thái không ai đoán được món nào đã
 * mất. Tuần tự thì biết chính xác dừng ở đâu.
 *
 * Trả về danh sách id xoá được và id hỏng, thay vì ném lỗi ở món đầu tiên —
 * xoá 5 mà chết ở món thứ 2 thì người dùng cần biết 1 món đã mất thật.
 */
export const deleteExperiences = async (
  ids: string[]
): Promise<{ deleted: string[]; failed: string[] }> => {
  const deleted: string[] = [];
  const failed: string[] = [];
  for (const id of ids) {
    try {
      await deleteExperience(id);
      deleted.push(id);
    } catch {
      failed.push(id);
    }
  }
  return { deleted, failed };
};
