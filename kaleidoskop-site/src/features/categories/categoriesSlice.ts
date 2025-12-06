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

interface CategoryProductsState {
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  currentCategory: Category | null;
}

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState & CategoryProductsState = {
  categories: [],
  loading: false,
  error: null,
  products: [],
  productsLoading: false,
  productsError: null,
  currentCategory: null,
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
    ordering 
  }: { 
    categoryId: string;
    minPrice?: number;
    maxPrice?: number;
    brands?: string[];
    ordering?: SortOption;
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
      
      const url = `/categories/${categoryId}/items/${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);
      
      const state = getState() as any;
      const category = state.categories.categories.find((cat: Category) => cat.id === categoryId);
      
      return {
        products: response.data.results || response.data,
        category,
        ordering
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка получения товаров категории');
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
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(fetchCategoryProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.products = action.payload.products;
        //state.currentCategory = action.payload.category || null;
      })
      .addCase(fetchCategoryProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError = action.payload as string;
        state.products = [];
        //state.currentCategory = null;
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
        state.currentCategory = null;
      });
    
    addProductHandlers(builder, (state: CategoryProductsState) => state.products);
  },
});

export const { 
  clearCategories, 
  clearProducts,
  setCurrentCategory, 
  updateCurrentCategory 
} = categoriesSlice.actions;
export default categoriesSlice.reducer;