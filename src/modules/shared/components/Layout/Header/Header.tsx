import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchMyProfile } from '@/modules/profile/store';
import { ROUTES } from '@/constants/routes';
import { getUserInitials } from '@/utils/helpers';
import './header.css';

const Header = () => {
  const dispatch = useAppDispatch();
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const { profile } = useAppSelector((state) => state.profile);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLogout = async () => {
    await logout();
  };
  
  const getProfileRoute = () => {
    if (isStudent()) {
      return ROUTES.STUDENT.PROFILE;
    }
    if (isTeacher()) {
      return ROUTES.TEACHER.PROFILE;
    }
    return ROUTES.PROFILE;
  };
  
  const getNavigationLinks = () => {
    if (isAdmin()) {
      return [
        { label: 'Dashboard', path: ROUTES.ADMIN.DASHBOARD },
        { label: 'Пользователи', path: ROUTES.ADMIN.USERS },
        { label: 'Студии', path: ROUTES.ADMIN.STUDIOS },
        { label: 'Статистика', path: ROUTES.ADMIN.STATISTICS },
      ];
    }
    
    if (isTeacher()) {
      return [
        { label: 'Моя студия', path: ROUTES.TEACHER.STUDIOS },
        { label: 'Расписание', path: ROUTES.TEACHER.SCHEDULE },
        { label: 'Студенты', path: ROUTES.TEACHER.STUDENTS },
      ];
    }
    
    if (isStudent()) {
      return [
        { label: 'Расписание', path: ROUTES.STUDENT.SCHEDULE },
      ];
    }
    
    return [];
  };
  
  const navigationLinks = getNavigationLinks();
  
  // Загружаем профиль при монтировании компонента
  useEffect(() => {
    if (!profile && user?.id) {
      dispatch(fetchMyProfile(user.id));
    }
  }, [dispatch, profile, user]);
  
  // Получаем информацию о пользователе
  const userInfo = (profile as any)?.user_info || {};
  const avatarUrl = (profile as any)?.avatar_url;
  const displayName = `${userInfo.first_name || user?.first_name || ''} ${userInfo.last_name || user?.last_name || ''}`.trim();
  const userInitials = getUserInitials(
    userInfo.first_name || user?.first_name,
    userInfo.last_name || user?.last_name
  );
  
  return (
    <header className="header">
      <div className="header-container">
        <Link to={ROUTES.HOME} className="header-logo">
          <span className="logo-icon"></span>
          <span className="logo-text">SPP</span>
        </Link>
        
        <nav className="header-nav">
          {navigationLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="nav-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        <div className="header-profile" ref={dropdownRef}>
          <button
            className="profile-button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="profile-avatar">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={displayName}
                  className="profile-avatar-image"
                  onError={(e) => {
                    // При ошибке загрузки показываем инициалы
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.classList.add('show-initials');
                    }
                  }}
                />
              ) : null}
              <span className={`profile-avatar-initials ${!avatarUrl ? 'visible' : ''}`}>
                {userInitials}
              </span>
            </div>
            <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>
              ▼
            </span>
          </button>
          
          {dropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  <div className="dropdown-avatar">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={displayName}
                        className="dropdown-avatar-image"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.classList.add('show-initials');
                          }
                        }}
                      />
                    ) : null}
                    <span className={`dropdown-avatar-initials ${!avatarUrl ? 'visible' : ''}`}>
                      {userInitials}
                    </span>
                  </div>
                  <div className="dropdown-details">
                    <div className="dropdown-name">
                      {displayName || 'Пользователь'}
                    </div>
                    <div className="dropdown-email">{user?.email}</div>
                  </div>
                </div>
              </div>
              
              <div className="dropdown-divider" />
              
              <Link
                to={getProfileRoute()}
                className="dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <span className="dropdown-item-icon"></span>
                Мой профиль
              </Link>
              
              <div className="dropdown-divider" />
              
              <button
                className="dropdown-item dropdown-item-logout"
                onClick={handleLogout}
              >
                <span className="dropdown-item-icon"></span>
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;