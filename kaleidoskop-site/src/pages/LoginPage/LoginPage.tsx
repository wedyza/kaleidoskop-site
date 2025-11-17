import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createOtp, validateOtp } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const step = useAppSelector((state) => state.auth.step);
  const loading = useAppSelector((state) => state.auth.loading);
  const token = useAppSelector((state) => state.auth.token);

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    dispatch(createOtp(email));
  };

  const handleValidateOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    dispatch(validateOtp({ email, otp: code }));
  };

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  return (
    <div>
      {step === 'email' && (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button onClick={handleRequestOtp} disabled={loading}>
            Получить код
          </button>
        </>
      )}
      {step === 'otp' && (
        <>
          <input
            type="text"
            placeholder="Код"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <button onClick={handleValidateOtp} disabled={loading}>
            Войти
          </button>
        </>
      )}
    </div>
  );
}

export default LoginPage;