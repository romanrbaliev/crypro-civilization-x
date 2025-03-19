
// Этот файл создан для обратной совместимости после рефакторинга
// Реэкспортирует функции из новой модульной структуры

import { 
  saveReferralInfo, 
  getUserReferrals, 
  getUserReferralCode,
  checkReferralInfo,
  activateReferral 
} from './referral';

export { 
  saveReferralInfo, 
  getUserReferrals, 
  getUserReferralCode,
  checkReferralInfo,
  activateReferral 
};
