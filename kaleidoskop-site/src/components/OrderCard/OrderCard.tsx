import './OrderCard.scss'
import empty from '../../assets/empty_imgs.jpg'
import { useScrollableContainer } from '../../hooks/useScrollableContainer';
import type { Order } from '../../features/orders/ordersSlice';
import type React from 'react';
import { formatDate } from '../../utils/dateUtils';
import { formatPrice } from '../../utils/formatPrice';

interface OrderCardProps {
  order: Order;
}

const OrderCard:React.FC<OrderCardProps> = ({ order }) => {
  const { containerRef, showLeftArrow, showRightArrow, scroll } = useScrollableContainer();

  const calculateTotal = () => {
    if (!order.cart || !order.cart.items || order.cart.items.length === 0) {
      return 0;
    }
    
    return order.cart.items.reduce((total, item) => {
      const itemPrice = item.item.price || 0;
      return total + (itemPrice * item.amount);
    }, 0);
  };
  
  const totalAmount = calculateTotal();

  return (
    <div className='order-card'>
      <span className='order-card_status inter12-400'>
        {order.status}
      </span>
      <div className='order-card_info'>
        <div className='order-card_main'>
          <span className='order-card_id inter14-400'>
            №{order.code} от {formatDate(order.created_at)}
          </span>
          {showLeftArrow && (
            <button 
              className="item-block_btn scroll-arrow scroll-arrow__left"
              onClick={() => scroll('left')}
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.80514 0.407048C7.47763 -0.0376458 6.85163 -0.132638 6.40694 0.194877C6.06153 0.449269 5.73319 0.703716 5.44723 0.926886C4.87636 1.3724 4.11183 1.98573 3.34437 2.65208C2.58187 3.31412 1.79361 4.04815 1.18811 4.73344C0.886372 5.07494 0.608877 5.42789 0.401397 5.77206C0.210464 6.08878 3.36356e-06 6.52398 -6.11969e-07 7.0001C3.28031e-06 7.47623 0.210463 7.91146 0.401396 8.22818C0.608876 8.57235 0.886372 8.9253 1.18811 9.2668C1.79361 9.95209 2.58187 10.6861 3.34437 11.3482C4.11183 12.0145 4.87636 12.6278 5.44723 13.0734C5.73319 13.2965 6.06153 13.551 6.40693 13.8054C6.85163 14.1329 7.47763 14.0379 7.80514 13.5932C7.9368 13.4144 8.00017 13.2064 7.99999 13.0002L8 7.00012L8 1.00007C8.00017 0.79387 7.9368 0.585806 7.80514 0.407048Z" fill="#888888"/>
              </svg>
            </button>
          )}
          {showRightArrow && (
          <button 
            className="item-block_btn scroll-arrow scroll-arrow__right"
            onClick={() => scroll('right')}
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.194858 0.407048C0.522373 -0.0376458 1.14837 -0.132638 1.59306 0.194877C1.93847 0.449269 2.26681 0.703716 2.55277 0.926886C3.12364 1.3724 3.88817 1.98573 4.65563 2.65208C5.41813 3.31412 6.20639 4.04815 6.81189 4.73344C7.11363 5.07494 7.39112 5.42789 7.5986 5.77206C7.78954 6.08878 8 6.52398 8 7.0001C8 7.47623 7.78954 7.91146 7.5986 8.22818C7.39112 8.57235 7.11363 8.9253 6.81189 9.2668C6.20639 9.95209 5.41813 10.6861 4.65563 11.3482C3.88817 12.0145 3.12364 12.6278 2.55277 13.0734C2.26681 13.2965 1.93847 13.551 1.59307 13.8054C1.14837 14.1329 0.522374 14.0379 0.194859 13.5932C0.063204 13.4144 -0.000167646 13.2064 5.42805e-06 13.0002L4.9035e-06 7.00012L4.37896e-06 1.00007C-0.000168731 0.79387 0.0632029 0.585806 0.194858 0.407048Z" fill="#888888"/>
            </svg>
          </button>
        )}
          <div 
            className={`order-card_items ${showLeftArrow ? 'order-card_items__left' : showRightArrow ? 'order-card_items__right' : ''}`}
            ref={containerRef}
          >
              {order.cart && order.cart.items.length > 0 && order.cart.items.map((item) => (
                <div className='order-card_item'>
                  <div className='order-card_item-img'>
                    {item.item.images && item.item.images.length > 0 ? (
                      <img src={item.item.images[0].source} alt={item.item.title} />
                    ) : (
                      <img className='img-empty' src={empty} alt={item.item.title} />
                    )}
                  </div>
                  <span className='order-card_item-name inter14-400'>
                    {item.item.title}
                  </span>
                </div>
              ))}
          </div>
        </div>
        <div className='order-card_sum'>
          <span className='order-card_sum-label inter14-400'>сумма</span>
          <span className='order-card_sum-value inter20-600'>{formatPrice(totalAmount)} ₽</span>
        </div>
      </div>
    </div>
  )
}

export default OrderCard;