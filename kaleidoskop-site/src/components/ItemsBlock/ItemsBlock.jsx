import { useRef } from 'react';
import ItemCard from '../ItemCard/ItemCard';
import './itemsBlock.scss'

function ItemsBlock ({
  title,
  icon = false,
  dates,
}) {
  const words = title.trim().split(/\s+/);
  const firstWord = words[0];
  const restWords = words.slice(1).join(' ');
  const listRef = useRef(null);

  const scroll = (direction) => {
    if (!listRef.current) return;
    
    const scrollAmount = 300;
    const { scrollLeft, clientWidth, scrollWidth } = listRef.current;
    
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
            <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.6793 5.67929C13.1326 5.67929 13.5 6.04674 13.5 6.5C13.5 6.95326 13.1326 7.32071 12.6793 7.32071H6.06573C5.17482 7.32071 4.72866 8.39785 5.35862 9.02781L7.5827 11.2519C7.90452 11.5737 7.90452 12.0955 7.5827 12.4173C7.26088 12.7391 6.73912 12.7391 6.4173 12.4173L1.20711 7.20711C0.816583 6.81658 0.816582 6.18342 1.20711 5.79289L6.4173 0.582702C6.73911 0.260885 7.26088 0.260885 7.5827 0.582702C7.90452 0.904519 7.90452 1.42629 7.5827 1.74811L5.35862 3.97219C4.72866 4.60215 5.17482 5.67929 6.06573 5.67929H12.6793Z" fill="white"/>
            </svg>
          </button>
          <button className='item-block_btn' onClick={() => scroll('right')}>
            <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.32071 5.67929C0.867443 5.67929 0.5 6.04674 0.5 6.5C0.5 6.95326 0.867443 7.32071 1.32071 7.32071H7.93427C8.82518 7.32071 9.27134 8.39785 8.64138 9.02781L6.4173 11.2519C6.09548 11.5737 6.09548 12.0955 6.4173 12.4173C6.73912 12.7391 7.26088 12.7391 7.5827 12.4173L12.7929 7.20711C13.1834 6.81658 13.1834 6.18342 12.7929 5.79289L7.5827 0.582702C7.26089 0.260885 6.73912 0.260885 6.4173 0.582702C6.09548 0.904519 6.09548 1.42629 6.4173 1.74811L8.64138 3.97219C9.27134 4.60215 8.82518 5.67929 7.93427 5.67929H1.32071Z" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="item-block_list" ref={listRef}>
        <ItemCard />
        <ItemCard />
        <ItemCard />
        <ItemCard />
        <ItemCard />
        <ItemCard />
        <ItemCard />
      </div>
    </div>
  )
}

export default ItemsBlock;