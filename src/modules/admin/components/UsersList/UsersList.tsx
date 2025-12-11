import type { AdminUser } from '@/api/admin/types';
import { formatDate, getRoleDisplayName, getRoleColor, getUserInitials } from '@/utils/helpers';
import './usersList.css';

interface UsersListProps {
  users: AdminUser[];
  totalUsers: number;
  currentUserId: number;  // ← ID текущего админа
  onChangeRole: (user: AdminUser) => void;
  onAssignStudio: (user: AdminUser) => void;
  onActivate: (user: AdminUser) => void;
  onDeactivate: (user: AdminUser) => void;
}

export const UsersList = ({ 
  users, 
  currentUserId,
  onChangeRole, 
  onAssignStudio,
  onActivate,
  onDeactivate 
}: UsersListProps) => {
  
  // Проверка: это текущий админ?
  const isCurrentUser = (user: AdminUser) => user.id === currentUserId;
  
  // Проверка: это админ?
  const isAdmin = (user: AdminUser) => user.role === 'admin';
  
  // Кнопки для смены роли и деактивации недоступны для админов
  const canChangeRole = (user: AdminUser) => !isAdmin(user);
  const canDeactivate = (user: AdminUser) => !isAdmin(user);
  
  // Привязка к студии: других админов нельзя, себя можно
  const canAssignStudio = (user: AdminUser) => {
    if (isCurrentUser(user)) return true;  // Себя можно
    return !isAdmin(user);  // Других админов нельзя
  };
  
  return (
    <div className="users-list">
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Пользователь</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Студия</th>
            <th>Статус</th>
            <th>Регистрация</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={8} className="empty-state">
                Пользователи не найдены
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className={isCurrentUser(user) ? 'current-user-row' : ''}>
                <td>{user.id}</td>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {getUserInitials(user.first_name, user.last_name)}
                    </div>
                    <div className="user-name-container">
                      <span className="user-name">{user.full_name}</span>
                      {isCurrentUser(user) && (
                        <span className="current-user-badge">Это вы</span>
                      )}
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span 
                    className="role-badge"
                    style={{ backgroundColor: getRoleColor(user.role) }}
                  >
                    {getRoleDisplayName(user.role)}
                  </span>
                </td>
                <td>
                  <div className="studio-cell">
                    {user.studio_name || (
                      <span className="no-studio">Не назначена</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                <td>{formatDate(user.created_at)}</td>
                <td>
                  <div className="actions-cell">
                    <button
                      onClick={() => onChangeRole(user)}
                      className="action-button primary"
                      title={canChangeRole(user) ? "Изменить роль" : "Нельзя менять роль админа"}
                      disabled={!canChangeRole(user)}
                    >
                      🔄
                    </button>
                    <button
                      onClick={() => onAssignStudio(user)}
                      className="action-button secondary"
                      title={canAssignStudio(user) ? "Привязать к студии" : "Нельзя перепривязывать админа"}
                      disabled={!canAssignStudio(user)}
                    >
                      🏢
                    </button>
                    {user.is_active ? (
                      <button
                        onClick={() => onDeactivate(user)}
                        className="action-button danger"
                        title={canDeactivate(user) ? "Деактивировать" : "Нельзя деактивировать админа"}
                        disabled={!canDeactivate(user)}
                      >
                        ⛔
                      </button>
                    ) : (
                      <button
                        onClick={() => onActivate(user)}
                        className="action-button success"
                        title="Активировать"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};