/**
 * Axios instance с автоматическим обновлением токенов
 * Access token хранится в Redux, refresh token в httpOnly cookie
 */

import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { AUTH_ENDPOINTS } from './endpoints';

// Создаем основной axios instance
export const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Важно! Для отправки cookies (refresh_token)
});

// Флаг для предотвращения множественных refresh запросов
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

// Обработка очереди запросов после успешного refresh
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  
  failedQueue = [];
};

// ==================== REQUEST INTERCEPTOR ====================
// Добавляем access token к каждому запросу
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Получаем токен из Redux store
    const state = (window as any).__REDUX_STORE__?.getState();
    const token = state?.auth?.accessToken;
    
    // Добавляем токен если он есть и это не refresh запрос
    if (token && config.url !== AUTH_ENDPOINTS.REFRESH) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================
// Автоматическое обновление токена при 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Если ошибка 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Если это запрос на refresh - выходим
      if (originalRequest.url === AUTH_ENDPOINTS.REFRESH) {
        // Refresh токен тоже протух - редирект на логин
        const event = new CustomEvent('auth:logout');
        window.dispatchEvent(event);
        return Promise.reject(error);
      }
      
      // Если уже идет процесс обновления токена
      if (isRefreshing) {
        // Добавляем запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Пытаемся обновить токен
        const response = await axios.post(
          AUTH_ENDPOINTS.REFRESH,
          {},
          { withCredentials: true }
        );
        
        const { access_token } = response.data;
        
        // Обновляем токен в Redux store
        const event = new CustomEvent('auth:token-refreshed', {
          detail: { accessToken: access_token }
        });
        window.dispatchEvent(event);
        
        // Обрабатываем очередь запросов
        processQueue(null, access_token);
        
        // Повторяем оригинальный запрос с новым токеном
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // Не удалось обновить токен - разлогиниваем
        processQueue(refreshError, null);
        
        const event = new CustomEvent('auth:logout');
        window.dispatchEvent(event);
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;