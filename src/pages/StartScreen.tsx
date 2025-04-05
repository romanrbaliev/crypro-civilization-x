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
    if (loadAttempted) {
      return;
    }
    
    const checkForSavedGame = async () => {
      setIsLoading(true);
      setLoadAttempted(true);
      
      try {
        const currentUserId = await getUserIdentifier();
        
        if (!state.referralCode) {
          const newCode = Array.from({ length: 8 }, () => 
              Math.floor(Math.random() * 16).toString(16).toUpperCase()
          ).join('');
          
          dispatch({ 
            type: "LOAD_GAME", 
            payload: { ...state, referralCode: newCode } 
          });
        }
        
        const referrerCode = extractReferralCodeFromUrl();
        
        if (referrerCode) {
          dispatch({ 
            type: "LOAD_GAME", 
            payload: { 
              ...state,
              referredBy: referrerCode
            } 
          });
          
          await checkReferralInfo(currentUserId, referrerCode);
        }
        
        const savedGame = await loadGameFromServer();
        
        if (savedGame) {
          const castedGame = savedGame as unknown as import('@/types/game').GameState;
          
          if (!savedGame.referralCode) {
            const newCode = Array.from({ length: 8 }, () => 
              Math.floor(Math.random() * 16).toString(16).toUpperCase()
            ).join('');
            
            savedGame.referralCode = newCode;
          }
          
          savedGame.gameStarted = true;
          
          if (savedGame.resources && savedGame.resources.usdt) {
            savedGame.resources.usdt.unlocked = false;
            if (savedGame.counters && 
                savedGame.counters.applyKnowledge && 
                savedGame.counters.applyKnowledge.value >= 2) {
              savedGame.resources.usdt.unlocked = true;
              savedGame.unlocks.usdt = true;
            } else {
              savedGame.resources.usdt.unlocked = false;
              savedGame.unlocks.usdt = false;
            }
          }
          
          setHasExistingSave(true);
          
          dispatch({ type: "LOAD_GAME", payload: savedGame });
          
          await saveReferralInfo(savedGame.referralCode, state.referredBy || null);
          
          setTimeout(() => {
            const refreshEvent = new CustomEvent('refresh-referrals');
            window.dispatchEvent(refreshEvent);
          }, 500);
          
          navigate('/game');
        } else {
          setHasExistingSave(false);
          
          if (state.referralCode) {
            await saveReferralInfo(state.referralCode, state.referredBy || null);
          }
          
          dispatch({ type: "START_GAME" });
          navigate('/game');
        }
      } catch (error) {
        console.error('Ошибка при проверке сохранений:', error);
        setHasExistingSave(false);
        
        dispatch({ type: "START_GAME" });
        navigate('/game');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForSavedGame();
  }, [dispatch, state.referralCode, navigate, state.referredBy, loadAttempted]);
  
  const extractReferralCodeFromUrl = () => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      if (tg.initDataUnsafe?.start_param) {
        return tg.initDataUnsafe.start_param;
      }
      
      if (tg.initDataUnsafe?.startapp) {
        return tg.initDataUnsafe.startapp;
      }
    }
    
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
