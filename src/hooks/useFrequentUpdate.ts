
import { useEffect, useState, useCallback } from 'react';
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
  
  // Проверка наличия БТС ресурса
  const hasBtc = state?.resources?.btc?.unlocked || false;
  
  // Функция обновления ресурсов
  const updateResources = useCallback(() => {
    if (isActive && state?.gameStarted) {
      // Отправляем запрос на обновление ресурсов
      dispatch({ type: 'UPDATE_RESOURCES' });
    }
  }, [isActive, state?.gameStarted, dispatch]);
  
  // Функция проверки ресурса BTC
  const checkBtcResource = useCallback(() => {
    if (isActive && state?.gameStarted && state?.resources?.btc?.unlocked) {
      const btcResource = state.resources.btc;
      if (btcResource?.perSecond > 0 && btcResource?.value === 0) {
        console.log("⚠️ BTC не накапливается, хотя скорость производства положительная. Перезапускаем обновление...");
        dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
      }
    }
  }, [isActive, state?.gameStarted, state?.resources?.btc, dispatch]);
  
  // Основной интервал обновления
  useEffect(() => {
    // Обновление ресурсов каждые 250 мс (4 раза в секунду)
    const updateInterval = setInterval(updateResources, 250);
    
    // Очистка при размонтировании
    return () => {
      clearInterval(updateInterval);
    };
  }, [updateResources]);
  
  // Отдельный интервал для проверки BTC
  useEffect(() => {
    // Проверка BTC каждые 5 секунд
    const btcCheckInterval = setInterval(checkBtcResource, 5000);
    
    // Очистка при размонтировании
    return () => {
      clearInterval(btcCheckInterval);
    };
  }, [checkBtcResource]);
  
  // Возвращаем функцию для управления состоянием активности
  return {
    setActive: setIsActive,
    isActive
  };
};

export default useFrequentUpdate;
