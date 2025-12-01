import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';
import type { Product } from '../products/productsSlice';

interface RecommendationsState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: RecommendationsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchContentBasedRecommendations = createAsyncThunk(
  'recommendations/fetchContentBased',
  async ({ 
    productId, 
    n 
  }: { 
    productId: string; 
    n?: number 
  }) => {
    let url = `/recomendations/content_based/?product_id=${productId}`;
    
    if (n !== undefined) {
      url += `&n=${n}`;
    }
    
    const response = await api.get(url);
    return response.data.results || response.data;
  }
);

const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    clearRecommendations: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContentBasedRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContentBasedRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchContentBasedRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки рекомендаций';
        state.items = [];
      });
  },
});

export const { clearRecommendations } = recommendationsSlice.actions;
export default recommendationsSlice.reducer;