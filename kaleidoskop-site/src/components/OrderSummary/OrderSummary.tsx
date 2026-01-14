import { Link } from 'react-router-dom';
import './OrderSummary.scss'
import { formatPrice } from '../../utils/formatPrice';
import type React from 'react';
import type { BasketEntry } from '../../features/basket/basketSlice';

interface OrderSummaryProps {
  variant?: 'basket' | 'checkout';
  selectedItems: BasketEntry[];
  onCreateOrder?: () => void;
  // isLoading?: boolean;
  // error?: string | null;
  // deliveryType?: 'pickup' | 'courier';
  // address?: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
    variant = 'basket',
    selectedItems,
    onCreateOrder,
    // isLoading = false,
    // error = null,
    // deliveryType = 'pickup',
    // address = '',
  }) => {
  const isCheckoutVariant = variant === 'checkout';

  const totalSum = selectedItems.reduce((sum, item) => {
    return sum + (item.item.price * item.amount);
  }, 0);

  return (
    <div>
      <div className='basket-placement'>
        <div className='basket-placement_content'>
          <div className="basket-placement_list">
            {selectedItems && selectedItems.length > 0 && selectedItems.map((item) => (
              <div className="basket-placement_list-item">
                <span className='basket-placement_list__label inter12-400'>
                  {item.item.title}
                </span>
                <span className='basket-placement_list__value inter14-600'>
                  {item.item.cart_count && formatPrice(item.item.price * item.item.cart_count)} ₽
                </span>
              </div>
            ))}
          </div>
          <div className="basket-placement_sum">
            <span className='basket-placement_content__label inter16-600'>Итого:</span>
            <span className='basket-placement_content__value inter24-700'>
              {formatPrice(totalSum)} ₽
            </span>
          </div>
        </div>
        <div className='basket-placement_actions'>
          <button className='basket-placement_gift grey-btn'>
            <span className='inter14-600'>Подарочный сертификат</span>
          </button>
          {isCheckoutVariant ? (
            <button 
              className='basket-placement_link accent-btn'
              type="button"
              onClick={onCreateOrder}
            >
              <span className='inter14-600'>Оформить заказ</span>
            </button>
          ) : (
            selectedItems.length > 0 ? (
              <Link to='/make-order' className='basket-placement_link accent-btn'>
                <span className='inter14-600'>Перейти к оформлению</span>
              </Link>
            ) : (
              <button className='basket-placement_link basket-placement_link__disabled accent-btn' disabled>
                <span className='inter14-600'>Перейти к оформлению</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderSummary;