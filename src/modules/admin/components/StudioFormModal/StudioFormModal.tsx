import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { createNewStudio, updateExistingStudio } from '@/modules/admin/store';
import type { Studio, CreateStudioRequest, UpdateStudioRequest } from '@/api/admin/types';
import './studioFormModal.css';

interface StudioFormModalProps {
  studio?: Studio | null;
  onClose: () => void;
}

export const StudioFormModal = ({ studio, onClose }: StudioFormModalProps) => {
  const dispatch = useAppDispatch();
  const isEditMode = !!studio;
  
  const [formData, setFormData] = useState({
    name: studio?.name || '',
    description: studio?.description || '',
    address: studio?.address || '',
    phone: studio?.phone || '',
    email: studio?.email || '',
    is_active: studio?.is_active ?? true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (studio) {
      setFormData({
        name: studio.name || '',
        description: studio.description || '',
        address: studio.address || '',
        phone: studio.phone || '',
        email: studio.email || '',
        is_active: studio.is_active,
      });
    }
  }, [studio]);
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    if (formData.phone && !/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Некорректный телефон';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isEditMode && studio) {
        const updateData: UpdateStudioRequest = {
          name: formData.name.trim() || undefined,
          description: formData.description.trim() || undefined,
          address: formData.address.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          is_active: formData.is_active,
        };
        
        await dispatch(updateExistingStudio({ id: studio.id, data: updateData })).unwrap();
      } else {
        const createData: CreateStudioRequest = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          address: formData.address.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
        };
        
        await dispatch(createNewStudio(createData)).unwrap();
      }
      
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении студии:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content studio-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Редактировать студию' : 'Создать студию'}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="studio-form">
          <div className="form-group">
            <label htmlFor="name">
              Название <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Введите название студии"
              disabled={isSubmitting}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Краткое описание студии"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Адрес</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Адрес студии"
              disabled={isSubmitting}
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
                className={errors.phone ? 'error' : ''}
                placeholder="+7 (999) 123-45-67"
                disabled={isSubmitting}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="studio@example.com"
                disabled={isSubmitting}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>
          
          {isEditMode && (
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <span>Студия активна</span>
              </label>
            </div>
          )}
          
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="button secondary"
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="button primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : isEditMode ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};