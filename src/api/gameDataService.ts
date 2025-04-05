
// Главный файл экспорта функций API игры

// Экспорт функций из модулей
export { checkSupabaseConnection } from './connectionUtils';
export { createSavesTableIfNotExists } from './tableManagement';
export { getUserIdentifier } from './userIdentification';
export { 
  saveGameToServer, 
  loadGameFromServer 
} from './gameStorage';
