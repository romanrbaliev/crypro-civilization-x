
import { GameState } from '@/context/types';
import { updateResourceMaxValues } from '@/utils/resourceUtils';

/**
 * Сервис для работы с состоянием игры
 */
export class GameStateService {
  /**
   * Выполняет полную синхронизацию состояния игры
   * Обновляет максимальные значения ресурсов и другие зависимые параметры
   */
  performFullStateSync(state: GameState): GameState {
    let updatedState = { ...state };
    
    // Обновляем максимальные значения ресурсов
    updatedState = updateResourceMaxValues(updatedState);
    
    return updatedState;
  }
}
