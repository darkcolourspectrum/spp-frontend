import type { AdminUser } from '@/api/admin/types';
import { formatDate, getRoleDisplayName, getRoleColor, getUserInitials } from '@/utils/helpers';
import './usersList.css';

interface UsersListProps {
  users: AdminUser[];
  totalUsers: number;
  onChangeRole: (user: AdminUser) => void;
}

export const UsersList = ({ users, onChangeRole }: UsersListProps) => {
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
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {getUserInitials(user.first_name, user.last_name)}
                    </div>
                    <span className="user-name">{user.full_name}</span>
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
                <td>{user.studio_name || '—'}</td>
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
                      title="Изменить роль"
                    >
                      🔄
                    </button>
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