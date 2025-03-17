
// Форматирование чисел для отображения
export const formatNumber = (num: number): string => {
  if (num === Infinity) return "∞";
  
  if (num >= 1e12) {
    return Math.floor(num / 1e12) + "T";
  } else if (num >= 1e9) {
    return Math.floor(num / 1e9) + "B";
  } else if (num >= 1e6) {
    return Math.floor(num / 1e6) + "M";
  } else if (num >= 1e3) {
    return Math.floor(num / 1e3) + "K";
  } else if (num % 1 !== 0) {
    // Дополнительно проверяем, есть ли десятичная часть
    return num.toFixed(2);
  } else {
    return Math.floor(num).toString();
  }
};

// Расчет времени для достижения определенного значения ресурса
export const calculateTimeToReach = (
  currentValue: number,
  targetValue: number,
  perSecond: number
): string => {
  if (perSecond <= 0) return "∞";
  const seconds = (targetValue - currentValue) / perSecond;
  
  if (seconds < 60) {
    return `${Math.ceil(seconds)} сек`;
  } else if (seconds < 3600) {
    return `${Math.ceil(seconds / 60)} мин`;
  } else if (seconds < 86400) {
    return `${Math.ceil(seconds / 3600)} ч`;
  } else {
    return `${Math.ceil(seconds / 86400)} д`;
  }
};

// Импорт константы с ключом хранилища
import { GAME_STORAGE_KEY } from '@/context/utils/gameStorage';

// Функция для сохранения игры
export const saveGame = (gameState: any) => {
  localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(gameState));
};

// Функция для загрузки игры
export const loadGame = (): any | null => {
  const savedGame = localStorage.getItem(GAME_STORAGE_KEY);
  if (!savedGame) return null;
  
  try {
    return JSON.parse(savedGame);
  } catch (error) {
    console.error("Ошибка загрузки игры:", error);
    return null;
  }
};

// Функция для сброса игры
export const resetGame = () => {
  localStorage.removeItem(GAME_STORAGE_KEY);
};

// Генерация случайного ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Проверка условий для открытия нового контента
export const checkUnlockConditions = (
  resources: { [key: string]: number },
  requirements: { [key: string]: number }
): boolean => {
  for (const [resourceId, requiredAmount] of Object.entries(requirements)) {
    if (!resources[resourceId] || resources[resourceId] < requiredAmount) {
      return false;
    }
  }
  return true;
};

// Расчет эффективности производства с учетом бонусов
export const calculateEfficiency = (
  baseValue: number,
  boostPercent: number
): number => {
  return baseValue * (1 + boostPercent / 100);
};

// Функция для проверки, может ли игрок позволить себе покупку
export const canAfford = (
  resources: { [key: string]: number },
  costs: { [key: string]: number }
): boolean => {
  for (const [resourceId, cost] of Object.entries(costs)) {
    if (!resources[resourceId] || resources[resourceId] < cost) {
      return false;
    }
  }
  return true;
};

// Функция для получения следующего уровня прогресса
export const getNextMilestone = (currentScore: number, milestones: number[]): number => {
  for (const milestone of milestones) {
    if (milestone > currentScore) {
      return milestone;
    }
  }
  return Infinity;
};
