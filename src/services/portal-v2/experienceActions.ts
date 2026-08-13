import { v2ToExperienceView } from '@/lib/portal-v2/experiences/fromV2';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type { RxCreateExperienceRequest } from '@/services/rexer-v2/types/experience';

/**
 * Tạo, nhân bản và xoá trải nghiệm — ba việc ghi mà màn thư viện chưa từng có,
 * dù BE đã mở đường từ lâu (`POST /experiences`,
 * `POST /experiences/{id}/duplicate`, `DELETE /experiences/{id}`).
 */

export type NewExperienceDraft = {
  name: string;
  category: 'collection' | 'blocks';
  vehicle: string;
  objective: string;
  interactions: string[];
  tagline: string;
  summary: string;
};

/**
 * Tạo mới. Món ra lò là **template nháp** (hoặc block), KHÔNG phải bản copy —
 * xem `rexerV2Api.experiences.create`. Nên nơi gọi phải mở canvas, đừng chèn
 * thẳng vào lưới.
 *
 * CỐ Ý BỎ `edit_url`. BE dựng nó bằng cách nối chuỗi — `"/templates/" + t.ID`
 * (`usecase/experience.go:441`), `"/blocks/" + b.ID` cho block — tức là đoán
 * bảng route của một FE nào đó. FE này KHÔNG có `/templates/{id}`: đi theo nó
 * ra thẳng trang NotFound (đã thử với template `d9cb2f08…`). Đường đúng là
 * `canvasEditorHref` của chính FE (`/portal-v2/{slug|id}/canvas`), và route ấy
 * nhận cả UUID template — mở ra canvas rỗng, đúng như một bản nháp mới.
 *
 * Trường taxonomy rỗng bị BỎ HẲN khỏi body: BE validate `oneof=...` và chuỗi
 * rỗng lọt qua được `omitempty` ở tầng nào cũng là rủi ro 400 không cần thiết.
 */
export const createExperience = async (
  draft: NewExperienceDraft
): Promise<ExperienceView> => {
  const body: RxCreateExperienceRequest = {
    name: draft.name.trim(),
    category: draft.category,
    ...(draft.vehicle ? { vehicle: draft.vehicle } : {}),
    ...(draft.objective ? { objective: draft.objective } : {}),
    ...(draft.interactions.length ? { interactions: draft.interactions } : {}),
    ...(draft.tagline.trim() ? { tagline: draft.tagline.trim() } : {}),
    ...(draft.summary.trim() ? { summary: draft.summary.trim() } : {}),
  };
  return v2ToExperienceView(await rexerV2Api.experiences.create(body));
};

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
