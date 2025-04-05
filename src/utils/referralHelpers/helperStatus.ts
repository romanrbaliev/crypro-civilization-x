
import { ReferralHelper } from '@/context/types';

/**
 * Проверяет, является ли реферал помощником для конкретного здания
 * @param referralId ID реферала
 * @param buildingId ID здания
 * @param helpers Массив помощников
 * @returns true если реферал является помощником для здания
 */
export function isReferralHelperForBuilding(
  referralId: string, 
  buildingId: string, 
  helpers: ReferralHelper[]
): boolean {
  return helpers.some(h => 
    h.helperId === referralId && 
    h.buildingId === buildingId && 
    h.status === 'active'
  );
}

/**
 * Получение ID запроса помощника
 * @param referralId ID реферала
 * @param buildingId ID здания
 * @param helpers Массив помощников
 * @returns ID запроса помощника или null
 */
export function getHelperRequestId(
  referralId: string,
  buildingId: string,
  helpers: ReferralHelper[]
): string | null {
  const helper = helpers.find(h => 
    h.helperId === referralId && 
    h.buildingId === buildingId
  );
  return helper ? helper.id : null;
}

/**
 * Расчет времени для достижения цели
 * @param current Текущее значение
 * @param target Целевое значение
 * @param perSecond Скорость достижения
 * @returns Время для достижения цели
 */
export function calculateTimeToReach(current: number, target: number, perSecond: number): number {
  if (perSecond <= 0) return Infinity;
  if (current >= target) return 0;
  return Math.ceil((target - current) / perSecond);
}
