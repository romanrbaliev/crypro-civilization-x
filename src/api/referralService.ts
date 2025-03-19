
// Этот файл создан для обратной совместимости после рефакторинга
// Реэкспортирует функции из новой модульной структуры

import { 
  saveReferralInfo, 
  getUserReferrals, 
  getUserReferralCode,
  checkReferralInfo,
  activateReferral,
  updateReferralHiredStatus
} from './referral';

// Новые функции для работы с помощниками
import { 
  updateHelperRequestStatus, 
  getHelperRequests,
  getEmployerHelperBuildings 
} from './referral/referralHelpers';

// Функции для обновления интерфейса пользователя
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

// Непосредственный экспорт функций для обратной совместимости
export { 
  saveReferralInfo, 
  getUserReferrals, 
  getUserReferralCode,
  checkReferralInfo,
  activateReferral,
  updateReferralHiredStatus,
  updateHelperRequestStatus,
  getHelperRequests,
  getEmployerHelperBuildings
};

// Дополнительная функция для обновления UI
export const triggerReferralUIUpdate = (referralId: string, hired: boolean, buildingId?: string) => {
  console.log(`Запуск обновления UI для реферала ${referralId}:`, { hired, buildingId });
  
  try {
    // Создаем событие для обновления статуса реферала в UI
    const updateEvent = new CustomEvent('referral-status-updated', {
      detail: { 
        referralId, 
        hired, 
        buildingId 
      }
    });
    window.dispatchEvent(updateEvent);
    
    // Создаем событие для обновления бонусов
    const helperEvent = new CustomEvent('helper-production-update', {
      detail: { 
        helperId: referralId,
        buildingId: buildingId || null,
        status: hired ? 'active' : 'inactive'
      }
    });
    window.dispatchEvent(helperEvent);
    
    // Отправляем сообщение в журнал событий
    if (hired) {
      safeDispatchGameEvent(`Реферал ${referralId.substring(0, 6)} теперь помогает с производством`, "success");
    } else {
      safeDispatchGameEvent(`Реферал ${referralId.substring(0, 6)} больше не помогает с производством`, "info");
    }
    
    // Запускаем принудительное обновление ресурсов
    setTimeout(() => {
      const forceUpdateEvent = new CustomEvent('force-resource-update');
      window.dispatchEvent(forceUpdateEvent);
    }, 500);
    
    return true;
  } catch (error) {
    console.error('Ошибка при обновлении UI реферала:', error);
    return false;
  }
};
