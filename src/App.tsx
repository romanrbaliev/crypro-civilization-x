
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
        
        // Проверка наличия CloudStorage
        if (window.Telegram?.WebApp?.CloudStorage) {
          console.log('- CloudStorage доступен:', !!window.Telegram.WebApp.CloudStorage);
          
          // Проверяем методы CloudStorage
          const hasGetItem = typeof window.Telegram.WebApp.CloudStorage.getItem === 'function';
          const hasSetItem = typeof window.Telegram.WebApp.CloudStorage.setItem === 'function';
          const hasRemoveItem = typeof window.Telegram.WebApp.CloudStorage.removeItem === 'function';
          
          console.log('- CloudStorage методы:', {
            getItem: hasGetItem,
            setItem: hasSetItem,
            removeItem: hasRemoveItem
          });
          
          if (hasGetItem && hasSetItem && hasRemoveItem) {
            console.log('✅ CloudStorage полностью функционален');
            
            // Тест CloudStorage
            try {
              window.Telegram.WebApp.CloudStorage.setItem('test_key', 'test_value')
                .then(() => window.Telegram.WebApp.CloudStorage.getItem('test_key'))
                .then(value => {
                  console.log('✅ Тест CloudStorage успешен:', value === 'test_value');
                })
                .catch(err => {
                  console.error('❌ Ошибка теста CloudStorage:', err);
                });
            } catch (testError) {
              console.warn('⚠️ Не удалось протестировать CloudStorage:', testError);
            }
          } else {
            console.warn('⚠️ CloudStorage не полностью функционален');
          }
        } else {
          console.warn('❌ CloudStorage недоступен');
        }
        
        // Настройка обработчика BackButton если доступен
        if (window.Telegram?.WebApp?.BackButton) {
          if (window.Telegram.WebApp.BackButton.isVisible) {
            window.Telegram.WebApp.BackButton.hide();
            console.log('✅ BackButton скрыт при запуске');
          }
        }
        
        // Сохраняем данные о пользователе при наличии
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
          try {
            const telegramUserId = window.Telegram.WebApp.initDataUnsafe.user.id;
            localStorage.setItem('telegram_user_id', telegramUserId.toString());
            console.log('✅ ID пользователя Telegram сохранен в localStorage:', telegramUserId);
          } catch (e) {
            console.warn('⚠️ Не удалось сохранить ID пользователя Telegram:', e);
          }
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
      }
    } else {
      console.log('ℹ️ Telegram WebApp не обнаружен, работа в стандартном режиме');
      
      // Показываем toast с информацией о стандартном режиме только один раз
      // и не показываем в режиме разработки, чтобы не мешать разработчикам
      if (!window.__telegramNotificationShown && process.env.NODE_ENV !== 'development') {
        window.__telegramNotificationShown = true;
        setTimeout(() => {
          toast({
            title: "Стандартный режим",
            description: "Приложение запущено в браузере. Прогресс будет сохранен локально.",
            variant: "default",
          });
        }, 1000);
      }
    }
  }, []);

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

export default App;
