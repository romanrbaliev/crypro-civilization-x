
import { Building, GameState } from '@/context/types';

/**
 * Расчет текущей стоимости здания с учетом множителя и имеющегося количества
 */
export const calculateCurrentCost = (building: Building): { [key: string]: number } => {
  const result: { [key: string]: number } = {};
  
  if (!building.cost) {
    console.warn(`Здание ${building.id} не имеет cost`);
    return result;
  }
  
  const multiplier = building.costMultiplier || 1.15;
  const count = building.count || 0;
  
  // Применяем формулу для расчета стоимости: базовая_стоимость * множитель^количество
  Object.entries(building.cost).forEach(([resourceId, baseAmount]) => {
    // Расчет нового значения стоимости с округлением вверх
    result[resourceId] = Math.ceil(baseAmount * Math.pow(multiplier, count));
  });
  
  return result;
};

/**
 * Проверка возможности покупки здания
 */
export const canAffordBuilding = (state: GameState, building: Building): boolean => {
  const currentCost = calculateCurrentCost(building);
  
  // Проверяем наличие достаточного количества каждого ресурса
  for (const [resourceId, amount] of Object.entries(currentCost)) {
    const resource = state.resources[resourceId];
    if (!resource || !resource.unlocked || resource.value < amount) {
      return false;
    }
  }
  
  return true;
};

/**
 * Получение ресурсов, которые здание производит и потребляет
 */
export const getBuildingResourceFlow = (building: Building): { 
  produces: { id: string, amount: number }[], 
  consumes: { id: string, amount: number }[] 
} => {
  const produces: { id: string, amount: number }[] = [];
  const consumes: { id: string, amount: number }[] = [];
  
  // Обрабатываем производство ресурсов
  Object.entries(building.production || {}).forEach(([resourceId, amount]) => {
    if (amount > 0) {
      produces.push({ id: resourceId, amount });
    } else if (amount < 0) {
      consumes.push({ id: resourceId, amount: Math.abs(amount) });
    }
  });
  
  // Обрабатываем потребление ресурсов
  Object.entries(building.consumption || {}).forEach(([resourceId, amount]) => {
    if (amount > 0) {
      consumes.push({ id: resourceId, amount });
    }
  });
  
  return { produces, consumes };
};

/**
 * Получение описания эффектов здания в виде текстового представления
 */
export const getBuildingEffectsDescription = (building: Building): string[] => {
  const effects: string[] = [];
  
  // Производство ресурсов
  Object.entries(building.production || {}).forEach(([resourceId, amount]) => {
    if (amount > 0) {
      effects.push(`+${amount} ${resourceId}/сек`);
    } else if (amount < 0) {
      effects.push(`-${Math.abs(amount)} ${resourceId}/сек`);
    }
  });
  
  // Потребление ресурсов
  Object.entries(building.consumption || {}).forEach(([resourceId, amount]) => {
    if (amount > 0) {
      effects.push(`Потребляет ${amount} ${resourceId}/сек`);
    }
  });
  
  // Специальные эффекты из свойства effects
  Object.entries(building.effects || {}).forEach(([effectName, value]) => {
    // Бонусы к максимальным значениям
    if (effectName.endsWith('MaxBonus') && typeof value === 'number') {
      const resourceName = effectName.replace('MaxBonus', '');
      effects.push(`+${value} к максимуму ${resourceName}`);
    }
    // Множители производительности
    else if (effectName.endsWith('ProductionMultiplier') && typeof value === 'number') {
      const resourceName = effectName.replace('ProductionMultiplier', '');
      effects.push(`+${Math.round(value * 100)}% к производству ${resourceName}`);
    }
    // Бонусы эффективности
    else if (effectName.endsWith('EfficiencyBonus') && typeof value === 'number') {
      const targetName = effectName.replace('EfficiencyBonus', '');
      effects.push(`+${Math.round(value * 100)}% к эффективности ${targetName}`);
    }
  });
  
  return effects;
};
