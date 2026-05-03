import { useAdmin } from '@/modules/admin/hooks/useAdmin';
import type { Studio } from '@/api/admin/types';
import './usersFilters.css';

interface UsersFiltersProps {
  studios: Studio[];
  onRefresh: () => void;
}

export const UsersFilters = ({ studios, onRefresh }: UsersFiltersProps) => {
  const {
    filters,
    filteredUsers,
    users,
    handleRoleFilterChange,
    handleStudioFilterChange,
    handleSearchQueryChange,
    handleResetFilters,
  } = useAdmin();
  
  return (
    <div className="users-filters">
      <div className="filters-row">
        <div className="filter-group">
          <label>Поиск</label>
          <input
            type="text"
            placeholder="Имя или email..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchQueryChange(e.target.value)}
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <label>Роль</label>
          <select
            value={filters.roleFilter}
            onChange={(e) => handleRoleFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="">Все роли</option>
            <option value="admin">Администратор</option>
            <option value="teacher">Преподаватель</option>
            <option value="student">Студент</option>
            <option value="guest">Гость</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Студия</label>
          <select
            value={filters.studioFilter}
            onChange={(e) => handleStudioFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="">Все студии</option>
            <option value="no_studio">Без студии</option>
            {studios.filter(s => s.is_active).map((studio) => (
              <option key={studio.id} value={studio.id}>
                {studio.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-actions">
          <button onClick={handleResetFilters} className="reset-button">
            Сбросить
          </button>
          <button onClick={onRefresh} className="refresh-button">
            🔄
          </button>
        </div>
      </div>
      
      <div className="filters-info">
        Показано: <strong>{filteredUsers.length}</strong> из <strong>{users.length}</strong>
      </div>
    </div>
  );
};