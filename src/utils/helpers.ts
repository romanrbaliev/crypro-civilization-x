
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
  referralHelpers: any[] = []
): number => {
  if (!referralHelpers || !Array.isArray(referralHelpers) || referralHelpers.length === 0) {
    return 0;
  }
  
  // Находим принятых помощников для этого здания
  const acceptedHelpers = referralHelpers.filter(
    h => h.buildingId === buildingId && h.status === 'accepted'
  );
  
  console.log(`Расчет бонуса для здания ${buildingId}: ${acceptedHelpers.length} помощников, бонус ${acceptedHelpers.length * 0.1 * 100}%`);
  
  // Каждый помощник дает +10% к производительности здания
  return acceptedHelpers.length * 0.1;
};

/**
 * Вычисляет общий бонус от рефералов
 * ИСПРАВЛЕНО: Проверяем только активированных рефералов с явной проверкой activated === true
 */
export const calculateReferralBonus = (referrals: any[]): number => {
  // Проверяем, что у нас есть массив рефералов
  if (!referrals || !Array.isArray(referrals)) {
    return 0;
  }
  
  // Добавляем дополнительное логирование всех рефералов
  const referralDetails = referrals.map(ref => ({ 
    id: ref.id, 
    activated: ref.activated,
    typeOfActivated: typeof ref.activated
  }));
  console.log(`Детальная информация о рефералах:`, JSON.stringify(referralDetails, null, 2));
  
  // Считаем только активированных рефералов с явным значением true
  const activeReferrals = referrals.filter(ref => ref.activated === true);
  console.log(`Расчет бонуса от рефералов: ${activeReferrals.length} активных из ${referrals.length} всего`);
  
  if (activeReferrals.length > 0) {
    console.log('Активированные рефералы:', activeReferrals.map(r => r.id));
  }
  
  // Дополнительный лог общего бонуса
  const bonus = activeReferrals.length * 0.05;
  console.log(`Общий бонус от рефералов: +${bonus * 100}%`);
  
  // Бонус: +5% за каждого активного реферала
  return bonus;
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
