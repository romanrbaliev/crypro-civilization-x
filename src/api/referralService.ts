
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

// Непосредственный экспорт функций для обратной совместимости
export { 
  saveReferralInfo, 
  getUserReferrals, 
  getUserReferralCode,
  checkReferralInfo,
  activateReferral,
  updateReferralHiredStatus
};
