import { Link } from 'react-router-dom';
import './AdminCompilations.scss'
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCompilations } from '../../features/admin/adminCompilationsSlice';
import { formatToDDMMYYYY } from '../../utils/dateUtils';

const AdminCompilations = () => {
  const [search, setSearch] = useState('');

  const dispatch = useAppDispatch();
  const { compilations, loading } = useAppSelector(state => state.adminCompilations);

  useEffect(() => {
    dispatch(fetchCompilations());
  }, [dispatch]);

  const filteredCompilations = compilations.filter(compilation =>
    compilation.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className='admin-comp'>
      <div className='admin-head'>
        <div className='admin-head_icon'>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.63284 0.0313396C7.79347 0.157724 6.92367 0.650188 6.39308 1.3039C6.27131 1.45207 6.0756 1.77021 5.95818 2.00991C5.73638 2.46315 5.63635 2.80308 5.58851 3.30426L5.55807 3.60061H4.39688C3.18785 3.60061 2.93995 3.63111 2.37023 3.81851C1.48302 4.11486 0.639312 4.93854 0.265295 5.87117C-0.00434479 6.54667 4.2471e-06 6.41593 4.2471e-06 12.4998C4.2471e-06 18.3658 4.2471e-06 18.3571 0.20006 18.8365C0.391417 19.2984 0.756736 19.6819 1.16989 19.8606C1.65264 20.0741 2.42242 20.0349 2.98344 19.7734C3.13566 19.7037 4.09679 19.1764 5.12317 18.6055C6.91932 17.6031 6.9889 17.5682 7.2194 17.5682C7.4499 17.5682 7.52383 17.6075 9.35913 18.6273C10.4029 19.2112 11.3814 19.7342 11.5336 19.7996C12.3208 20.1221 13.1036 20.0524 13.6777 19.6122C13.8908 19.4509 14.1953 18.9759 14.3127 18.6142C14.4084 18.3222 14.4127 18.235 14.4344 16.5354L14.4605 14.7616L15.7435 15.4807C16.4654 15.8817 17.1482 16.2347 17.3092 16.287C17.9137 16.4744 18.5486 16.4308 18.9879 16.1737C19.4489 15.9035 19.8533 15.302 19.9621 14.7355C19.9969 14.5481 20.0056 12.879 19.9969 8.74314C19.9795 2.25832 20.0143 2.83794 19.6141 2.00991C19.2401 1.23853 18.753 0.750423 17.9833 0.375629C17.1743 -0.0165977 17.5179 0.00955009 12.9384 0.000833511C10.716 -0.00352478 8.77636 0.00955009 8.63284 0.0313396ZM16.7699 1.46951C17.631 1.6264 18.366 2.36291 18.5225 3.22581C18.5573 3.40449 18.5704 5.2436 18.5704 8.96104V14.4348L18.4573 14.6658C18.3834 14.8139 18.3007 14.9098 18.2268 14.9403C17.9615 15.0406 17.805 14.9708 16.1001 14.0164L14.4431 13.0881L14.4301 9.83702C14.4127 6.63383 14.4127 6.58153 14.317 6.27211C14.1213 5.62711 13.8734 5.18695 13.4429 4.72499C13.0167 4.25868 12.5122 3.95361 11.8424 3.74442L11.4597 3.62675L9.233 3.60932C7.4673 3.60061 7.00195 3.58317 7.00195 3.53959C7.00195 3.34348 7.11937 2.92075 7.2455 2.6549C7.51948 2.07528 8.14575 1.59153 8.76331 1.47386C9.08079 1.41285 16.4394 1.40849 16.7699 1.46951ZM11.3249 5.10414C12.173 5.32641 12.8166 6.01498 12.9558 6.85609C12.9906 7.06964 13.0036 8.70392 12.9949 12.6436L12.9819 18.1348L12.8862 18.3178C12.7731 18.5227 12.6166 18.5924 12.3382 18.5575C12.2295 18.5445 11.5641 18.2002 10.3377 17.5116C9.32868 16.9494 8.36755 16.4221 8.19793 16.3436C7.66735 16.0909 7.03239 16.0516 6.48007 16.239C6.34959 16.2826 5.36236 16.8099 4.2925 17.4114C3.09217 18.0781 2.25715 18.5183 2.12668 18.5488C1.83965 18.6185 1.67873 18.5532 1.55261 18.3135L1.45693 18.1348L1.44388 12.6436C1.43519 8.70392 1.44823 7.06964 1.48302 6.85609C1.61785 6.02806 2.2615 5.33076 3.09652 5.1085C3.44879 5.01262 10.9596 5.00827 11.3249 5.10414Z" fill="#161616"/>
          </svg>
        </div>
        <h1 className='admin-head_title inter16-600'>
          Подборки
        </h1>
        <Link to="/admin/compilations/create" className='inter12-600 admin-cat_add-subcat admin-cat_add-item admin-comp_add-btn'>
          <div className='admin-cat_add-icon'>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.41667 0.75V10.0833M0.75 5.41667H10.0833" stroke="#3D3D3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span>Подборка</span>
        </Link>
      </div>

      <div className='admin-nom_head admin-comp_head'>
        <div className='admin-nom_head-main admin-comp_head-main'>
          <span className='admin-nom_head-info inter13-600'>
            Выберете подборку чтобы редактировать или создайте новую
          </span>
        </div>
        <div className='admin-cat_search admin-nom_search'>
          <input 
            type='text' 
            className='admin-nom_search-input inter13-400'
            placeholder='Название подборки'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className='admin-cat_search-icon'>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M5.51154 0C8.55548 0 11.0231 2.45216 11.0231 5.47704C11.0231 6.72692 10.4875 8.0036 9.77837 8.92532L13.5068 12.628C13.772 12.9112 13.8356 13.2507 13.6213 13.536C13.4069 13.8213 12.8967 13.8213 12.5818 13.5362L8.85245 9.83351C7.92555 10.5365 6.76761 10.9541 5.51154 10.9541C2.4676 10.9541 0 8.50193 0 5.47704C0 2.45216 2.4676 0 5.51154 0ZM5.51041 1.16522C3.02688 1.16522 1.14258 3.00742 1.14258 5.47703C1.14258 7.94664 2.82896 9.8335 5.51041 9.8335C8.19186 9.8335 9.95609 8.03044 9.95609 5.47703C9.95609 2.92362 7.99395 1.16522 5.51041 1.16522Z" fill="#727271"/>
            </svg>
          </button>
        </div>
      </div>

      
      <div className='admin-nom_content'>
        <div className='admin-nom_table inter13-400'>
          <div className='admin-nom_row admin-nom_table-head admin-comp_row'>
            <div className='admin-nom_cell'>№</div>
            <div className='admin-nom_cell'>Название подборки</div>
            <div className='admin-nom_cell'>Дата начала</div>
            <div className='admin-nom_cell'>Дата конца</div>
            <div className='admin-nom_cell'>Кол-во товаров</div>
            <div className='admin-nom_cell'>Статус</div>
            <div className='admin-nom_cell'>Действия</div>
          </div>
          <div className='admin-nom_table-content'>
            {filteredCompilations.map((comp, index) => (
              <div className='admin-nom_row admin-nom_row-content admin-comp_row' key={comp.id}>
                <div className='admin-nom_cell'>{index + 1}</div>
                <div className='admin-nom_cell'>{comp.title}</div>
                <div className='admin-nom_cell'>
                  {comp.start_time ? formatToDDMMYYYY(comp.start_time) : '- без срока'}
                </div>
                <div className='admin-nom_cell'>
                  {comp.end_time ? formatToDDMMYYYY(comp.end_time) : '- без срока'}
                </div>
                <div className='admin-nom_cell'>{comp.item_count}</div>
                <div className='admin-nom_cell admin-comp_cell-status inter12-600'>
                  {comp.active ? 'Активна' : 'Отключена'}
                </div>
                <div className='admin-nom_cell'>
                  <Link to={`/admin/compilations/${comp.id}/edit`} className='admin-cat_table-cell inter12-600 admin-cat_table-act admin-comp_table-act'>
                    <span>Редактировать</span>
                    <div className='admin-cat_table-act_img'>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.6757 1.85104L8.19095 1.33579C8.972 0.554738 10.2383 0.554738 11.0194 1.33579C11.8004 2.11683 11.8004 3.38316 11.0194 4.16421L10.5041 4.67947M7.6757 1.85104L1.43661 8.09013C1.10453 8.42221 0.899906 8.86055 0.85858 9.32835L0.753531 10.5175C0.698759 11.1375 1.21763 11.6564 1.83765 11.6016L3.02681 11.4966C3.49462 11.4553 3.93296 11.2506 4.26504 10.9186L10.5041 4.67947M7.6757 1.85104L10.5041 4.67947" stroke="#4F4F4F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

export default AdminCompilations;