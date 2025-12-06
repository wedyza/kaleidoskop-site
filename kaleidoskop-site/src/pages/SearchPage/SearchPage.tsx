import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import ListView, { type SortOption } from '../../components/ListView/ListView';
import './SearchPage.scss';
import { searchProducts } from '../../features/search/searchSlice';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState({});
  const [sortOption, setSortOption] = useState<SortOption>(null);
  
  const query = searchParams.get('q') || '';
  const search = useAppSelector(state => state.search);
  const results = search.results;
  const count = search.count;
  const currentQuery = search.currentQuery;
  const items = results;

  useEffect(() => {
    if (query.trim()) {
      dispatch(searchProducts({ 
        query, 
        ...filters,
        ordering: sortOption 
      }));
    }
  }, [dispatch, query, filters, sortOption]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleSortChange = (sortOption: SortOption) => {
    setSortOption(sortOption);
  };

  return (
    <div className='page-search'>
      <p className='inter16-400 search-title'>
        По запросу 
        <span className='inter16-600'> {currentQuery} </span>
        найдено {count} товаров
      </p>
      <ListView 
        items={items} 
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        isSearch={true}
      />
    </div>
  )
}

export default SearchPage;