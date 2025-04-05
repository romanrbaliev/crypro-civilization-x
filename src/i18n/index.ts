import { useCallback } from 'react';

// Объект с ID для разных категорий
export const gameIds = {
  resources: {
    knowledge: 'knowledge',
    usdt: 'usdt',
    electricity: 'electricity',
    computingPower: 'computingPower',
    bitcoin: 'bitcoin'
  },
  buildings: {
    practice: 'practice',
    generator: 'generator',
    homeComputer: 'homeComputer',
    cryptoWallet: 'cryptoWallet',
    internetChannel: 'internetChannel',
    miner: 'miner',
    cryptoLibrary: 'cryptoLibrary',
    coolingSystem: 'coolingSystem',
    improvedWallet: 'improvedWallet'
  },
  upgrades: {
    blockchainBasics: 'blockchainBasics',
    walletSecurity: 'walletSecurity',
    cryptoBasics: 'cryptoBasics',
    algorithmOptimization: 'algorithmOptimization',
    proofOfWork: 'proofOfWork',
    energyEfficientComponents: 'energyEfficientComponents',
    cryptoTrading: 'cryptoTrading',
    tradingBot: 'tradingBot'
  },
  features: {
    research: 'research',
    trading: 'trading',
    specialization: 'specialization',
    referrals: 'referrals'
  }
};

// Функция для нормализации ID
export const normalizeId = (id: string): string => {
  if (!id) return '';
  
  // Проверяем, есть ли ID в каких-либо категориях
  for (const category in gameIds) {
    const categoryObj = gameIds[category as keyof typeof gameIds];
    
    for (const key in categoryObj) {
      if (key === id || (categoryObj as any)[key] === id) {
        return (categoryObj as any)[key];
      }
    }
  }
  
  // Если ID не найден, возвращаем исходный ID
  return id;
};

// Хук для использования i18n
export const useTranslation = () => {
  // Здесь можно добавить логику выбора языка
  const language = 'ru';
  
  const t = useCallback((key: string, options?: any) => {
    // Здесь будет логика перевода
    return key;
  }, []);
  
  return { t, language };
};
