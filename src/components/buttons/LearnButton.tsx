
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
    // Используем LEARN_CRYPTO для изучения, а не INCREMENT_RESOURCE
    dispatch({ type: 'LEARN_CRYPTO' });
    
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
