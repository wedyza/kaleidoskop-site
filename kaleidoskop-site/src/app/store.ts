import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '../features/products/productsSlice'
import productItemReducer from '../features/products/productItemSlice'
import authReducer from '../features/auth/authSlice'
import userReducer from '../features/user/userSlice'

export const store = configureStore({
  reducer: {
    products: productsReducer,
    productItem: productItemReducer,
    auth: authReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;