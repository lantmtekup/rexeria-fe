/**
 * Single source of truth for "where does this role land after login".
 *
 * Cutover 2026-06-03 (be-response-to-fe-qa §C1): không dựa `role` đơn lẻ vì
 * `staff` dùng chung cho cả platform staff lẫn brand user. Phân biệt bằng
 * `principal_type === 'admin'` + sự hiện diện của brand (`scope`):
 *
 * - role/principal_type `admin`         → `/admin`     (platform admin CMS)
 * - có brand (`scope === 'brand'`)      → `/portal-v2` (brand user, vd lantm)
 * - còn lại (platform staff không brand)→ `/home`
 *
 * 2026-08-09: brand user đổi từ `/portal` sang `/portal-v2`. Shell V2 tách hoàn
 * toàn khỏi `/portal` cũ và nay là mặt chính của brand user; `/portal` vẫn truy
 * cập được bằng URL trực tiếp, chỉ không còn là đích sau đăng nhập.
 *
 * `scope` lấy từ: client-side = `user.brand_id ? 'brand' : 'platform'`;
 * server-side (middleware, root `/`) = claim `scope` trong session JWT
 * (xem `/api/auth/session-set`).
 *
 * Shared by the sign-in forms, the middleware (authed user hitting an auth
 * route), and the root `/` page so the redirect target never drifts between
 * call sites.
 */
export function roleHomePath(
  role: string | null | undefined,
  scope?: 'brand' | 'platform' | null
): string {
  if (role === 'admin') return '/admin';
  if (scope === 'brand') return '/portal-v2';
  return '/home';
}
