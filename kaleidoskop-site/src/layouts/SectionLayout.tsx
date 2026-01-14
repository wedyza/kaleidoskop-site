import { Link, Outlet, useLocation } from "react-router-dom";
import './Section.scss'
import { useAppDispatch } from "../app/hooks";
import { logout } from "../features/auth/authSlice";

const routeTitles: Record<string, string> = {
  '/basket': 'Корзина',
  '/wishlist': 'Избранные товары',
  '/orders': 'Мои заказы',
  '/comparison': 'Сравнение товаров',
  '/profile': 'Личные данные',
  '/returns': 'Возврат товаров',
  '/services/delivery-to-entrance': 'Доставка до подъезда',
  '/services/paint-coloring': 'Колеровка краски',
  '/services/water-delivery': 'Доставка воды',
  '/services/manipulator-delivery': 'Доставка манипулятором',
  '/services/sheet-bending': 'Услуги листогиба',
  '/services/service-center': 'Сервисный центр',
  '/services/lift-to-apartment': 'Подъем товара до квартиры',
  '/services/transport-services': 'Транспортные услуги',
};

export const SectionLayout = () => {
  const { pathname } = useLocation();
  const showNav = ['/wishlist', '/orders', '/profile', '/returns'].includes(pathname);
  const title = routeTitles[pathname] || '';

  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  }

  return (
    <div className="page-section">
      <div className="page-path inter16-400">
        <Link to={'/'} className='main-link'>
          Главная
        </Link>
        <span className='page-path_separator'>/</span>
        <span className="page-path_name">
           {title}
        </span>
      </div>

      {showNav ? (
        <div className="section-block">
          <nav className='section-nav inter14-400'>
            <Link 
              to={'/profile'}
              className={`section-nav_item ${pathname === '/profile' ? 'section-nav_item__active' : ''}`}
            >
              Личные данные
            </Link>
            <Link 
              to={'/orders'}
              className={`section-nav_item ${pathname === '/orders' ? 'section-nav_item__active' : ''}`}
            >
              Мои заказы
            </Link>
            <Link 
              to={'/basket'}
              className={`section-nav_item ${pathname === '/basket' ? 'section-nav_item__active' : ''}`}
            >
              Корзина
            </Link>
            <Link 
              to={'/wishlist'}
              className={`section-nav_item ${pathname === '/wishlist' ? 'section-nav_item__active' : ''}`}
            >
              Избранные товары
            </Link>
            {/* <Link 
              to={'/comparison'}
              className={`section-nav_item ${pathname === '' ? 'section-nav_item__active' : ''}`}
            >
              Сравнение
            </Link> */}
            <Link 
              to={'/returns'}
              className={`section-nav_item ${pathname === '/returns' ? 'section-nav_item__active' : ''}`}
            >
              Возврат товаров
            </Link>
            {/* <Link
              to={''}
              className={`section-nav_item ${pathname === '' ? 'section-nav_item__active' : ''}`}
            >
              Мои подарочные сертификаты
            </Link> */}
            <button
              onClick={handleLogout}
              className="section-nav_item section-nav_item__logout"
            >
              Выйти
            </button>
          </nav>
          <div className='section-content__with-nav'>
            <Outlet />
          </div>
        </div>
      ) : (
        <div className='section-content'>
          <Outlet />
        </div>
      )}
    </div>
  );
};
