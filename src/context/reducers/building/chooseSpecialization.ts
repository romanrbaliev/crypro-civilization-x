
import { GameState } from '@/types/game';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';

/**
 * Обрабатывает выбор специализации игроком
 * @param state Текущее состояние игры
 * @param payload Параметры выбора специализации
 * @returns Обновленное состояние игры
 */
export function processChooseSpecialization(
  state: GameState,
  payload: { specializationType: string }
): GameState {
  const { specializationType } = payload;
  
  console.log(`Выбрана специализация: ${specializationType}`);
  
  // Отправляем уведомление о выборе специализации
  safeDispatchGameEvent(
    `Выбрана специализация: ${specializationType}`,
    "success"
  );
  
  return {
    ...state,
    specialization: specializationType
  };
}
