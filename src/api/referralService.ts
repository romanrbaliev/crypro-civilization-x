
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

// Новая функция для обновления статуса помощника в базе данных
import { updateHelperRequestStatus } from './referral/referralHelpers';

// Непосредственный экспорт функций для обратной совместимости
export { 
  saveReferralInfo, 
  getUserReferrals, 
  getUserReferralCode,
  checkReferralInfo,
  activateReferral,
  updateReferralHiredStatus,
  updateHelperRequestStatus
};
