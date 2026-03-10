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
import AdminNomenclatures from './pages/AdminNomenclatures/AdminNomenclatures';
import AdminTelegram from './pages/AdminTelegram/AdminTelegram';
import AdminAssignedNomenclatures from './pages/AdminAssignedNomenclatures/AdminAssignedNomenclatures';
import AdminNomenclature from './pages/AdminNomenclature/AdminNomenclature';
import { selectGlobalLoading } from './app/store';
import Loader from './components/Loader/Loader';
import DeliveryToEntrancePage from './pages/ServiceDetail/DeliveryToEntrancePage';
import PaintColoringPage from './pages/ServiceDetail/PaintColoringPage';
import WaterDeliveryPage from './pages/ServiceDetail/WaterDeliveryPage';
import ManipulatorDeliveryPage from './pages/ServiceDetail/ManipulatorDeliveryPage';
import SheetBendingPage from './pages/ServiceDetail/SheetBendingPage';
import ServiceCenterPage from './pages/ServiceDetail/ServiceCenterPage';
import LiftToApartmentPage from './pages/ServiceDetail/LiftToApartmentPage';
import TransportServicesPage from './pages/ServiceDetail/TransportServicesPage';
import DeliveryPage from './pages/DeliveryPage/DeliveryPage';
import SuppliersPage from './pages/SuppliersPage/SuppliersPage';
import AboutPage from './pages/AboutPage/AboutPage';
import LoyaltyCardsPage from './pages/LoyaltyCardsPage/LoyaltyCardsPage';
import ContactsPage from './pages/ContactsPage/ContactsPage';
import AdminBanners from './pages/AdminBanners/AdminBanners';

function App() {
  const isLoading = useAppSelector(selectGlobalLoading);
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
    <>
      {isLoading && <Loader />}
      <Routes>
        {isAdmin ? (
          <Route element={<AdminLayout />}>
            <Route element={<ProtectedRoute allowedFor='admin' />}> 
              <Route path="/" element={<AdminMain />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/nomenclatures" element={<AdminNomenclatures />} />
              <Route path="/admin/nomenclatures/:id" element={<AdminNomenclature />} />
              <Route path="/admin/nomenclatures/connections" element={<AdminAssignedNomenclatures />} />
              <Route path="/admin/telegram" element={<AdminTelegram />} />
              <Route path="/admin/banners" element={<AdminBanners />} />
    
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
            
            <Route element={<SectionLayout />}>
              <Route path="/services/delivery-to-entrance" element={<DeliveryToEntrancePage />} />
              <Route path="/services/paint-coloring" element={<PaintColoringPage />} />
              <Route path="/services/water-delivery" element={<WaterDeliveryPage />} />
              <Route path="/services/manipulator-delivery" element={<ManipulatorDeliveryPage />} />
              <Route path="/services/sheet-bending" element={<SheetBendingPage />} />
              <Route path="/services/service-center" element={<ServiceCenterPage />} />
              <Route path="/services/lift-to-apartment" element={<LiftToApartmentPage />} />
              <Route path="/services/transport-services" element={<TransportServicesPage />} />
              
              <Route path="/delivery-payment" element={<DeliveryPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />

              <Route path="/about" element={<AboutPage />} />
              <Route path="/loyalty-cards" element={<LoyaltyCardsPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
            </Route>
            <Route path="/" element={<MainPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
          </Route>
        )}
        <Route path="*" element={<Page404 />} />
      </Routes>
    </>
  );
}

export default App;