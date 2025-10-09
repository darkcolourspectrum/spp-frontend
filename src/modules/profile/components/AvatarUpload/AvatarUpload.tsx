/**
 * AvatarUpload - компонент загрузки и удаления аватара
 */

import { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { uploadAvatarFile, deleteAvatarFile, fetchMyProfile } from '@/modules/profile/store';
import { getUserInitials } from '@/utils/helpers';
import './avatarUpload.css';

const AvatarUpload = () => {
  const dispatch = useAppDispatch();
  const { profile, isUploadingAvatar } = useAppSelector((state) => state.profile);
  const { user } = useAppSelector((state) => state.auth);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const handleFileSelect = () => {
    setUploadError(null);
    setUploadSuccess(false);
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Поддерживаются только форматы: JPG, PNG, WEBP');
      return;
    }
    
    if (file.size > maxSize) {
      setUploadError('Размер файла не должен превышать 5 МБ');
      return;
    }
    
    if (!user?.id) {
      setUploadError('Пользователь не авторизован');
      return;
    }
    
    setUploadError(null);
    setUploadSuccess(false);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    try {
      await dispatch(uploadAvatarFile({ userId: user.id, file })).unwrap();
      
      await dispatch(fetchMyProfile(user.id));
      
      setPreviewUrl(null);
      setUploadSuccess(true);
      
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      setUploadError(error?.message || 'Не удалось загрузить аватар');
      setPreviewUrl(null);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDeleteAvatar = async () => {
    if (!user?.id) {
      setUploadError('Пользователь не авторизован');
      return;
    }
    
    if (!window.confirm('Вы уверены, что хотите удалить аватар?')) {
      return;
    }
    
    setUploadError(null);
    setUploadSuccess(false);
    
    try {
      await dispatch(deleteAvatarFile(user.id)).unwrap();
      
      await dispatch(fetchMyProfile(user.id));
      
      setPreviewUrl(null);
      setUploadSuccess(true);
      
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error: any) {
      console.error('Delete avatar error:', error);
      setUploadError(error?.message || 'Не удалось удалить аватар');
    }
  };
  
  const userInfo = (profile as any)?.user_info || {};
  const currentAvatarUrl = previewUrl || (profile as any)?.avatar_url;
  const hasAvatar = !!currentAvatarUrl;
  
  return (
    <div className="avatar-upload">
      <div className="avatar-upload-container">
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
                userInfo.first_name || user?.first_name,
                userInfo.last_name || user?.last_name
              )}
            </div>
          )}
          
          {isUploadingAvatar && (
            <div className="avatar-loading-overlay">
              <div className="spinner-small"></div>
            </div>
          )}
        </div>
        
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
              disabled={isUploadingAvatar}
            >
              Удалить фото
            </button>
          )}
        </div>
      </div>
      
      <div className="avatar-info">
        <p className="avatar-info-text">
          Поддерживаются форматы: JPG, PNG, WEBP
        </p>
        <p className="avatar-info-text">
          Максимальный размер: 5 МБ
        </p>
      </div>
      
      {uploadSuccess && (
        <div className="avatar-success">
          Аватар успешно обновлен
        </div>
      )}
      
      {uploadError && (
        <div className="avatar-error">
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;