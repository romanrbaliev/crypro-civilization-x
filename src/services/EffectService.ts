
import { GameState, Resource, ResourceType } from '@/context/types';

// Сервис для обработки эффектов в игре
export class EffectService {
  // Метод для добавления эффектов от зданий
  addBuildingEffects(state: GameState): GameState {
    const newState = { ...state };
    const resources = { ...state.resources };
    
    // Создаем bitcoin ресурс, если он еще не существует
    if (!resources.bitcoin) {
      resources.bitcoin = {
        id: 'bitcoin',
        name: 'Bitcoin',
        description: 'Bitcoin - первая и основная криптовалюта',
        type: 'currency' as ResourceType,
        icon: 'bitcoin',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 0.01,
        unlocked: true,
        consumption: 0
      };
    }
    
    newState.resources = resources;
    return newState;
  }
  
  // Другие методы для обработки эффектов
}
