import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchStudioClassrooms } from '@/modules/admin/store';
import { getStudioById } from '@/api/admin';
import type { Studio } from '@/api/admin/types';
import StudioTabs from './StudioTabs';
import ClassroomsTab from './ClassroomsTab/ClassroomsTab';
import SettingsTab from './SettingsTab/SettingsTab';
import './studioDetailPage.css';

type TabType = 'classrooms' | 'settings';

const StudioDetailPage = () => {
  const { studioId } = useParams<{ studioId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [studio, setStudio] = useState<Studio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const activeTab = (searchParams.get('tab') as TabType) || 'classrooms';
  
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
  }, [studioId, dispatch, navigate, activeTab]);
  
  const handleTabChange = (tab: TabType) => {
    setSearchParams({ tab });
    
    // Загружаем кабинеты при переключении на таб кабинетов
    if (tab === 'classrooms' && studioId) {
      dispatch(fetchStudioClassrooms(parseInt(studioId)));
    }
  };
  
  const handleBack = () => {
    navigate('/admin/studios');
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
      <StudioTabs activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Tab Content */}
      <div className="studio-tab-content">
        {activeTab === 'classrooms' && <ClassroomsTab studio={studio} />}
        {activeTab === 'settings' && <SettingsTab studio={studio} />}
      </div>
    </div>
  );
};

export default StudioDetailPage;