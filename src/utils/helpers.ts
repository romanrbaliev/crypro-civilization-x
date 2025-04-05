
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
  resources: { [key: string]: number },
  cost: { [key: string]: number }
): boolean => {
  return Object.entries(cost).every(([resourceId, amount]) => {
    return resources[resourceId] >= Number(amount);
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
