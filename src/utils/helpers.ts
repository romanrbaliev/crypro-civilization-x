import { Building, Resource } from '@/context/types';
import { formatResourceValue } from './resourceFormatConfig';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const formatNumber = (number: number, resourceId?: string): string => {
  if (number === Infinity) return "∞";
  
  if (resourceId) {
    return formatResourceValue(number, resourceId);
  }
  
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K";
  } else {
    return number.toFixed(0);
  }
};

export const calculateCost = (
  baseCost: { [key: string]: number },
  multiplier: number,
  count: number
): { [key: string]: number } => {
  const newCost: { [key: string]: number } = {};
  for (const resourceId in baseCost) {
    newCost[resourceId] = Math.ceil(baseCost[resourceId] * Math.pow(multiplier, count));
  }
  return newCost;
};

export const canAffordCost = (
  cost: { [resourceId: string]: number },
  resources: { [resourceId: string]: Resource }
): boolean => {
  for (const resourceId in cost) {
    if (!resources[resourceId] || resources[resourceId].value < cost[resourceId]) {
      return false;
    }
  }
  return true;
};

/**
 * Расчет бонуса от рефералов
 */
export const calculateReferralBonus = (referrals: any[] = []): number => {
  if (!referrals || referrals.length === 0) return 0;
  
  const activeReferrals = referrals.filter(referral => {
    if (typeof referral.activated === 'boolean') {
      return referral.activated === true;
    } else if (typeof referral.activated === 'string') {
      return referral.activated.toLowerCase() === 'true';
    }
    return false;
  });
  
  console.log(`[calculateReferralBonus] Проверка на активированные рефералы:`);
  console.log(`- Всего рефералов: ${referrals.length}`);
  console.log(`- Активировано: ${activeReferrals.length}`);
  
  const bonus = activeReferrals.length * 0.05;
  console.log(`[calculateReferralBonus] Итоговый бонус: +${(bonus * 100).toFixed(0)}%`);
  return bonus; 
};

/**
 * Расчет общего бонуса от помощников для конкретного здания
 */
export const calculateBuildingBoostFromHelpers = (
  buildingId: string, 
  helpers: { buildingId: string; helperId: string; status: string; id: string }[] = []
): number => {
  if (!helpers || helpers.length === 0) return 0;
  
  const activeHelpers = helpers.filter(
    helper => helper.buildingId === buildingId && helper.status === 'accepted'
  );
  
  console.log(`[calculateBuildingBoostFromHelpers] Здание ${buildingId}:`);
  console.log(`- Всего помощников: ${helpers.length}`);
  console.log(`- Активных для этого здания: ${activeHelpers.length}`);
  
  if (activeHelpers.length > 0) {
    console.log(`- Список помощников для здания ${buildingId}:`, 
      activeHelpers.map(h => ({id: h.id, helperId: h.helperId}))
    );
    
    try {
      const helperIds = activeHelpers.map(h => h.helperId);
      const boostPercentage = activeHelpers.length * 10;
      
      setTimeout(() => {
        const boostEvent = new CustomEvent('debug-helper-boost', {
          detail: { 
            buildingId,
            helperIds,
            boostPercentage,
            message: `Здание ${buildingId} получает бонус +${boostPercentage}% от ${activeHelpers.length} помощников`
          }
        });
        window.dispatchEvent(boostEvent);
      }, 300);
    } catch (error) {
      console.error('Ошибка при отправке события о бонусе здания:', error);
    }
  }
  
  const boost = activeHelpers.length * 0.1;
  console.log(`[calculateBuildingBoostFromHelpers] Итоговый бонус для здания ${buildingId}: +${(boost * 100).toFixed(0)}%`);
  return boost;
};

/**
 * Расчет бонуса от помощников для конкретного реферала
 */
export const calculateHelperBoost = (
  referralId: string, 
  helpers: { buildingId: string; helperId: string; status: string }[] = []
): number => {
  if (!helpers || helpers.length === 0) return 0;
  
  const activeHelperRequests = helpers.filter(
    helper => helper.helperId === referralId && helper.status === 'accepted'
  );
  
  if (activeHelperRequests.length > 0) {
    console.log(`Реферал ${referralId} ЯВЛЯЕТСЯ помощником для ${activeHelperRequests.length} зданий:`,
      activeHelperRequests.map(h => h.buildingId)
    );
    
    try {
      const buildingIds = activeHelperRequests.map(h => h.buildingId);
      const boostPercentage = activeHelperRequests.length * 10;
      
      setTimeout(() => {
        const helperBoostEvent = new CustomEvent('debug-helper-personal-boost', {
          detail: { 
            referralId,
            buildingIds,
            boostPercentage,
            message: `Вы получаете бонус +${boostPercentage}% как помощник для ${activeHelperRequests.length} зданий`
          }
        });
        window.dispatchEvent(helperBoostEvent);
      }, 300);
    } catch (error) {
      console.error('Ошибка при отправке события о личном бонусе помощника:', error);
    }
  }
  
  return activeHelperRequests.length * 0.1;
};

/**
 * Проверка доступности Telegram WebApp
 */
export const isTelegramWebAppAvailable = (): boolean => {
  if (typeof window !== 'undefined' && window.__FORCE_TELEGRAM_MODE) {
    return true;
  }
  return typeof window !== 'undefined' && 
         typeof window.Telegram !== 'undefined' && 
         typeof window.Telegram.WebApp !== 'undefined';
};

/**
 * Получение строки-описания времени до достижения целевого значения
 */
export const calculateTimeToReach = (
  currentValue: number,
  targetValue: number,
  perSecond: number
): string => {
  if (perSecond <= 0) return "∞";
  if (currentValue >= targetValue) return "Готово!";
  
  const secondsToReach = (targetValue - currentValue) / perSecond;
  
  if (secondsToReach < 60) {
    return `${Math.ceil(secondsToReach)}с`;
  } else if (secondsToReach < 3600) {
    return `${Math.ceil(secondsToReach / 60)}м`;
  } else if (secondsToReach < 86400) {
    return `${Math.ceil(secondsToReach / 3600)}ч`;
  } else {
    return `${Math.ceil(secondsToReach / 86400)}д`;
  }
};

/**
 * Генерация реферального кода
 */
export const generateReferralCode = (): string => {
  return Array.from({ length: 8 }, () => 
    Math.floor(Math.random() * 16).toString(16).toUpperCase()
  ).join('');
};

/**
 * Вычитание ресурсов из текущего запаса
 */
export const deductResources = (
  cost: { [resourceId: string]: number },
  resources: { [resourceId: string]: Resource }
): { [resourceId: string]: Resource } => {
  const newResources = { ...resources };
  
  for (const resourceId in cost) {
    if (newResources[resourceId]) {
      newResources[resourceId] = {
        ...newResources[resourceId],
        value: Math.max(0, newResources[resourceId].value - cost[resourceId])
      };
    }
  }
  
  return newResources;
};

/**
 * Проверяет, является ли реферал помощником на указанном здании
 */
export const isReferralHelperForBuilding = (
  referralId: string,
  buildingId: string,
  helpers: { id: string; buildingId: string; helperId: string; status: string }[] = []
): boolean => {
  const isHelper = helpers.some(
    helper => helper.helperId === referralId && 
              helper.buildingId === buildingId && 
              helper.status === 'accepted'
  );
  
  if (isHelper) {
    console.log(`Реферал ${referralId} ЯВЛЯЕТСЯ помощником для здания ${buildingId}`);
  }
  
  return isHelper;
};

/**
 * Получает идентификатор запроса помощника для реферала и здания
 */
export const getHelperRequestId = (
  referralId: string,
  buildingId: string,
  helpers: { id: string; buildingId: string; helperId: string; status: string }[] = []
): string | null => {
  const helperRequest = helpers.find(
    helper => helper.helperId === referralId && helper.buildingId === buildingId
  );
  
  if (helperRequest) {
    console.log(`Найден запрос помощника для реферала ${referralId} и здания ${buildingId}:`, helperRequest);
  }
  
  return helperRequest ? helperRequest.id : null;
};

/**
 * Получает список всех активных помощников с информацией о бонусах
 */
export const getActiveHelperBoosts = (
  buildings: { [key: string]: Building },
  helpers: { id: string; buildingId: string; helperId: string; status: string }[] = []
): { [buildingId: string]: { boost: number, helperIds: string[] } } => {
  const boosts: { [buildingId: string]: { boost: number, helperIds: string[] } } = {};
  
  if (!helpers || helpers.length === 0) return boosts;
  
  helpers.filter(h => h.status === 'accepted').forEach(helper => {
    if (!boosts[helper.buildingId]) {
      boosts[helper.buildingId] = { boost: 0.1, helperIds: [helper.helperId] };
    } else {
      boosts[helper.buildingId].boost += 0.1;
      boosts[helper.buildingId].helperIds.push(helper.helperId);
    }
  });
  
  if (Object.keys(boosts).length > 0) {
    console.log('Активные бонусы от помощников:');
    Object.entries(boosts).forEach(([buildingId, data]) => {
      const buildingName = buildings[buildingId]?.name || buildingId;
      console.log(`- ${buildingName}: +${data.boost * 100}% от ${data.helperIds.length} помощников`);
    });
  }
  
  return boosts;
};
