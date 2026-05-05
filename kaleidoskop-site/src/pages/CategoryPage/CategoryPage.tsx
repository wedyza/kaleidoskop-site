import { Link, useParams } from "react-router-dom";
import ListView, { type SortOption } from "../../components/ListView/ListView";
import "./CategoryPage.scss";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useEffect, useState } from "react";
import {
  fetchCategoryBySlug,
  fetchCategoryProducts,
  loadMoreCategoryProducts,
} from "../../features/categories/categoriesSlice";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState({});
  const [sortOption, setSortOption] = useState<SortOption>(null);

  const categories = useAppSelector((state) => state.categories);
  const items = categories.products;
  const category = categories.currentCategory;
  const hasMore = categories.hasMore;
  const next = categories.next;
  const loading = categories.loading;

  useEffect(() => {
    if (slug) {
      dispatch(
        fetchCategoryProducts({
          categorySlug: slug,
          ...filters,
          ordering: sortOption,
        }),
      );
      dispatch(fetchCategoryBySlug(slug));
    }
  }, [dispatch, slug, filters, sortOption]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleSortChange = (sortOption: SortOption) => {
    setSortOption(sortOption);
  };

  const handleLoadMore = () => {
    if (hasMore && next && !loading) {
      dispatch(loadMoreCategoryProducts(next));
    }
  };

  if (!slug) {
    return (
      <div className="page-category">
        <div className="page-path inter16-400">
          <Link to={"/"} className="main-link">
            Главная
          </Link>
          <span className="page-path_separator">/</span>
          <span className="page-path_name">Категория не найдена</span>
        </div>
        <div className="category-head">
          <h1 className="inter28-600">Категория не найдена</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="page-category">
      <div className="page-path inter16-400">
        <Link to={"/"} className="main-link">
          Главная
        </Link>
        <span className="page-path_separator">/</span>
        <span className="page-path_name">
          {category?.title || "Загрузка..."}
        </span>
      </div>
      <div className="category-head">
        <h1 className="inter28-600">{category?.title || "Загрузка..."}</h1>
        {category?.items_count !== undefined && (
          <span className="inter14-400 category_items-count">
            {category.items_count} товаров
          </span>
        )}
      </div>
      {category && (
        <ListView
          items={items}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoadingMore={loading}
          categoryId={category?.id}
          categorySlug={slug}
        />
      )}
    </div>
  );
};

export default CategoryPage;
