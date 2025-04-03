
import { GameState } from '@/context/types';
import { initialState } from '@/context/initialState';

// Валидация структуры данных игры
export function validateGameState(state: any): boolean {
  if (!state) return false;
  
  // Проверяем наличие ключевых полей
  const requiredFields = ['resources', 'buildings', 'upgrades', 'unlocks'];
  for (const field of requiredFields) {
    if (!state[field] || typeof state[field] !== 'object') {
      console.error(`❌ Отсутствует или некорректно поле ${field}`);
      // В случае отсутствия полей, мы не считаем данные полностью поврежденными
      // Отсутствующие поля будут восстановлены из initialState
      continue;
    }
  }
  
  // Проверяем наличие ключевых ресурсов
  if (state.resources && (!state.resources.knowledge || !state.resources.usdt)) {
    console.error('❌ Отсутствуют базовые ресурсы knowledge или usdt');
    // Можно восстановить из initialState
    return true;
  }
  
  return true;
}

// Объединение загруженного состояния с initialState для восстановления отсутствующих полей
export function mergeWithInitialState(loadedState: any): GameState {
  // Создаем глубокую копию начального состояния
  const baseState = JSON.parse(JSON.stringify(initialState));
  
  // Перебираем все ключи начального состояния
  for (const key of Object.keys(baseState)) {
    // Если ключ отсутствует в загруженном состоянии, оставляем значение из initialState
    if (loadedState[key] === undefined) {
      console.log(`Восстановлено отсутствующее поле: ${key}`);
      continue;
    }
    
    // Для объектов делаем рекурсивное объединение
    if (typeof baseState[key] === 'object' && 
        baseState[key] !== null && 
        !Array.isArray(baseState[key])) {
      
      loadedState[key] = {
        ...baseState[key],
        ...loadedState[key]
      };
    }
  }
  
  // Проверка наличия критически важных полей
  if (!loadedState.resources) {
    loadedState.resources = { ...baseState.resources };
    console.log('✅ Восстановлены отсутствующие ресурсы');
  }
  
  if (!loadedState.buildings) {
    loadedState.buildings = { ...baseState.buildings };
    console.log('✅ Восстановлены отсутствующие здания');
  }
  
  if (!loadedState.upgrades) {
    loadedState.upgrades = { ...baseState.upgrades };
    console.log('✅ Восстановлены отсутствующие улучшения');
  }
  
  if (!loadedState.unlocks) {
    loadedState.unlocks = { ...baseState.unlocks };
    console.log('✅ Восстановлены отсутствующие разблокировки');
  }
  
  // Проверка и добавление новых полей
  if (!loadedState.specializationSynergies) {
    loadedState.specializationSynergies = { ...baseState.specializationSynergies };
    console.log('✅ Добавлены отсутствующие данные о синергиях специализаций');
  }

  // Проверка и инициализация реферальных систем
  if (!loadedState.referrals) {
    loadedState.referrals = [];
    console.log('✅ Инициализирован пустой массив рефералов');
  }
  
  if (!loadedState.referralHelpers) {
    loadedState.referralHelpers = [];
    console.log('✅ Инициализирован пустой масс��в помощников');
  }
  
  // Проверка наличия счетчиков
  if (!loadedState.counters) {
    loadedState.counters = { ...baseState.counters };
    console.log('✅ Добавлены отсутствующие счетчики');
  }
  
  // Проверка наличия событий
  if (!loadedState.eventMessages) {
    loadedState.eventMessages = { ...baseState.eventMessages };
    console.log('✅ Добавлены отсутствующие сообщения о событиях');
  }
  
  // Корректировка разблокировок при загрузке
  
  // USDT должен быть разблокирован только после применения знаний
  if (loadedState.resources.usdt) {
    const applyKnowledgeCount = loadedState.counters.applyKnowledge?.value || 0;
    loadedState.resources.usdt.unlocked = applyKnowledgeCount >= 1;
    loadedState.unlocks.usdt = applyKnowledgeCount >= 1;
    console.log(`🔒 Статус разблокировки USDT установлен: ${loadedState.resources.usdt.unlocked}`);
  }
  
  // Исследования доступны только после покупки генератора
  loadedState.unlocks.research = loadedState.buildings.generator?.count > 0;
  console.log(`🔒 Статус разблокировки исследований установлен: ${loadedState.unlocks.research}`);
  
  // Рефералы доступны только после покупки исследования cryptoCommunity
  loadedState.unlocks.referrals = loadedState.upgrades.cryptoCommunity?.purchased || false;
  console.log(`🔒 Статус разблокировки рефералов установлен: ${loadedState.unlocks.referrals}`);
  
  // Bitcoin доступен только после покупки майнера
  if (loadedState.resources.bitcoin) {
    const hasMiner = loadedState.buildings.miner?.count > 0 || loadedState.buildings.autoMiner?.count > 0;
    loadedState.resources.bitcoin.unlocked = hasMiner;
    loadedState.unlocks.bitcoin = hasMiner;
    console.log(`🔒 Статус разблокировки Bitcoin установлен: ${loadedState.resources.bitcoin.unlocked}`);
  }
  
  // Обмен BTC разблокирован только если есть Bitcoin и он разблокирован
  loadedState.unlocks.exchangeBtc = loadedState.resources.bitcoin?.unlocked && loadedState.resources.bitcoin?.value > 0;
  
  return loadedState as GameState;
}
