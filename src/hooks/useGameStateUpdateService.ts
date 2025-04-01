
import { useEffect, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';

// Хук для обновления состояния игры с фиксированным интервалом
export const useGameStateUpdateService = () => {
  const { state, dispatch } = useGame();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Эффект для установки интервала обновления
  useEffect(() => {
    if (!state.gameStarted) return;
    
    console.log('⏱️ useGameStateUpdateService: Устанавливаем интервал обновления ресурсов');
    
    // Установка интервала обновления (каждую секунду)
    timerRef.current = setInterval(() => {
      // ИСПРАВЛЕНО: Добавлены дополнительные проверки на правильность разблокировки майнера
      const cryptoBasicsPurchased = 
        (state.upgrades.cryptoCurrencyBasics?.purchased === true) || 
        (state.upgrades.cryptoBasics?.purchased === true);
      
      // Если основы криптовалют куплены, но майнер не разблокирован, принудительно пытаемся разблокировать
      if (cryptoBasicsPurchased) {
        const isMinerUnlocked = 
          (state.buildings.miner?.unlocked === true) || 
          (state.buildings.autoMiner?.unlocked === true);
        
        if (!isMinerUnlocked) {
          console.log('⚠️ useGameStateUpdateService: Принудительно проверяем разблокировку майнера');
          
          // Диспатчим специальное действие для проверки разблокировки майнера
          dispatch({ type: 'FORCE_CHECK_MINER_UNLOCK' });
        }
      }
      
      // Обновляем значения ресурсов
      dispatch({ type: 'UPDATE_RESOURCES' });
    }, 1000);
    
    // Очистка интервала при размонтировании
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        console.log('⏱️ useGameStateUpdateService: Интервал обновления ресурсов очищен');
      }
    };
  }, [state.gameStarted, dispatch]);
};

export default useGameStateUpdateService;
