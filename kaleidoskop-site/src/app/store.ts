import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '../features/products/productsSlice'
import productItemReducer from '../features/products/productItemSlice'
import authReducer from '../features/auth/authSlice'
import userReducer from '../features/user/userSlice'
import wishlistReducer from '../features/wishlist/wishlistSlice'
import basketReducer from '../features/basket/basketSlice'

export const store = configureStore({
  reducer: {
    products: productsReducer,
    productItem: productItemReducer,
    auth: authReducer,
    user: userReducer,
    wishlist: wishlistReducer,
    basket: basketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;