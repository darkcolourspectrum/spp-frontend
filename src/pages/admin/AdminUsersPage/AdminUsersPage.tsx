import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { useAdmin } from '@/modules/admin/hooks/useAdmin';
import { fetchAllUsers, fetchAllStudios } from '@/modules/admin/store';
import { UsersFilters } from '@/modules/admin/components/UsersFilters';
import { UsersList } from '@/modules/admin/components/UsersList';
import { ChangeRoleModal } from '@/modules/admin/components/ChangeRoleModal';
import { AssignStudioModal } from '@/modules/admin/components/AssignStudioModal';
import { UserStatusModal } from '@/modules/admin/components/UserStatusModal';
import type { AdminUser } from '@/api/admin/types';
import './adminUsersPage.css';

const AdminUsersPage = () => {
  const dispatch = useAppDispatch();
  const {
    users,
    studios,
    filteredUsers,
    currentUserId,  // ← Добавлено
    isLoadingUsers,
    error,
    successMessage,
    handleClearError,
    handleClearSuccess,
  } = useAdmin();
  
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [showAssignStudioModal, setShowAssignStudioModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate'>('activate');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  
  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchAllStudios());
  }, [dispatch]);
  
  const handleRefresh = () => {
    dispatch(fetchAllUsers());
    dispatch(fetchAllStudios());
  };
  
  const handleChangeRole = (user: AdminUser) => {
    setSelectedUser(user);
    setShowChangeRoleModal(true);
  };
  
  const handleAssignStudio = (user: AdminUser) => {
    setSelectedUser(user);
    setShowAssignStudioModal(true);
  };
  
  const handleActivate = (user: AdminUser) => {
    setSelectedUser(user);
    setStatusAction('activate');
    setShowStatusModal(true);
  };
  
  const handleDeactivate = (user: AdminUser) => {
    setSelectedUser(user);
    setStatusAction('deactivate');
    setShowStatusModal(true);
  };
  
  const closeChangeRoleModal = () => {
    setShowChangeRoleModal(false);
    setSelectedUser(null);
  };
  
  const closeAssignStudioModal = () => {
    setShowAssignStudioModal(false);
    setSelectedUser(null);
  };
  
  const closeStatusModal = () => {
    setShowStatusModal(false);
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
        currentUserId={currentUserId!}  // ← Передаем ID текущего админа
        onChangeRole={handleChangeRole}
        onAssignStudio={handleAssignStudio}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
      />
      
      {showChangeRoleModal && selectedUser && (
        <ChangeRoleModal
          user={selectedUser}
          onClose={closeChangeRoleModal}
        />
      )}
      
      {showAssignStudioModal && selectedUser && (
        <AssignStudioModal
          user={selectedUser}
          onClose={closeAssignStudioModal}
        />
      )}
      
      {showStatusModal && selectedUser && (
        <UserStatusModal
          user={selectedUser}
          action={statusAction}
          onClose={closeStatusModal}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;