import { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import './LoginModal.scss'
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createOtp, validateOtp, changeEmail, validateChangeEmail } from "../../features/auth/authSlice";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'change-email'; // Режим работы модалки
  currentEmail?: string; // Текущая почта для режима смены
}

const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  mode = 'login',
  currentEmail = '' 
}) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(59);
  const [resendIndex, setResendIndex] = useState(0);
  const { step, changeEmailStep } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  // Определяем текущий шаг в зависимости от режима
  const currentStep = mode === 'login' ? step : 
    changeEmailStep === 'idle' ? 'email' : 
    changeEmailStep === 'requested' ? 'otp' : 'authenticated';

  console.log(currentStep);

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    if (mode === 'login') {
      dispatch(createOtp(email));
    } else {
      dispatch(changeEmail(email));
    }
  };
  
  const handleValidateOtp = () => {
    if (!code) return;
    
    if (mode === 'login') {
      dispatch(validateOtp({ email, otp: code }));
    } else {
      dispatch(validateChangeEmail({ email, otp: code }));
    }
  };

  useEffect(() => {
    if (mode === 'login' && step === 'authenticated') {
      setEmail('');
      setCode('');
      onClose();
    } else if (mode === 'change-email' && changeEmailStep === 'validated') {
      setEmail('');
      setCode('');
      onClose();
    }
  }, [step, changeEmailStep, mode, onClose]);

  useEffect(() => {
    if (code.length >= 6) {
      handleValidateOtp();
    }
  }, [code])

  useEffect(() => {
    if (currentStep !== "otp") return;

    setTimer(59);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStep, resendIndex]);

  const handleResend = () => {
    if (!email) return;
    
    if (mode === 'login') {
      dispatch(createOtp(email));
    } else {
      dispatch(changeEmail(email));
    }
    setResendIndex(prev => prev + 1);
  };

  const handleBack = () => {
    if (mode === 'login') {
      // Для логина сбрасываем шаг
      // dispatch(resetStep()); // если есть такой action
    } else {
      // Для смены почты сбрасываем состояние
      // dispatch(resetChangeEmailState()); // если есть такой action
    }
    setEmail('');
    setCode('');
  };

  // Заголовки в зависимости от режима
  const getTitles = () => {
    if (mode === 'login') {
      return {
        emailTitle: 'Вход или регистрация',
        otpTitle: 'Введите код',
        buttonText: 'Получить код'
      };
    } else {
      return {
        emailTitle: 'Смена почты',
        otpTitle: 'Подтвердите смену почты',
        buttonText: 'Продолжить'
      };
    }
  };

  const titles = getTitles();

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="login-modal">
      {currentStep === 'email' && (
        <>
          <h2 className="inter24-600">{titles.emailTitle}</h2>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            className="inter14-400 login-modal_email-input"
          />

          <button
            onClick={handleRequestOtp}
            className="inter14-400 login-modal_btn accent-btn"
          >
            {titles.buttonText}
          </button>
        </>
      )}

      {currentStep === 'otp' && (
        <>
          <div className="login-modal_header">
            <div className="login-modal_back" onClick={handleBack}>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.80514 0.407047C7.47763 -0.0376464 6.85163 -0.132638 6.40694 0.194877C6.06153 0.449269 5.73319 0.703715 5.44723 0.926886C4.87636 1.3724 4.11183 1.98572 3.34437 2.65208C2.58187 3.31412 1.79361 4.04815 1.18811 4.73344C0.886373 5.07494 0.608877 5.42789 0.401397 5.77206C0.210464 6.08878 3.93391e-06 6.52398 0 7.0001C3.93391e-06 7.47623 0.210464 7.91146 0.401397 8.22818C0.608877 8.57235 0.886373 8.9253 1.18811 9.2668C1.79361 9.95209 2.58187 10.6861 3.34437 11.3482C4.11183 12.0145 4.87636 12.6278 5.44723 13.0734C5.73319 13.2965 6.06153 13.551 6.40694 13.8054C6.85163 14.1329 7.47763 14.0379 7.80514 13.5932C7.9368 13.4144 8.00017 13.2064 8 13.0002V7.00012V1.00007C8.00017 0.793869 7.9368 0.585806 7.80514 0.407047Z" fill="black"/>
              </svg>
            </div>
            <h2 className="inter24-600">{titles.otpTitle}</h2>
          </div>

          <div className="login-modal_email-info">
            <span className="login-modal_email-info__label inter14-400">
              {mode === 'login' 
                ? 'Который мы отправили на ваш email:' 
                : 'Который мы отправили на новую почту:'}
            </span>
            <span className="login-modal_email-info__value inter16-600">
              {email}
            </span>
          </div>

          <div className="login-modal_code">
            <span className="login-modal_code-label inter12-400">
              Код
            </span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="inter14-400 login-modal_code-input"
            />
          </div>

          {timer > 0 ? (
            <div className="login-modal_repeat">
              <div className="login-modal_repeat-img">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4.41667C6 4.04848 6.29848 3.75 6.66667 3.75C7.03486 3.75 7.33333 4.04848 7.33333 4.41667C7.33333 4.78486 7.03486 5.08333 6.66667 5.08333C6.29848 5.08333 6 4.78486 6 4.41667ZM6 6.66667C6 6.29848 6.29848 6 6.66667 6C7.03486 6 7.33333 6.29848 7.33333 6.66667V9.33333C7.33333 9.70152 7.03486 10 6.66667 10C6.29848 10 6 9.70152 6 9.33333V6.66667ZM6.66 0C2.98 0 0 2.98667 0 6.66667C0 10.3467 2.98 13.3333 6.66 13.3333C10.3467 13.3333 13.3333 10.3467 13.3333 6.66667C13.3333 2.98667 10.3467 0 6.66 0ZM6.66667 12C3.72 12 1.33333 9.61333 1.33333 6.66667C1.33333 3.72 3.72 1.33333 6.66667 1.33333C9.61333 1.33333 12 3.72 12 6.66667C12 9.61333 9.61333 12 6.66667 12Z" fill="#B0B0B0"/>
                </svg>
              </div>
              <p className="login-modal_repeat-text inter14-400">
                Мы отправили код на ваш email. Получить новый можно через 00:{timer}
              </p>
            </div>
          ) : (
            <button 
              className="grey-btn inter14-600 login-modal_resend"
              onClick={handleResend}
            >
              Получить новый код
            </button>
          )}
        </>
      )}
    </Modal>
  );
};

export default LoginModal;