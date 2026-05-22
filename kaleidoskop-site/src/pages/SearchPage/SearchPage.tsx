import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import ListView, { type SortOption } from "../../components/ListView/ListView";
import "./SearchPage.scss";
import {
  searchProducts,
  loadMoreSearchProducts,
} from "../../features/search/searchSlice";
import { Helmet } from "react-helmet-async";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState({});
  const [sortOption, setSortOption] = useState<SortOption>(null);

  const query = searchParams.get("q") || "";
  const search = useAppSelector((state) => state.search);
  const results = search.results;
  const count = search.count;
  const currentQuery = search.currentQuery;
  const hasMore = search.hasMore;
  const next = search.next;
  const loading = search.loading;
  const items = results;

  useEffect(() => {
    if (query.trim()) {
      dispatch(
        searchProducts({
          query,
          ...filters,
          ordering: sortOption,
        }),
      );
    }
  }, [dispatch, query, filters, sortOption]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleSortChange = (sortOption: SortOption) => {
    setSortOption(sortOption);
  };

  const handleLoadMore = () => {
    if (hasMore && next && !loading) {
      dispatch(loadMoreSearchProducts(next));
    }
  };

  return (
    <div className="page-search">
      <Helmet>
        <title>Калейдоскоп — Поиск "{query || ""}"</title>
      </Helmet>
      <p className="inter16-400 search-title">
        По запросу
        <span className="inter16-600"> {currentQuery} </span>
        найдено {count} товаров
      </p>
      <ListView
        items={items}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoadingMore={false}
        query={query}
      />
    </div>
  );
};

export default SearchPage;
