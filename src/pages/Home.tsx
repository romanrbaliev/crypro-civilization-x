
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Главная страница</h1>
      <Link to="/game" className="text-blue-500 hover:underline">
        Перейти к игре
      </Link>
    </div>
  );
};

export default HomePage;
