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

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<MainPage />} />
        <Route element={<SectionLayout />}>
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/basket" element={<BasketPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;