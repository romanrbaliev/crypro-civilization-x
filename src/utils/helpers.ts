
/**
 * Форматирует число с заданной точностью
 * @param num Число для форматирования
 * @param digits Количество знаков после запятой
 * @returns Отформатированное число
 */
export const formatNumber = (num: number, digits: number = 0): string => {
  if (isNaN(num)) return '0';
  
  // Для больших чисел используем сокращенный формат
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  // Преобразуем к строке с фиксированным количеством знаков
  return num.toFixed(digits).replace('.', ',');
};

/**
 * Проверяет, хватает ли ресурсов для определенной стоимости
 * @param resources Текущие ресурсы
 * @param cost Требуемая стоимость
 * @returns true, если хватает ресурсов, иначе false
 */
export const canAfford = (
  resources: { [key: string]: number | { value: number } },
  cost: { [key: string]: number }
): boolean => {
  return Object.entries(cost).every(([resourceId, amount]) => {
    const resource = resources[resourceId];
    const resourceValue = typeof resource === 'object' && resource !== null ? resource.value : resource;
    return typeof resourceValue === 'number' && resourceValue >= Number(amount);
  });
};

/**
 * Добавляет ресурсы с проверкой максимума
 * @param current Текущее значение ресурса
 * @param amount Количество для добавления
 * @param max Максимальное значение ресурса
 * @returns Новое значение ресурса
 */
export const addResource = (
  current: number,
  amount: number,
  max: number
): number => {
  return Math.min(current + amount, max);
};

/**
 * Вычитает ресурсы с проверкой минимума
 * @param current Текущее значение ресурса
 * @param amount Количество для вычитания
 * @returns Новое значение ресурса
 */
export const subtractResource = (
  current: number,
  amount: number
): number => {
  return Math.max(current - amount, 0);
};

/**
 * Получает множитель производства на основе коэффициентов
 * @param baseMultiplier Базовый множитель производства
 * @param boosts Дополнительные усиления
 * @returns Итоговый множитель производства
 */
export const getProductionMultiplier = (
  baseMultiplier: number,
  boosts: number[]
): number => {
  return boosts.reduce((acc, boost) => acc * (1 + boost), baseMultiplier);
};

/**
 * Проверяет доступность Telegram WebApp
 * @returns true, если Telegram WebApp доступен
 */
export const isTelegramWebAppAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
    window.Telegram !== undefined && 
    window.Telegram.WebApp !== undefined;
};

/**
 * Генерирует случайный реферальный код
 * @returns Строка с реферальным кодом
 */
export const generateReferralCode = (): string => {
  const length = 8;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Рассчитывает стоимость здания или исследования с учетом уровня
 * @param item Объект здания или исследования
 * @returns Объект с рассчитанной стоимостью
 */
export const calculateCost = (item: any): { [key: string]: number } => {
  const baseCost = item.cost || {};
  const count = item.count || 0;
  const scaleFactor = item.scaleFactor || 1.15;
  
  const scaledCost: { [key: string]: number } = {};
  
  Object.entries(baseCost).forEach(([resourceId, baseAmount]) => {
    // Преобразуем baseAmount к числу если это не число
    const baseAmountNumber = typeof baseAmount === 'number' 
      ? baseAmount 
      : Number(baseAmount);
    
    // Используем формулу: baseCost * scaleFactor^count
    scaledCost[resourceId] = Math.round(baseAmountNumber * Math.pow(scaleFactor, count));
  });
  
  return scaledCost;
};

/**
 * Рассчитывает время до достижения определенного количества ресурса
 * @param current Текущее количество ресурса
 * @param target Целевое количество ресурса
 * @param perSecond Производство ресурса в секунду
 * @returns Время в секундах или Infinity если производство <= 0
 */
export const calculateTimeToReach = (
  current: number,
  target: number,
  perSecond: number
): number => {
  if (perSecond <= 0) return Infinity;
  if (current >= target) return 0;
  
  return Math.ceil((target - current) / perSecond);
};
