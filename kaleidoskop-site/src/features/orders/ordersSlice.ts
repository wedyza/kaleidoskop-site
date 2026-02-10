import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';
import { parseAddressWithYandex } from './addressParser';
import type { Product } from '../products/productsSlice';

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

interface CartItem {
  id: string;
  amount: number;
  item: Product;
}

interface OrderCart {
  items: CartItem[];
}

export interface Order {
  id: string;
  address: Address;
  status: string;
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  code: string | null;
  user: number;
  created_at: string;
  total_price?: number;
  cart: OrderCart;
}

interface OrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

export interface CreateOrderRequest {
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  address?: Address;
  shop?: string;
}

interface OrderState {
  loading: boolean;
  error: string | null;
  currentOrder: Order | null;
  orders: Order[];
  ordersLoading: boolean;
  ordersError: string | null;
  totalOrdersCount: number;
  nextPage: string | null;
  previousPage: string | null;
}

const initialState: OrderState = {
  loading: false,
  error: null,
  currentOrder: null,
  orders: [],
  ordersLoading: false,
  ordersError: null,
  totalOrdersCount: 0,
  nextPage: null,
  previousPage: null,
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
      intercom?: string;
    };
    shop?: string;
  },
  { rejectValue: string }
>(
  'order/createOrder',
  async ({ 
    delivery_method, 
    payment_method, 
    addressString, 
    addressDetails,
    shop 
  }, { rejectWithValue }) => {
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
      } else if (delivery_method === 'Самовывоз') {
        if (!shop) {
          return rejectWithValue('Для самовывоза требуется выбрать магазин');
        }
        orderData.shop = shop;
      }

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

export const getOrders = createAsyncThunk<
  OrdersResponse,
  { page?: number; pageSize?: number } | void,
  { rejectValue: string }
>(
  'order/getOrders',
  async (params, { rejectWithValue }) => {
    try {
      const config = params ? {
        params: {
          page: params.page,
          page_size: params.pageSize
        }
      } : {};
      
      const response = await api.get('/orders/', config);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.detail || 
        err.message || 
        'Ошибка получения заказов'
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
    clearOrdersError: (state) => {
      state.ordersError = null;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.totalOrdersCount = 0;
      state.nextPage = null;
      state.previousPage = null;
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
        state.orders.unshift(action.payload);
        state.totalOrdersCount += 1;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentOrder = null;
      })
      
      .addCase(getOrders.pending, (state) => {
        state.ordersLoading = true;
        state.ordersError = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload.results;
        state.totalOrdersCount = action.payload.count;
        state.nextPage = action.payload.next;
        state.previousPage = action.payload.previous;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.ordersError = action.payload as string;
      });
  },
});

export const { 
  clearOrderError, 
  clearCurrentOrder, 
  clearOrdersError, 
  clearOrders 
} = orderSlice.actions;

export default orderSlice.reducer;