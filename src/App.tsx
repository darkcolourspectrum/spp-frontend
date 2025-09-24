import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './modules/auth/context/AuthContext';

// Components
import LoginForm from './modules/auth/components/LoginForm';

// API
import { secureApiClient } from './api/secureClient';

// Styles
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Компонент для демонстрации авторизованного состояния
const DashboardDemo: React.FC = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="bg-success text-white p-4 text-center">
            <h2>Успешная авторизация!</h2>
            <p>Вы успешно вошли в систему. Access token хранится в памяти React.</p>
            <p>Refresh token находится в HTTPOnly cookie.</p>
            <button 
              className="btn btn-outline-light"
              onClick={() => window.location.reload()}
            >
              Перезагрузить страницу (проверить автовосстановление сессии)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Главный компонент с роутингом
const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            <LoginForm 
              onSuccess={() => {
                window.location.href = '/dashboard';
              }}
            />
          } 
        />
        <Route path="/dashboard" element={<DashboardDemo />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

// Главный компонент приложения
const App: React.FC = () => {
  useEffect(() => {
    // Инициализация secureApiClient с контекстом произойдет в AuthProvider
    console.log('🚀 Schedule Platform Frontend initialized');
    console.log('📡 API Base URLs:', {
      AUTH: 'http://localhost:8000',
      PROFILE: 'http://localhost:8002',
      SCHEDULE: 'http://localhost:8001'
    });
  }, []);

  return (
    <div className="App">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </div>
  );
};

export default App;