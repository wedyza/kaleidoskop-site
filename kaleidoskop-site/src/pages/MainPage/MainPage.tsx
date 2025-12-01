import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import ItemsBlock from '../../components/ItemsBlock/ItemsBlock';
import News from '../../components/News/News';
import Services from '../../components/Services/Services';
import './MainPage.scss';
import { fetchProducts } from '../../features/products/productsSlice';

function MainPage () {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const loading = useAppSelector((state) => state.products.loading);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const hotOffers = products.slice(0, 6);
  const popularProducts = products.slice(6, 12);
  const newProducts = products.slice(12, 18);

  return (
    <div className="page-main">
      <Services />
      
      {loading ? (
        <div className="loading-indicator">Загрузка...</div>
      ) : (
        <>
          <ItemsBlock 
            title={'Горячие предложения'}
            items={hotOffers}
            icon
            dates={'01.07 - 16.07'}
          />
          <ItemsBlock 
            title={'Популярные товары'}
            items={popularProducts}
          />
          <ItemsBlock 
            title={'Новинки'}
            items={newProducts}
          />
        </>
      )}
      
      <News />
    </div>
  )
}

export default MainPage;