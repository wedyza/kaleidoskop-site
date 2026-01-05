import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';
import type { AdminCategory } from './adminCategoriesSlice';

export interface Nomenclature {
  id: string;
  title: string;
  code: string;
  parent_code: string | null;
  parent: string | null;
  categories: AdminCategory[];
  daughter: Nomenclature[];
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
  currentNomenclature: Nomenclature | null;
  loading: boolean;
  error: string | null;
  addToCategoryLoading: boolean;
  addToCategoryError: string | null;
  count: number;
  currentNomenclatureLoading: boolean;
  currentNomenclatureError: string | null;
}

const initialState: AdminNomenclaturesState = {
  nomenclatures: [],
  currentNomenclature: null,
  loading: false,
  error: null,
  addToCategoryLoading: false,
  addToCategoryError: null,
  count: 0,
  currentNomenclatureLoading: false,
  currentNomenclatureError: null,
};

export const fetchAdminNomenclatures = createAsyncThunk<NomenclaturesResponse, { search?: string; assigned?: boolean } | void>(
  'admin/nomenclatures/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const search = params?.search;
      const assigned = params?.assigned;
      
      const urlParams = new URLSearchParams();
      if (search) urlParams.append('search', search);
      if (assigned !== undefined) urlParams.append('assigned', assigned.toString());
      
      const queryString = urlParams.toString();
      const url = `/admin_panel/nomenclatures/${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки номенклатур');
    }
  }
);

export const fetchAdminNomenclatureById = createAsyncThunk<Nomenclature, string>(
  'admin/nomenclatures/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin_panel/nomenclatures/${id}/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки номенклатуры');
    }
  }
);

export const addAdminNomenclatureToCategory = createAsyncThunk(
  'admin/nomenclatures/addToCategory',
  async (data: { category: AdminCategory; request: NomenclatureCategory[] }, { rejectWithValue }) => {
    try {
      await api.post('/admin_panel/nomenclatures/add_to_category/', data.request);
      return { category: data.category, request: data.request };
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

      .addCase(fetchAdminNomenclatureById.pending, (state) => {
        state.currentNomenclatureLoading = true;
        state.currentNomenclatureError = null;
      })
      .addCase(fetchAdminNomenclatureById.fulfilled, (state, action) => {
        state.currentNomenclatureLoading = false;
        state.currentNomenclature = action.payload;
      })
      .addCase(fetchAdminNomenclatureById.rejected, (state, action) => {
        state.currentNomenclatureLoading = false;
        state.currentNomenclatureError = action.payload as string;
      })

      .addCase(addAdminNomenclatureToCategory.pending, (state) => {
        state.addToCategoryLoading = true;
        state.addToCategoryError = null;
      })
      .addCase(addAdminNomenclatureToCategory.fulfilled, (state, action) => {
        state.addToCategoryLoading = false;
        
        if (action.payload.request && action.payload.request.length > 0) {
          const { category: categoryId, nomenclature: nomId } = action.payload.request[0];
          const categoryToAdd = action.payload.category;
          
          if (categoryToAdd) {
            const nomIndex = state.nomenclatures.findIndex(n => n.id === nomId);
            if (nomIndex !== -1) {
              const nom = state.nomenclatures[nomIndex];
              if (!nom.categories.some(cat => cat.id === categoryId)) {
                state.nomenclatures[nomIndex].categories.push(categoryToAdd);
              }
            }
          }
        }
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