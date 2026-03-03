import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';

export interface Brand {
  id: string;
  title: string;
}

interface BrandsState {
  brands: Brand[];
  loading: boolean;
  error: string | null;
}

const initialState: BrandsState = {
  brands: [],
  loading: false,
  error: null,
};

export const fetchBrands = createAsyncThunk(
  'brands/fetchBrands',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/brands/${categoryId}/`);
      return response.data.results || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки брендов');
    }
  }
);

const brandsSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default brandsSlice.reducer;