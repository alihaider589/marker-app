// store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  session: any;
  isRestoring: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  session: null,
  isRestoring: true, // Start as true to prevent premature navigation
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<any>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isRestoring = false; // Auth check complete
    },
    setUserSession(state, action: PayloadAction<any>) {
      state.session = action.payload;
    },
    clearSession(state) {
      state.session = null;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isRestoring = false; // Auth check complete
    },
    setAuthRestored(state) {
      state.isRestoring = false; // Mark restoration as complete
    },
  },
});

export const { setUser, clearUser, setUserSession, clearSession, setAuthRestored } =
  authSlice.actions;
export default authSlice.reducer;
