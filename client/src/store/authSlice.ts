import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthUser {
  id?: number;
  name?: string;
  email?: string;
  full_name?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ user: AuthUser; token?: string | null }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token ?? null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
