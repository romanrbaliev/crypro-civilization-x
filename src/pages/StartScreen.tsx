
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/hooks/useGame';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { loadGameFromServer, getUserIdentifier, checkReferralInfo, getUserReferrals } from '@/api/gameDataService';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { saveReferralInfo } from '@/api/referralService';
import { supabase } from '@/integrations/supabase/client';

const StartScreen = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingSave, setHasExistingSave] = useState(false);
  const [referralInfo, setReferralInfo] = useState<string | null>(null);
  const [telegramInfo, setTelegramInfo] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Загружаем информацию о Telegram пользователе при монтировании
  useEffect(() => {
    // Получаем и отображаем Telegram информацию, если доступно
    if (isTelegramWebAppAvailable() && window.Telegram?.WebApp) {
      try {
        const tg = window.Telegram.WebApp;
        if (tg.initDataUnsafe?.user) {
          const user = tg.initDataUnsafe.user;
          setTelegramInfo(`Telegram: ${user.first_name || ''} ${user.last_name || ''} (ID: ${user.id})`);
          console.log('Информация о пользователе Telegram:', user);
        } else {
          console.log('Telegram WebApp доступен, но данные пользователя отсутствуют');
        }
      } catch (error) {
        console.error('Ошибка при получении информации Telegram:', error);
      }
    } else {
      console.log('Telegram WebApp недоступен');
    }
    
    // Загружаем ID пользователя
    getUserIdentifier().then(id => {
      setUserId(id);
      console.log('Установлен ID пользователя:', id);
    });
  }, []);
  
  useEffect(() => {
    const checkForSavedGame = async () => {
      setIsLoading(true);
      
      try {
        // Получаем текущий ID пользователя
        const currentUserId = await getUserIdentifier();
        console.log('Проверка сохранений для пользователя ID:', currentUserId);
        
        // Генерируем реферальный код, если его нет
        if (!state.referralCode) {
          const newCode = Array.from({ length: 8 }, () => 
              Math.floor(Math.random() * 16).toString(16).toUpperCase()
          ).join('');
          
          dispatch({ 
            type: "LOAD_GAME", 
            payload: { ...state, referralCode: newCode } 
          });
          
          console.log('✅ Сгенерирован новый реферальный код:', newCode);
        }

        // Проверяем наличие реферального кода в URL (если игра запущена из Telegram)
        const referrerCode = extractReferralCodeFromUrl();
        console.log('Обнаружен реферальный код:', referrerCode);
        
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
          setReferralInfo(`Вы пришли по реферальной ссылке: ${referrerCode}`);
          
          // Обновляем реферальную информацию в базе данных
          await checkReferralInfo(state.referralCode || '', referrerCode);
        }
        
        // Пытаемся загрузить сохраненную игру
        const savedGame = await loadGameFromServer();
        
        if (savedGame) {
          console.log('Загружено сохранение:', savedGame);
          
          // ВАЖНО: Не изменяем статус активации рефералов при загрузке
          // Просто загружаем рефералов из сохранения как есть
          
          // Проверяем реферальный код и устанавливаем, если отсутствует
          if (!savedGame.referralCode) {
            const newCode = Array.from({ length: 8 }, () => 
              Math.floor(Math.random() * 16).toString(16).toUpperCase()
            ).join('');
            
            savedGame.referralCode = newCode;
            console.log('Установлен реферальный код:', savedGame.referralCode);
          }
          
          // Обновляем состояние с данными о рефералах
          setHasExistingSave(true);
          dispatch({ type: "LOAD_GAME", payload: savedGame });
          safeDispatchGameEvent("Игра успешно загружена из облака", "success");
          
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
          safeDispatchGameEvent("Новая игра создана", "info");
          
          // Сразу сохраняем реферальную информацию для нового пользователя
          if (state.referralCode) {
            await saveReferralInfo(state.referralCode, state.referredBy || null);
            console.log('✅ Сохранена реферальная информация для нового пользователя');
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
  }, [dispatch, state.referralCode, navigate, state.referredBy]);
  
  // Извлечение реферального кода из URL-параметра start
  const extractReferralCodeFromUrl = () => {
    if (isTelegramWebAppAvailable() && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      // В Telegram стартовые параметры доступны через initDataUnsafe.start_param
      // или через startapp для прямого запуска mini app
      if (tg.initDataUnsafe?.start_param) {
        console.log('Обнаружен start_param в Telegram:', tg.initDataUnsafe.start_param);
        return tg.initDataUnsafe.start_param;
      }
      
      // Проверяем на наличие startapp параметра
      if (tg.initDataUnsafe?.startapp) {
        console.log('Обнаружен startapp параметр в Telegram:', tg.initDataUnsafe.startapp);
        return tg.initDataUnsafe.startapp;
      }
    }
    
    // Проверка параметра URL для веб-версии
    const urlParams = new URLSearchParams(window.location.search);
    const startParam = urlParams.get('start') || urlParams.get('startapp');
    
    return startParam;
  };

  // Эта функция теперь не будет вызвана пользователем, 
  // так как мы автоматически перенаправляем на экран игры
  const handleStartGame = () => {
    if (state.gameStarted || hasExistingSave) {
      navigate('/game');
      return;
    }
    
    dispatch({ type: "START_GAME" });
    navigate('/game');
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
