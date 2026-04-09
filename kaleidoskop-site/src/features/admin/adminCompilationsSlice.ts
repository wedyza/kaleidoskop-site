import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';

interface Nomenclature {
  id: string;
  title: string;
  code: string | null;
  status: boolean;
}

interface Compilation {
  id: string;
  title: string;
  item_count: string;
  public_queue: string;
  created_at: string;
  start_time?: string;
  end_time?: string;
  active: boolean;
  queue: number;
  nomenclatures: string[];
}

interface AdminCompilationsState {
  compilations: Compilation[];
  selectedCompilation: Compilation | null;
  selectedCompilationNomenclatures: Nomenclature[];
  loading: boolean;
  error: string | null;
  nomenclatureLoading: boolean;
  nomenclatureError: string | null;
}

const initialState: AdminCompilationsState = {
  compilations: [],
  selectedCompilation: null,
  selectedCompilationNomenclatures: [],
  loading: false,
  error: null,
  nomenclatureLoading: false,
  nomenclatureError: null,
};

export const fetchCompilations = createAsyncThunk(
  'adminCompilations/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin_panel/compilations/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки подборок');
    }
  }
);

export const createCompilation = createAsyncThunk(
  'adminCompilations/create',
  async (data: { title: string; start_time?: string; end_time?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin_panel/compilations/', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка создания подборки');
    }
  }
);

export const updateCompilation = createAsyncThunk(
  'adminCompilations/update',
  async ({ id, data }: { id: string; data: { title?: string; start_time?: string; end_time?: string | null; active?: boolean; queue?: number } }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin_panel/compilations/${id}/`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка обновления подборки');
    }
  }
);

export const deleteCompilation = createAsyncThunk(
  'adminCompilations/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/admin_panel/compilations/${id}/`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка удаления подборки');
    }
  }
);

export const fetchCompilationNomenclatures = createAsyncThunk(
  'adminCompilations/fetchNomenclatures',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin_panel/compilations/${id}/list_nomenclatures/`);
      return { id, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки номенклатур');
    }
  }
);

export const attachNomenclature = createAsyncThunk(
  'adminCompilations/attachNomenclature',
  async ({ id, nomenclatureId }: { id: string; nomenclatureId: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin_panel/compilations/${id}/attach_nomenclature/`, { nomenclature: nomenclatureId });
      return { id, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка добавления номенклатуры');
    }
  }
);

export const fetchCompilationById = createAsyncThunk(
  'adminCompilations/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin_panel/compilations/${id}/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки подборки');
    }
  }
);

const adminCompilationsSlice = createSlice({
  name: 'adminCompilations',
  initialState,
  reducers: {
    clearCompilationsError: (state) => {
      state.error = null;
    },
    clearNomenclatureError: (state) => {
      state.nomenclatureError = null;
    },
    resetCompilationsState: (state) => {
      state.compilations = [];
      state.selectedCompilationNomenclatures = [];
      state.loading = false;
      state.error = null;
      state.nomenclatureLoading = false;
      state.nomenclatureError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompilations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompilations.fulfilled, (state, action) => {
        state.loading = false;
        state.compilations = action.payload;
      })
      .addCase(fetchCompilations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCompilation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompilation.fulfilled, (state, action) => {
        state.loading = false;
        state.compilations.push(action.payload);
      })
      .addCase(createCompilation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCompilation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompilation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.compilations.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.compilations[index] = action.payload;
        }
      })
      .addCase(updateCompilation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteCompilation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompilation.fulfilled, (state, action) => {
        state.loading = false;
        state.compilations = state.compilations.filter(c => c.id !== action.payload);
      })
      .addCase(deleteCompilation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCompilationNomenclatures.pending, (state) => {
        state.nomenclatureLoading = true;
        state.nomenclatureError = null;
      })
      .addCase(fetchCompilationNomenclatures.fulfilled, (state, action) => {
        state.nomenclatureLoading = false;
        state.selectedCompilationNomenclatures = action.payload.data;
      })
      .addCase(fetchCompilationNomenclatures.rejected, (state, action) => {
        state.nomenclatureLoading = false;
        state.nomenclatureError = action.payload as string;
      })
      .addCase(attachNomenclature.pending, (state) => {
        state.nomenclatureLoading = true;
        state.nomenclatureError = null;
      })
      .addCase(attachNomenclature.fulfilled, (state, action) => {
        state.nomenclatureLoading = false;
        state.selectedCompilationNomenclatures.push(action.payload.data);
      })
      .addCase(attachNomenclature.rejected, (state, action) => {
        state.nomenclatureLoading = false;
        state.nomenclatureError = action.payload as string;
      })
      .addCase(fetchCompilationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompilationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCompilation = action.payload;
      })
      .addCase(fetchCompilationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearCompilationsError,
  clearNomenclatureError,
  resetCompilationsState
} = adminCompilationsSlice.actions;

export default adminCompilationsSlice.reducer;