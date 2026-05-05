import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axiosInstance";

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

export const fetchBrandsByCategory = createAsyncThunk(
  "brands/fetchBrandsByCategory",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/brands/category/${categoryId}/`);
      return response.data.results || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка загрузки брендов",
      );
    }
  },
);

export const fetchBrandsByQuery = createAsyncThunk(
  "brands/fetchBrandsByQuery",
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/brands/query/${query}/`);
      return response.data.results || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка загрузки брендов",
      );
    }
  },
);

const brandsSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrandsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrandsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload;
      })
      .addCase(fetchBrandsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchBrandsByQuery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrandsByQuery.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload;
      })
      .addCase(fetchBrandsByQuery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default brandsSlice.reducer;
