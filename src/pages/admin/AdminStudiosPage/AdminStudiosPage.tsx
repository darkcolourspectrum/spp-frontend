import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { useAdmin } from '@/modules/admin/hooks/useAdmin';
import { fetchAllStudios } from '@/modules/admin/store';
import { StudiosList } from '@/modules/admin/components/StudiosList';
import { StudioFormModal } from '@/modules/admin/components/StudioFormModal';
import { DeleteStudioModal } from '@/modules/admin/components/DeleteStudioModal';
import type { Studio } from '@/api/admin/types';
import './adminStudiosPage.css';

const AdminStudiosPage = () => {
  const dispatch = useAppDispatch();
  const {
    studios,
    isLoadingStudios,
    error,
    successMessage,
    handleClearError,
    handleClearSuccess,
  } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  
  useEffect(() => {
    dispatch(fetchAllStudios());
  }, [dispatch]);
  
  const handleRefresh = () => {
    dispatch(fetchAllStudios());
  };
  
  const handleCreateStudio = () => {
    setSelectedStudio(null);
    setShowFormModal(true);
  };
  
  const handleEditStudio = (studio: Studio) => {
    setSelectedStudio(studio);
    setShowFormModal(true);
  };
  
  const handleDeleteStudio = (studio: Studio) => {
    setSelectedStudio(studio);
    setShowDeleteModal(true);
  };
  
  const closeFormModal = () => {
    setShowFormModal(false);
    setSelectedStudio(null);
  };
  
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedStudio(null);
  };
  
  const filteredStudios = studios.filter((studio) => {
    const matchesSearch = 
      studio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (studio.address && studio.address.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesActiveFilter = !showActiveOnly || studio.is_active;
    
    return matchesSearch && matchesActiveFilter;
  });
  
  if (isLoadingStudios && studios.length === 0) {
    return (
      <div className="admin-studios-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка студий...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-studios-page">
      <div className="page-header">
        <div>
          <h1>Управление студиями</h1>
          <p className="page-subtitle">
            Всего студий: {studios.length} | Показано: {filteredStudios.length}
          </p>
        </div>
        <button onClick={handleCreateStudio} className="create-button">
          + Создать студию
        </button>
      </div>
      
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
      
      <div className="filters-section">
        <div className="search-group">
          <input
            type="text"
            placeholder="Поиск по названию или адресу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
            />
            <span>Только активные</span>
          </label>
          
          <button onClick={handleRefresh} className="refresh-button" title="Обновить">
            🔄
          </button>
        </div>
      </div>
      
      <StudiosList
        studios={filteredStudios}
        onEdit={handleEditStudio}
        onDelete={handleDeleteStudio}
      />
      
      {showFormModal && (
        <StudioFormModal
          studio={selectedStudio}
          onClose={closeFormModal}
        />
      )}
      
      {showDeleteModal && selectedStudio && (
        <DeleteStudioModal
          studio={selectedStudio}
          onClose={closeDeleteModal}
        />
      )}
    </div>
  );
};

export default AdminStudiosPage;