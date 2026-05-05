'use client';

import { useAppSelector } from '@/hooks/useRedux';

export type PrincipalType = 'admin' | 'staff' | 'client_user';

/**
 * Read the current auth user's role bucket. Useful for UI gating.
 *
 * - `admin` / `staff` → internal team members; full app surface.
 * - `client_user` → external tenants; restricted to client-facing screens.
 */
export function useAuthRole() {
  const user = useAppSelector(s => s.auth.user);
  const principalType = (user?.principal_type ?? '') as PrincipalType | '';

  return {
    user,
    principalType,
    isAdmin: principalType === 'admin',
    isStaff: principalType === 'staff',
    isInternal: principalType === 'admin' || principalType === 'staff',
    isClientUser: principalType === 'client_user',
  };
}
