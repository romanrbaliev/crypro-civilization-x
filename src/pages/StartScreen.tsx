
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
  
  useEffect(() => {
    const checkForSavedGame = async () => {
      setIsLoading(true);
      
      try {
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
        
        // Получаем ID пользователя для отладки
        const userId = await getUserIdentifier();
        console.log('Текущий пользователь ID:', userId);
        
        // Проверяем наличие рефералов напрямую из таблицы referral_data
        try {
          // Проверим, является ли текущий пользователь romanaliev
          if (userId === 'tg_romanaliev') {
            console.log('Обнаружен пользователь romanaliev, проверяем рефералов...');
            
            // Получаем код реферала пользователя
            const { data: userData } = await supabase
              .from('referral_data')
              .select('referral_code')
              .eq('user_id', userId)
              .single();
              
            if (userData && userData.referral_code) {
              console.log('Реферальный код пользователя:', userData.referral_code);
              
              // Ищем пользователей, которые указали этот код как пригласивший
              const { data: referrals } = await supabase
                .from('referral_data')
                .select('user_id, created_at')
                .eq('referred_by', userData.referral_code);
                
              console.log('Найденные рефералы:', referrals);
              
              // Если есть рефералы, форматируем их для загрузки в состояние
              if (referrals && referrals.length > 0) {
                const formattedReferrals = referrals.map(ref => ({
                  id: ref.user_id,
                  username: `Пользователь ${ref.user_id.substring(0, 8)}`,
                  activated: true, // Для тестирования указываем true
                  joinedAt: ref.created_at ? new Date(ref.created_at).getTime() : Date.now()
                }));
                
                console.log('Форматированные рефералы для загрузки:', formattedReferrals);
                setReferralInfo(`У вас ${formattedReferrals.length} рефералов`);
              }
            }
          }
        } catch (refError) {
          console.error('Ошибка при проверке рефералов:', refError);
        }
        
        // Пытаемся загрузить сохраненную игру
        const savedGame = await loadGameFromServer();
        
        if (savedGame) {
          // Проверяем наличие рефералов в загруженной игре
          if (savedGame.referrals && savedGame.referrals.length > 0) {
            console.log('Загружены рефералы из сохранения:', savedGame.referrals);
            setReferralInfo(`Загружено ${savedGame.referrals.length} рефералов`);
          } else {
            console.log('В сохранении нет рефералов, пробуем загрузить из базы...');
            
            // Пробуем загрузить рефералов напрямую из базы
            const referralsFromDb = await getUserReferrals();
            console.log('Рефералы из базы данных:', referralsFromDb);
            
            if (referralsFromDb && referralsFromDb.length > 0) {
              // Форматируем рефералов из базы
              const formattedReferrals = referralsFromDb.map(ref => ({
                id: ref.user_id,
                username: `Пользователь ${ref.user_id.substring(0, 8)}`,
                activated: true, // Для тестирования указываем true
                joinedAt: new Date(ref.created_at || Date.now()).getTime()
              }));
              
              // Добавляем рефералов в загруженное состояние
              savedGame.referrals = formattedReferrals;
              console.log('Добавлены рефералы в состояние:', formattedReferrals);
              setReferralInfo(`Добавлено ${formattedReferrals.length} рефералов из базы`);
            }
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
        Версия 0.1.1 (Alpha)
      </div>
    </div>
  );
};

export default StartScreen;
