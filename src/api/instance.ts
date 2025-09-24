import axios from 'axios';
import { BASE_URLS } from './endpoints';

// Базовый Axios instance
export const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor для добавления токена
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Попытка обновить токен
          const response = await axios.post(
            `${BASE_URLS.AUTH_SERVICE}/api/v1/auth/refresh`,
            { refresh_token: refreshToken }
          );
          
          const { access_token } = response.data;
          localStorage.setItem('accessToken', access_token);
          
          // Повторяем оригинальный запрос
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Если обновление не удалось, очищаем токены и редиректим на логин
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;