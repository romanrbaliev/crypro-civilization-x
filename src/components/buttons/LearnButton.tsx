
import React from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/hooks/useGame';
import { useResources } from '@/hooks/useResources';
import { useTranslation } from '@/i18n';
import { Book } from 'lucide-react';

const LearnButton: React.FC = () => {
  const { state, dispatch } = useGame();
  const { incrementResource } = useResources();
  const { t } = useTranslation();
  
  // Базовое производство знаний при клике
  const baseProduction = 1;
  
  const handleClick = () => {
    // Инкрементируем счетчик кликов
    dispatch({
      type: 'INCREMENT_COUNTER',
      payload: {
        counterId: 'knowledgeClicks',
        amount: 1
      }
    });
    
    if (state.resources.knowledge?.unlocked) {
      // Добавляем знания
      incrementResource('knowledge', baseProduction);
    }
  };
  
  // Заблокирована ли кнопка
  const isDisabled = !state.resources.knowledge?.unlocked;
  
  return (
    <Button 
      variant="outline" 
      className="flex items-center justify-center gap-2 mb-2 h-12 w-full bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 border-green-200"
      disabled={isDisabled}
      onClick={handleClick}
    >
      <Book className="h-5 w-5 text-green-600" />
      <span className="font-medium">{t('buttons.learn')}</span>
    </Button>
  );
};

export default LearnButton;
