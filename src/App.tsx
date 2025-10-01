
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import { setAccessToken, logout, checkAuthStatus } from './modules/auth/store';
import AppRoutes from './routes';
import './App.css';

function AppContent() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Проверяем наличие активной сессии при запуске приложения
    const initializeAuth = async () => {
      try {
        await store.dispatch(checkAuthStatus()).unwrap();
      } catch (error) {
        // Нет активной сессии - ничего не делаем
        console.log('No active session');
      } finally {
        setIsInitialized(true);
      }
    };
    
    initializeAuth();
    
    // Слушатель для обновления токена (из axios interceptor)
    const handleTokenRefresh = (event: Event) => {
      const customEvent = event as CustomEvent<{ accessToken: string }>;
      store.dispatch(setAccessToken(customEvent.detail.accessToken));
    };

    // Слушатель для выхода (из axios interceptor)
    const handleLogout = () => {
      store.dispatch(logout());
    };

    window.addEventListener('auth:token-refreshed', handleTokenRefresh);
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefresh);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);
  
  // Показываем loader пока инициализируемся
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px',
        color: '#667eea',
        fontWeight: 600
      }}>
        <div>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            Schedule Schedule-Platform Plus
          </div>
          <div style={{ fontSize: '16px', fontWeight: 400 }}>
            Загрузка приложения...
          </div>
        </div>
      </div>
    );
  }

  return <AppRoutes />;
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;