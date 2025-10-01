/**
 * AvatarUpload - компонент загрузки и удаления аватара
 */

import { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { uploadAvatarFile, deleteAvatarFile } from '@/modules/profile/store';
import { getUserInitials } from '@/utils/helpers';
import './avatarUpload.css';

const AvatarUpload = () => {
  const dispatch = useAppDispatch();
  const { profile, isUploadingAvatar } = useAppSelector((state) => state.profile);
  const { user } = useAppSelector((state) => state.auth);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Валидация файла
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Поддерживаются только форматы: JPG, PNG, WEBP');
      return;
    }
    
    if (file.size > maxSize) {
      setUploadError('Размер файла не должен превышать 5 МБ');
      return;
    }
    
    setUploadError(null);
    
    // Создаем превью
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Загружаем на сервер
    try {
      await dispatch(uploadAvatarFile(file)).unwrap();
      setPreviewUrl(null);
    } catch (error) {
      setUploadError('Не удалось загрузить аватар');
      setPreviewUrl(null);
    }
    
    // Очищаем input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDeleteAvatar = async () => {
    if (window.confirm('Вы уверены, что хотите удалить аватар?')) {
      try {
        await dispatch(deleteAvatarFile()).unwrap();
        setPreviewUrl(null);
      } catch (error) {
        setUploadError('Не удалось удалить аватар');
      }
    }
  };
  
  const currentAvatarUrl = previewUrl || profile?.avatar_url;
  const hasAvatar = !!currentAvatarUrl;
  
  return (
    <div className="avatar-upload">
      <div className="avatar-upload-container">
        {/* Текущий аватар или placeholder */}
        <div className="avatar-preview">
          {currentAvatarUrl ? (
            <img 
              src={currentAvatarUrl} 
              alt="Avatar" 
              className="avatar-image"
            />
          ) : (
            <div className="avatar-placeholder">
              {getUserInitials(
                user?.first_name || profile?.first_name,
                user?.last_name || profile?.last_name
              )}
            </div>
          )}
          
          {isUploadingAvatar && (
            <div className="avatar-loading-overlay">
              <div className="spinner-small"></div>
            </div>
          )}
        </div>
        
        {/* Кнопки управления */}
        <div className="avatar-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          <button
            className="avatar-button avatar-button-primary"
            onClick={handleFileSelect}
            disabled={isUploadingAvatar}
          >
            {hasAvatar ? 'Изменить фото' : 'Загрузить фото'}
          </button>
          
          {hasAvatar && !isUploadingAvatar && (
            <button
              className="avatar-button avatar-button-danger"
              onClick={handleDeleteAvatar}
            >
              Удалить фото
            </button>
          )}
        </div>
      </div>
      
      {/* Информация о требованиях */}
      <div className="avatar-info">
        <p className="avatar-info-text">
          Поддерживаются форматы: JPG, PNG, WEBP
        </p>
        <p className="avatar-info-text">
          Максимальный размер: 5 МБ
        </p>
      </div>
      
      {/* Ошибка загрузки */}
      {uploadError && (
        <div className="avatar-error">
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;