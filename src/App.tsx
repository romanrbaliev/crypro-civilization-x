
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameScreen from "./pages/GameScreen";
import StartScreen from "./pages/StartScreen";
import NotFound from "./pages/NotFound";
import { GameProvider } from "./context/GameContext";
import { useEffect, useState } from "react";
import { isTelegramWebAppAvailable } from "./utils/helpers";
import { ensureGameEventBus } from "./context/utils/eventBusUtils";
import { toast } from "@/hooks/use-toast";
import { checkSupabaseConnection } from "./api/gameDataService";
import { createSavesTableIfNotExists } from "./api/gameDataService";
import "./index.css";

// Настраиваем клиент для React Query с повышенным количеством повторных попыток
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3, // Увеличиваем количество повторных попыток
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Экспоненциальное увеличение задержки
    },
  },
});

// Установка заголовка и иконки для Telegram Mini App
const setTelegramMeta = () => {
  document.title = "Crypto Civilization";
  
  // Для корректной работы в Telegram
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }
};

// Инициализация глобальных переменных, если они ещё не определены
if (typeof window !== 'undefined') {
  window.__telegramInitialized = window.__telegramInitialized || false;
  window.__telegramNotificationShown = window.__telegramNotificationShown || false;
  window.__supabaseInitialized = window.__supabaseInitialized || false;
  window.__FORCE_TELEGRAM_MODE = window.__FORCE_TELEGRAM_MODE || true;
  window.__game_user_id = window.__game_user_id || null;
  window.__cloudflareRetryCount = window.__cloudflareRetryCount || 0;
  
  // Создаем шину событий при инициализации приложения
  ensureGameEventBus();
}

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cloudflareError, setCloudflareError] = useState(false);
  
  // Обработчик статуса соединения
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
      if (!navigator.onLine) {
        toast({
          title: "Отсутствует подключение к интернету",
          description: "Для игры требуется стабильное интернет-соединение.",
          variant: "destructive",
        });
      } else {
        // Повторно проверяем подключение к Supabase при восстановлении интернета
        tryConnectToSupabase();
      }
    };
    
    // Функция для проверки соединения с Supabase с обработкой ошибок Cloudflare
    const tryConnectToSupabase = async () => {
      try {
        const connected = await checkSupabaseConnection();
        setIsSupabaseConnected(connected);
        setCloudflareError(false);
        
        if (connected) {
          toast({
            title: "Соединение восстановлено",
            description: "Подключение к интернету и серверу восстановлено.",
            variant: "success",
          });
          
          // Проверяем наличие нужных таблиц и создаем их если нужно
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
    
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    // Начальная проверка подключения к Supabase и создание нужных таблиц
    tryConnectToSupabase();
    
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);
  
  // Устанавливаем мета-данные при загрузке приложения
  useEffect(() => {
    setTelegramMeta();
    
    // Предотвращаем повторную инициализацию
    if (window.__telegramInitialized) {
      return;
    }
    
    window.__telegramInitialized = true;
    
    // Инициализация Telegram WebApp при загрузке приложения
    if (isTelegramWebAppAvailable()) {
      console.log('🔄 Инициализация Telegram WebApp в App.tsx');
      
      try {
        // Отправляем сигнал готовности приложения с дополнительной обработкой ошибок
        if (window.Telegram?.WebApp?.ready) {
          try {
            window.Telegram.WebApp.ready();
            console.log('✅ Отправлен сигнал готовности Telegram WebApp');
          } catch (readyError) {
            console.error('❌ Ошибка при отправке сигнала готовности:', readyError);
          }
        }
        
        // Расширяем приложение на весь экран с обработкой ошибок
        if (window.Telegram?.WebApp?.expand) {
          try {
            window.Telegram.WebApp.expand();
            console.log('✅ Telegram WebApp развернут на весь экран');
          } catch (expandError) {
            console.error('❌ Ошибка при развертывании WebApp:', expandError);
          }
        }
        
        // Детальное логирование данных Telegram
        console.log('✅ Telegram WebApp инициализирован:');
        if (window.Telegram?.WebApp?.platform) {
          console.log('- Платформа:', window.Telegram.WebApp.platform);
        }
        if (window.Telegram?.WebApp?.version) {
          console.log('- Версия:', window.Telegram.WebApp.version);
        }
        if (window.Telegram?.WebApp?.initData) {
          console.log('- Длина initData:', window.Telegram.WebApp.initData.length || 0);
        }
        
        // Логируем объект пользователя, если доступен
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
          console.log('- Данные пользователя:', window.Telegram.WebApp.initDataUnsafe.user);
          console.log('- Детали пользователя:');
          const user = window.Telegram.WebApp.initDataUnsafe.user;
          console.log('  ID:', user.id);
          console.log('  Username:', user.username);
          console.log('  First name:', user.first_name);
          console.log('  Last name:', user.last_name);
          // Проверяем наличие language_code перед использованием
          if (user.language_code) {
            console.log('  Language code:', user.language_code);
          }
        } else {
          console.warn('⚠️ Объект пользователя Telegram недоступен');
        }
        
        // Логируем start_param, если доступен
        if (window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
          console.log('- Start параметр:', window.Telegram.WebApp.initDataUnsafe.start_param);
        } else {
          console.log('- Start параметр отсутствует');
        }
        
        // Выводим всю структуру initDataUnsafe для отладки
        console.log('- Полная структура initDataUnsafe:', window.Telegram.WebApp.initDataUnsafe);
      } catch (error) {
        console.error('❌ Ошибка при инициализации Telegram WebApp:', error);
      }
    } else {
      console.log('ℹ️ Telegram WebApp не обнаружен, работа в стандартном режиме браузера');
    }
  }, []);

  // Для отображения ошибки Cloudflare
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
                // Перезапускаем процесс инициализации
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

  // Для оффлайн-режима или отсутствия соединения с Supabase показываем заглушку
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

  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<StartScreen />} />
              <Route path="/game" element={<GameScreen />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </GameProvider>
    </QueryClientProvider>
  );
};

// Добавляем дополнительные глобальные типы
declare global {
  interface Window {
    __telegramInitialized?: boolean;
    __telegramNotificationShown?: boolean;
    __supabaseInitialized?: boolean;
    __FORCE_TELEGRAM_MODE?: boolean;
    __game_user_id?: string | null;
    __cloudflareRetryCount?: number;
  }
}

export default App;
