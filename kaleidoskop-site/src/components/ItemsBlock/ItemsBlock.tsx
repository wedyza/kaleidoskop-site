import { useRef } from 'react';
import ItemCard from '../ItemCard/ItemCard';
import './ItemsBlock.scss'
import type { Product } from '../../features/products/productsSlice';

interface ItemsBlockProps {
  title: string;
  items: Product[];
  icon?: boolean;
  dates?: string;
}

const ItemsBlock: React.FC<ItemsBlockProps> = ({
  title,
  items,
  icon = false,
  dates,
}) => {
  const words = title.trim().split(/\s+/);
  const firstWord = words[0];
  const restWords = words.slice(1).join(' ');
  const listRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!listRef.current) return;
    
    const scrollAmount = 300;
    
    if (direction === 'left') {
      listRef.current.scrollLeft -= scrollAmount;
    } else {
      listRef.current.scrollLeft += scrollAmount;
    }
  };

  return (
    <div className='item-block'>
      <div className="item-block_head">
        <div className="item-block_head-info">
          {icon && (
            <div className="item-block_head-img">
              <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.6671 11.9624C19.6671 11.9624 18.698 13.386 16.6669 14.5911C16.6669 14.5911 18.1379 2.1591 8.55351 0C11.0091 9.01236 5.42996 11.5539 3.39628 6.79256C0 11.327 2.57869 15.2831 2.57869 15.2831C1.18605 15.4837 0.0162866 13.9623 0.0162866 13.9623C0.00582374 14.1497 0 14.3384 0 14.5284C0 20.0513 4.47716 24.5285 10 24.5285C15.5228 24.5285 20 20.0513 20 14.5284C20 13.6413 19.8839 12.7814 19.6671 11.9624Z" fill="#FF7F4B"/>
                <path d="M19.6671 11.9624C19.6671 11.9624 18.698 13.386 16.6669 14.5911C16.6669 14.5911 17.9843 3.45528 10 0.432007V24.5284C15.5228 24.5284 20 20.0513 20 14.5284C20 13.6412 19.8839 12.7813 19.6671 11.9624Z" fill="#FD5219"/>
                <path d="M14.3856 20.1427C14.3856 22.5648 12.4221 24.5283 9.99998 24.5283C7.57789 24.5283 5.61438 22.5648 5.61438 20.1427C5.61438 18.8463 6.17686 17.6813 7.07113 16.8784C8.76675 19.182 11.1831 15.6876 9.29996 13.1358C9.29996 13.1358 14.3856 13.7731 14.3856 20.1427Z" fill="#FBDA35"/>
                <path d="M10 13.3043V24.5284C12.4221 24.5284 14.3856 22.5649 14.3856 20.1428C14.3856 15.2576 11.3943 13.7443 10 13.3043Z" fill="#F7BA35"/>
              </svg>
            </div>
          )}
          <div className="item-block_title inter28-600">
            <span className="colored-title__first">{firstWord}</span>
            {restWords && <span className="colored-title__rest"> {restWords}</span>}
          </div>
          {dates && (
            <div className="item-block_dates inter16-500">
              {dates}
            </div>
          )}
        </div>
        <div className="item-block_head-btns">
          <button className='item-block_btn' onClick={() => scroll('left')}>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.80514 0.407048C7.47763 -0.0376458 6.85163 -0.132638 6.40694 0.194877C6.06153 0.449269 5.73319 0.703716 5.44723 0.926886C4.87636 1.3724 4.11183 1.98573 3.34437 2.65208C2.58187 3.31412 1.79361 4.04815 1.18811 4.73344C0.886372 5.07494 0.608877 5.42789 0.401397 5.77206C0.210464 6.08878 3.36356e-06 6.52398 -6.11969e-07 7.0001C3.28031e-06 7.47623 0.210463 7.91146 0.401396 8.22818C0.608876 8.57235 0.886372 8.9253 1.18811 9.2668C1.79361 9.95209 2.58187 10.6861 3.34437 11.3482C4.11183 12.0145 4.87636 12.6278 5.44723 13.0734C5.73319 13.2965 6.06153 13.551 6.40693 13.8054C6.85163 14.1329 7.47763 14.0379 7.80514 13.5932C7.9368 13.4144 8.00017 13.2064 7.99999 13.0002L8 7.00012L8 1.00007C8.00017 0.79387 7.9368 0.585806 7.80514 0.407048Z" fill="#888888"/>
            </svg>
          </button>
          <button className='item-block_btn' onClick={() => scroll('right')}>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.194858 0.407048C0.522373 -0.0376458 1.14837 -0.132638 1.59306 0.194877C1.93847 0.449269 2.26681 0.703716 2.55277 0.926886C3.12364 1.3724 3.88817 1.98573 4.65563 2.65208C5.41813 3.31412 6.20639 4.04815 6.81189 4.73344C7.11363 5.07494 7.39112 5.42789 7.5986 5.77206C7.78954 6.08878 8 6.52398 8 7.0001C8 7.47623 7.78954 7.91146 7.5986 8.22818C7.39112 8.57235 7.11363 8.9253 6.81189 9.2668C6.20639 9.95209 5.41813 10.6861 4.65563 11.3482C3.88817 12.0145 3.12364 12.6278 2.55277 13.0734C2.26681 13.2965 1.93847 13.551 1.59307 13.8054C1.14837 14.1329 0.522374 14.0379 0.194859 13.5932C0.063204 13.4144 -0.000167646 13.2064 5.42805e-06 13.0002L4.9035e-06 7.00012L4.37896e-06 1.00007C-0.000168731 0.79387 0.0632029 0.585806 0.194858 0.407048Z" fill="#888888"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="item-block_list" ref={listRef}>
        {items.length > 0 ? (
          items.map((product) => (
            <ItemCard product={product} key={product.id} />
          ))
        ) : (
          <div className="no-items-message inter14-400">
            Товары не найдены
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemsBlock;