import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '../features/products/productsSlice'
import productItemReducer from '../features/products/productItemSlice'

export const store = configureStore({
  reducer: {
    products: productsReducer,
    productItem: productItemReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;