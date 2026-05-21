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
  /** Client (workspace) id when role === 'client_user'. Null cho admin/staff. */
  client_id?: string | null;
  /** Client name — convenience field từ LoginResponse.client.name. */
  client_name?: string | null;
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
    // Mirror a local signed cookie so the middleware can gate app routes.
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
      client_id: res.client?.id ?? null,
      client_name: res.client?.name ?? null,
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
        client_id: res.client?.id ?? null,
        client_name: res.client?.name ?? null,
      };
    } catch {
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
        if (action.payload) {
          state.user = action.payload;
          state.status = 'succeeded';
        }
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
