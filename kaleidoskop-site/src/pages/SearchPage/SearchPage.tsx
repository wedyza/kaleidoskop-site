import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import ListView from '../../components/ListView/ListView';
import './SearchPage.scss';
import { searchProducts } from '../../features/search/searchSlice';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  
  const query = searchParams.get('q') || '';
  const search = useAppSelector(state => state.search);
  const results = search.results;
  const count = search.count;
  const currentQuery = search.currentQuery;
  const items = results;

  useEffect(() => {
    if (query.trim()) {
      dispatch(searchProducts(query));
    }
  }, [dispatch, query]);

  return (
    <div className='page-search'>
      <p className='inter16-400 search-title'>
        По запросу 
        <span className='inter16-600'> {currentQuery} </span>
         найдено {count} товаров
      </p>
      <ListView items={items} />
    </div>
  )
}

export default SearchPage;