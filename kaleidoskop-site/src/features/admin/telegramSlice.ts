import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';

interface ConnectTelegramRequest {
  code: string;
}

interface AdminTelegramState {
  connecting: boolean;
  error: string | null;
  success: boolean;
}

const initialState: AdminTelegramState = {
  connecting: false,
  error: null,
  success: false,
};

export const connectTelegram = createAsyncThunk(
  'admin/telegram/connect',
  async ({ code }: ConnectTelegramRequest, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin_panel/telegram_session/', { code });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка подключения Telegram');
    }
  }
);

const adminTelegramSlice = createSlice({
  name: 'adminTelegram',
  initialState,
  reducers: {
    clearTelegramError: (state) => {
      state.error = null;
    },
    clearTelegramSuccess: (state) => {
      state.success = false;
    },
    resetTelegramState: (state) => {
      state.connecting = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectTelegram.pending, (state) => {
        state.connecting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(connectTelegram.fulfilled, (state) => {
        state.connecting = false;
        state.success = true;
      })
      .addCase(connectTelegram.rejected, (state, action) => {
        state.connecting = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { 
  clearTelegramError, 
  clearTelegramSuccess,
  resetTelegramState 
} = adminTelegramSlice.actions;
export default adminTelegramSlice.reducer;