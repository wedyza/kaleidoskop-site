import { Link, useParams } from 'react-router-dom';
import ListView from '../../components/ListView/ListView';
import './CategoryPage.scss'
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useEffect, useState } from 'react';
import { fetchCategoryById, fetchCategoryProducts } from '../../features/categories/categoriesSlice';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState({});
  
  const items = useAppSelector(state => state.categories.products)
  const category = useAppSelector(state => state.categories.currentCategory)
  const categoryId = slug ? slug.split('--')[1] : null;

  useEffect(() => {
    if (categoryId) {
      dispatch(fetchCategoryProducts({ 
        categoryId,
        ...filters 
      }));
      dispatch(fetchCategoryById(categoryId));
    }
  }, [dispatch, categoryId, filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  if (!slug) {
    return (
      <div className='page-category'>
        <div className="page-path inter16-400">
          <Link to={'/'} className='main-link'>
            Главная
          </Link>
          <span className='page-path_separator'>/</span>
          <span className="page-path_name">
            Категория не найдена
          </span>
        </div>
        <div className='category-head'>
          <h1 className='inter28-600'>Категория не найдена</h1>
        </div>
      </div>
    );
  }

  return (
    <div className='page-category'>
      <div className="page-path inter16-400">
        <Link to={'/'} className='main-link'>
          Главная
        </Link>
        <span className='page-path_separator'>/</span>
        <span className="page-path_name">
           {category?.title || 'Загрузка...'}
        </span>
      </div>
      <div className='category-head'>
        <h1 className='inter28-600'>{category?.title || 'Загрузка...'}</h1>
        {category?.items_count !== undefined && (
          <span className='inter14-400 category_items-count'>
            {category.items_count} товаров
          </span>
        )}
      </div>
      <ListView 
        items={items}
        onFilterChange={handleFilterChange}
        //title={category?.title ? `Категория: ${category.title}` : 'Категория'}
      />
    </div>
  )
}

export default CategoryPage;