
import { useEffect, useState } from 'react';
import { GameState, GameDispatch } from '@/context/types';
import { getResourceFormat } from '@/utils/resourceFormatConfig';

interface FrequentUpdateProps {
  state: GameState;
  dispatch: GameDispatch;
  resourceId?: string;
}

/**
 * Хук для частого обновления модели игры для создания эффекта непрерывного роста ресурсов
 * @param props - Объект с состоянием, диспетчером и идентификатором ресурса
 */
export const useFrequentUpdate = ({ state, dispatch, resourceId = 'default' }: FrequentUpdateProps) => {
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    // Обновление ресурсов каждые 250 мс (4 раза в секунду)
    const updateInterval = setInterval(() => {
      if (isActive && state.gameStarted) {
        // Отправляем запрос на обновление ресурсов
        dispatch({ type: 'UPDATE_RESOURCES' });
      }
    }, 250);
    
    // Проверка наличия производства BTC и корректной работы майнинга
    const btcCheckInterval = setInterval(() => {
      if (isActive && state.gameStarted && state.resources.btc && state.resources.btc.unlocked) {
        const btcResource = state.resources.btc;
        if (btcResource.perSecond > 0 && btcResource.value === 0) {
          console.log("⚠️ BTC не накапливается, хотя скорость производства положительная. Перезапускаем обновление...");
          dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
        }
      }
    }, 5000); // Проверка каждые 5 секунд
    
    // Очистка при размонтировании
    return () => {
      clearInterval(updateInterval);
      clearInterval(btcCheckInterval);
    };
  }, [dispatch, resourceId, isActive, state.gameStarted, state.resources.btc]);
  
  // Возвращаем функцию для управления состоянием активности
  return {
    setActive: setIsActive,
    isActive
  };
};

export default useFrequentUpdate;
