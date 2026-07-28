'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useAuthRole } from '@/hooks/useAuthRole';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchMeThunk } from '@/store/slices/authSlice';
import { roleHomePath } from '@/lib/auth/roleTarget';

/**
 * Client-side gate for `/admin/*` routes. `middleware.ts` already role-gates
 * `/admin` server-side (`session.role !== 'admin'` → bounce, staff included)
 * using the JWT's `role` claim — this guard mirrors that SAME `isAdmin`-only
 * check client-side (e.g. client-side nav without a full reload skips
 * middleware) so staff never see a flash of admin content before a redirect.
 *
 * Loads `auth/me` if the Redux store is empty (e.g., hard refresh on
 * `/admin/...`).
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations('admin');
  const { isAdmin } = useAuthRole();
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
    if (!isAdmin) {
      // Bounce non-admin về home theo role: brand user → /portal, còn lại
      // (kể cả staff) → /home (khớp roleHomePath dùng ở sign-in + middleware).
      router.replace(
        roleHomePath(user.role, user.brand_id ? 'brand' : 'platform')
      );
    }
  }, [hydrated, user, isAdmin, router]);

  if (!hydrated || !user) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center'>
        <div className='border-primary size-6 animate-spin rounded-full border-2 border-t-transparent' />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center p-6 text-center'>
        <p className='text-content-muted text-sm'>{t('forbidden')}</p>
      </div>
    );
  }

  return <>{children}</>;
}
