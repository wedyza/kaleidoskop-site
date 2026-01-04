import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import './AdminNomenclatures.scss'
import { fetchAdminNomenclatures, type Nomenclature } from '../../features/admin/nomenclaturesSlice';
import NomenclaturesModal from '../../components/NomenclaturesModal/NomenclaturesModal';

const AdminNomenclatures = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedNom, setSelectedNom] = useState<Nomenclature | null>(null);
  const nomenclatures = useAppSelector(state => state.nomenclatures.nomenclatures);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAdminNomenclatures());
  }, [dispatch]);

  return (
    <div className='admin-nom'>
      <div className='admin-head'>
        <div className='admin-head_icon'>
          <svg width="11" height="11" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M-4.60499e-08 0.625001C-2.06172e-08 0.279822 0.265313 2.75207e-08 0.592593 6.14692e-08L10.0741 1.04498e-06C10.4014 1.07893e-06 10.6667 0.279823 10.6667 0.625002C10.6667 0.97018 10.4014 1.25 10.0741 1.25L0.592593 1.25C0.265313 1.25 -7.14825e-08 0.970179 -4.60499e-08 0.625001Z" fill="#454545"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M-4.60499e-08 5C-2.06172e-08 4.65482 0.265313 4.375 0.592593 4.375L10.0741 4.375C10.4014 4.375 10.6667 4.65482 10.6667 5C10.6667 5.34518 10.4014 5.625 10.0741 5.625L0.592593 5.625C0.265313 5.625 -7.14825e-08 5.34518 -4.60499e-08 5Z" fill="#454545"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M-4.60499e-08 9.375C-2.06172e-08 9.02982 0.265313 8.75 0.592593 8.75L10.0741 8.75C10.4014 8.75 10.6667 9.02982 10.6667 9.375C10.6667 9.72018 10.4014 10 10.0741 10L0.592593 10C0.265313 10 -7.14825e-08 9.72018 -4.60499e-08 9.375Z" fill="#454545"/>
          </svg>
        </div>
        <h1 className='admin-head_title inter16-600'>
          Номенклатуры и категории
        </h1>

        <div className='admin-nom_to-links'>
          <span className='inter12-600'>К существующим связям</span>
          <div className='admin-nom_to-links-icon'>
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.20819 4.25007L0.75 4.24992M6.58341 7.75006C6.58341 7.75006 10.0834 5.01863 10.0834 4.25004C10.0834 3.48144 6.58338 0.750061 6.58338 0.750061" stroke="#3D3D3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div className='admin-nom_head'>
        <span className='admin-nom_head-info inter13-600'>
          Выберете номенклатуру чтобы назначить подкатегорию
        </span>
        <div className='admin-nom_head-set'>
          <span className='admin-nom_head-set-label inter13-400'>
            Показывать только не назначенные
          </span>
        </div>
        <div className='admin-cat_search admin-nom_search'>
          <input 
            type='text' 
            className='admin-nom_search-input inter13-400'
            placeholder='Номенклатура'
          />
          <div className='admin-cat_search-icon'>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M5.51154 0C8.55548 0 11.0231 2.45216 11.0231 5.47704C11.0231 6.72692 10.4875 8.0036 9.77837 8.92532L13.5068 12.628C13.772 12.9112 13.8356 13.2507 13.6213 13.536C13.4069 13.8213 12.8967 13.8213 12.5818 13.5362L8.85245 9.83351C7.92555 10.5365 6.76761 10.9541 5.51154 10.9541C2.4676 10.9541 0 8.50193 0 5.47704C0 2.45216 2.4676 0 5.51154 0ZM5.51041 1.16522C3.02688 1.16522 1.14258 3.00742 1.14258 5.47703C1.14258 7.94664 2.82896 9.8335 5.51041 9.8335C8.19186 9.8335 9.95609 8.03044 9.95609 5.47703C9.95609 2.92362 7.99395 1.16522 5.51041 1.16522Z" fill="#727271"/>
            </svg>
          </div>
        </div>
      </div>

      <div className='admin-nom_content'>
        <div className='admin-nom_table inter13-400'>
          <div className='admin-nom_row admin-nom_table-head'>
            <div className='admin-nom_cell'>Код</div>
            <div className='admin-nom_cell'>Номенклатура</div>
            <div className='admin-nom_cell'>Подкатегория</div>
            <div className='admin-nom_cell admin-nom_cell-acts'>Действия</div>
          </div>
          <div className='admin-nom_table-content'>
            {nomenclatures.map(nom => (
              <div className='admin-nom_row admin-nom_row-content'>
                <div className='admin-nom_cell'>{nom.code}</div>
                <div className='admin-nom_cell'>{nom.title}</div>
                <div className='admin-nom_cell'>
                  {nom.categories.length > 0 ? nom.categories.join(', ') : '- нет'}
                </div>
                <div className='admin-nom_cell admin-nom_cell-actslinks inter11-600'>
                  <div className='admin-nom_table-link admin-nom_table-link-childs grey-btn'>
                    К дочерним номенклатурам
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.20819 4.25007L0.75 4.24992M6.58341 7.75006C6.58341 7.75006 10.0834 5.01863 10.0834 4.25004C10.0834 3.48144 6.58338 0.750061 6.58338 0.750061" stroke="#3D3D3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <button 
                    className='admin-nom_table-link admin-nom_table-link-subcat accent-btn'
                    onClick={() => {setIsModalOpen(true); setSelectedNom(nom)}}
                  >
                    Назначить подкатегорию
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && selectedNom && (
        <NomenclaturesModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} selectedNom={selectedNom} />
      )}
    </div>
  )
}

export default AdminNomenclatures;