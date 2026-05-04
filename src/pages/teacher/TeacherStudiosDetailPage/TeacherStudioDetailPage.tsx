/**
 * Детальная страница студии для преподавателя.
 * 
 * Принципиально использует только schedule-эндпоинты - не зависит от
 * admin-сервиса при чтении. Данные о студии берутся из локального
 * кеша Schedule Service (synced from Admin via events).
 * 
 * Разрешённые табы для препода: расписание, кабинеты (read-only).
 * Settings (управление студией) недоступны - это админская функция.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import type { Studio } from '@/api/admin/types';
import StudioTabs from '@/pages/admin/StudioDetailPage/StudioTabs';
import ClassroomsTab from '@/pages/admin/StudioDetailPage/ClassroomsTab/ClassroomsTab';
import ScheduleTab from '@/pages/admin/StudioDetailPage/ScheduleTab/ScheduleTab';
import '@/pages/admin/StudioDetailPage/studioDetailPage.css';

type TabType = 'classrooms' | 'schedule';

const TeacherStudioDetailPage = () => {
  const { studioId } = useParams<{ studioId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    accessibleStudios,
    isLoadingMembership,
    loadAccessibleStudios,
  } = useSchedule();
  
  const [error, setError] = useState<string | null>(null);
  
  const activeTab = (searchParams.get('tab') as TabType) || 'classrooms';
  const availableTabs: TabType[] = ['classrooms', 'schedule'];
  
  // Загружаем список доступных студий, если ещё не загружен.
  useEffect(() => {
    if (accessibleStudios.length === 0) {
      loadAccessibleStudios();
    }
  }, [accessibleStudios.length, loadAccessibleStudios]);
  
  // Находим запрошенную студию в списке доступных.
  // Если её там нет - значит у preпода нет доступа.
  const numericStudioId = studioId ? parseInt(studioId, 10) : NaN;
  const scheduleStudio = accessibleStudios.find((s) => s.id === numericStudioId);
  
  useEffect(() => {
    if (!studioId) {
      navigate('/teacher/studios');
      return;
    }
    
    if (!isLoadingMembership && accessibleStudios.length > 0 && !scheduleStudio) {
      setError('У вас нет доступа к этой студии');
    } else {
      setError(null);
    }
  }, [studioId, isLoadingMembership, accessibleStudios.length, scheduleStudio, navigate]);
  
  const handleTabChange = (tab: TabType) => {
    if (!availableTabs.includes(tab)) return;
    setSearchParams({ tab });
  };
  
  const handleBack = () => {
    navigate('/teacher/studios');
  };
  
  if (isLoadingMembership && !scheduleStudio) {
    return (
      <div className="studio-detail-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка студии...</p>
      </div>
    );
  }
  
  if (error || !scheduleStudio) {
    return (
      <div className="studio-detail-error">
        <h2>Ошибка</h2>
        <p>{error || 'Студия не найдена'}</p>
        <button onClick={handleBack} className="btn-primary">
          Вернуться к списку студий
        </button>
      </div>
    );
  }
  
  // Адаптируем ScheduleStudioInfo к типу Studio, который ждут таб-компоненты
  // (они написаны под admin-store). Полей хватает - имя, описание, адрес,
  // is_active, id. Остальные UI не трогает.
  const studioForTabs: Studio = {
    id: scheduleStudio.id,
    name: scheduleStudio.name,
    description: scheduleStudio.description,
    address: scheduleStudio.address,
    phone: scheduleStudio.phone,
    email: scheduleStudio.email,
    is_active: scheduleStudio.is_active,
    // Поля, которых нет в schedule-кеше - заполняем безопасными значениями.
    created_at: '',
    updated_at: '',
    classrooms_count: scheduleStudio.classrooms_count,
  } as Studio;
  
  return (
    <div className="studio-detail-page">
      <div className="studio-detail-header">
        <button onClick={handleBack} className="back-button">
          Назад к студиям
        </button>
        <h1>{scheduleStudio.name}</h1>
        {scheduleStudio.address && (
          <p className="studio-address">{scheduleStudio.address}</p>
        )}
      </div>
      
      <StudioTabs
        activeTab={activeTab}
        availableTabs={availableTabs}
        onTabChange={handleTabChange}
      />
      
      <div className="studio-tab-content">
        {activeTab === 'classrooms' && (
          <ClassroomsTab
            studio={studioForTabs}
            isReadOnly={true}
            source="schedule"
          />
        )}
        {activeTab === 'schedule' && (
          <ScheduleTab studio={studioForTabs} isReadOnly={false} />
        )}
      </div>
    </div>
  );
};

export default TeacherStudioDetailPage;