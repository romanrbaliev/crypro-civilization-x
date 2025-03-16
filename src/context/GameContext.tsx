import React, { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "sonner";
import { resources } from "@/utils/gameConfig";

// Типы ресурсов
export interface Resource {
  id: string;
  name: string;
  icon: string;
  value: number;
  perSecond: number;
  unlocked: boolean;
  max: number;
}

// Типы апгрейдов
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: { [key: string]: number };
  effect: { [key: string]: number };
  unlocked: boolean;
  purchased: boolean;
  requirements?: { [key: string]: number };
}

// Типы зданий
export interface Building {
  id: string;
  name: string;
  description: string;
  cost: { [key: string]: number };
  costMultiplier: number;
  production: { [key: string]: number };
  count: number;
  unlocked: boolean;
  requirements?: { [key: string]: number };
}

// Структура состояния игры
interface GameState {
  resources: { [key: string]: Resource };
  upgrades: { [key: string]: Upgrade };
  buildings: { [key: string]: Building };
  unlocks: { [key: string]: boolean };
  lastUpdate: number;
  gameStarted: boolean;
  prestigePoints: number;
  phase: number;
}

// Типы действий
type GameAction =
  | { type: "INCREMENT_RESOURCE"; payload: { resourceId: string; amount: number } }
  | { type: "UPDATE_RESOURCES" }
  | { type: "PURCHASE_BUILDING"; payload: { buildingId: string } }
  | { type: "PURCHASE_UPGRADE"; payload: { upgradeId: string } }
  | { type: "UNLOCK_FEATURE"; payload: { featureId: string } }
  | { type: "START_GAME" }
  | { type: "LOAD_GAME"; payload: GameState }
  | { type: "PRESTIGE" };

// Начальное состояние игры
const initialBuildings: { [key: string]: Building } = {
  practice: {
    id: "practice",
    name: "Практика",
    description: "Автоматически изучать криптовалюту",
    cost: { usdt: 10 },
    costMultiplier: 1.15,
    production: { knowledge: 0.63 },
    count: 0,
    unlocked: true,
    requirements: { knowledge: 15 }
  },
  generator: {
    id: "generator",
    name: "Генератор",
    description: "Производит электричество для ваших устройств",
    cost: { usdt: 25 },
    costMultiplier: 1.15,
    production: { electricity: 0.5 },
    count: 0,
    unlocked: false,
    requirements: { usdt: 20 }
  },
  homeComputer: {
    id: "homeComputer",
    name: "Домашний компьютер",
    description: "Обеспечивает вычислительную мощность",
    cost: { usdt: 30, electricity: 5 },
    costMultiplier: 1.15,
    production: { computingPower: 2 },
    count: 0,
    unlocked: false,
    requirements: { usdt: 25, electricity: 10 }
  },
  cryptoWallet: {
    id: "cryptoWallet",
    name: "Криптокошелек",
    description: "Увеличивает максимальное хранение USDT",
    cost: { usdt: 15, knowledge: 25 },
    costMultiplier: 1.2,
    production: { usdtMax: 50 },
    count: 0,
    unlocked: false,
    requirements: { knowledge: 20 }
  },
  internetConnection: {
    id: "internetConnection",
    name: "Интернет-канал",
    description: "Ускоряет получение знаний",
    cost: { usdt: 50 },
    costMultiplier: 1.3,
    production: { knowledgeBoost: 0.2 },
    count: 0,
    unlocked: false,
    requirements: { usdt: 45 }
  }
};

const initialUpgrades: { [key: string]: Upgrade } = {
  basicBlockchain: {
    id: "basicBlockchain",
    name: "Основы блокчейна",
    description: "Открывает базовые механики криптовалют",
    cost: { knowledge: 50 },
    effect: { knowledgeBoost: 0.1 },
    unlocked: false,
    purchased: false,
    requirements: { knowledge: 45 }
  },
  cryptoTrading: {
    id: "cryptoTrading",
    name: "Криптовалютный трейдинг",
    description: "Открывает возможность обмена между криптовалютами",
    cost: { knowledge: 100, usdt: 20 },
    effect: { conversionRate: 0.15 },
    unlocked: false,
    purchased: false,
    requirements: { knowledge: 80, usdt: 15 }
  },
  walletSecurity: {
    id: "walletSecurity",
    name: "Безопасность криптокошельков",
    description: "Увеличивает максимальное хранение криптовалют",
    cost: { knowledge: 75 },
    effect: { usdtMaxBoost: 0.25 },
    unlocked: false,
    purchased: false,
    requirements: { knowledge: 70 }
  }
};

const initialState: GameState = {
  resources: {
    knowledge: {
      id: "knowledge",
      name: "Знания о крипте",
      icon: "🧠",
      value: 0,
      perSecond: 0,
      unlocked: true,
      max: 100
    },
    usdt: {
      id: "usdt",
      name: "USDT",
      icon: "💰",
      value: 0,
      perSecond: 0,
      unlocked: false,
      max: 50
    },
    electricity: {
      id: "electricity",
      name: "Электричество",
      icon: "⚡",
      value: 0,
      perSecond: 0,
      unlocked: false,
      max: 1000
    },
    computingPower: {
      id: "computingPower",
      name: "Вычислительная мощность",
      icon: "💻",
      value: 0,
      perSecond: 0,
      unlocked: false,
      max: 1000
    },
    reputation: {
      id: "reputation",
      name: "Репутация",
      icon: "⭐",
      value: 0,
      perSecond: 0,
      unlocked: false,
      max: Infinity
    }
  },
  buildings: initialBuildings,
  upgrades: initialUpgrades,
  unlocks: {
    applyKnowledge: false,
    practice: false
  },
  lastUpdate: Date.now(),
  gameStarted: false,
  prestigePoints: 0,
  phase: 1
};

// Создание контекста
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({
  state: initialState,
  dispatch: () => null
});

// Редуктор для обработки действий
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "INCREMENT_RESOURCE": {
      const { resourceId, amount } = action.payload;
      
      // Проверяем, что ресурс существует
      if (!state.resources[resourceId]) {
        console.error(`Ресурс ${resourceId} не существует!`);
        return state;
      }
      
      const resource = state.resources[resourceId];
      
      if (!resource.unlocked) {
        console.log(`Ресурс ${resourceId} не разблокирован!`);
        return state;
      }
      
      console.log(`Изменение ресурса ${resourceId}: ${resource.value} -> ${resource.value + amount}`);
      
      // Новое значение ресурса, ограниченное максимумом
      const newValue = Math.min(resource.value + amount, resource.max);
      
      // Копируем все ресурсы для изменения
      const newResources = {
        ...state.resources,
        [resourceId]: {
          ...resource,
          value: newValue
        }
      };
      
      // Копируем состояние разблокировок для изменения
      let newUnlocks = { ...state.unlocks };
      let newBuildings = { ...state.buildings };
      
      // Проверяем условия разблокировки новых функций на основе изменения ресурсов
      
      // Если знания достигли 10, открываем кнопку "Применить знания"
      if (resourceId === "knowledge" && newValue >= 10 && !state.unlocks.applyKnowledge) {
        newUnlocks.applyKnowledge = true;
        toast.success("Открыта новая функция: Применить знания");
      }
      
      // Если знания достигли 15, открываем здание "Практика"
      if (resourceId === "knowledge" && newValue >= 15 && !state.unlocks.practice) {
        newBuildings.practice.unlocked = true;
        newUnlocks.practice = true;
        toast.success("Открыта новая функция: Практика");
      }
      
      // Если USDT достиг 20, открываем Генератор
      if (resourceId === "usdt" && newValue >= 20 && !state.buildings.generator.unlocked) {
        newBuildings.generator.unlocked = true;
        toast.success("Открыто новое здание: Генератор");
      }
      
      // Если USDT и электричество достигли нужных значений, открываем Домашний компьютер
      if ((resourceId === "usdt" && newValue >= 25 && state.resources.electricity.value >= 10) ||
          (resourceId === "electricity" && newValue >= 10 && state.resources.usdt.value >= 25)) {
        if (!state.buildings.homeComputer.unlocked) {
          newBuildings.homeComputer.unlocked = true;
          toast.success("Открыто новое здание: Домашний компьютер");
        }
      }
      
      // Открываем USDT если ещё не открыт и уже есть знания
      if (resourceId === "knowledge" && newValue >= 5 && !newResources.usdt.unlocked) {
        newResources.usdt.unlocked = true;
        toast.success("Открыт новый ресурс: USDT");
      }
      
      return {
        ...state,
        resources: newResources,
        unlocks: newUnlocks,
        buildings: newBuildings
      };
    }
    
    case "UPDATE_RESOURCES": {
      const now = Date.now();
      const deltaTime = (now - state.lastUpdate) / 1000; // в секундах
      
      // Если прошло менее 0.1 секунды, не обновляем
      if (deltaTime < 0.1) return state;
      
      const newResources = { ...state.resources };
      
      // Применяем производство от зданий
      for (const building of Object.values(state.buildings)) {
        if (building.count === 0) continue;
        
        for (const [resourceId, amount] of Object.entries(building.production)) {
          // Проверяем, содержит ли производство изменение максимального значения
          if (resourceId.includes('Max')) {
            const actualResourceId = resourceId.replace('Max', '');
            if (newResources[actualResourceId]) {
              // Не обновляем ресурсы здесь, только расчитываем новый максимум
              continue;
            }
          } else if (resourceId.includes('Boost')) {
            // Обрабатываем бонусы производства
            continue;
          } else if (newResources[resourceId]) {
            // Обычные ресурсы: производство в секунду * количество зданий * дельта времени
            const resourceAmount = amount * building.count * deltaTime;
            newResources[resourceId].value = Math.min(
              newResources[resourceId].value + resourceAmount,
              newResources[resourceId].max
            );
            newResources[resourceId].perSecond = amount * building.count;
          }
        }
      }
      
      // Обновляем максимальные значения ресурсов на основе здан��й
      for (const building of Object.values(state.buildings)) {
        if (building.count === 0) continue;
        
        for (const [resourceId, amount] of Object.entries(building.production)) {
          if (resourceId.includes('Max')) {
            const actualResourceId = resourceId.replace('Max', '');
            if (newResources[actualResourceId]) {
              newResources[actualResourceId].max = initialState.resources[actualResourceId].max + 
                amount * building.count;
            }
          }
        }
      }
      
      // Обновляем бонусы к производству
      let knowledgeBoost = 1;
      let usdtMaxBoost = 1;
      
      // Проверяем здания, дающие бонусы
      for (const building of Object.values(state.buildings)) {
        if (building.count === 0) continue;
        
        for (const [resourceId, amount] of Object.entries(building.production)) {
          if (resourceId === 'knowledgeBoost') {
            knowledgeBoost += amount * building.count;
          }
        }
      }
      
      // Проверяем апгрейды, дающие бонусы
      for (const upgrade of Object.values(state.upgrades)) {
        if (!upgrade.purchased) continue;
        
        for (const [effectId, amount] of Object.entries(upgrade.effect)) {
          if (effectId === 'knowledgeBoost') {
            knowledgeBoost += amount;
          } else if (effectId === 'usdtMaxBoost') {
            usdtMaxBoost += amount;
          }
        }
      }
      
      // Применяем бонусы
      if (knowledgeBoost !== 1) {
        for (const building of Object.values(state.buildings)) {
          if (building.count === 0) continue;
          
          if (building.production.knowledge) {
            const boostedProduction = building.production.knowledge * knowledgeBoost;
            newResources.knowledge.perSecond = boostedProduction * building.count;
          }
        }
      }
      
      if (usdtMaxBoost !== 1) {
        newResources.usdt.max = newResources.usdt.max * usdtMaxBoost;
      }
      
      // Проверяем условия открытия новых апгрейдов
      const newUpgrades = { ...state.upgrades };
      for (const upgrade of Object.values(newUpgrades)) {
        if (upgrade.unlocked || upgrade.purchased) continue;
        
        let canUnlock = true;
        for (const [resourceId, requiredAmount] of Object.entries(upgrade.requirements || {})) {
          if (!newResources[resourceId] || newResources[resourceId].value < requiredAmount) {
            canUnlock = false;
            break;
          }
        }
        
        if (canUnlock) {
          upgrade.unlocked = true;
          toast.success(`Новое исследование доступно: ${upgrade.name}`);
        }
      }
      
      // Проверяем условия открытия новых зданий
      const newBuildings = { ...state.buildings };
      for (const building of Object.values(newBuildings)) {
        if (building.unlocked) continue;
        
        let canUnlock = true;
        for (const [resourceId, requiredAmount] of Object.entries(building.requirements || {})) {
          if (!newResources[resourceId] || newResources[resourceId].value < requiredAmount) {
            canUnlock = false;
            break;
          }
        }
        
        if (canUnlock) {
          building.unlocked = true;
          toast.success(`Новое здание доступно: ${building.name}`);
        }
      }
      
      // Открываем электричество если есть генератор
      if (state.buildings.generator.count > 0 && !newResources.electricity.unlocked) {
        newResources.electricity.unlocked = true;
        toast.success("Открыт новый ресурс: Электричество");
      }
      
      // Открывае�� вычислительную мощность если есть домашний компьютер
      if (state.buildings.homeComputer.count > 0 && !newResources.computingPower.unlocked) {
        newResources.computingPower.unlocked = true;
        toast.success("Открыт новый ресурс: Вычислительная мощность");
      }
      
      return {
        ...state,
        resources: newResources,
        lastUpdate: now,
        upgrades: newUpgrades,
        buildings: newBuildings
      };
    }
    
    case "PURCHASE_BUILDING": {
      const { buildingId } = action.payload;
      const building = state.buildings[buildingId];
      
      if (!building) {
        console.error(`Building ${buildingId} not found!`);
        return state;
      }
      
      // Проверяем, разблокировано ли здание
      // Для здания practice не требуется проверка на разблокировку
      if (!building.unlocked && buildingId !== "practice") {
        console.log(`Building ${buildingId} is not unlocked yet!`);
        return state;
      }
      
      // Проверяем, есть ли достаточно ресурсов для покупки
      for (const [resourceId, cost] of Object.entries(building.cost)) {
        const resource = state.resources[resourceId];
        const actualCost = cost * Math.pow(building.costMultiplier, building.count);
        
        if (resource.value < actualCost) {
          toast.error(`Недостаточно ${resource.name} для покупки ${building.name}`);
          return state;
        }
      }
      
      // Вычитаем стоимость здания из ресурсов
      const newResources = { ...state.resources };
      for (const [resourceId, cost] of Object.entries(building.cost)) {
        const actualCost = cost * Math.pow(building.costMultiplier, building.count);
        newResources[resourceId].value -= actualCost;
      }
      
      // Увеличиваем количество здания
      const newBuildings = { ...state.buildings };
      
      // Специальная обработка для здания "practice"
      if (buildingId === "practice") {
        // Разблокируем здание "practice", если оно ещё не разблокировано
        newBuildings[buildingId].unlocked = true;
      }
      
      newBuildings[buildingId].count += 1;
      
      // Обновляем производство ресурсов сразу после покупки здания
      if (buildingId === "practice") {
        // Обновляем perSecond для ресурса знаний
        const productionAmount = building.production.knowledge || 0;
        newResources.knowledge.perSecond += productionAmount;
        
        // Убедимся, что разблокирован нужный флаг
        return {
          ...state,
          resources: newResources,
          buildings: newBuildings,
          unlocks: {
            ...state.unlocks,
            practice: true
          }
        };
      }
      
      toast.success(`Построено: ${building.name}`);
      
      return {
        ...state,
        resources: newResources,
        buildings: newBuildings
      };
    }
    
    case "PURCHASE_UPGRADE": {
      const { upgradeId } = action.payload;
      const upgrade = state.upgrades[upgradeId];
      
      if (!upgrade.unlocked || upgrade.purchased) return state;
      
      // Проверяем, есть ли достаточно ресурсов для покупки
      for (const [resourceId, cost] of Object.entries(upgrade.cost)) {
        const resource = state.resources[resourceId];
        
        if (resource.value < cost) {
          toast.error(`Недостаточно ${resource.name} для исследования ${upgrade.name}`);
          return state;
        }
      }
      
      // Вычитаем стоимость апгрейда из ресурсов
      const newResources = { ...state.resources };
      for (const [resourceId, cost] of Object.entries(upgrade.cost)) {
        newResources[resourceId].value -= cost;
      }
      
      // Отмечаем апгрейд как купленный
      const newUpgrades = { ...state.upgrades };
      newUpgrades[upgradeId].purchased = true;
      
      toast.success(`Исследовано: ${upgrade.name}`);
      
      return {
        ...state,
        resources: newResources,
        upgrades: newUpgrades
      };
    }
    
    case "UNLOCK_FEATURE": {
      const { featureId } = action.payload;
      
      return {
        ...state,
        unlocks: {
          ...state.unlocks,
          [featureId]: true
        }
      };
    }
    
    case "START_GAME": {
      return {
        ...state,
        gameStarted: true,
        lastUpdate: Date.now()
      };
    }
    
    case "LOAD_GAME": {
      return {
        ...action.payload,
        lastUpdate: Date.now()
      };
    }
    
    case "PRESTIGE": {
      // Рассчитываем очки престижа на основе текущего прогресса
      const totalWorth = Object.values(state.resources).reduce((sum, resource) => {
        return sum + resource.value;
      }, 0);
      
      const newPrestigePoints = state.prestigePoints + Math.floor(Math.log(totalWorth / 1000 + 1) * 10);
      
      toast.success(`Криптозима! Вы получили ${newPrestigePoints - state.prestigePoints} очков криптомудрости`);
      
      // Возвращаемся к начальному состоянию, но сохраняем очки престижа
      return {
        ...initialState,
        prestigePoints: newPrestigePoints,
        lastUpdate: Date.now()
      };
    }
    
    default:
      return state;
  }
};

// Провайдер для контекста
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Загрузка игры из localStorage при монтировании
  useEffect(() => {
    const savedGame = localStorage.getItem("cryptoCivilizationSave");
    if (savedGame) {
      try {
        const parsedSave = JSON.parse(savedGame);
        dispatch({ type: "LOAD_GAME", payload: parsedSave });
        toast.success("Игра загружена");
      } catch (error) {
        console.error("Ошибка загрузки игры:", error);
        toast.error("Ошибка загрузки игры");
      }
    }
  }, []);
  
  // Периодическое обновление ресурсов
  useEffect(() => {
    if (!state.gameStarted) return;
    
    const intervalId = setInterval(() => {
      dispatch({ type: "UPDATE_RESOURCES" });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [state.gameStarted]);
  
  // Сохранение игры в localStorage при изменении состояния
  useEffect(() => {
    if (!state.gameStarted) return;
    
    const saveGame = () => {
      localStorage.setItem("cryptoCivilizationSave", JSON.stringify(state));
    };
    
    // Сохраняем игру каждые 30 секунд
    const saveIntervalId = setInterval(saveGame, 30000);
    
    // Также сохраняем при закрытии/перезагрузке страницы
    window.addEventListener("beforeunload", saveGame);
    
    return () => {
      clearInterval(saveIntervalId);
      window.removeEventListener("beforeunload", saveGame);
    };
  }, [state]);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Хук для использования контекста
export const useGame = () => useContext(GameContext);
