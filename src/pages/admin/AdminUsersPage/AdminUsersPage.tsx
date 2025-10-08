import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { useAdmin } from '@/modules/admin/hooks/useAdmin';
import { fetchAllUsers, fetchAllStudios } from '@/modules/admin/store';
import { UsersFilters } from '@/modules/admin/components/UsersFilters';
import { UsersList } from '@/modules/admin/components/UsersList';
import { AssignTeacherModal } from '@/modules/admin/components/AssignTeacherModal';
import { ChangeRoleModal } from '@/modules/admin/components/ChangeRoleModal';
import type { AdminUser } from '@/api/admin/types';
import './adminUsersPage.css';

const AdminUsersPage = () => {
  const dispatch = useAppDispatch();
  const {
    users,
    studios,
    filteredUsers,
    isLoadingUsers,
    error,
    successMessage,
    handleClearError,
    handleClearSuccess,
  } = useAdmin();
  
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  
  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchAllStudios());
  }, [dispatch]);
  
  const handleRefresh = () => {
    dispatch(fetchAllUsers());
    dispatch(fetchAllStudios());
  };
  
  const handleAssignTeacher = (user: AdminUser) => {
    setSelectedUser(user);
    setShowAssignTeacherModal(true);
  };
  
  const handleChangeRole = (user: AdminUser) => {
    setSelectedUser(user);
    setShowChangeRoleModal(true);
  };
  
  const closeModals = () => {
    setShowAssignTeacherModal(false);
    setShowChangeRoleModal(false);
    setSelectedUser(null);
  };
  
  if (isLoadingUsers && users.length === 0) {
    return (
      <div className="admin-users-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка пользователей...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-users-page">
      <div className="page-header">
        <h1>Управление пользователями</h1>
        <p className="page-subtitle">Всего пользователей: {users.length}</p>
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
      
      <UsersFilters 
        studios={studios}
        onRefresh={handleRefresh}
      />
      
      <UsersList
        users={filteredUsers}
        totalUsers={users.length}
        onAssignTeacher={handleAssignTeacher}
        onChangeRole={handleChangeRole}
      />
      
      {showAssignTeacherModal && selectedUser && (
        <AssignTeacherModal
          user={selectedUser}
          studios={studios}
          onClose={closeModals}
        />
      )}
      
      {showChangeRoleModal && selectedUser && (
        <ChangeRoleModal
          user={selectedUser}
          onClose={closeModals}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;