import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';
import type { Product } from '../products/productsSlice';
import { toggleWishlist } from '../products/productItemSlice';

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
      });
  },
});

export default wishlistSlice.reducer;