import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';
import type { Product } from '../products/productsSlice';
import { addProductHandlers } from '../products/productMixin';

interface SearchState {
  results: Product[];
  count: number;
  loading: boolean;
  error: string | null;
  currentQuery: string;
}

const initialState: SearchState = {
  count: 0,
  results: [],
  loading: false,
  error: null,
  currentQuery: '',
};

export const searchProducts = createAsyncThunk(
  'search/searchProducts',
  async ({ 
    query, 
    minPrice, 
    maxPrice, 
    brands 
  }: { 
    query: string;
    minPrice?: number;
    maxPrice?: number;
    brands?: string[];
  }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      
      if (minPrice !== undefined) {
        params.append('min_price', minPrice.toString());
      }
      if (maxPrice !== undefined) {
        params.append('max_price', maxPrice.toString());
      }
      if (brands && brands.length > 0) {
        params.append('brands', brands.join(','));
      }
      
      const queryString = params.toString();
      const url = `/items/search/${encodeURIComponent(query)}/${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return {
        products: response.data.results || response.data,
        count: response.data.count || response.data.results?.length || 0,
        query
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.detail || 
        'Ошибка поиска товаров'
      );
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.results = [];
      state.currentQuery = '';
    },
    setSearchQuery: (state, action) => {
      state.currentQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.products;
        state.count = action.payload.count;
        state.currentQuery = action.payload.query;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.results = [];
        state.count = 0;
      });
    
    addProductHandlers(builder, (state: SearchState) => state.results);
  },
});

export const { 
  clearSearchResults,
  setSearchQuery,
} = searchSlice.actions;

export default searchSlice.reducer;