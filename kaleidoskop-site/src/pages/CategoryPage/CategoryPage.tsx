import { Link, useParams } from 'react-router-dom';
import ListView from '../../components/ListView/ListView';
import './CategoryPage.scss'
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useEffect } from 'react';
import { fetchCategoryById, fetchCategoryProducts } from '../../features/categories/categoriesSlice';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const items = useAppSelector(state => state.categories.products)
  const category = useAppSelector(state => state.categories.currentCategory)

  useEffect(() => {
    if (slug) {
      dispatch(fetchCategoryProducts(slug.split('--')[1]));
      dispatch(fetchCategoryById(slug.split('--')[1]));
    }
  }, [dispatch, slug]);

  return (
    <div className='page-category'>
      <div className="page-path inter16-400">
        <Link to={'/'} className='main-link'>
          Главная
        </Link>
        <span className='page-path_separator'>/</span>
        <span className="page-path_name">
           {category?.title}
        </span>
      </div>
      <div className='category-head'>
        <h1 className='inter28-600'>{category?.title}</h1>
        <span className='inter14-400 category_items-count'>
          {category?.items_count} товаров
        </span>
      </div>
      <ListView 
        items={items}
        title={category?.title ? `Категория: ${category.title}` : 'Категория'}
      />
    </div>
  )
}

export default CategoryPage;
