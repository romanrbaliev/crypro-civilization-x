
import React from 'react';
import { Link } from 'react-router-dom';

const DocsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Документация</h1>
      <Link to="/game" className="text-blue-500 hover:underline">
        Вернуться к игре
      </Link>
    </div>
  );
};

export default DocsPage;
