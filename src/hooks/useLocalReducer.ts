
import { useReducer } from 'react';

/**
 * Хук для локального использования редьюсера без react-redux
 * @param reducer Функция-редьюсер
 * @param initialState Начальное состояние
 * @returns [state, dispatch] - состояние и функция отправки действий
 */
export function useLocalReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
) {
  return useReducer(reducer, initialState);
}
