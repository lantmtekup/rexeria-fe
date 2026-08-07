import {
  settingsToGovernance,
  v2ToSettings,
} from '@/lib/portal-v2/settings/fromV2';
import type { SettingsData } from '@/lib/portal-v2/settings/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

/**
 * Màn Settings ← ba endpoint.
 *
 * Trước đây toàn bộ chạy trên `MOCK_SETTINGS` và Save chỉ đổi state — người
 * dùng chỉnh ngưỡng đo rồi tải lại trang là mất, mà không có dấu hiệu nào.
 */

export type SettingsLoad = {
  data: SettingsData | null;
  /** Khoá lạc quan của governance — `PUT` bắt gửi đúng số này. */
  version: number;
  error: string | null;
};

export const fetchSettings = async (
  brandId: string | null
): Promise<SettingsLoad> => {
  // Không có brand thì không hỏi được: cả governance lẫn capabilities đều 400.
  if (!brandId) {
    return { data: null, version: 0, error: null };
  }
  try {
    const [gov, caps, me] = await Promise.all([
      rexerV2Api.settings.governance(brandId),
      rexerV2Api.settings.capabilities(brandId),
      rexerV2Api.settings.meProfile(),
    ]);
    return {
      data: v2ToSettings(gov, caps, me),
      version: gov.version,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      version: 0,
      error: err instanceof Error ? err.message : 'Failed to load settings',
    };
  }
};

/**
 * Lưu — hai đích, vì chúng thuộc hai chủ thể khác nhau: governance là của
 * BRAND, còn tên/chức danh là của CHÍNH người đang đăng nhập.
 *
 * `version` lệch ⇒ 409, và người dùng cần biết bản của họ đã cũ thay vì tưởng
 * đã lưu xong.
 */
export const saveSettings = async (
  data: SettingsData,
  version: number,
  brandId: string
): Promise<{ data: SettingsData; version: number }> => {
  const gov = await rexerV2Api.settings.putGovernance(
    settingsToGovernance(data, version),
    brandId
  );
  const me = await rexerV2Api.settings.putMeProfile({
    name: data.general.accountName,
    email: data.general.accountEmail,
    title: data.general.accountTitle,
  });
  const caps = await rexerV2Api.settings.capabilities(brandId);
  return {
    data: v2ToSettings(gov, caps, me, {
      seats: data.general.seats,
      members: data.members,
    }),
    version: gov.version,
  };
};

/** Trả tài liệu về mặc định của hệ thống (GOV_DEFAULTS), version tăng lên. */
export const resetSettings = async (
  brandId: string,
  keep: SettingsData
): Promise<{ data: SettingsData; version: number }> => {
  const gov = await rexerV2Api.settings.resetGovernance(brandId);
  const [caps, me] = await Promise.all([
    rexerV2Api.settings.capabilities(brandId),
    rexerV2Api.settings.meProfile(),
  ]);
  return {
    data: v2ToSettings(gov, caps, me, {
      seats: keep.general.seats,
      members: keep.members,
    }),
    version: gov.version,
  };
};
