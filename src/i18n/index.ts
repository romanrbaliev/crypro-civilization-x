
import { en } from './locales/en';
import { ru } from './locales/ru';

// Поддерживаемые языки
export type SupportedLocale = 'en' | 'ru';

// Все доступные локали
export const locales: Record<SupportedLocale, any> = {
  en,
  ru
};

// Отображаемые названия языков
export const localeNames: Record<SupportedLocale, string> = {
  en: 'English',
  ru: 'Русский'
};

// Тип возвращаемого значения t() функции
export type TranslationValue = string;

// Вспомогательный тип для значений в переводах
export type TranslationRawValue = string | string[] | Record<string, any>;

// Названия всех разделов перевода для автодополнения
export type TranslationSection = 
  | 'ui'
  | 'tabs'
  | 'tutorial'
  | 'actions'
  | 'research'
  | 'resources'
  | 'buildings'
  | 'upgrades'
  | 'events';

// Функция для получения переведенного текста по ключу с поддержкой вложенных ключей
export function getTranslation(
  locale: SupportedLocale,
  key: string, 
  params?: Record<string, string>
): TranslationValue {
  // Разбиваем ключ на части для доступа к вложенным объектам (например, 'ui.settings')
  const parts = key.split('.');
  
  // Начинаем с корня локали
  let result: any = locales[locale];
  
  // Проходим по частям ключа
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    // Если часть не существует, возвращаем ключ
    if (!result || !result[part]) {
      console.warn(`Translation missing for key: ${key} in locale: ${locale}`);
      return key;
    }
    
    // Переходим к следующей части
    result = result[part];
  }
  
  // Если результат - строка и есть параметры, заменяем плейсхолдеры
  if (typeof result === 'string' && params) {
    return Object.entries(params).reduce(
      (str, [paramKey, paramValue]) => str.replace(`{${paramKey}}`, paramValue),
      result
    );
  }
  
  // Принудительно приводим результат к строке, если это не строка
  if (typeof result !== 'string') {
    console.warn(`Translation for key ${key} is not a string. Converting to string.`);
    
    if (Array.isArray(result)) {
      return result.join(', ');
    } else if (result && typeof result === 'object') {
      return JSON.stringify(result);
    }
    
    return String(result);
  }
  
  return result;
}

// Все идентификаторы ресурсов, зданий и исследований
export const gameIds = {
  // Ресурсы
  resources: {
    knowledge: 'knowledge',
    usdt: 'usdt',
    electricity: 'electricity',
    bitcoin: 'bitcoin',
    computingPower: 'computingPower',
    reputation: 'reputation',
  },
  
  // Здания
  buildings: {
    practice: 'practice',
    generator: 'generator',
    homeComputer: 'homeComputer',
    cryptoWallet: 'cryptoWallet',
    internetChannel: 'internetChannel',
    miner: 'miner',
    coolingSystem: 'coolingSystem',
    enhancedWallet: 'enhancedWallet',
    cryptoLibrary: 'cryptoLibrary',
  },
  
  // Исследования
  upgrades: {
    blockchainBasics: 'blockchainBasics',
    cryptoWalletSecurity: 'cryptoWalletSecurity',
    cryptoBasics: 'cryptoBasics',
    algorithmOptimization: 'algorithmOptimization',
    proofOfWork: 'proofOfWork',
    energyEfficientComponents: 'energyEfficientComponents',
    cryptoTrading: 'cryptoTrading',
    tradingBot: 'tradingBot',
  },
  
  // Функции
  features: {
    equipment: 'equipment',
    research: 'research',
    specialization: 'specialization',
    referrals: 'referrals',
    exchangeBtc: 'exchangeBtc',
    trading: 'trading',
  },
  
  // Действия
  actions: {
    learnCrypto: 'learnCrypto',
    applyKnowledge: 'applyKnowledge',
    exchangeBtc: 'exchangeBtc',
  },
};

// Отображение устаревших идентификаторов на новые стандартизированные
export const legacyIdMapping: Record<string, string> = {
  // Исследования
  'blockchain_basics': gameIds.upgrades.blockchainBasics,
  'basicBlockchain': gameIds.upgrades.blockchainBasics,
  
  // Добавьте сюда все остальные устаревшие ID, которые были ранее использованы
};

// Функция для преобразования устаревших ID в новые стандартизированные
export function normalizeId(id: string): string {
  return legacyIdMapping[id] || id;
}
