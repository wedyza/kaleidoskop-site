import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { updateUserInfo } from '../../features/user/userSlice';
import './ProfilePage.scss';
import LoginModal from '../../components/LoginModal/LoginModal';

const ProfilePage = () => {
  const { user, loading } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const [editableField, setEditableField] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: '',
    email: '',
    first_name: '',
    last_name: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        phone_number: user.phone_number || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      });
    }
  }, [user]);

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

  const handleEmailEdit = () => {
    setIsEmailModalOpen(true);
  };

  const handleEmailModalClose = () => {
    setIsEmailModalOpen(false);
  };

  const renderEditableField = (fieldName: string, label: string, placeholder: string = 'Не указано') => {
    const isEditing = editableField === fieldName;
    const value = formData[fieldName as keyof typeof formData];
    const displayValue = value || placeholder;

    return (
      <div className='profile-item'>
        <span className='profile-item_label inter14-400'>
          {label}
        </span>
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

  const renderEmailField = () => {
    const value = formData.email;
    const displayValue = value || 'Не указана';

    return (
      <div className='profile-item'>
        <span className='profile-item_label inter14-400'>
          Почта
        </span>
        <div className='profile-item_value'>
          <span className='profile-item_display inter16-400'>
            {displayValue}
          </span>
          <button 
            className='profile-item_edit'
            onClick={handleEmailEdit}
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.43349 2.3334L10.4311 1.33577C11.2122 0.554723 12.4785 0.554723 13.2595 1.33577L13.9666 2.04288C14.7477 2.82393 14.7477 4.09026 13.9666 4.87131L12.969 5.86893M9.43349 2.3334L1.50611 10.2608C1.17404 10.5928 0.969411 11.0312 0.928086 11.499L0.754518 13.4638C0.699746 14.0838 1.21862 14.6027 1.83864 14.5479L3.80343 14.3743C4.27123 14.333 4.70957 14.1284 5.04165 13.7963L12.969 5.86893M9.43349 2.3334L12.969 5.86893" stroke="#AAB0B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className='page-profile'>
        <h1 className='inter28-600'>Личные данные</h1>
        
        <div className='profile-contacts'>
          {renderEditableField('phone_number', 'Номер телефона', 'Не указан')}
          {renderEmailField()}
        </div>
        
        <div className='profile-info'>
          {renderEditableField('first_name', 'Имя', 'Не указано')}
          {renderEditableField('last_name', 'Фамилия', 'Не указана')}
        </div>
      </div>

      {/* Модалка для смены почты */}
      <LoginModal
        isOpen={isEmailModalOpen}
        onClose={handleEmailModalClose}
        mode="change-email"
        currentEmail={user?.email}
      />
    </>
  );
};

export default ProfilePage;