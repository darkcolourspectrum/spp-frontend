import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { BASE_URLS } from './endpoints';

// Типы для аутентификации
interface AuthContextType {
  accessToken: string | null;
  updateAccessToken: (token: string) => void;
  clearAuth: () => void;
}

class SecureApiClient {
  private authContext: AuthContextType | null = null;
  private isRefreshing = false;
  private failedRequestsQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.setupInterceptors();
  }

  // Устанавливаем контекст аутентификации
  setAuthContext(authContext: AuthContextType) {
    this.authContext = authContext;
  }

  private setupInterceptors() {
    // Request interceptor - добавляем access token из контекста
    axios.interceptors.request.use(
      (config) => {
        // Добавляем токен из памяти (контекста)
        if (this.authContext?.accessToken) {
          config.headers.Authorization = `Bearer ${this.authContext.accessToken}`;
        }

        // Всегда включаем cookies для refresh token
        config.withCredentials = true;

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - обрабатываем 401 и обновляем токены
    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Если 401 и это не повторный запрос
        if (error.response?.status === 401 && !originalRequest._retry) {
          
          // Если уже обновляем токен, добавляем в очередь
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedRequestsQueue.push({ resolve, reject });
            }).then(() => {
              // Повторяем запрос с новым токеном
              if (this.authContext?.accessToken) {
                originalRequest.headers!.Authorization = `Bearer ${this.authContext.accessToken}`;
              }
              return axios(originalRequest);
            }).catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Попытка обновить токен через refresh (cookies)
            const refreshResponse = await axios.post(
              `${BASE_URLS.AUTH_SERVICE}/api/v1/auth/refresh`,
              {},
              { 
                withCredentials: true,
                timeout: 5000
              }
            );

            const { access_token } = refreshResponse.data;

            // Обновляем токен в контексте
            this.authContext?.updateAccessToken(access_token);

            // Обрабатываем очередь неудачных запросов
            this.processQueue(null);

            // Повторяем оригинальный запрос
            originalRequest.headers!.Authorization = `Bearer ${access_token}`;
            return axios(originalRequest);

          } catch (refreshError) {
            // Refresh не удался - очищаем аутентификацию
            this.processQueue(refreshError);
            this.authContext?.clearAuth();
            
            // Редирект на страницу входа
            window.location.href = '/login';
            return Promise.reject(refreshError);

          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any) {
    this.failedRequestsQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(null);
      }
    });

    this.failedRequestsQueue = [];
  }

  // Базовые HTTP методы
  async get(url: string, config?: AxiosRequestConfig) {
    return axios.get(url, { ...config, withCredentials: true });
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    return axios.post(url, data, { ...config, withCredentials: true });
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig) {
    return axios.put(url, data, { ...config, withCredentials: true });
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    return axios.delete(url, { ...config, withCredentials: true });
  }

  async patch(url: string, data?: any, config?: AxiosRequestConfig) {
    return axios.patch(url, data, { ...config, withCredentials: true });
  }

  // Специальный метод для проверки валидности токена
  async validateToken(): Promise<boolean> {
    try {
      if (!this.authContext?.accessToken) return false;

      const response = await this.post(`${BASE_URLS.AUTH_SERVICE}/api/v1/auth/validate-token`);
      return response.data.valid === true;
    } catch {
      return false;
    }
  }

  // Метод для проверки подключения к auth service
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${BASE_URLS.AUTH_SERVICE}/health`);
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// Создаем единственный экземпляр
export const secureApiClient = new SecureApiClient();