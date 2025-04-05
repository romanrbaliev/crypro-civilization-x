
import { GameState } from '../../types';

interface ChooseSpecializationPayload {
  specializationType: string;
}

/**
 * Обработчик для выбора специализации игрока
 */
export const processChooseSpecialization = (
  state: GameState,
  payload: ChooseSpecializationPayload
): GameState => {
  const { specializationType } = payload;
  
  if (!specializationType) {
    console.error('Не указан тип специализации');
    return state;
  }
  
  return {
    ...state,
    player: {
      ...state.player,
      specialization: specializationType
    },
    unlocks: {
      ...state.unlocks,
      specialization: true
    }
  };
};
