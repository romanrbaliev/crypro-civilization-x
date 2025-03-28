
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import GameScreen from "./pages/GameScreen";
import StartScreen from "./pages/StartScreen";
import NotFound from "./pages/NotFound";
import { GameProvider } from "./context/GameContext";
import { ensureGameEventBus } from "./context/utils/eventBusUtils";
import { checkSupabaseConnection, createSavesTableIfNotExists, getUserIdentifier } from "./api/gameDataService";
import "./index.css";
import AppLoader from "./components/AppLoader";
import ErrorScreen from "./components/ErrorScreen";

// Создаем клиент React Query с настройками
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Инициализируем глобальные переменные, если это клиентская сторона
if (typeof window !== 'undefined') {
  window.__telegramInitialized = window.__telegramInitialized || false;
  window.__telegramNotificationShown = window.__telegramNotificationShown || false;
  window.__supabaseInitialized = window.__supabaseInitialized || false;
  window.__FORCE_TELEGRAM_MODE = window.__FORCE_TELEGRAM_MODE || false;
  window.__game_user_id = window.__game_user_id || null;
  window.__cloudflareRetryCount = window.__cloudflareRetryCount || 0;
  window.__lastLoadErrorTime = window.__lastLoadErrorTime || 0;
  
  // Инициализируем шину событий
  ensureGameEventBus();
}

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cloudflareError, setCloudflareError] = useState(false);
  
  // Эффект для проверки соединения
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        tryConnectToSupabase();
      }
    };
    
    // Функция для проверки соединения с Supabase
    const tryConnectToSupabase = async () => {
      try {
        const connected = await checkSupabaseConnection();
        setIsSupabaseConnected(connected);
        setCloudflareError(false);
        
        if (connected) {
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
      } catch (error) {
        window.__cloudflareRetryCount = (window.__cloudflareRetryCount || 0) + 1;
        console.error('❌ Ошибка при проверке соединения:', error);
        
        if (window.__cloudflareRetryCount > 3 || 
            (error instanceof Error && error.message.includes('cloudflare'))) {
          setCloudflareError(true);
        }
      }
      
      setIsInitialized(true);
    };
    
    // Добавляем обработчики событий и запускаем проверку соединения
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    tryConnectToSupabase();
    
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  // Если обнаружена ошибка Cloudflare
  if (isInitialized && cloudflareError) {
    return (
      <ErrorScreen 
        title="Проблема с доступом к серверу"
        description="Возможно, произошла ошибка Cloudflare или сервер временно недоступен."
        onRetry={() => {
          window.__cloudflareRetryCount = 0;
          setIsInitialized(false);
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }}
      />
    );
  }

  // Если нет соединения или нет подключения к Supabase
  if (isInitialized && (!isOnline || !isSupabaseConnected)) {
    return (
      <ErrorScreen 
        title="Отсутствует соединение"
        description="Для игры в Crypto Civilization требуется стабильное подключение к интернету."
      />
    );
  }

  // Основной рендер приложения
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppLoader>
          <BrowserRouter>
            {/* Важное изменение: Теперь GameProvider оборачивает все маршруты */}
            <GameProvider>
              <Routes>
                <Route path="/" element={<StartScreen />} />
                <Route path="/game" element={<GameScreen />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </GameProvider>
          </BrowserRouter>
        </AppLoader>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

declare global {
  interface Window {
    __telegramInitialized?: boolean;
    __telegramNotificationShown?: boolean;
    __supabaseInitialized?: boolean;
    __FORCE_TELEGRAM_MODE?: boolean;
    __game_user_id?: string | null;
    __cloudflareRetryCount?: number;
    __lastLoadErrorTime?: number;
  }
}

export default App;
