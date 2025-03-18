
/**
 * Проверяет, достаточно ли ресурсов для совершения покупки
 */
export const canAffordCost = (
  cost: { [key: string]: number },
  resources: { [key: string]: any }
): boolean => {
  for (const resourceId in cost) {
    if (resources.hasOwnProperty(resourceId)) {
      if (resources[resourceId].value < cost[resourceId]) {
        return false;
      }
    } else {
      console.warn(`Ресурс ${resourceId} не найден.`);
      return false;
    }
  }
  return true;
};

/**
 * Вычитает ресурсы после совершения покупки
 */
export const deductResources = (
  cost: { [key: string]: number },
  resources: { [key: string]: any }
): { [key: string]: any } => {
  const newResources = { ...resources };
  for (const resourceId in cost) {
    if (newResources.hasOwnProperty(resourceId)) {
      newResources[resourceId] = {
        ...newResources[resourceId],
        value: newResources[resourceId].value - cost[resourceId]
      };
    }
  }
  return newResources;
};

/**
 * Вычисляет бонус от помощника для конкретного здания
 */
export const calculateHelperBoost = (helpers: any[] = [], buildingId: string): number => {
  if (!helpers || helpers.length === 0) return 0;
  
  // Находим всех помощников для данного здания со статусом 'accepted'
  const buildingHelpers = helpers.filter(
    h => h.buildingId === buildingId && h.status === 'accepted'
  );
  
  // Каждый помощник дает +5% к производительности здания
  return buildingHelpers.length * 0.05;
};

/**
 * Вычисляет бонус для здания от всех помощников
 */
export const calculateBuildingBoostFromHelpers = (
  buildingId: string,
  helpers: any[] = []
): number => {
  // Используем функцию calculateHelperBoost
  const boost = calculateHelperBoost(helpers, buildingId);
  console.log(`Расчет бонуса для здания ${buildingId}: ${helpers.length} помощников, бонус ${boost * 100}%`);
  return boost;
};

/**
 * Вычисляет общий бонус от рефералов
 * ИСПРАВЛЕНО: Проверяем только активированных рефералов
 */
export const calculateReferralBonus = (referrals: any[] = []): number => {
  if (!referrals || referrals.length === 0) return 0;
  
  // ИСПРАВЛЕНО: Учитываем только активных рефералов
  const activeReferrals = referrals.filter(ref => ref.activated === true);
  console.log(`Расчет бонуса от рефералов: ${activeReferrals.length} активных из ${referrals.length} всего`);
  
  // Каждый активный реферал дает +5% к производительности
  return activeReferrals.length * 0.05;
};

/**
 * Проверяет, доступен ли Telegram WebApp
 */
export const isTelegramWebAppAvailable = (): boolean => {
  return typeof window !== 'undefined' &&
         typeof window.Telegram !== 'undefined' &&
         typeof window.Telegram.WebApp !== 'undefined';
};

/**
 * Генерирует реферальный код
 */
export const generateReferralCode = (): string => {
  const prefix = 'REF_';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 8;
  
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

/**
 * Получает ID пользователя из Telegram WebApp или генерирует случайный
 */
export const getUserIdentifier = async (): Promise<string> => {
  if (isTelegramWebAppAvailable() && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    return window.Telegram.WebApp.initDataUnsafe.user.id.toString();
  } else {
    // Возвращаем случайный ID для веб-версии
    return 'web_user_' + Math.random().toString(36).substring(2, 15);
  }
};

/**
 * Форматирует число для отображения (добавляет разделители)
 */
export const formatNumber = (num: number): string => {
  if (num === Infinity) return "∞";
  if (Math.abs(num) < 1000) return num.toFixed(3);
  
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixIndex = Math.floor(Math.log10(Math.abs(num)) / 3);
  
  if (suffixIndex >= suffixes.length) {
    return num.toExponential(2);
  }
  
  const scaledNum = num / Math.pow(10, 3 * suffixIndex);
  const formatted = scaledNum.toFixed(scaledNum < 10 ? 1 : 0);
  
  return `${formatted}${suffixes[suffixIndex]}`;
};

/**
 * Генерирует уникальный ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Рассчитывает время до достижения определенного значения ресурса
 */
export const calculateTimeToReach = (
  currentValue: number,
  targetValue: number,
  perSecond: number
): string => {
  if (perSecond <= 0) return "∞";
  if (currentValue >= targetValue) return "Готово!";
  
  const secondsRemaining = (targetValue - currentValue) / perSecond;
  
  if (secondsRemaining < 60) {
    return `${Math.ceil(secondsRemaining)}с`;
  } else if (secondsRemaining < 3600) {
    return `${Math.ceil(secondsRemaining / 60)}м`;
  } else if (secondsRemaining < 86400) {
    return `${Math.ceil(secondsRemaining / 3600)}ч`;
  } else {
    return `${Math.ceil(secondsRemaining / 86400)}д`;
  }
};
