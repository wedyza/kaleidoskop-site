import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';

interface AuthState {
  email: string;
  token: string | null;
  step: 'email' | 'otp' | 'authenticated';
  loading: boolean;
  error: string | null;
  changeEmailStep: 'idle' | 'requested' | 'validated'; // состояние смены почты
  newEmail: string; // новая почта для смены
}

const initialState: AuthState = {
  email: '',
  token: localStorage.getItem('token'),
  step: localStorage.getItem('token') ? 'authenticated' : 'email',
  loading: false,
  error: null,
  changeEmailStep: 'idle',
  newEmail: '',
};

export const createOtp = createAsyncThunk(
  'auth/createOtp',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/create-otp/', {
        email,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка отправки кода');
    }
  }
);

export const validateOtp = createAsyncThunk(
  'auth/validateOtp',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/validate-otp/', { email, otp });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при проверке кода');
    }
  }
);

export const changeEmail = createAsyncThunk(
  'auth/changeEmail',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/change-email/', {
        email,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при запросе смены почты');
    }
  }
);

export const validateChangeEmail = createAsyncThunk(
  'auth/validateChangeEmail',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/change-email/validate', { email, otp });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при подтверждении смены почты');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setEmail(state, action) {
      state.email = action.payload;
    },
    logout(state) {
      state.token = null;
      state.step = 'email';
      state.email = '';
      state.changeEmailStep = 'idle';
      state.newEmail = '';
      localStorage.removeItem('token');
      localStorage.removeItem('selectedBasketIds');
    },
    setNewEmail(state, action) {
      state.newEmail = action.payload;
    },
    resetChangeEmailState(state) {
      state.changeEmailStep = 'idle';
      state.newEmail = '';
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOtp.fulfilled, (state) => {
        state.loading = false;
        state.step = 'otp';
      })
      .addCase(createOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(validateOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access;
        state.step = 'authenticated';
        localStorage.setItem('token', action.payload.access);
      })
      .addCase(validateOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(changeEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.changeEmailStep = 'requested';
        state.newEmail = action.meta.arg;
      })
      .addCase(changeEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.changeEmailStep = 'idle';
      })
      .addCase(validateChangeEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateChangeEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.changeEmailStep = 'validated';
        state.email = state.newEmail;
        state.newEmail = '';
        
        if (action.payload.access) {
          state.token = action.payload.access;
          localStorage.setItem('token', action.payload.access);
        }
      })
      .addCase(validateChangeEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setEmail, 
  logout, 
  setNewEmail, 
  resetChangeEmailState, 
  clearError 
} = authSlice.actions;
export default authSlice.reducer;