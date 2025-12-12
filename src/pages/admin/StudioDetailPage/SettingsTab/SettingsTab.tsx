import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateExistingStudio, deleteExistingStudio } from '@/modules/admin/store';
import type { Studio } from '@/api/admin/types';
import './settingsTab.css';

interface SettingsTabProps {
  studio: Studio;
}

const SettingsTab = ({ studio }: SettingsTabProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isSubmitting } = useAppSelector((state) => state.admin);
  
  const [formData, setFormData] = useState({
    name: studio.name,
    address: studio.address || '',
    description: studio.description || '',
    phone: studio.phone || '',
    email: studio.email || '',
    is_active: studio.is_active,
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await dispatch(
      updateExistingStudio({
        id: studio.id,
        data: formData,
      })
    );
    
    if (updateExistingStudio.fulfilled.match(result)) {
      // Обновляем локальное состояние студии
      // (или можно перезагрузить страницу)
    }
  };
  
  const handleDelete = async () => {
    const result = await dispatch(deleteExistingStudio(studio.id));
    
    if (deleteExistingStudio.fulfilled.match(result)) {
      navigate('/admin/studios');
    }
  };
  
  return (
    <div className="settings-tab">
      <h2>Настройки студии</h2>
      
      <form onSubmit={handleSubmit} className="studio-settings-form">
        <div className="form-group">
          <label htmlFor="name">Название студии *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Название студии"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Адрес *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Адрес студии"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Описание студии (опционально)"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Телефон</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 (999) 123-45-67"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="studio@example.com"
            />
          </div>
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            <span>Студия активна</span>
          </label>
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-danger"
            disabled={isSubmitting}
          >
            Удалить студию
          </button>
        </div>
      </form>
      
      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Подтвердите удаление</h3>
            <p>
              Вы уверены что хотите удалить студию <strong>{studio.name}</strong>?
              Это действие нельзя отменить.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;