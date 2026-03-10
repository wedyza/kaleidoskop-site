import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';

export interface Banner {
  id: string;
  title: string;
  public_queue: string;
  source: string;
  created_at: string;
  active: boolean;
  queue: number;
}

interface AdminBannersState {
  firstGroup: {
    items: Banner[];
    loading: boolean;
    error: string | null;
  };
  secondGroup: {
    items: Banner[];
    loading: boolean;
    error: string | null;
  };
}

const initialState: AdminBannersState = {
  firstGroup: {
    items: [],
    loading: false,
    error: null,
  },
  secondGroup: {
    items: [],
    loading: false,
    error: null,
  },
};

export const fetchAdminFirstGroupBanners = createAsyncThunk(
  'adminBanners/fetchFirstGroup',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin_panel/banner/first_group/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки баннеров первой группы');
    }
  }
);

export const fetchAdminSecondGroupBanners = createAsyncThunk(
  'adminBanners/fetchSecondGroup',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin_panel/banner/second_group/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки баннеров второй группы');
    }
  }
);

export const fetchAllAdminBanners = createAsyncThunk(
  'adminBanners/fetchAll',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchAdminFirstGroupBanners()),
      dispatch(fetchAdminSecondGroupBanners())
    ]);
  }
);

export const toggleBannerStatus = createAsyncThunk(
  'adminBanners/toggleStatus',
  async ({ id, active }: { id: string; active: boolean }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin_panel/banner/${id}/`, { active });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка изменения статуса баннера');
    }
  }
);

export const uploadAdminFirstGroupBanner = createAsyncThunk(
  'adminBanners/uploadFirstGroup',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('source', file);
      
      const response = await api.post('/admin_panel/banner/first_group/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки баннера');
    }
  }
);

export const uploadAdminSecondGroupBanner = createAsyncThunk(
  'adminBanners/uploadSecondGroup',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('source', file);
      
      const response = await api.post('/admin_panel/banner/second_group/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки баннера');
    }
  }
);

export const deleteAdminBanner = createAsyncThunk(
  'adminBanners/deleteBanner',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/admin_panel/banner/${id}/`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка удаления баннера');
    }
  }
);

const adminBannersSlice = createSlice({
  name: 'adminBanners',
  initialState,
  reducers: {
    clearAdminFirstGroupError: (state) => {
      state.firstGroup.error = null;
    },
    clearAdminSecondGroupError: (state) => {
      state.secondGroup.error = null;
    },
    clearAllAdminErrors: (state) => {
      state.firstGroup.error = null;
      state.secondGroup.error = null;
    },
    resetAdminFirstGroup: (state) => {
      state.firstGroup = {
        items: [],
        loading: false,
        error: null,
      };
    },
    resetAdminSecondGroup: (state) => {
      state.secondGroup = {
        items: [],
        loading: false,
        error: null,
      };
    },
    resetAllAdminBanners: (state) => {
      state.firstGroup = {
        items: [],
        loading: false,
        error: null,
      };
      state.secondGroup = {
        items: [],
        loading: false,
        error: null,
      };
    },
    updateBannerStatusLocally: (state, action) => {
      const { id, active, group } = action.payload;
      const targetGroup = group === 'first' ? state.firstGroup : state.secondGroup;
      const banner = targetGroup.items.find(b => b.id === id);
      if (banner) {
        banner.active = active;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminFirstGroupBanners.pending, (state) => {
        state.firstGroup.loading = true;
        state.firstGroup.error = null;
      })
      .addCase(fetchAdminFirstGroupBanners.fulfilled, (state, action) => {
        state.firstGroup.loading = false;
        state.firstGroup.items = action.payload;
      })
      .addCase(fetchAdminFirstGroupBanners.rejected, (state, action) => {
        state.firstGroup.loading = false;
        state.firstGroup.error = action.payload as string;
      })
      
      .addCase(fetchAdminSecondGroupBanners.pending, (state) => {
        state.secondGroup.loading = true;
        state.secondGroup.error = null;
      })
      .addCase(fetchAdminSecondGroupBanners.fulfilled, (state, action) => {
        state.secondGroup.loading = false;
        state.secondGroup.items = action.payload;
      })
      .addCase(fetchAdminSecondGroupBanners.rejected, (state, action) => {
        state.secondGroup.loading = false;
        state.secondGroup.error = action.payload as string;
      })
      
      .addCase(toggleBannerStatus.pending, (state, action) => {
        const { id, active } = action.meta.arg;
        const allItems = [...state.firstGroup.items, ...state.secondGroup.items];
        const banner = allItems.find(b => b.id === id);
        if (banner) {
          banner.active = active;
        }
      })
      .addCase(toggleBannerStatus.fulfilled, (state, action) => {
        const updatedBanner = action.payload;
        const allItems = [...state.firstGroup.items, ...state.secondGroup.items];
        const banner = allItems.find(b => b.id === updatedBanner.id);
        if (banner) {
          Object.assign(banner, updatedBanner);
        }
      })
      .addCase(toggleBannerStatus.rejected, (state, action) => {
        const { id, active } = action.meta.arg;
        const allItems = [...state.firstGroup.items, ...state.secondGroup.items];
        const banner = allItems.find(b => b.id === id);
        if (banner) {
          banner.active = !active;
        }
      })
      .addCase(uploadAdminFirstGroupBanner.pending, (state) => {
        state.firstGroup.loading = true;
        state.firstGroup.error = null;
      })
      .addCase(uploadAdminFirstGroupBanner.fulfilled, (state, action) => {
        state.firstGroup.loading = false;
        state.firstGroup.items.push(action.payload);
      })
      .addCase(uploadAdminFirstGroupBanner.rejected, (state, action) => {
        state.firstGroup.loading = false;
        state.firstGroup.error = action.payload as string;
      })
      
      .addCase(uploadAdminSecondGroupBanner.pending, (state) => {
        state.secondGroup.loading = true;
        state.secondGroup.error = null;
      })
      .addCase(uploadAdminSecondGroupBanner.fulfilled, (state, action) => {
        state.secondGroup.loading = false;
        state.secondGroup.items.push(action.payload);
      })
      .addCase(uploadAdminSecondGroupBanner.rejected, (state, action) => {
        state.secondGroup.loading = false;
        state.secondGroup.error = action.payload as string;
      })
      .addCase(deleteAdminBanner.fulfilled, (state, action) => {
        const id = action.payload;
        state.firstGroup.items = state.firstGroup.items.filter(b => b.id !== id);
        state.secondGroup.items = state.secondGroup.items.filter(b => b.id !== id);
      });
  },
});

export const { 
  clearAdminFirstGroupError,
  clearAdminSecondGroupError,
  clearAllAdminErrors,
  resetAdminFirstGroup,
  resetAdminSecondGroup,
  resetAllAdminBanners,
  updateBannerStatusLocally,
} = adminBannersSlice.actions;

export default adminBannersSlice.reducer;