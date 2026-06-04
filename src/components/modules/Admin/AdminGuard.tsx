'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useAuthRole } from '@/hooks/useAuthRole';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchMeThunk } from '@/store/slices/authSlice';
import { roleHomePath } from '@/lib/auth/roleTarget';

/**
 * Client-side gate for `/admin/*` routes. Middleware only verifies the JWT
 * cookie exists; this guard checks the actual user's role and bounces
 * non-admins to `/home`.
 *
 * Loads `auth/me` if the Redux store is empty (e.g., hard refresh on
 * `/admin/...`).
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations('admin');
  const { isAdmin, isStaff } = useAuthRole();
  const status = useAppSelector(s => s.auth.status);
  const user = useAppSelector(s => s.auth.user);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchMeThunk()).finally(() => setHydrated(true));
    } else {
      setHydrated(true);
    }
  }, [status, dispatch]);

  React.useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace('/sign-in');
      return;
    }
    if (!isAdmin && !isStaff) {
      // Bounce non-admin/non-staff về home theo role: brand user → /portal,
      // còn lại → /home (khớp roleHomePath dùng ở sign-in + middleware).
      router.replace(
        roleHomePath(user.role, user.brand_id ? 'brand' : 'platform')
      );
    }
  }, [hydrated, user, isAdmin, isStaff, router]);

  if (!hydrated || !user) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center'>
        <div className='border-primary size-6 animate-spin rounded-full border-2 border-t-transparent' />
      </div>
    );
  }

  if (!isAdmin && !isStaff) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center p-6 text-center'>
        <p className='text-content-muted text-sm'>{t('forbidden')}</p>
      </div>
    );
  }

  return <>{children}</>;
}
