import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import OrderSummary from '../../components/OrderSummary/OrderSummary';
import './MakeOrderPage.scss'
import { fetchBasket } from '../../features/basket/basketSlice';
import { updateUserInfo } from '../../features/user/userSlice';

const MakeOrderPage = () => {
  const { items, selectedIds } = useAppSelector((state) => state.basket);
  const { user, loading } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  
  const [editableField, setEditableField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    phone_number: '',
    first_name: '',
    last_name: ''
  });

  useEffect(() => {
    dispatch(fetchBasket());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        phone_number: user.phone_number || '',
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      });
    }
  }, [user]);

  const selectedItems = items.filter(item => 
    selectedIds.includes(parseInt(item.id))
  );

  const handleEditClick = (fieldName: string) => {
    setEditableField(fieldName);
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleInputBlur = async (fieldName: string) => {
    setEditableField(null);
    
    const currentValue = formData[fieldName as keyof typeof formData];
    const originalValue = user?.[fieldName as keyof typeof user] || '';
    
    if (currentValue !== originalValue && currentValue.trim() !== '') {
      try {
        await dispatch(updateUserInfo({ [fieldName]: currentValue })).unwrap();
        console.log(`Поле ${fieldName} успешно обновлено`);
      } catch (error) {
        console.error('Ошибка при обновлении:', error);
        setFormData(prev => ({
          ...prev,
          [fieldName]: originalValue
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [fieldName]: originalValue
      }));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent, fieldName: string) => {
    if (e.key === 'Enter') {
      handleInputBlur(fieldName);
    }
    if (e.key === 'Escape') {
      setFormData(prev => ({
        ...prev,
        [fieldName]: user?.[fieldName as keyof typeof user] || ''
      }));
      setEditableField(null);
    }
  };

  const renderEditableField = (fieldName: string, placeholder: string = 'Не указано') => {
    const isEditing = editableField === fieldName;
    const value = formData[fieldName as keyof typeof formData];
    const displayValue = value || placeholder;

    return (
      <div className='makeorder-item'>
        <div className='profile-item_value'>
          {isEditing ? (
            <input
              type="text"
              className='profile-item_input inter16-400'
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              onBlur={() => handleInputBlur(fieldName)}
              onKeyDown={(e) => handleInputKeyDown(e, fieldName)}
              autoFocus
              disabled={loading}
            />
          ) : (
            <React.Fragment>
              <span className='profile-item_display inter16-400'>
                {displayValue}
              </span>
              <button 
                className='profile-item_edit'
                onClick={() => handleEditClick(fieldName)}
                type="button"
                disabled={loading}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.43349 2.3334L10.4311 1.33577C11.2122 0.554723 12.4785 0.554723 13.2595 1.33577L13.9666 2.04288C14.7477 2.82393 14.7477 4.09026 13.9666 4.87131L12.969 5.86893M9.43349 2.3334L1.50611 10.2608C1.17404 10.5928 0.969411 11.0312 0.928086 11.499L0.754518 13.4638C0.699746 14.0838 1.21862 14.6027 1.83864 14.5479L3.80343 14.3743C4.27123 14.333 4.70957 14.1284 5.04165 13.7963L12.969 5.86893M9.43349 2.3334L12.969 5.86893" stroke="#AAB0B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </React.Fragment>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='page-makeorder'>
      <h1 className='makeorder-title inter28-600'>
        Оформление заказа
      </h1>
      <div className="makeorder-content">
        <div className='makeorder-main'>
          <div className='makeorder_user-data makeorder-section'>
            <h2 className='makeorder_section-title inter18-600'>
              Данные покупателя
            </h2>
            <div className='makeorder_user-info'>
              <div className='makeorder_personal-info'>
                {renderEditableField('first_name', 'Не указано')}
              </div>
              <div className='makeorder_contacts'>
                {renderEditableField('phone_number', 'Не указан')}
              </div>
            </div>
          </div>

          <div className='makeorder_delivery makeorder-section'>
            <h2 className='makeorder_section-title inter18-600'>
              Способ получения
            </h2>

            <h2 className='makeorder_section-title inter18-600'>
              Дата и время
            </h2>

            <h2 className='makeorder_section-title inter18-600'>
              Услуги
            </h2>
          </div>
          
          <div className='makeorder_payment makeorder-section'>
            <h2 className='makeorder_section-title inter18-600'>
              Оплата
            </h2>
            <div className='makeorder_payment-list'>
              <div className='makeorder_payment-method makeorder_payment-method__active'>
                <div className='makeorder_payment-input'>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20.1818C7.5 20.1818 3.81818 16.5 3.81818 12C3.81818 7.5 7.5 3.81818 12 3.81818C16.5 3.81818 20.1818 7.5 20.1818 12C20.1818 16.5 16.5 20.1818 12 20.1818Z" fill="#EA5B21"/>
                    <circle cx="12" cy="12" r="5" fill="#DC451A"/>
                  </svg>
                </div>
                <span className='makeorder_payment-label inter16-400'>
                  В магазине
                </span>
              </div>
              <div className='makeorder_payment-method'>
                <div className='makeorder_payment-input'>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#E7E7E6"/>
                  </svg>
                </div>
                <span className='makeorder_payment-label inter16-400'>
                  Картой онлайн
                </span>
              </div>
              <div className='makeorder_payment-method'>
                <div className='makeorder_payment-input'>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#E7E7E6"/>
                  </svg>
                </div>
                <span className='makeorder_payment-label inter16-400'>
                  Через СБП
                </span>
              </div>
            </div>
          </div>
        </div>
        <OrderSummary variant={'checkout'} selectedItems={selectedItems} />
      </div>
    </div>
  )
}

export default MakeOrderPage;