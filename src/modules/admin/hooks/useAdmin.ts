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
  
  const {
    users,
    studios,
    filters,
    isLoadingUsers,
    isLoadingStudios,
    isSubmitting,
    error,
    successMessage,
  } = useAppSelector((state) => state.admin);
  
  // Получаем ID текущего пользователя из auth state
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id || null;
  
  // Фильтрация пользователей
  const filteredUsers = useMemo(() => {
    let result = [...users];
    
    // Фильтр по роли
    if (filters.roleFilter) {
      result = result.filter((user) => user.role === filters.roleFilter);
    }
    
    // Фильтр по студии
    if (filters.studioFilter) {
      if (filters.studioFilter === 'no_studio') {
        result = result.filter((user) => !user.studio_id);
      } else {
        result = result.filter(
          (user) => user.studio_id?.toString() === filters.studioFilter
        );
      }
    }
    
    // Поиск по имени или email
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }
    
    // СОРТИРОВКА: текущий админ всегда первый
    result.sort((a, b) => {
      // Текущий пользователь идет первым
      if (currentUserId) {
        if (a.id === currentUserId) return -1;
        if (b.id === currentUserId) return 1;
      }
      
      // Остальные по ID
      return a.id - b.id;
    });
    
    return result;
  }, [users, filters, currentUserId]);
  
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
    users,
    studios,
    filteredUsers,
    currentUserId,
    filters,
    isLoadingUsers,
    isLoadingStudios,
    isSubmitting,
    error,
    successMessage,
    
    // Действия с фильтрами
    handleRoleFilterChange,
    handleStudioFilterChange,
    handleSearchQueryChange,
    handleResetFilters,
    
    // Очистка сообщений
    handleClearError,
    handleClearSuccess,
  };
};