
// Этот файл создан для обратной совместимости после рефакторинга
// Реэкспортирует функции из новой модульной структуры

import { 
  saveReferralInfo, 
  getUserReferrals, 
  getUserReferralCode,
  checkReferralInfo,
  activateReferral,
} from './referral';

// Новая функция для обновления статуса помощника в базе данных
import { updateHelperRequestStatus, getHelperRequests } from './referral/referralHelpers';

// Функция обновления статуса найма реферала (только для внутреннего состояния приложения)
const updateReferralHiredStatus = async (referralId: string, hired: boolean, buildingId?: string): Promise<boolean> => {
  try {
    console.log(`Обновление статуса найма реферала: referralId=${referralId}, hired=${hired}, buildingId=${buildingId || 'не указано'}`);
    
    // Поскольку в базе данных нет соответствующего поля,
    // эта функция только эмулирует успешное обновление для совместимости
    
    // Запускаем событие для обновления интерфейса
    setTimeout(() => {
      try {
        const updateEvent = new CustomEvent('referral-hire-status-updated', {
          detail: { 
            referralId, 
            hired, 
            buildingId 
          }
        });
        window.dispatchEvent(updateEvent);
        console.log(`Отправлено событие обновления статуса найма реферала ${referralId}`);
      } catch (error) {
        console.error('Ошибка при отправке события обновления статуса найма реферала:', error);
      }
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Ошибка при обновлении статуса найма реферала:', error);
    return false;
  }
};

// Непосредственный экспорт функций для обратной совместимости
export { 
  saveReferralInfo, 
  getUserReferrals, 
  getUserReferralCode,
  checkReferralInfo,
  activateReferral,
  updateReferralHiredStatus,
  updateHelperRequestStatus,
  getHelperRequests
};
