import React from 'react';
import { Link } from 'react-router-dom';
import type { Nomenclature } from '../../features/admin/nomenclaturesSlice';

interface NomenclaturesListProps {
  nomenclatures: Nomenclature[];
  onSelectNom: (nom: Nomenclature) => void;
  showChildButton?: boolean;
}

const NomenclaturesList: React.FC<NomenclaturesListProps> = ({ 
  nomenclatures, 
  onSelectNom,
  showChildButton = true 
}) => {
  return (
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
            <div className='admin-nom_row admin-nom_row-content' key={nom.id}>
              <div className='admin-nom_cell'>{nom.code}</div>
              <div className='admin-nom_cell'>{nom.title}</div>
              <div className='admin-nom_cell'>
                {nom.categories.length > 0 ? (
                  <div className="admin-nom_categories">
                    {nom.categories.map((cat, index) => (
                      <React.Fragment key={cat.id}>
                        <span className="category-tag">
                          {cat.title}
                        </span>
                        {index < nom.categories.length - 1 && ', '}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <span className="admin-nom_categories__empty">- нет</span>
                )}
              </div>
              <div className='admin-nom_cell admin-nom_cell-actslinks inter11-600'>
                {showChildButton && (
                  <Link to={`/admin/nomenclatures/${nom.id}`} className='admin-nom_table-link admin-nom_table-link-childs grey-btn'>
                    К дочерним номенклатурам
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.20819 4.25007L0.75 4.24992M6.58341 7.75006C6.58341 7.75006 10.0834 5.01863 10.0834 4.25004C10.0834 3.48144 6.58338 0.750061 6.58338 0.750061" stroke="#3D3D3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </Link>
                )}
                <button 
                  className='admin-nom_table-link admin-nom_table-link-subcat accent-btn'
                  onClick={() => onSelectNom(nom)}
                >
                  Назначить подкатегорию
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NomenclaturesList;