import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';

interface Banner {
  source: string;
}

interface BannersState {
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

const initialState: BannersState = {
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

export const fetchFirstGroupBanners = createAsyncThunk(
  'banners/fetchFirstGroup',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/banners/first_group/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки баннеров первой группы');
    }
  }
);

export const fetchSecondGroupBanners = createAsyncThunk(
  'banners/fetchSecondGroup',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/banners/second_group/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки баннеров второй группы');
    }
  }
);

export const fetchAllBanners = createAsyncThunk(
  'banners/fetchAll',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchFirstGroupBanners()),
      dispatch(fetchSecondGroupBanners())
    ]);
  }
);

const bannersSlice = createSlice({
  name: 'banners',
  initialState,
  reducers: {
    clearFirstGroupError: (state) => {
      state.firstGroup.error = null;
    },
    clearSecondGroupError: (state) => {
      state.secondGroup.error = null;
    },
    clearAllErrors: (state) => {
      state.firstGroup.error = null;
      state.secondGroup.error = null;
    },
    resetFirstGroup: (state) => {
      state.firstGroup = {
        items: [],
        loading: false,
        error: null,
      };
    },
    resetSecondGroup: (state) => {
      state.secondGroup = {
        items: [],
        loading: false,
        error: null,
      };
    },
    resetAllBanners: (state) => {
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFirstGroupBanners.pending, (state) => {
        state.firstGroup.loading = true;
        state.firstGroup.error = null;
      })
      .addCase(fetchFirstGroupBanners.fulfilled, (state, action) => {
        state.firstGroup.loading = false;
        state.firstGroup.items = action.payload;
      })
      .addCase(fetchFirstGroupBanners.rejected, (state, action) => {
        state.firstGroup.loading = false;
        state.firstGroup.error = action.payload as string;
      })
      
      .addCase(fetchSecondGroupBanners.pending, (state) => {
        state.secondGroup.loading = true;
        state.secondGroup.error = null;
      })
      .addCase(fetchSecondGroupBanners.fulfilled, (state, action) => {
        state.secondGroup.loading = false;
        state.secondGroup.items = action.payload;
      })
      .addCase(fetchSecondGroupBanners.rejected, (state, action) => {
        state.secondGroup.loading = false;
        state.secondGroup.error = action.payload as string;
      });
  },
});

export const { 
  clearFirstGroupError,
  clearSecondGroupError,
  clearAllErrors,
  resetFirstGroup,
  resetSecondGroup,
  resetAllBanners,
} = bannersSlice.actions;

export default bannersSlice.reducer;