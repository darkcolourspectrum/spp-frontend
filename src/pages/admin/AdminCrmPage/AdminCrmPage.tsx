import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { useCrm } from '@/modules/crm/hooks';
import { fetchLeads } from '@/modules/crm/store';
import {
  LeadKanbanBoard,
  LeadDetailModal,
} from '@/modules/crm/components';
import './adminCrmPage.css';

const AdminCrmPage = () => {
  const dispatch = useAppDispatch();
  const {
    leads,
    error,
    successMessage,
    handleClearError,
    handleClearSuccess,
  } = useCrm();

  useEffect(() => {
    dispatch(fetchLeads(undefined));
  }, [dispatch]);

  return (
    <div className="admin-crm-page">
      <div className="page-header">
        <h1>CRM - Воронка лидов</h1>
        <p className="page-subtitle">Всего лидов: {leads.length}</p>
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

      <LeadKanbanBoard />

      {/* Модалка сама решает, показываться или нет (по selectedLead из Redux). */}
      <LeadDetailModal />
    </div>
  );
};

export default AdminCrmPage;