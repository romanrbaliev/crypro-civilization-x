
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

// Обновление импортов в других файлах не требуется,
// так как мы сохранили те же имена экспортируемых функций
