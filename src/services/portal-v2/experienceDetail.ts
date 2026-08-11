import { v2DetailToLayers } from '@/lib/portal-v2/experiences/fromV2';
import type { ExperienceLayer } from '@/lib/portal-v2/experiences/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

/**
 * Các BLOCK thật của một trải nghiệm — `GET /v1/experiences/{id}`.
 *
 * Endpoint này là nguồn duy nhất có canvas. Danh sách chỉ trả `funnel_coverage`
 * (tối đa 5 chữ vai), và đo trên dữ liệu thật 2026-08-07 thì **99/100 bản ghi
 * trả `null`** cho nó — nên màn Chi tiết trước đây vẽ ra rỗng với gần như mọi
 * trải nghiệm, và với bản ghi duy nhất có dữ liệu thì vẽ 5 dòng tên `ATT`…`CON`
 * kèm chữ "không đo", ngay cạnh một hộp ghi 9/9 component có điểm đo.
 *
 * Nạp KHI MỞ chi tiết, không nạp ở danh sách: 109 thẻ mà mỗi thẻ một lời gọi là
 * 109 request cho một lần mở màn.
 */
export const fetchExperienceLayers = async (
  experienceId: string
): Promise<ExperienceLayer[] | null> => {
  try {
    return v2DetailToLayers(await rexerV2Api.experiences.get(experienceId));
  } catch {
    // null = KHÔNG NẠP ĐƯỢC, khác hẳn `[]` = trang không có block nào. Pane
    // hiện hai câu khác nhau cho hai trường hợp này.
    return null;
  }
};
