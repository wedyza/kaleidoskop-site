import './ListView.scss'
import type { Product } from '../../features/products/productsSlice';
import ItemCardBig from '../ItemCardBig/ItemCardBig';

interface ListViewProps {
  items: Product[];
  title?: string;
}

const ListView: React.FC<ListViewProps> = ({ items, title }) => {
  return (
    <div className='list-container'>
      <div className='list-filters inter14-600'>
        Фильтрация
      </div>

      <div className='list-main'>
        <div className='list-head'>
          <div className='list-sort inter14-400'>
            Сортировка
          </div>
          <div className='list-filters_list inter13-400'>
            1
          </div>
        </div>

        <div className='list-content'>
          {items.length === 0 && (
            <p className='inter14-400'>Ничего не найдено</p>
          )}
          {items.map(item => (
            <ItemCardBig key={item.id} product={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ListView;
