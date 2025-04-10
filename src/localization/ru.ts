
// Русская локализация

// Структура локализации
export const ru = {
  // Ресурсы
  resources: {
    knowledge: {
      name: "Знания",
      description: "Базовые знания о криптовалютах и блокчейне"
    },
    usdt: {
      name: "USDT",
      description: "Стейблкоин, привязанный к доллару США"
    },
    bitcoin: {
      name: "Bitcoin",
      description: "Основная криптовалюта, добываемая майнингом"
    },
    electricity: {
      name: "Электричество",
      description: "Используется для питания майнинг-ферм и компьютеров"
    },
    computingPower: {
      name: "Вычислительная мощность",
      description: "Необходима для майнинга и анализа данных"
    },
    reputation: {
      name: "Репутация",
      description: "Влияет на доверие сообщества и возможности сотрудничества"
    },
    hashrate: {
      name: "Хешрейт",
      description: "Скорость решения криптографических задач для майнинга"
    },
    subscribers: {
      name: "Подписчики",
      description: "Ваши последователи в крипто-сообществе"
    }
  },
  
  // Здания
  buildings: {
    practice: {
      name: "Практика",
      description: "Автоматическое получение знаний о криптовалютах",
      effect: "Производит +1 знаний/сек"
    },
    generator: {
      name: "Генератор",
      description: "Источник энергии для майнинга и вычислений",
      effect: "Производит +0.5 электричества/сек"
    },
    homeComputer: {
      name: "Домашний компьютер",
      description: "Используется для создания вычислительной мощности",
      effect: "Производит +2 вычисл. мощности/сек при потреблении 1 электр./сек"
    },
    cryptoWallet: {
      name: "Криптокошелек",
      description: "Хранит ваши криптовалютные активы безопасно",
      effect1: "Макс. USDT +50",
      effect2: "Макс. знаний +25"
    },
    miner: {
      name: "Майнер",
      description: "Добывает Bitcoin с помощью вычислительной мощности",
      effect: "Добывает +0.00005 BTC/сек, потребляя 1 электр. и 5 вычисл. мощности"
    },
    internetChannel: {
      name: "Интернет-канал",
      description: "Улучшает обмен данными и ускоряет получение знаний",
      effect1: "Прирост знаний +20%",
      effect2: "Эффективность вычислений +5%"
    },
    coolingSystem: {
      name: "Система охлаждения", 
      description: "Снижает энергопотребление компьютеров и майнеров",
      effect: "Потребление вычисл. мощности -20%"
    },
    enhancedWallet: {
      name: "Улучшенный кошелек",
      description: "Продвинутое хранилище для криптовалютных активов",
      effect1: "Макс. USDT +150",
      effect2: "Макс. BTC +1",
      effect3: "Эффективность обмена BTC +8%"
    },
    cryptoLibrary: {
      name: "Криптобиблиотека",
      description: "Хранилище знаний о криптовалютах и блокчейне",
      effect1: "Прирост знаний +50%",
      effect2: "Макс. знаний +100"
    }
  },
  
  // Исследования
  upgrades: {
    blockchainBasics: {
      name: "Основы блокчейна",
      description: "+50% к макс. хранению знаний, +10% к скорости производства знаний"
    },
    walletSecurity: {
      name: "Безопасность криптокошельков",
      description: "+25% к макс. USDT"
    },
    cryptoCurrencyBasics: {
      name: "Основы криптовалют",
      description: "+10% к эффективности применения знаний (при обмене 10 знаний дают 1.1 USDT)"
    },
    proofOfWork: {
      name: "Proof of Work",
      description: "+25% к эффективности майнинга"
    },
    algorithmOptimization: {
      name: "Оптимизация алгоритмов",
      description: "+15% к эффективности майнинга (производится на 15% больше BTC при тех же затратах)"
    },
    energyEfficientComponents: {
      name: "Энергоэффективные компоненты",
      description: "-10% к потреблению электричества всеми устройствами"
    },
    cryptoTrading: {
      name: "Криптовалютный трейдинг",
      description: "Открывает возможность обмена между различными криптовалютами"
    },
    tradingBot: {
      name: "Торговый бот",
      description: "Автоматический обмен BTC по заданным условиям"
    },
    cryptoCommunity: {
      name: "Крипто-сообщество",
      description: "Основа для социального взаимодействия в мире криптовалют"
    }
  },
  
  // События
  events: {
    buildingPurchase: "Построено: {0}",
    researchComplete: "Исследование завершено: {0}",
    knowledgeApplied: "Применены знания: {0} знаний обменяно на {1} USDT",
    resourceCapReached: "Достигнут максимум ресурса: {0}",
    newFeatureUnlocked: "Разблокирована новая функция: {0}",
    buildingUnlocked: "Разблокировано новое здание: {0}",
    upgradeUnlocked: "Разблокировано новое исследование: {0}"
  },
  
  // Интерфейс
  ui: {
    tabs: {
      resources: "Ресурсы",
      buildings: "Здания",
      research: "Исследования",
      referrals: "Рефералы"
    },
    actions: {
      learn: "Изучить крипту",
      applyKnowledge: "Применить знания",
      buy: "Купить",
      sell: "Продать",
      research: "Исследовать"
    },
    states: {
      empty: {
        buildings: "У вас пока нет доступного оборудования.\nПродолжайте набирать знания и ресурсы.",
        research: "Исследования пока недоступны.\nПродолжайте развиваться для открытия новых технологий."
      },
      sections: {
        availableResearch: "Доступные исследования",
        completedResearch: "Завершенные исследования",
        cost: "Стоимость:",
        produces: "Производит:",
        consumes: "Потребляет:",
        effects: "Эффекты:"
      }
    },
    eventLog: {
      title: "Журнал событий",
      noEvents: "Пока нет событий",
      eventCount: "{0} {1}"
    }
  },
  
  // Общие тексты
  common: {
    perSecond: "/сек",
    loading: "Загрузка...",
    countForms: {
      events: ["событие", "события", "событий"]
    }
  }
};

export default ru;
