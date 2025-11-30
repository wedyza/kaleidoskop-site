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
  selectedIds: number[];
}

const loadSelectedIds = (): number[] => {
  try {
    const saved = localStorage.getItem('selectedBasketIds');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Ошибка чтения selectedBasketIds из localStorage:', e);
    return [];
  }
};

const initialState: BasketState = {
  items: [],
  selectedIds: loadSelectedIds(),
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

const basketSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setSelectedItems(state, action) {
      state.selectedIds = action.payload;
    },
    clearSelectedItems(state) {
      state.selectedIds = [];
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
      });
  },
});

export const { setSelectedItems, clearSelectedItems } = basketSlice.actions;
export default basketSlice.reducer;
