import './ItemCardBig.scss'
import itemImg from '../../assets/item.png'
import { Link } from 'react-router-dom';
import type { Product } from '../../features/products/productsSlice';
import ItemsActions from '../ItemsActions/ItemsActions';
import { formatPrice } from '../../utils/formatPrice';

interface ItemCardBigProps {
  product: Product;
}

const ItemCardBig: React.FC<ItemCardBigProps> = ({product}) => {
  return (
    <div className='item-card item-card__big'>
      <div className="item-card_img">
        <img src={itemImg} alt="" />
        <span className="item-card_discount inter13-500">
          - 25%
        </span>
        <div className="item-card_actions">
          <ItemsActions product={product} />
        </div>
      </div>
      <div className="item-card_info">
        <div className="item-card_prices">
          <p className="item-card_final-price inter20-600">
            {formatPrice(product.price)} ₽
          </p>
          <p className="item-card_original-price inter14-500">
            {formatPrice(product.price * 4/3)} ₽
          </p>
        </div>
        <div className="item-card_name-container">
          <p className="item-card_name inter13-400">
            {product.title}
          </p>
        </div>
      </div>
      <div className="item-card_actions__big">
        <button className="item-card_basket grey-btn inter14-600">
          В корзину
        </button>
        <div className='item-card_shops inter11-400'>
          <span>
            Сегодня:
          </span>
          <Link to={''} className='item-card_shops-link'>
            Посмотреть магазины
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ItemCardBig;