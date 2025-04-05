
import { useCallback } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

export const useActionButtons = () => {
  const { state, dispatch } = useGame();

  const handleLearn = useCallback(() => {
    // Увеличиваем знания при изучении
    dispatch({
      type: 'INCREMENT_RESOURCE',
      payload: { resourceId: 'knowledge', amount: 1 }
    });

    // Увеличиваем счетчик изучения
    dispatch({
      type: 'INCREMENT_COUNTER',
      payload: { counterId: 'learn', amount: 1 }
    });
  }, [dispatch]);

  const handleApplyKnowledge = useCallback(() => {
    // Применяем знания
    dispatch({ type: 'APPLY_KNOWLEDGE' });

    // Увеличиваем счетчик применения знаний
    dispatch({
      type: 'INCREMENT_COUNTER',
      payload: { counterId: 'applyKnowledge', amount: 1 }
    });
  }, [dispatch]);

  const handleApplyAllKnowledge = useCallback(() => {
    // Применяем все знания
    dispatch({ type: 'APPLY_ALL_KNOWLEDGE' });

    // Увеличиваем счетчик применения всех знаний
    dispatch({
      type: 'INCREMENT_COUNTER',
      payload: { counterId: 'applyAllKnowledge', amount: 1 }
    });
  }, [dispatch]);

  const handleMiningPower = useCallback(() => {
    // Проверяем наличие вычислительной мощности
    if (!state.resources.computingPower || state.resources.computingPower.value <= 0) {
      safeDispatchGameEvent('Недостаточно вычислительной мощности', 'error');
      return;
    }

    // Запускаем майнинг
    dispatch({ type: 'MINING_POWER' });

    // Увеличиваем счетчик майнинга
    dispatch({
      type: 'INCREMENT_COUNTER',
      payload: { counterId: 'mining', amount: 1 }
    });
  }, [dispatch, state.resources.computingPower]);

  const handleExchangeBtc = useCallback(() => {
    // Проверяем наличие биткоинов
    if (!state.resources.bitcoin || state.resources.bitcoin.value <= 0) {
      safeDispatchGameEvent('Нет биткоинов для обмена', 'error');
      return;
    }

    // Обмениваем биткоины на USDT
    dispatch({ type: 'EXCHANGE_BTC' });

    // Увеличиваем счетчик обмена биткоинов
    dispatch({
      type: 'INCREMENT_COUNTER',
      payload: { counterId: 'exchangeBtc', amount: 1 }
    });
  }, [dispatch, state.resources.bitcoin]);

  return {
    handleLearn,
    handleApplyKnowledge,
    handleApplyAllKnowledge,
    handleMiningPower,
    handleExchangeBtc
  };
};

export default useActionButtons;
