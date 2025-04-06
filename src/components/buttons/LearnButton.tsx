
import React from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/hooks/useGame';
import { useTranslation } from '@/i18n';

interface LearnButtonProps {
  onAction?: () => void;
}

const LearnButton: React.FC<LearnButtonProps> = ({ onAction }) => {
  const { dispatch } = useGame();
  const { t } = useTranslation();
  
  const handleClick = () => {
    // Используем INCREMENT_RESOURCE для добавления знаний
    dispatch({ 
      type: 'INCREMENT_RESOURCE', 
      payload: { 
        resourceId: 'knowledge', 
        amount: 1 
      } 
    });
    
    // Важно: обязательно увеличиваем счетчик кликов для разблокировки
    dispatch({
      type: 'INCREMENT_COUNTER',
      payload: { 
        counterId: 'knowledgeClicks', 
        value: 1 
      }
    });
    
    if (onAction) {
      onAction();
    }
  };
  
  return (
    <Button
      onClick={handleClick}
      variant="default"
      className="w-full"
    >
      {t('actions.learnCrypto')}
    </Button>
  );
};

export default LearnButton;
