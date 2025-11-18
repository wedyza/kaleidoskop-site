import './ItemCard.scss'
import itemImg from '../../assets/item.png'
import { Link } from 'react-router-dom';
import type { Product } from '../../features/products/productsSlice';
import { formatPrice } from '../../utils/formatPrice';
import ItemsActions from '../ItemsActions/ItemsActions';

interface ItemCardProps {
  product: Product;
}

const ItemCard: React.FC<ItemCardProps> = ({product}) => {
  return (
    <Link to={`/product/${product.slug}`} className='item-card'>
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
    </Link>
  )
}

export default ItemCard;