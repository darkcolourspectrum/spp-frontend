/**
 * Страница студий преподавателя
 * Показывает только ту студию, к которой привязан преподаватель
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllStudios } from '@/modules/admin/store';
import { getStudioDetailRoute } from '@/constants/routes';
import './teacherStudiosPage.css';

const TeacherStudiosPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { studios, isLoadingStudios, error } = useAppSelector((state) => state.admin);
  
  // Фильтруем студии - показываем только ту, к которой привязан преподаватель
  const teacherStudios = studios.filter(studio => studio.id === user?.studio_id);
  
  useEffect(() => {
    dispatch(fetchAllStudios());
  }, [dispatch]);
  
  const handleOpenStudio = (studioId: number) => {
    navigate(getStudioDetailRoute(studioId));
  };
  
  if (isLoadingStudios) {
    return (
      <div className="teacher-studios-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка студий...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="teacher-studios-page">
        <div className="error-container">
          <h2>Ошибка загрузки</h2>
          <p>{error}</p>
          <button onClick={() => dispatch(fetchAllStudios())} className="btn-primary">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }
  
  if (!user?.studio_id) {
    return (
      <div className="teacher-studios-page">
        <div className="empty-state">
          <div className="empty-icon">🏫</div>
          <h2>Вы не привязаны к студии</h2>
          <p>Обратитесь к администратору для назначения студии</p>
        </div>
      </div>
    );
  }
  
  if (teacherStudios.length === 0) {
    return (
      <div className="teacher-studios-page">
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h2>Студия не найдена</h2>
          <p>Ваша студия (ID: {user.studio_id}) не найдена в системе</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="teacher-studios-page">
      <div className="page-header">
        <h1>Моя студия</h1>
        <p className="page-subtitle">Управление расписанием и кабинетами</p>
      </div>
      
      <div className="studios-grid">
        {teacherStudios.map((studio) => (
          <div key={studio.id} className="studio-card">
            <div className="studio-header">
              <h3>{studio.name}</h3>
              <span className={`status-badge ${studio.is_active ? 'active' : 'inactive'}`}>
                {studio.is_active ? 'Активна' : 'Неактивна'}
              </span>
            </div>
            
            {studio.address && (
              <p className="studio-address">📍 {studio.address}</p>
            )}
            
            {studio.description && (
              <p className="studio-description">{studio.description}</p>
            )}
            
            <div className="studio-stats">
              <div className="stat-item">
                <span className="stat-icon">👥</span>
                <div className="stat-content">
                  <span className="stat-value">{studio.students_count || 0}</span>
                  <span className="stat-label">Учеников</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">👨‍🏫</span>
                <div className="stat-content">
                  <span className="stat-value">{studio.teachers_count || 0}</span>
                  <span className="stat-label">Преподавателей</span>
                </div>
              </div>
            </div>
            
            <div className="studio-footer">
              <button
                onClick={() => handleOpenStudio(studio.id)}
                className="btn-primary btn-open"
              >
                Открыть студию
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherStudiosPage;