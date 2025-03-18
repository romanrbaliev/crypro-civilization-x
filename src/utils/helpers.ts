
import { Resource, ReferralHelper } from "@/context/types";

export const formatNumber = (num: number): string => {
  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  } else if (num >= 1) {
    return num.toFixed(2);
  } else if (num > 0) {
    return num.toFixed(4);
  }
  return '0';
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const calculateMaxStorage = (
  baseMax: number,
  storageMultiplier: number = 1
): number => {
  return baseMax * storageMultiplier;
};

export const canAffordCost = (
  cost: { [key: string]: number },
  resources: { [key: string]: Resource }
): boolean => {
  return Object.entries(cost).every(([resourceId, amount]) => {
    const resource = resources[resourceId];
    return resource && resource.value >= amount;
  });
};

export const deductResources = (
  cost: { [key: string]: number },
  resources: { [key: string]: Resource }
): { [key: string]: Resource } => {
  const newResources = { ...resources };
  
  Object.entries(cost).forEach(([resourceId, amount]) => {
    if (newResources[resourceId]) {
      newResources[resourceId] = {
        ...newResources[resourceId],
        value: newResources[resourceId].value - amount
      };
    }
  });
  
  return newResources;
};

export const generateReferralCode = (): string => {
  // Генерируем 8-значный шестнадцатеричный код
  return Array.from({ length: 8 }, () => 
    Math.floor(Math.random() * 16).toString(16).toUpperCase()
  ).join('');
};

export const isTelegramWebAppAvailable = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    window.Telegram?.WebApp &&
    typeof window.Telegram.WebApp.initData === 'string'
  );
};

export const checkRequirements = (
  requirements: { [key: string]: number } | undefined,
  resources: { [key: string]: Resource }
): boolean => {
  if (!requirements) return true;
  
  return Object.entries(requirements).every(([resourceId, amount]) => {
    const resource = resources[resourceId];
    return resource && resource.value >= amount;
  });
};

export const applyEffects = (
  effects: { [key: string]: number },
  resources: { [key: string]: Resource }
): { [key: string]: Resource } => {
  const newResources = { ...resources };
  
  Object.entries(effects).forEach(([effectId, amount]) => {
    if (effectId.includes('Boost')) {
      const resourceId = effectId.replace('Boost', '');
      if (newResources[resourceId]) {
        newResources[resourceId] = {
          ...newResources[resourceId],
          perSecond: newResources[resourceId].perSecond * (1 + amount)
        };
      }
    }
  });
  
  return newResources;
};

export const calculateResourceProduction = (
  baseProduction: number,
  multiplier: number = 1
): number => {
  return baseProduction * multiplier;
};

export const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

// Функция для расчета времени до достижения цели
export const calculateTimeToReach = (
  currentValue: number,
  targetValue: number,
  perSecond: number
): string => {
  if (perSecond <= 0) return '∞';
  if (currentValue >= targetValue) return 'Готово!';
  
  const timeInSeconds = (targetValue - currentValue) / perSecond;
  return formatTime(timeInSeconds);
};

// Хелперы для системы помощников
export const calculateBuildingBoostFromHelpers = (
  buildingId: string,
  referralHelpers: ReferralHelper[]
): number => {
  // Находим всех активных помощников для этого здания
  const activeHelpers = referralHelpers.filter(
    h => h.buildingId === buildingId && h.status === 'accepted'
  );
  
  // Каждый помощник дает 5% буст к производительности
  return activeHelpers.length * 0.05;
};

export const calculateHelperBoost = (
  employerId: string,
  referralHelpers: ReferralHelper[]
): number => {
  // Находим все задания, где пользователь выступает помощником
  const activeJobs = referralHelpers.filter(
    h => h.helperId === employerId && h.status === 'accepted'
  );
  
  // Каждая принятая работа дает 10% буст к производительности
  return activeJobs.length * 0.10;
};

// Рассчитывает бонус от активных рефералов
export const calculateReferralBonus = (
  referrals: any[] = []
): number => {
  // Учитываем только активированных рефералов
  const activeReferrals = referrals.filter(ref => ref.activated === true);
  
  // Каждый активный реферал дает +5% к производительности
  return activeReferrals.length * 0.05;
};

