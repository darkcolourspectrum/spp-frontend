import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteExistingClassroom } from '@/modules/admin/store';
import type { Classroom } from '@/api/admin/types';
import '../CreateClassroomModal/createClassroomModal.css';

interface DeleteClassroomModalProps {
  classroom: Classroom;
  onClose: () => void;
}

const DeleteClassroomModal = ({ classroom, onClose }: DeleteClassroomModalProps) => {
  const dispatch = useAppDispatch();
  const { isSubmitting } = useAppSelector((state) => state.admin);
  
  const handleDelete = async () => {
    const result = await dispatch(deleteExistingClassroom(classroom.id));
    
    if (deleteExistingClassroom.fulfilled.match(result)) {
      onClose();
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Подтвердите удаление</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="modal-body">
          <p>
            Вы уверены что хотите удалить кабинет <strong>{classroom.name}</strong>?
          </p>
          <p className="warning-text">
            Это действие нельзя отменить.
          </p>
        </div>
        
        <div className="modal-actions">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={isSubmitting}
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
  );
};

export default DeleteClassroomModal;