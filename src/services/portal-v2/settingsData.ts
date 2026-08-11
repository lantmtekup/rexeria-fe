import {
  settingsToGovernance,
  v2ToMember,
  v2ToSettings,
} from '@/lib/portal-v2/settings/fromV2';
import type {
  SettingsData,
  SettingsMember,
} from '@/lib/portal-v2/settings/types';
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
    const [gov, caps, me, members] = await Promise.all([
      rexerV2Api.settings.governance(brandId),
      rexerV2Api.settings.capabilities(brandId),
      rexerV2Api.settings.meProfile(),
      rexerV2Api.settings.members(brandId),
    ]);
    const list = (members.items ?? []).map(v2ToMember);
    return {
      data: v2ToSettings(gov, caps, me, {
        seats: list.length,
        members: list,
      }),
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

/* ── thành viên ───────────────────────────────────────────────────────────── */

/**
 * `seats` trong tab General = số thành viên. Không nguồn nào trả sẵn con số đó,
 * nên đếm từ chính danh sách này — 0 lúc chưa nạp nghĩa là CHƯA BIẾT, không
 * phải "không có ai".
 */
export const fetchMembers = async (
  brandId: string | null
): Promise<SettingsMember[]> => {
  if (!brandId) return [];
  try {
    const res = await rexerV2Api.settings.members(brandId);
    return (res.items ?? []).map(v2ToMember);
  } catch {
    return [];
  }
};

/**
 * Mời một người vào brand. Email chưa có trong hệ thống thì BE TẠO tài khoản
 * rồi gửi thư qua Resend; chưa cấu hình khoá thì nó trả mật khẩu sinh ra để
 * người mời chuyển tay.
 *
 * `POST` bọc trong `{membership}` và bản bọc KHÔNG mang email/tên, nên nạp lại
 * danh sách để lấy bản đầy đủ thay vì dựng một thẻ thiếu chữ.
 */
export type InviteResult = {
  member: SettingsMember;
  /** Rỗng khi thư đã gửi — xem `RxMembershipEnvelope`. */
  generatedPassword: string;
};

export const inviteMember = async (
  brandId: string,
  email: string,
  role: string
): Promise<InviteResult> => {
  const res = await rexerV2Api.settings.inviteMember(brandId, {
    email,
    role: role as 'owner' | 'manager' | 'editor' | 'viewer',
  });
  const list = await fetchMembers(brandId);
  const member = list.find(m => m.id === res.membership.user_id) ?? {
    id: res.membership.user_id,
    name: email,
    initials: email.slice(0, 2).toUpperCase(),
    email,
    role: res.membership.role,
    lastActive: '',
    pending: true,
  };
  return { member, generatedPassword: res.membership.generated_password ?? '' };
};

export const setMemberRole = async (
  brandId: string,
  userId: string,
  role: string
): Promise<SettingsMember> => {
  await rexerV2Api.settings.setMemberRole(brandId, userId, role);
  const list = await fetchMembers(brandId);
  const found = list.find(m => m.id === userId);
  if (!found) throw new Error('MEMBER_GONE');
  return found;
};

export const removeMember = (brandId: string, userId: string): Promise<void> =>
  rexerV2Api.settings.removeMember(brandId, userId);
