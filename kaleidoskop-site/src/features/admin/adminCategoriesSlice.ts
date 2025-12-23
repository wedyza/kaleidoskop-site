import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';

export interface AdminCategory {
  id: string;
  title: string;
  active: boolean;
  image: string | null;
  parent: string | null;
  daughter_count?: number;
  nomenclatures: string[];
}

interface AdminCategoriesState {
  categories: AdminCategory[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminCategoriesState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchAdminCategories = createAsyncThunk(
  'admin/categories/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin_panel/categories/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки категорий');
    }
  }
);

const adminCategoriesSlice = createSlice({
  name: 'adminCategories',
  initialState,
  reducers: {
    clearAdminCategoriesError: (state) => {
      state.error = null;
    },
    clearAdminCategories: (state) => {
      state.categories = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchAdminCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminCategoriesError, clearAdminCategories } = adminCategoriesSlice.actions;
export default adminCategoriesSlice.reducer;