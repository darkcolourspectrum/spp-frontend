/**
 * Header - главная шапка приложения
 * Навигация зависит от роли пользователя
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { ROUTES } from '@/constants/routes';
import { getUserInitials } from '@/utils/helpers';
import './header.css';

const Header = () => {
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Закрытие dropdown при клике вне его
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
        { label: 'Dashboard', path: ROUTES.TEACHER.SCHEDULE },
        { label: 'Расписание', path: ROUTES.TEACHER.SCHEDULE },
        { label: 'Студенты', path: ROUTES.TEACHER.STUDENTS },
        { label: 'Мой профиль', path: ROUTES.TEACHER.PROFILE },
      ];
    }
    
    if (isStudent()) {
      return [
        { label: 'Dashboard', path: ROUTES.STUDENT.SCHEDULE },
        { label: 'Расписание', path: ROUTES.STUDENT.SCHEDULE },
        { label: 'Мой профиль', path: ROUTES.STUDENT.PROFILE },
      ];
    }
    
    return [];
  };
  
  const navigationLinks = getNavigationLinks();
  
  return (
    <header className="header">
      <div className="header-container">
        {/* Логотип */}
        <Link to={ROUTES.HOME} className="header-logo">
          <span className="logo-icon">🎵</span>
          <span className="logo-text">SPP</span>
        </Link>
        
        {/* Навигация */}
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
        
        {/* Профиль пользователя */}
        <div className="header-profile" ref={dropdownRef}>
          <button
            className="profile-button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="profile-avatar">
              {getUserInitials(user?.first_name, user?.last_name)}
            </div>
            <span className="profile-name">
              {user?.first_name || 'Пользователь'}
            </span>
            <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>
              ▼
            </span>
          </button>
          
          {/* Dropdown меню */}
          {dropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  <div className="dropdown-avatar">
                    {getUserInitials(user?.first_name, user?.last_name)}
                  </div>
                  <div className="dropdown-details">
                    <div className="dropdown-name">
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div className="dropdown-email">{user?.email}</div>
                  </div>
                </div>
              </div>
              
              <div className="dropdown-divider" />
              
              <Link
                to={ROUTES.PROFILE}
                className="dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <span className="dropdown-item-icon">👤</span>
                Мой профиль
              </Link>
              
              <div className="dropdown-divider" />
              
              <button
                className="dropdown-item dropdown-item-logout"
                onClick={handleLogout}
              >
                <span className="dropdown-item-icon">🚪</span>
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