
import { processPurchaseBuilding } from './building/purchaseBuilding';
import { processSellBuilding } from './building/sellBuilding';
import { checkBuildingUnlocks } from './building/unlockBuildings';
import { processChooseSpecialization } from './building/chooseSpecialization';

export {
  processPurchaseBuilding,
  processSellBuilding,
  checkBuildingUnlocks,
  processChooseSpecialization
};

// Функция-помощник для обновления счетчика общих зданий
export const updateTotalBuildingsCounter = (state) => {
  return {
    ...state,
    counters: {
      ...state.counters,
      totalBuildings: {
        value: (typeof state.counters.totalBuildings === 'object' && state.counters.totalBuildings.value !== undefined ? 
          state.counters.totalBuildings.value : 
          (typeof state.counters.totalBuildings === 'number' ? state.counters.totalBuildings : 0)) + 1,
        updatedAt: Date.now()
      }
    }
  };
};
