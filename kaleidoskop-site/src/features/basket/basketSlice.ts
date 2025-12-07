import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Product } from '../products/productsSlice';
import { api } from '../../api/axiosInstance';

export interface BasketEntry {
  id: string;
  amount: number;
  item: Product;
  marked_for_order?: boolean;
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

export const updateBasketItemAmount = createAsyncThunk<
  BasketEntry | null,
  { id: string; amount: number },
  { rejectValue: string }
>(
  'cart/updateBasketItemAmount',
  async ({ id, amount }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/items/${id}/cart/update_amount/`, { amount });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка обновления количества');
    }
  }
);

export const moveToOrder = createAsyncThunk<
  void,
  { ids: string[]; enable: boolean },
  { rejectValue: string }
>(
  'cart/moveToOrder',
  async ({ ids, enable }, { rejectWithValue }) => {
    try {
      await api.post('/cart_items/switch_to_order/', { ids, enable });
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка перемещения в заказ');
    }
  }
);

const basketSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearBasketError(state) {
      state.error = null;
    },
  },
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
      })
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
      })
      .addCase(updateBasketItemAmount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBasketItemAmount.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;
        const { id } = action.meta.arg;

        if (!updated) {
          state.items = state.items.filter((entry) => entry.item.id !== id);
          return;
        }

        const index = state.items.findIndex((entry) => entry.item.id === id);

        if (index !== -1) {
          state.items[index] = updated;
        } else {
          state.items.push(updated);
        }
      })
      .addCase(updateBasketItemAmount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(moveToOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveToOrder.fulfilled, (state, action) => {
        state.loading = false;
        
        const { ids, enable } = action.meta.arg;
        state.items.forEach(item => {
          if (ids.includes(item.id)) {
            item.marked_for_order = enable;
          }
        });
      })
      .addCase(moveToOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBasketError } = basketSlice.actions;
export default basketSlice.reducer;