
import { GameState, ResourceAction } from '../types';

/**
 * Применяет все знания для получения USDT
 */
export const applyAllKnowledge = (state: GameState, action: ResourceAction): GameState => {
  // Получаем текущее значение знаний и скорость конвертации
  let knowledgeValue = state.resources.knowledge?.value || 0;
  let conversionRate = action.payload?.conversionRate || 0.1; // По умолчанию 0.1 USDT за 1 знание
  
  if (knowledgeValue <= 0) {
    console.log('Недостаточно знаний для конвертации в USDT');
    return state;
  }
  
  // Проверяем наличие бонуса от исследования "Основы криптовалют"
  if (state.upgrades.cryptoCurrencyBasics?.purchased) {
    // Даем +10% к эффективности применения знаний
    conversionRate = conversionRate * 1.1;
    console.log(`Применяем бонус от исследования "Основы криптовалют": конверсия ${conversionRate.toFixed(2)}`);
  }
  
  // Расчет знаний, подлежащих обмену (целое число)
  const knowledgeToApply = Math.floor(knowledgeValue / 10) * 10;
  
  if (knowledgeToApply <= 0) {
    console.log('Недостаточно знаний для конвертации в USDT (минимум 10)');
    return state;
  }
  
  // Расчет получаемого количества USDT
  const usdtGained = knowledgeToApply * conversionRate;
  
  // Обновляем состояние - уменьшаем знания и увеличиваем USDT
  let newState = {
    ...state,
    resources: {
      ...state.resources,
      knowledge: {
        ...state.resources.knowledge,
        value: knowledgeValue - knowledgeToApply
      }
    },
    counters: {
      ...state.counters,
      applyKnowledge: {
        value: (state.counters.applyKnowledge?.value || 0) + 1,
        updatedAt: Date.now()
      }
    }
  };
  
  // Если USDT еще не разблокирован, создаем ресурс
  if (!newState.resources.usdt) {
    newState.resources.usdt = {
      id: 'usdt',
      name: 'USDT',
      description: 'Стабильная криптовалюта, используемая для покупок',
      type: 'resource', // Используем тип 'resource' вместо 'currency'
      value: usdtGained,
      baseProduction: 0,
      production: 0,
      perSecond: 0,
      max: 50,
      unlocked: true
    };
    
    // Разблокируем USDT
    newState.unlocks = {
      ...newState.unlocks,
      usdt: true
    };
    
    console.log(`USDT разблокирован. Получено ${usdtGained.toFixed(2)} USDT за ${knowledgeToApply} знаний`);
    
  } else {
    // Увеличиваем существующий USDT
    newState.resources.usdt = {
      ...newState.resources.usdt,
      value: (newState.resources.usdt.value || 0) + usdtGained,
      unlocked: true
    };
    
    // Гарантируем, что USDT разблокирован
    newState.unlocks = {
      ...newState.unlocks,
      usdt: true
    };
    
    console.log(`Получено ${usdtGained.toFixed(2)} USDT за ${knowledgeToApply} знаний`);
  }
  
  return newState;
};

// Экспортируем applyAllKnowledge под другим именем для совместимости
export const processApplyAllKnowledge = applyAllKnowledge;
