
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Добавим эту проверку, чтобы избежать ошибок в консоли
const rootElement = document.getElementById('root');

if (rootElement) {
  // Создаем корневой элемент React
  const root = ReactDOM.createRoot(rootElement);
  
  // Рендерим наше приложение
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Корневой элемент с id "root" не найден в HTML!');
}
