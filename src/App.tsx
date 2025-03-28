
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from 'react';
import GameScreen from "./pages/GameScreen";
import StartScreen from "./pages/StartScreen";
import NotFound from "./pages/NotFound";
import { GameProvider } from "./context/GameContext";
import { ensureGameEventBus } from "./context/utils/eventBusUtils";
import { checkSupabaseConnection, createSavesTableIfNotExists, getUserIdentifier } from "./api/gameDataService";
import "./index.css";
import AppLoader from "./components/AppLoader";

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
  
  // Синхронизация данных помощников
  useEffect(() => {
    const syncHelperData = async () => {
      try {
        const userId = await getUserIdentifier();
        if (userId && window.__game_user_id) {
          setTimeout(() => {
            const event = new CustomEvent('refresh-referrals');
            window.dispatchEvent(event);
          }, 1500);
        }
      } catch (error) {
        console.error('❌ Ошибка при синхронизации данных помощников при запуске:', error);
      }
    };
    
    setTimeout(syncHelperData, 2000);
  }, []);

  // Если обнаружена ошибка Cloudflare
  if (isInitialized && cloudflareError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-orange-50 to-white p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 mx-auto text-orange-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Проблема с доступом к серверу</h1>
          <p className="text-gray-600">
            Возможно, произошла ошибка Cloudflare или сервер временно недоступен.
          </p>
          <div className="mt-6 space-y-3">
            <button 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => window.location.reload()}
            >
              Обновить страницу
            </button>
            <button 
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => {
                setCloudflareError(false);
                window.__cloudflareRetryCount = 0;
                setIsInitialized(false);
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }}
            >
              Повторить попытку подключения
            </button>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  // Если нет соединения или нет подключения к Supabase
  if (isInitialized && (!isOnline || !isSupabaseConnected)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-900">Отсутствует соединение</h1>
          <p className="text-gray-600">
            Для игры в Crypto Civilization требуется стабильное подключение к интернету.
          </p>
          <p className="text-gray-500 text-sm">
            Проверьте соединение и перезагрузите страницу.
          </p>
          <button 
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => window.location.reload()}
          >
            Обновить страницу
          </button>
        </div>
        <Toaster />
      </div>
    );
  }

  // Основной рендер приложения
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppLoader>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<StartScreen />} />
              <Route path="/game" element={
                <GameProvider>
                  <GameScreen />
                </GameProvider>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
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
