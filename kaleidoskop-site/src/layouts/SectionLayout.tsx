import { Link, Outlet } from "react-router-dom";
import './section.scss'

export const SectionLayout = () => {
  return (
    <div className="page-section">
      <div className="page-path inter16-400">
        <Link to={'/'} className='main-link'>
          Главная
        </Link>
        <span className='page-path_separator'>/</span>
        <span className="page-path_name">
           Избранные товары
        </span>
      </div>

      <div className="section-block">
        <nav className='section-nav inter14-400'>
          <Link to={''} className="section-nav_item">Личные данные</Link>
          <Link to={''} className="section-nav_item">Мои заказы</Link>
          <Link to={''} className="section-nav_item">Корзина</Link>
          <Link to={''} className="section-nav_item section-nav_item__active">Избранные товары</Link>
          <Link to={''} className="section-nav_item">Сравнение</Link>
          <Link to={''} className="section-nav_item">Возврат товаров</Link>
          <Link to={''} className="section-nav_item">Мои подарочные сертификаты</Link>
          <Link to={''} className="section-nav_item">Выйти</Link>
        </nav>
        <div className='section-content'>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
