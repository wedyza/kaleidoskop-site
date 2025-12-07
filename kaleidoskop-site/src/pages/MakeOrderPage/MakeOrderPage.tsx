import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import OrderSummary from '../../components/OrderSummary/OrderSummary';
import './MakeOrderPage.scss'
import { fetchBasket } from '../../features/basket/basketSlice';
import { updateUserInfo } from '../../features/user/userSlice';
import AddressPicker from '../../components/AddressPicker/AddressPicker';
import Modal from '../../components/Modal/Modal';
import { useNavigate } from 'react-router-dom';
import { clearCurrentOrder, createOrder } from '../../features/orders/ordersSlice';

export type DeliveryType = 'pickup' | 'courier';

const MakeOrderPage = () => {
  const { items, selectedIds } = useAppSelector((state) => state.basket);
  const { user, loading: userLoading } = useAppSelector(state => state.user);
  const { currentOrder } = useAppSelector(state => state.orders);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<DeliveryType>('pickup');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCoords, setDeliveryCoords] = useState<[number, number] | null>(null);
  const [addressDetails, setAddressDetails] = useState({
    apartment: '',
    entrance: '',
    floor: '',
    intercom: '',
  });
  const [selectedPayment, setSelectedPayment] = useState<'В магазине' | 'Картой онлайн' | 'Через СБП'>('В магазине');
  
  const [editableField, setEditableField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    phone_number: '',
    first_name: '',
    last_name: ''
  });

  useEffect(() => {
    dispatch(fetchBasket());
    dispatch(clearCurrentOrder());
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

  useEffect(() => {
    if (currentOrder) {
      navigate(`/orders`);
    }
  }, [currentOrder, navigate]);

  const selectedItems = items.filter(item => 
    selectedIds.includes(item.id)
  );

  const handleAddressChange = (address: string, coords: [number, number]) => {
    setDeliveryAddress(address);
    setDeliveryCoords(coords);
  };

  const handleCreateOrder = async () => {
    if (selectedItems.length === 0) {
      alert('Выберите товары для заказа');
      return;
    }

    if (activeTab === 'courier' && !deliveryAddress) {
      alert('Выберите адрес доставки');
      return;
    }

    try {
      await dispatch(createOrder({
        delivery_method: activeTab === 'courier' ? 'Доставка' : 'Самовывоз',
        payment_method: 'Наличными',
        addressString: activeTab === 'courier' ? deliveryAddress : undefined,
        addressDetails: activeTab === 'courier' ? addressDetails : undefined,
      })).unwrap();
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
    }
  };

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
              disabled={userLoading}
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
                disabled={userLoading}
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

  const handlePaymentSelect = (payment: 'В магазине' | 'Картой онлайн' | 'Через СБП') => {
    setSelectedPayment(payment);
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

            <div className='makeorder_del-type'>
              <button 
                className={`makeorder_del ${activeTab === 'pickup' ? 'makeorder_del__active' : ''}`}
                onClick={() => setActiveTab('pickup')}
              >
                <div className='makeover_del-icon'>
                  <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0C4.5 0 0 4.31461 0 9.58802C0 16.0599 8.75 23.3708 9.125 23.7303C9.625 24.0899 10.25 24.0899 10.75 23.7303C11.25 23.3708 20 16.0599 20 9.58802C20 4.31461 15.5 0 10 0ZM10 14.382C7.25 14.382 5 12.2247 5 9.58802C5 6.95131 7.25 4.79401 10 4.79401C12.75 4.79401 15 6.95131 15 9.58802C15 12.2247 12.75 14.382 10 14.382Z" fill="#727271"/>
                  </svg>
                </div>
                <div className='makeover_del-text'>
                  <span className='makeover_del-title inter16-600'>
                    Самовывоз
                  </span>
                  <span className='makeover_del-desc inter13-400'>
                    бесплатно
                  </span>
                </div>
              </button>
              <button 
                className={`makeorder_del ${activeTab === 'courier' ? 'makeorder_del__active' : ''}`}
                onClick={() => setActiveTab('courier')}
              >
                <div className='makeover_del-icon'>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8 15.75C7.30964 15.75 6.75 16.3096 6.75 17C6.75 17.6904 7.30964 18.25 8 18.25C8.69036 18.25 9.25 17.6904 9.25 17C9.25 16.3096 8.69036 15.75 8 15.75ZM5.25 17C5.25 15.4812 6.48122 14.25 8 14.25C9.51878 14.25 10.75 15.4812 10.75 17C10.75 18.5188 9.51878 19.75 8 19.75C6.48122 19.75 5.25 18.5188 5.25 17Z" fill="#727271"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M18 15.75C17.3096 15.75 16.75 16.3096 16.75 17C16.75 17.6904 17.3096 18.25 18 18.25C18.6904 18.25 19.25 17.6904 19.25 17C19.25 16.3096 18.6904 15.75 18 15.75ZM15.25 17C15.25 15.4812 16.4812 14.25 18 14.25C19.5188 14.25 20.75 15.4812 20.75 17C20.75 18.5188 19.5188 19.75 18 19.75C16.4812 19.75 15.25 18.5188 15.25 17Z" fill="#727271"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.25 6C0.25 5.58579 0.585786 5.25 1 5.25H14.4C15.1456 5.25 15.75 5.85442 15.75 6.6V17.75H10.05C9.63579 17.75 9.3 17.4142 9.3 17C9.3 16.5858 9.63579 16.25 10.05 16.25H14.25V6.75H1C0.585786 6.75 0.25 6.41421 0.25 6Z" fill="#727271"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M3 10.75C3.41421 10.75 3.75 11.0858 3.75 11.5V16.25H5.65C6.06421 16.25 6.4 16.5858 6.4 17C6.4 17.4142 6.06421 17.75 5.65 17.75H3.6C2.85442 17.75 2.25 17.1456 2.25 16.4V11.5C2.25 11.0858 2.58579 10.75 3 10.75Z" fill="#727271"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.25 9C1.25 8.58579 1.58579 8.25 2 8.25H6C6.41421 8.25 6.75 8.58579 6.75 9C6.75 9.41421 6.41421 9.75 6 9.75H2C1.58579 9.75 1.25 9.41421 1.25 9Z" fill="#727271"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.25 9C14.25 8.58579 14.5858 8.25 15 8.25H20.6101C21.1436 8.25 21.627 8.56419 21.8437 9.05171L23.6336 13.079C23.7104 13.2517 23.75 13.4384 23.75 13.6273V16.4C23.75 17.1456 23.1456 17.75 22.4 17.75H20.5C20.0858 17.75 19.75 17.4142 19.75 17C19.75 16.5858 20.0858 16.25 20.5 16.25H22.25V13.6592L20.5126 9.75H15C14.5858 9.75 14.25 9.41421 14.25 9Z" fill="#727271"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.25 17C14.25 16.5858 14.5858 16.25 15 16.25H16C16.4142 16.25 16.75 16.5858 16.75 17C16.75 17.4142 16.4142 17.75 16 17.75H15C14.5858 17.75 14.25 17.4142 14.25 17Z" fill="#727271"/>
                  </svg>
                </div>
                <div className='makeover_del-text'>
                  <span className='makeover_del-title inter16-600'>
                    Доставка
                  </span>
                  <span className='makeover_del-desc inter13-400'>
                    Ближайшая: Завтра
                  </span>
                </div>
              </button>
            </div>

            {activeTab === 'courier' ? (
              <div className='makeover_del-courier'>
                {deliveryAddress ? (
                  <div className="delivery-address-selected">
                    <span className="selected-address-value inter14-400">{deliveryAddress}</span>
                    <button 
                      className="change-address-btn inter14-600 grey-btn"
                      onClick={() => setShowAddressModal(true)}
                    >
                      Изменить адрес доставки
                    </button>
                  </div>
                ) : (
                  <button 
                    className="change-address-btn select-address-btn inter14-600 grey-btn"
                    onClick={() => setShowAddressModal(true)}
                  >
                    Выбрать адрес на карте
                  </button>
                )}
              </div>
            ) : (
              <div className='makeover_del-pickup'>
                {/* Контент для самовывоза */}
                <div className="pickup-info inter14-400">
                  Вы сможете забрать заказ в ближайшем магазине после подтверждения
                </div>
              </div>
            )}

            <Modal 
              isOpen={showAddressModal} 
              onClose={() => setShowAddressModal(false)}
              className="address-modal"
            >
              <div className="address-modal-content">
                <h3 className="modal-title inter18-600">Адрес доставки</h3>
                
                <AddressPicker 
                  value={deliveryAddress}
                  onChange={handleAddressChange}
                  addressDetails={addressDetails}
                  onDetailsChange={setAddressDetails}
                  isOpen={showAddressModal}
                  onSave={() => {
                    if (deliveryAddress && deliveryCoords) {
                      console.log('Выбран адрес:', deliveryAddress, deliveryCoords);
                      setShowAddressModal(false);
                    }
                  }}
                />
              </div>
            </Modal>
          </div>
          
          <div className='makeorder_payment makeorder-section'>
            <h2 className='makeorder_section-title inter18-600'>
              Оплата
            </h2>
            <div className='makeorder_payment-list'>
              <div 
                className={`makeorder_payment-method ${selectedPayment === 'В магазине' ? 'makeorder_payment-method__active' : ''}`}
                onClick={() => handlePaymentSelect('В магазине')}
              >
                <div className='makeorder_payment-input'>
                  {selectedPayment === 'В магазине' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20.1818C7.5 20.1818 3.81818 16.5 3.81818 12C3.81818 7.5 7.5 3.81818 12 3.81818C16.5 3.81818 20.1818 7.5 20.1818 12C20.1818 16.5 16.5 20.1818 12 20.1818Z" fill="#EA5B21"/>
                      <circle cx="12" cy="12" r="5" fill="#DC451A"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#E7E7E6"/>
                    </svg>
                  )}
                </div>
                <span className='makeorder_payment-label inter16-400'>
                  В магазине
                </span>
              </div>
              <div 
                className={`makeorder_payment-method ${selectedPayment === 'Картой онлайн' ? 'makeorder_payment-method__active' : ''}`}
                onClick={() => handlePaymentSelect('Картой онлайн')}
              >
                <div className='makeorder_payment-input'>
                  {selectedPayment === 'Картой онлайн' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20.1818C7.5 20.1818 3.81818 16.5 3.81818 12C3.81818 7.5 7.5 3.81818 12 3.81818C16.5 3.81818 20.1818 7.5 20.1818 12C20.1818 16.5 16.5 20.1818 12 20.1818Z" fill="#EA5B21"/>
                      <circle cx="12" cy="12" r="5" fill="#DC451A"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#E7E7E6"/>
                    </svg>
                  )}
                </div>
                <span className='makeorder_payment-label inter16-400'>
                  Картой онлайн
                </span>
              </div>
              <div 
                className={`makeorder_payment-method ${selectedPayment === 'Через СБП' ? 'makeorder_payment-method__active' : ''}`}
                onClick={() => handlePaymentSelect('Через СБП')}
              >
                <div className='makeorder_payment-input'>
                  {selectedPayment === 'Через СБП' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20.1818C7.5 20.1818 3.81818 16.5 3.81818 12C3.81818 7.5 7.5 3.81818 12 3.81818C16.5 3.81818 20.1818 7.5 20.1818 12C20.1818 16.5 16.5 20.1818 12 20.1818Z" fill="#EA5B21"/>
                      <circle cx="12" cy="12" r="5" fill="#DC451A"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#E7E7E6"/>
                    </svg>
                  )}
                </div>
                <span className='makeorder_payment-label inter16-400'>
                  Через СБП
                </span>
              </div>
            </div>
          </div>
        </div>
        <OrderSummary 
          variant={'checkout'} 
          selectedItems={selectedItems}
          onCreateOrder={handleCreateOrder}
        />
      </div>
    </div>
  )
}

export default MakeOrderPage;