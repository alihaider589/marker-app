// store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  session: any;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  session: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<any>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
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
    },
  },
});

export const { setUser, clearUser, setUserSession, clearSession } =
  authSlice.actions;
export default authSlice.reducer;
