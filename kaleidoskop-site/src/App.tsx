import './styles/reset.scss'
import './styles/common.scss'
import MainPage from './pages/MainPage/MainPage';
import { AppLayout } from './layouts/AppLayout';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import WishlistPage from './pages/wishlistPage/WishlistPage';
import { SectionLayout } from './layouts/SectionLayout';
import BasketPage from './pages/BasketPage/BasketPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<MainPage />} />
          <Route element={<SectionLayout />}>
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/basket" element={<BasketPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;