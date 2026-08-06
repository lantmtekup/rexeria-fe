import {
  brandDataToPut,
  profileToBrandData,
} from '@/lib/portal-v2/brand/mapProfile';
import type { BrandData } from '@/lib/portal-v2/brand/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

/**
 * Hồ sơ thương hiệu — đọc/ghi thật qua `GET/PUT /v1/brands/{id}/profile`.
 *
 * Trước đây màn Brand chạy trên `MOCK_BRAND` và lưu ra `window.alert`, nên tải
 * lại trang là mất sạch.
 *
 * `version` được giữ lại và gửi ngược lên khi lưu: đó là khoá chống ghi đè của
 * BE. Gửi bừa một số là mở đường cho hai tab cùng sửa rồi đè lên nhau.
 */

export type BrandProfileResult = {
  brandId: string | null;
  data: BrandData | null;
  version: number;
  error: string | null;
};

const message = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

/**
 * Hồ sơ của MỘT brand cụ thể.
 *
 * Brand do `resolvePortalScope` quyết, không phải hàm này tự đoán. Bản trước
 * lấy `brands.list({limit:1})` — thứ tự đó khác thứ tự API trả cho màn hình,
 * nên hồ sơ bị ghi vào một brand trong khi người dùng đang nhìn brand khác.
 */
export const fetchBrandProfile = async (
  brandId: string | null
): Promise<BrandProfileResult> => {
  try {
    if (!brandId) return { brandId: null, data: null, version: 0, error: null };

    const p = await rexerV2Api.brandProfile.get(brandId);
    return {
      brandId,
      data: profileToBrandData(p),
      version: p.version ?? 0,
      error: null,
    };
  } catch (err) {
    return {
      brandId: null,
      data: null,
      version: 0,
      error: message(err, 'Failed to load brand profile'),
    };
  }
};

export const saveBrandProfile = async (
  brandId: string,
  data: BrandData,
  version: number
): Promise<{ data: BrandData; version: number }> => {
  const p = await rexerV2Api.brandProfile.put(
    brandId,
    brandDataToPut(data, version)
  );
  // Đọc lại từ response: BE tăng `version` và có thể chuẩn hoá vài trường.
  // Giữ bản client gửi đi là lần lưu sau sẽ mang version cũ và bị từ chối.
  return { data: profileToBrandData(p), version: p.version ?? version + 1 };
};
