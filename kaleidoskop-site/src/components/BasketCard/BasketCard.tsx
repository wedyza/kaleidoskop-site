import './BasketCard.scss'
import itemImg from '../../assets/empty_imgs.jpg'
import CustomCheckbox from '../CustomCheckbox/CustomCheckbox';
import { setSelectedItems, toggleBasketItem, updateBasketItemAmount, type BasketEntry } from '../../features/basket/basketSlice';
import { formatPrice } from '../../utils/formatPrice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

interface BasketCardProps {
  item: BasketEntry;
}

const BasketCard: React.FC<BasketCardProps> = ({ item }) => {
  const dispatch = useAppDispatch();
  const { selectedIds } = useAppSelector((state) => state.basket);
  
  const isChecked = selectedIds.includes(parseInt(item.id));

  const handleCheckboxChange = () => {
    const itemId = parseInt(item.id);
    const newSelectedIds = isChecked 
      ? selectedIds.filter(id => id !== itemId)
      : [...selectedIds, itemId];
    
    dispatch(setSelectedItems(newSelectedIds));
    
    localStorage.setItem('selectedBasketIds', JSON.stringify(newSelectedIds));
  };

  const handleRemoveFromBasket = async () => {
    await dispatch(toggleBasketItem({ id: item.item.id, enable: false }));
    
    const itemId = parseInt(item.id);
    if (selectedIds.includes(itemId)) {
      const newSelectedIds = selectedIds.filter(id => id !== itemId);
      dispatch(setSelectedItems(newSelectedIds));
      localStorage.setItem('selectedBasketIds', JSON.stringify(newSelectedIds));
    }
  };

  const handleIncrease = () => {
    dispatch(updateBasketItemAmount({
      id: item.item.id,
      amount: item.amount + 1
    }));
  };

  const handleDecrease = () => {
    if (item.amount <= 1) return;
    dispatch(updateBasketItemAmount({
      id: item.item.id,
      amount: item.amount - 1
    }));
  };
  
  return (
    <div className='basket-card'>
      <span className='basket-card_id inter11-400'>
        код: {item.item.article}
      </span>
      <CustomCheckbox
        checked={isChecked}
        onChange={handleCheckboxChange}
        checkboxClass='basket-card_checkbox'
      />
      <div className="basket-card_img">
        {item.item.images && item.item.images.length > 0 ? (
          <img src={item.item.images[0].source} alt="" />
        ) : (
          <img className='img-empty' src={itemImg} alt="" />
        )}
      </div>
      <div className="basket-card_info">
        <div className='basket-card_info-main'>
          <span className='basket-card_name inter14-400'>
            {item.item.title}
          </span>
          <span className='basket-card_price-one inter13-400'>
            {item.item.price} за шт
          </span>
          <span className='basket-card_date inter11-400'>
            Забрать сегодня:
            <span className='basket-card_date__accent'>Посмотреть магазины</span>
          </span>
          <div className='basket-card_count inter14-600'>
            <button
              className={`basket-card_count-btn ${item.amount <= 1 ? 'basket-card_count-btn__inactive' : ''}`}
              onClick={handleDecrease}
              disabled={item.amount <= 1}
            >
              <svg width="6" height="2" viewBox="0 0 6 2" fill="none">
                <path d="M6 0V1.5H0V0H6Z" fill="white"/>
              </svg>
            </button>

            <span>{item.amount}</span>

            <button className='basket-card_count-btn' onClick={handleIncrease}>
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                <path d="M2.4 6V0H3.6V6H2.4ZM0 3.6V2.4H6V3.6H0Z" fill="white"/>
              </svg>
            </button>
          </div>
        </div>
        <div className='basket-card_info-price'>
          <div className='basket-card_discount'>
            <span className='basket-card_discount-value inter14-500'>
              {item.item.cart_count && formatPrice(item.item.price * 4/3 * item.item.cart_count)} ₽
            </span>
            <span className='basket-card_discount-percent inter11-600'>
              - 25%
            </span>
          </div>
          <span className='basket-card_price inter20-600'>
            {item.item.cart_count && formatPrice(item.item.price * item.item.cart_count)} ₽
          </span>
        </div>
      </div>
      <div className='basket-card_actions'>
        {/* <ItemsActions /> */}
        <button
          onClick={handleRemoveFromBasket}
          className='basket-card_remove'
        >
          <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.25 4.25L16.6303 14.2751C16.4719 16.8364 16.3928 18.1171 15.7508 19.0379C15.4333 19.4931 15.0247 19.8773 14.5507 20.166C13.5921 20.75 12.309 20.75 9.74274 20.75C7.17312 20.75 5.8883 20.75 4.92905 20.1649C4.4548 19.8757 4.046 19.4908 3.72868 19.0348C3.08688 18.1126 3.00945 16.8301 2.85461 14.2652L2.25 4.25" stroke="#161616" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M0.75 4.25H18.75M13.8057 4.25L13.1231 2.84173C12.6696 1.90626 12.4428 1.43852 12.0517 1.14681C11.965 1.0821 11.8731 1.02454 11.777 0.974701C11.3439 0.75 10.8241 0.75 9.78453 0.75C8.71883 0.75 8.18598 0.75 7.74568 0.98412C7.6481 1.03601 7.55498 1.0959 7.46729 1.16317C7.07164 1.4667 6.85063 1.95155 6.40861 2.92126L5.80292 4.25" stroke="#161616" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M7.25 15.25L7.25 9.25" stroke="#161616" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M12.25 15.25L12.25 9.25" stroke="#161616" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default BasketCard;