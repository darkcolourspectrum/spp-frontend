import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createNewClassroom } from '@/modules/admin/store';
import './createClassroomModal.css';

interface CreateClassroomModalProps {
  studioId: number;
  onClose: () => void;
}

const CreateClassroomModal = ({ studioId, onClose }: CreateClassroomModalProps) => {
  const dispatch = useAppDispatch();
  const { isSubmitting } = useAppSelector((state) => state.admin);
  
  const [formData, setFormData] = useState({
    name: '',
    capacity: 10,
    description: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await dispatch(
      createNewClassroom({
        studioId,
        data: formData,
      })
    );
    
    if (createNewClassroom.fulfilled.match(result)) {
      onClose();
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Создать кабинет</h2>
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
              placeholder="Кабинет 101"
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
              placeholder="Описание кабинета (опционально)"
            />
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
              {isSubmitting ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassroomModal;