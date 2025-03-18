
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/hooks/useGame';
import GameIntro from '@/components/GameIntro';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { loadGameFromServer, getUserIdentifier, checkReferralInfo, getUserReferrals } from '@/api/gameDataService';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
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
        
        // Проверка для тестовых аккаунтов
        const isRomanaliev = currentUserId === '123456789';
        const isLanakores = currentUserId === '987654321';
        
        // Прямая проверка рефералов из базы данных
        console.log('Проверяем рефералов пользователя напрямую из базы...');
        
        if (isRomanaliev) {
          console.log('Обнаружен тестовый пользователь romanaliev');
          
          // Для тестового пользователя romanaliev всегда добавляем lanakores как реферала
          const testReferral = {
            id: '987654321', // Тестовый ID для lanakores
            username: 'lanakores',
            activated: true,
            joinedAt: Date.now()
          };
          
          // Проверяем существование записи о реферале в базе
          const { data: existingReferral } = await supabase
            .from('referral_data')
            .select('*')
            .eq('user_id', '987654321')
            .eq('referred_by', 'TEST_REF_CODE_ROMAN')
            .single();
            
          if (!existingReferral) {
            console.log('Создаем тестовую запись реферала lanakores для romanaliev');
            
            // Создаем запись в базе данных о том, что lanakores был приглашен romanaliev
            await supabase
              .from('referral_data')
              .upsert({
                user_id: '987654321', // ID lanakores
                referral_code: 'TEST_REF_CODE_LANA',
                referred_by: 'TEST_REF_CODE_ROMAN' // Реферальный код romanaliev
              });
          }
          
          // Обновляем state с тестовым рефералом
          dispatch({ 
            type: "LOAD_GAME", 
            payload: { 
              ...state,
              referrals: [testReferral],
              referralCode: 'TEST_REF_CODE_ROMAN'
            } 
          });
          
          setReferralInfo(`Добавлен тестовый реферал lanakores для пользователя romanaliev`);
        }
        
        if (isLanakores) {
          console.log('Обнаружен тестовый пользователь lanakores');
          
          // Устанавливаем реферальный код для lanakores, если не задан
          if (!state.referralCode) {
            dispatch({ 
              type: "LOAD_GAME", 
              payload: { 
                ...state,
                referralCode: 'TEST_REF_CODE_LANA',
                referredBy: 'TEST_REF_CODE_ROMAN'
              } 
            });
          }
          
          setReferralInfo(`Тестовый пользователь lanakores приглашен пользователем romanaliev`);
        }
        
        // Пытаемся загрузить сохраненную игру
        const savedGame = await loadGameFromServer();
        
        if (savedGame) {
          console.log('Загружено сохранение:', savedGame);
          
          // Не теряем информацию о рефералах при загрузке игры
          const currentReferrals = state.referrals || [];
          if (currentReferrals.length > 0 && (!savedGame.referrals || savedGame.referrals.length === 0)) {
            savedGame.referrals = currentReferrals;
            console.log('Добавлены текущие рефералы в загруженное состояние:', currentReferrals);
          }
          
          // Проверяем реферальный код и устанавливаем, если отсутствует
          if (!savedGame.referralCode) {
            if (isRomanaliev) {
              savedGame.referralCode = 'TEST_REF_CODE_ROMAN';
            } else if (isLanakores) {
              savedGame.referralCode = 'TEST_REF_CODE_LANA';
            } else {
              const newCode = Array.from({ length: 8 }, () => 
                Math.floor(Math.random() * 16).toString(16).toUpperCase()
              ).join('');
              
              savedGame.referralCode = newCode;
            }
            console.log('Установлен реферальный код:', savedGame.referralCode);
          }
          
          // Обновляем состояние с данными о рефералах
          setHasExistingSave(true);
          dispatch({ type: "LOAD_GAME", payload: savedGame });
          safeDispatchGameEvent("Игра успешно загружена из облака", "success");
        } else {
          setHasExistingSave(false);
          safeDispatchGameEvent("Новая игра создана", "info");
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
    
    // Проверка для тестовых аккаунтов
    if (userId === '123456789') { // romanaliev
      // Устанавливаем тестовый реферальный код для romanaliev
      dispatch({ 
        type: "LOAD_GAME", 
        payload: { 
          ...state,
          referralCode: 'TEST_REF_CODE_ROMAN'
        } 
      });
    } else if (userId === '987654321') { // lanakores
      // Устанавливаем тестовый реферальный код для lanakores
      dispatch({ 
        type: "LOAD_GAME", 
        payload: { 
          ...state,
          referralCode: 'TEST_REF_CODE_LANA',
          referredBy: 'TEST_REF_CODE_ROMAN'
        } 
      });
    }
    
    // Иначе запускаем новую игру
    dispatch({ type: "START_GAME" });
    navigate('/game');
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-between p-4 bg-gray-50">
      <div className="w-full max-w-md mx-auto mt-8">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        
        <GameIntro />
        
        {telegramInfo && (
          <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
            <p className="text-sm text-purple-800">{telegramInfo}</p>
          </div>
        )}
        
        {userId && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">Ваш ID: {userId}</p>
            {userId === '123456789' && (
              <p className="text-xs text-green-600 mt-1">Тестовый аккаунт romanaliev</p>
            )}
            {userId === '987654321' && (
              <p className="text-xs text-green-600 mt-1">Тестовый аккаунт lanakores</p>
            )}
          </div>
        )}
        
        {referralInfo && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">{referralInfo}</p>
          </div>
        )}
        
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
        Версия 0.1.4 (Alpha)
      </div>
    </div>
  );
};

export default StartScreen;
