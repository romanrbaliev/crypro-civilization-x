import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/hooks/useGame';
import { loadGameFromServer, getUserIdentifier, checkReferralInfo } from '@/api/gameDataService';
import { saveReferralInfo } from '@/api/referralService';

const StartScreen = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingSave, setHasExistingSave] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);
  
  useEffect(() => {
    // Предотвращаем повторные запросы после первой попытки загрузки
    if (loadAttempted) {
      return;
    }
    
    const checkForSavedGame = async () => {
      setIsLoading(true);
      setLoadAttempted(true);
      
      try {
        // Получаем текущий ID пользователя
        const currentUserId = await getUserIdentifier();
        
        // Генерируем реферальный код, если его нет
        if (!state.referralCode) {
          const newCode = Array.from({ length: 8 }, () => 
              Math.floor(Math.random() * 16).toString(16).toUpperCase()
          ).join('');
          
          dispatch({ 
            type: "LOAD_GAME", 
            payload: { ...state, referralCode: newCode } 
          });
        }

        // Проверяем наличие реферального кода в URL
        const referrerCode = extractReferralCodeFromUrl();
        
        if (referrerCode) {
          // Сохраняем информацию о том, кто пригласил этого пользователя
          dispatch({ 
            type: "LOAD_GAME", 
            payload: { 
              ...state,
              referredBy: referrerCode
            } 
          });
          
          // Обновляем реферальную информацию в базе данных
          await checkReferralInfo(currentUserId, referrerCode);
        }
        
        // Пытаемся загрузить сохраненную игру
        const savedGame = await loadGameFromServer();
        
        if (savedGame) {
          // Проверяем реферальный код и устанавливаем, если отсутствует
          if (!savedGame.referralCode) {
            const newCode = Array.from({ length: 8 }, () => 
              Math.floor(Math.random() * 16).toString(16).toUpperCase()
            ).join('');
            
            savedGame.referralCode = newCode;
          }
          
          // Фиксируем, что игра запущена
          savedGame.gameStarted = true;
          
          // Обновляем состояние с данными о рефералах
          setHasExistingSave(true);
          
          // Убедимся, что USDT не разблокирован при новой игре
          if (savedGame.resources && savedGame.resources.usdt) {
            savedGame.resources.usdt.unlocked = false;
            if (savedGame.counters.applyKnowledge && savedGame.counters.applyKnowledge.value >= 2) {
              savedGame.resources.usdt.unlocked = true;
            }
          }
          
          dispatch({ type: "LOAD_GAME", payload: savedGame });
          
          // Принудительно обновляем информацию в таблице referral_data
          await saveReferralInfo(savedGame.referralCode, state.referredBy || null);
          
          // Принудительно запрашиваем обновление статусов рефералов из БД
          setTimeout(() => {
            const refreshEvent = new CustomEvent('refresh-referrals');
            window.dispatchEvent(refreshEvent);
          }, 500);
          
          // Автоматически перенаправляем на экран игры
          navigate('/game');
        } else {
          setHasExistingSave(false);
          
          // Сразу сохраняем реферальную информацию для нового пользователя
          if (state.referralCode) {
            await saveReferralInfo(state.referralCode, state.referredBy || null);
          }
          
          // Сразу запускаем новую игру и перенаправляем на экран игры
          dispatch({ type: "START_GAME" });
          navigate('/game');
        }
      } catch (error) {
        console.error('Ошибка при проверке сохранений:', error);
        setHasExistingSave(false);
        
        // Даже при ошибке запускаем новую игру и переходим на игровой экран
        dispatch({ type: "START_GAME" });
        navigate('/game');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForSavedGame();
  }, [dispatch, state.referralCode, navigate, state.referredBy, loadAttempted]);
  
  // Извлечение реферального кода из URL-параметра start
  const extractReferralCodeFromUrl = () => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      // В Telegram стартовые параметры доступны через initDataUnsafe.start_param
      // или через startapp для прямого запуска mini app
      if (tg.initDataUnsafe?.start_param) {
        return tg.initDataUnsafe.start_param;
      }
      
      // Проверяем на наличие startapp параметра
      if (tg.initDataUnsafe?.startapp) {
        return tg.initDataUnsafe.startapp;
      }
    }
    
    // Проверка параметра URL для веб-версии
    const urlParams = new URLSearchParams(window.location.search);
    const startParam = urlParams.get('start') || urlParams.get('startapp');
    
    return startParam;
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-4 text-gray-600">Загрузка игры...</p>
      </div>
    </div>
  );
};

export default StartScreen;
