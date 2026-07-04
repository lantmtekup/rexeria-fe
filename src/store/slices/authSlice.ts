import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';

export type AuthUser = {
  id: string;
  email: string;
  display_name: string;
  principal_type: string;
  /**
   * FE-facing role per BE docs: `'admin' | 'staff' | 'client_user'`.
   * Backfilled from `principal_type` by BE migration 000108. Use this for
   * sidebar gating + smart redirect after login.
   */
  role: string;
  status: string;
  /**
   * Brand id when role === 'client_user'. Null cho admin/staff.
   * `brand.id` == legacy `client.id` (cutover 000143).
   */
  brand_id?: string | null;
  /** Brand name — convenience field từ LoginResponse.brand.name. */
  brand_name?: string | null;
};

type AuthState = {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

export const loginThunk = createAsyncThunk<
  AuthUser,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await rexerApi.auth.login({ email, password });
    // Mirror a local signed cookie so the middleware can gate app routes and
    // route the user home by role (admin → /admin, brand → /portal).
    // Role/scope do route tự verify với BE /v1/auth/me — không gửi từ client.
    await fetch('/api/auth/session-set', {
      method: 'POST',
      credentials: 'include',
    });
    return {
      id: res.user.id,
      email: res.user.email,
      display_name: res.user.display_name,
      principal_type: res.user.principal_type,
      role: res.user.role ?? res.user.principal_type,
      status: res.user.status,
      brand_id: res.brand?.id ?? null,
      brand_name: res.brand?.name ?? null,
    };
  } catch (err) {
    if (err instanceof RxApiError) {
      return rejectWithValue(err.code || err.message);
    }
    return rejectWithValue('LOGIN_FAILED');
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    await rexerApi.auth.logout();
  } catch {
    // ignore — still clear local state
  }
  await fetch('/api/auth/session-clear', {
    method: 'POST',
    credentials: 'include',
  });
});

export const fetchMeThunk = createAsyncThunk<AuthUser | null>(
  'auth/me',
  async () => {
    try {
      const res = await rexerApi.auth.me();
      return {
        id: res.user.id,
        email: res.user.email,
        display_name: res.user.display_name,
        principal_type: res.user.principal_type,
        role: res.user.role ?? res.user.principal_type,
        status: res.user.status,
        brand_id: res.brand?.id ?? null,
        brand_name: res.brand?.name ?? null,
      };
    } catch (err) {
      // BE says we're unauthenticated (expired/invalid session) but the local
      // signed cookie may still exist → middleware would bounce /sign-in back
      // to the protected route, trapping the guard on a spinner. Clear the
      // stale cookie here and await it so any guard redirect that follows
      // actually sticks. Only on 401 — a network blip must not nuke the session.
      if (err instanceof RxApiError && err.status === 401) {
        try {
          await fetch('/api/auth/session-clear', {
            method: 'POST',
            credentials: 'include',
          });
        } catch {
          // ignore — best effort
        }
      }
      return null;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: state => {
      state.user = null;
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginThunk.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'LOGIN_FAILED';
      })
      .addCase(logoutThunk.fulfilled, state => {
        state.user = null;
        state.status = 'idle';
        state.error = null;
      })
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        // Reach a terminal state either way so guards stop waiting. A null
        // payload = unauthenticated → clear user + mark failed (guard → login).
        if (action.payload) {
          state.user = action.payload;
          state.status = 'succeeded';
        } else {
          state.user = null;
          state.status = 'failed';
        }
      })
      .addCase(fetchMeThunk.rejected, state => {
        state.user = null;
        state.status = 'failed';
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
