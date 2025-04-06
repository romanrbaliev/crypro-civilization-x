
import React from 'react';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Вход в игру</h1>
      <Link to="/game" className="text-blue-500 hover:underline">
        Войти
      </Link>
    </div>
  );
};

export default LoginPage;
