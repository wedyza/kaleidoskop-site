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
  assignedNomenclatures: Nomenclature[];
  assignedLoading: boolean;
  assignedError: string | null;
}

const initialState: AdminNomenclaturesState = {
  nomenclatures: [],
  loading: false,
  error: null,
  addToCategoryLoading: false,
  addToCategoryError: null,
  count: 0,
  assignedNomenclatures: [],
  assignedLoading: false,
  assignedError: null,
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

export const fetchAssignedNomenclatures = createAsyncThunk<NomenclaturesResponse>(
  'admin/nomenclatures/fetchAssigned',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin_panel/nomenclatures/assigned/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки назначенных номенклатур');
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
      state.assignedError = null;
    },
    clearAdminNomenclatures: (state) => {
      state.nomenclatures = [];
      state.count = 0;
    },
    clearAssignedNomenclatures: (state) => {
      state.assignedNomenclatures = [];
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

      .addCase(fetchAssignedNomenclatures.pending, (state) => {
        state.assignedLoading = true;
        state.assignedError = null;
      })
      .addCase(fetchAssignedNomenclatures.fulfilled, (state, action) => {
        state.assignedLoading = false;
        state.assignedNomenclatures = action.payload.results;
      })
      .addCase(fetchAssignedNomenclatures.rejected, (state, action) => {
        state.assignedLoading = false;
        state.assignedError = action.payload as string;
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

            const assignedNomIndex = state.assignedNomenclatures.findIndex(n => n.id === nomId);
            if (assignedNomIndex !== -1) {
              const assignedNom = state.assignedNomenclatures[assignedNomIndex];
              if (!assignedNom.categories.some(cat => cat.id === categoryId)) {
                state.assignedNomenclatures[assignedNomIndex].categories.push(categoryToAdd);
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
  clearAssignedNomenclatures,
} = adminNomenclaturesSlice.actions;
export default adminNomenclaturesSlice.reducer;