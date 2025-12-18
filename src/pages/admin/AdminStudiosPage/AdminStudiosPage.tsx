import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAllStudios,
  clearError,
  clearSuccessMessage,
} from '@/modules/admin/store';
import { getStudioDetailRoute } from '@/constants/routes';
import CreateStudioModal from '@/modules/admin/components/CreateStudioModal';
import './adminStudiosPage.css';

const AdminStudiosPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { studios, isLoadingStudios, error, successMessage } = useAppSelector(
    (state) => state.admin
  );
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  useEffect(() => {
    dispatch(fetchAllStudios());
  }, [dispatch]);
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);
  
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearSuccessMessage()), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);
  
  const handleOpenStudio = (studioId: number) => {
    navigate(getStudioDetailRoute(studioId));
  };
  
  return (
    <div className="admin-studios-page">
      <div className="page-header">
        <h1>Управление студиями</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + Создать студию
        </button>
      </div>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}
      
      {isLoadingStudios ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка студий...</p>
        </div>
      ) : studios.length === 0 ? (
        <div className="empty-state">
          <p>Студий пока нет</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Создать первую студию
          </button>
        </div>
      ) : (
        <div className="studios-grid">
          {studios.map((studio) => (
            <div key={studio.id} className="studio-card">
              <div className="studio-header">
                <h3>{studio.name}</h3>
                <span
                  className={`status-badge ${
                    studio.is_active ? 'active' : 'inactive'
                  }`}
                >
                  {studio.is_active ? 'Активна' : 'Неактивна'}
                </span>
              </div>
              
              {studio.address && (
                <p className="studio-address"> {studio.address}</p>
              )}
              
              {studio.description && (
                <p className="studio-description">{studio.description}</p>
              )}
              
              <div className="studio-footer">
                <button
                  onClick={() => handleOpenStudio(studio.id)}
                  className="btn-primary btn-open"
                >
                  Открыть
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showCreateModal && (
        <CreateStudioModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default AdminStudiosPage;