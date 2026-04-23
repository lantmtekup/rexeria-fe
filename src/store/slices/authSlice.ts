import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  name?: string;
  role: string;
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
  { username: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ username, password }, { rejectWithValue }) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  const json = (await res.json()) as {
    success: boolean;
    data?: AuthUser;
    code?: string;
  };
  if (!json.success || !json.data) {
    return rejectWithValue(json.code ?? 'LOGIN_FAILED');
  }
  return json.data;
});

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
});

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
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
