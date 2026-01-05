import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { removeNotification } from '../../features/notifications/notificationsSlice';
import Notification from './Notification';

const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(state => state.notifications.notifications);

  return (
    <>
      {children}
      <div className="notification-container">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            title={notification.title}
            type={notification.type}
            duration={notification.duration}
            onClose={() => dispatch(removeNotification(notification.id))}
          />
        ))}
      </div>
    </>
  );
};

export default NotificationProvider;