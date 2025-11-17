import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { registerUser, validateOtp } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const step = useAppSelector((state) => state.auth.step);
  const loading = useAppSelector((state) => state.auth.loading);
  const token = useAppSelector((state) => state.auth.token);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sex, setSex] = useState<'MALE' | 'FEMALE' | ''>('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !sex) return;
    dispatch(registerUser({ name, email, sex }));
  };

  const handleValidate = (e: React.FormEvent) => {
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
            type="text"
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Ваш email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div>
            <label>
              <input
                type="radio"
                name="gender"
                value="MALE"
                checked={sex === 'MALE'}
                onChange={() => setSex('MALE')}
              />
              Мужчина
            </label>

            <label>
              <input
                type="radio"
                name="gender"
                value="FEMALE"
                checked={sex === 'FEMALE'}
                onChange={() => setSex('FEMALE')}
              />
              Женщина
            </label>
          </div>

          <button onClick={handleRegister} disabled={loading}>
            Зарегистрироваться
          </button>
        </>
      )}

      {step === 'otp' && (
        <>
          <input
            type="text"
            placeholder="Код из письма"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <button onClick={handleValidate} disabled={loading}>
            Подтвердить
          </button>
        </>
      )}

      {step === 'authenticated' && (
        <div>Регистрация завершена</div>
      )}
    </div>
  );
}

export default RegisterPage;
