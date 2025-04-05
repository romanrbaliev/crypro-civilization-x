
/**
 * Russian language translations
 */
export const ru = {
  // User interface elements
  ui: {
    settings: "Настройки",
    language: "Язык",
    russian: "Русский",
    english: "Английский",
    resetProgress: "Сбросить прогресс",
    resetConfirmation: "Вы уверены, что хотите сбросить весь прогресс?",
    cancel: "Отмена",
    confirm: "Подтвердить",
    howToPlay: "Как играть",
    guide: "Руководство",
    version: "Версия",
    resetSuccess: "Сброс выполнен",
    resetSuccessDetail: "Все сохранения успешно удалены. Страница будет перезагружена.",
    resetError: "Ошибка сброса",
    resetErrorDetail: "Не удалось удалить сохранения игры.",
  },
  
  // Game tabs
  tabs: {
    equipment: "Оборудование",
    research: "Исследования",
    specialization: "Специализация",
    referrals: "Рефералы",
    trading: "Трейдинг",
  },
  
  // Tutorial sections
  tutorial: {
    basics: "Основы",
    resources: "Ресурсы",
    buildings: "Оборудование",
    title: "Как играть в Crypto Civilization",
    description: "Руководство по основным механикам игры",
    startGame: "Начало игры",
    startGameSteps: "1. Начните с изучения основ криптовалют, нажимая на кнопку \"Изучить крипту\".\n2. Накопив достаточно знаний, вы сможете применить их для получения USDT.\n3. Используйте USDT для приобретения оборудования, которое будет автоматически генерировать ресурсы.\n4. Постепенно открывайте новые механики и возможности по мере развития.",
    resourcesTitle: "Основные ресурсы",
    resourcesList: {
      knowledge: "Знания о крипте - базовый ресурс для исследований и обмена на USDT.",
      usdt: "USDT - основная валюта для покупки оборудования и улучшений.",
      electricity: "Электричество - необходимо для работы компьютеров и майнинг-ферм.",
      computingPower: "Вычислительная мощность - используется для майнинга и анализа данных.",
      reputation: "Репутация - влияет на эффективность социальных взаимодействий."
    },
    equipmentTitle: "Типы оборудования",
    equipmentList: {
      practice: "Практика - автоматически генерирует знания о криптовалютах.",
      generator: "Генератор - производит электричество для ваших устройств.",
      homeComputer: "Домашний компьютер - обеспечивает вычислительную мощность.",
      cryptoWallet: "Криптокошелек - увеличивает максимальное хранение USDT.",
      internetChannel: "Интернет-канал - ускоряет получение знаний."
    }
  },
  
  // Button actions
  actions: {
    learnCrypto: "Изучить крипту",
    applyKnowledge: "Применить знания",
    exchangeBTC: "Обменять BTC",
    checkUnlocks: "Проверить разблокировки",
  },
  
  // Research items
  research: {
    availableResearch: "Доступные исследования",
    completedResearch: "Завершенные исследования",
    researchUnavailable: "Исследования пока недоступны.",
    researchUnavailableDetail: "Продолжайте развиваться для открытия новых технологий.",
    noAvailableResearch: "Нет доступных исследований.",
    noAvailableResearchDetail: "Продолжайте развиваться для открытия новых технологий.",
  },
  
  // Resources names
  resources: {
    knowledge: "Знания о крипте",
    usdt: "USDT",
    electricity: "Электричество",
    bitcoin: "Bitcoin",
    computingPower: "Вычислительная мощность",
    reputation: "Репутация",
  },
  
  // Buildings / Equipment
  buildings: {
    practice: {
      name: "Практика",
      description: "Систематическое изучение основ криптовалют",
      effects: [
        "Производит +1 знаний/сек"
      ]
    },
    generator: {
      name: "Генератор",
      description: "Обеспечивает электричеством ваше оборудование",
      effects: [
        "Производит +0.5 электричества/сек"
      ]
    },
    homeComputer: {
      name: "Домашний компьютер",
      description: "Базовое оборудование для операций с криптовалютой",
      effects: [
        "Производит +2 вычисл. мощности/сек",
        "Потребляет 1 электричества/сек"
      ]
    },
    cryptoWallet: {
      name: "Криптокошелек",
      description: "Безопасное хранилище для вашей криптовалюты",
      effects: [
        "+50 к макс. USDT",
        "+25% к макс. знаниям"
      ]
    },
    internetChannel: {
      name: "Интернет-канал",
      description: "Более быстрое соединение для лучших операций",
      effects: [
        "+20% к скорости получения знаний",
        "+5% к производству вычисл. мощности"
      ]
    },
    miner: {
      name: "Майнер",
      description: "Специализированное оборудование для майнинга Bitcoin",
      effects: [
        "Производит +0.00005 BTC/сек",
        "Потребляет 1 электричества/сек",
        "Потребляет 5 вычисл. мощности/сек"
      ]
    },
    coolingSystem: {
      name: "Система охлаждения",
      description: "Улучшает эффективность вычислительного оборудования",
      effects: [
        "-20% к потреблению вычисл. мощности"
      ]
    },
    enhancedWallet: {
      name: "Улучшенный кошелек",
      description: "Продвинутое хранилище с улучшенной безопасностью",
      effects: [
        "+150 к макс. USDT",
        "+1 к макс. BTC",
        "+8% к конвертации BTC на USDT"
      ]
    },
    cryptoLibrary: {
      name: "Криптобиблиотека",
      description: "Обширная коллекция знаний о криптовалютах",
      effects: [
        "+50% к скорости получения знаний",
        "+100 к макс. знаниям"
      ]
    }
  },
  
  // Upgrades / Research
  upgrades: {
    blockchainBasics: {
      name: "Основы блокчейна",
      description: "Введение в основы технологии блокчейн",
      effects: [
        "+50% к макс. хранению знаний",
        "+10% к скорости производства знаний"
      ]
    },
    cryptoWalletSecurity: {
      name: "Безопасность криптокошельков",
      description: "Продвинутые меры безопасности для хранения криптовалюты",
      effects: [
        "+25% к макс. USDT"
      ]
    },
    cryptoBasics: {
      name: "Основы криптовалют",
      description: "Фундаментальное понимание экономики криптовалют",
      effects: [
        "+10% к эффективности применения знаний"
      ]
    },
    algorithmOptimization: {
      name: "Оптимизация алгоритмов",
      description: "Повышение эффективности майнинга через оптимизацию алгоритмов",
      effects: [
        "+15% к эффективности майнинга"
      ]
    },
    proofOfWork: {
      name: "Proof of Work",
      description: "Понимание фундаментального механизма консенсуса",
      effects: [
        "+25% к эффективности майнинга"
      ]
    },
    energyEfficientComponents: {
      name: "Энергоэффективные компоненты",
      description: "Сниженное потребление энергии для всех устройств",
      effects: [
        "-10% к потреблению электричества всеми устройствами"
      ]
    },
    cryptoTrading: {
      name: "Криптовалютный трейдинг",
      description: "Продвинутые техники обмена криптовалют",
      effects: [
        "Открывает раздел Трейдинг"
      ]
    },
    tradingBot: {
      name: "Торговый бот",
      description: "Автоматизированная торговля на основе заданных условий",
      effects: [
        "Автоматический обмен BTC по заданным условиям"
      ]
    }
  },
  
  // Game events
  events: {
    knowledgeApplied: "Все знания применены! Получено USDT",
    btcExchanged: "BTC обменяны на USDT по текущему курсу",
    gameReset: "Игра полностью сброшена",
    purchaseSuccess: "{item} успешно приобретен!",
    researchComplete: "Исследование '{name}' завершено!",
    unlockNotification: "Разблокирована новая функция: {feature}",
  }
};
