import './styles/reset.scss'
import './styles/common.scss'
import MainPage from './pages/MainPage/MainPage';
import { AppLayout } from './layouts/AppLayout';
import { Route, Routes } from 'react-router-dom';
import WishlistPage from './pages/WishlistPage/WishlistPage';
import { SectionLayout } from './layouts/SectionLayout';
import BasketPage from './pages/BasketPage/BasketPage';
import OrdersPage from './pages/OrdersPage/OrdersPage';
import ComparisonPage from './pages/ComparisonPage/ComparisonPage';
import ProductPage from './pages/ProductPage/ProductPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { fetchUserInfo } from './features/user/userSlice';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const token = useAppSelector(state => state.auth.token)
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (token) {
      dispatch(fetchUserInfo());
    }
  }, [token])

  return (
    <Routes>
      <Route element={<ProtectedRoute allowedFor='guest' />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegisterPage />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route element={<ProtectedRoute allowedFor='auth' />}>
          <Route element={<SectionLayout />}>
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/basket" element={<BasketPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
          </Route>
        </Route>
        <Route path="/" element={<MainPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
      </Route>
    </Routes>
  );
}

export default App;