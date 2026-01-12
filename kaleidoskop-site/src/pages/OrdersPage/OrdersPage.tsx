import { useEffect, useState } from 'react';
import './OrdersPage.scss'
import OrderCard from '../../components/OrderCard/OrderCard';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getOrders } from '../../features/orders/ordersSlice';

type OrderType = 'all' | 'legal' | 'individual';

function OrdersPage () {
  const [activeTab, setActiveTab] = useState<OrderType>('all');
  const dispatch = useAppDispatch();
  const orders = useAppSelector(state => state.orders.orders);

  useEffect(() => {
    dispatch(getOrders())
  }, [dispatch])

  return(
    <div className='page-orders'>
      <h1 className='inter28-600'>Мои заказы</h1>
      <div className='orders-set'>
        <div className='orders-tab inter14-600'>
          <button 
            className={`orders-tab_item ${activeTab === 'all' && 'orders-tab_item__active'}`}
            onClick={() => setActiveTab('all')}
          >
            Все заказы
          </button>
          <button 
            className={`orders-tab_item ${activeTab === 'legal' && 'orders-tab_item__active'}`}
            onClick={() => setActiveTab('legal')}
          >
            Заказы на физ. лицо
          </button>
          <button 
            className={`orders-tab_item ${activeTab === 'individual' && 'orders-tab_item__active'}`}
            onClick={() => setActiveTab('individual')}
          >
            Заказы на юр. лицо
          </button>
        </div>
        <div className='orders-filter'>
          <span className='orders-filter_value inter14-600'>Текущие</span>
          <div className='orders-filter_svg'>
            <svg width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.70926 0.121783C10.0269 0.32648 10.0947 0.71773 9.8608 0.995663C9.6791 1.21154 9.49735 1.41675 9.33795 1.59548C9.01973 1.95228 8.58165 2.43011 8.10569 2.90977C7.63282 3.38633 7.10851 3.87899 6.61903 4.25743C6.3751 4.44602 6.123 4.61945 5.87717 4.74913C5.65095 4.86846 5.3401 5 5.00001 5C4.65993 5 4.34905 4.86846 4.12283 4.74913C3.877 4.61945 3.6249 4.44602 3.38097 4.25743C2.89149 3.87899 2.36718 3.38633 1.89431 2.90977C1.41835 2.43011 0.98027 1.95228 0.662049 1.59548C0.502644 1.41675 0.3209 1.21154 0.139195 0.995664C-0.0947401 0.71773 -0.02689 0.326481 0.290743 0.121784C0.418425 0.0394992 0.567039 -0.00010783 0.71432 4.0589e-07L5 2.18557e-07L9.28568 3.12239e-08C9.43296 -0.000108217 9.58157 0.0394988 9.70926 0.121783Z" fill="black"/>
            </svg>
          </div>
        </div>
      </div>

      <div className='orders-list'>
        {orders.map((order) => (
          <OrderCard order={order} />
        ))}
      </div>
    </div>
  )
}

export default OrdersPage;