import { Link } from 'react-router-dom';
import './BasketPage.scss'
import BasketCard from '../../components/BasketCard/BasketCard';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useEffect } from 'react';
import { fetchBasket/*, clearSelectedItems, setSelectedItems*/ } from '../../features/basket/basketSlice';

function BasketPage () {
  const dispatch = useAppDispatch();
  const { items /*, selectedIds */} = useAppSelector((state) => state.basket);

  useEffect(() => {
    dispatch(fetchBasket());
  }, [dispatch]);

  // const toggleSelectAll = () => {
  //   if (selectedIds.length === items.length) {
  //     dispatch(clearSelectedItems());
  //   } else {
  //     const allIds = items.map(({ item }) => item.id);
  //     dispatch(setSelectedItems(allIds));
  //   }
  // };

  // const clearAll = () => {
  //   dispatch(clearSelectedItems());
  // };

  // const handleToggleSingle = (id: number) => {
  //   const updated = selectedIds.includes(id)
  //     ? selectedIds.filter((i) => i !== id)
  //     : [...selectedIds, id];
  //   dispatch(setSelectedItems(updated));
  // };

  // const isAllSelected = selectedIds.length === items.length && items.length > 0;
  // const selectedGoods = items.filter(({ item }) => selectedIds.includes(item.id));

  // useEffect(() => {
  //   localStorage.setItem('selectedBasketIds', JSON.stringify(selectedIds));
  // }, [selectedIds]);

  // useEffect(() => {
  //   const saved = localStorage.getItem('selectedBasketIds');
  //   if (saved) {
  //     const parsed = JSON.parse(saved);
  //     dispatch(setSelectedItems(parsed));
  //   }
  // }, [dispatch]);

  return (
    <div className="page-basket">
      <div className='basket-content'>
        <div className="wishlist-header">
          <h1 className='inter28-600'>Корзина</h1>
          <button className='wishlist-clear inter13-400'>
            <div className="wishlist-clear_img">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.219259 0.219644C0.512152 -0.0732486 0.987026 -0.0732489 1.27992 0.219644L5.99223 4.93195L10.7045 0.219644C10.9974 -0.0732486 11.4723 -0.0732489 11.7652 0.219644C12.0581 0.512537 12.0581 0.987412 11.7652 1.2803L7.05289 5.99261L11.7652 10.7049C12.0581 10.9978 12.0581 11.4727 11.7652 11.7656C11.4723 12.0585 10.9974 12.0585 10.7045 11.7656L5.99223 7.05327L1.27992 11.7656C0.987026 12.0585 0.512152 12.0585 0.219259 11.7656C-0.0736338 11.4727 -0.0736338 10.9978 0.219259 10.7049L4.93157 5.99261L0.219259 1.2803C-0.0736338 0.987411 -0.0736338 0.512538 0.219259 0.219644Z" fill="#888888"/>
              </svg>
            </div>
            <span className='wishlist-clear_label'>Очистить корзину</span>
          </button>
        </div>

        <div className='basket-list'>
          {items && items.length > 0 && items.map((item) => (
            <BasketCard item={item} key={item.id} />
          ))}
        </div>
      </div>

      <div className='basket-placement'>
        <div className='basket-placement_content'>
          <div className="basket-placement_list">
            <div className="basket-placement_list-item">
              <span className='basket-placement_list__label inter12-400'>
                Специальное чистящее средство для посудомоечной машины
              </span>
              <span className='basket-placement_list__value inter14-600'>5 520 ₽</span>
            </div>
            <div className="basket-placement_list-item">
              <span className='basket-placement_list__label inter12-400'>
                Снегоуборочная машина HUTER SGC 2300E электро 2300Вт
              </span>
              <span className='basket-placement_list__value inter14-600'>18 190 ₽</span>
            </div>
            <div className="basket-placement_list-item">
              <span className='basket-placement_list__label inter12-400'>
                fff
              </span>
              <span className='basket-placement_list__value inter14-600'>18 190 ₽</span>
            </div>
          </div>
          <div className="basket-placement_sum">
            <span className='basket-placement_content__label inter16-600'>Итого:</span>
            <span className='basket-placement_content__value inter24-700'>5 520 ₽</span>
          </div>
        </div>
        <div className='basket-placement_actions'>
          <Link to='' className='basket-placement_gift grey-btn'>
            <span className='inter14-600'>Подарочный сертификат</span>
          </Link>
          <Link to='' className='basket-placement_link accent-btn'>
            <span className='inter14-600'>Перейти к оформлению</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BasketPage;