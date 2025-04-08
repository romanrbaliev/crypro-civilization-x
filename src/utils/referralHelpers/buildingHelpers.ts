
import { ReferralHelper } from "@/context/types";

/**
 * Проверяет, нанят ли реферал на определенное здание
 * @param userId ID пользователя (user_id)
 * @param buildingId ID здания
 * @param referralHelpers Список помощников
 * @returns true, если реферал нанят на указанное здание
 */
export const isReferralHiredForBuilding = (
  userId: string,
  buildingId: string,
  referralHelpers: ReferralHelper[]
): boolean => {
  const result = referralHelpers.some(
    helper => 
      helper.helperId === userId && 
      helper.buildingId === buildingId && 
      helper.status === 'accepted'
  );
  
  console.log(`Проверка назначения реферала ${userId} на здание ${buildingId}:`, result);
  return result;
};

/**
 * Получает ID здания, на которое нанят реферал
 * @param userId ID пользователя (user_id)
 * @param referralHelpers Список помощников
 * @returns ID здания или null, если реферал не нанят
 */
export const getReferralAssignedBuildingId = (
  userId: string,
  referralHelpers: ReferralHelper[]
): string | null => {
  const helper = referralHelpers.find(
    h => h.helperId === userId && h.status === 'accepted'
  );
  
  const result = helper ? helper.buildingId : null;
  console.log(`Получение ID здания для реферала ${userId}:`, result);
  
  if (!result) {
    // Если в локальном состоянии нет информации, проверяем в БД
    import('./helperQueries').then(({ getBuildingIdFromDBAsync }) => {
      getBuildingIdFromDBAsync(userId).then(buildingIdFromDB => {
        if (buildingIdFromDB) {
          console.log(`В БД найдено здание ${buildingIdFromDB} для помощника ${userId}, но отсутствует в локальном состоянии`);
          
          // Отправляем событие для обновления
          setTimeout(() => {
            const refreshEvent = new CustomEvent('refresh-referrals');
            window.dispatchEvent(refreshEvent);
          }, 500);
        }
      });
    });
  }
  
  return result;
};

/**
 * Ищет запрос на трудоустройство для указанных реферала и здания
 * @param userId ID пользователя (user_id)
 * @param buildingId ID здания
 * @param referralHelpers Список помощников
 * @returns Объект запроса или null
 */
export const findHelperRequest = (
  userId: string,
  buildingId: string,
  referralHelpers: ReferralHelper[]
): ReferralHelper | null => {
  return referralHelpers.find(
    h => h.helperId === userId && h.buildingId === buildingId
  ) || null;
};

/**
 * Получает список активных помощников для конкретного здания
 * @param buildingId ID здания
 * @param referralHelpers Список всех помощников
 * @returns Список активных помощников для данного здания
 */
export const getActiveBuildingHelpers = (
  buildingId: string,
  referralHelpers: ReferralHelper[]
): ReferralHelper[] => {
  const helpers = referralHelpers.filter(
    helper => helper.buildingId === buildingId && helper.status === 'accepted'
  );
  
  console.log(`Получено ${helpers.length} активных помощников для здания ${buildingId}`);
  return helpers;
};
