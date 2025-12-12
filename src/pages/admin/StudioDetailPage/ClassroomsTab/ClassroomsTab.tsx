import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import type { Studio, Classroom } from '@/api/admin/types';
import CreateClassroomModal from '@/modules/admin/components/CreateClassroomModal';
import EditClassroomModal from '@/modules/admin/components/EditClassroomModal';
import DeleteClassroomModal from '@/modules/admin/components/DeleteClassroomModal';
import './classroomsTab.css';

interface ClassroomsTabProps {
  studio: Studio;
}

const ClassroomsTab = ({ studio }: ClassroomsTabProps) => {
  const { classrooms, isLoadingClassrooms } = useAppSelector((state) => state.admin);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [deletingClassroom, setDeletingClassroom] = useState<Classroom | null>(null);
  
  const handleCreate = () => {
    setShowCreateModal(true);
  };
  
  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
  };
  
  const handleDelete = (classroom: Classroom) => {
    setDeletingClassroom(classroom);
  };
  
  if (isLoadingClassrooms) {
    return (
      <div className="classrooms-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка кабинетов...</p>
      </div>
    );
  }
  
  return (
    <div className="classrooms-tab">
      <div className="classrooms-header">
        <h2>Кабинеты студии</h2>
        <button onClick={handleCreate} className="btn-primary">
          + Добавить кабинет
        </button>
      </div>
      
      {classrooms.length === 0 ? (
        <div className="no-classrooms">
          <p>В этой студии пока нет кабинетов</p>
          <button onClick={handleCreate} className="btn-primary">
            Создать первый кабинет
          </button>
        </div>
      ) : (
        <div className="classrooms-list">
          {classrooms.map((classroom) => (
            <div key={classroom.id} className="classroom-card">
              <div className="classroom-info">
                <h3>{classroom.name}</h3>
                <p className="classroom-capacity">
                  Вместимость: {classroom.capacity} человек
                </p>
                {classroom.description && (
                  <p className="classroom-description">{classroom.description}</p>
                )}
                <span className={`classroom-status ${classroom.is_active ? 'active' : 'inactive'}`}>
                  {classroom.is_active ? 'Активен' : 'Неактивен'}
                </span>
              </div>
              <div className="classroom-actions">
                <button
                  onClick={() => handleEdit(classroom)}
                  className="action-button edit"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(classroom)}
                  className="action-button delete"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modals */}
      {showCreateModal && (
        <CreateClassroomModal
          studioId={studio.id}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      
      {editingClassroom && (
        <EditClassroomModal
          classroom={editingClassroom}
          onClose={() => setEditingClassroom(null)}
        />
      )}
      
      {deletingClassroom && (
        <DeleteClassroomModal
          classroom={deletingClassroom}
          onClose={() => setDeletingClassroom(null)}
        />
      )}
    </div>
  );
};

export default ClassroomsTab;