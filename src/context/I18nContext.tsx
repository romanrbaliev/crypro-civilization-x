
import React, { createContext, useContext } from 'react';
import { 
  SupportedLocale, 
  TranslationValue,
  localeNames
} from '@/i18n';
import useI18n from '@/hooks/useI18n';

// Тип контекста для i18n
interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, params?: Record<string, string>) => TranslationValue;
  localeNames: Record<SupportedLocale, string>;
}

// Создаем контекст с начальными значениями
const I18nContext = createContext<I18nContextType>({
  locale: 'ru',
  setLocale: () => {},
  t: (key) => key,
  localeNames
});

// Компонент-провайдер для i18n
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const i18n = useI18n();
  
  return (
    <I18nContext.Provider value={i18n}>
      {children}
    </I18nContext.Provider>
  );
};

// Хук для использования i18n в функциональных компонентах
export const useI18nContext = () => {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  
  return context;
};
