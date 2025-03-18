
import { GameState, SpecializationSynergy } from '../types';
import { specializationSynergies } from '@/utils/gameConfig';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Инициализация синергий при загрузке игры
export const initializeSynergies = (state: GameState): GameState => {
  const initialSynergies: { [key: string]: SpecializationSynergy } = {};
  
  Object.values(specializationSynergies).forEach(synergy => {
    initialSynergies[synergy.id] = {
      ...synergy,
      unlocked: false,
      active: false
    };
  });
  
  return {
    ...state,
    specializationSynergies: initialSynergies
  };
};

// Проверка условий для разблокировки синергий
export const checkSynergies = (state: GameState): GameState => {
  const newSynergies = { ...state.specializationSynergies };
  let hasChanges = false;
  
  // Подсчитываем количество исследований в каждой категории
  const categoryResearchCount: { [category: string]: number } = {};
  
  Object.values(state.upgrades).forEach(upgrade => {
    if (upgrade.purchased && upgrade.category) {
      if (!categoryResearchCount[upgrade.category]) {
        categoryResearchCount[upgrade.category] = 0;
      }
      categoryResearchCount[upgrade.category]++;
    }
  });
  
  // Проверяем условия для каждой синергии
  Object.values(newSynergies).forEach(synergy => {
    // Если синергия уже разблокирована, пропускаем проверку
    if (synergy.unlocked) return;
    
    // Проверяем, выполнены ли условия для разблокировки
    const allCategoriesHaveEnough = synergy.requiredCategories.every(category => 
      (categoryResearchCount[category] || 0) >= synergy.requiredCount
    );
    
    if (allCategoriesHaveEnough) {
      newSynergies[synergy.id] = {
        ...synergy,
        unlocked: true
      };
      hasChanges = true;
      
      // Отправляем сообщение о разблокировке синергии
      safeDispatchGameEvent(
        `Разблокирована новая синергия: ${synergy.name}`, 
        "success"
      );
      
      // Поясняющее сообщение
      setTimeout(() => {
        safeDispatchGameEvent(
          synergy.description, 
          "info"
        );
      }, 200);
    }
  });
  
  if (hasChanges) {
    return {
      ...state,
      specializationSynergies: newSynergies
    };
  }
  
  return state;
};

// Активация синергии
export const activateSynergy = (
  state: GameState, 
  payload: { synergyId: string }
): GameState => {
  const { synergyId } = payload;
  const synergy = state.specializationSynergies[synergyId];
  
  // Если синергия не существует или не разблокирована, возвращаем текущее состояние
  if (!synergy || !synergy.unlocked) {
    return state;
  }
  
  // Активируем синергию
  const newSynergies = {
    ...state.specializationSynergies,
    [synergyId]: {
      ...synergy,
      active: true
    }
  };
  
  safeDispatchGameEvent(
    `Активирована синергия: ${synergy.name}`, 
    "success"
  );
  
  // Перечисляем бонусы
  const bonusDescriptions = Object.entries(synergy.bonus)
    .map(([effectId, value]) => {
      if (effectId.includes('Boost')) {
        return `+${(value * 100).toFixed(0)}% к ${formatEffectName(effectId.replace('Boost', ''))}`;
      }
      return `+${value} к ${formatEffectName(effectId)}`;
    })
    .join(', ');
  
  setTimeout(() => {
    safeDispatchGameEvent(
      `Бонусы: ${bonusDescriptions}`, 
      "info"
    );
  }, 200);
  
  return {
    ...state,
    specializationSynergies: newSynergies
  };
};

// Форматирование имени эффекта (копия из researchUtils для независимости модуля)
const formatEffectName = (name: string): string => {
  const effectNameMap: {[key: string]: string} = {
    knowledge: "знаниям",
    miningEfficiency: "эффективности майнинга",
    electricity: "электричеству",
    computingPower: "вычислительной мощности",
    electricityEfficiency: "эффективности электричества",
    electricityConsumption: "потреблению электричества",
    tradingEfficiency: "эффективности трейдинга",
    marketAnalysis: "анализу рынка",
    tradingProfit: "прибыли от трейдинга",
    volatilityPrediction: "предсказанию волатильности",
    automatedTrading: "автоматизированной торговле",
    tradeSpeed: "скорости торговли",
    security: "безопасности",
    automation: "автоматизации",
    reputation: "репутации",
    hashrate: "хешрейту",
    conversionRate: "конверсии",
    usdtMax: "максимальному хранению USDT",
    knowledgeMax: "максимальному хранению знаний",
    stakingReward: "наградам за стейкинг",
    portfolioGrowth: "росту портфеля",
    marketSentiment: "настроению рынка",
    defiYield: "доходности DeFi",
    liquidityMining: "ликвидности майнинга",
    passiveIncome: "пассивному доходу",
    // И другие эффекты...
  };
  
  return effectNameMap[name] || name;
};

