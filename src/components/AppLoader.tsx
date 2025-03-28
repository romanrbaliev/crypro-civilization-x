
import React, { useEffect, useState } from 'react';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { initializeTelegram, isTelegramAvailable } from '@/utils/telegramInit';
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
        console.log('🔄 Инициализация приложения в AppLoader...');
        
        // Проверяем доступность Telegram WebApp
        const isTgWebApp = isTelegramWebAppAvailable();
        console.log(isTgWebApp ? '✅ Telegram WebApp API обнаружен' : '⚠️ Telegram WebApp API не обнаружен');
        
        // Если Telegram WebApp API доступен, инициализируем его
        if (isTgWebApp) {
          console.log('🔄 Запуск инициализации Telegram WebApp...');
          
          try {
            // Вызываем улучшенную функцию инициализации
            initializeTelegram();
            
            // Проверяем успешность инициализации
            if (!isTelegramAvailable()) {
              console.warn('⚠️ Telegram WebApp не был инициализирован корректно');
              
              // Увеличиваем счетчик попыток
              setTelegramInitAttempts(prev => prev + 1);
              
              // Если это не последняя попытка, повторяем
              if (telegramInitAttempts < 2) {
                console.log(`⚠️ Повторная попытка инициализации Telegram (${telegramInitAttempts + 1}/3)...`);
                setTimeout(initApp, 500);
                return;
              }
              
              // Если все попытки исчерпаны, продолжаем без Telegram
              console.warn('⚠️ Превышено количество попыток инициализации Telegram. Запуск в обычном режиме.');
            } else {
              console.log('✅ Telegram WebApp успешно инициализирован');
              window.__FORCE_TELEGRAM_MODE = true;
            }
          } catch (telegramError) {
            console.error('❌ Ошибка при инициализации Telegram:', telegramError);
            
            // Увеличиваем счетчик попыток
            setTelegramInitAttempts(prev => prev + 1);
            
            // Если это не последняя попытка, повторяем
            if (telegramInitAttempts < 2) {
              setTimeout(initApp, 500);
              return;
            } else {
              // Если исчерпаны все попытки, продолжаем без Telegram
              console.warn('⚠️ Превышено количество попыток инициализации Telegram. Запуск в обычном режиме.');
            }
          }
        } else {
          console.log('ℹ️ Telegram WebApp не обнаружен, используем стандартный режим');
          window.__FORCE_TELEGRAM_MODE = false;
        }
        
        // Завершаем загрузку
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Критическая ошибка при инициализации приложения:', error);
        setError(error instanceof Error ? error.message : 'Неизвестная ошибка при инициализации');
        setIsLoading(false);
      }
    };
    
    // Запускаем инициализацию приложения
    initApp();
  }, [telegramInitAttempts]);
  
  // Если идет загрузка, показываем экран загрузки
  if (isLoading) {
    return <LoadingScreen message="Инициализация приложения..." />;
  }
  
  // Если есть ошибка, показываем экран ошибки
  if (error) {
    return (
      <ErrorScreen 
        title="Ошибка инициализации"
        description={`Не удалось запустить приложение: ${error}`}
        onReload={() => window.location.reload()}
      />
    );
  }
  
  // Если все в порядке, рендерим дочерние компоненты
  return <>{children}</>;
};

export default AppLoader;

