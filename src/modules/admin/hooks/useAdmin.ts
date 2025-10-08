/**
 * useAdmin - хук для работы с админ-панелью
 */

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useMemo } from 'react';
import type { AdminUser } from '@/api/admin/types';
import {
  setRoleFilter,
  setStudioFilter,
  setSearchQuery,
  resetFilters,
  clearError,
  clearSuccessMessage,
} from '../store';

export const useAdmin = () => {
  const dispatch = useAppDispatch();
  const adminState = useAppSelector((state) => state.admin);
  
  // Фильтрация пользователей
  const filteredUsers = useMemo(() => {
    const { roleFilter, studioFilter, searchQuery } = adminState.filters;
    
    return adminState.users.filter((user: AdminUser) => {
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStudio = !studioFilter || 
        (studioFilter === 'none' ? !user.studio_id : user.studio_id === parseInt(studioFilter));
      const matchesSearch = !searchQuery || 
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesRole && matchesStudio && matchesSearch;
    });
  }, [adminState.users, adminState.filters]);
  
  // Действия с фильтрами
  const handleRoleFilterChange = (role: string) => {
    dispatch(setRoleFilter(role));
  };
  
  const handleStudioFilterChange = (studioId: string) => {
    dispatch(setStudioFilter(studioId));
  };
  
  const handleSearchQueryChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };
  
  const handleResetFilters = () => {
    dispatch(resetFilters());
  };
  
  // Очистка сообщений
  const handleClearError = () => {
    dispatch(clearError());
  };
  
  const handleClearSuccess = () => {
    dispatch(clearSuccessMessage());
  };
  
  return {
    // Состояние
    users: adminState.users,
    studios: adminState.studios,
    filteredUsers,
    filters: adminState.filters,
    isLoadingUsers: adminState.isLoadingUsers,
    isLoadingStudios: adminState.isLoadingStudios,
    isSubmitting: adminState.isSubmitting,
    error: adminState.error,
    successMessage: adminState.successMessage,
    
    // Действия
    handleRoleFilterChange,
    handleStudioFilterChange,
    handleSearchQueryChange,
    handleResetFilters,
    handleClearError,
    handleClearSuccess,
  };
};