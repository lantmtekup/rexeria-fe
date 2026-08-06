import { rexerApi } from '@/services/rexer/endpoints';
import type { Page } from '@/services/rexer/types';

/**
 * Dấu Proven của một trải nghiệm — đọc/ghi thật, không mock.
 *
 * Lưu ở `pages.type_metadata.proven`. Chọn chỗ này vì `TypeMetadata` bên BE là
 * `JSONMap` tự do, `PATCH /v1/pages/{id}` đã nhận sẵn, và không validator nào
 * chặn key lạ — nên **không cần migration và không cần đụng BE**. Khi nào hub
 * cần lọc phía server thì mới nâng lên cột riêng.
 *
 * Proven là dấu THỦ CÔNG do người dùng bấm, không suy ra từ số liệu (demo:
 * "a manual curation mark. It never touches the numbers"). Số đo hiển thị bên
 * cạnh nó và tự suy biến về "chưa đo" khi chưa chạy.
 */

const PROVEN_KEY = 'proven';
const PROVEN_AT_KEY = 'proven_at';

/** Đọc dấu Proven từ một page. Thiếu key ⇒ chưa đánh dấu. */
export const readProven = (page: Pick<Page, 'type_metadata'>): boolean => {
  const meta = page.type_metadata as Record<string, unknown> | undefined;
  return meta?.[PROVEN_KEY] === true;
};

/**
 * Bật/tắt dấu Proven.
 *
 * PATCH thay NGUYÊN `type_metadata` chứ không merge, nên phải đọc bản hiện tại
 * rồi ghi đè lên — gửi thẳng `{proven:true}` sẽ xoá sạch metadata khác của
 * page (share_token, embed_token…).
 */
export const setExperienceProven = async (
  pageId: string,
  proven: boolean
): Promise<boolean> => {
  const page = await rexerApi.pages.get(pageId);
  const current = (page.type_metadata ?? {}) as Record<string, unknown>;

  const next: Record<string, unknown> = { ...current };
  if (proven) {
    next[PROVEN_KEY] = true;
    next[PROVEN_AT_KEY] = new Date().toISOString();
  } else {
    delete next[PROVEN_KEY];
    delete next[PROVEN_AT_KEY];
  }

  const updated = await rexerApi.pages.update(pageId, { type_metadata: next });
  return readProven(updated);
};
