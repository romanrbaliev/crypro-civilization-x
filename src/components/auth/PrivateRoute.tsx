
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: ReactNode;
}

// Упрощенная версия компонента PrivateRoute
// В реальном приложении здесь будет проверка авторизации
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Считаем, что пользователь всегда авторизован
  const isAuthenticated = true;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

export default PrivateRoute;
