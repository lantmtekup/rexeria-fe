import { rexerApi } from '@/services/rexer/endpoints';

/**
 * Toàn bộ ảnh của một sản phẩm — không phải mỗi ảnh bìa.
 *
 * `GET /products` (danh sách) chỉ trả `thumbnail_url`, nên chỗ nào lấy ảnh từ
 * danh sách cũng chỉ có ĐÚNG MỘT tấm. Ảnh thật nằm ở `product_media_bindings`,
 * và chỉ `GET /products/{id}` mới trả kèm (`ProductResponse.media`).
 *
 * Vì sao phải lấy hết: khuôn có nhiều ô ảnh (Gambit 11 ô). Cấp một tấm thì AI
 * buộc phải dùng đi dùng lại đúng tấm đó cho mọi ô — trang ra trông như lỗi.
 * `collectMediaPool` bên BE xếp ảnh brief lên đầu và biến field ảnh thành enum
 * đóng, nên cấp bao nhiêu thì model có bấy nhiêu lựa chọn.
 *
 * Một lời gọi thêm cho mỗi sản phẩm — không đáng kể so với 6–8 lời gọi LLM
 * ngay sau đó.
 */
export const productImageUrls = async (
  productId: string
): Promise<string[]> => {
  try {
    const res = await rexerApi.products.get(productId);

    const urls = (res.media ?? [])
      .filter(m => m.asset?.media_type === 'image')
      // `sort_order` quyết định thứ tự trưng bày; giữ nguyên để ảnh chính đứng
      // đầu enum, vì BE ưu tiên phần tử đầu cho ô ảnh nổi bật.
      .sort((a, b) => (a.binding.sort_order ?? 0) - (b.binding.sort_order ?? 0))
      .map(m => m.asset?.public_url)
      .filter((u): u is string => Boolean(u));

    // Thumbnail đứng cuối và chỉ khi chưa có trong danh sách — nó thường là
    // một trong các ảnh trên, thêm lần nữa chỉ làm enum có mục trùng.
    const thumb = res.product?.thumbnail_url;
    if (thumb && !urls.includes(thumb)) urls.push(thumb);

    return urls;
  } catch {
    // Không lấy được media KHÔNG đáng để bỏ cả sản phẩm — cứ sinh với kho ảnh
    // của khuôn, còn hơn không ra trang nào.
    return [];
  }
};
