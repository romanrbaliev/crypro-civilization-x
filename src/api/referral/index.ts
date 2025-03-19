
// Главный файл экспорта реферальной системы

export * from './referralTypes';
// Экспортируем функции из обновленной структуры referralStorage
export { saveReferralInfo, checkReferralInfo, getUserReferralCode } from './referralStorage/index';
export * from './referralQuery';
export * from './referralActivation';
