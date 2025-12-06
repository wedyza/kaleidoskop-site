import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';
import type { Product } from '../products/productsSlice';
import { addProductHandlers } from '../products/productMixin';
import type { SortOption } from '../../components/ListView/ListView';

interface SearchState {
  results: Product[];
  count: number;
  loading: boolean;
  error: string | null;
  currentQuery: string;
  next: string | null;
  previous: string | null;
  hasMore: boolean;
}

const initialState: SearchState = {
  count: 0,
  results: [],
  loading: false,
  error: null,
  currentQuery: '',
  next: null,
  previous: null,
  hasMore: false,
};

export const searchProducts = createAsyncThunk(
  'search/searchProducts',
  async ({ 
    query, 
    minPrice, 
    maxPrice, 
    brands,
    ordering,
    pageSize 
  }: { 
    query: string;
    minPrice?: number;
    maxPrice?: number;
    brands?: string[];
    ordering?: SortOption;
    pageSize?: number;
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
      if (ordering) {
        params.append('ordering', ordering);
      }
      if (pageSize !== undefined) {
        params.append('page_size', pageSize.toString());
      }
      
      const queryString = params.toString();
      const url = `/items/search/${encodeURIComponent(query)}/${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return {
        products: response.data.results || response.data,
        count: response.data.count || response.data.results?.length || 0,
        next: response.data.next,
        previous: response.data.previous,
        query,
        hasMore: !!response.data.next
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

export const loadMoreSearchProducts = createAsyncThunk(
  'search/loadMoreSearchProducts',
  async (nextUrl: string, { rejectWithValue }) => {
    try {
      const response = await api.get(nextUrl);
      return {
        products: response.data.results || response.data,
        next: response.data.next,
        previous: response.data.previous,
        hasMore: !!response.data.next
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.detail || 
        'Ошибка загрузки товаров'
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
      state.next = null;
      state.previous = null;
      state.hasMore = false;
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
        state.next = action.payload.next;
        state.previous = action.payload.previous;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.results = [];
        state.count = 0;
        state.next = null;
        state.previous = null;
        state.hasMore = false;
      })
      .addCase(loadMoreSearchProducts.pending, (state) => {
        state.error = null;
      })
      .addCase(loadMoreSearchProducts.fulfilled, (state, action) => {
        state.results = [...state.results, ...action.payload.products];
        state.next = action.payload.next;
        state.previous = action.payload.previous;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(loadMoreSearchProducts.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    addProductHandlers(builder, (state: SearchState) => state.results);
  },
});

export const { 
  clearSearchResults,
  setSearchQuery,
} = searchSlice.actions;

export default searchSlice.reducer;