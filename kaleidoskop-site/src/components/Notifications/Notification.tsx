import React, { useEffect, useState, useRef } from "react";
import "./Notification.scss";
import type { NotificationType } from "../../features/notifications/notificationsSlice.tsx";

interface NotificationProps {
  title: string;
  message: string;
  type: NotificationType;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  title,
  message,
  type,
  onClose,
  duration = 2000,
}) => {
  const [progress, setProgress] = useState(100);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    const animateProgress = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);

      setProgress(remaining);

      if (elapsed < duration) {
        animationRef.current = requestAnimationFrame(animateProgress);
      }
    };

    animationRef.current = requestAnimationFrame(animateProgress);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.46978 11.9697C6.76268 11.6768 7.23755 11.6768 7.53044 11.9697L10.0001 14.4393L16.4698 7.96967C16.7627 7.67678 17.2376 7.67678 17.5304 7.96967C17.8233 8.26256 17.8233 8.73744 17.5304 9.03033L10.5304 16.0303C10.2376 16.3232 9.76268 16.3232 9.46978 16.0303L6.46978 13.0303C6.17689 12.7374 6.17689 12.2626 6.46978 11.9697Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75ZM1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12Z"
              fill="black"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.64098 8.64124C8.93388 8.34835 9.40875 8.34835 9.70164 8.64124L11.9997 10.9393L14.2978 8.64124C14.5907 8.34835 15.0656 8.34835 15.3585 8.64124C15.6514 8.93414 15.6514 9.40901 15.3585 9.7019L13.0604 12L15.3585 14.2981C15.6514 14.591 15.6514 15.0659 15.3585 15.3588C15.0656 15.6517 14.5907 15.6517 14.2978 15.3588L11.9997 13.0607L9.70164 15.3588C9.40875 15.6517 8.93388 15.6517 8.64098 15.3588C8.34809 15.0659 8.34809 14.591 8.64098 14.2981L10.9391 12L8.64098 9.7019C8.34809 9.40901 8.34809 8.93414 8.64098 8.64124Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75ZM1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12Z"
              fill="black"
            />
          </svg>
        );
      case "info":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 5H11V7H9V5ZM9 9H11V15H9V9ZM10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18Z"
              fill="#212529"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.61617 3.64141C10.6736 1.80247 13.3268 1.80247 14.3841 3.64141L22.4271 17.6291C23.4813 19.4625 22.1579 21.7499 20.0431 21.7499H3.95721C1.84242 21.7499 0.519055 19.4625 1.57322 17.6291L9.61617 3.64141ZM13.0838 4.38912C12.6032 3.55324 11.3972 3.55324 10.9165 4.38912L2.87358 18.3769C2.39441 19.2102 2.99594 20.2499 3.95721 20.2499H20.0431C21.0044 20.2499 21.6059 19.2102 21.1267 18.3769L13.0838 4.38912Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 8.25C12.4142 8.25 12.75 8.58579 12.75 9V13C12.75 13.4142 12.4142 13.75 12 13.75C11.5858 13.75 11.25 13.4142 11.25 13V9C11.25 8.58579 11.5858 8.25 12 8.25Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.5117 16.4416C12.8196 16.7187 12.8446 17.1929 12.5675 17.5008L12.5575 17.5119C12.2804 17.8197 11.8062 17.8447 11.4983 17.5676C11.1904 17.2905 11.1654 16.8163 11.4425 16.5084L11.4525 16.4973C11.7296 16.1894 12.2038 16.1645 12.5117 16.4416Z"
              fill="black"
            />
          </svg>
        );
    }
  };

  const getClassName = () => {
    switch (type) {
      case "success":
        return "notification__success";
      case "error":
        return "notification__error";
      case "info":
        return "notification__info";
      case "warning":
        return "notification__warning";
    }
  };

  const getProgressBarColor = () => {
    switch (type) {
      case "success":
        return "notification-progress__success";
      case "error":
        return "notification-progress__error";
      case "info":
        return "notification-progress__info";
      case "warning":
        return "notification-progress__warning";
      default:
        return "";
    }
  };

  return (
    <div className={`notification ${getClassName()}`}>
      <div className="notification-icon">{getIcon()}</div>
      <div className="notification-text">
        <div className="notification-title inter18-700">{title}</div>
        <div className="notification-message inter16-400">{message}</div>
      </div>
      <button
        className="notification-close"
        onClick={onClose}
        aria-label="Закрыть"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
            fill="black"
            fillOpacity="0.4"
          />
        </svg>
      </button>

      <div className="notification-progress">
        <div className="notification-progress_bg"></div>
        <div
          className={`notification-progress_fill ${getProgressBarColor()}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Notification;
