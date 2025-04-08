
import { GameState } from '../types';

export const processIncrementCounter = (
  state: GameState,
  payload: { counterId: string; amount: number }
): GameState => {
  const { counterId, amount } = payload;
  const counter = state.counters[counterId];
  
  // Если счетчик не существует, создаем его
  if (!counter) {
    return {
      ...state,
      counters: {
        ...state.counters,
        [counterId]: {
          id: counterId,
          value: amount
        }
      }
    };
  }
  
  // Инкрементируем счетчик
  return {
    ...state,
    counters: {
      ...state.counters,
      [counterId]: {
        ...counter,
        value: counter.value + amount
      }
    }
  };
};
