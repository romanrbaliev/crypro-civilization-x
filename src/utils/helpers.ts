import { Building, Resource } from '@/context/types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const formatNumber = (number: number): string => {
  if (number === Infinity) return "∞";
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
  
  // Фильтруем только активных рефералов и считаем общий бонус (5% за каждого)
  const activeReferrals = referrals.filter(referral => {
    // Строгая проверка на активацию: должен быть boolean true или строка "true"
    if (typeof referral.activated === 'boolean') {
      return referral.activated === true;
    } else if (typeof referral.activated === 'string') {
      return referral.activated.toLowerCase() === 'true';
    }
    return false;
  });
  
  // Подробное логирование для отладки
  console.log(`[calculateReferralBonus] Проверка на активированные рефералы:`);
  console.log(`- Всего рефералов: ${referrals.length}`);
  console.log(`- Активировано: ${activeReferrals.length}`);
  
  // Возвращаем бонус: 5% (0.05) за каждого активного реферала
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
  
  // Ищем только активных помощников для указанного здания
  const activeHelpers = helpers.filter(
    helper => helper.buildingId === buildingId && helper.status === 'accepted'
  );
  
  // Более подробное логирование для отладки
  console.log(`[calculateBuildingBoostFromHelpers] Здание ${buildingId}:`);
  console.log(`- Всего помощников: ${helpers.length}`);
  console.log(`- Активных для этого здания: ${activeHelpers.length}`);
  
  if (activeHelpers.length > 0) {
    console.log(`- Список помощников для здания ${buildingId}:`, 
      activeHelpers.map(h => ({id: h.id, helperId: h.helperId}))
    );
    
    // Оповещение для пользователя о бонусе
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
  
  // Каждый помощник дает бонус +10% (0.1) к производительности здания
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
  
  // Ищем только активные запросы, где реферал является помощником
  const activeHelperRequests = helpers.filter(
    helper => helper.helperId === referralId && helper.status === 'accepted'
  );
  
  // Подробное логирование для отладки
  if (activeHelperRequests.length > 0) {
    console.log(`Реферал ${referralId} ЯВЛЯЕТСЯ помощником для ${activeHelperRequests.length} зданий:`,
      activeHelperRequests.map(h => h.buildingId)
    );
    
    // Оповещение для пользователя-помощника
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
  
  // Каждый активный запрос дает бонус +10% (0.1)
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
  
  // Группируем помощников по зданиям
  helpers.filter(h => h.status === 'accepted').forEach(helper => {
    if (!boosts[helper.buildingId]) {
      boosts[helper.buildingId] = { boost: 0.1, helperIds: [helper.helperId] };
    } else {
      boosts[helper.buildingId].boost += 0.1;
      boosts[helper.buildingId].helperIds.push(helper.helperId);
    }
  });
  
  // Логирование для отладки
  if (Object.keys(boosts).length > 0) {
    console.log('Активные бонусы от помощников:');
    Object.entries(boosts).forEach(([buildingId, data]) => {
      const buildingName = buildings[buildingId]?.name || buildingId;
      console.log(`- ${buildingName}: +${data.boost * 100}% от ${data.helperIds.length} помощников`);
    });
  }
  
  return boosts;
};

/**
 * Пошаговый расчет скорости накопления знаний для конкретного пользователя
 * @param userId ID пользователя для которого нужно рассчитать скорость
 * @param resources Текущие ресурсы
 * @param buildings Здания пользователя
 * @param referralHelpers Список помощников
 * @param referrals Список рефералов
 * @returns Объект с детальным пошаговым расчетом
 */
export const calculateKnowledgeProductionSteps = (
  userId: string,
  resources: { [key: string]: Resource },
  buildings: { [key: string]: Building },
  referralHelpers: any[],
  referrals: any[]
): { steps: string[], totalPerSecond: number } => {
  // Массив для хранения шагов расчета
  const steps: string[] = [];
  let totalKnowledgePerSecond = 0;
  
  steps.push(`Шаг 1: Проверка пользователя ${userId}`);
  
  // Шаг 2: Подсчет активных рефералов
  const activeReferrals = referrals.filter(ref => ref.status === 'active');
  const activeReferralsCount = activeReferrals.length;
  const referralBonus = activeReferralsCount * 0.05; // 5% за каждого активного реферала
  
  steps.push(`Шаг 2: Подсчет активных рефералов`);
  steps.push(`Формула: количество_активных_рефералов * 0.05`);
  steps.push(`Расчет: ${activeReferralsCount} рефералов * 0.05 = ${referralBonus} (${referralBonus * 100}% бонуса)`);
  
  // Шаг 3: Поиск зданий, производящих знания
  steps.push(`Шаг 3: Поиск зданий, которые производят ресурс "knowledge" (знания)`);
  
  let knowledgeProducingBuildings = 0;
  
  // Для каждого здания проверяем, производит ли оно знания
  Object.values(buildings).forEach((building: Building, index) => {
    const { count, production = {}, id: buildingId, name } = building;
    
    if (count > 0 && production && production.knowledge) {
      knowledgeProducingBuildings++;
      steps.push(`Найдено здание #${knowledgeProducingBuildings}: "${name}" (ID: ${buildingId}), количество: ${count}`);
      
      // Шаг 4: Базовое производство знаний этим зданием
      const baseProduction = Number(production.knowledge) * count;
      steps.push(`Шаг 4.${knowledgeProducingBuildings}: Базовое производство знаний зданием "${name}"`);
      steps.push(`Формула: базовое_производство * количество`);
      steps.push(`Расчет: ${production.knowledge} * ${count} = ${baseProduction} знаний/сек`);
      
      // Шаг 5: Проверка наличия помощников для этого здания
      steps.push(`Шаг 5.${knowledgeProducingBuildings}: Проверка наличия помощников для здания "${name}"`);
      
      const helpers = referralHelpers.filter(h => 
        h.buildingId === buildingId && h.status === 'accepted'
      );
      
      if (helpers.length > 0) {
        steps.push(`Найдено ${helpers.length} помощников для здания "${name}"`);
        helpers.forEach((helper, hIndex) => {
          steps.push(`Помощник #${hIndex + 1}: ID ${helper.helperId}`);
        });
      } else {
        steps.push(`Помощников для здания "${name}" не найдено`);
      }
      
      // Шаг 6: Расчет бонуса от помощников
      const helperBonus = helpers.length * 0.1; // 10% за каждого помощника
      steps.push(`Шаг 6.${knowledgeProducingBuildings}: Расчет бонуса от помощников`);
      steps.push(`Формула: количество_помощников * 0.1`);
      steps.push(`Расчет: ${helpers.length} помощников * 0.1 = ${helperBonus} (${helperBonus * 100}% бонуса)`);
      
      // Шаг 7: Применение общего бонуса
      steps.push(`Шаг 7.${knowledgeProducingBuildings}: Применение общего бонуса от помощников и рефералов`);
      const totalBonus = 1 + helperBonus + referralBonus;
      steps.push(`Формула: 1 + бонус_от_помощников + бонус_от_рефералов`);
      steps.push(`Расчет: 1 + ${helperBonus} + ${referralBonus} = ${totalBonus} (множитель производства)`);
      
      // Шаг 8: Итоговое производство для этого здания
      const boostedProduction = baseProduction * totalBonus;
      steps.push(`Шаг 8.${knowledgeProducingBuildings}: Расчет итогового производства знаний зданием "${name}"`);
      steps.push(`Формула: базовое_производство * общий_бонус`);
      steps.push(`Расчет: ${baseProduction} * ${totalBonus} = ${boostedProduction.toFixed(3)} знаний/сек`);
      
      // Добавляем к общему производству
      totalKnowledgePerSecond += boostedProduction;
    }
  });
  
  // Если не найдено зданий, производящих знания
  if (knowledgeProducingBuildings === 0) {
    steps.push(`Зданий, производящих знания, не найдено`);
  }
  
  // Шаг 9: Итоговое суммарное производство
  steps.push(`Шаг 9: Расчет общего производства знаний`);
  steps.push(`Суммарное производство знаний: ${totalKnowledgePerSecond.toFixed(3)} знаний/сек`);
  
  // Округляем итоговое значение до 3 знаков после запятой
  return {
    steps,
    totalPerSecond: parseFloat(totalKnowledgePerSecond.toFixed(3))
  };
};

/**
 * Отображает результаты расчета в журнале событий
 * @param userId ID пользователя
 * @param steps Шаги расчета
 */
export const logKnowledgeCalculationSteps = (userId: string, steps: string[]): void => {
  console.group(`Пошаговый расчет производства знаний для ${userId}`);
  steps.forEach(step => {
    console.log(step);
  });
  console.groupEnd();
  
  // Отправляем событие для отображения расчета в UI
  try {
    setTimeout(() => {
      const calculationEvent = new CustomEvent('knowledge-calculation-steps', {
        detail: { 
          userId,
          steps
        }
      });
      window.dispatchEvent(calculationEvent);
    }, 100);
  } catch (error) {
    console.error('Ошибка при отправке события с шагами расчета:', error);
  }
};
