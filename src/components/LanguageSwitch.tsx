
import React from 'react';
import { useTranslation } from '@/i18n';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LanguageSwitch: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();

  const handleLanguageChange = (value: string) => {
    setLanguage(value as 'ru' | 'en');
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="language-select">{t('settings.language')}</Label>
      <Select
        value={language}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger id="language-select">
          <SelectValue placeholder={t('settings.language')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ru">{t('settings.russian')}</SelectItem>
          <SelectItem value="en">{t('settings.english')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitch;
