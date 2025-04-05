
import { ReferralHelper } from '@/context/types';

/**
 * Проверяет, является ли реферал помощником для указанного здания
 * @param helperId ID помощника
 * @param buildingId ID здания
 * @param helpers список всех помощников
 * @returns true, если реферал является помощником для здания
 */
export const isReferralHelperForBuilding = (
  helperId: string,
  buildingId: string,
  helpers: ReferralHelper[]
): boolean => {
  return helpers.some(
    (helper) => 
      helper.helperId === helperId && 
      helper.buildingId === buildingId && 
      helper.status === 'accepted'
  );
};

/**
 * Получает ID запроса на помощь для указанного реферала и здания
 * @param helperId ID помощника
 * @param buildingId ID здания
 * @param helpers список всех помощников
 * @returns ID запроса или undefined, если запрос не найден
 */
export const getHelperRequestId = (
  helperId: string,
  buildingId: string,
  helpers: ReferralHelper[]
): string | undefined => {
  const helper = helpers.find(
    (h) => h.helperId === helperId && h.buildingId === buildingId
  );
  return helper?.id;
};

/**
 * Рассчитывает время, необходимое для достижения целевого значения ресурса
 * @param currentValue текущее значение ресурса
 * @param targetValue целевое значение ресурса
 * @param perSecond скорость производства ресурса в секунду
 * @returns время в секундах или Infinity, если невозможно достичь
 */
export const calculateTimeToReach = (
  currentValue: number,
  targetValue: number,
  perSecond: number
): number => {
  if (perSecond <= 0) return Infinity;
  
  const remainingValue = targetValue - currentValue;
  if (remainingValue <= 0) return 0;
  
  return remainingValue / perSecond;
};
