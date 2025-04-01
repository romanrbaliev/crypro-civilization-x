
import { GameState } from '@/context/types';

// Определяем интерфейс для параметров специализации
interface SpecializationParams {
  specializationType: string;
}

// Обрабатываем выбор специализации
export const processSpecialization = (state: GameState, payload: SpecializationParams): GameState => {
  const { specializationType } = payload;
  
  console.log(`Выбрана специализация: ${specializationType}`);
  
  // Обновляем состояние
  const newState = {
    ...state,
    specialization: specializationType
  };
  
  // Можно добавить дополнительную логику обработки специализации здесь
  
  return newState;
};

// Для обратной совместимости
export const processChooseSpecialization = processSpecialization;
