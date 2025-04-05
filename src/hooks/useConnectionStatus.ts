
import { useState, useEffect } from 'react';
import { checkSupabaseConnection, createSavesTableIfNotExists } from '@/api/gameDataService';
import { ERROR_NOTIFICATION_THROTTLE } from '@/api/apiTypes';
import { toast } from '@/hooks/use-toast';

export const useConnectionStatus = () => {
  const [hasConnection, setHasConnection] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cloudflareError, setCloudflareError] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Загрузка игры...");
  
  let connectionErrorShown = false;

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
        
        if (isConnected) {
          toast({
            title: "Соединение восстановлено",
            description: "Подключение к серверу восстановлено.",
            variant: "success",
          });
          
          await createSavesTableIfNotExists();
        } else {
          const now = Date.now();
          const lastErrorTime = window.__lastLoadErrorTime || 0;
          
          if (now - lastErrorTime > ERROR_NOTIFICATION_THROTTLE && !connectionErrorShown) {
            window.__lastLoadErrorTime = now;
            connectionErrorShown = true;
            toast({
              title: "Возможны проблемы с соединением",
              description: "Игра продолжит работу, но могут быть проблемы с сохранением прогресса.",
              variant: "warning",
            });
          }
        }
      }
    }, 30000); // Check connection every 30 seconds
    
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
