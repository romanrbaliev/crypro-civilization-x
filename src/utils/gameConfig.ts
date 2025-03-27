// К���нфигурация игровых элементов

// Ресурсы
export const resources = {
  knowledge: {
    id: "knowledge",
    name: "Знания",
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
  btc: {
    id: "btc",
    name: "Bitcoin",
    icon: "₿",
    baseValue: 0,
    baseMax: 10,
    description: "Основная криптовалюта, добываемая майнингом",
    phase: 2
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
  knowledgeGain: (baseRate: number, buildingsBonus: number, skillsBonus: number, socialBonus: number) => {
    return baseRate * (1 + buildingsBonus) * (1 + skillsBonus) * (1 + socialBonus);
  },
  knowledgeToUsdt: (baseConversion: number, efficiency: number) => {
    return baseConversion * (1 + efficiency);
  },
  buildingCost: (baseCost: number, multiplier: number, count: number) => {
    return baseCost * Math.pow(multiplier, count);
  },
  hashrate: (computingPower: number, miningEfficiency: number, specialization: number) => {
    return computingPower * miningEfficiency * (1 + specialization);
  },
  subscriberGrowth: (baseGrowth: number, currentSubscribers: number, virality: number, reputation: number, trustCoefficient: number) => {
    return baseGrowth * (1 + currentSubscribers * virality) * (1 + reputation * trustCoefficient);
  },
  assetPrice: (basePrice: number, volatility: number, time: number, period: number, trend: number, randomness: number) => {
    const oscillation = volatility * Math.sin(time / period);
    const random = (Math.random() * 2 - 1) * randomness;
    return basePrice * (1 + oscillation + trend + random);
  }
};

// Категории исследований
export const researchCategories = {
  blockchain: {
    id: "blockchain",
    name: "Блокчейн",
    description: "Основы блокчейн-технологий и их применение",
    icon: "⛓️",
    order: 1
  },
  mining: {
    id: "mining",
    name: "Майнинг",
    description: "Технологии добычи криптовалют",
    icon: "⛏️",
    order: 2
  },
  trading: {
    id: "trading",
    name: "Трейдинг",
    description: "Методы торговли на криптовалютных рынках",
    icon: "📈",
    order: 3
  },
  investment: {
    id: "investment",
    name: "Инвестиции",
    description: "Долгосрочные инвестиционные стратегии",
    icon: "💼",
    order: 4
  },
  defi: {
    id: "defi",
    name: "DeFi",
    description: "Децентрализованные финансы и протоколы",
    icon: "🏦",
    order: 5
  },
  social: {
    id: "social",
    name: "Социальное влияние",
    description: "Коммуникация и управление сообществом",
    icon: "🌐",
    order: 6
  }
};

// Механики синергии специализаций
export const specializationSynergies = {
  minerTrader: {
    id: "minerTrader",
    name: "Трейдер-майнер",
    description: "Синергия между майнингом и трейдингом: оптимальное использование добытых ресурсов на рынке",
    requiredCategories: ["mining", "trading"],
    requiredCount: 2,
    bonus: {
      miningEfficiencyBoost: 0.05,
      tradingProfitBoost: 0.05,
      computingPowerBoost: 0.03
    }
  },
  minerInvestor: {
    id: "minerInvestor",
    name: "Инвестор-майнер",
    description: "Синергия между майнингом и инвестициями: долгосрочные вложения в майнинг-инфраструктуру",
    requiredCategories: ["mining", "investment"],
    requiredCount: 2,
    bonus: {
      hashrateBoost: 0.05,
      stakingRewardBoost: 0.05,
      electricityEfficiencyBoost: 0.03
    }
  },
  traderInvestor: {
    id: "traderInvestor",
    name: "Трейдер-инвестор",
    description: "Синергия между трейдингом и инвестициями: эффективное сочетание краткосрочных и долгосрочных стратегий",
    requiredCategories: ["trading", "investment"],
    requiredCount: 2,
    bonus: {
      tradingProfitBoost: 0.05,
      portfolioGrowthBoost: 0.05,
      volatilityPredictionBoost: 0.03
    }
  },
  socialMiner: {
    id: "socialMiner",
    name: "Социальный майнер",
    description: "Синергия между социальным влиянием и майнингом: привлечение последователей к майнингу",
    requiredCategories: ["social", "mining"],
    requiredCount: 2,
    bonus: {
      subscriberGrowthBoost: 0.05,
      miningEfficiencyBoost: 0.05,
      reputationBoost: 0.03
    }
  },
  socialTrader: {
    id: "socialTrader",
    name: "Социальный трейдер",
    description: "Синергия между социальным влиянием и трейдингом: использование социального капитала для трейдинга",
    requiredCategories: ["social", "trading"],
    requiredCount: 2,
    bonus: {
      marketSentimentBoost: 0.08,
      tradingProfitBoost: 0.05,
      subscriberGrowthBoost: 0.03
    }
  },
  blockchainMaster: {
    id: "blockchainMaster",
    name: "Мастер блокчейна",
    description: "Глубокое понимание блокчейн-технологий, дающее преимущества во всех сферах",
    requiredCategories: ["blockchain"],
    requiredCount: 4,
    bonus: {
      knowledgeMaxBoost: 0.1,
      securityBoost: 0.1,
      reputationBoost: 0.05
    }
  },
  defiExpert: {
    id: "defiExpert",
    name: "DeFi-эксперт",
    description: "Глубокое понимание децентрализованных финансов и их применения",
    requiredCategories: ["defi", "blockchain"],
    requiredCount: 2,
    bonus: {
      defiYieldBoost: 0.1,
      passiveIncomeBoost: 0.08,
      liquidityMiningBoost: 0.05
    }
  }
};

// Расширенные исследования по категориям
export const techTreeUpgrades = {
  basicBlockchain: {
    id: "basicBlockchain",
    name: "Основы блокчейна",
    description: "Базовое понимание принципов работы блокчейна",
    category: "blockchain",
    tier: 1,
    cost: { knowledge: 50 },
    effect: { knowledgeMaxBoost: 0.5, knowledgeBoost: 0.1 },
    requiredUpgrades: [],
    unlockCondition: { buildings: { generator: 1 } },
    specialization: null
  },
  walletSecurity: {
    id: "walletSecurity",
    name: "Безопасность криптокошельков",
    description: "Защита криптовалютных активов от взлома",
    category: "blockchain",
    tier: 1,
    cost: { knowledge: 75 },
    effect: { usdtMaxBoost: 0.25, securityBoost: 0.05 },
    requiredUpgrades: ["basicBlockchain"],
    unlockCondition: { buildings: { cryptoWallet: 1 } },
    specialization: null
  },
  cryptoCurrencyBasics: {
    id: "cryptoCurrencyBasics",
    name: "Основы криптовалют",
    description: "Изучение принципов работы различных криптовалют",
    category: "blockchain",
    tier: 1,
    cost: { knowledge: 100 },
    effect: { miningEfficiencyBoost: 0.1 },
    requiredUpgrades: ["basicBlockchain"],
    unlockCondition: { resources: { knowledge: 150 } },
    specialization: null
  },
  smartContracts: {
    id: "smartContracts",
    name: "Смарт-контракты",
    description: "Автоматическое выполнение контрактов в блокчейне",
    category: "blockchain",
    tier: 2,
    cost: { knowledge: 350, usdt: 150 },
    effect: { automationBoost: 0.15, reputationBoost: 0.05 },
    requiredUpgrades: ["basicBlockchain"],
    unlockCondition: { resources: { knowledge: 500 } },
    specialization: null
  },
  blockchainScalability: {
    id: "blockchainScalability",
    name: "Масштабируемость блокчейна",
    description: "Решения для увеличения пропускной способности блокчейна",
    category: "blockchain",
    tier: 3,
    cost: { knowledge: 750, usdt: 300 },
    effect: { transactionSpeedBoost: 0.2, networkEfficiencyBoost: 0.15 },
    requiredUpgrades: ["smartContracts"],
    unlockCondition: { resources: { knowledge: 1000 } },
    specialization: null
  },
  
  proofOfWork: {
    id: "proofOfWork",
    name: "Proof of Work",
    description: "Алгоритм консенсуса, используемый в Bitcoin",
    category: "mining",
    tier: 1,
    cost: { knowledge: 200, usdt: 50 },
    effect: { miningEfficiencyBoost: 0.25 },
    requiredUpgrades: ["cryptoCurrencyBasics"],
    unlockCondition: { buildings: { homeComputer: 3 } },
    specialization: "miner"
  },
  miningOptimization: {
    id: "miningOptimization",
    name: "Оптимизация майнинга",
    description: "Методы повышения эффективности майнинга",
    category: "mining",
    tier: 2,
    cost: { knowledge: 300, usdt: 100, electricity: 100 },
    effect: { electricityEfficiencyBoost: 0.15, computingPowerBoost: 0.1 },
    requiredUpgrades: ["proofOfWork"],
    unlockCondition: { resources: { computingPower: 500 } },
    specialization: "miner"
  },
  asicMining: {
    id: "asicMining",
    name: "ASIC-майнинг",
    description: "Специализированное оборудование для майнинга",
    category: "mining",
    tier: 3,
    cost: { knowledge: 500, usdt: 250, electricity: 200 },
    effect: { hashrateBoost: 0.3, electricityConsumptionReduction: 0.1 },
    requiredUpgrades: ["miningOptimization"],
    unlockCondition: { resources: { hashrate: 100 } },
    specialization: "miner"
  },
  
  cryptoTrading: {
    id: "cryptoTrading",
    name: "Криптовалютный трейдинг",
    description: "Основы торговли на криптовалютных биржах",
    category: "trading",
    tier: 1,
    cost: { knowledge: 100, usdt: 20 },
    effect: { tradingEfficiencyBoost: 0.1, marketAnalysisBoost: 0.05 },
    requiredUpgrades: ["cryptoCurrencyBasics"],
    unlockCondition: { resources: { usdt: 100 } },
    specialization: "trader"
  },
  technicalAnalysis: {
    id: "technicalAnalysis",
    name: "Технический анализ",
    description: "Прогнозирование цен на основе графиков и индикаторов",
    category: "trading",
    tier: 2,
    cost: { knowledge: 250, usdt: 100 },
    effect: { tradingProfitBoost: 0.15, volatilityPredictionBoost: 0.1 },
    requiredUpgrades: ["cryptoTrading"],
    unlockCondition: { resources: { knowledge: 400 } },
    specialization: "trader"
  },
  tradingBots: {
    id: "tradingBots",
    name: "Торговые боты",
    description: "Автоматизированные системы торговли",
    category: "trading",
    tier: 3,
    cost: { knowledge: 500, usdt: 200, computingPower: 100 },
    effect: { automatedTradingBoost: 0.25, tradeSpeedBoost: 0.2 },
    requiredUpgrades: ["technicalAnalysis", "smartContracts"],
    unlockCondition: { resources: { usdt: 400 } },
    specialization: "trader"
  },
  
  portfolioDiversification: {
    id: "portfolioDiversification",
    name: "Диверсификация портфеля",
    description: "Распределение инвестиций между разными активами",
    category: "investment",
    tier: 1,
    cost: { knowledge: 200, usdt: 100 },
    effect: { riskReductionBoost: 0.1, passiveIncomeBoost: 0.05 },
    requiredUpgrades: ["cryptoCurrencyBasics"],
    unlockCondition: { resources: { usdt: 150 } },
    specialization: "investor"
  },
  proofOfStake: {
    id: "proofOfStake",
    name: "Proof of Stake",
    description: "Механизм консенсуса, основанный на доле владения",
    category: "investment",
    tier: 2,
    cost: { knowledge: 250, usdt: 100 },
    effect: { stakingRewardBoost: 0.25, stakingEfficiencyBoost: 0.15 },
    requiredUpgrades: ["portfolioDiversification"],
    unlockCondition: { resources: { usdt: 250 } },
    specialization: "investor"
  },
  wealthManagement: {
    id: "wealthManagement",
    name: "Управление капиталом",
    description: "Стратегии долгосрочного управления криптовалютными активами",
    category: "investment",
    tier: 3,
    cost: { knowledge: 600, usdt: 300 },
    effect: { passiveIncomeBoost: 0.2, portfolioGrowthBoost: 0.15 },
    requiredUpgrades: ["proofOfStake"],
    unlockCondition: { resources: { usdt: 500 } },
    specialization: "investor"
  },
  
  defiBasics: {
    id: "defiBasics",
    name: "Основы DeFi",
    description: "Введение в децентрализованные финансы",
    category: "defi",
    tier: 1,
    cost: { knowledge: 500, usdt: 200 },
    effect: { defiYieldBoost: 0.1, liquidityBoost: 0.05 },
    requiredUpgrades: ["smartContracts"],
    unlockCondition: { resources: { knowledge: 800 } },
    specialization: null
  },
  liquidityProviding: {
    id: "liquidityProviding",
    name: "Предоставление ликвидности",
    description: "Участие в пулах ликвидности на DEX",
    category: "defi",
    tier: 2,
    cost: { knowledge: 650, usdt: 300 },
    effect: { liquidityMiningBoost: 0.2, marketStabilityBoost: 0.1 },
    requiredUpgrades: ["defiBasics"],
    unlockCondition: { resources: { usdt: 600 } },
    specialization: null
  },
  yieldFarming: {
    id: "yieldFarming",
    name: "Yield Farming",
    description: "Максимизация доходности через DeFi-протоколы",
    category: "defi",
    tier: 3,
    cost: { knowledge: 800, usdt: 400 },
    effect: { passiveYieldBoost: 0.25, defiOptimizationBoost: 0.15 },
    requiredUpgrades: ["liquidityProviding"],
    unlockCondition: { resources: { usdt: 800 } },
    specialization: null
  },
  
  cryptoCommunity: {
    id: "cryptoCommunity",
    name: "Крипто-сообщество",
    description: "Основы взаимодействия в криптовалютном сообществе",
    category: "social",
    tier: 1,
    cost: { knowledge: 150, usdt: 50 },
    effect: { reputationGainBoost: 0.15, subscriberGrowthBoost: 0.1 },
    requiredUpgrades: ["basicBlockchain"],
    unlockCondition: { resources: { reputation: 10 } },
    specialization: "influencer"
  },
  contentCreation: {
    id: "contentCreation",
    name: "Создание контента",
    description: "Методы создания качественного контента о криптовалютах",
    category: "social",
    tier: 2,
    cost: { knowledge: 300, usdt: 100 },
    effect: { subscriberGrowthBoost: 0.2, contentQualityBoost: 0.15 },
    requiredUpgrades: ["cryptoCommunity"],
    unlockCondition: { resources: { subscribers: 20 } },
    specialization: "influencer"
  },
  marketInfluence: {
    id: "marketInfluence",
    name: "Влияние на рынок",
    description: "Способы воздействия на настроения рынка",
    category: "social",
    tier: 3,
    cost: { knowledge: 600, usdt: 200, subscribers: 50 },
    effect: { marketSentimentBoost: 0.25, reputationLeverageBoost: 0.2 },
    requiredUpgrades: ["contentCreation"],
    unlockCondition: { resources: { subscribers: 100 } },
    specialization: "influencer"
  }
};
