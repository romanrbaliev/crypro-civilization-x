
// Импорты оставляем без изменений
import { GameState, ResourceAction } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Экспортируем функцию applyAllKnowledge как она есть, но также добавим экспорт под именем processApplyAllKnowledge для совместимости
// Функция для применения всех знаний и конвертации их в USDT
export const applyAllKnowledge = (state: GameState, action: ResourceAction): GameState => {
  console.log('applyAllKnowledge: Функция вызвана', action);
  
  // Получаем текущее значение знаний
  const knowledgeValue = state.resources.knowledge?.value || 0;
  
  // ИСПРАВЛЕНО: Получаем ставку конвертации из payload или используем дефолтное значение
  const conversionRate = action.payload?.conversionRate || 1;
  console.log(`applyAllKnowledge: Ставка конвертации знаний: ${conversionRate}`);
  
  // Проверяем, достаточно ли знаний для конвертации (минимум 10)
  if (knowledgeValue < 10) {
    console.log('applyAllKnowledge: Недостаточно знаний для конвертации');
    return state;
  }
  
  // Рассчитываем, сколько групп по 10 знаний можно конвертировать
  const conversions = Math.floor(knowledgeValue / 10);
  const knowledgeToConvert = conversions * 10;
  const remainingKnowledge = knowledgeValue - knowledgeToConvert;
  
  // ИСПРАВЛЕНО: Используем переданную ставку конвертации для расчета USDT
  // Получаем 1*conversionRate USDT за каждые 10 знаний
  const obtainedUsdt = conversions * conversionRate;
  
  console.log(`applyAllKnowledge: Конвертировано ${knowledgeToConvert} знаний (${conversions} групп) в ${obtainedUsdt} USDT`);
  console.log(`applyAllKnowledge: Осталось ${remainingKnowledge} знаний`);
  
  // Создаем копию состояния для модификации
  const newState = { ...state };
  
  // Обновляем значение знаний
  if (newState.resources.knowledge) {
    newState.resources.knowledge = {
      ...newState.resources.knowledge,
      value: remainingKnowledge
    };
  }
  
  // Проверяем, существует ли уже ресурс USDT
  if (newState.resources.usdt) {
    // Обновляем значение USDT
    newState.resources.usdt = {
      ...newState.resources.usdt,
      value: (newState.resources.usdt.value || 0) + obtainedUsdt,
      unlocked: true
    };
  } else {
    // Создаем ресурс USDT, если он не существует
    newState.resources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стейблкоин, привязанный к доллару США',
      type: 'currency',
      icon: 'usdt',
      value: obtainedUsdt,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: true
    };
    
    // Добавляем флаг разблокировки USDT
    newState.unlocks = {
      ...newState.unlocks,
      usdt: true
    };
    
    console.log('applyAllKnowledge: USDT разблокирован');
  }
  
  // Увеличиваем счетчик применений знаний
  const currentApplyCount = typeof newState.counters.applyKnowledge === 'object'
    ? (newState.counters.applyKnowledge?.value || 0)
    : (newState.counters.applyKnowledge || 0);
    
  newState.counters = {
    ...newState.counters,
    applyKnowledge: {
      value: currentApplyCount + 1,
      updatedAt: Date.now()
    }
  };
  
  console.log(`applyAllKnowledge: Счетчик применений знаний увеличен до ${currentApplyCount + 1}`);
  
  // Проверяем разблокировку фазы 2 (после первого применения знаний)
  if (currentApplyCount === 0) {
    newState.unlocks = {
      ...newState.unlocks,
      phase2: true
    };
    
    console.log('applyAllKnowledge: Фаза 2 разблокирована');
    safeDispatchGameEvent("Фаза 2 разблокирована!", "success");
  }
  
  // Возвращаем обновленное состояние
  return newState;
};

// Экспорт функции также под именем processApplyAllKnowledge для совместимости со старым кодом
export const processApplyAllKnowledge = applyAllKnowledge;

// Добавим простую заглушку для processIncrementResource чтобы исправить ошибку импорта
export const processIncrementResource = (state: GameState, action: ResourceAction): GameState => {
  // Простая заглушка для совместимости
  // В идеале эту функцию следует полноценно реализовать или заменить на корректные импорты
  return state;
};
