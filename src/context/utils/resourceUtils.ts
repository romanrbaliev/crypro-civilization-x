import { Resource, Building, ReferralHelper } from '../types';
import { calculateBuildingBoostFromHelpers, calculateHelperBoost, calculateReferralBonus } from '../../utils/helpers';

export const calculateResourceProduction = (
  resources: { [key: string]: Resource },
  buildings: { [key: string]: Building },
  referralHelpers: ReferralHelper[] = [],
  referrals: any[] = [],
  referralCode: string = ''
): { [key: string]: Resource } => {
  const newResources = { ...resources };
  
  // Сбрасываем производство в секунду для всех ресурсов перед пересчетом
  Object.keys(newResources).forEach(resourceId => {
    newResources[resourceId] = {
      ...newResources[resourceId],
      perSecond: 0
    };
  });
  
  // Получаем бонус от рефералов
  const referralBonus = calculateReferralBonus(referrals);
  
  console.log(`Общий бонус от рефералов: +${(referralBonus * 100).toFixed(0)}%`);
  
  // Для каждого здания рассчитываем производство
  Object.values(buildings).forEach(building => {
    if (building.count > 0) {
      // Получаем бонус от помощников для этого здания
      const helperBoost = calculateBuildingBoostFromHelpers(building.id, referralHelpers);
      
      // Применяем производство от здания с учетом бонусов
      Object.entries(building.production).forEach(([resourceId, productionValue]) => {
        if (newResources[resourceId]) {
          // Применяем все бонусы: количество зданий, буст от помощников, буст от рефералов
          const totalProduction = productionValue * building.count * (1 + helperBoost) * (1 + referralBonus);
          
          newResources[resourceId] = {
            ...newResources[resourceId],
            perSecond: newResources[resourceId].perSecond + totalProduction
          };
          
          if (helperBoost > 0) {
            console.log(`Здание ${building.name} имеет бонус от помощников: +${(helperBoost * 100).toFixed(0)}%`);
          }
        }
      });
    }
  });
  
  return newResources;
};

export const applyStorageBoosts = (
  resources: { [key: string]: Resource },
  buildings: { [key: string]: Building }
): { [key: string]: Resource } => {
  const newResources = { ...resources };
  
  // Логика увеличения хранилища от зданий здесь...
  // (оставляем существующую логику)
  
  return newResources;
};

export const updateResourceValues = (
  resources: { [key: string]: Resource },
  deltaTimeMs: number
): { [key: string]: Resource } => {
  const deltaTimeSeconds = deltaTimeMs / 1000;
  const newResources = { ...resources };
  
  Object.keys(newResources).forEach(resourceId => {
    const resource = newResources[resourceId];
    
    if (resource.unlocked) {
      // Рассчитываем новое значение ресурса
      const newValue = resource.value + resource.perSecond * deltaTimeSeconds;
      
      // Обновляем значение с учетом ограничения максимума
      newResources[resourceId] = {
        ...resource,
        value: Math.min(newValue, resource.max)
      };
    }
  });
  
  return newResources;
};
