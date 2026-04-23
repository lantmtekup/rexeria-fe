'use client';

import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchMeThunk } from '@/store/slices/authSlice';

/**
 * Mount once inside the authenticated shell. If Redux has no user yet but the
 * session cookie is present (user refreshed the page), pull the profile from
 * `/auth/me` so AppSidebar and other consumers show real data.
 */
export function AuthHydrator() {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector(s => s.auth);

  useEffect(() => {
    if (!user && status === 'idle') {
      dispatch(fetchMeThunk());
    }
  }, [dispatch, user, status]);

  return null;
}
