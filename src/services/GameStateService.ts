
import { GameState } from '../context/types';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { EffectService } from './EffectService';
import { updateResources, calculateResourceProduction } from '@/context/reducers/resourceUpdateReducer';

export class GameStateService {
  private effectService: EffectService;
  
  constructor() {
    this.effectService = new EffectService();
  }
  
  processGameStateUpdate(state: GameState, deltaTime?: number): GameState {
    // Создаем копию состояния для безопасного обновления
    let newState = { ...state };
    
    // Если deltaTime не передан, расчитываем его на основе lastUpdate
    const actualDeltaTime = deltaTime || (Date.now() - newState.lastUpdate);
    
    // Обновляем timestamp последнего обновления
    newState.lastUpdate = Date.now();
    
    // Обновляем ресурсы на основе прошедшего времени
    newState = updateResources(newState, actualDeltaTime);
    
    // Рассчитываем производство ресурсов от зданий
    newState = calculateResourceProduction(newState);
    
    // Добавляем эффекты от зданий
    newState = this.effectService.addBuildingEffects(newState);
    
    // Обновляем эффекты потребления ресурсов
    newState = this.effectService.updateConsumptionEffects(newState);
    
    // Проверяем все разблокировки
    newState = checkAllUnlocks(newState);
    
    return newState;
  }
  
  performFullStateSync(state: GameState): GameState {
    // Полное обновление состояния
    let newState = { ...state };
    
    // Обновляем timestamp последнего обновления и сохранения
    newState.lastUpdate = Date.now();
    newState.lastSaved = Date.now();
    
    // Производим полное обновление состояния
    newState = this.processGameStateUpdate(newState);
    
    // Форсированно проверяем все разблокировки
    newState = checkAllUnlocks(newState);
    
    return newState;
  }
}
