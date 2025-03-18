
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

// Настраиваем клиент для React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
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
  
  // Создаем шину событий при инициализации приложения
  ensureGameEventBus();
}

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
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
        checkSupabaseConnection().then(connected => {
          setIsSupabaseConnected(connected);
          if (connected) {
            toast({
              title: "Соединение восстановлено",
              description: "Подключение к интернету и серверу восстановлено.",
              variant: "success",
            });
          }
        });
      }
    };
    
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    // Начальная проверка подключения к Supabase и создание нужных таблиц
    const initSupabase = async () => {
      const connected = await checkSupabaseConnection();
      setIsSupabaseConnected(connected);
      
      if (connected) {
        // Проверяем наличие нужных таблиц и создаем их если нужно
        try {
          await createSavesTableIfNotExists();
          console.log('✅ Проверка и создание таблиц в Supabase выполнены');
        } catch (error) {
          console.error('❌ Ошибка при проверке/создании таблиц:', error);
        }
      } else {
        console.error('❌ Нет соединения с Supabase');
        toast({
          title: "Ошибка подключения к серверу",
          description: "Невозможно подключиться к серверу. Проверьте интернет-соединение.",
          variant: "destructive",
        });
      }
      
      setIsInitialized(true);
    };
    
    initSupabase();
    
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
        // Отправляем сигнал готовности приложения
        if (window.Telegram?.WebApp?.ready) {
          window.Telegram.WebApp.ready();
          console.log('✅ Отправлен сигнал готовности Telegram WebApp');
        }
        
        // Расширяем приложение на весь экран
        if (window.Telegram?.WebApp?.expand) {
          window.Telegram.WebApp.expand();
          console.log('✅ Telegram WebApp развернут на весь экран');
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
  }
}

export default App;
