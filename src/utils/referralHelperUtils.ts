
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
  const result = referralHelpers.some(
    helper => 
      helper.helperId === referralId && 
      helper.buildingId === buildingId && 
      helper.status === 'accepted'
  );
  
  console.log(`Проверка назначения реферала ${referralId} на здание ${buildingId}:`, result);
  return result;
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
  const result = referralHelpers.some(
    helper => helper.helperId === referralId && helper.status === 'accepted'
  );
  
  console.log(`Проверка найма реферала ${referralId}:`, result);
  return result;
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
  
  const result = helper ? helper.buildingId : null;
  console.log(`Получение ID здания для реферала ${referralId}:`, result);
  return result;
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
  const boost = acceptedHelpersCount * 0.1;
  console.log(`Бонус от помощников для здания ${buildingId}: ${boost * 100}% (${acceptedHelpersCount} помощников)`);
  return boost;
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
  const totalBoost = acceptedHelpersCount * 0.1;
  console.log(`Общий бонус от помощников: ${totalBoost * 100}% (${acceptedHelpersCount} принятых запросов)`);
  return totalBoost;
};

/**
 * Получает список принятых помощников для конкретного пользователя
 * @param referralHelpers Список всех помощников
 * @param referralId ID реферала для проверки
 * @returns Список принятых запросов помощи
 */
export const getAcceptedHelperRequests = (
  referralHelpers: ReferralHelper[],
  referralId: string
): ReferralHelper[] => {
  return referralHelpers.filter(
    helper => helper.helperId === referralId && helper.status === 'accepted'
  );
};

/**
 * Проверяет, есть ли у пользователя активные помощники
 * @param referralHelpers Список всех помощников
 * @returns true, если есть хотя бы один принятый запрос
 */
export const hasActiveHelpers = (
  referralHelpers: ReferralHelper[]
): boolean => {
  return referralHelpers.some(helper => helper.status === 'accepted');
};
