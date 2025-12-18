/**
 * ScheduleTab - вкладка расписания студии
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import { useAppDispatch } from '@/store/hooks';
import { fetchStudioClassrooms } from '@/modules/admin/store';
import type { Studio } from '@/api/admin/types';
import PatternsList from './PatternsList';
import ScheduleCalendar from './ScheduleCalendar';
import CreatePatternModal from './CreatePatternModal';
import './scheduleTab.css';

interface ScheduleTabProps {
  studio: Studio;
  isReadOnly?: boolean; // Для преподавателей
}

const ScheduleTab = ({ studio, isReadOnly = false }: ScheduleTabProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const {
    patterns,
    lessons,
    isLoadingPatterns,
    isLoadingSchedule,
    error,
    successMessage,
    loadRecurringPatterns,
    loadStudioSchedule,
    handleClearError,
    handleClearSuccess,
    filters,
  } = useSchedule();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeView, setActiveView] = useState<'patterns' | 'calendar'>('patterns');
  
  useEffect(() => {
    // Загружаем шаблоны студии
    loadRecurringPatterns(studio.id);
    
    // Загружаем расписание на текущую неделю
    loadStudioSchedule(studio.id, filters.fromDate, filters.toDate);
    
    // Загружаем кабинеты студии для модального окна создания шаблона
    dispatch(fetchStudioClassrooms(studio.id));
  }, [studio.id, filters.fromDate, filters.toDate, dispatch]);
  
  const handleCreatePattern = () => {
    setShowCreateModal(true);
  };
  
  const handleRefresh = () => {
    loadRecurringPatterns(studio.id);
    loadStudioSchedule(studio.id, filters.fromDate, filters.toDate);
  };
  
  if (isLoadingPatterns && patterns.length === 0) {
    return (
      <div className="schedule-tab">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка расписания...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="schedule-tab">
      {/* Header */}
      <div className="schedule-header">
        <div className="header-info">
          <h2>Расписание студии</h2>
          <p className="studio-info">
            {studio.name} • Шаблонов: {patterns.length} • Занятий: {lessons.length}
          </p>
        </div>
        <div className="header-actions">
          <button onClick={handleRefresh} className="btn-secondary">
            🔄 Обновить
          </button>
          {!isReadOnly && (
            <button onClick={handleCreatePattern} className="btn-primary">
              + Создать шаблон
            </button>
          )}
        </div>
      </div>
      
      {/* Messages */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={handleClearError} className="close-button">×</button>
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          {successMessage}
          <button onClick={handleClearSuccess} className="close-button">×</button>
        </div>
      )}
      
      {/* View Switcher */}
      <div className="view-switcher">
        <button
          className={`view-button ${activeView === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveView('patterns')}
        >
          📋 Шаблоны
        </button>
        <button
          className={`view-button ${activeView === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveView('calendar')}
        >
          📅 Календарь
        </button>
      </div>
      
      {/* Content */}
      <div className="schedule-content">
        {activeView === 'patterns' ? (
          <PatternsList 
            patterns={patterns} 
            studioId={studio.id}
            isReadOnly={isReadOnly}
          />
        ) : (
          <ScheduleCalendar 
            lessons={lessons}
            studioId={studio.id}
            isLoading={isLoadingSchedule}
            isReadOnly={isReadOnly}
          />
        )}
      </div>
      
      {/* Modals */}
      {showCreateModal && (
        <CreatePatternModal
          studioId={studio.id}
          teacherId={user?.id}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default ScheduleTab;