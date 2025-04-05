
import { GameState } from '@/types/game';

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
  
  return {
    ...state,
    specialization: specializationType
  };
}
