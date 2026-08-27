import type { ExchangeListingView } from '@/lib/portal-v2/exchange/types';
import { rexerApi } from '@/services/rexer/endpoints';

/**
 * "Món này tôi lấy về chưa?" — tra một lần lúc mở màn Exchange.
 *
 * Bản trước chỉ nhớ trong phiên: bấm Thêm thì thẻ đổi thành "Đã có trong thư
 * viện", tải lại trang là quên sạch. Người dùng lấy trùng bao nhiêu lần cũng
 * được mà không ai cảnh báo, và thư viện của họ đầy bản giống hệt nhau.
 *
 * KHÔNG có một trường "đến từ Exchange" nào cả, nên phải đối chiếu bằng thứ
 * mỗi đường thêm thật sự để lại:
 *
 *   - Bản mẫu → `pages.create({ template_id })` dựng một trang, và trang đó
 *     mang `template_version_id` của bản mẫu. Thẻ trên chợ cũng mang đúng số
 *     hiệu ấy ⇒ trùng số hiệu là đã lấy.
 *   - Khối hệ thống → `blocks.clone()` dựng một khối của brand, và khối đó
 *     mang `source_block_id` trỏ về khối gốc. Chính xác tuyệt đối, đổi tên
 *     thoải mái vẫn nhận ra.
 *   - Món trên CHỢ → KHÔNG đối chiếu được. Hợp đồng Exchange cố ý không trả
 *     source id (doc của `RxExchangeItemDetail`), nên bản fork về không mang
 *     đường nào ngược lại listing. Hôm nay chợ chưa có món nào nên chưa mất
 *     gì; khi có, cần BE trả thêm một khoá đối chiếu.
 *   - Quảng cáo tương tác → không mang về được, nên không bao giờ "đã có".
 *
 * HỎNG THÌ IM LẶNG: trả về map rỗng, màn hình cư xử đúng như trước — không
 * đánh dấu gì. Thà không biết còn hơn nói sai là "đã có" rồi chặn người ta
 * lấy một món họ chưa hề có.
 */

export type ExchangeOwnedIndex = {
  /** `template_version_id` → id trang trong thư viện. */
  pageByTemplateVersion: Map<string, string>;
  /** `source_block_id` → id khối trong thư viện. */
  blockBySourceBlock: Map<string, string>;
};

export const EMPTY_OWNED_INDEX: ExchangeOwnedIndex = {
  pageByTemplateVersion: new Map(),
  blockBySourceBlock: new Map(),
};

/** Trần một lượt tra. Thư viện một brand thực tế nhỏ hơn nhiều. */
const LIMIT = 200;

export const fetchExchangeOwnedIndex =
  async (): Promise<ExchangeOwnedIndex> => {
    let workspaceId: string | null = null;
    try {
      const me = await rexerApi.auth.me();
      workspaceId = me.user.active_workspace_id ?? null;
    } catch {
      return EMPTY_OWNED_INDEX;
    }

    const [pages, blocks] = await Promise.allSettled([
      // Không có workspace ⇒ không có thư viện để đối chiếu. Đúng workspace mà
      // nút Thêm sẽ ghi vào (`installListing`), nên hai bên không lệch nhau.
      workspaceId
        ? rexerApi.pages.list(workspaceId, { type: 'landing', limit: LIMIT })
        : Promise.resolve({ items: [] }),
      // KHÔNG truyền `scope`: bản copy về nằm ở một trong các scope `brand_*`,
      // và endpoint chỉ nhận một scope mỗi lượt. Lấy rộng rồi lọc bên dưới
      // theo `brand_id` — khối hệ thống không mang trường đó.
      rexerApi.blocks.list({ limit: LIMIT }),
    ]);

    const index: ExchangeOwnedIndex = {
      pageByTemplateVersion: new Map(),
      blockBySourceBlock: new Map(),
    };

    if (pages.status === 'fulfilled') {
      for (const page of pages.value.items ?? []) {
        if (page.template_version_id) {
          index.pageByTemplateVersion.set(page.template_version_id, page.id);
        }
      }
    }

    if (blocks.status === 'fulfilled') {
      for (const block of blocks.value.items ?? []) {
        // `brand_id` có mặt ⇒ khối của brand này, không phải hàng kho nền tảng.
        // Thiếu vế đó thì một khối hệ thống clone từ khối hệ thống khác sẽ bị
        // đọc thành "brand đã lấy rồi".
        if (block.brand_id && block.source_block_id) {
          index.blockBySourceBlock.set(block.source_block_id, block.id);
        }
      }
    }

    return index;
  };

/**
 * Đối chiếu catalog với thư viện → `{ id thẻ trên chợ: id món trong thư viện }`.
 *
 * Cùng hình dạng với `ExchangeSessionState.added`, nên nó gieo thẳng vào state
 * đó và mọi thứ phía sau — nhãn trên thẻ, nút trong hộp chi tiết — chạy y
 * nguyên, không phải sửa gì.
 */
export const buildAddedMap = (
  catalog: ExchangeListingView[],
  index: ExchangeOwnedIndex
): Record<string, string> => {
  const added: Record<string, string> = {};

  for (const listing of catalog) {
    if (listing.blockId) {
      const owned = index.blockBySourceBlock.get(listing.blockId);
      if (owned) added[listing.id] = owned;
      continue;
    }

    /*
     * Chỉ dùng cho thẻ đến từ KHO NỀN TẢNG. Món trên chợ cũng có thể mang số
     * hiệu phiên bản, nhưng nó cài bằng một đường khác (`exchange.add`) nên số
     * hiệu ấy không nói được gì về việc brand đã lấy hay chưa.
     */
    if (!listing.exchangeItemId && listing.templateVersionId) {
      const owned = index.pageByTemplateVersion.get(listing.templateVersionId);
      if (owned) added[listing.id] = owned;
    }
  }

  return added;
};
