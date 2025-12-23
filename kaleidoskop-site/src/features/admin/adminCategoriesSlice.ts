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
  createLoading: boolean;
  updateLoading: boolean;
  createError: string | null;
  updateError: string | null;
  currentCategory: AdminCategory | null;
  currentCategoryLoading: boolean;
  currentCategoryError: string | null;
}

const initialState: AdminCategoriesState = {
  categories: [],
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  createError: null,
  updateError: null,
  currentCategory: null,
  currentCategoryLoading: false,
  currentCategoryError: null,
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

export const fetchAdminCategoryById = createAsyncThunk(
  'admin/categories/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin_panel/categories/${id}/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки категории');
    }
  }
);

export const createAdminCategory = createAsyncThunk(
  'admin/categories/create',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin_panel/categories/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка создания категории');
    }
  }
);

export const updateAdminCategory = createAsyncThunk(
  'admin/categories/update',
  async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin_panel/categories/${id}/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка обновления категории');
    }
  }
);

const adminCategoriesSlice = createSlice({
  name: 'adminCategories',
  initialState,
  reducers: {
    clearAdminCategoriesError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.currentCategoryError = null;
    },
    clearAdminCategories: (state) => {
      state.categories = [];
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
      state.currentCategoryError = null;
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
      })

      .addCase(fetchAdminCategoryById.pending, (state) => {
        state.currentCategoryLoading = true;
        state.currentCategoryError = null;
      })
      .addCase(fetchAdminCategoryById.fulfilled, (state, action) => {
        state.currentCategoryLoading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchAdminCategoryById.rejected, (state, action) => {
        state.currentCategoryLoading = false;
        state.currentCategoryError = action.payload as string;
      })

      .addCase(createAdminCategory.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createAdminCategory.fulfilled, (state, action) => {
        state.createLoading = false;
        state.categories.unshift(action.payload);
      })
      .addCase(createAdminCategory.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })

      .addCase(updateAdminCategory.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateAdminCategory.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.currentCategory?.id === action.payload.id) {
          state.currentCategory = action.payload;
        }
      })
      .addCase(updateAdminCategory.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      });
  },
});

export const { 
  clearAdminCategoriesError, 
  clearAdminCategories,
  clearCurrentCategory 
} = adminCategoriesSlice.actions;
export default adminCategoriesSlice.reducer;