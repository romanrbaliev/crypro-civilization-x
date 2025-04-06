
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/hooks/useGame';
import { useResourceSystem } from '@/hooks/useResourceSystem';
import { useTranslation } from '@/i18n';
import { Book } from 'lucide-react';
import KnowledgeProductionPopup from '@/components/KnowledgeProductionPopup';

const LearnButton: React.FC = () => {
  const { state } = useGame();
  const { incrementResource } = useResourceSystem();
  const { t } = useTranslation();
  const [showPopup, setShowPopup] = useState(false);
  const [lastProduction, setLastProduction] = useState(0);
  
  // Определяем базовое производство знаний
  const baseProduction = 1;
  
  const handleClick = () => {
    console.log('Клик по кнопке "Изучить крипту"');
    
    // Инкрементируем счетчик кликов
    const currentValue = state.counters.knowledgeClicks?.value || 0;
    
    if (state.resources.knowledge?.unlocked) {
      // Добавляем знания
      incrementResource('knowledge', baseProduction);
      setLastProduction(baseProduction);
      setShowPopup(true);
      
      console.log('Добавлено знаний:', baseProduction);
    }
  };
  
  // Заблокирована ли кнопка
  const isDisabled = !state.resources.knowledge?.unlocked;
  
  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center justify-center gap-2 mb-2 h-12 w-full bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 border-green-200"
        disabled={isDisabled}
        onClick={handleClick}
      >
        <Book className="h-5 w-5 text-green-600" />
        <span className="font-medium">{t('buttons.learn')}</span>
      </Button>
      
      {showPopup && (
        <KnowledgeProductionPopup 
          value={lastProduction} 
          onComplete={() => setShowPopup(false)} 
        />
      )}
    </>
  );
};

export default LearnButton;
