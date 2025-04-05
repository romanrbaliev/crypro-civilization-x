
import { GameState, Resource, ResourceType } from '../context/types';

export class GameStateService {
  processGameStateUpdate(state: GameState): GameState {
    // Создаем копию состояния для безопасного обновления
    const newState = { ...state };
    const resources = { ...state.resources };
    
    // Обновляем timestamp последнего обновления
    newState.lastUpdate = Date.now();
    
    // Обновляем ресурсы, если необходимо
    newState.resources = resources;
    
    return newState;
  }
  
  performFullStateSync(state: GameState): GameState {
    // Полное обновление состояния
    const newState = { ...state };
    
    newState.lastUpdate = Date.now();
    newState.lastSaved = Date.now();
    
    return newState;
  }
}
