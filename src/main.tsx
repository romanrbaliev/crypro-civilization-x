
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Добавляем глобальный обработчик ошибок
window.addEventListener('error', (event) => {
  console.error('Глобальная ошибка приложения:', event.error);
  
  // Если экран абсолютно белый, попытаемся показать хотя бы базовую ошибку
  if (document.body.childElementCount === 0) {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; text-align: center;">
        <h2>Критическая ошибка в Telegram</h2>
        <p>${event.error?.message || 'Неизвестная ошибка при инициализации Telegram WebApp'}</p>
        <button onclick="window.location.reload()">Перезагрузить страницу</button>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
});

// Создаем функцию для безопасного монтирования React приложения
const mountApp = () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Корневой элемент #root не найден');
    }
    
    const root = createRoot(rootElement);
    root.render(<App />);
    
    console.log('✅ Приложение успешно смонтировано');
  } catch (error) {
    console.error('❌ Ошибка при монтировании React:', error);
    
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; text-align: center;">
        <h2>Ошибка запуска в Telegram</h2>
        <p>${error instanceof Error ? error.message : 'Неизвестная ошибка'}</p>
        <button onclick="window.location.reload()">Перезагрузить страницу</button>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
};

// Запускаем монтирование приложения с небольшой задержкой, 
// чтобы дать Telegram WebApp время инициализироваться
setTimeout(mountApp, 100);
