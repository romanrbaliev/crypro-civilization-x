
import { GameState } from '../../types';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { roles } from '@/utils/gameConfig';

// Обработка выбора специализации
export const processChooseSpecialization = (
  state: GameState,
  payload: { specializationType: string } // Изменяем с roleId на specializationType для совместимости
): GameState => {
  const { specializationType: roleId } = payload; // Извлекаем roleId из specializationType
  
  // Проверяем, существует ли роль и доступна ли она на текущей фазе
  if (!roles[roleId] || roles[roleId].phase > state.phase) {
    safeDispatchGameEvent(`Специализация недоступна на текущей фазе игры`, 'error');
    return state;
  }
  
  // Если специализация уже выбрана и это та же самая, ничего не делаем
  if (state.specialization === roleId) {
    safeDispatchGameEvent(`Специализация "${roles[roleId].name}" уже выбрана`, 'info');
    return state;
  }
  
  // Сохраняем выбранную специализацию
  const newState = {
    ...state,
    specialization: roleId
  };
  
  // Отправляем событие об успешном выборе специализации
  safeDispatchGameEvent(`Выбрана специализация: ${roles[roleId].name}`, 'success');
  
  return newState;
};
