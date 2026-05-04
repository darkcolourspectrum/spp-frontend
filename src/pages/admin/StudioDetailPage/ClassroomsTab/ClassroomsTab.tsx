import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useSchedule } from '@/modules/schedule/hooks/useSchedule';
import type { Studio, Classroom } from '@/api/admin/types';
import type { ScheduleClassroomInfo } from '@/api/schedule/types';
import CreateClassroomModal from '@/modules/admin/components/CreateClassroomModal';
import EditClassroomModal from '@/modules/admin/components/EditClassroomModal';
import DeleteClassroomModal from '@/modules/admin/components/DeleteClassroomModal';
import './classroomsTab.css';

// Унифицированный тип кабинета для презентации (нужные UI поля).
// Источник может быть admin-store (Classroom) или schedule-store
// (ScheduleClassroomInfo) - оба совместимы по этим полям.
interface ClassroomVM {
  id: number;
  studio_id: number;
  name: string;
  capacity: number;
  description: string | null;
  is_active: boolean;
}

interface ClassroomsTabProps {
  studio: Studio;
  isReadOnly?: boolean;
  // 'admin'    - читает classrooms из state.admin (для админа: write+read).
  // 'schedule' - читает studioClassrooms из state.schedule (для препода).
  // По умолчанию 'admin' для обратной совместимости.
  source?: 'admin' | 'schedule';
}

const ClassroomsTab = ({
  studio,
  isReadOnly = false,
  source = 'admin',
}: ClassroomsTabProps) => {
  const adminState = useAppSelector((state) => state.admin);
  const {
    studioClassrooms: scheduleClassrooms,
    isLoadingMembership,
    loadStudioClassroomsForSchedule,
  } = useSchedule();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [deletingClassroom, setDeletingClassroom] = useState<Classroom | null>(null);
  
  // Для preпода: подгружаем кабинеты студии из schedule-кеша при открытии таба.
  // Для админа: данные грузятся выше (StudioDetailPage делает fetchStudioClassrooms).
  useEffect(() => {
    if (source === 'schedule') {
      loadStudioClassroomsForSchedule(studio.id);
    }
  }, [source, studio.id, loadStudioClassroomsForSchedule]);
  
  // Унифицируем источник данных в один список ClassroomVM.
  const classrooms: ClassroomVM[] =
    source === 'schedule'
      ? (scheduleClassrooms as ScheduleClassroomInfo[]).map((c) => ({
          id: c.id,
          studio_id: c.studio_id,
          name: c.name,
          capacity: c.capacity,
          description: c.description,
          is_active: c.is_active,
        }))
      : (adminState.classrooms as Classroom[])
          .filter((c) => c.studio_id === studio.id)
          .map((c) => ({
            id: c.id,
            studio_id: c.studio_id,
            name: c.name,
            capacity: c.capacity,
            description: c.description,
            is_active: c.is_active,
          }));
  
  const isLoading =
    source === 'schedule'
      ? isLoadingMembership && classrooms.length === 0
      : adminState.isLoadingClassrooms;
  
  const handleCreate = () => {
    setShowCreateModal(true);
  };
  
  const handleEdit = (classroom: ClassroomVM) => {
    // Модалки edit/delete работают с admin-типом Classroom (включая поля
    // которых нет в ClassroomVM: equipment, floor, room_number и т.п.).
    // Достаём оригинальный объект из admin-store по id.
    const original = adminState.classrooms.find((c) => c.id === classroom.id);
    if (original) {
      setEditingClassroom(original);
    }
  };
  
  const handleDelete = (classroom: ClassroomVM) => {
    const original = adminState.classrooms.find((c) => c.id === classroom.id);
    if (original) {
      setDeletingClassroom(original);
    }
  };
  
  if (isLoading) {
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
        {!isReadOnly && (
          <button onClick={handleCreate} className="btn-primary">
            + Добавить кабинет
          </button>
        )}
      </div>
      
      {classrooms.length === 0 ? (
        <div className="no-classrooms">
          <p>В этой студии пока нет кабинетов</p>
          {!isReadOnly && (
            <button onClick={handleCreate} className="btn-primary">
              Создать первый кабинет
            </button>
          )}
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
                <span
                  className={`classroom-status ${
                    classroom.is_active ? 'active' : 'inactive'
                  }`}
                >
                  {classroom.is_active ? 'Активен' : 'Неактивен'}
                </span>
              </div>
              {!isReadOnly && (
                <div className="classroom-actions">
                  <button
                    onClick={() => handleEdit(classroom)}
                    className="action-button edit"
                    title="Редактировать"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(classroom)}
                    className="action-button delete"
                    title="Удалить"
                  >
                    Del
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Modals - только для админов */}
      {!isReadOnly && (
        <>
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
        </>
      )}
    </div>
  );
};

export default ClassroomsTab;