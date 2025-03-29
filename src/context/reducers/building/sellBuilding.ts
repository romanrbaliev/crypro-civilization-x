
import { GameState } from '../../types';
import { updateResourceMaxValues } from '../../utils/resourceUtils';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';

// Обработка продажи здания
export const processSellBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  // Если здание не существует или количество = 0, возвращаем текущее состояние
  if (!building || building.count === 0) {
    console.warn(`Попытка продать несуществующее здание: ${buildingId}`);
    return state;
  }
  
  // Создаем новое состояние с обновленным количеством здания
  const newBuildings = {
    ...state.buildings,
    [buildingId]: {
      ...building,
      count: building.count - 1
    }
  };
  
  console.log(`Продано здание ${building.name}`);
  safeDispatchGameEvent(`Здание ${building.name} продано`, "info");
  
  // Создаем новое состояние (не возвращаем ресурсы при продаже)
  let newState = {
    ...state,
    buildings: newBuildings
  };
  
  // Обновляем максимальные значения ресурсов
  newState = updateResourceMaxValues(newState);
  
  return newState;
};
