
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl">Страница не найдена</p>
        <Button onClick={goHome}>Вернуться на главную</Button>
      </div>
    </div>
  );
};

export default NotFound;
