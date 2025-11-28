import React, { useEffect, useState } from 'react';
import './CatalogModal.scss';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchCategories, type Category } from '../../features/categories/categoriesSlice';

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
  const { categories, loading } = useAppSelector(state => state.categories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      dispatch(fetchCategories());
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, dispatch]);

  const safeCategories = Array.isArray(categories) ? categories : [];

  const parentCategories = safeCategories.filter(cat => cat.parent === null);

  const subcategories = selectedCategory 
    ? safeCategories.filter(cat => cat.parent === selectedCategory)
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

  const getSelectedCategoryTitle = (): string => {
    if (!selectedCategory) return '';
    const category = safeCategories.find(cat => cat.id === selectedCategory);
    return category?.title || '';
  };

  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="catalog-modal">
      <div className='catalog-cat_list inter14-400'>
        {parentCategories.map((category) => (
          <Link
            to={`/category/${category.slug}`} 
            key={category.id}
            className={`catalog-cat_item ${category.id === selectedCategory ? 'catalog-cat_item__active' : ''}`}
            onMouseEnter={() => setSelectedCategory(category.id)}
            onClick={handleLinkClick}
          >
            <span className='catalog-cat_name'>{category.title}</span>
          </Link>
        ))}
      </div>
      
      <div className="catalog-subcat_panel-container">
        <div className="catalog-subcat_panel">
          {loading ? (
            <div className="catalog-loading">Загрузка...</div>
          ) : subcategoryGroups.length > 0 ? (
            subcategoryGroups.map((group, groupIndex) => (
              <div 
                key={groupIndex} 
                className={`catalog-subcat_group ${groupIndex % 2 === 0 ? 'catalog-subcat_group__gray' : 'catalog-subcat_group__white'}`}
              >
                <div className="catalog-subcat_columns">
                  <div className="catalog-subcat_column">
                    {group.leftColumn.map((subcategory) => (
                      <div className="catalog-subcat_block" key={subcategory.id}>
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
                      <div className="catalog-subcat_block" key={subcategory.id}>
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
                ? `Нет подкатегорий для "${getSelectedCategoryTitle()}"`
                : 'Категории не найдены'
              }
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CatalogModal;