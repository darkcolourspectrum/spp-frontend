/**
 * ProfileEdit - компонент редактирования профиля
 */

import { useState, useEffect, FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateMyProfile } from '@/modules/profile/store';
import type { ProfileUpdateRequest } from '@/api/profile/types';
import AvatarUpload from '../AvatarUpload';
import './profileEdit.css';

interface ProfileEditProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

const ProfileEdit = ({ onCancel, onSuccess }: ProfileEditProps) => {
  const dispatch = useAppDispatch();
  const { profile, isUpdating, error } = useAppSelector((state) => state.profile);
  const { user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Заполняем форму данными профиля
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (formData.first_name.trim().length < 2) {
      errors.first_name = 'Имя должно содержать минимум 2 символа';
    }
    
    if (formData.last_name.trim().length < 2) {
      errors.last_name = 'Фамилия должна содержать минимум 2 символа';
    }
    
    if (formData.phone && formData.phone.length > 0) {
      const phoneRegex = /^\+?[0-9\s\-\(\)]{10,20}$/;
      if (!phoneRegex.test(formData.phone)) {
        errors.phone = 'Некорректный номер телефона';
      }
    }
    
    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Биография не должна превышать 500 символов';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Очищаем ошибку поля при изменении
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Очищаем сообщения
    setSuccessMessage(null);
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Получаем userId из разных мест
    const userId = (profile as any)?.user_info?.id || user?.id;
    
    if (!userId) {
      setValidationErrors({ general: 'Не удалось определить пользователя' });
      return;
    }
    
    try {
      const updateData: ProfileUpdateRequest = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim() || undefined,
        bio: formData.bio.trim() || undefined,
      };
      

      await dispatch(updateMyProfile({ userId, data: updateData })).unwrap();
      
      setSuccessMessage('Профиль успешно обновлен!');
      
      // Вызываем callback успеха через 1.5 секунды
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <div className="profile-edit">
      <div className="profile-edit-header">
        <h2>Редактирование профиля</h2>
        <p className="profile-edit-subtitle">
          Обновите свою личную информацию
        </p>
      </div>
      
      {/* Загрузка аватара */}
      <div className="profile-edit-section">
        <h3 className="section-label">Фото профиля</h3>
        <AvatarUpload />
      </div>
      
      {/* Форма редактирования */}
      <form onSubmit={handleSubmit} className="profile-edit-form">
        <div className="profile-edit-section">
          <h3 className="section-label">Личная информация</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">Имя *</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                disabled={isUpdating}
                placeholder="Иван"
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
                disabled={isUpdating}
                placeholder="Иванов"
              />
              {validationErrors.last_name && (
                <span className="field-error">{validationErrors.last_name}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="profile-edit-section">
          <h3 className="section-label">Контактная информация</h3>
          
          <div className="form-group">
            <label htmlFor="phone">Телефон</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={isUpdating}
              placeholder="+7 (900) 123-45-67"
            />
            {validationErrors.phone && (
              <span className="field-error">{validationErrors.phone}</span>
            )}
          </div>
        </div>
        
        <div className="profile-edit-section">
          <h3 className="section-label">О себе</h3>
          
          <div className="form-group">
            <label htmlFor="bio">Биография</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={isUpdating}
              placeholder="Расскажите немного о себе..."
              rows={4}
              maxLength={500}
            />
            <div className="char-counter">
              {formData.bio.length}/500 символов
            </div>
            {validationErrors.bio && (
              <span className="field-error">{validationErrors.bio}</span>
            )}
          </div>
        </div>
        
        {/* Сообщения */}
        {successMessage && (
          <div className="profile-edit-success">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="profile-edit-error">
            {error}
          </div>
        )}
        
        {validationErrors.general && (
          <div className="profile-edit-error">
            {validationErrors.general}
          </div>
        )}
        
        {/* Кнопки действий */}
        <div className="profile-edit-actions">
          <button
            type="button"
            className="profile-button profile-button-secondary"
            onClick={handleCancel}
            disabled={isUpdating}
          >
            Отмена
          </button>
          
          <button
            type="submit"
            className="profile-button profile-button-primary"
            disabled={isUpdating}
          >
            {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;