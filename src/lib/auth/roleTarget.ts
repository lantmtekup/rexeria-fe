/**
 * Single source of truth for "where does this role land after login".
 *
 * - admin / staff  → `/admin`  (CMS — quản lý hệ thống)
 * - everything else (client_user / brand) → `/portal`
 *
 * Shared by the sign-in forms, the middleware (authed user hitting an auth
 * route), and the root `/` page so the redirect target never drifts between
 * call sites.
 */
export function roleHomePath(role: string | null | undefined): string {
  return role === 'admin' || role === 'staff' ? '/admin' : '/portal';
}
