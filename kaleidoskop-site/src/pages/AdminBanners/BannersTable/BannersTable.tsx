import { useEffect, useState } from 'react';
import './BannersTable.scss'
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { deleteAdminBanner, fetchAdminFirstGroupBanners, fetchAdminSecondGroupBanners, toggleBannerStatus, uploadAdminFirstGroupBanner, uploadAdminSecondGroupBanner, type Banner } from '../../../features/admin/adminBannersSlice';
import { formatToDDMMYYYYHHMM } from '../../../utils/dateUtils';
import Toggle from '../../../components/ui/Toggle/Toggle';
import AddBannerModal from '../AddBannerModal/AddBannerModal';

interface BannersTableProps {
  group: 'first' | 'second';
}

const BannersTable = ({ group }: BannersTableProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const banners = useAppSelector(state => 
    group === 'first' ? state.adminBanners.firstGroup.items : state.adminBanners.secondGroup.items
  );

  useEffect(() => {
    if (group === 'first') {
      dispatch(fetchAdminFirstGroupBanners());
    } else {
      dispatch(fetchAdminSecondGroupBanners());
    }
  }, [dispatch, group]);

  const handleToggle = async (banner: Banner) => {
    const newStatus = !banner.active;
    
    try {
      await dispatch(toggleBannerStatus({ 
        id: banner.id, 
        active: newStatus 
      })).unwrap();
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteAdminBanner(id)).unwrap();
    } catch (error) {
      console.error('Ошибка при удалении баннера:', error);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      if (group === 'first') {
        await dispatch(uploadAdminFirstGroupBanner(file)).unwrap();
      } else {
        await dispatch(uploadAdminSecondGroupBanner(file)).unwrap();
      }
    } catch (error) {
      console.error('Ошибка при загрузке баннера:', error);
    }
  };

  return (
    <div className='admin-banners_block'>
      <div className='admin-banners_block-head'>
        <h2 className='inter14-600'>
          Баннер (<span className='services-page_text-accent'>1565x265px</span>). 
          {group === 'first' ? ' Первая карусель на главной странице' : ' Вторая карусель на главной странице'}
        </h2>
        <button 
          className='admin-banners_add-btn inter12-600'
          onClick={() => setIsModalOpen(true)}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.41667 0.75V10.0833M0.75 5.41667H10.0833" stroke="#3D3D3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Добавить баннер в карусель
        </button>
      </div>

      <div className='admin-banners_table inter13-400'>
        <div className='admin-banners_table-row admin-banners_table-head'>
          <div className='admin-banners_table-cell'>№ в карусели</div>
          <div className='admin-banners_table-cell'>Дата и время загрузки</div>
          <div className='admin-banners_table-cell'>Ссылка</div>
          <div className='admin-banners_table-cell'>Изображение</div>
          <div className='admin-banners_table-cell'>Статус</div>
          <div className='admin-banners_table-cell'>Действия</div>
        </div>
        <div className='admin-banners_table-content'>
          {banners.length > 0 ? (banners.map(banner => (
            <div className='admin-banners_table-row' key={banner.id}>
              <div className='admin-banners_table-cell'>{banner.queue}</div>
              <div className='admin-banners_table-cell'>{formatToDDMMYYYYHHMM(banner.created_at)}</div>
              <div className='admin-banners_table-cell'>- нет</div>
              <div className='admin-banners_table-cell'>картинка</div>
              <div className='admin-banners_table-cell'>
                <Toggle
                  isActive={banner.active}
                  onToggle={() => handleToggle(banner)}
                  activeText="Активный"
                  inactiveText="Отключен"
                />
              </div>
              <div className='admin-banners_table-cell admin-banners_actions'>
                <button 
                  className='admin-banners_action'
                  onClick={() => handleDelete(banner.id)}
                >
                  <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.2483 3.20972L11.8216 9.86696C11.7125 11.5679 11.658 12.4183 11.2159 13.0297C10.9973 13.332 10.7158 13.5871 10.3895 13.7789C9.72931 14.1667 8.84567 14.1667 7.07841 14.1667C5.30881 14.1667 4.42401 14.1667 3.76341 13.7782C3.43681 13.5861 3.15529 13.3305 2.93677 13.0277C2.49478 12.4153 2.44146 11.5636 2.33483 9.86036L1.91846 3.20972" stroke="#3D3D3C" stroke-width="1.25" stroke-linecap="round"/>
                    <path d="M0.885498 3.2097H13.2814M9.87645 3.2097L9.40632 2.27453C9.09403 1.65332 8.93788 1.34272 8.66853 1.149C8.60878 1.10603 8.54552 1.06781 8.47936 1.03471C8.1811 0.885498 7.82313 0.885498 7.10721 0.885498C6.37331 0.885498 6.00636 0.885498 5.70314 1.04097C5.63594 1.07542 5.57181 1.11519 5.51143 1.15987C5.23895 1.36143 5.08675 1.6834 4.78235 2.32734L4.36524 3.2097" stroke="#3D3D3C" stroke-width="1.25" stroke-linecap="round"/>
                    <path d="M5.36182 10.5143L5.36182 6.52999" stroke="#3D3D3C" stroke-width="1.25" stroke-linecap="round"/>
                    <path d="M8.80518 10.5144L8.80518 6.53003" stroke="#3D3D3C" stroke-width="1.25" stroke-linecap="round"/>
                  </svg>
                </button>
                <button className='admin-banners_action'>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.375 16.6666C4.375 16.3214 4.65482 16.0416 5 16.0416L15 16.0416C15.3452 16.0416 15.625 16.3214 15.625 16.6666C15.625 17.0118 15.3452 17.2916 15 17.2916L5 17.2916C4.65482 17.2916 4.375 17.0118 4.375 16.6666Z" fill="#3D3D3C"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.55822 2.89137C9.8023 2.64729 10.198 2.64729 10.4421 2.89137L13.3588 5.80804C13.6028 6.05212 13.6028 6.44784 13.3588 6.69192C13.1147 6.936 12.719 6.936 12.4749 6.69192L10.6252 4.8422V13.3333C10.6252 13.6785 10.3453 13.9583 10.0002 13.9583C9.65498 13.9583 9.37516 13.6785 9.37516 13.3333V4.8422L7.52544 6.69192C7.28136 6.936 6.88563 6.936 6.64155 6.69192C6.39748 6.44784 6.39748 6.05212 6.64155 5.80804L9.55822 2.89137Z" fill="#3D3D3C"/>
                  </svg>
                </button>
                <button className='admin-banners_action admin-banners_move'>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.75744 5.58585L0.63623 7.70706M0.63623 7.70706L2.75744 9.82827M0.63623 7.70706H14.7776M5.58573 2.75756L7.70694 0.636353M7.70694 0.636353L9.82815 2.75756M7.70694 0.636353V14.7778M9.82815 12.6566L7.70694 14.7778M7.70694 14.7778L5.58573 12.6566M12.6564 5.58585L14.7776 7.70706M14.7776 7.70706L12.6564 9.82827" stroke="#3D3D3C" stroke-width="1.27273" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))) : (
            <div className='admin-banners_empty'>
              <span className='inter14-600'>
                Пока нет баннеров
              </span>
              <span className='inter13-400'>
                Загружайте и редактируйте баннеры
              </span>
            </div>
          )}
        </div>
      </div>
      <AddBannerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUpload={handleUpload} />
    </div>
  );
};

export default BannersTable;