
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameScreen from "./pages/GameScreen";
import NotFound from "./pages/NotFound";
import { GameProvider } from "./context/GameContext";
import { useEffect } from "react";
import { isTelegramWebAppAvailable } from "./utils/helpers";
import { toast } from "@/hooks/use-toast";
import "./index.css"; // Импортируем CSS стили

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

// Создаем глобальную переменную для отслеживания инициализации
window.__telegramInitialized = window.__telegramInitialized || false;
window.__telegramNotificationShown = window.__telegramNotificationShown || false;
window.__supabaseInitialized = window.__supabaseInitialized || false;
window.__FORCE_TELEGRAM_MODE = true; // Принудительно включаем режим Telegram для отладки

const App = () => {
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
        
        // Выводим детали инициализации
        console.log('✅ Telegram WebApp инициализирован:');
        console.log('- Платформа:', window.Telegram.WebApp.platform);
        console.log('- Версия:', window.Telegram.WebApp.version);
        console.log('- Длина initData:', window.Telegram.WebApp.initData?.length || 0);
        
        // Сохраняем данные о пользователе при наличии
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
          try {
            const telegramUserId = window.Telegram.WebApp.initDataUnsafe.user.id;
            localStorage.setItem('telegram_user_id', telegramUserId.toString());
            console.log('✅ ID пользователя Telegram сохранен в localStorage:', telegramUserId);
            
            // Запускаем инициализацию Supabase
            initializeSupabase(telegramUserId);
          } catch (e) {
            console.warn('⚠️ Не удалось сохранить ID пользователя Telegram:', e);
          }
        } else {
          // Даже без ID пользователя, инициализируем Supabase
          initializeSupabase();
        }
        
        // Показываем toast с информацией о режиме Telegram только один раз в продакшене
        if (!window.__telegramNotificationShown && process.env.NODE_ENV !== 'development') {
          window.__telegramNotificationShown = true;
          setTimeout(() => {
            toast({
              title: "Режим Telegram",
              description: `Приложение запущено в Telegram (${window.Telegram.WebApp.platform}, v${window.Telegram.WebApp.version})`,
              variant: "default",
            });
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Ошибка при инициализации Telegram WebApp:', error);
        
        // Показываем toast с ошибкой только в продакшене
        if (process.env.NODE_ENV !== 'development') {
          toast({
            title: "Ошибка Telegram интеграции",
            description: "Произошла ошибка при инициализации Telegram WebApp. Игра будет работать в автономном режиме.",
            variant: "destructive",
          });
        }
        
        // Даже при ошибке Telegram, инициализируем Supabase
        initializeSupabase();
      }
    } else {
      console.log('ℹ️ Telegram WebApp не обнаружен, работа в стандартном режиме');
      
      // Инициализируем Supabase в стандартном режиме
      initializeSupabase();
      
      // Показываем toast с информацией о стандартном режиме только один раз
      // и не показываем в режиме разработки, чтобы не мешать разработчикам
      if (!window.__telegramNotificationShown && process.env.NODE_ENV !== 'development') {
        window.__telegramNotificationShown = true;
        setTimeout(() => {
          toast({
            title: "Стандартный режим",
            description: "Приложение запущено в браузере. Прогресс будет сохранен в облаке.",
            variant: "default",
          });
        }, 1000);
      }
    }
  }, []);

  // Инициализация Supabase
  const initializeSupabase = async (telegramUserId?: number) => {
    // Предотвращаем повторную инициализацию
    if (window.__supabaseInitialized) {
      return;
    }
    
    window.__supabaseInitialized = true;
    
    try {
      // Импортируем и инициализируем подключение к базе данных
      const { checkSupabaseConnection } = await import('./api/gameDataService');
      
      if (typeof checkSupabaseConnection === 'function') {
        console.log('🔄 Проверка подключения к Supabase...');
        const isConnected = await checkSupabaseConnection();
        
        if (isConnected) {
          console.log('✅ Соединение с Supabase установлено успешно');
          
          if (!window.__telegramNotificationShown && process.env.NODE_ENV !== 'development') {
            window.__telegramNotificationShown = true;
            setTimeout(() => {
              toast({
                title: "Облачное сохранение",
                description: "Подключение к облачной базе данных установлено.",
                variant: "default",
              });
            }, 1500);
          }
        } else {
          console.warn('⚠️ Не удалось подключиться к Supabase');
          
          if (!window.__telegramNotificationShown && process.env.NODE_ENV !== 'development') {
            window.__telegramNotificationShown = true;
            setTimeout(() => {
              toast({
                title: "Локальный режим",
                description: "Не удалось подключиться к облачной базе данных. Прогресс будет сохранен локально.",
                variant: "warning",
              });
            }, 1500);
          }
        }
      } else {
        console.warn('⚠️ Функция проверки Supabase не найдена');
      }
    } catch (error) {
      console.error('❌ Ошибка при инициализации Supabase:', error);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<GameScreen />} />
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
    __telegramInitialized: boolean;
    __telegramNotificationShown: boolean;
    __supabaseInitialized: boolean;
    __FORCE_TELEGRAM_MODE: boolean;
  }
}

export default App;
