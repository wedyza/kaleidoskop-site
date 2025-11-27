import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';
import type { Product } from '../products/productsSlice';
import { toggleWishlist } from '../products/productItemSlice';
import { toggleBasketItem, updateBasketItemAmount } from '../basket/basketSlice';

interface WishlistEntry {
  item: Product;
  addedAt: string;
}

interface WishlistState {
  items: WishlistEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk<WishlistEntry[], void, { rejectValue: string }>(
  'wishlist/fetchWishlist', 
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/me/wishlist/');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка загрузки избранного');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const id = action.meta.arg.id;

        const index = state.items.findIndex((item) => item.item.id === id);
        if (index !== -1) {
          state.items.splice(index, 1);
        }
      })
      .addCase(toggleBasketItem.fulfilled, (state, action) => {
        const { id, enable } = action.meta.arg;

        const index = state.items.findIndex((p) => p.item.id === id);
        if (index !== -1) {
          if (enable) {
            state.items[index].item.cart_count = 1;
          } 
          else {
            state.items[index].item.cart_count = 0;
          }
        }
      })
      .addCase(updateBasketItemAmount.fulfilled, (state, action) => {
        const update = action.payload;

        if (!update) {
          const { id } = action.meta.arg;
          const index = state.items.findIndex((p) => p.item.id === id);
          if (index !== -1) {
            state.items[index].item.cart_count = 0;
          }
          return;
        }

        const index = state.items.findIndex((p) => p.item.id === update.item.id);
        if (index !== -1) {
          state.items[index].item.cart_count = update.amount;
        }
      });
  },
});

export default wishlistSlice.reducer;