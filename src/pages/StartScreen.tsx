
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/hooks/useGame';
import GameIntro from '@/components/GameIntro';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { loadGameFromServer, getUserIdentifier, checkReferralInfo } from '@/api/gameDataService';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

const StartScreen = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingSave, setHasExistingSave] = useState(false);
  
  useEffect(() => {
    const checkForSavedGame = async () => {
      setIsLoading(true);
      
      try {
        // Проверяем наличие реферального кода в URL (если игра запущена из Telegram)
        const referrerCode = extractReferralCodeFromUrl();
        console.log('Detected referral code:', referrerCode);
        
        if (referrerCode) {
          // Сохраняем информацию о том, кто пригласил этого пользователя
          dispatch({ 
            type: "LOAD_GAME", 
            payload: { 
              ...state,
              referredBy: referrerCode
            } 
          });
          
          // Отправляем событие о том, что пользователь пришел по реферальной ссылке
          safeDispatchGameEvent(`Переход по реферальной ссылке: ${referrerCode}`, "info");
          
          // Обновляем реферальную информацию в базе данных
          await checkReferralInfo(state.referralCode || '', referrerCode);
        }
        
        // Пытаемся загрузить сохраненную игру
        const savedGame = await loadGameFromServer();
        
        if (savedGame) {
          setHasExistingSave(true);
          dispatch({ type: "LOAD_GAME", payload: savedGame });
          safeDispatchGameEvent("Игра успешно загружена из облака", "success");
        } else {
          setHasExistingSave(false);
        }
      } catch (error) {
        console.error('Ошибка при проверке сохранений:', error);
        setHasExistingSave(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForSavedGame();
  }, [dispatch, state.referralCode]);
  
  // Извлечение реферального кода из URL-параметра start
  const extractReferralCodeFromUrl = () => {
    if (isTelegramWebAppAvailable() && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      // В Telegram стартовые параметры доступны через initDataUnsafe.start_param
      if (tg.initDataUnsafe && tg.initDataUnsafe.start_param) {
        return tg.initDataUnsafe.start_param;
      }
    }
    
    // Проверка параметра URL для веб-версии
    const urlParams = new URLSearchParams(window.location.search);
    const startParam = urlParams.get('start');
    
    return startParam;
  };
  
  const handleStartGame = () => {
    // Если игра уже запущена, просто перенаправляем на экран игры
    if (state.gameStarted || hasExistingSave) {
      navigate('/game');
      return;
    }
    
    // Иначе запускаем новую игру
    dispatch({ type: "START_GAME" });
    navigate('/game');
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-between p-4 bg-gray-50">
      <div className="w-full max-w-md mx-auto mt-8">
        <div className="flex justify-center mb-6">
          <Logo size="large" />
        </div>
        
        <GameIntro />
        
        <div className="mt-8 space-y-4">
          <Button 
            disabled={isLoading}
            onClick={handleStartGame} 
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Загрузка...' : hasExistingSave ? 'Продолжить игру' : 'Начать игру'}
          </Button>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mt-auto pt-4">
        Версия 0.1.0 (Alpha)
      </div>
    </div>
  );
};

export default StartScreen;
