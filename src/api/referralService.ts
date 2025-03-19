
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
