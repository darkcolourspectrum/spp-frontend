/**
 * Компонент формы входа
 */

import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/modules/auth/store';
import { startVkAuth, isVkConfigured } from '@/lib/vkid/vkidClient';
import './login.css';
import '../vkAuth.css';

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { isLoading, error, loginAttempts } = useAppSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Проверка на блокировку по количеству попыток
    if (loginAttempts >= 5) {
      alert('Слишком много неудачных попыток. Попробуйте позже.');
      return;
    }
  
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      
      if (result) {
        // Перенаправляем в зависимости от роли
        const { getDefaultRouteForRole } = await import('@/constants/routes');
        navigate(getDefaultRouteForRole(result.user.role));
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };
  
  const handleVkLogin = async () => {
    try {
      // intent='login' — callback после возврата вызовет vkLogin.
      await startVkAuth('login');
      // startVkAuth редиректит на VK; код ниже не выполнится.
    } catch (err) {
      console.error('VK auth start error:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Вход в систему</h2>
        
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}
        
        {loginAttempts > 0 && loginAttempts < 5 && (
          <div className="login-warning">
            Неудачных попыток: {loginAttempts}/5
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="login-button"
            disabled={isLoading || loginAttempts >= 5}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form> 
        
        {isVkConfigured() && (
          <>
            <div className="login-divider">или</div>
            <button
              type="button"
              className="vk-auth-button"
              onClick={handleVkLogin}
              disabled={isLoading}
            >
              Войти через VK
            </button>
          </>
        )}

        <div className="login-footer">
          <p>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;