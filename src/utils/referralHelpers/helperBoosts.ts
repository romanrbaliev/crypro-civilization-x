
import { ReferralHelper } from "@/context/types";

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
  
  // Каждый помощник дает бонус в 5% реферреру
  const boost = acceptedHelpersCount * 0.05;
  console.log(`Бонус от помощников для здания ${buildingId}: ${boost * 100}% (${acceptedHelpersCount} помощников)`);
  return boost;
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
  
  // Каждый помощник дает бонус в 5% к реферреру
  const totalBoost = acceptedHelpersCount * 0.05;
  console.log(`Общий бонус от помощников: ${totalBoost * 100}% (${acceptedHelpersCount} принятых запросов)`);
  return totalBoost;
};

/**
 * Получает бонус производства для реферала-помощника
 * @param userId ID пользователя (user_id)
 * @param referralHelpers Список помощников
 * @returns Процентный бонус от 0 до 1
 */
export const getHelperProductionBoost = (
  userId: string,
  referralHelpers: ReferralHelper[]
): number => {
  // Считаем количество зданий, где пользователь помогает
  const acceptedBuildingsCount = referralHelpers.filter(
    helper => helper.helperId === userId && helper.status === 'accepted'
  ).length;
  
  // НОВАЯ ЛОГИКА: если в локальном состоянии нет данных о том, что пользователь является помощником,
  // проверяем в базе данных (асинхронно)
  if (acceptedBuildingsCount === 0) {
    import('./helperQueries').then(({ getBuildingCountFromDBAsync }) => {
      getBuildingCountFromDBAsync(userId).then(count => {
        if (count > 0) {
          console.log(`В БД пользователь ${userId} помогает в ${count} зданиях, но в локальном состоянии это не отражено`);
          
          // Отправляем событие для обновления
          setTimeout(() => {
            const refreshEvent = new CustomEvent('refresh-referrals');
            window.dispatchEvent(refreshEvent);
          }, 500);
        }
      });
    });
  }
  
  // Каждое здание, где реферал является помощником, дает ему бонус 10%
  const boost = acceptedBuildingsCount * 0.1;
  console.log(`Бонус для помощника ${userId}: ${boost * 100}% (помогает в ${acceptedBuildingsCount} зданиях)`);
  return boost;
};
