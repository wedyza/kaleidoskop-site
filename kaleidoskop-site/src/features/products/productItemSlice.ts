import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';
import type { Product } from './productsSlice';
import { toggleBasketItem, updateBasketItemAmount } from '../basket/basketSlice';

interface ProductItemState {
  selectedItem: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductItemState = {
  selectedItem: null,
  loading: false,
  error: null,
};

export const fetchProductByArticle = createAsyncThunk(
  'products/fetchProductByArticle',
  async (article: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/items/by_article/${article}/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки продуктов');
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'products/toggleWishlist',
  async ({ id, enable }: {id: string, enable: boolean}, { rejectWithValue }) => {
    try {
      const response = await api.post(`/items/${id}/switch_wishlist/`, { enable });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки продуктов');
    }
  }
);

const productItemSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductByArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductByArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchProductByArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const id = action.meta.arg.id;
        if (state.selectedItem?.id === id) {
          state.selectedItem.in_wishlist = !state.selectedItem.in_wishlist;
        }
      })
      .addCase(toggleBasketItem.fulfilled, (state, action) => {
        if (!state.selectedItem) return;

        const { id, enable } = action.meta.arg;
        if (state.selectedItem.id === id) {
          if (!enable) {
            state.selectedItem.cart_count = 0;
          } else {
            state.selectedItem.cart_count = 1;
          }
        }
      })
      .addCase(updateBasketItemAmount.fulfilled, (state, action) => {
        if (!state.selectedItem) return;

        const updated = action.payload;
        if (!updated) return;
        if (state.selectedItem.id === updated.item.id) {
          if (updated.amount === 0) {
            state.selectedItem.cart_count = 0;
          } else {
            state.selectedItem.cart_count = updated.amount;
          }
        }
      });
  },
});

export default productItemSlice.reducer;