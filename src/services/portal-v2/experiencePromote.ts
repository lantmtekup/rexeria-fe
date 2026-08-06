import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type { RxExperience } from '@/services/rexer-v2/types/experience';

/**
 * Đưa một trang đã chạy vào thư viện Automation.
 *
 * Hub Automation đọc `ListProvenTemplates` — tức bảng `templates` với
 * `proven = true`. Một landing page dù đã publish và đã bấm Proven vẫn KHÔNG
 * vào hub, vì nó là page chứ không phải template. Đường đi thật là hai bước:
 *
 *   POST /experiences/{pageId}/promote   page → template, kế thừa brand của page
 *   POST /experiences/{tplId}/proven     đánh dấu để hub nhận
 *
 * Gộp hai lời gọi vào một hành động vì tách ra thì bước hai không có chỗ bấm:
 * màn Experiences liệt kê page, template mới tạo không hiện ở đó.
 */

export type PromoteResult = {
  template: RxExperience;
  /**
   * Promote xong nhưng đánh dấu Proven hỏng. Template ĐÃ tạo — nói ra để người
   * dùng không bấm lại rồi ăn 409 trùng code, và biết là chỉ còn thiếu dấu.
   */
  provenError: string | null;
};

export const promoteToLibrary = async (
  pageId: string,
  name: string
): Promise<PromoteResult> => {
  const template = await rexerV2Api.experiences.promote(pageId, {
    name: name.trim(),
  });

  try {
    const proven = await rexerV2Api.experiences.setProven(template.id, true);
    return { template: proven, provenError: null };
  } catch (err) {
    return {
      template,
      provenError: err instanceof Error ? err.message : 'Failed to mark proven',
    };
  }
};
