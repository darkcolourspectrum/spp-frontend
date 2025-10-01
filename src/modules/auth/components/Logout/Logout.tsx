/**
 * Компонент кнопки выхода из системы
 */

import { useAuth } from '../../hooks/useAuth';

interface LogoutProps {
  className?: string;
  children?: React.ReactNode;
}

const Logout = ({ className = '', children = 'Выйти' }: LogoutProps) => {
  const { logout, isLoading } = useAuth();
  
  const handleLogout = async () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      await logout();
    }
  };
  
  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
      style={{
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        transition: 'all 0.2s ease',
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      {isLoading ? 'Выход...' : children}
    </button>
  );
};

export default Logout;