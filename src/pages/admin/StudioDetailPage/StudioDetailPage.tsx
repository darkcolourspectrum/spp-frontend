import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import { fetchStudioClassrooms } from '@/modules/admin/store';
import { getStudioById } from '@/api/admin';
import type { Studio } from '@/api/admin/types';
import StudioTabs from './StudioTabs';
import ClassroomsTab from './ClassroomsTab/ClassroomsTab';
import ScheduleTab from './ScheduleTab/ScheduleTab';
import SettingsTab from './SettingsTab/SettingsTab';
import './studioDetailPage.css';

type TabType = 'classrooms' | 'schedule' | 'settings';

const StudioDetailPage = () => {
  const { studioId } = useParams<{ studioId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAdmin, isTeacher } = useAuth();
  
  const [studio, setStudio] = useState<Studio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const activeTab = (searchParams.get('tab') as TabType) || 'classrooms';
  
  // Определяем доступные табы в зависимости от роли
  const availableTabs: TabType[] = isAdmin()
    ? ['classrooms', 'schedule', 'settings']
    : ['classrooms', 'schedule']; // Для преподавателя
  
  useEffect(() => {
    const loadStudio = async () => {
      if (!studioId) {
        navigate('/admin/studios');
        return;
      }
      
      try {
        setIsLoading(true);
        const studioData = await getStudioById(parseInt(studioId));
        setStudio(studioData);
        
        // Проверяем доступ преподавателя к студии
        if (isTeacher() && user?.studio_id !== studioData.id) {
          setError('У вас нет доступа к этой студии');
          return;
        }
        
        // Загружаем кабинеты если активен таб с кабинетами
        if (activeTab === 'classrooms') {
          await dispatch(fetchStudioClassrooms(parseInt(studioId)));
        }
      } catch (err: any) {
        console.error('Failed to load studio:', err);
        setError(err.response?.data?.detail || 'Не удалось загрузить студию');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStudio();
  }, [studioId, dispatch, navigate, activeTab, isTeacher, user]);
  
  const handleTabChange = (tab: TabType) => {
    // Проверяем доступность таба
    if (!availableTabs.includes(tab)) {
      return;
    }
    
    setSearchParams({ tab });
    
    // Загружаем кабинеты при переключении на таб кабинетов
    if (tab === 'classrooms' && studioId) {
      dispatch(fetchStudioClassrooms(parseInt(studioId)));
    }
  };
  
  const handleBack = () => {
    if (isAdmin()) {
      navigate('/admin/studios');
    } else {
      // Для преподавателя - вернуться на свою страницу
      navigate('/teacher/studios');
    }
  };
  
  if (isLoading) {
    return (
      <div className="studio-detail-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка студии...</p>
      </div>
    );
  }
  
  if (error || !studio) {
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
  
  return (
    <div className="studio-detail-page">
      {/* Header */}
      <div className="studio-detail-header">
        <button onClick={handleBack} className="back-button">
          ← Назад к студиям
        </button>
        <h1>{studio.name}</h1>
        {studio.address && <p className="studio-address">{studio.address}</p>}
      </div>
      
      {/* Tabs */}
      <StudioTabs 
        activeTab={activeTab} 
        availableTabs={availableTabs}
        onTabChange={handleTabChange} 
      />
      
      {/* Tab Content */}
      <div className="studio-tab-content">
        {activeTab === 'classrooms' && (
          <ClassroomsTab 
            studio={studio} 
            isReadOnly={!isAdmin()} 
          />
        )}
        {activeTab === 'schedule' && (
          <ScheduleTab 
            studio={studio} 
            isReadOnly={!isAdmin()} 
          />
        )}
        {activeTab === 'settings' && isAdmin() && (
          <SettingsTab studio={studio} />
        )}
      </div>
    </div>
  );
};

export default StudioDetailPage;