
import { processPurchaseBuilding } from './purchaseBuilding';

// Заглушки для остальных функций
const processSellBuilding = (state: any, payload: any) => {
  // Заглушка для функции продажи здания
  return state;
};

const processChooseSpecialization = (state: any, payload: any) => {
  // Заглушка для функции выбора специализации
  return state;
};

export {
  processPurchaseBuilding,
  processSellBuilding,
  processChooseSpecialization
};
