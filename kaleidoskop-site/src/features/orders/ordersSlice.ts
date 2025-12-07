import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';
import { parseAddressWithYandex } from './addressParser';

export type DeliveryMethod = 'Самовывоз' | 'Доставка';
export type PaymentMethod = 'Наличными' | 'Картой' | 'Онлайн';

interface Address {
  city: string;
  street: string;
  house: string;
  entrance?: number | null;
  floor?: number | null;
  apartment?: number | null;
}

interface Order {
  id: string;
  address: Address;
  status: string;
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  code: string | null;
  user: number;
  created_at?: string;
  total_price?: number;
}

interface CreateOrderRequest {
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  address?: Address;
}

interface OrderState {
  loading: boolean;
  error: string | null;
  currentOrder: Order | null;
}

const initialState: OrderState = {
  loading: false,
  error: null,
  currentOrder: null,
};

export const createOrder = createAsyncThunk<
  Order,
  {
    delivery_method: DeliveryMethod;
    payment_method: PaymentMethod;
    addressString?: string;
    addressDetails?: {
      apartment?: string;
      entrance?: string;
      floor?: string;
    };
  },
  { rejectValue: string }
>(
  'order/createOrder',
  async ({ delivery_method, payment_method, addressString, addressDetails }, { rejectWithValue }) => {
    try {
      const orderData: CreateOrderRequest = {
        delivery_method,
        payment_method,
      };

      if (delivery_method === 'Доставка') {
        if (!addressString) {
          return rejectWithValue('Для доставки требуется адрес');
        }

        const parsedAddress = await parseAddressWithYandex(addressString);

        const address: Address = {
          city: parsedAddress.city,
          street: parsedAddress.street,
          house: parsedAddress.house,
        };

        if (addressDetails) {
          if (addressDetails.apartment) {
            address.apartment = parseInt(addressDetails.apartment) || null;
          }
          if (addressDetails.entrance) {
            address.entrance = parseInt(addressDetails.entrance) || null;
          }
          if (addressDetails.floor) {
            address.floor = parseInt(addressDetails.floor) || null;
          }
        }

        orderData.address = address;
      }

      // Сервер сам возьмет только товары с marked_for_order = true
      const response = await api.post('/orders/', orderData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.detail || 
        err.message || 
        'Ошибка создания заказа'
      );
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
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentOrder = null;
      });
  },
});

export const { clearOrderError, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;