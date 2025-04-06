
/**
 * Централизованное хранилище всех элементов игры с их ID и названиями на разных языках
 */

export const RESOURCES = {
  KNOWLEDGE: {
    id: 'knowledge',
    names: {
      ru: 'Знания',
      en: 'Knowledge'
    }
  },
  USDT: {
    id: 'usdt',
    names: {
      ru: 'USDT',
      en: 'USDT'
    }
  },
  ELECTRICITY: {
    id: 'electricity',
    names: {
      ru: 'Электричество',
      en: 'Electricity'
    }
  },
  COMPUTING_POWER: {
    id: 'computingPower',
    names: {
      ru: 'Вычислительная мощность',
      en: 'Computing power'
    }
  },
  BITCOIN: {
    id: 'bitcoin',
    names: {
      ru: 'Bitcoin',
      en: 'Bitcoin'
    }
  }
};

export const BUILDINGS = {
  PRACTICE: {
    id: 'practice',
    names: {
      ru: 'Практика',
      en: 'Practice'
    }
  },
  GENERATOR: {
    id: 'generator',
    names: {
      ru: 'Генератор',
      en: 'Generator'
    }
  },
  HOME_COMPUTER: {
    id: 'homeComputer',
    names: {
      ru: 'Домашний компьютер',
      en: 'Home computer'
    }
  },
  CRYPTO_WALLET: {
    id: 'cryptoWallet',
    names: {
      ru: 'Криптокошелек',
      en: 'Crypto wallet'
    }
  },
  INTERNET_CHANNEL: {
    id: 'internetChannel',
    names: {
      ru: 'Интернет-канал',
      en: 'Internet channel'
    }
  },
  MINER: {
    id: 'miner',
    names: {
      ru: 'Майнер',
      en: 'Miner'
    }
  },
  CRYPTO_LIBRARY: {
    id: 'cryptoLibrary',
    names: {
      ru: 'Криптобиблиотека',
      en: 'Crypto library'
    }
  },
  COOLING_SYSTEM: {
    id: 'coolingSystem',
    names: {
      ru: 'Система охлаждения',
      en: 'Cooling system'
    }
  },
  IMPROVED_WALLET: {
    id: 'improvedWallet',
    names: {
      ru: 'Улучшенный кошелек',
      en: 'Improved wallet'
    }
  }
};

export const UPGRADES = {
  BLOCKCHAIN_BASICS: {
    id: 'blockchainBasics',
    names: {
      ru: 'Основы блокчейна',
      en: 'Blockchain basics'
    }
  },
  WALLET_SECURITY: {
    id: 'walletSecurity',
    names: {
      ru: 'Безопасность криптокошельков',
      en: 'Wallet security'
    }
  },
  CRYPTO_BASICS: {
    id: 'cryptoBasics',
    names: {
      ru: 'Основы криптовалют',
      en: 'Cryptocurrency basics'
    }
  },
  ALGORITHM_OPTIMIZATION: {
    id: 'algorithmOptimization',
    names: {
      ru: 'Оптимизация алгоритмов',
      en: 'Algorithm optimization'
    }
  },
  PROOF_OF_WORK: {
    id: 'proofOfWork',
    names: {
      ru: 'Proof of Work',
      en: 'Proof of Work'
    }
  },
  ENERGY_EFFICIENT_COMPONENTS: {
    id: 'energyEfficientComponents',
    names: {
      ru: 'Энергоэффективные компоненты',
      en: 'Energy-efficient components'
    }
  },
  CRYPTO_TRADING: {
    id: 'cryptoTrading',
    names: {
      ru: 'Криптовалютный трейдинг',
      en: 'Cryptocurrency trading'
    }
  },
  TRADING_BOT: {
    id: 'tradingBot',
    names: {
      ru: 'Торговый бот',
      en: 'Trading bot'
    }
  }
};

export const TABS = {
  EQUIPMENT: {
    id: 'equipment',
    names: {
      ru: 'Оборудование',
      en: 'Equipment'
    }
  },
  RESEARCH: {
    id: 'research',
    names: {
      ru: 'Исследования',
      en: 'Research'
    }
  },
  SPECIALIZATION: {
    id: 'specialization',
    names: {
      ru: 'Специализация',
      en: 'Specialization'
    }
  },
  REFERRALS: {
    id: 'referrals',
    names: {
      ru: 'Рефералы',
      en: 'Referrals'
    }
  }
};

/**
 * Получить название ресурса с учетом языка
 */
export const getResourceName = (resourceId: string, language: string = 'ru'): string => {
  // Найти ресурс по ID
  const resource = Object.values(RESOURCES).find(r => r.id === resourceId);
  if (!resource) return resourceId; // Если не найден, вернуть ID
  
  // Вернуть название на нужном языке или на английском, если нет перевода
  return resource.names[language as keyof typeof resource.names] || resource.names.en;
};

/**
 * Получить название здания с учетом языка
 */
export const getBuildingName = (buildingId: string, language: string = 'ru'): string => {
  // Найти здание по ID
  const building = Object.values(BUILDINGS).find(b => b.id === buildingId);
  if (!building) return buildingId; // Если не найдено, вернуть ID
  
  // Вернуть название на нужном языке или на английском, если нет перевода
  return building.names[language as keyof typeof building.names] || building.names.en;
};

/**
 * Получить название исследования с учетом языка
 */
export const getUpgradeName = (upgradeId: string, language: string = 'ru'): string => {
  // Найти исследование по ID
  const upgrade = Object.values(UPGRADES).find(u => u.id === upgradeId);
  if (!upgrade) return upgradeId; // Если не найдено, вернуть ID
  
  // Вернуть название на нужном языке или на английском, если нет перевода
  return upgrade.names[language as keyof typeof upgrade.names] || upgrade.names.en;
};

/**
 * Получить название вкладки с учетом языка
 */
export const getTabName = (tabId: string, language: string = 'ru'): string => {
  // Найти вкладку по ID
  const tab = Object.values(TABS).find(t => t.id === tabId);
  if (!tab) return tabId; // Если не найдена, вернуть ID
  
  // Вернуть название на нужном языке или на английском, если нет перевода
  return tab.names[language as keyof typeof tab.names] || tab.names.en;
};
