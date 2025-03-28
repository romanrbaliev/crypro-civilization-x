
import React, { useEffect, useState } from 'react';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';

interface AppLoaderProps {
  children: React.ReactNode;
}

const AppLoader: React.FC<AppLoaderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [telegramInitAttempts, setTelegramInitAttempts] = useState(0);
  
  useEffect(() => {
    const initApp = async () => {
      try {
        // Проверяем доступность Telegram WebApp
        if (isTelegramWebAppAvailable()) {
          console.log('Telegram WebApp обнаружен, инициализация...');
          
          try {
            const tg = window.Telegram.WebApp;
            
            // Проверка на валидность объекта Telegram
            if (!tg) {
              throw new Error('Telegram WebApp объект недоступен');
            }
            
            // Отправляем сигнал готовности
            if (typeof tg.ready === 'function') {
              tg.ready();
              console.log('Telegram WebApp ready отправлен');
            }
            
            // Разворачиваем на весь экран
            if (typeof tg.expand === 'function') {
              tg.expand();
              console.log('Telegram WebApp развернут на весь экран');
            }
            
            // Сохраняем флаг телеграм-режима
            window.__FORCE_TELEGRAM_MODE = true;
          } catch (telegramError) {
            console.error('Ошибка при инициализации Telegram:', telegramError);
            
            // Увеличиваем счетчик попыток
            setTelegramInitAttempts(prev => prev + 1);
            
            // Если это не последняя попытка, повторяем
            if (telegramInitAttempts < 3) {
              setTimeout(initApp, 500);
              return;
            } else {
              // Если исчерпаны все попытки, показываем ошибку, но продолжаем загрузку
              console.warn('Превышено количество попыток инициализации Telegram');
            }
          }
        } else {
          console.log('Telegram WebApp не обнаружен, стандартный режим');
        }
        
        // Завершаем загрузку
        setIsLoading(false);
      } catch (error) {
        console.error('Критическая ошибка при инициализации приложения:', error);
        setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
        setIsLoading(false);
      }
    };
    
    // Запускаем инициализацию приложения
    initApp();
  }, [telegramInitAttempts]);
  
  if (isLoading) {
    return <LoadingScreen message="Инициализация приложения..." />;
  }
  
  if (error) {
    return (
      <ErrorScreen 
        title="Ошибка инициализации"
        description={`Не удалось запустить приложение: ${error}`}
        onReload={() => window.location.reload()}
      />
    );
  }
  
  return <>{children}</>;
};

export default AppLoader;
