
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameScreen from "./pages/GameScreen";
import NotFound from "./pages/NotFound";
import { GameProvider } from "./context/GameContext";
import { useEffect } from "react";
import { isTelegramWebAppAvailable } from "./utils/helpers";
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

const App = () => {
  // Устанавливаем мета-данные при загрузке приложения
  useEffect(() => {
    setTelegramMeta();
    
    // Инициализация Telegram WebApp при загрузке приложения
    if (isTelegramWebAppAvailable()) {
      console.log('Инициализация Telegram WebApp в App.tsx');
      
      try {
        // Отправляем сигнал готовности приложения
        if (window.Telegram?.WebApp?.ready) {
          window.Telegram.WebApp.ready();
          console.log('Отправлен сигнал готовности Telegram WebApp');
        }
        
        // Расширяем приложение на весь экран
        if (window.Telegram?.WebApp?.expand) {
          window.Telegram.WebApp.expand();
          console.log('Telegram WebApp развернут на весь экран');
        }
        
        // Выводим детали инициализации
        console.log('Telegram WebApp инициализирован:');
        console.log('- Платформа:', window.Telegram.WebApp.platform);
        console.log('- Версия:', window.Telegram.WebApp.version);
        console.log('- Длина initData:', window.Telegram.WebApp.initData?.length || 0);
        
        // Проверка наличия CloudStorage
        if (window.Telegram?.WebApp?.CloudStorage) {
          console.log('- CloudStorage доступен:', !!window.Telegram.WebApp.CloudStorage);
        } else {
          console.warn('- CloudStorage недоступен');
        }
      } catch (error) {
        console.error('Ошибка при инициализации Telegram WebApp:', error);
      }
    } else {
      console.log('Telegram WebApp не обнаружен, работа в стандартном режиме');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
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
