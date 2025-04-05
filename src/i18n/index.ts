
import { useCallback } from 'react';

export type SupportedLocale = 'ru' | 'en';

export type TranslationValue = string | number | null | undefined;

export const localeNames: Record<SupportedLocale, string> = {
  ru: 'Русский',
  en: 'English'
};

const translations: Record<SupportedLocale, Record<string, string>> = {
  ru: {
    // Базовые переводы
    'game.title': 'Crypto Civilization',
    'game.loading': 'Загрузка...',
    'game.error': 'Ошибка',
    'game.retry': 'Повторить',
    
    // Ресурсы
    'resource.knowledge': 'Знания',
    'resource.usdt': 'USDT',
    'resource.electricity': 'Электричество',
    'resource.computingPower': 'Вычислительная мощность',
    'resource.bitcoin': 'Bitcoin',
    
    // Действия
    'action.learn': 'Изучить',
    'action.apply': 'Применить знания',
    'action.buy': 'Купить',
    'action.sell': 'Продать',
    'action.research': 'Исследовать',
    'action.mine': 'Майнить',
    'action.exchange': 'Обменять',
    
    // Здания
    'building.practice': 'Практика',
    'building.generator': 'Генератор',
    'building.homeComputer': 'Домашний компьютер',
    'building.cryptoWallet': 'Криптокошелек',
    'building.internetChannel': 'Интернет-канал',
    'building.miner': 'Майнер',
    'building.cryptoLibrary': 'Криптобиблиотека',
    'building.coolingSystem': 'Система охлаждения',
    'building.improvedWallet': 'Улучшенный кошелек',
    'building.enhancedWallet': 'Улучшенный кошелек',
    
    // Вкладки
    'tab.resources': 'Ресурсы',
    'tab.buildings': 'Здания',
    'tab.research': 'Исследования',
    'tab.specialization': 'Специализация',
    'tab.referrals': 'Рефералы',
    'tab.settings': 'Настройки'
  },
  en: {
    // Base translations
    'game.title': 'Crypto Civilization',
    'game.loading': 'Loading...',
    'game.error': 'Error',
    'game.retry': 'Retry',
    
    // Resources
    'resource.knowledge': 'Knowledge',
    'resource.usdt': 'USDT',
    'resource.electricity': 'Electricity',
    'resource.computingPower': 'Computing Power',
    'resource.bitcoin': 'Bitcoin',
    
    // Actions
    'action.learn': 'Learn',
    'action.apply': 'Apply Knowledge',
    'action.buy': 'Buy',
    'action.sell': 'Sell',
    'action.research': 'Research',
    'action.mine': 'Mine',
    'action.exchange': 'Exchange',
    
    // Buildings
    'building.practice': 'Practice',
    'building.generator': 'Generator',
    'building.homeComputer': 'Home Computer',
    'building.cryptoWallet': 'Crypto Wallet',
    'building.internetChannel': 'Internet Channel',
    'building.miner': 'Miner',
    'building.cryptoLibrary': 'Crypto Library',
    'building.coolingSystem': 'Cooling System',
    'building.improvedWallet': 'Improved Wallet',
    'building.enhancedWallet': 'Enhanced Wallet',
    
    // Tabs
    'tab.resources': 'Resources',
    'tab.buildings': 'Buildings',
    'tab.research': 'Research',
    'tab.specialization': 'Specialization',
    'tab.referrals': 'Referrals',
    'tab.settings': 'Settings'
  }
};

export function useTranslation(locale: SupportedLocale = 'ru') {
  const getTranslation = useCallback((key: string, values?: Record<string, TranslationValue>): string => {
    let translation = translations[locale][key] || key;
    
    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        translation = translation.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      });
    }
    
    return translation;
  }, [locale]);
  
  return getTranslation;
}
