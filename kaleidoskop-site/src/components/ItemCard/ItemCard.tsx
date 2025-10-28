import './itemCard.scss'
import itemImg from '../../assets/item.png'

const ItemCard: React.FC = () => {
  return (
    <div className='item-card'>
      <div className="item-card_img">
        <img src={itemImg} alt="" />
        <span className="item-card_discount inter13-500">
          - 25%
        </span>
      </div>
      <div className="item-card_info">
        <div className="item-card_prices">
          <p className="item-card_final-price inter20-600">
            2 790 ₽
          </p>
          <p className="item-card_original-price inter14-500">
            18 190 ₽
          </p>
        </div>
        <div className="item-card_name-container">
          <p className="item-card_name inter13-400">
            Тачка садовая одноколесная 90кг объем 85л
          </p>
        </div>
      </div>
    </div>
  )
}

export default ItemCard;