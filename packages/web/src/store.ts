import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { baseApi, type BeUser } from './api.js';

interface AuthState {
  user: BeUser | null;
  token: string | null;
}

const initialAuthState: AuthState = { user: null, token: null };

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    credentialsReceived(
      state,
      action: PayloadAction<{ user: BeUser; token: string }>,
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    loggedOut(state) {
      state.user = null;
      state.token = null;
    },
  },
});

export const { credentialsReceived, loggedOut } = authSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
