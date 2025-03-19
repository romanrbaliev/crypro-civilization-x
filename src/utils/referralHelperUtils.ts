
import { ReferralHelper } from "@/context/types";

/**
 * Проверяет, нанят ли реферал на определенное здание
 * @param referralId ID реферала
 * @param buildingId ID здания
 * @param referralHelpers Список помощников
 * @returns true, если реферал нанят на указанное здание
 */
export const isReferralHiredForBuilding = (
  referralId: string,
  buildingId: string,
  referralHelpers: ReferralHelper[]
): boolean => {
  return referralHelpers.some(
    helper => 
      helper.helperId === referralId && 
      helper.buildingId === buildingId && 
      helper.status === 'accepted'
  );
};

/**
 * Проверяет, нанят ли реферал на любое здание
 * @param referralId ID реферала
 * @param referralHelpers Список помощников
 * @returns true, если реферал нанят хотя бы на одно здание
 */
export const isReferralHired = (
  referralId: string,
  referralHelpers: ReferralHelper[]
): boolean => {
  return referralHelpers.some(
    helper => helper.helperId === referralId && helper.status === 'accepted'
  );
};

/**
 * Получает ID здания, на которое нанят реферал
 * @param referralId ID реферала
 * @param referralHelpers Список помощников
 * @returns ID здания или null, если реферал не нанят
 */
export const getReferralAssignedBuildingId = (
  referralId: string,
  referralHelpers: ReferralHelper[]
): string | null => {
  const helper = referralHelpers.find(
    h => h.helperId === referralId && h.status === 'accepted'
  );
  
  return helper ? helper.buildingId : null;
};

/**
 * Рассчитывает бонус от помощника для определенного здания
 * @param buildingId ID здания
 * @param referralHelpers Список помощников
 * @returns Процентный бонус от 0 до 1 (например, 0.2 = +20%)
 */
export const calculateBuildingBoostFromHelpers = (
  buildingId: string,
  referralHelpers: ReferralHelper[]
): number => {
  // Считаем количество принятых помощников для этого здания
  const acceptedHelpersCount = referralHelpers.filter(
    helper => helper.buildingId === buildingId && helper.status === 'accepted'
  ).length;
  
  // Каждый помощник дает бонус в 10%
  return acceptedHelpersCount * 0.1;
};

/**
 * Ищет запрос на трудоустройство для указанных реферала и здания
 * @param referralId ID реферала
 * @param buildingId ID здания
 * @param referralHelpers Список помощников
 * @returns Объект запроса или null
 */
export const findHelperRequest = (
  referralId: string,
  buildingId: string,
  referralHelpers: ReferralHelper[]
): ReferralHelper | null => {
  return referralHelpers.find(
    h => h.helperId === referralId && h.buildingId === buildingId
  ) || null;
};

/**
 * Получает общий бонус производства для всех зданий от помощников
 * @param referralHelpers Список помощников
 * @returns Общий процентный бонус от 0 до 1
 */
export const getTotalHelperBoost = (
  referralHelpers: ReferralHelper[]
): number => {
  // Считаем только принятых помощников
  const acceptedHelpersCount = referralHelpers.filter(
    helper => helper.status === 'accepted'
  ).length;
  
  // Каждый помощник дает бонус в 10% к определенному зданию
  return acceptedHelpersCount * 0.1;
};
