import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Product } from '../products/productsSlice';
import { api } from '../../api/axiosInstance';

export interface BasketEntry {
  id: string;
  amount: number;
  item: Product;
}

interface BasketState {
  items: BasketEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: BasketState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchBasket = createAsyncThunk<BasketEntry[], void, { rejectValue: string }>(
  'cart/fetchBasket',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/me/cart/');
      return response.data.items;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка загрузки корзины');
    }
  }
);

export const toggleBasketItem = createAsyncThunk<
  BasketEntry,
  { id: string; enable: boolean },
  { rejectValue: string }
>(
  'cart/toggleBasketItem',
  async ({ id, enable }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/items/${id}/add_to_cart/`, { enable });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка обновления корзины');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBasket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBasket.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBasket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(toggleBasketItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleBasketItem.fulfilled, (state, action) => {
        const { id, enable } = action.meta.arg;
        if (!enable) {
          state.items = state.items.filter((entry) => entry.item.id !== id);
        }
      })
      .addCase(toggleBasketItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default cartSlice.reducer;
