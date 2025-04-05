
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { initializeTelegram } from '@/utils/telegramInit';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  // Инициализируем Telegram WebApp при загрузке
  useEffect(() => {
    initializeTelegram();
    
    // Автоматически перенаправляем в игру если открыто в Telegram
    if (isTelegramWebAppAvailable()) {
      setTimeout(() => {
        navigate('/game');
      }, 500);
    }
  }, [navigate]);

  const startGame = () => {
    navigate('/game');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Crypto Civilization
          </h1>
          <p className="text-xl text-gray-300">
            Построй свою криптовалютную империю!
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <Button
            size="lg"
            className="w-full py-6 text-lg"
            onClick={startGame}
          >
            Начать игру
          </Button>
          
          {!isTelegramWebAppAvailable() && (
            <p className="text-sm text-gray-400">
              Для лучшего опыта рекомендуем играть в Telegram
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
