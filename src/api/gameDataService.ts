
// Главный файл экспорта функций API игры

// Экспорт функций из модулей
export { checkSupabaseConnection } from './connectionUtils';
export { createSavesTableIfNotExists } from './tableManagement';
export { getUserIdentifier } from './userIdentification';
export { 
  saveReferralInfo, 
  getUserReferrals, 
  getUserReferralCode, 
  checkReferralInfo, 
  activateReferral 
} from './referralService';
export { 
  saveGameToServer, 
  loadGameFromServer 
} from './gameStorage/index';
export { 
  clearAllSavedData,
  clearAllSavedDataForAllUsers 
} from './adminService';
