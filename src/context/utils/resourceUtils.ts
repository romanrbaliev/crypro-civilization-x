
import { Resource, Building, ReferralHelper } from '../types';
import { calculateBuildingBoostFromHelpers, calculateHelperBoost } from '@/utils/helpers';

/**
 * Рассчитывает общее производство ресурсов с учетом всех зданий, бустов и помощников
 * @param resources Текущие ресурсы
 * @param buildings Имеющиеся здания
 * @param referralHelpers Помощники рефералов
 * @param referrals Количество активных рефералов 
 * @param myReferralCode Реферальный код пользователя
 * @returns Обновленные ресурсы с учетом всех производителей
 */
export const calculateResourceProduction = (
  resources: { [key: string]: Resource },
  buildings: { [key: string]: Building },
  referralHelpers: ReferralHelper[],
  referrals: any[],
  myReferralCode: string
): { [key: string]: Resource } => {
  const updatedResources = { ...resources };
  
  // Сбрасываем производство в секунду для всех ресурсов
  Object.keys(updatedResources).forEach(resourceId => {
    updatedResources[resourceId] = {
      ...updatedResources[resourceId],
      perSecond: 0
    };
  });
  
  // Рассчитываем базовое производство от зданий с учетом помощников
  Object.values(buildings).forEach(building => {
    if (building.count > 0) {
      // Получаем бонус эффективности от помощников (+5% за каждого помощника)
      const helperBoost = calculateBuildingBoostFromHelpers(building.id, referralHelpers);
      
      // Для каждого типа ресурса, производимого зданием
      Object.entries(building.production).forEach(([resourceId, baseProduction]) => {
        // Пропускаем увеличение максимального хранения
        if (resourceId.endsWith('Max') || resourceId.endsWith('Boost')) return;
        
        // Эффективный уровень производства с учетом количества зданий и бонусов
        const effectiveProduction = baseProduction * building.count * (1 + helperBoost);
        
        if (updatedResources[resourceId]) {
          updatedResources[resourceId] = {
            ...updatedResources[resourceId],
            perSecond: updatedResources[resourceId].perSecond + effectiveProduction
          };
        }
      });
    }
  });
  
  // Добавляем бонус производства от активных рефералов (+5% за каждого)
  const activeReferrals = referrals.filter(ref => ref.activated);
  const referralProductionBoost = activeReferrals.length * 0.05;
  
  // Добавляем бонус от наших собственных помощников (+10% за каждую принятую работу)
  const helperProductionBoost = calculateHelperBoost(myReferralCode, referralHelpers);
  
  // Применяем общий бонус производства ко всем ресурсам
  Object.keys(updatedResources).forEach(resourceId => {
    if (updatedResources[resourceId].perSecond > 0) {
      updatedResources[resourceId] = {
        ...updatedResources[resourceId],
        perSecond: updatedResources[resourceId].perSecond * (1 + referralProductionBoost + helperProductionBoost)
      };
    }
  });
  
  return updatedResources;
};

/**
 * Увеличивает максимальный размер хранилища определенных ресурсов на основе зданий
 * @param resources Текущие ресурсы
 * @param buildings Имеющиеся здания 
 * @returns Обновленные ресурсы с измененными максимальными значениями
 */
export const applyStorageBoosts = (
  resources: { [key: string]: Resource },
  buildings: { [key: string]: Building }
): { [key: string]: Resource } => {
  const updatedResources = { ...resources };
  
  // Применяем увеличение максимального хранения от зданий
  Object.values(buildings).forEach(building => {
    if (building.count > 0) {
      Object.entries(building.production).forEach(([boostId, amount]) => {
        // Проверяем, является ли это бустом максимального хранения
        if (boostId.endsWith('Max')) {
          const resourceId = boostId.replace('Max', '');
          if (updatedResources[resourceId]) {
            updatedResources[resourceId] = {
              ...updatedResources[resourceId],
              max: updatedResources[resourceId].max + (amount * building.count)
            };
          }
        }
      });
    }
  });
  
  return updatedResources;
};

/**
 * Обновляет значения ресурсов на основе их производства в секунду и прошедшего времени
 * @param resources Текущие ресурсы 
 * @param deltaTime Прошедшее время в миллисекундах
 * @returns Обновленные значения ресурсов
 */
export const updateResourceValues = (
  resources: { [key: string]: Resource },
  deltaTime: number
): { [key: string]: Resource } => {
  const deltaSeconds = deltaTime / 1000;
  const updatedResources = { ...resources };
  
  Object.keys(updatedResources).forEach(resourceId => {
    const resource = updatedResources[resourceId];
    const perSecondValue = resource.perSecond;
    
    // Если есть производство и ресурс разблокирован
    if (perSecondValue !== 0 && resource.unlocked) {
      // Изменение за прошедшее время
      const change = perSecondValue * deltaSeconds;
      
      // Новое значение с ограничением по максимуму
      let newValue = resource.value + change;
      if (newValue > resource.max && resource.max !== Infinity) {
        newValue = resource.max;
      } else if (newValue < 0) {
        newValue = 0;
      }
      
      updatedResources[resourceId] = {
        ...resource,
        value: newValue
      };
    }
  });
  
  return updatedResources;
};
