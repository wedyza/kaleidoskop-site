import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';
import { toggleWishlist } from './productItemSlice';

interface Remains {
  warehouse: string;
  count: number;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  article: string;
  country: string;
  slug: string;
  images?: string;
  description?: string;
  remains?: Remains[];
  in_wishlist: boolean;
  cart_count?: number;
}

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  page: 1,
  pageSize: 20,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const page = state.products.page;
      const pageSize = state.products.pageSize;

      const response = await api.get(`/items/?page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки продуктов');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const id = action.meta.arg.id;
        const index = state.items.findIndex((item) => item.id === id);
        if (index !== -1) {
          state.items[index].in_wishlist = !state.items[index].in_wishlist;
        }
      });
  },
});

export default productsSlice.reducer;
