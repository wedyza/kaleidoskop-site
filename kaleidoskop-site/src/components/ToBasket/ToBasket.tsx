import type { Product } from "../../features/products/productsSlice";
import "./ToBasket.scss";

interface ToBasketProps {
  product: Product;
  onAdd: () => void;
  onRemove: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  classBtn: string;
}

const ToBasket: React.FC<ToBasketProps> = ({
  product,
  onAdd,
  onRemove,
  onIncrease,
  onDecrease,
  classBtn,
}) => {
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onAdd?.();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove?.();
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onIncrease?.();
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDecrease?.();
  };
  const count = product.cart_count ?? 0;
  if (count === 0) {
    return (
      <button
        className={`product_basket inter14-600 ${classBtn}`}
        onClick={handleAdd}
      >
        В корзину
      </button>
    );
  }

  return (
    <div className="basket-counter">
      <button
        className={`basket-counter_btn`}
        aria-label="Уменьшить количество"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (count === 1) handleRemove(e);
          else handleDecrease(e);
        }}
      >
        <svg
          width="14"
          height="2"
          viewBox="0 0 14 2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.5 0H12.75C13.1642 0 13.5 0.335786 13.5 0.75C13.5 1.16421 13.1642 1.5 12.75 1.5H7.5H0.75C0.335786 1.5 0 1.16421 0 0.75C0 0.335786 0.335786 0 0.75 0H7.5Z"
            fill="#262626"
          />
        </svg>
      </button>

      <span className="basket-counter_value inter14-600">{count} шт</span>

      <button
        className="basket-counter_btn"
        onClick={handleIncrease}
        aria-label="Увеличить количество"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M6.75 0C7.16421 0 7.5 0.335786 7.5 0.75V6H12.75C13.1642 6 13.5 6.33579 13.5 6.75C13.5 7.16421 13.1642 7.5 12.75 7.5H7.5V12.75C7.5 13.1642 7.16421 13.5 6.75 13.5C6.33579 13.5 6 13.1642 6 12.75V7.5H0.75C0.335786 7.5 0 7.16421 0 6.75C0 6.33579 0.335786 6 0.75 6H6V0.75C6 0.335786 6.33579 0 6.75 0Z"
            fill="#262626"
          />
        </svg>
      </button>
    </div>
  );
};

export default ToBasket;
