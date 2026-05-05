import "./ListView.scss";
import type { Product } from "../../features/products/productsSlice";
import ItemCardBig from "../ItemCardBig/ItemCardBig";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchBrandsByCategory,
  fetchBrandsByQuery,
} from "../../features/brands/brandsSlice";

export type SortOption = "price" | "-price" | null;

interface ListViewProps {
  items: Product[];
  title?: string;
  onFilterChange?: (filters: {
    minPrice?: number;
    maxPrice?: number;
    brands?: string[];
  }) => void;
  onSortChange?: (sortOption: SortOption) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  categoryId?: string;
  categorySlug?: string;
  query?: string;
}

const ListView: React.FC<ListViewProps> = ({
  items,
  onFilterChange,
  onSortChange,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  categoryId = null,
  categorySlug = undefined,
  query = null,
}) => {
  const dispatch = useAppDispatch();
  const { brands, loading: brandsLoading } = useAppSelector(
    (state) => state.brands,
  );

  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>(null);
  const prevFiltersRef = useRef<any>({});
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const sortButtonRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (categoryId) dispatch(fetchBrandsByCategory(categoryId));
    else if (query) dispatch(fetchBrandsByQuery(query));
  }, [categoryId, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSortOptions &&
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node) &&
        sortButtonRef.current &&
        !sortButtonRef.current.contains(event.target as Node)
      ) {
        setShowSortOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSortOptions]);

  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (!hasMore || isLoadingMore || items.length === 0 || !onLoadMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("Observer сработал, загружаем...");
          isLoadingRef.current = true;
          onLoadMore();

          setTimeout(() => {
            isLoadingRef.current = false;
          }, 1000);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoadingMore, onLoadMore, items.length]);

  const applyFilters = useCallback(
    (filtersToApply: {
      minPrice?: number;
      maxPrice?: number;
      brands?: string[];
    }) => {
      if (!onFilterChange) return;

      const prevFilters = prevFiltersRef.current;
      const hasChanged =
        filtersToApply.minPrice !== prevFilters.minPrice ||
        filtersToApply.maxPrice !== prevFilters.maxPrice ||
        JSON.stringify(filtersToApply.brands) !==
          JSON.stringify(prevFilters.brands);

      if (hasChanged) {
        prevFiltersRef.current = filtersToApply;
        onFilterChange(filtersToApply);
      }
    },
    [onFilterChange],
  );

  const handleBrandToggle = (brandId: string) => {
    setSelectedBrands((prev) => {
      const newBrands = prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId];

      const filters: any = {};

      if (minPrice.trim() && !isNaN(parseInt(minPrice))) {
        filters.minPrice = parseInt(minPrice);
      }

      if (maxPrice.trim() && !isNaN(parseInt(maxPrice))) {
        filters.maxPrice = parseInt(maxPrice);
      }

      if (newBrands.length > 0) {
        filters.brands = newBrands;
      }

      setTimeout(() => {
        applyFilters(filters);
      }, 0);

      return newBrands;
    });
  };

  const handlePriceBlur = () => {
    const filters: any = {};

    if (minPrice.trim() && !isNaN(parseInt(minPrice))) {
      filters.minPrice = parseInt(minPrice);
    }

    if (maxPrice.trim() && !isNaN(parseInt(maxPrice))) {
      filters.maxPrice = parseInt(maxPrice);
    }

    if (selectedBrands.length > 0) {
      filters.brands = selectedBrands;
    }

    applyFilters(filters);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(e.target.value);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePriceBlur();
    }
  };

  const handleSortClick = (sortOption: SortOption) => {
    setSelectedSort(sortOption);
    setShowSortOptions(false);

    if (onSortChange) {
      onSortChange(sortOption);
    }
  };

  const toggleSortOptions = () => {
    setShowSortOptions((prev) => !prev);
  };

  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedBrands([]);
    prevFiltersRef.current = {};

    if (onFilterChange) {
      onFilterChange({});
    }
  };

  return (
    <div className="list-container" ref={containerRef}>
      <div className="list-filters-section">
        <div className="list_filter-group">
          <h4 className="list_filter-group-title inter14-600">Цена</h4>
          <div className="list_price-inputs">
            <input
              type="number"
              className="list_price-input inter14-400"
              placeholder="от"
              value={minPrice}
              onChange={handleMinPriceChange}
              onBlur={handlePriceBlur}
              onKeyDown={handlePriceKeyDown}
              min="0"
            />
            <input
              type="number"
              className="list_price-input inter14-400"
              placeholder="до"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              onBlur={handlePriceBlur}
              onKeyDown={handlePriceKeyDown}
              min="0"
            />
          </div>
        </div>

        <div className="list_filter-group">
          <h4 className="list_filter-group-title inter14-600">Бренды</h4>
          {brandsLoading ? (
            <div className="list_brands-loading inter14-400">Загрузка...</div>
          ) : (
            <div className="list_brands-list">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className={`list_brand-item inter13-400 ${selectedBrands.includes(brand.id) ? "list_brand-item__selected" : ""}`}
                  onClick={() => handleBrandToggle(brand.id)}
                >
                  {brand.title}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="list-main">
        <div className="list-head">
          <div
            ref={sortButtonRef}
            className={`list-sort inter14-400 ${selectedSort ? "list-sort__active" : ""}`}
            onClick={toggleSortOptions}
          >
            <div className="list-sort_icon">
              <svg
                width="17"
                height="15"
                viewBox="0 0 17 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.2808 9.96975C16.1402 9.82915 15.9494 9.75016 15.7506 9.75016C15.5517 9.75016 15.3609 9.82915 15.2203 9.96975L12.7505 12.4395V0.75C12.7505 0.551088 12.6715 0.360322 12.5309 0.21967C12.3902 0.0790176 12.1995 0 12.0005 0C11.8016 0 11.6109 0.0790176 11.4702 0.21967C11.3296 0.360322 11.2505 0.551088 11.2505 0.75V12.4395L8.7808 9.96975C8.63935 9.83313 8.4499 9.75754 8.25325 9.75924C8.0566 9.76095 7.86849 9.83983 7.72944 9.97889C7.59038 10.1179 7.5115 10.3061 7.50979 10.5027C7.50809 10.6993 7.58368 10.8888 7.7203 11.0303L11.4703 14.7803C11.54 14.8501 11.6227 14.9055 11.7138 14.9433C11.805 14.9811 11.9026 15.0006 12.0013 15.0006C12.1 15.0006 12.1976 14.9811 12.2888 14.9433C12.3799 14.9055 12.4626 14.8501 12.5323 14.7803L16.2823 11.0303C16.4227 10.8894 16.5014 10.6986 16.5011 10.4997C16.5009 10.3008 16.4216 10.1102 16.2808 9.96975Z"
                  fill="#212529"
                />
                <path
                  d="M8.78142 3.96963L5.03142 0.219628C4.96157 0.149639 4.87844 0.0943066 4.78692 0.0568783C4.60345 -0.0189594 4.39739 -0.0189594 4.21392 0.0568783C4.12239 0.0943066 4.03927 0.149639 3.96942 0.219628L0.219417 3.96963C0.0787862 4.11046 -0.000140465 4.30139 1.87666e-07 4.50041C0.00014084 4.69943 0.0793373 4.89025 0.220167 5.03088C0.360997 5.17151 0.551925 5.25044 0.750948 5.2503C0.949971 5.25015 1.14079 5.17096 1.28142 5.03013L3.75117 2.56038V14.2499C3.75117 14.4488 3.83019 14.6396 3.97084 14.7802C4.11149 14.9209 4.30226 14.9999 4.50117 14.9999C4.70008 14.9999 4.89084 14.9209 5.0315 14.7802C5.17215 14.6396 5.25117 14.4488 5.25117 14.2499V2.56038L7.72092 5.03013C7.86237 5.16675 8.05182 5.24234 8.24847 5.24063C8.44512 5.23892 8.63323 5.16005 8.77228 5.02099C8.91134 4.88194 8.99021 4.69383 8.99192 4.49718C8.99363 4.30053 8.91804 4.11108 8.78142 3.96963Z"
                  fill="#212529"
                />
              </svg>
            </div>
            <span className="list-sort_value">
              {!selectedSort
                ? "Сортировка"
                : selectedSort === "-price"
                  ? "Сначала дороже"
                  : "Сначала дешевле"}
            </span>
          </div>

          {showSortOptions && (
            <div
              ref={sortDropdownRef}
              className="list-sort_dropdown inter16-400"
            >
              <div
                className={`list-sort_option ${selectedSort === null ? "list-sort-option__selected" : ""}`}
                onClick={() => handleSortClick(null)}
              >
                По умолчанию
              </div>
              <div
                className={`list-sort_option ${selectedSort === "-price" ? "list-sort-option__selected" : ""}`}
                onClick={() => handleSortClick("-price")}
              >
                Сначала дороже
              </div>
              <div
                className={`list-sort_option ${selectedSort === "price" ? "list-sort-option__selected" : ""}`}
                onClick={() => handleSortClick("price")}
              >
                Сначала дешевле
              </div>
            </div>
          )}
        </div>

        <div className="list-content">
          {items.length === 0 ? (
            <div className="empty-results">
              <p className="inter14-400">Ничего не найдено</p>
              {(minPrice || maxPrice || selectedBrands.length > 0) && (
                <button
                  className="reset-filter-btn inter14-400"
                  onClick={resetFilters}
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          ) : (
            <>
              {items.map((item, index) => (
                <div
                  key={item.id}
                  ref={index === items.length - 1 ? lastItemRef : null}
                >
                  <ItemCardBig product={item} categorySlug={categorySlug} />
                </div>
              ))}

              <div ref={observerTarget} className="infinite-scroll-observer">
                {isLoadingMore && (
                  <div className="loading-more">
                    <span>Загрузка...</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListView;
