import type React from 'react';
import Modal from '../Modal/Modal';
import './NomenclaturesModal.scss'
import { addAdminNomenclatureToCategory, type Nomenclature } from '../../features/admin/nomenclaturesSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useEffect, useMemo, useState } from 'react';
import { fetchAdminCategories } from '../../features/admin/adminCategoriesSlice';

type NomenclaturesModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (x: boolean) => void;
  selectedNom: Nomenclature;
};

const NomenclaturesModal: React.FC<NomenclaturesModalProps> = ({ isModalOpen, setIsModalOpen, selectedNom }) => {
  const { categories } = useAppSelector(state => state.adminCategories);
  const { addToCategoryLoading } = useAppSelector(state => state.nomenclatures);
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchAdminCategories());
  }, [dispatch]);
  
  const subcategoriesList = useMemo(() => {
    return categories.filter(cat => cat.parent);
  }, [categories]);

  const handleAddToCategory = (categoryId: string) => {
    dispatch(addAdminNomenclatureToCategory([{
      category: categoryId,
      nomenclature: selectedNom.id
    }]));
  };

  const isCategorySelected = (categoryId: string) => {
    return selectedNom.categories?.some(cat => cat.id === categoryId) || false;
  };

  const filteredCategories = subcategoriesList.filter(cat =>
    cat.title.toLowerCase().includes(search.toLowerCase())
  );

  return(
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className='admin-nom_modal'>
      <h3 className='admin-nom_modal-title inter14-400'>
        Назначьте подкатегорию для  
        <span className='inter14-700'>
          {selectedNom.title}
        </span>
      </h3>

      <div className='admin-nom_modal-search'>
        <div className='admin-nom_modal-search-icon'>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.41343 0C9.95547 0 12.8269 2.85342 12.8269 6.37329C12.8269 7.82769 12.2037 9.31328 11.3785 10.3858L15.717 14.6944C16.0256 15.024 16.0996 15.419 15.8502 15.751C15.6008 16.083 15.0071 16.083 14.6406 15.7512L10.301 11.4426C9.22245 12.2607 7.87504 12.7466 6.41343 12.7466C2.87139 12.7466 0 9.89316 0 6.37329C0 2.85342 2.87139 0 6.41343 0ZM6.41346 1.35591C3.52353 1.35591 1.33089 3.49956 1.33089 6.37329C1.33089 9.24702 3.29323 11.4426 6.41346 11.4426C9.5337 11.4426 11.5866 9.34453 11.5866 6.37329C11.5866 3.40205 9.30339 1.35591 6.41346 1.35591Z" fill="#727271"/>
          </svg>
        </div>
        <input 
          className='admin-nom_modal-search-input inter13-400'
          placeholder='Найдите подкатегорию'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className='admin-nom_cats-list'>
        {filteredCategories.map(cat => {
          const isSelected = isCategorySelected(cat.id);
          
          return (
            <div className='admin-nom_cat' key={cat.id}>
              <span className='admin-nom_cat-title inter14-400'>{cat.title}</span>
              
              {isSelected ? (
                <div className='admin-nom_cat-selected'>
                  <div className='admin-nom_cat-selected-label'>
                    <div className='admin-nom_cat-selected-icon'>
                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M0.219783 6.21967C0.512676 5.92678 0.98755 5.92678 1.28044 6.21967L4.75011 9.68934L14.2198 0.21967C14.5127 -0.073223 14.9875 -0.0732233 15.2804 0.21967C15.5733 0.512563 15.5733 0.987437 15.2804 1.28033L5.28044 11.2803C4.98755 11.5732 4.51268 11.5732 4.21978 11.2803L0.219783 7.28033C-0.07311 6.98744 -0.07311 6.51256 0.219783 6.21967Z" fill="#DC451A"/>
                      </svg>
                    </div>
                    <span className='admin-nom_cat-selected-text inter14-600'>Назначена</span>
                  </div>
                  
                  <button className='admin-nom_cat-cancel'>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M0.220236 0.219644C0.513129 -0.0732486 0.988003 -0.0732489 1.2809 0.219644L5.99321 4.93195L10.7055 0.219644C10.9984 -0.0732486 11.4733 -0.0732489 11.7662 0.219644C12.0591 0.512537 12.0591 0.987412 11.7662 1.2803L7.05387 5.99261L11.7662 10.7049C12.0591 10.9978 12.0591 11.4727 11.7662 11.7656C11.4733 12.0585 10.9984 12.0585 10.7055 11.7656L5.99321 7.05327L1.2809 11.7656C0.988003 12.0585 0.513129 12.0585 0.220236 11.7656C-0.0726573 11.4727 -0.0726572 10.9978 0.220236 10.7049L4.93255 5.99261L0.220236 1.2803C-0.0726572 0.987411 -0.0726573 0.512538 0.220236 0.219644Z" fill="#727271"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <button 
                  className='admin-nom_cat-select grey-btn inter14-600'
                  onClick={() => handleAddToCategory(cat.id)}
                  disabled={addToCategoryLoading}
                >
                  Назначить
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  )
}

export default NomenclaturesModal;