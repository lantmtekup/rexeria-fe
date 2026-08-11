import { rexerApi } from '@/services/rexer/endpoints';

/**
 * Phạm vi làm việc của Portal V2 — brand và workspace nào đang được sửa.
 *
 * Không dựng khái niệm mới: dùng lại đúng cơ chế đã có của hệ thống, và đúng
 * quy tắc mà `useWorkspaceScope` của luồng v1 đã chạy ổn.
 *
 *   khách hàng  `/me/workspaces` có membership → brand suy từ workspace
 *   ADMIN       `/me/workspaces` trả [] → PHẢI chọn tường minh
 *
 * Vế thứ hai không phải trường hợp hiếm: admin cố ý không thuộc brand nào vì
 * họ thao tác chéo mọi brand. Để hệ thống tự chọn hộ là cách sinh ra đúng cái
 * nhầm đã xảy ra — sửa hồ sơ của brand này trong khi tưởng đang sửa brand kia.
 *
 * Lựa chọn của admin đi qua query param `?brand=` chứ không phải localStorage:
 * server component đọc được, link chia sẻ được, và không lệch giữa SSR với
 * hydrate.
 */

export type PortalScope = {
  brandId: string | null;
  brandName: string | null;
  workspaceId: string | null;
  /** Admin chưa chọn brand — màn hình phải hỏi trước khi cho ghi. */
  needsPick: boolean;
  /** Danh sách để admin chọn; rỗng với người dùng thường. */
  brands: { id: string; name: string }[];
  error: string | null;
};

const EMPTY: PortalScope = {
  brandId: null,
  brandName: null,
  workspaceId: null,
  needsPick: false,
  brands: [],
  error: null,
};

/** `?brand=` — nguồn duy nhất cho lựa chọn của admin. */
export const readBrandParam = (
  searchParams: Record<string, string | string[] | undefined>
): string | null => {
  const raw = searchParams.brand;
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v?.trim() || null;
};

export const resolvePortalScope = async (
  searchParams: Record<string, string | string[] | undefined> = {}
): Promise<PortalScope> => {
  const picked = readBrandParam(searchParams);

  let memberships: Awaited<
    ReturnType<typeof rexerApi.workspaces.myMemberships>
  >;
  try {
    memberships = await rexerApi.workspaces.myMemberships();
  } catch (err) {
    return {
      ...EMPTY,
      error: err instanceof Error ? err.message : 'Failed to resolve scope',
    };
  }

  const mine = memberships ?? [];
  if (mine.length > 0) {
    // Ưu tiên workspace mặc định; không có thì lấy cái đầu. Admin có thể vẫn
    // ép brand khác qua `?brand=` — họ có quyền chéo brand.
    const ws = mine.find(m => m.workspace?.is_default) ?? mine[0];
    const brandId = picked ?? ws?.workspace?.brand_id ?? null;
    return {
      ...EMPTY,
      brandId,
      workspaceId: ws?.workspace?.id ?? null,
      needsPick: false,
    };
  }

  // Không membership nào ⇒ admin. Phải liệt kê brand để họ chọn.
  try {
    const res = await rexerApi.brands.list({ limit: 200 });
    const brands = (res.items ?? []).map(b => ({ id: b.id, name: b.name }));
    const chosen = picked && brands.some(b => b.id === picked) ? picked : null;
    return {
      ...EMPTY,
      brandId: chosen,
      brandName: brands.find(b => b.id === chosen)?.name ?? null,
      // Chưa chọn thì KHÔNG tự lấy brand đầu danh sách — đó chính là chỗ sinh
      // ra nhầm lẫn: màn hình hiện hồ sơ của một brand ngẫu nhiên.
      needsPick: !chosen,
      brands,
    };
  } catch (err) {
    return {
      ...EMPTY,
      needsPick: true,
      error: err instanceof Error ? err.message : 'Failed to list brands',
    };
  }
};
