import { mapBeProductToPortal } from '@/lib/portal-v2/product/mapProduct';
import type { MapProductContext } from '@/lib/portal-v2/product/mapProduct';
import {
  toCreateProductRequest,
  toUpdateProductRequest,
} from '@/lib/portal-v2/product/toBeProduct';
import type { Product } from '@/lib/portal-v2/product/types';
import { rexerApi } from '@/services/rexer/endpoints';

/**
 * Ghi sản phẩm — tạo / sửa / xoá, gọi API thật.
 *
 * Trước đây ba thao tác này chỉ đổi state trong bộ nhớ rồi `alert(JSON)`, nên
 * tải lại trang là mất sạch. Module Automation lại chấm điểm sẵn sàng từ chính
 * những trường đó, nên "lưu" phải là lưu thật thì cả chuỗi mới có nghĩa.
 *
 * Trả về `Product` đã map lại từ response chứ không phải bản draft của UI:
 * BE chuẩn hoá vài trường (slug, `claims[].ok` do `core.DeriveClaims` tính),
 * và hiển thị bản client gửi đi sẽ khác bản thực sự nằm trong CSDL.
 */

export const createProduct = async (
  draft: Product,
  opts: {
    brandId?: string;
    mediaIds?: string[];
    coverMediaId?: string;
    /** Nhãn brand/type + mốc thời gian, giống hệt lúc nạp danh sách. */
    ctx: MapProductContext;
  }
): Promise<Product> => {
  const res = await rexerApi.products.create(
    toCreateProductRequest(draft, opts)
  );
  return mapBeProductToPortal(res.product, opts.ctx);
};

export const updateProduct = async (
  draft: Product,
  opts: { coverMediaId?: string; ctx: MapProductContext }
): Promise<Product> => {
  const res = await rexerApi.products.update(
    draft.id,
    toUpdateProductRequest(draft, opts)
  );
  return mapBeProductToPortal(res.product, opts.ctx);
};

/**
 * Xoá nhiều sản phẩm. Chạy tuần tự và gom lỗi thay vì `Promise.all`: xoá 5 cái
 * mà cái thứ 3 hỏng thì người dùng cần biết ĐÍCH DANH cái nào còn lại, không
 * phải một thông báo "có lỗi" rồi tự đoán.
 */
export type WriteFailure = {
  id: string;
  /** Mã lỗi của BE khi có — để FE dịch được thay vì in nguyên câu tiếng Anh. */
  code?: string;
  error: string;
};

export const deleteProducts = async (
  ids: string[]
): Promise<{ deleted: string[]; failed: WriteFailure[] }> => {
  const deleted: string[] = [];
  const failed: WriteFailure[] = [];

  for (const id of ids) {
    try {
      await rexerApi.products.remove(id);
      deleted.push(id);
    } catch (err) {
      failed.push({ id, ...describeError(err) });
    }
  }
  return { deleted, failed };
};

/**
 * Bóc mã lỗi ra khỏi lỗi API.
 *
 * `RxApiError` mang `code` của BE (vd. `ERR_PRODUCT_IN_USE` khi sản phẩm còn
 * gắn campaign item). Chỉ hiện `message` là ném câu tiếng Anh của server thẳng
 * vào mặt người dùng, và mất luôn khả năng dịch.
 */
const describeError = (err: unknown): { code?: string; error: string } => {
  if (typeof err === 'object' && err !== null) {
    const e = err as { code?: string; message?: string };
    if (e.code) return { code: e.code, error: e.message ?? e.code };
  }
  return { error: err instanceof Error ? err.message : 'unknown' };
};

/**
 * Nhân bản — dùng `POST /products/{id}/clone` của BE, KHÔNG dựng lại ở client.
 *
 * BE copy cả thuộc tính lẫn media binding trong một transaction (spec §4.2).
 * Bản cũ chỉ sao chép object trong bộ nhớ nên bản sao mất sạch ảnh, và mang
 * một id bịa ra không tồn tại trong CSDL.
 */
export const duplicateProduct = async (
  id: string,
  ctx: MapProductContext,
  name?: string
): Promise<Product> => {
  const res = await rexerApi.products.clone(id, name ? { name } : {});
  return mapBeProductToPortal(res.product, ctx);
};

/**
 * Đổi trạng thái hàng loạt (dùng cho Archive).
 *
 * Tuần tự + gom lỗi, cùng lý do như xoá: người dùng cần biết đích danh cái nào
 * không đổi được, không phải một câu "có lỗi" rồi tự đoán.
 */
export const setProductsStatus = async (
  ids: string[],
  status: 'draft' | 'active' | 'archived',
  ctx: MapProductContext
): Promise<{ updated: Product[]; failed: { id: string; error: string }[] }> => {
  const updated: Product[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const id of ids) {
    try {
      const res = await rexerApi.products.update(id, { status });
      updated.push(mapBeProductToPortal(res.product, ctx));
    } catch (err) {
      failed.push({
        id,
        error: err instanceof Error ? err.message : 'unknown',
      });
    }
  }
  return { updated, failed };
};

/**
 * Gắn thêm tag cho nhiều sản phẩm. HỢP NHẤT với tag sẵn có chứ không ghi đè —
 * `PATCH` thay nguyên mảng `tags`, nên gửi thẳng danh sách mới là xoá hết tag cũ.
 */
export const addProductTags = async (
  items: { id: string; tags: string[] }[],
  add: string[],
  ctx: MapProductContext
): Promise<{ updated: Product[]; failed: WriteFailure[] }> => {
  const updated: Product[] = [];
  const failed: WriteFailure[] = [];

  for (const item of items) {
    const merged = Array.from(new Set([...(item.tags ?? []), ...add]));
    try {
      const res = await rexerApi.products.update(item.id, { tags: merged });
      updated.push(mapBeProductToPortal(res.product, ctx));
    } catch (err) {
      failed.push({ id: item.id, ...describeError(err) });
    }
  }
  return { updated, failed };
};

/** Tạo một loại sản phẩm (product category) mới cho brand đang đăng nhập. */
export const createProductCategory = async (
  name: string
): Promise<{ id: string; name: string }> => {
  const category = await rexerApi.productCategories.create({ name });
  return { id: category.id, name: category.name };
};
