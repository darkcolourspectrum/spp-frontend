/**
 * ProfileView - компонент просмотра профиля
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyProfile } from '@/modules/profile/store';
import { getUserInitials, formatDate, getRoleDisplayName } from '@/utils/helpers';
import './profileView.css';

interface ProfileViewProps {
  onEdit?: () => void;
}

const ProfileView = ({ onEdit }: ProfileViewProps) => {
  const dispatch = useAppDispatch();
  const { profile, isLoading, error } = useAppSelector((state) => state.profile);
  
  useEffect(() => {
    if (!profile) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, profile]);
  
  if (isLoading && !profile) {
    return (
      <div className="profile-view-loading">
        <div className="spinner"></div>
        <p>Загрузка профиля...</p>
      </div>
    );
  }
  
  if (error && !profile) {
    return (
      <div className="profile-view-error">
        <h3>Ошибка загрузки профиля</h3>
        <p>{error}</p>
        <button onClick={() => dispatch(fetchMyProfile())}>
          Попробовать снова
        </button>
      </div>
    );
  }
  
  if (!profile) {
    return null;
  }
  
  return (
    <div className="profile-view">
      {/* Header секция */}
      <div className="profile-header">
        <div className="profile-avatar-section">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.full_name}
              className="profile-avatar-large"
            />
          ) : (
            <div className="profile-avatar-large profile-avatar-placeholder">
              {getUserInitials(profile.first_name, profile.last_name)}
            </div>
          )}
        </div>
        
        <div className="profile-header-info">
          <h1 className="profile-name">{profile.full_name}</h1>
          <div className="profile-meta">
            <span className="profile-role">{getRoleDisplayName(profile.role)}</span>
            {profile.studio_name && (
              <>
                <span className="profile-separator">•</span>
                <span className="profile-studio">{profile.studio_name}</span>
              </>
            )}
          </div>
          {profile.bio && (
            <p className="profile-bio">{profile.bio}</p>
          )}
          {onEdit && (
            <button className="profile-edit-button" onClick={onEdit}>
              Редактировать профиль
            </button>
          )}
        </div>
      </div>
      
      {/* Информация */}
      <div className="profile-content">
        <div className="profile-section">
          <h2 className="section-title">Контактная информация</h2>
          <div className="profile-info-grid">
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{profile.email}</span>
            </div>
            
            {profile.phone && (
              <div className="info-item">
                <span className="info-label">Телефон</span>
                <span className="info-value">{profile.phone}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-section">
          <h2 className="section-title">Информация об аккаунте</h2>
          <div className="profile-info-grid">
            <div className="info-item">
              <span className="info-label">Статус</span>
              <span className={`info-value status-badge ${profile.is_active ? 'active' : 'inactive'}`}>
                {profile.is_active ? 'Активен' : 'Неактивен'}
              </span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Верификация</span>
              <span className={`info-value status-badge ${profile.is_verified ? 'verified' : 'not-verified'}`}>
                {profile.is_verified ? 'Верифицирован' : 'Не верифицирован'}
              </span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Дата регистрации</span>
              <span className="info-value">{formatDate(profile.created_at)}</span>
            </div>
            
            {profile.last_login && (
              <div className="info-item">
                <span className="info-label">Последний вход</span>
                <span className="info-value">{formatDate(profile.last_login)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;