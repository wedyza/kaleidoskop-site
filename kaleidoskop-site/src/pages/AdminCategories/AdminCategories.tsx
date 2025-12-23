import { useEffect, useState, useMemo } from 'react';
import './AdminCategories.scss'
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAdminCategories } from '../../features/admin/adminCategoriesSlice';
import { Link } from 'react-router-dom';

const AdminCategories = () => {
  const [activeTab, setActivetab] = useState<'cat' | 'subcat'>('cat');
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector(state => state.adminCategories);

  useEffect(() => {
    dispatch(fetchAdminCategories());
  }, [dispatch]);

  const categoriesList = useMemo(() => {
    return categories.filter(cat => !cat.parent);
  }, [categories]);

  const subcategoriesList = useMemo(() => {
    return categories.filter(cat => cat.parent);
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categoriesList;
    return categoriesList.filter(cat => 
      cat.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categoriesList, searchTerm]);

  const filteredSubcategories = useMemo(() => {
    if (!searchTerm) return subcategoriesList;
    return subcategoriesList.filter(subcat => 
      subcat.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subcategoriesList, searchTerm]);

  const getParentTitle = (parentId: string | null) => {
    if (!parentId) return '-';
    const parent = categories.find(cat => cat.id === parentId);
    return parent?.title || '-';
  };

  return (
    <div className='admin-cat'>
      <div className='admin-head'>
        <div className='admin-head_icon'>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.89927 6.4762C9.16753 6.4762 9.38499 6.69366 9.38499 6.96191V8.41905H10.8421C11.1104 8.41905 11.3278 8.63652 11.3278 8.90477C11.3278 9.17302 11.1104 9.39048 10.8421 9.39048H9.38499V10.8476C9.38499 11.1159 9.16753 11.3333 8.89927 11.3333C8.63102 11.3333 8.41356 11.1159 8.41356 10.8476V9.39048H6.95642C6.68816 9.39048 6.4707 9.17302 6.4707 8.90477C6.4707 8.63652 6.68816 8.41905 6.95642 8.41905H8.41356V6.96191C8.41356 6.69366 8.63102 6.4762 8.89927 6.4762Z" fill="#454545"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.971429 0.971429V3.88571H3.88571V0.971429H0.971429ZM0 0.874286C0 0.391431 0.391431 0 0.874286 0H3.98286C4.46571 0 4.85714 0.391431 4.85714 0.874286V3.98286C4.85714 4.46571 4.46571 4.85714 3.98286 4.85714H0.874286C0.391431 4.85714 0 4.46571 0 3.98286V0.874286Z" fill="#454545"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.971429 7.44762V10.3619H3.88571V7.44762H0.971429ZM0 7.35048C0 6.86763 0.391431 6.4762 0.874286 6.4762H3.98286C4.46571 6.4762 4.85714 6.86763 4.85714 7.35048V10.4591C4.85714 10.9419 4.46571 11.3333 3.98286 11.3333H0.874286C0.391431 11.3333 0 10.9419 0 10.4591V7.35048Z" fill="#454545"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.44799 0.971429V3.88571H10.3623V0.971429H7.44799ZM6.47656 0.874286C6.47656 0.391431 6.86799 0 7.35085 0H10.4594C10.9423 0 11.3337 0.391431 11.3337 0.874286V3.98286C11.3337 4.46571 10.9423 4.85714 10.4594 4.85714H7.35085C6.86799 4.85714 6.47656 4.46571 6.47656 3.98286V0.874286Z" fill="#454545"/>
          </svg>
        </div>
        <div className='admin-head_title inter16-600'>
          Управление категориями
        </div>
      </div>

      <div className='admin-cat_head'>
        <div className='admin-cat_tabs'>
          <button 
            className={`admin-cat_tab inter13-600 ${activeTab === 'cat' ? 'admin-cat_tab__active' : ''}`}
            onClick={() => setActivetab('cat')}
          >
            Категории
          </button>
          <button 
            className={`admin-cat_tab inter13-600 ${activeTab === 'subcat' ? 'admin-cat_tab__active' : ''}`}
            onClick={() => setActivetab('subcat')}
          >
            Подкатегории
          </button>
        </div>

        <div className='admin-cat_search'>
          <div className='admin-cat_search-icon'>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M5.51154 0C8.55548 0 11.0231 2.45216 11.0231 5.47704C11.0231 6.72692 10.4875 8.0036 9.77837 8.92532L13.5068 12.628C13.772 12.9112 13.8356 13.2507 13.6213 13.536C13.4069 13.8213 12.8967 13.8213 12.5818 13.5362L8.85245 9.83351C7.92555 10.5365 6.76761 10.9541 5.51154 10.9541C2.4676 10.9541 0 8.50193 0 5.47704C0 2.45216 2.4676 0 5.51154 0ZM5.51041 1.16522C3.02688 1.16522 1.14258 3.00742 1.14258 5.47703C1.14258 7.94664 2.82896 9.8335 5.51041 9.8335C8.19186 9.8335 9.95609 8.03044 9.95609 5.47703C9.95609 2.92362 7.99395 1.16522 5.51041 1.16522Z" fill="#727271"/>
            </svg>
          </div>
          <input 
            type='text' 
            className='admin-cat_search-input inter13-400'
            placeholder='Категория или подкатегория'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className='admin-cat_add inter12-600'>
          <Link to="/admin/categories/create" className='admin-cat_add-cat admin-cat_add-item'>
            <div className='admin-cat_add-icon'>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.41667 0.75V10.0833M0.75 5.41667H10.0833" stroke="#3D3D3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span>Категория</span>
          </Link>
          <Link to="/admin/subcategories/create" className='admin-cat_add-subcat admin-cat_add-item'>
            <div className='admin-cat_add-icon'>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.41667 0.75V10.0833M0.75 5.41667H10.0833" stroke="#3D3D3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span>Подкатегория</span>
          </Link>
        </div>
      </div>

      <div className='admin-cat_content'>
        {loading ? (
          <div className="loading-indicator">Загрузка...</div>
        ) : activeTab === 'cat' ? (
          <div className='admin-cat_table inter13-400'>
            <div className='admin-cat_table-row admin-cat_table-head'>
              <div className='admin-cat_table-cell'>
                Иконка
              </div>
              <div className='admin-cat_table-cell'>
                Категория
              </div>
              <div className='admin-cat_table-cell'>
                Кол-во подкатегорий
              </div>
              <div className='admin-cat_table-cell'>
                Статус
              </div>
              <div className='admin-cat_table-cell'>
                Действия
              </div>
            </div>
            <div className='admin-cat_table-content'>
              {filteredCategories.length === 0 ? (
                <div className='admin-cat_empty'>Нет категорий</div>
              ) : (
                filteredCategories.map(cat => (
                  <div className='admin-cat_table-row admin-cat_table-item' key={cat.id}>
                    <div className='admin-cat_table-cell admin-cat_table-icon'>
                      {cat.image ? (
                        <img src={cat.image} alt={cat.title} className="category-icon" />
                      ) : (
                        <div className="category-icon-placeholder">-</div>
                      )}
                    </div>
                    <div className='admin-cat_table-cell'>
                      {cat.title}
                    </div>
                    <div className='admin-cat_table-cell admin-cat_table-count'>
                      {cat.daughter_count}
                    </div>
                    <div className={`admin-cat_table-cell inter12-600 admin-cat_table-status ${cat.active ? 'active' : 'inactive'}`}>
                      {cat.active ? 'Активная' : 'Отключена'}
                    </div>
                    <Link to={`/admin/categories/${cat.id}/edit`} className='admin-cat_table-cell inter12-600 admin-cat_table-act'>
                      <span>Редактировать</span>
                      <div className='admin-cat_table-act_img'>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.6757 1.85104L8.19095 1.33579C8.972 0.554738 10.2383 0.554738 11.0194 1.33579C11.8004 2.11683 11.8004 3.38316 11.0194 4.16421L10.5041 4.67947M7.6757 1.85104L1.43661 8.09013C1.10453 8.42221 0.899906 8.86055 0.85858 9.32835L0.753531 10.5175C0.698759 11.1375 1.21763 11.6564 1.83765 11.6016L3.02681 11.4966C3.49462 11.4553 3.93296 11.2506 4.26504 10.9186L10.5041 4.67947M7.6757 1.85104L10.5041 4.67947" stroke="#4F4F4F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className='admin-cat_table inter13-400'>
            <div className='admin-cat_table-row admin-subcat_table-row admin-cat_table-head'>
              <div className='admin-cat_table-cell'>
                Родит. категория
              </div>
              <div className='admin-cat_table-cell'>
                Подкатегория
              </div>
              <div className='admin-cat_table-cell'>
                Статус
              </div>
              <div className='admin-cat_table-cell'>
                Действия
              </div>
            </div>
            <div className='admin-cat_table-content'>
              {filteredSubcategories.length === 0 ? (
                <div className='admin-cat_empty'>Нет подкатегорий</div>
              ) : (
                filteredSubcategories.map(subcat => (
                  <div className='admin-cat_table-row admin-subcat_table-row admin-cat_table-item' key={subcat.id}>
                    <div className='admin-cat_table-cell'>
                      {getParentTitle(subcat.parent)}
                    </div>
                    <div className='admin-cat_table-cell'>
                      {subcat.title}
                    </div>
                    <div className={`admin-cat_table-cell inter12-600 admin-cat_table-status ${subcat.active ? 'active' : 'inactive'}`}>
                      {subcat.active ? 'Активная' : 'Отключена'}
                    </div>
                    <Link to={`/admin/subcategories/${subcat.id}/edit`} className='admin-cat_table-cell inter12-600 admin-cat_table-act'>
                      <span>Редактировать</span>
                      <div className='admin-cat_table-act_img'>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.6757 1.85104L8.19095 1.33579C8.972 0.554738 10.2383 0.554738 11.0194 1.33579C11.8004 2.11683 11.8004 3.38316 11.0194 4.16421L10.5041 4.67947M7.6757 1.85104L1.43661 8.09013C1.10453 8.42221 0.899906 8.86055 0.85858 9.32835L0.753531 10.5175C0.698759 11.1375 1.21763 11.6564 1.83765 11.6016L3.02681 11.4966C3.49462 11.4553 3.93296 11.2506 4.26504 10.9186L10.5041 4.67947M7.6757 1.85104L10.5041 4.67947" stroke="#4F4F4F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCategories;