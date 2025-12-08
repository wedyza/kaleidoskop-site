import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';

export interface Shop {
  id: string;
  title: string;
  longtitude: string;
  latitude: string;
  city: string;
  street: string;
  house: number;
}

interface ShopsState {
  shops: Shop[];
  loading: boolean;
  error: string | null;
}

const initialState: ShopsState = {
  shops: [],
  loading: false,
  error: null,
};

export const fetchShops = createAsyncThunk<Shop[], void, { rejectValue: string }>(
  'shops/fetchShops',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/shops/');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.detail || 
        err.message || 
        'Ошибка загрузки магазинов'
      );
    }
  }
);

const shopsSlice = createSlice({
  name: 'shops',
  initialState,
  reducers: {
    clearShopsError: (state) => {
      state.error = null;
    },
    clearShops: (state) => {
      state.shops = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShops.fulfilled, (state, action) => {
        state.loading = false;
        state.shops = action.payload;
      })
      .addCase(fetchShops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearShopsError, clearShops } = shopsSlice.actions;
export default shopsSlice.reducer;