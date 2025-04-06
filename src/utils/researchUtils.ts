
// Реэкспорт всех функций из более специализированных файлов
// для обеспечения обратной совместимости

// Экспорт форматтеров эффектов
export {
  formatEffectName,
  formatEffectValue,
  formatEffect,
  checkUpgradeEfficiency
} from './effects/formatters';

// Экспорт функций разблокировок
export {
  isBlockchainBasicsUnlocked,
  getUnlockedBuildingsByGroup,
  getUnlockedUpgradesByGroup
} from './research/unlocks';

// Экспорт функций специализаций
export {
  getSpecializationName
} from './research/specializations';

// Экспорт функций применения эффектов
export {
  applyUpgradeEffects,
  mapResourceId
} from './effects/effectApplication';
