import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';

interface OrderState {
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  loading: false,
  error: null,
};

export const moveToOrder = createAsyncThunk<
  void,
  { ids: string[]; enable: boolean },
  { rejectValue: string }
>(
  'order/moveToOrder',
  async ({ ids, enable }, { rejectWithValue }) => {
    try {
      await api.post('/cart_items/switch_to_order/', { ids, enable });
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка перемещения в заказ');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(moveToOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveToOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(moveToOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;