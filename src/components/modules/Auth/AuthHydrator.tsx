'use client';

import { useEffect, useRef } from 'react';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchMeThunk } from '@/store/slices/authSlice';

/**
 * Mount once inside the authenticated shell. If Redux has no user yet but the
 * session cookie is present (user refreshed the page), pull the profile from
 * `/auth/me` so AppSidebar and other consumers show real data.
 *
 * Hydrate đúng MỘT lần cho mỗi vòng đời mount. Sau khi logout
 * (`logoutThunk.fulfilled` đặt user=null, status='idle') KHÔNG fetch lại:
 * cookie vừa bị clear nên `/auth/me` sẽ trả 401 (vô hại — thunk nuốt lỗi,
 * nhưng làm bẩn console). `hydrated` ref chốt lại sau lần đầu thấy user hoặc
 * sau lần fetch đầu. Vào lại shell (mount mới) sẽ hydrate lại bình thường.
 */
export function AuthHydrator() {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector(s => s.auth);
  const hydrated = useRef(false);

  useEffect(() => {
    if (user) {
      hydrated.current = true;
      return;
    }
    if (hydrated.current) return;
    if (status === 'idle') {
      hydrated.current = true;
      dispatch(fetchMeThunk());
    }
  }, [dispatch, user, status]);

  return null;
}
