/**
 * Хук для работы с аутентификацией
 * Удобная обертка над Redux store
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, register, logoutUser } from '../store';
import type { LoginRequest, RegisterRequest } from '@/api/auth/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    accessToken,
  } = useAppSelector((state) => state.auth);
  
  // Функция входа
  const handleLogin = useCallback(async (credentials: LoginRequest) => {
    try {
      const result = await dispatch(login(credentials)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);
  
  // Функция регистрации
  const handleRegister = useCallback(async (data: RegisterRequest) => {
    try {
      const result = await dispatch(register(data)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);
  
  // Функция выхода
  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      // Даже при ошибке редиректим на логин
      navigate('/login');
    }
  }, [dispatch, navigate]);
  
  // Проверка роли
  const hasRole = useCallback((roles: string | string[]) => {
    if (!user) return false;
    
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  }, [user]);
  
  // Проверка admin
  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);
  
  // Проверка teacher
  const isTeacher = useCallback(() => {
    return user?.role === 'teacher' || user?.role === 'admin';
  }, [user]);
  
  // Проверка student
  const isStudent = useCallback(() => {
    return user?.role === 'student' || user?.role === 'admin';
  }, [user]);
  
  return {
    // Состояние
    user,
    isAuthenticated,
    isLoading,
    error,
    accessToken,
    
    // Функции
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    
    // Проверки ролей
    hasRole,
    isAdmin,
    isTeacher,
    isStudent,
  };
};