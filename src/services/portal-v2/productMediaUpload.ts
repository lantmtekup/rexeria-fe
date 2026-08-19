import { rexerApi } from '@/services/rexer/endpoints';
import type { ProductAsset } from '@/lib/portal-v2/product/types';
import type { MediaAsset } from '@/services/rexer/types';

/**
 * Tải ảnh lên rồi gắn thẳng vào một sản phẩm.
 *
 * Upload là luồng BA bước của BE, không phải một lần POST:
 *
 *   POST /media/uploads/init      → upload_id (+ presigned_url nếu chạy S3)
 *   PUT  .../uploads/{id}/raw     → đẩy byte
 *   POST /media/uploads/complete  → chốt, trả về media_asset
 *
 * Bỏ bước `complete` thì file nằm trên đĩa mà KHÔNG có bản ghi `media_assets` —
 * mất tăm với mọi thứ còn lại của hệ thống.
 *
 * Gắn vào sản phẩm mới là phần quan trọng với Automation: `core.AutoSlots` chấm
 * ô ATT và EXP theo SỐ BINDING (`product_media_bindings`), không nhìn
 * `thumbnail_url`. Tải ảnh lên library mà quên gắn thì sản phẩm vẫn bị chấm là
 * không có ảnh.
 */

export type UploadOutcome = {
  file: string;
  asset?: MediaAsset;
  error?: string;
};

/** Ảnh đầu tiên gắn vào sản phẩm chưa có ảnh nào sẽ thành ảnh bìa. */
const FIELD_KEY = 'gallery';

const uploadOne = async (
  file: File,
  opts: { workspaceId?: string; brandId?: string }
): Promise<MediaAsset> => {
  const init = await rexerApi.media.initUpload({
    filename: file.name,
    mime_type: file.type || 'application/octet-stream',
    file_size: file.size,
    owner_scope: 'library',
    media_type: file.type.startsWith('video/') ? 'video' : 'image',
    ...(opts.workspaceId ? { workspace_id: opts.workspaceId } : {}),
    ...(opts.brandId ? { brand_id: opts.brandId } : {}),
  });

  if (init.presigned_url) {
    // Chạy S3: đẩy thẳng lên storage, không qua BE.
    const res = await fetch(init.presigned_url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  } else {
    await rexerApi.media.uploadRaw(init.upload_id, file);
  }

  const done = await rexerApi.media.completeUpload({
    upload_id: init.upload_id,
  });
  return done.media_asset;
};

/**
 * Tải nhiều file rồi gắn hết vào sản phẩm.
 *
 * Tuần tự, cùng lý do như xoá hàng loạt: một file hỏng không được kéo theo cả
 * mẻ, và người dùng cần biết đích danh file nào.
 */
export const uploadProductMedia = async ({
  productId,
  files,
  startSortOrder = 0,
  workspaceId,
  brandId,
}: {
  productId: string;
  files: File[];
  /** Ảnh đã có sẵn bao nhiêu — để ảnh mới xếp tiếp chứ không chen lên đầu. */
  startSortOrder?: number;
  workspaceId?: string;
  brandId?: string;
}): Promise<UploadOutcome[]> => {
  const out: UploadOutcome[] = [];
  const bound: { media_id: string; sort_order: number }[] = [];

  for (const file of files) {
    try {
      const asset = await uploadOne(file, { workspaceId, brandId });
      bound.push({
        media_id: asset.id,
        sort_order: startSortOrder + bound.length,
      });
      out.push({ file: file.name, asset });
    } catch (err) {
      out.push({
        file: file.name,
        error: err instanceof Error ? err.message : 'unknown',
      });
    }
  }

  // Gắn MỘT lần cho tất cả file đã lên: bind từng cái là từng ấy round-trip,
  // và nếu đứt giữa chừng thì thứ tự sort_order thủng lỗ chỗ.
  if (bound.length) {
    try {
      await rexerApi.products.bindMedia(productId, {
        items: bound.map(b => ({
          media_id: b.media_id,
          field_key: FIELD_KEY,
          sort_order: b.sort_order,
        })),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'bind failed';
      // File đã lên library rồi — chỉ khâu gắn hỏng. Nói rõ để người dùng biết
      // ảnh không mất, chỉ là chưa thuộc về sản phẩm này.
      for (const o of out) if (o.asset) o.error = msg;
    }
  }

  return out;
};

/**
 * Gắn asset ĐÃ CÓ trong thư viện vào sản phẩm — không tải lên gì cả.
 *
 * Đường thứ hai bên cạnh upload: ảnh thường đã nằm sẵn trong Media, và bắt
 * người dùng tải lại file lần nữa vừa tốn dung lượng vừa sinh bản trùng trong
 * thư viện.
 */
export const attachExistingMedia = async (
  productId: string,
  mediaIds: string[],
  startSortOrder = 0
): Promise<void> => {
  if (!mediaIds.length) return;
  await rexerApi.products.bindMedia(productId, {
    items: mediaIds.map((media_id, i) => ({
      media_id,
      field_key: FIELD_KEY,
      sort_order: startSortOrder + i,
    })),
  });
};

/** Ảnh/video trong thư viện chưa gắn vào sản phẩm đang mở — để chọn. */
export const listLibraryImages = async (): Promise<
  { id: string; name: string; url?: string; kind: 'image' | 'video' }[]
> => {
  const res = await rexerApi.media.list({ limit: 100 });
  return (res.items ?? [])
    .filter(a => a.media_type === 'image' || a.media_type === 'video')
    .map(a => ({
      id: a.id,
      name: a.original_filename,
      url: a.public_url,
      kind: a.media_type === 'video' ? ('video' as const) : ('image' as const),
    }));
};

/**
 * Media THẬT của một sản phẩm — đọc `product_media_bindings` qua
 * `GET /products/{id}`.
 *
 * Vì sao cần: `productAssetsFromBe` (dùng cho danh sách) chỉ TỔNG HỢP đúng một
 * asset giả cho mỗi sản phẩm từ `thumbnail_url`, id tự chế `a-{id}-cover`. Nó
 * không bao giờ đọc binding. Nên trước đây modal luôn báo "0 files", bộ chọn
 * ảnh bìa luôn rỗng, và ảnh vừa gắn không hiện ra — dù dữ liệu có thật.
 *
 * Chỉ gọi khi mở modal một sản phẩm; danh sách vẫn dùng bản tổng hợp vì gọi
 * chi tiết cho cả trang là 50 round-trip.
 */
export const fetchProductMedia = async (
  productId: string
): Promise<ProductAsset[]> => {
  const res = await rexerApi.products.get(productId);
  return (res.media ?? [])
    .filter(m => m.asset)
    .sort((a, b) => (a.binding.sort_order ?? 0) - (b.binding.sort_order ?? 0))
    .map(m => {
      const a = m.asset!;
      return {
        id: a.id,
        name: a.original_filename,
        kind:
          a.media_type === 'video'
            ? ('VID' as const)
            : a.media_type === '3d'
              ? ('D3' as const)
              : ('IMG' as const),
        grad: 'linear-gradient(135deg,#6C4CF1,#9B7DF8)',
        url: a.public_url,
        home: { scope: 'product', ref: productId },
      };
    });
};
