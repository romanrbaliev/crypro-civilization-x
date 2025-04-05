
import { useState, useEffect } from 'react';
import { checkSupabaseConnection, createSavesTableIfNotExists } from '@/api/gameDataService';

/**
 * Хук для отслеживания статуса соединения
 */
export const useConnectionStatus = () => {
  const [hasConnection, setHasConnection] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cloudflareError, setCloudflareError] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Загрузка игры...");

  useEffect(() => {
    const checkConnection = async () => {
      setLoadingMessage("Проверка соединения с сервером...");
      const isConnected = await checkSupabaseConnection();
      setHasConnection(isConnected);
      
      if (isConnected) {
        try {
          await createSavesTableIfNotExists();
          console.log('✅ Проверка и создание таблиц в Supabase выполнены');
        } catch (error) {
          console.error('❌ Ошибка при проверке/создании таблиц:', error);
        }
      } else {
        window.__cloudflareRetryCount = (window.__cloudflareRetryCount || 0) + 1;
        
        if (window.__cloudflareRetryCount > 3) {
          setCloudflareError(true);
          console.error('❌ Возможно проблема с Cloudflare или сервер недоступен');
        }
        
        console.error('❌ Нет соединения с Supabase, попытка:', window.__cloudflareRetryCount);
      }
      
      setIsInitialized(true);
    };
    
    checkConnection();
    
    const intervalId = setInterval(async () => {
      const isConnected = await checkSupabaseConnection();
      
      if (isConnected !== hasConnection) {
        setHasConnection(isConnected);
      }
    }, 30000); // Проверка соединения каждые 30 секунд
    
    return () => clearInterval(intervalId);
  }, [hasConnection]);

  return {
    hasConnection,
    isInitialized,
    cloudflareError,
    loadingMessage,
    setLoadingMessage
  };
};
