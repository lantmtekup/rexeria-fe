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
  // Gate on `role` (the FE-facing field BE maintains for exactly this):
  // a staff user is stored as principal_type='user' + role='staff', so
  // checking principal_type==='staff' never matched and bounced real staff
  // out of /admin. principal_type stays as a fallback for legacy buckets
  // ('user'/'internal' = internal team; 'admin' = admin).
  const role = (user?.role ?? user?.principal_type ?? '') as string;
  const principalType = (user?.principal_type ?? '') as PrincipalType | '';
  // Raw string for the legacy principal_type buckets the typed union omits
  // ('user' = internal staff, 'internal' = legacy internal).
  const pt = (user?.principal_type ?? '') as string;

  const isAdmin = role === 'admin' || pt === 'admin';
  const isStaff =
    role === 'staff' || pt === 'user' || pt === 'staff' || pt === 'internal';
  const isInternal = isAdmin || isStaff;

  return {
    user,
    role,
    principalType,
    isAdmin,
    isStaff,
    isInternal,
    isClientUser: !isInternal && role === 'client_user',
  };
}
