import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';
import type { Product } from '../products/productsSlice';
import { addProductHandlers } from '../products/productMixin';
import type { SortOption } from '../../components/ListView/ListView';

export interface Category {
  id: string;
  title: string;
  parent: string | null;
  items_count: number;
  slug: string;
}

interface CategoriesState {
  categories: Category[];
  products: Product[];
  currentCategory: Category | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  next: string | null;
  previous: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  products: [],
  currentCategory: null,
  loading: false,
  error: null,
  hasMore: false,
  next: null,
  previous: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка получения категорий');
    }
  }
);

export const fetchCategoryProducts = createAsyncThunk(
  'categories/fetchCategoryProducts',
  async ({ 
    categoryId,
    minPrice,
    maxPrice,
    brands,
    ordering,
    pageSize 
  }: { 
    categoryId: string;
    minPrice?: number;
    maxPrice?: number;
    brands?: string[];
    ordering?: SortOption;
    pageSize?: number;
  }, { rejectWithValue, getState }) => {
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
      
      const url = `/categories/${categoryId}/items/${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);
      
      const state = getState() as any;
      const category = state.categories.categories.find((cat: Category) => cat.id === categoryId);
      
      return {
        products: response.data.results || response.data,
        count: response.data.count || response.data.results?.length || 0,
        next: response.data.next,
        previous: response.data.previous,
        category,
        ordering,
        hasMore: !!response.data.next
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка получения товаров категории');
    }
  }
);

export const loadMoreCategoryProducts = createAsyncThunk(
  'categories/loadMoreCategoryProducts',
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
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки товаров категории');
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchCategoryById',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/categories/${categoryId}/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка получения категории');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategories: (state) => {
      state.categories = [];
    },
    clearProducts: (state) => {
      state.products = [];
      state.currentCategory = null;
      state.next = null;
      state.previous = null;
      state.hasMore = false;
    },
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    },
    updateCurrentCategory: (state, action) => {
      if (state.currentCategory) {
        state.currentCategory = { ...state.currentCategory, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.results;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCategoryProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
        state.hasMore = action.payload.hasMore;
        state.currentCategory = action.payload.category || state.currentCategory;
      })
      .addCase(fetchCategoryProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.products = [];
        state.next = null;
        state.previous = null;
        state.hasMore = false;
      })
      .addCase(loadMoreCategoryProducts.pending, (state) => {
        state.error = null;
      })
      .addCase(loadMoreCategoryProducts.fulfilled, (state, action) => {
        state.products = [...state.products, ...action.payload.products];
        state.next = action.payload.next;
        state.previous = action.payload.previous;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(loadMoreCategoryProducts.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    addProductHandlers(builder, (state: CategoriesState) => state.products);
  },
});

export const { 
  clearCategories, 
  clearProducts,
  setCurrentCategory, 
  updateCurrentCategory 
} = categoriesSlice.actions;
export default categoriesSlice.reducer;