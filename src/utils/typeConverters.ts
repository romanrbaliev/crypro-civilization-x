
import { GameState as TypesGameState } from '@/types/game';
import { GameState as ContextGameState } from '@/context/types';

/**
 * Функция-помощник для безопасного преобразования типов GameState
 * Используется для совместимости между разными определениями GameState
 */
export function convertGameState<T extends TypesGameState | ContextGameState>(state: any): T {
  return state as T;
}
