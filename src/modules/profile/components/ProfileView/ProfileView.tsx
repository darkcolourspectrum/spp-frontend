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
  const { user } = useAppSelector((state) => state.auth);
  
  useEffect(() => {
    if (!profile && user?.id) {
      dispatch(fetchMyProfile(user.id));
    }
  }, [dispatch, profile, user]);
  
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
        {user?.id && (
          <button onClick={() => dispatch(fetchMyProfile(user.id))}>
            Попробовать снова
          </button>
        )}
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="profile-view-loading">
        <p>Нет данных профиля</p>
      </div>
    );
  }
  
  const userInfo = (profile as any).user_info || {};
  const firstName = userInfo.first_name || '';
  const lastName = userInfo.last_name || '';
  const email = userInfo.email || '';
  const role = userInfo.role?.name || userInfo.role || 'student';
  const isActive = userInfo.is_active ?? true;
  const isVerified = userInfo.is_verified ?? false;
  const createdAt = userInfo.created_at || (profile as any).created_at;
  const lastLogin = userInfo.last_login;
  
  const fullName = `${firstName} ${lastName}`.trim();
  const displayName = fullName || (profile as any).display_name || 'Пользователь';
  const bio = (profile as any).bio;
  const avatarUrl = (profile as any).avatar_url;
  const phone = (profile as any).phone;
  
  const userInitials = getUserInitials(firstName, lastName);
  
  return (
    <div className="profile-view">
      <div className="profile-header">
        <div className="profile-avatar-section">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName}
              className="profile-avatar-large"
            />
          ) : (
            <div className="profile-avatar-large profile-avatar-placeholder">
              {userInitials}
            </div>
          )}
        </div>
        
        <div className="profile-header-info">
          <h1 className="profile-name">{displayName}</h1>
          <div className="profile-meta">
            <span className="profile-role">{getRoleDisplayName(role)}</span>
          </div>
          {bio && (
            <p className="profile-bio">{bio}</p>
          )}
          {onEdit && (
            <button className="profile-edit-button" onClick={onEdit}>
              Редактировать профиль
            </button>
          )}
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-section">
          <h2 className="section-title">Контактная информация</h2>
          <div className="profile-info-grid">
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{email || 'Не указан'}</span>
            </div>
            
            {phone && (
              <div className="info-item">
                <span className="info-label">Телефон</span>
                <span className="info-value">{phone}</span>
              </div>
            )}
            
            <div className="info-item">
              <span className="info-label">Имя</span>
              <span className="info-value">{firstName || 'Не указано'}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Фамилия</span>
              <span className="info-value">{lastName || 'Не указана'}</span>
            </div>
          </div>
        </div>
        
        <div className="profile-section">
          <h2 className="section-title">Информация об аккаунте</h2>
          <div className="profile-info-grid">
            <div className="info-item">
              <span className="info-label">Статус</span>
              <span className={`info-value status-badge ${isActive ? 'active' : 'inactive'}`}>
                {isActive ? 'Активен' : 'Неактивен'}
              </span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Верификация</span>
              <span className={`info-value status-badge ${isVerified ? 'verified' : 'not-verified'}`}>
                {isVerified ? 'Верифицирован' : 'Не верифицирован'}
              </span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Дата регистрации</span>
              <span className="info-value">{createdAt ? formatDate(createdAt) : 'Не указана'}</span>
            </div>
            
            {lastLogin && (
              <div className="info-item">
                <span className="info-label">Последний вход</span>
                <span className="info-value">{formatDate(lastLogin)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;