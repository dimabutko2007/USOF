import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';
import { userApi } from '../api/extraApis';

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.getMe();
    return res.user;
  } catch (err) {
    return null;
  }
});

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const res = await authApi.login(credentials);
    return res.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await authApi.logout();
    return null;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateAvatar = createAsyncThunk('auth/updateAvatar', async (formData, { rejectWithValue }) => {
  try {
    const res = await userApi.uploadAvatar(formData);
    return res.avatar;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null, // null means Guest
    role: 'guest',
    isAuthenticated: false,
    loading: true,
    error: null,
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.role = action.payload?.role || 'guest';
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload?.role || 'guest';
        state.isAuthenticated = !!action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.role = 'guest';
        state.isAuthenticated = false;
      })
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload?.role || 'guest';
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.role = 'guest';
        state.isAuthenticated = false;
        state.error = null;
      })
      // updateAvatar
      .addCase(updateAvatar.fulfilled, (state, action) => {
        if (state.user) {
          state.user.profile_picture = action.payload;
        }
      });
  },
});

export const { clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;

