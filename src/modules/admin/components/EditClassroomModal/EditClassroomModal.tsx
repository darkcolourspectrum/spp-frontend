import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateExistingClassroom } from '@/modules/admin/store';
import type { Classroom } from '@/api/admin/types';
import '../CreateClassroomModal/createClassroomModal.css';

interface EditClassroomModalProps {
  classroom: Classroom;
  onClose: () => void;
}

const EditClassroomModal = ({ classroom, onClose }: EditClassroomModalProps) => {
  const dispatch = useAppDispatch();
  const { isSubmitting } = useAppSelector((state) => state.admin);
  
  const [formData, setFormData] = useState({
    name: classroom.name,
    capacity: classroom.capacity,
    description: classroom.description || '',
    is_active: classroom.is_active,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' 
        ? parseInt(value) 
        : type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await dispatch(
      updateExistingClassroom({
        classroomId: classroom.id,
        data: formData,
      })
    );
    
    if (updateExistingClassroom.fulfilled.match(result)) {
      onClose();
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Редактировать кабинет</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Название кабинета *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="capacity">Вместимость *</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
              max="1000"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span>Кабинет активен</span>
            </label>
          </div>
          
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClassroomModal;