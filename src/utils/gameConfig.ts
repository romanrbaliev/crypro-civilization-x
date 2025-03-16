
// Конфигурация игровых элементов

// Ресурсы
export const resources = {
  knowledge: {
    id: "knowledge",
    name: "Знания о крипте",
    icon: "🧠",
    baseValue: 0,
    baseMax: 100,
    description: "Базовые знания о криптовалютах и блокчейне",
    phase: 1
  },
  usdt: {
    id: "usdt",
    name: "USDT",
    icon: "💰",
    baseValue: 0,
    baseMax: 50,
    description: "Стейблкоин, привязанный к доллару США",
    phase: 1
  },
  electricity: {
    id: "electricity",
    name: "Электричество",
    icon: "⚡",
    baseValue: 0,
    baseMax: 1000,
    description: "Используется для питания майнинг-ферм и компьютеров",
    phase: 2
  },
  computingPower: {
    id: "computingPower",
    name: "Вычислительная мощность",
    icon: "💻",
    baseValue: 0,
    baseMax: 1000,
    description: "Необходима для майнинга и анализа данных",
    phase: 2
  },
  reputation: {
    id: "reputation",
    name: "Репутация",
    icon: "⭐",
    baseValue: 0,
    baseMax: Infinity,
    description: "Влияет на доверие сообщества и возможности сотрудничества",
    phase: 2
  },
  hashrate: {
    id: "hashrate",
    name: "Хешрейт",
    icon: "🔄",
    baseValue: 0,
    baseMax: 10000,
    description: "Скорость решения криптографических задач для майнинга",
    phase: 3
  },
  subscribers: {
    id: "subscribers",
    name: "Подписчики",
    icon: "👥",
    baseValue: 0,
    baseMax: Infinity,
    description: "Ваши последователи в крипто-сообществе",
    phase: 3
  }
};

// Роли
export const roles = {
  investor: {
    id: "investor",
    name: "Инвестор",
    description: "Фокус на долгосрочные инвестиции и диверсификацию",
    bonuses: {
      stakingIncome: 0.15,
      maxCrypto: 0.10,
      portfolioVolatility: -0.05
    },
    phase: 3
  },
  trader: {
    id: "trader",
    name: "Трейдер",
    description: "Фокус на краткосрочную торговлю и использование волатильности",
    bonuses: {
      tradingProfit: 0.20,
      tradeSpeed: 0.15,
      automationBonus: 0.10
    },
    phase: 3
  },
  miner: {
    id: "miner",
    name: "Майнер",
    description: "Фокус на создание инфраструктуры для поддержания сети",
    bonuses: {
      hashrateEfficiency: 0.25,
      energyConsumption: -0.10,
      blockFindChance: 0.15
    },
    phase: 3
  },
  influencer: {
    id: "influencer",
    name: "Инфлюенсер",
    description: "Фокус на социальное влияние и формирование общественного мнения",
    bonuses: {
      subscriberGrowth: 0.30,
      reputationEfficiency: 0.20,
      marketInfluence: 0.15
    },
    phase: 3
  }
};

// Фазы игры
export const phases = [
  {
    id: 1,
    name: "Первые шаги",
    description: "Изучение основ криптовалют и первые инвестиции",
    requiredScore: 0
  },
  {
    id: 2,
    name: "Основы криптоэкономики",
    description: "Развитие инфраструктуры и накопление ресурсов",
    requiredScore: 100
  },
  {
    id: 3,
    name: "Специализация",
    description: "Выбор роли и развитие в выбранном направлении",
    requiredScore: 500
  },
  {
    id: 4,
    name: "Крипто-сообщество",
    description: "Создание и развитие собственного сообщества",
    requiredScore: 2000
  },
  {
    id: 5,
    name: "Расширенная крипто-экономика",
    description: "Управление сложными финансовыми инструментами и проектами",
    requiredScore: 10000
  },
  {
    id: 6,
    name: "Престиж и мета-прогрессия",
    description: "Перезапуск с сохранением ключевых улучшений",
    requiredScore: 50000
  }
];

// Формулы расчетов
export const formulas = {
  // Базовая формула накопления знаний
  knowledgeGain: (baseRate: number, buildingsBonus: number, skillsBonus: number, socialBonus: number) => {
    return baseRate * (1 + buildingsBonus) * (1 + skillsBonus) * (1 + socialBonus);
  },
  
  // Формула конвертации знаний в USDT
  knowledgeToUsdt: (baseConversion: number, efficiency: number) => {
    return baseConversion * (1 + efficiency);
  },
  
  // Формула расчета стоимости здания
  buildingCost: (baseCost: number, multiplier: number, count: number) => {
    return baseCost * Math.pow(multiplier, count);
  },
  
  // Формула расчета хешрейта
  hashrate: (computingPower: number, miningEfficiency: number, specialization: number) => {
    return computingPower * miningEfficiency * (1 + specialization);
  },
  
  // Формула роста подписчиков
  subscriberGrowth: (baseGrowth: number, currentSubscribers: number, virality: number, reputation: number, trustCoefficient: number) => {
    return baseGrowth * (1 + currentSubscribers * virality) * (1 + reputation * trustCoefficient);
  },
  
  // Формула волатильности цены актива
  assetPrice: (basePrice: number, volatility: number, time: number, period: number, trend: number, randomness: number) => {
    const oscillation = volatility * Math.sin(time / period);
    const random = (Math.random() * 2 - 1) * randomness;
    return basePrice * (1 + oscillation + trend + random);
  }
};
