
import React from 'react';
import { useI18nContext } from '@/context/I18nContext';
import { Button } from './ui/button';
import { Check, Globe } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { SupportedLocale } from '@/context/I18nContext';

interface LanguageSelectorProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'ghost',
  size = 'sm'
}) => {
  const { locale, setLocale, t, localeNames } = useI18nContext();
  
  const handleLanguageChange = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{t('ui.language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(localeNames).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code as SupportedLocale)}
            className="flex items-center gap-2"
          >
            {locale === code && <Check className="h-4 w-4" />}
            <span className={locale === code ? 'font-medium' : ''}>
              {name}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
