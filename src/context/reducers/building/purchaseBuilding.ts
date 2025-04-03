
import { GameState } from '../../types';
import { hasEnoughResources, updateResourceMaxValues } from '../../utils/resourceUtils';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { checkAllUnlocks } from '@/utils/unlockManager';

// Обработка покупки зданий
export const processPurchaseBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  const building = state.buildings[buildingId];
  
  // Если здание не существует или не разблокировано, возвращаем текущее состояние
  if (!building || !building.unlocked) {
    console.warn(`Попытка купить недоступное здание: ${buildingId}`);
    return state;
  }
  
  // Проверяем, достаточно ли ресурсов для покупки
  const calculatedCost: { [key: string]: number } = {};
  for (const [resourceId, baseCost] of Object.entries(building.cost)) {
    // Рассчитываем текущую стоимость с учетом множителя и текущего количества
    const currentCost = Math.floor(Number(baseCost) * Math.pow(Number(building.costMultiplier || 1.15), building.count));
    calculatedCost[resourceId] = currentCost;
  }
  
  // Проверка достаточности ресурсов
  if (!hasEnoughResources(state, calculatedCost)) {
    console.warn(`Недостаточно ресурсов для покупки ${building.name}`);
    return state;
  }
  
  // Вычитаем ресурсы
  const newResources = { ...state.resources };
  for (const [resourceId, cost] of Object.entries(calculatedCost)) {
    newResources[resourceId] = {
      ...newResources[resourceId],
      value: Math.max(0, newResources[resourceId].value - cost) // Предотвращаем отрицательные значения
    };
  }
  
  // Увеличиваем количество зданий
  const newBuildings = {
    ...state.buildings,
    [buildingId]: {
      ...building,
      count: building.count + 1
    }
  };
  
  console.log(`Куплено здание ${building.name} за:`, calculatedCost);
  console.log(`Эффекты здания ${building.name}:`, building.effects || {});
  
  safeDispatchGameEvent(`Приобретено здание "${building.name}"`, "success");
  
  // Создаем новое состояние с обновленными ресурсами и зданиями
  let newState = {
    ...state,
    resources: newResources,
    buildings: newBuildings
  };
  
  // Применяем специальные эффекты от зданий
  if (buildingId === 'practice' && newState.buildings.practice.count === 1) {
    // Автоматическое получение 1 знаний/сек
    if (!newState.resources.knowledge?.baseProduction) {
      newState.resources.knowledge = {
        ...newState.resources.knowledge,
        baseProduction: 1,
        production: 1
      };
    }
  }
  
  if (buildingId === 'generator' && newState.buildings.generator.count === 1) {
    // Разблокируем электричество
    if (!newState.unlocks.electricity) {
      newState = {
        ...newState,
        unlocks: {
          ...newState.unlocks,
          electricity: true,
          // При покупке первого генератора разблокируем исследования
          research: true
        }
      };
      
      // Создаем ресурс электричества, если его нет
      if (!newState.resources.electricity) {
        newState.resources.electricity = {
          id: 'electricity',
          name: 'Электричество',
          description: 'Электроэнергия для питания устройств',
          type: 'resource',
          icon: 'zap',
          value: 0,
          baseProduction: 0.5, // Производит 0.5 электричества/сек
          production: 0.5,
          perSecond: 0.5,
          max: 100,
          unlocked: true
        };
        
        safeDispatchGameEvent('Разблокировано электричество!', 'success');
        safeDispatchGameEvent('Разблокированы исследования!', 'success');
      } else {
        newState.resources.electricity = {
          ...newState.resources.electricity,
          unlocked: true,
          baseProduction: 0.5,
          production: 0.5,
          perSecond: 0.5
        };
      }
    } else {
      // Если электричество уже разблокировано, увеличиваем производство
      newState.resources.electricity = {
        ...newState.resources.electricity,
        baseProduction: (newState.resources.electricity.baseProduction || 0) + 0.5,
        production: (newState.resources.electricity.production || 0) + 0.5,
        perSecond: (newState.resources.electricity.perSecond || 0) + 0.5
      };
      
      // Все равно разблокируем исследования
      newState = {
        ...newState,
        unlocks: {
          ...newState.unlocks,
          research: true
        }
      };
    }
  } else if (buildingId === 'generator' && newState.buildings.generator.count > 1) {
    // Увеличиваем производство электричества для каждого дополнительного генератора
    newState.resources.electricity = {
      ...newState.resources.electricity,
      baseProduction: (newState.resources.electricity.baseProduction || 0) + 0.5,
      production: (newState.resources.electricity.production || 0) + 0.5,
      perSecond: (newState.resources.electricity.perSecond || 0) + 0.5
    };
  }
  
  if (buildingId === 'cryptoWallet' && newState.buildings.cryptoWallet.count > 0) {
    // Применяем эффекты криптокошелька (+50 к макс. USDT, +25% к макс. знаниям)
    console.log('Применение эффектов криптокошелька');
    
    // Создаем или обновляем ресурс USDT, если его еще нет
    if (!newState.resources.usdt) {
      newState.resources.usdt = {
        id: 'usdt',
        name: 'USDT',
        description: 'Стейблкоин, привязанный к доллару США',
        type: 'currency',
        icon: 'dollar',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 50, // Базовый максимум для USDT
        unlocked: true
      };
      
      // Отмечаем USDT как разблокированный
      newState.unlocks = {
        ...newState.unlocks,
        usdt: true
      };
    }
    
    // Увеличиваем максимум USDT для каждого криптокошелька
    const walletCount = newState.buildings.cryptoWallet.count;
    const baseUsdtMax = 50; // Базовый максимум для одного кошелька
    const usdtMaxBonus = baseUsdtMax * walletCount;
    
    if (newState.resources.usdt) {
      newState.resources.usdt = {
        ...newState.resources.usdt,
        max: Math.max(newState.resources.usdt.max || 50, 50 + usdtMaxBonus)
      };
    }
    
    // Увеличиваем максимум знаний на 25% от текущего максимума за каждый кошелек
    if (newState.resources.knowledge) {
      const knowledgeBasicMax = 100; // Базовый максимум знаний
      const knowledgeMaxBoost = 0.25 * walletCount; // +25% за каждый кошелек
      
      newState.resources.knowledge = {
        ...newState.resources.knowledge,
        max: Math.max(
          newState.resources.knowledge.max || knowledgeBasicMax,
          knowledgeBasicMax * (1 + knowledgeMaxBoost)
        )
      };
    }
    
    if (newState.buildings.cryptoWallet.count === 1) {
      safeDispatchGameEvent('Криптокошелёк: +50 к макс. USDT, +25% к макс. знаниям', 'info');
    }
    
    // После покупки криптокошелька разблокируем исследование "Безопасность криптокошельков"
    if (newState.buildings.cryptoWallet.count === 1) {
      if (newState.upgrades.walletSecurity || newState.upgrades.cryptoWalletSecurity) {
        const securityUpgradeId = newState.upgrades.walletSecurity ? 'walletSecurity' : 'cryptoWalletSecurity';
        
        newState.upgrades[securityUpgradeId] = {
          ...newState.upgrades[securityUpgradeId],
          unlocked: true
        };
        console.log("Исследование 'Безопасность криптокошельков' разблокировано после покупки Криптокошелька");
        
        safeDispatchGameEvent('Разблокировано исследование "Безопасность криптокошельков"', 'info');
      }
    }
  }
  
  if (buildingId === 'homeComputer' && newState.buildings.homeComputer.count > 0) {
    // Разблокируем вычислительную мощность, если ещё не разблокирована
    if (!newState.unlocks.computingPower) {
      newState = {
        ...newState,
        unlocks: {
          ...newState.unlocks,
          computingPower: true
        }
      };
      
      // Создаем ресурс computingPower, если его нет
      if (!newState.resources.computingPower) {
        newState.resources.computingPower = {
          id: 'computingPower',
          name: 'Вычислительная мощность',
          description: 'Вычислительная мощность для майнинга',
          type: 'resource',
          icon: 'cpu',
          value: 0,
          baseProduction: 2, // +2 вычисл. мощности/сек
          production: 2,
          perSecond: 2,
          max: 1000,
          unlocked: true
        };
        
        safeDispatchGameEvent('Разблокирована вычислительная мощность!', 'success');
      } else {
        newState.resources.computingPower = {
          ...newState.resources.computingPower,
          unlocked: true,
          baseProduction: 2,
          production: 2,
          perSecond: 2
        };
      }
      
      // Домашний компьютер потребляет 1 электр./сек
      if (newState.resources.electricity) {
        newState.resources.electricity = {
          ...newState.resources.electricity,
          perSecond: (newState.resources.electricity.perSecond || 0) - 1
        };
      }
    } else {
      // Если вычислительная мощность уже разблокирована, увеличиваем производство
      newState.resources.computingPower = {
        ...newState.resources.computingPower,
        baseProduction: (newState.resources.computingPower.baseProduction || 0) + 2,
        production: (newState.resources.computingPower.production || 0) + 2,
        perSecond: (newState.resources.computingPower.perSecond || 0) + 2
      };
      
      // Каждый домашний компьютер потребляет 1 электр./сек
      if (newState.resources.electricity) {
        newState.resources.electricity = {
          ...newState.resources.electricity,
          perSecond: (newState.resources.electricity.perSecond || 0) - 1
        };
      }
    }
    
    // При покупке 2+ компьютера разблокируем систему охлаждения
    if (newState.buildings.homeComputer.count >= 2 && newState.buildings.coolingSystem) {
      newState.buildings.coolingSystem = {
        ...newState.buildings.coolingSystem,
        unlocked: true
      };
      newState.unlocks = {
        ...newState.unlocks,
        coolingSystem: true
      };
      console.log("✅ Разблокирована система охлаждения при покупке 2+ компьютера");
      safeDispatchGameEvent("Разблокирована система охлаждения", "success");
    }
  }
  
  // При покупке майнера разблокируем Bitcoin и алгоритмы оптимизации
  if (buildingId === 'miner' && newState.buildings.miner.count === 1) {
    console.log("Применяем эффекты от первой покупки майнера");
    
    // Разблокируем Bitcoin при покупке майнера
    if (!newState.resources.bitcoin || !newState.resources.bitcoin.unlocked) {
      // Инициализируем или обновляем Bitcoin
      if (!newState.resources.bitcoin) {
        newState.resources.bitcoin = {
          id: 'bitcoin',
          name: 'Bitcoin',
          description: 'Bitcoin - первая и основная криптовалюта',
          type: 'currency',
          icon: 'bitcoin',
          value: 0,
          baseProduction: 0.00005, // Базовая добыча за секунду
          production: 0.00005,
          perSecond: 0.00005,
          max: 100,
          unlocked: true
        };
      } else {
        newState.resources.bitcoin = {
          ...newState.resources.bitcoin,
          unlocked: true,
          baseProduction: 0.00005,
          production: 0.00005,
          perSecond: 0.00005
        };
      }
      
      // Отмечаем Bitcoin как разблокированный
      newState.unlocks = {
        ...newState.unlocks,
        bitcoin: true,
        // Также разблокируем кнопку обмена Bitcoin
        exchangeBtc: true
      };
      
      safeDispatchGameEvent("Разблокирован Bitcoin!", "success");
      safeDispatchGameEvent("Разблокирована кнопка обмена Bitcoin!", "info");
    } else {
      // Если Bitcoin уже разблокирован, увеличиваем производство
      newState.resources.bitcoin = {
        ...newState.resources.bitcoin,
        baseProduction: (newState.resources.bitcoin.baseProduction || 0) + 0.00005,
        production: (newState.resources.bitcoin.production || 0) + 0.00005,
        perSecond: (newState.resources.bitcoin.perSecond || 0) + 0.00005
      };
    }
    
    // Разблокируем исследование "Оптимизация алгоритмов" после покупки майнера
    if ((newState.upgrades.optimizationAlgorithms || newState.upgrades.algorithmOptimization) && 
        !(newState.upgrades.optimizationAlgorithms?.unlocked || newState.upgrades.algorithmOptimization?.unlocked)) {
      
      // Определяем ID исследования
      const upgradeId = newState.upgrades.optimizationAlgorithms ? 'optimizationAlgorithms' : 'algorithmOptimization';
      
      newState.upgrades[upgradeId] = {
        ...newState.upgrades[upgradeId],
        unlocked: true
      };
      
      console.log("✅ Разблокировано исследование 'Оптимизация алгоритмов' после покупки майнера");
      safeDispatchGameEvent("Разблокировано исследование 'Оптимизация алгоритмов'", "success");
    }
    
    // Майнинг потребляет ресурсы
    if (newState.resources.electricity) {
      newState.resources.electricity = {
        ...newState.resources.electricity,
        perSecond: (newState.resources.electricity.perSecond || 0) - 1 // -1 электричество/сек
      };
    }
    
    if (newState.resources.computingPower) {
      newState.resources.computingPower = {
        ...newState.resources.computingPower,
        perSecond: (newState.resources.computingPower.perSecond || 0) - 5 // -5 вычисл.мощность/сек
      };
    }
  } else if (buildingId === 'miner' && newState.buildings.miner.count > 1) {
    // Для каждого дополнительного майнера увеличиваем добычу и потребление ресурсов
    if (newState.resources.bitcoin) {
      newState.resources.bitcoin = {
        ...newState.resources.bitcoin,
        baseProduction: (newState.resources.bitcoin.baseProduction || 0) + 0.00005,
        production: (newState.resources.bitcoin.production || 0) + 0.00005,
        perSecond: (newState.resources.bitcoin.perSecond || 0) + 0.00005
      };
    }
    
    if (newState.resources.electricity) {
      newState.resources.electricity = {
        ...newState.resources.electricity,
        perSecond: (newState.resources.electricity.perSecond || 0) - 1
      };
    }
    
    if (newState.resources.computingPower) {
      newState.resources.computingPower = {
        ...newState.resources.computingPower,
        perSecond: (newState.resources.computingPower.perSecond || 0) - 5
      };
    }
  }
  
  // Проверяем, если это 5+ уровень криптокошелька, разблокируем улучшенный кошелек
  if (buildingId === 'cryptoWallet' && newState.buildings.cryptoWallet.count >= 5) {
    // Проверяем наличие улучшенного кошелька по разным ID
    if (newState.buildings.enhancedWallet && !newState.buildings.enhancedWallet.unlocked) {
      newState.buildings.enhancedWallet = {
        ...newState.buildings.enhancedWallet,
        unlocked: true
      };
      newState.unlocks = {
        ...newState.unlocks,
        enhancedWallet: true
      };
      console.log("✅ Разблокирован улучшенный кошелек при покупке 5+ уровня криптокошелька");
      safeDispatchGameEvent("Разблокирован улучшенный кошелек", "success");
    }
    
    if (newState.buildings.improvedWallet && !newState.buildings.improvedWallet.unlocked) {
      newState.buildings.improvedWallet = {
        ...newState.buildings.improvedWallet,
        unlocked: true
      };
      newState.unlocks = {
        ...newState.unlocks,
        improvedWallet: true
      };
      console.log("✅ Разблокирован улучшенный кошелек (improvedWallet) при покупке 5+ уровня криптокошелька");
      safeDispatchGameEvent("Разблокирован улучшенный кошелек", "success");
    }
  }

  // Обновляем максимальные значения ресурсов после всех изменений
  newState = updateResourceMaxValues(newState);
  
  // Проверяем разблокировки
  newState = checkAllUnlocks(newState);
  
  return newState;
};
