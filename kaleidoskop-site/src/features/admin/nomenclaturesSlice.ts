import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';
import type { Category } from '../categories/categoriesSlice';

export interface Nomenclature {
  id: string;
  title: string;
  code: string;
  parent_code: string | null;
  parent: string | null;
  categories: Category[];
}

interface NomenclaturesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Nomenclature[];
}

interface NomenclatureCategory {
  category: string;
  nomenclature: string;
}

interface AdminNomenclaturesState {
  nomenclatures: Nomenclature[];
  loading: boolean;
  error: string | null;
  addToCategoryLoading: boolean;
  addToCategoryError: string | null;
  count: number;
}

const initialState: AdminNomenclaturesState = {
  nomenclatures: [],
  loading: false,
  error: null,
  addToCategoryLoading: false,
  addToCategoryError: null,
  count: 0,
};

export const fetchAdminNomenclatures = createAsyncThunk<NomenclaturesResponse>(
  'admin/nomenclatures/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin_panel/nomenclatures/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки номенклатур');
    }
  }
);

export const addAdminNomenclatureToCategory = createAsyncThunk(
  'admin/nomenclatures/addToCategory',
  async (data: NomenclatureCategory[], { rejectWithValue }) => {
    try {
      const response = await api.post('/admin_panel/nomenclatures/add_to_category/', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка привязки к категории');
    }
  }
);

const adminNomenclaturesSlice = createSlice({
  name: 'adminNomenclatures',
  initialState,
  reducers: {
    clearAdminNomenclaturesError: (state) => {
      state.error = null;
      state.addToCategoryError = null;
    },
    clearAdminNomenclatures: (state) => {
      state.nomenclatures = [];
      state.count = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminNomenclatures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminNomenclatures.fulfilled, (state, action) => {
        state.loading = false;
        state.nomenclatures = action.payload.results;
        state.count = action.payload.count;
      })
      .addCase(fetchAdminNomenclatures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(addAdminNomenclatureToCategory.pending, (state) => {
        state.addToCategoryLoading = true;
        state.addToCategoryError = null;
      })
      .addCase(addAdminNomenclatureToCategory.fulfilled, (state) => {
        state.addToCategoryLoading = false;
      })
      .addCase(addAdminNomenclatureToCategory.rejected, (state, action) => {
        state.addToCategoryLoading = false;
        state.addToCategoryError = action.payload as string;
      });
  },
});

export const { 
  clearAdminNomenclaturesError, 
  clearAdminNomenclatures,
} = adminNomenclaturesSlice.actions;
export default adminNomenclaturesSlice.reducer;