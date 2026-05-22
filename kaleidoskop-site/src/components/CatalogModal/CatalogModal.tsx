import React, { useEffect, useState } from "react";
import "./CatalogModal.scss";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  fetchCategories,
  type Category,
} from "../../features/categories/categoriesSlice";

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubcategoryGroup {
  leftColumn: Category[];
  rightColumn: Category[];
}

const CatalogModal: React.FC<CatalogModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.categories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"categories" | "subcategories">(
    "categories",
  );
  const [mobileSelectedCategory, setMobileSelectedCategory] =
    useState<Category | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      dispatch(fetchCategories());
      setMobileView("categories");
      setMobileSelectedCategory(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, dispatch]);

  const safeCategories = Array.isArray(categories) ? categories : [];

  const parentCategories = safeCategories.filter((cat) => cat.parent === null);

  const subcategories = selectedCategory
    ? safeCategories.filter((cat) => cat.parent === selectedCategory)
    : [];

  useEffect(() => {
    if (parentCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(parentCategories[0].id);
    }
  }, [parentCategories, selectedCategory]);

  const distributeSubcategories = (subcats: Category[]): SubcategoryGroup => {
    const leftColumn: Category[] = [];
    const rightColumn: Category[] = [];

    subcats.forEach((subcat, index) => {
      if (index % 2 === 0) {
        leftColumn.push(subcat);
      } else {
        rightColumn.push(subcat);
      }
    });

    return { leftColumn, rightColumn };
  };

  const groupSubcategories = (subcats: Category[]): SubcategoryGroup[] => {
    const groups: SubcategoryGroup[] = [];
    for (let i = 0; i < subcats.length; i += 10) {
      const group = subcats.slice(i, i + 10);
      groups.push(distributeSubcategories(group));
    }
    return groups;
  };

  const subcategoryGroups = groupSubcategories(subcategories);

  const handleLinkClick = () => {
    onClose();
  };

  const handleMobileCategoryClick = (category: Category) => {
    setMobileSelectedCategory(category);
    setMobileView("subcategories");
  };

  const handleMobileBack = () => {
    setMobileView("categories");
    setMobileSelectedCategory(null);
  };

  const mobileSubcategories = mobileSelectedCategory
    ? safeCategories.filter((cat) => cat.parent === mobileSelectedCategory.id)
    : [];

  if (!isOpen || loading) return null;

  return createPortal(
    <>
      {/* Десктоп версия - не трогать */}
      <div className="catalog-modal">
        <div className="catalog-cat_list inter14-400">
          {parentCategories.map((category) => (
            <Link
              to={`/category/${category.slug}`}
              key={category.id}
              className={`catalog-cat_item ${category.id === selectedCategory ? "catalog-cat_item__active" : ""}`}
              onMouseEnter={() => setSelectedCategory(category.id)}
              onClick={handleLinkClick}
            >
              <div
                className="catalog-cat_icon"
                style={{ maskImage: `url(${category.image})` }}
              />
              <span className="catalog-cat_name">{category.title}</span>
            </Link>
          ))}
        </div>

        <div className="catalog-subcat_panel-container">
          <div className="catalog-subcat_panel">
            {subcategoryGroups.length > 0 ? (
              subcategoryGroups.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className={`catalog-subcat_group ${groupIndex % 2 === 0 ? "catalog-subcat_group__gray" : "catalog-subcat_group__white"}`}
                >
                  <div className="catalog-subcat_columns">
                    <div className="catalog-subcat_column">
                      {group.leftColumn.map((subcategory) => (
                        <div
                          className="catalog-subcat_block"
                          key={subcategory.id}
                        >
                          <Link
                            to={`/category/${subcategory.slug}`}
                            className="catalog-subcat_title inter14-400"
                            onClick={handleLinkClick}
                          >
                            {subcategory.title}
                          </Link>
                        </div>
                      ))}
                    </div>

                    <div className="catalog-subcat_column">
                      {group.rightColumn.map((subcategory) => (
                        <div
                          className="catalog-subcat_block"
                          key={subcategory.id}
                        >
                          <Link
                            to={`/category/${subcategory.id}`}
                            className="catalog-subcat_title inter14-400"
                          >
                            {subcategory.title}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="catalog-empty">
                {parentCategories.length > 0
                  ? `Нет подкатегорий`
                  : "Категории не найдены"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="catalog-modal-mobile">
        {mobileView === "categories" && (
          <div className="catalog-mobile_categories catalog-mobile">
            <div className="catalog-mobile_header">
              <span className="inter18-600">Каталог</span>
              <button
                className="catalog-mobile_close catalog-mobile_btn"
                onClick={onClose}
                aria-label="Закрыть каталог"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0.219748 0.219705C0.512641 -0.0731876 0.987515 -0.0731878 1.28041 0.219705L5.99272 4.93202L10.705 0.219705C10.9979 -0.0731876 11.4728 -0.0731879 11.7657 0.219705C12.0586 0.512598 12.0586 0.987473 11.7657 1.28037L7.05338 5.99268L11.7657 10.705C12.0586 10.9979 12.0586 11.4728 11.7657 11.7656C11.4728 12.0585 10.9979 12.0585 10.705 11.7656L5.99272 7.05334L1.28041 11.7656C0.987515 12.0585 0.512641 12.0585 0.219748 11.7656C-0.0731455 11.4728 -0.0731455 10.9979 0.219748 10.705L4.93206 5.99268L0.219748 1.28037C-0.0731455 0.987472 -0.0731455 0.512599 0.219748 0.219705Z"
                    fill="black"
                  />
                </svg>
              </button>
            </div>
            {parentCategories.map((category) => (
              <div
                key={category.id}
                className="catalog-mobile_category-item"
                onClick={() => handleMobileCategoryClick(category)}
              >
                <div
                  className="catalog-mobile_category-icon"
                  style={{ maskImage: `url(${category.image})` }}
                />
                <span className="catalog-mobile_category-name inter14-400">
                  {category.title}
                </span>
                <div className="catalog-mobile_open">
                  <svg
                    width="6"
                    height="10"
                    viewBox="0 0 6 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.139351 0.290743C0.373287 -0.0268894 0.820421 -0.0947395 1.13805 0.139196C1.38477 0.320901 1.61929 0.502645 1.82355 0.66205C2.2313 0.98027 2.77739 1.41835 3.32556 1.89431C3.87019 2.36718 4.43323 2.89149 4.86572 3.38097C5.08124 3.62489 5.27945 3.877 5.42765 4.12283C5.56403 4.34905 5.71435 4.6599 5.71436 4.99999C5.71435 5.34007 5.56403 5.65094 5.42765 5.87717C5.27945 6.123 5.08124 6.3751 4.86572 6.61903C4.43323 7.10851 3.87019 7.63282 3.32557 8.10569C2.77739 8.58165 2.2313 9.01973 1.82355 9.33795C1.61929 9.49735 1.38477 9.6791 1.13805 9.8608C0.820422 10.0947 0.373288 10.0269 0.139352 9.70926C0.0453147 9.58157 4.99389e-05 9.43296 0.000173427 9.28568L0.000173052 5L0.000172677 0.714321C4.91638e-05 0.56704 0.0453139 0.418426 0.139351 0.290743Z"
                      fill="#B0B0B0"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}

        {mobileView === "subcategories" && mobileSelectedCategory && (
          <div className="catalog-mobile_subcategories catalog-mobile">
            <div className="catalog-mobile_header">
              <span className="inter18-600">Каталог</span>
              <button
                className="catalog-mobile_back catalog-mobile_btn"
                onClick={handleMobileBack}
                aria-label="Закрыть каталог"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M7.28033 0.21967C7.57322 0.512563 7.57322 0.987437 7.28033 1.28033L2.56066 6H13.25C13.6642 6 14 6.33579 14 6.75C14 7.16421 13.6642 7.5 13.25 7.5H2.56066L7.28033 12.2197C7.57322 12.5126 7.57322 12.9874 7.28033 13.2803C6.98744 13.5732 6.51256 13.5732 6.21967 13.2803L0.21967 7.28033C-0.0732233 6.98744 -0.0732233 6.51256 0.21967 6.21967L6.21967 0.21967C6.51256 -0.0732233 6.98744 -0.0732233 7.28033 0.21967Z"
                    fill="black"
                  />
                </svg>
              </button>
              <button
                className="catalog-mobile_close catalog-mobile_btn"
                onClick={onClose}
                aria-label="Закрыть каталог"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0.219748 0.219705C0.512641 -0.0731876 0.987515 -0.0731878 1.28041 0.219705L5.99272 4.93202L10.705 0.219705C10.9979 -0.0731876 11.4728 -0.0731879 11.7657 0.219705C12.0586 0.512598 12.0586 0.987473 11.7657 1.28037L7.05338 5.99268L11.7657 10.705C12.0586 10.9979 12.0586 11.4728 11.7657 11.7656C11.4728 12.0585 10.9979 12.0585 10.705 11.7656L5.99272 7.05334L1.28041 11.7656C0.987515 12.0585 0.512641 12.0585 0.219748 11.7656C-0.0731455 11.4728 -0.0731455 10.9979 0.219748 10.705L4.93206 5.99268L0.219748 1.28037C-0.0731455 0.987472 -0.0731455 0.512599 0.219748 0.219705Z"
                    fill="black"
                  />
                </svg>
              </button>
            </div>
            <div className="catalog-mobile-subcategories-list">
              {mobileSubcategories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  to={`/category/${subcategory.slug}`}
                  className="catalog-mobile_category-item inter14-400"
                  onClick={handleLinkClick}
                >
                  {subcategory.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
};

export default CatalogModal;
