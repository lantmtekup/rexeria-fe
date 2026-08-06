import { resolveTemplateFromVersionId } from '@/services/rexer/resolveTemplateFromVersion';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Page } from '@/services/rexer/types';

/**
 * Dựng MASTER — bản nháp thật của thiết kế, gắn với sản phẩm đã chọn.
 *
 * Master trong demo là `structuredClone` của experience rồi gắn cover sản phẩm
 * vào layer đầu — KHÔNG sinh nội dung. Nên ở đây cũng vậy: tạo một page mới từ
 * ĐÚNG template của trải nghiệm gốc, đặt tên theo cặp (thiết kế × sản phẩm),
 * rồi mở trong canvas để người dùng tự chỉnh.
 *
 * Cố ý KHÔNG gọi LLM ở bước này. Việc viết lại nội dung theo từng sản phẩm là
 * chuyện của bước Automate; dựng master mà phải chờ 1–3 phút thì người dùng
 * không còn muốn chỉnh nữa.
 *
 * Master sinh ra trong CÙNG workspace với trải nghiệm gốc — một bản nháp lạc
 * sang workspace khác thì vừa sai quyền vừa không ai tìm ra.
 */
export const createMasterDraft = async ({
  experienceId,
  experienceName,
  productTitle,
}: {
  experienceId: string;
  experienceName: string;
  productTitle: string;
}): Promise<Page> => {
  const source = await rexerApi.pages.get(experienceId);

  if (!source.template_version_id) {
    throw new Error('MASTER_NO_TEMPLATE');
  }

  const template = await resolveTemplateFromVersionId(
    source.template_version_id
  );
  if (!template?.id) {
    throw new Error('MASTER_NO_TEMPLATE');
  }

  return rexerApi.pages.create(source.workspace_id, {
    type: 'landing',
    template_id: template.id,
    name: `${experienceName} — ${productTitle}`,
  });
};

/**
 * Bỏ master cũ khi người dùng đổi sản phẩm gốc — đối ứng với
 * `automationDropMaster()` của demo.
 *
 * Không xoá cứng: `archive` giữ lại bản ghi để còn lần vết, và người dùng khôi
 * phục được nếu bấm nhầm. Hỏng thì nuốt lỗi — để lại một nháp mồ côi vẫn tốt
 * hơn là chặn người dùng đi tiếp vì một thao tác dọn dẹp.
 */
export const dropMasterDraft = async (pageId: string): Promise<void> => {
  try {
    await rexerApi.pages.archive(pageId);
  } catch {
    /* nháp mồ côi — không đáng để chặn luồng */
  }
};

/** Canvas của Portal V2 mở theo slug, thiếu slug thì theo id. */
export const masterCanvasHref = (page: Page): string =>
  `/portal-v2/${encodeURIComponent(page.slug || page.id)}/canvas`;

/**
 * Chốt MASTER thành một template thật, để bản chỉnh tay được nhân ra.
 *
 * Đây là mắt xích dễ đứt nhất của cả module, nên nói rõ: canvas người dùng sửa
 * trong editor được ghi vào REVISION CỦA PAGE (`pages.saveConfig`), không phải
 * vào template. Mà `handoff` thì clone theo TEMPLATE. Nếu cứ đưa template gốc
 * làm `source_template_id`, mọi bản copy sẽ mang thiết kế NGUYÊN BẢN và phần
 * chỉnh master bị bỏ rơi — đúng thứ mà module hứa là sẽ thừa hưởng.
 *
 * Nên trước khi nhân bản: đọc canvas mới nhất của master rồi đóng thành template
 * riêng. `CreateVersion` bên BE tự đưa version đầu tiên thành current khi
 * template chưa có version nào, nên không cần bước kích hoạt.
 *
 * Master chưa từng được chỉnh (không có revision) ⇒ trả `null`, người gọi dùng
 * template gốc. Dựng thêm một template y hệt chỉ để tiêu tốn một bản ghi.
 */
export const commitMasterTemplate = async ({
  masterPageId,
  name,
}: {
  masterPageId: string;
  name: string;
}): Promise<string | null> => {
  const revs = await rexerApi.pages.revisions(masterPageId, { limit: 1 });
  const canvas = revs.items?.[0]?.canvas_blueprint;
  if (!canvas) return null;

  const template = await rexerApi.templates.create({
    code: `automation-master-${masterPageId}`.slice(0, 100),
    name: name.slice(0, 255),
    preview_mode: 'rendered',
    status: 'active',
    target_page_type: 'landing',
  });

  await rexerApi.templates.createVersion(template.id, {
    version: '1.0.0',
    schema_version: '1',
    field_schema_json: {},
    default_config_json: {},
    canvas_blueprint: canvas as Record<string, unknown>,
    change_note: 'Automation master — adjusted design committed for fork',
  });

  return template.id;
};

/** Template đang đứng sau một trải nghiệm. */
export const templateIdOfExperience = async (
  experienceId: string
): Promise<{ templateId: string; workspaceId: string }> => {
  const page = await rexerApi.pages.get(experienceId);
  if (!page.template_version_id) throw new Error('MASTER_NO_TEMPLATE');
  const template = await resolveTemplateFromVersionId(page.template_version_id);
  if (!template?.id) throw new Error('MASTER_NO_TEMPLATE');
  return { templateId: template.id, workspaceId: page.workspace_id };
};
