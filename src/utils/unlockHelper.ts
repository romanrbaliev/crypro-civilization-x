
import { GameState } from '@/context/types';

/**
 * Проверяет наличие определенного ресурса в состоянии
 * @param state Состояние игры
 * @param resourceId Идентификатор ресурса для проверки
 * @returns Булево значение, указывающее, разблокирован ли ресурс
 */
export const isResourceUnlocked = (state: GameState, resourceId: string): boolean => {
  if (!state?.resources?.[resourceId]) return false;
  return state.resources[resourceId].unlocked === true;
};

/**
 * Проверяет наличие определенного здания в состоянии
 * @param state Состояние игры
 * @param buildingId Идентификатор здания для проверки
 * @returns Булево значение, указывающее, разблокировано ли здание
 */
export const isBuildingUnlocked = (state: GameState, buildingId: string): boolean => {
  if (!state?.buildings?.[buildingId]) return false;
  return state.buildings[buildingId].unlocked === true;
};

/**
 * Проверяет наличие определенного улучшения в состоянии
 * @param state Состояние игры
 * @param upgradeId Идентификатор улучшения для проверки
 * @returns Булево значение, указывающее, разблокировано или куплено ли улучшение
 */
export const isUpgradeUnlocked = (state: GameState, upgradeId: string): boolean => {
  if (!state?.upgrades?.[upgradeId]) return false;
  return state.upgrades[upgradeId]?.unlocked === true || 
         state.upgrades[upgradeId]?.purchased === true;
};

/**
 * Создает объект unlocks на основе текущего состояния
 * 
 * ВАЖНОСТЬ:
 * 1. Централизует информацию о разблокировках в одном месте
 * 2. Позволяет быстро проверять разблокировку через проверку одного объекта
 * 3. Обеспечивает единый формат данных для проверки разблокировок
 * 4. Упрощает интеграцию с пользовательским интерфейсом
 * 5. Позволяет сохранять состояние разблокировок между сессиями
 * 
 * Если эта функция будет удалена:
 * - Потребуется проверять каждый тип элемента отдельно
 * - Повысится риск ошибок при проверке статуса разблокировок
 * - Усложнится логика рендеринга интерфейса, зависящего от разблокировок
 * - Будет сложнее отслеживать, какие элементы разблокированы
 * 
 * @param state Состояние игры
 * @returns Объект с ключами-идентификаторами разблокированных элементов
 */
export const getUnlocksFromState = (state: GameState): Record<string, boolean> => {
  const unlocks: Record<string, boolean> = {};

  // Проверяем разблокировку ресурсов
  if (state?.resources) {
    Object.entries(state.resources).forEach(([id, resource]) => {
      if (resource && resource.unlocked) {
        unlocks[id] = true;
      }
    });
  }

  // Проверяем разблокировку зданий
  if (state?.buildings) {
    Object.entries(state.buildings).forEach(([id, building]) => {
      if (building && building.unlocked) {
        unlocks[id] = true;
      }
    });
  }

  // Проверяем разблокировку улучшений
  if (state?.upgrades) {
    Object.entries(state.upgrades).forEach(([id, upgrade]) => {
      if (upgrade && (upgrade.unlocked || upgrade.purchased)) {
        unlocks[id] = true;
      }
    });
  }

  // Проверяем состояние счетчика applyKnowledge
  if (state?.counters?.applyKnowledge) {
    const applyKnowledgeValue = typeof state.counters.applyKnowledge === 'number'
      ? state.counters.applyKnowledge
      : (state.counters.applyKnowledge.value || 0);
    
    if (applyKnowledgeValue > 0) {
      unlocks.applyKnowledge = true;
    }
  }

  // Проверяем счетчик кликов знаний (для разблокировки кнопки "Применить знания")
  if (state?.counters?.knowledgeClicks) {
    const clicksValue = typeof state.counters.knowledgeClicks === 'number'
      ? state.counters.knowledgeClicks
      : (state.counters.knowledgeClicks.value || 0);
    
    if (clicksValue >= 3) {
      unlocks.applyKnowledge = true;
    }
  }

  return unlocks;
};

/**
 * Убеждается, что объект unlocks существует в состоянии
 * 
 * ВАЖНОСТЬ:
 * 1. Гарантирует наличие объекта unlocks в состоянии
 * 2. Предотвращает ошибки обращения к отсутствующему свойству
 * 3. Обеспечивает корректную инициализацию при первом запуске
 * 4. Поддерживает обратную совместимость при обновлениях
 * 5. Упрощает работу с системой разблокировок
 * 
 * Если эта функция будет удалена:
 * - При первом запуске игры будут возникать ошибки из-за отсутствия объекта unlocks
 * - Потребуется проверять наличие объекта unlocks при каждом доступе к нему
 * - Увеличится количество условных проверок в пользовательском интерфейсе
 * - Усложнится отладка и поддержка кода
 * 
 * @param state Состояние игры
 * @returns Обновленное состояние с гарантированным объектом unlocks
 */
export const ensureUnlocksExist = (state: GameState): GameState => {
  if (!state) return state || {} as GameState; // Защита от undefined
  
  // Создаем копию состояния для безопасной модификации
  const newState = { ...state };
  
  if (!newState.unlocks) {
    newState.unlocks = getUnlocksFromState(newState);
  }
  
  return newState;
};
