
/**
 * Единый файл для хранения всех элементов игры с их ID и переводами
 * Используется во всей игре для предотвращения дублирования и ошибок
 */

// Ресурсы
export const RESOURCES = {
  KNOWLEDGE: {
    id: 'knowledge',
    nameRu: 'Знания',
    nameEn: 'Knowledge',
    descriptionRu: 'Знания о криптовалютах и блокчейне',
    descriptionEn: 'Knowledge about cryptocurrencies and blockchain'
  },
  USDT: {
    id: 'usdt',
    nameRu: 'USDT',
    nameEn: 'USDT',
    descriptionRu: 'Tether - стейблкойн, привязанный к доллару',
    descriptionEn: 'Tether - a stablecoin pegged to the dollar'
  },
  ELECTRICITY: {
    id: 'electricity',
    nameRu: 'Электричество',
    nameEn: 'Electricity',
    descriptionRu: 'Энергия для питания оборудования',
    descriptionEn: 'Energy to power equipment'
  },
  COMPUTING_POWER: {
    id: 'computingPower',
    nameRu: 'Вычислительная мощность',
    nameEn: 'Computing Power',
    descriptionRu: 'Вычислительная мощность для майнинга',
    descriptionEn: 'Computing power for mining'
  },
  BITCOIN: {
    id: 'bitcoin',
    nameRu: 'Bitcoin',
    nameEn: 'Bitcoin',
    descriptionRu: 'Цифровое золото',
    descriptionEn: 'Digital gold'
  }
};

// Здания
export const BUILDINGS = {
  PRACTICE: {
    id: 'practice',
    nameRu: 'Практика',
    nameEn: 'Practice',
    descriptionRu: 'Автоматическое получение знаний о криптовалютах',
    descriptionEn: 'Automatic acquisition of cryptocurrency knowledge'
  },
  GENERATOR: {
    id: 'generator',
    nameRu: 'Генератор',
    nameEn: 'Generator',
    descriptionRu: 'Производит электричество для питания оборудования',
    descriptionEn: 'Produces electricity to power equipment'
  },
  HOME_COMPUTER: {
    id: 'homeComputer',
    nameRu: 'Домашний компьютер',
    nameEn: 'Home Computer',
    descriptionRu: 'Производит вычислительную мощность, потребляя электричество',
    descriptionEn: 'Produces computing power while consuming electricity'
  },
  CRYPTO_WALLET: {
    id: 'cryptoWallet',
    nameRu: 'Криптокошелек',
    nameEn: 'Crypto Wallet',
    descriptionRu: 'Увеличивает максимальный запас USDT и знаний',
    descriptionEn: 'Increases maximum USDT and knowledge storage'
  },
  INTERNET_CHANNEL: {
    id: 'internetChannel',
    nameRu: 'Интернет-канал',
    nameEn: 'Internet Channel',
    descriptionRu: 'Ускоряет получение знаний и повышает эффективность вычислений',
    descriptionEn: 'Accelerates knowledge acquisition and improves computing efficiency'
  },
  MINER: {
    id: 'miner',
    nameRu: 'Майнер',
    nameEn: 'Miner',
    descriptionRu: 'Автоматически добывает Bitcoin, используя электричество и вычислительную мощность',
    descriptionEn: 'Automatically mines Bitcoin using electricity and computing power'
  },
  ASIC_MINER: {
    id: 'asicMiner',
    nameRu: 'ASIC-майнер',
    nameEn: 'ASIC Miner',
    descriptionRu: 'Специализированное устройство для эффективного майнинга',
    descriptionEn: 'Specialized device for efficient mining'
  },
  COOLING_SYSTEM: {
    id: 'coolingSystem',
    nameRu: 'Система охлаждения',
    nameEn: 'Cooling System',
    descriptionRu: 'Снижает потребление вычислительной мощности всеми устройствами на 20%',
    descriptionEn: 'Reduces computing power consumption by all devices by 20%'
  },
  CRYPTO_LIBRARY: {
    id: 'cryptoLibrary',
    nameRu: 'Криптобиблиотека',
    nameEn: 'Crypto Library',
    descriptionRu: 'Ускоряет получение знаний на 50% и увеличивает их максимальный запас',
    descriptionEn: 'Accelerates knowledge acquisition by 50% and increases maximum storage'
  },
  ENHANCED_WALLET: {
    id: 'enhancedWallet',
    nameRu: 'Улучшенный кошелек',
    nameEn: 'Enhanced Wallet',
    descriptionRu: 'Значительно увеличивает хранилище USDT и BTC, а также эффективность конвертации',
    descriptionEn: 'Significantly increases USDT and BTC storage, as well as conversion efficiency'
  }
};

// Исследования
export const UPGRADES = {
  BLOCKCHAIN_BASICS: {
    id: 'blockchainBasics',
    nameRu: 'Основы блокчейна',
    nameEn: 'Blockchain Basics',
    descriptionRu: 'Увеличивает максимальное количество знаний на 50% и скорость их получения на 10%',
    descriptionEn: 'Increases maximum knowledge by 50% and acquisition speed by 10%'
  },
  WALLET_SECURITY: {
    id: 'walletSecurity',
    nameRu: 'Безопасность криптокошельков',
    nameEn: 'Wallet Security',
    descriptionRu: 'Увеличивает максимальное хранилище USDT на 25%',
    descriptionEn: 'Increases maximum USDT storage by 25%'
  },
  CRYPTO_BASICS: {
    id: 'cryptoBasics',
    nameRu: 'Основы криптовалют',
    nameEn: 'Cryptocurrency Basics',
    descriptionRu: 'Повышает эффективность применения знаний на 10%',
    descriptionEn: 'Increases knowledge application efficiency by 10%'
  },
  ALGORITHM_OPTIMIZATION: {
    id: 'algorithmOptimization',
    nameRu: 'Оптимизация алгоритмов',
    nameEn: 'Algorithm Optimization',
    descriptionRu: 'Увеличивает эффективность майнинга на 15%',
    descriptionEn: 'Increases mining efficiency by 15%'
  },
  PROOF_OF_WORK: {
    id: 'proofOfWork',
    nameRu: 'Proof of Work',
    nameEn: 'Proof of Work',
    descriptionRu: 'Повышает эффективность майнинга на 25%',
    descriptionEn: 'Increases mining efficiency by 25%'
  },
  ENERGY_EFFICIENT_COMPONENTS: {
    id: 'energyEfficientComponents',
    nameRu: 'Энергоэффективные компоненты',
    nameEn: 'Energy Efficient Components',
    descriptionRu: 'Снижает потребление электричества всеми устройствами на 10%',
    descriptionEn: 'Reduces electricity consumption by all devices by 10%'
  },
  CRYPTO_TRADING: {
    id: 'cryptoTrading',
    nameRu: 'Криптовалютный трейдинг',
    nameEn: 'Cryptocurrency Trading',
    descriptionRu: 'Открывает возможность обмена между криптовалютами',
    descriptionEn: 'Enables cryptocurrency trading'
  },
  TRADING_BOT: {
    id: 'tradingBot',
    nameRu: 'Торговый бот',
    nameEn: 'Trading Bot',
    descriptionRu: 'Автоматический обмен BTC по заданным условиям',
    descriptionEn: 'Automatic BTC exchange based on set conditions'
  }
};

// Действия
export const ACTIONS = {
  LEARN: {
    id: 'learn',
    nameRu: 'Изучить крипту',
    nameEn: 'Learn Crypto',
    descriptionRu: 'Получить +1 знание',
    descriptionEn: 'Gain +1 knowledge'
  },
  APPLY_KNOWLEDGE: {
    id: 'applyKnowledge',
    nameRu: 'Применить знания',
    nameEn: 'Apply Knowledge',
    descriptionRu: 'Обменять знания на USDT',
    descriptionEn: 'Exchange knowledge for USDT'
  },
  EXCHANGE_BTC: {
    id: 'exchangeBTC',
    nameRu: 'Обменять BTC',
    nameEn: 'Exchange BTC',
    descriptionRu: 'Обменять Bitcoin на USDT',
    descriptionEn: 'Exchange Bitcoin for USDT'
  }
};

// Вкладки
export const TABS = {
  RESOURCES: {
    id: 'resources',
    nameRu: 'Ресурсы',
    nameEn: 'Resources'
  },
  EQUIPMENT: {
    id: 'equipment',
    nameRu: 'Оборудование',
    nameEn: 'Equipment'
  },
  RESEARCH: {
    id: 'research',
    nameRu: 'Исследования',
    nameEn: 'Research'
  },
  SPECIALIZATION: {
    id: 'specialization',
    nameRu: 'Специализации',
    nameEn: 'Specialization'
  },
  REFERRALS: {
    id: 'referrals',
    nameRu: 'Рефералы',
    nameEn: 'Referrals'
  }
};

// Вспомогательная функция для получения имени ресурса с учетом языка
export const getResourceName = (resourceId: string, language: string = 'ru'): string => {
  const resourceKeys = Object.keys(RESOURCES);
  for (const key of resourceKeys) {
    if (RESOURCES[key as keyof typeof RESOURCES].id === resourceId) {
      return language === 'ru' 
        ? RESOURCES[key as keyof typeof RESOURCES].nameRu 
        : RESOURCES[key as keyof typeof RESOURCES].nameEn;
    }
  }
  return resourceId; // Если не найден, возвращаем ID
};

// Вспомогательная функция для получения имени здания с учетом языка
export const getBuildingName = (buildingId: string, language: string = 'ru'): string => {
  const buildingKeys = Object.keys(BUILDINGS);
  for (const key of buildingKeys) {
    if (BUILDINGS[key as keyof typeof BUILDINGS].id === buildingId) {
      return language === 'ru' 
        ? BUILDINGS[key as keyof typeof BUILDINGS].nameRu 
        : BUILDINGS[key as keyof typeof BUILDINGS].nameEn;
    }
  }
  return buildingId; // Если не найден, возвращаем ID
};

// Вспомогательная функция для получения имени исследования с учетом языка
export const getUpgradeName = (upgradeId: string, language: string = 'ru'): string => {
  const upgradeKeys = Object.keys(UPGRADES);
  for (const key of upgradeKeys) {
    if (UPGRADES[key as keyof typeof UPGRADES].id === upgradeId) {
      return language === 'ru' 
        ? UPGRADES[key as keyof typeof UPGRADES].nameRu 
        : UPGRADES[key as keyof typeof UPGRADES].nameEn;
    }
  }
  return upgradeId; // Если не найден, возвращаем ID
};
