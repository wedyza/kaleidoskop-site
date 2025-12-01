import './ItemCardBig.scss'
import itemImg from '../../assets/empty_imgs.jpg'
import { Link } from 'react-router-dom';
import type { Product } from '../../features/products/productsSlice';
import ItemsActions from '../ItemsActions/ItemsActions';
import { formatPrice } from '../../utils/formatPrice';
import { useAppDispatch } from '../../app/hooks';
import ToBasket from '../ToBasket/ToBasket';
import { toggleBasketItem, updateBasketItemAmount } from '../../features/basket/basketSlice';

interface ItemCardBigProps {
  product: Product;
}

const ItemCardBig: React.FC<ItemCardBigProps> = ({product}) => {
  const dispatch = useAppDispatch();

  return (
    <Link to={`/product/${product.slug}`} className='item-card item-card__big'>
      <div className="item-card_img">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0].source} alt="" />
        ) : (
          <img className='img-empty' src={itemImg} alt="" />
        )}
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
        <div className="item-card_actions-cart__big">
          <ToBasket
            product={product}
            classBtn='grey-btn'
            onAdd={() => dispatch(toggleBasketItem({ id: product.id, enable: true }))}

            onRemove={() => dispatch(toggleBasketItem({ id: product.id, enable: false }))}

            onIncrease={() =>
              dispatch(updateBasketItemAmount({
                id: product.id!,
                amount: product.cart_count! + 1
              }))
            }

            onDecrease={() =>
              dispatch(updateBasketItemAmount({
                id: product.id!,
                amount: product.cart_count! - 1
              }))
            }
          />
        </div>
        {/* <div className='item-card_shops inter11-400'>
          <span>
            Сегодня:
          </span>
          <Link to={''} className='item-card_shops-link'>
            Посмотреть магазины
          </Link>
        </div> */}
      </div>
    </Link>
  )
}

export default ItemCardBig;