
/**
 * Форматирует число, добавляя разделители тысяч и ограничивая количество десятичных знаков
 * @param value Число для форматирования
 * @param decimals Количество десятичных знаков
 * @returns Отформатированное число в виде строки
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  if (value === undefined || value === null) return '0';
  
  // Определяем множитель для округления
  const multiplier = Math.pow(10, decimals);
  
  // Округляем число до указанного количества десятичных знаков
  const roundedValue = Math.round(value * multiplier) / multiplier;
  
  // Форматируем число с разделителями групп разрядов
  return new Intl.NumberFormat('ru-RU', { 
    minimumFractionDigits: value < 0.01 && value > 0 ? 6 : Math.min(2, decimals),
    maximumFractionDigits: decimals 
  }).format(roundedValue);
};

/**
 * Проверяет, достаточно ли ресурсов для покупки
 * @param resources Объект с ресурсами
 * @param cost Объект со стоимостью
 * @returns true, если ресурсов достаточно, false в противном случае
 */
export const canAfford = (resources: any, cost: {[key: string]: number}): boolean => {
  return Object.entries(cost).every(([resourceId, amount]) => {
    const resource = resources[resourceId];
    return resource && resource.value >= amount;
  });
};

/**
 * Вычисляет стоимость здания с учетом коэффициента умножения стоимости
 * @param building Здание
 * @returns Объект с рассчитанной стоимостью
 */
export const calculateCost = (building: any): {[key: string]: number} => {
  const cost: {[key: string]: number} = {};
  if (!building.cost) return cost;
  
  Object.entries(building.cost).forEach(([resourceId, baseAmount]) => {
    const multiplier = building.costMultiplier || 1.15;
    cost[resourceId] = Math.floor(Number(baseAmount) * Math.pow(multiplier, building.count));
  });
  return cost;
};

/**
 * Проверяет, доступно ли Telegram Web App API
 */
export const isTelegramWebAppAvailable = (): boolean => {
  // @ts-ignore - Telegram Web App API
  return window.Telegram && window.Telegram.WebApp ? true : false;
};

/**
 * Генерирует реферальный код
 */
export const generateReferralCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

/**
 * Рассчитывает время, необходимое для достижения целевого значения ресурса
 */
export const calculateTimeToReach = (
  currentValue: number,
  targetValue: number,
  perSecond: number
): number => {
  if (perSecond <= 0) return Infinity;
  return Math.max(0, (targetValue - currentValue) / perSecond);
};
