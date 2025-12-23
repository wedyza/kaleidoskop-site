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
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { fetchUserInfo } from './features/user/userSlice';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import MakeOrderPage from './pages/MakeOrderPage/MakeOrderPage';
import SearchPage from './pages/SearchPage/SearchPage';
import ReturnsPage from './pages/ReturnsPage/ReturnsPage';
import Page404 from './pages/Page404/Page404';
import { AdminLayout } from './layouts/AdminLayout';
import AdminMain from './pages/AdminMain/AdminMain';
import AdminCategories from './pages/AdminCategories/AdminCategories';
import AdminCategoryCreate from './pages/AdminCategoryCreate/AdminCategoryCreate';
import AdminCategoryEdit from './pages/AdminCategoryEdit/AdminCategoryEdit';
import AdminSubcategoryCreate from './pages/AdminSubcategoryCreate/AdminSubcategoryCreate';
import AdminSubcategoryEdit from './pages/AdminSubcategoryEdit/AdminSubcategoryEdit';

function App() {
  const token = useAppSelector(state => state.auth.token)
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user)

  useEffect(() => {
    if (token) {
      dispatch(fetchUserInfo());
    }
  }, [token])

  const isAdmin = user?.is_superuser === true;

  return (
    <Routes>
      {isAdmin ? (
        <Route element={<AdminLayout />}>
          <Route element={<ProtectedRoute allowedFor='admin' />}> 
            <Route path="/" element={<AdminMain />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
  
            <Route path="/admin/categories/create" element={<AdminCategoryCreate />} />
            <Route path="/admin/categories/:id/edit" element={<AdminCategoryEdit />} />
            
            <Route path="/admin/subcategories/create" element={<AdminSubcategoryCreate />} />
            <Route path="/admin/subcategories/:id/edit" element={<AdminSubcategoryEdit />} />
          </Route>
        </Route>
      ) : (
        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute allowedFor='auth' />}>
            <Route element={<SectionLayout />}>
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/basket" element={<BasketPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/comparison" element={<ComparisonPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/returns" element={<ReturnsPage />} />
            </Route>
            <Route path="/make-order" element={<MakeOrderPage />} />
          </Route>
          <Route path="/" element={<MainPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="*" element={<Page404 />} />
        </Route>
      )}
    </Routes>
  );
}

export default App;