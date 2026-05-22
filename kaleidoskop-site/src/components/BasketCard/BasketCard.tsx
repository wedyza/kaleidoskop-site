import "./BasketCard.scss";
import itemImg from "../../assets/empty_imgs.jpg";
import CustomCheckbox from "../CustomCheckbox/CustomCheckbox";
import {
  toggleBasketItem,
  updateBasketItemAmount,
  moveToOrder,
  type BasketEntry,
} from "../../features/basket/basketSlice";
import { formatPrice } from "../../utils/formatPrice";
import { useAppDispatch } from "../../app/hooks";
import { toggleWishlist } from "../../features/products/productItemSlice";

interface BasketCardProps {
  item: BasketEntry;
}

const BasketCard: React.FC<BasketCardProps> = ({ item }) => {
  const dispatch = useAppDispatch();

  const isMarked = item.marked_for_order || false;

  const handleCheckboxChange = () => {
    dispatch(
      moveToOrder({
        ids: [item.id],
        enable: !isMarked,
      }),
    );
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(
      toggleWishlist({ id: item.item.id, enable: !item.item.in_wishlist }),
    );
  };

  const handleRemoveFromBasket = async () => {
    await dispatch(
      toggleBasketItem({
        id: item.item.id,
        enable: false,
      }),
    );
  };

  const handleIncrease = () => {
    if (item.item.remains && item.amount < item.item.remains) {
      dispatch(
        updateBasketItemAmount({
          id: item.item.id,
          amount: item.amount + 1,
        }),
      );
    }
  };

  const handleDecrease = () => {
    if (item.amount <= 1) return;
    dispatch(
      updateBasketItemAmount({
        id: item.item.id,
        amount: item.amount - 1,
      }),
    );
  };

  return (
    <div className="basket-card">
      <CustomCheckbox
        checked={isMarked}
        onChange={handleCheckboxChange}
        checkboxClass="basket-card_checkbox"
      />
      <div className="basket-card_img">
        {item.item.images && item.item.images.length > 0 ? (
          <img src={item.item.images[0].source} alt={item.item.title} />
        ) : (
          <img className="img-empty" src={itemImg} alt={item.item.title} />
        )}
      </div>
      <div className="basket-card_info">
        <span className="basket-card_id inter11-400">
          код: {item.item.article}
        </span>
        <span className="basket-card_name inter14-400">{item.item.title}</span>
        <span className="basket-card_price-one inter13-400">
          {item.item.price} за шт
        </span>
        <span className="basket-card_date inter11-400">
          Забрать сегодня:
          <span className="basket-card_date__accent">Посмотреть магазины</span>
        </span>
      </div>
      <div className="basket-card_info-price">
        {/* <div className="basket-card_discount">
          <span className="basket-card_discount-value inter14-500">
            {item.item.cart_count &&
              formatPrice(
                ((item.item.price * 4) / 3) * item.item.cart_count,
              )}{" "}
            ₽
          </span>
          <span className="basket-card_discount-percent inter11-600">
            - 25%
          </span>
        </div> */}
        <span className="basket-card_price inter20-600">
          {item.item.cart_count &&
            formatPrice(item.item.price * item.item.cart_count)}{" "}
          ₽
        </span>
        <div className="basket-card_count inter14-600">
          <button
            className={`basket-card_count-btn ${item.amount <= 1 ? "basket-card_count-btn__inactive" : ""}`}
            onClick={handleDecrease}
            disabled={item.amount <= 1}
            aria-label="Уменьшить количество"
          >
            <svg width="6" height="2" viewBox="0 0 6 2" fill="none">
              <path d="M6 0V1.5H0V0H6Z" fill="white" />
            </svg>
          </button>

          <span>{item.amount}</span>

          <button
            className={`basket-card_count-btn ${item.item.remains && item.amount === item.item.remains ? "basket-card_count-btn__inactive" : ""}`}
            onClick={handleIncrease}
            aria-label="Увеличить количество"
          >
            <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
              <path d="M2.4 6V0H3.6V6H2.4ZM0 3.6V2.4H6V3.6H0Z" fill="white" />
            </svg>
          </button>
        </div>
      </div>
      <div className="basket-card_actions inter13-400">
        <button
          onClick={handleRemoveFromBasket}
          className="basket-card_btn basket-card_remove"
          aria-label="Удалить из корзины"
        >
          <svg
            width="17"
            height="19"
            viewBox="0 0 17 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.5 3.66663L13.9836 12.0209C13.8516 14.1553 13.7856 15.2226 13.2506 15.9898C12.9861 16.3692 12.6455 16.6894 12.2506 16.93C11.4518 17.4166 10.3825 17.4166 8.24395 17.4166C6.1026 17.4166 5.03192 17.4166 4.23254 16.9291C3.83733 16.688 3.49666 16.3673 3.23224 15.9873C2.6974 15.2188 2.63288 14.1501 2.50384 12.0126L2 3.66663"
              stroke="#727271"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M0.75 3.66667H15.75M11.6298 3.66667L11.0609 2.49311C10.683 1.71355 10.494 1.32377 10.1681 1.08067C10.0958 1.02675 10.0192 0.978785 9.93919 0.937251C9.57826 0.75 9.1451 0.75 8.27877 0.75C7.39069 0.75 6.94665 0.75 6.57974 0.9451C6.49842 0.98834 6.42082 1.03825 6.34774 1.09431C6.01803 1.34725 5.83386 1.75129 5.4655 2.55938L4.96077 3.66667"
              stroke="#727271"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M6.16797 12.8331L6.16797 7.83307"
              stroke="#727271"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M10.332 12.8331L10.332 7.83307"
              stroke="#727271"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <span className="basket-card_btn-label">Удалить</span>
        </button>
        <button
          onClick={handleToggleWishlist}
          className={`basket-card_btn basket-card_fav ${item.item.in_wishlist ? "basket-card_btn__active" : ""}`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M15.204 6.07692C14.2278 6.07692 13.29 6.46396 12.5988 7.15551L12.4015 7.35282C12.2963 7.45801 12.1513 7.51743 11.9998 7.51743C11.8483 7.51743 11.7033 7.45801 11.5981 7.35282L11.4008 7.15549C9.96323 5.71786 7.62812 5.71786 6.19053 7.15549C4.7582 8.58787 4.7582 10.9066 6.19053 12.339L11.6194 17.768C11.8194 17.968 12.1529 17.9756 12.3627 17.7847C13.6117 16.6242 14.7988 15.4081 15.9948 14.1827C16.5943 13.5685 17.1961 12.952 17.8091 12.339C18.4962 11.6522 18.8837 10.7205 18.8837 9.74723C18.8837 8.77407 18.4963 7.84242 17.8092 7.15557C17.118 6.46408 16.1801 6.07692 15.204 6.07692ZM11.9999 6.21497C12.875 5.43703 14.0145 5 15.204 5C16.4884 5 17.7146 5.50958 18.6124 6.40771C19.5038 7.29873 20 8.49985 20 9.74723C20 10.9947 19.5037 12.1958 18.6124 13.0868C18.0197 13.6795 17.428 14.2856 16.8331 14.895C15.6249 16.1326 14.4038 17.3835 13.1353 18.562L13.1324 18.5648C12.4782 19.1636 11.4422 19.1419 10.816 18.5157L5.38715 13.0867C3.53761 11.2371 3.53761 8.25738 5.38715 6.40779C7.19706 4.59784 10.1115 4.53357 11.9999 6.21497Z"
              fill="#B0B0B0"
            />
            <path
              d="M12.5988 7.15551C13.29 6.46396 14.2278 6.07692 15.204 6.07692C16.1801 6.07692 17.118 6.46408 17.8092 7.15557C18.4963 7.84242 18.8837 8.77407 18.8837 9.74723C18.8837 10.7205 18.4962 11.6522 17.8091 12.339C17.1961 12.952 16.5943 13.5685 15.9948 14.1827C14.7988 15.4081 13.6117 16.6242 12.3627 17.7847C12.1529 17.9756 11.8194 17.968 11.6194 17.768L6.19053 12.339C4.7582 10.9066 4.7582 8.58787 6.19053 7.15549C7.62812 5.71786 9.96323 5.71786 11.4008 7.15549L11.5981 7.35282C11.7033 7.45801 11.8483 7.51743 11.9998 7.51743C12.1513 7.51743 12.2963 7.45801 12.4015 7.35282L12.5988 7.15551Z"
              fill="#B0B0B0"
            />
          </svg>
          <span className="basket-card_btn-label">В избранное</span>
        </button>
      </div>
    </div>
  );
};

export default BasketCard;
