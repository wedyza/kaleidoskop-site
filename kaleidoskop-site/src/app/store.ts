import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '../features/products/productsSlice'
import productItemReducer from '../features/products/productItemSlice'
import authReducer from '../features/auth/authSlice'
import userReducer from '../features/user/userSlice'
import wishlistReducer from '../features/wishlist/wishlistSlice'
import basketReducer from '../features/basket/basketSlice'
import categoriesReducer from '../features/categories/categoriesSlice'
import ordersReducer from '../features/orders/ordersSlice'
import searchReducer from '../features/search/searchSlice'
import brandsReducer from '../features/brands/brandsSlice'
import recommendationsReducer from '../features/recommendations/recommendationsSlice'
import shopsReducer from '../features/shops/shopsSlice'
import adminCategoriesReducer from '../features/admin/adminCategoriesSlice'
import nomenclaturesReducer from '../features/admin/nomenclaturesSlice'
import telegramReducer from'../features/admin/telegramSlice'
import notificationsReducer from '../features/notifications/notificationsSlice'

export const store = configureStore({
  reducer: {
    products: productsReducer,
    productItem: productItemReducer,
    auth: authReducer,
    user: userReducer,
    wishlist: wishlistReducer,
    basket: basketReducer,
    categories: categoriesReducer,
    orders: ordersReducer,
    search: searchReducer,
    brands: brandsReducer,
    recommendations: recommendationsReducer,
    shops: shopsReducer,
    adminCategories: adminCategoriesReducer,
    nomenclatures: nomenclaturesReducer,
    telegram: telegramReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;