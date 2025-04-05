
import { useState, useEffect } from 'react';
import { checkSupabaseConnection } from '@/api/connectionUtils';

/**
 * Хук для проверки статуса соединения
 */
export function useConnectionStatus() {
  const [hasConnection, setHasConnection] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [cloudflareError, setCloudflareError] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Инициализация...');
  
  // Проверка соединения при инициализации
  useEffect(() => {
    async function checkConnection() {
      try {
        // Счетчик для отслеживания ошибок Cloudflare
        let retryCount = window.__cloudflareRetryCount || 0;
        
        setLoadingMessage('Проверка соединения...');
        
        // Проверяем соединение с Supabase
        const connected = await checkSupabaseConnection();
        
        if (connected) {
          setHasConnection(true);
          setCloudflareError(false);
          window.__cloudflareRetryCount = 0;
          setLoadingMessage('Соединение установлено');
        } else {
          // Увеличиваем счетчик ошибок
          retryCount++;
          window.__cloudflareRetryCount = retryCount;
          
          // Если много ошибок подряд, считаем что проблема с Cloudflare
          if (retryCount >= 3) {
            setCloudflareError(true);
            setLoadingMessage('Ошибка соединения с сервером');
          } else {
            setHasConnection(false);
            setLoadingMessage('Нет соединения с сервером. Попытка подключения...');
            
            // Повторяем попытку через 2 секунды
            setTimeout(checkConnection, 2000);
            return;
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Ошибка при проверке соединения:', error);
        setHasConnection(false);
        setIsInitialized(true);
        setLoadingMessage('Ошибка при проверке соединения');
      }
    }
    
    checkConnection();
  }, []);
  
  return {
    hasConnection,
    isInitialized,
    cloudflareError,
    loadingMessage,
    setLoadingMessage
  };
}
