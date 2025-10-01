/**
 * Компонент формы регистрации
 */

import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register } from '@/modules/auth/store';
import type { RegisterRequest } from '@/api/auth/types';
import './register.css';

const Register = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    privacy_policy_accepted: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Некорректный email адрес';
    }
    
    // Валидация пароля
    if (formData.password.length < 8) {
      errors.password = 'Пароль должен содержать минимум 8 символов';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }
    
    // Валидация имени и фамилии
    if (formData.first_name.trim().length < 2) {
      errors.first_name = 'Имя должно содержать минимум 2 символа';
    }
    
    if (formData.last_name.trim().length < 2) {
      errors.last_name = 'Фамилия должна содержать минимум 2 символа';
    }
    
    // Валидация телефона (опционально)
    if (formData.phone && formData.phone.length > 0) {
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
        errors.phone = 'Некорректный номер телефона';
      }
    }
    
    // Принятие политики
    if (!formData.privacy_policy_accepted) {
      errors.privacy = 'Необходимо принять политику конфиденциальности';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Очищаем ошибку поля при изменении
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const registerData: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
        privacy_policy_accepted: formData.privacy_policy_accepted,
      };
      
      const result = await dispatch(register(registerData)).unwrap();
      
      if (result) {
        // После регистрации пользователь получает роль student по умолчанию
        const { ROUTES } = await import('@/constants/routes');
        navigate(ROUTES.STUDENT.SCHEDULE);
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };
  
  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Регистрация</h2>
        
        {error && (
          <div className="register-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">Имя *</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Иван"
                required
                disabled={isLoading}
                autoComplete="given-name"
              />
              {validationErrors.first_name && (
                <span className="field-error">{validationErrors.first_name}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="last_name">Фамилия *</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Иванов"
                required
                disabled={isLoading}
                autoComplete="family-name"
              />
              {validationErrors.last_name && (
                <span className="field-error">{validationErrors.last_name}</span>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              disabled={isLoading}
              autoComplete="email"
            />
            {validationErrors.email && (
              <span className="field-error">{validationErrors.email}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Телефон</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 (900) 123-45-67"
              disabled={isLoading}
              autoComplete="tel"
            />
            {validationErrors.phone && (
              <span className="field-error">{validationErrors.phone}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль *</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Минимум 8 символов"
                required
                disabled={isLoading}
                autoComplete="new-password"
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
            {validationErrors.password && (
              <span className="field-error">{validationErrors.password}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Подтвердите пароль *</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Повторите пароль"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            {validationErrors.confirmPassword && (
              <span className="field-error">{validationErrors.confirmPassword}</span>
            )}
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="privacy_policy_accepted"
                checked={formData.privacy_policy_accepted}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>
                Я принимаю{' '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                  политику конфиденциальности
                </a>
              </span>
            </label>
            {validationErrors.privacy && (
              <span className="field-error">{validationErrors.privacy}</span>
            )}
          </div>
          
          <button
            type="submit"
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <div className="register-footer">
          <p>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;