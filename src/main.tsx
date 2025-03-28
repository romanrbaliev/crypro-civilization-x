
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Глобальные переменные для хранения состояния
if (typeof window !== 'undefined') {
  window.__telegramInitialized = window.__telegramInitialized || false;
  window.__telegramNotificationShown = window.__telegramNotificationShown || false;
  window.__supabaseInitialized = window.__supabaseInitialized || false;
  window.__FORCE_TELEGRAM_MODE = window.__FORCE_TELEGRAM_MODE || false;
  window.__game_user_id = window.__game_user_id || null;
  window.__cloudflareRetryCount = window.__cloudflareRetryCount || 0;
  window.__lastLoadErrorTime = window.__lastLoadErrorTime || 0;
}

// Добавляем глобальный обработчик ошибок для отображения информации пользователю
window.addEventListener('error', (event) => {
  console.error('Глобальная ошибка приложения:', event.error);
  
  // Записываем ошибку в консоль с дополнительной информацией
  console.error('Детали ошибки:', {
    message: event.error?.message,
    stack: event.error?.stack,
    type: event.error?.name,
    isTelegramMode: window.__FORCE_TELEGRAM_MODE,
    telegramInitialized: window.__telegramInitialized
  });
  
  // Сохраняем время последней ошибки
  window.__lastLoadErrorTime = Date.now();
  
  // Если экран абсолютно белый, попытаемся показать хотя бы базовую ошибку
  if (document.body.childElementCount === 0 || 
      (document.getElementById('root') && document.getElementById('root')?.childElementCount === 0)) {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; text-align: center;">
        <h2>Критическая ошибка</h2>
        <p>${event.error?.message || 'Неизвестная ошибка при инициализации приложения'}</p>
        <div>
          ${window.__FORCE_TELEGRAM_MODE ? 'Ошибка в режиме Telegram' : 'Ошибка в обычном режиме'} 
          (init: ${window.__telegramInitialized ? 'да' : 'нет'})
        </div>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 15px;">
          Перезагрузить страницу
        </button>
        <button onclick="window.__FORCE_TELEGRAM_MODE=false; window.location.reload()" style="margin-top: 20px; margin-left: 10px; padding: 10px 15px;">
          Запустить в обычном режиме
        </button>
      </div>
    `;
    document.body.innerHTML = '';
    document.body.appendChild(errorDiv);
  }
});

// Обработка непойманных отклоненных промисов
window.addEventListener('unhandledrejection', (event) => {
  console.error('Непойманное отклонение промиса:', event.reason);
  
  // Сохраняем время последней ошибки
  window.__lastLoadErrorTime = Date.now();
});

// Создаем функцию для безопасного монтирования React приложения
const mountApp = () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Корневой элемент #root не найден');
    }
    
    // Устанавливаем мета-данные для Telegram
    document.title = "Crypto Civilization";
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
    
    // Монтируем React приложение
    const root = createRoot(rootElement);
    root.render(<App />);
    
    console.log('✅ Приложение успешно смонтировано');
  } catch (error) {
    console.error('❌ Ошибка при монтировании React:', error);
    
    // Показываем ошибку, если монтирование не удалось
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; text-align: center;">
        <h2>Ошибка запуска приложения</h2>
        <p>${error instanceof Error ? error.message : 'Неизвестная ошибка'}</p>
        <div>
          ${window.__FORCE_TELEGRAM_MODE ? 'Ошибка в режиме Telegram' : 'Ошибка в обычном режиме'} 
          (init: ${window.__telegramInitialized ? 'да' : 'нет'})
        </div>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 15px;">
          Перезагрузить страницу
        </button>
        <button onclick="window.__FORCE_TELEGRAM_MODE=false; window.location.reload()" style="margin-top: 20px; margin-left: 10px; padding: 10px 15px;">
          Запустить в обычном режиме
        </button>
      </div>
    `;
    document.body.innerHTML = '';
    document.body.appendChild(errorDiv);
  }
};

// Запускаем монтирование приложения с небольшой задержкой, 
// чтобы дать документу время полностью загрузиться
setTimeout(mountApp, 100);
