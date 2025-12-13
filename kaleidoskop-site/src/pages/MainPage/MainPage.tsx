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

  return (
    <div className="page-main">
      <Services />
      
      {loading ? (
        <div className="loading-indicator">Загрузка...</div>
      ) : (
        <>
          <ItemsBlock 
            title={'Горячие предложения'}
            items={products}
            icon
            dates={'01.07 - 16.07'}
          />
          <ItemsBlock 
            title={'Популярные товары'}
            items={products}
          />
          <ItemsBlock 
            title={'Новинки'}
            items={products}
          />
        </>
      )}
      
      <News />
    </div>
  )
}

export default MainPage;