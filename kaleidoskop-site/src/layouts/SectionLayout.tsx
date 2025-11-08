import { Link, Outlet, useLocation } from "react-router-dom";
import './section.scss'

const routeTitles: Record<string, string> = {
  '/basket': 'Корзина',
  '/wishlist': 'Избранные товары',
  '/orders': 'Мои заказы',
};

export const SectionLayout = () => {
  const { pathname } = useLocation();
  const showNav = ['/wishlist', '/orders'].includes(pathname);
  const title = routeTitles[pathname] || '';

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
              to={''}
              className={`section-nav_item ${pathname === '' ? 'section-nav_item__active' : ''}`}
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
            <Link 
              to={''}
              className={`section-nav_item ${pathname === '' ? 'section-nav_item__active' : ''}`}
            >
              Сравнение
            </Link>
            <Link 
              to={''}
              className={`section-nav_item ${pathname === '' ? 'section-nav_item__active' : ''}`}
            >
              Возврат товаров
            </Link>
            <Link 
              to={''}
              className={`section-nav_item ${pathname === '' ? 'section-nav_item__active' : ''}`}
            >
              Мои подарочные сертификаты
            </Link>
            <Link 
              to={''} 
              className="section-nav_item"
            >
              Выйти
            </Link>
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
