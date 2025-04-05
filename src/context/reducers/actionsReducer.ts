import { GameState, GameAction, Resource, ResourceType } from '../types';
import { processPurchaseBuilding, processSellBuilding, checkBuildingUnlocks } from './building';
import { checkUnlocks } from './unlockReducer';

/**
 * Обрабатывает действия игрока и обновляет состояние игры
 * @param state Текущее состояние игры
 * @param action Действие, которое нужно обработать
 * @returns Новое состояние игры
 */
export const actionsReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'LEARN_CRYPTO': {
      // Проверяем, достигнут ли максимум знаний
      if (state.resources.knowledge.value >= state.resources.knowledge.max) {
        return state;
      }
      
      // Увеличиваем количество знаний на 1
      const newKnowledgeValue = state.resources.knowledge.value + 1;
      
      // Обновляем ресурс знаний
      const updatedKnowledge: Resource = {
        ...state.resources.knowledge,
        value: newKnowledgeValue,
      };
      
      // Создаем новое состояние с обновленными ресурсами
      const newState: GameState = {
        ...state,
        resources: {
          ...state.resources,
          knowledge: updatedKnowledge,
        },
        stats: {
          ...state.stats,
          totalKnowledgeGained: (state.stats.totalKnowledgeGained || 0) + 1,
          totalClicks: (state.stats.totalClicks || 0) + 1,
        },
      };
      
      // Проверяем, нужно ли разблокировать что-то новое
      return checkUnlocks(newState);
    }
    
    case 'APPLY_KNOWLEDGE': {
      // Проверяем, достаточно ли знаний (минимум 10)
      if (state.resources.knowledge.value < 10) {
        return state;
      }
      
      // Получаем текущие знания и рассчитываем, сколько можно применить
      const currentKnowledge = state.resources.knowledge.value;
      const knowledgeToApply = Math.min(currentKnowledge, 10);
      
      // Рассчитываем полученный USDT (10 знаний = 1 USDT)
      const baseExchangeRate = 10; // базовый курс обмена
      const knowledgeEfficiencyBoost = state.effects.knowledgeEfficiencyBoost || 0;
      
      // Учитываем бонус к эффективности знаний
      const usdt = knowledgeToApply / baseExchangeRate * (1 + knowledgeEfficiencyBoost);
      
      // Обновляем ресурсы
      const newKnowledgeValue = currentKnowledge - knowledgeToApply;
      const updatedKnowledge: Resource = {
        ...state.resources.knowledge,
        value: newKnowledgeValue,
      };
      
      // Проверяем, существует ли ресурс USDT и разблокирован ли он
      let updatedUsdt: Resource;
      
      if (state.resources.usdt) {
        // Обновляем существующий ресурс
        updatedUsdt = {
          ...state.resources.usdt,
          value: Math.min(
            state.resources.usdt.value + usdt,
            state.resources.usdt.max
          ),
          unlocked: true,
        } as Resource;
      } else {
        // Создаем новый ресурс USDT с правильным типом ResourceType
        updatedUsdt = {
          id: 'usdt',
          name: 'USDT',
          description: 'Стабильная криптовалюта, привязанная к доллару США',
          icon: 'currency-dollar',
          type: 'currency' as ResourceType, // Явно указываем тип
          value: usdt,
          unlocked: true,
          max: 100,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          consumption: 0,
        };
      }
      
      // Создаем новое состояние с обновленными ресурсами
      const newState: GameState = {
        ...state,
        resources: {
          ...state.resources,
          knowledge: updatedKnowledge,
          usdt: updatedUsdt,
        },
        stats: {
          ...state.stats,
          totalUsdtGained: (state.stats.totalUsdtGained || 0) + usdt,
        },
      };
      
      // Проверяем, нужно ли разблокировать что-то новое
      return checkUnlocks(newState);
    }
    
    case 'APPLY_ALL_KNOWLEDGE': {
      // Проверяем, достаточно ли знаний (минимум 10)
      if (state.resources.knowledge.value < 10) {
        return state;
      }
      
      // Получаем текущие знания и рассчитываем, сколько можно применить
      const currentKnowledge = state.resources.knowledge.value;
      // Оставляем только кратное 10 количество знаний для обмена
      const knowledgeToApply = Math.floor(currentKnowledge / 10) * 10;
      
      // Рассчитываем полученный USDT (10 знаний = 1 USDT)
      const baseExchangeRate = 10; // базовый курс обмена
      const knowledgeEfficiencyBoost = state.effects.knowledgeEfficiencyBoost || 0;
      
      // Учитываем бонус к эффективности знаний
      const usdt = knowledgeToApply / baseExchangeRate * (1 + knowledgeEfficiencyBoost);
      
      // Обновляем ресурсы
      const newKnowledgeValue = currentKnowledge - knowledgeToApply;
      const updatedKnowledge: Resource = {
        ...state.resources.knowledge,
        value: newKnowledgeValue,
      };
      
      // Проверяем, существует ли ресурс USDT и разблокирован ли он
      let updatedUsdt: Resource;
      
      if (state.resources.usdt) {
        // Обновляем существующий ресурс
        updatedUsdt = {
          ...state.resources.usdt,
          value: Math.min(
            state.resources.usdt.value + usdt,
            state.resources.usdt.max
          ),
          unlocked: true,
        } as Resource;
      } else {
        // Создаем новый ресурс USDT с правильным типом
        updatedUsdt = {
          id: 'usdt',
          name: 'USDT',
          description: 'Стабильная криптовалюта, привязанная к доллару США',
          icon: 'currency-dollar',
          type: 'currency' as ResourceType, // Явно указываем тип
          value: usdt,
          unlocked: true,
          max: 100,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          consumption: 0,
        };
      }
      
      // Создаем новое состояние с обновленными ресурсами
      const newState: GameState = {
        ...state,
        resources: {
          ...state.resources,
          knowledge: updatedKnowledge,
          usdt: updatedUsdt,
        },
        stats: {
          ...state.stats,
          totalUsdtGained: (state.stats.totalUsdtGained || 0) + usdt,
        },
      };
      
      // Проверяем, нужно ли разблокировать что-то новое
      return checkUnlocks(newState);
    }
    
    case 'UPDATE_RESOURCES': {
      // Копируем текущие ресурсы
      const updatedResources = { ...state.resources };
      
      // Обновляем каждый ресурс на основе его производства в секунду
      Object.values(updatedResources).forEach(resource => {
        if (resource.unlocked) {
          const production = resource.production || 0;
          const baseProduction = resource.baseProduction || 0;
          const perSecond = (production + baseProduction) / 100;
          
          // Увеличиваем значение ресурса, но не выше максимума
          resource.value = Math.min(resource.value + perSecond, resource.max);
          resource.perSecond = perSecond * 100;
        }
      });
      
      return {
        ...state,
        resources: updatedResources,
      };
    }
    
    case 'FORCE_RESOURCE_UPDATE': {
      // Копируем текущие ресурсы
      const updatedResources = { ...state.resources };
      
      // Обновляем каждый ресурс на основе его производства в секунду
      Object.values(updatedResources).forEach(resource => {
        if (resource.unlocked) {
          const production = resource.production || 0;
          const baseProduction = resource.baseProduction || 0;
          const perSecond = (production + baseProduction) / 100;
          
          // Увеличиваем значение ресурса, но не выше максимума
          resource.value = Math.min(resource.value + perSecond, resource.max);
          resource.perSecond = perSecond * 100;
        }
      });
      
      return {
        ...state,
        resources: updatedResources,
      };
    }
    
    case 'PURCHASE_BUILDING':
      return processPurchaseBuilding(state, action.payload.buildingId);
    
    case 'SELL_BUILDING':
      return processSellBuilding(state, action.payload.buildingId);
    
    case 'UNLOCK_BUILDING': {
      const buildingId = action.payload.buildingId;
      return {
        ...state,
        buildings: {
          ...state.buildings,
          [buildingId]: {
            ...state.buildings[buildingId],
            unlocked: true,
          },
        },
      };
    }
    
    case 'RESEARCH_UPGRADE': {
      const upgradeId = action.payload.upgradeId;
      const upgrade = state.research[upgradeId];
      
      if (!upgrade) {
        console.error(`Upgrade with id ${upgradeId} not found`);
        return state;
      }
      
      // Проверяем, достаточно ли ресурсов для исследования
      for (const [resourceId, amount] of Object.entries(upgrade.cost)) {
        if (state.resources[resourceId].value < amount) {
          console.warn(`Недостаточно ресурса ${resourceId} для улучшения ${upgradeId}`);
          return state;
        }
      }
      
      // Снимаем стоимость улучшения с ресурсов
      const updatedResources = { ...state.resources };
      for (const [resourceId, amount] of Object.entries(upgrade.cost)) {
        updatedResources[resourceId] = {
          ...updatedResources[resourceId],
          value: updatedResources[resourceId].value - amount,
        };
      }
      
      // Помечаем улучшение как изученное
      const updatedResearch = {
        ...state.research,
        [upgradeId]: {
          ...upgrade,
          researched: true,
        },
      };
      
      // Применяем эффекты улучшения
      let newState = {
        ...state,
        resources: updatedResources,
        research: updatedResearch,
      };
      
      // Проверяем, нужно ли разблокировать что-то новое
      newState = checkUnlocks(newState);
      
      return newState;
    }
    
    case 'UNLOCK_RESEARCH': {
      return {
        ...state,
        unlocks: {
          ...state.unlocks,
          research: true,
        },
      };
    }
    
    case 'UNLOCK_BITCOIN_EXCHANGE': {
      return {
        ...state,
        unlocks: {
          ...state.unlocks,
          bitcoinExchange: true,
        },
      };
    }
    
    case 'EXCHANGE_BITCOIN': {
      if (!state.resources.bitcoin || state.resources.bitcoin.value <= 0) {
        console.warn('Нет Bitcoin для обмена');
        return state;
      }
      
      // Получаем текущий курс обмена (например, 1 BTC = 10000 USDT)
      const exchangeRate = 10000;
      
      // Рассчитываем полученный USDT
      const usdt = state.resources.bitcoin.value * exchangeRate;
      
      // Обновляем ресурсы
      const updatedBitcoin: Resource = {
        ...state.resources.bitcoin,
        value: 0,
      };
      
      const updatedUsdt: Resource = {
        ...state.resources.usdt,
        value: Math.min(
          state.resources.usdt.value + usdt,
          state.resources.usdt.max
        ),
      };
      
      return {
        ...state,
        resources: {
          ...state.resources,
          bitcoin: updatedBitcoin,
          usdt: updatedUsdt,
        },
      };
    }
    
    case 'DEBUG_ADD_RESOURCES': {
      const { resourceId, amount } = action.payload;
      const resource = state.resources[resourceId];
      
      if (!resource) {
        console.error(`Resource with id ${resourceId} not found`);
        return state;
      }
      
      const updatedResource: Resource = {
        ...resource,
        value: Math.min(resource.value + amount, resource.max),
      };
      
      return {
        ...state,
        resources: {
          ...state.resources,
          [resourceId]: updatedResource,
        },
      };
    }
    
    case 'UNLOCK_BUILDING_PRACTICE': {
      return {
        ...state,
        buildings: {
          ...state.buildings,
          practice: {
            ...state.buildings.practice,
            unlocked: true,
          },
        },
      };
    }
    
    case 'UNLOCK_BUILDING_GENERATOR': {
      return {
        ...state,
        buildings: {
          ...state.buildings,
          generator: {
            ...state.buildings.generator,
            unlocked: true,
          },
        },
      };
    }
    
    case 'CHOOSE_SPECIALIZATION': {
      const specializationId = action.payload.specializationId;
      
      return {
        ...state,
        player: {
          ...state.player,
          specialization: specializationId,
        },
      };
    }
    
    case 'RESET_GAME':
      return {
        ...state,
        resources: {
          knowledge: { ...state.resources.knowledge, value: 0, unlocked: true },
          usdt: { ...state.resources.usdt, value: 0, unlocked: false, max: 100 },
          electricity: { ...state.resources.electricity, value: 0, unlocked: false, max: 5 },
          computingPower: { ...state.resources.computingPower, value: 0, unlocked: false, max: 0 },
          bitcoin: { ...state.resources.bitcoin, value: 0, unlocked: false, max: 0 },
        },
        buildings: {
          practice: { ...state.buildings.practice, count: 0, unlocked: true },
          generator: { ...state.buildings.generator, count: 0, unlocked: false },
          homeComputer: { ...state.buildings.homeComputer, count: 0, unlocked: false },
          cryptoWallet: { ...state.buildings.cryptoWallet, count: 0, unlocked: false },
          internetChannel: { ...state.buildings.internetChannel, count: 0, unlocked: false },
          miner: { ...state.buildings.miner, count: 0, unlocked: false },
          autoMiner: { ...state.buildings.autoMiner, count: 0, unlocked: false },
          coolingSystem: { ...state.buildings.coolingSystem, count: 0, unlocked: false },
          improvedWallet: { ...state.buildings.improvedWallet, count: 0, unlocked: false },
          cryptoLibrary: { ...state.buildings.cryptoLibrary, count: 0, unlocked: false },
        },
        research: {
          blockchainBasics: { ...state.research.blockchainBasics, researched: false },
          walletSecurity: { ...state.research.walletSecurity, researched: false },
          cryptoFundamentals: { ...state.research.cryptoFundamentals, researched: false },
          algorithmOptimization: { ...state.research.algorithmOptimization, researched: false },
          proofOfWork: { ...state.research.proofOfWork, researched: false },
          energyEfficientComponents: { ...state.research.energyEfficientComponents, researched: false },
          cryptoTrading: { ...state.research.cryptoTrading, researched: false },
          tradingBot: { ...state.research.tradingBot, researched: false },
        },
        unlocks: {
          research: false,
          bitcoinExchange: false,
          autoMiner: false,
          specialization: false,
          referrals: false,
        },
        player: {
          ...state.player,
          specialization: null,
        },
        phase: 0,
        stats: {
          totalKnowledgeGained: 0,
          totalUsdtGained: 0,
          totalClicks: 0,
        },
      };
    
    default:
      return state;
  }
};
