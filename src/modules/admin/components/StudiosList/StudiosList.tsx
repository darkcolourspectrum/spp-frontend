import type { Studio } from '@/api/admin/types';
import { formatDate } from '@/utils/helpers';
import './studiosList.css';

interface StudiosListProps {
  studios: Studio[];
  onEdit: (studio: Studio) => void;
  onDelete: (studio: Studio) => void;
}

export const StudiosList = ({ studios, onEdit, onDelete }: StudiosListProps) => {
  return (
    <div className="studios-list">
      <table className="studios-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Адрес</th>
            <th>Контакты</th>
            <th>Статус</th>
            <th>Создана</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {studios.length === 0 ? (
            <tr>
              <td colSpan={7} className="empty-state">
                Студии не найдены
              </td>
            </tr>
          ) : (
            studios.map((studio) => (
              <tr key={studio.id}>
                <td>{studio.id}</td>
                <td>
                  <div className="studio-name-cell">
                    <span className="studio-name">{studio.name}</span>
                    {studio.description && (
                      <span className="studio-description">{studio.description}</span>
                    )}
                  </div>
                </td>
                <td>{studio.address || '—'}</td>
                <td>
                  <div className="contacts-cell">
                    {studio.phone && <div className="contact-item">📞 {studio.phone}</div>}
                    {studio.email && <div className="contact-item">✉️ {studio.email}</div>}
                    {!studio.phone && !studio.email && '—'}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${studio.is_active ? 'active' : 'inactive'}`}>
                    {studio.is_active ? 'Активна' : 'Неактивна'}
                  </span>
                </td>
                <td>{formatDate(studio.created_at)}</td>
                <td>
                  <div className="actions-cell">
                    <button
                      onClick={() => onEdit(studio)}
                      className="action-button primary"
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(studio)}
                      className="action-button danger"
                      title="Удалить"
                    >
                      🗑️
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