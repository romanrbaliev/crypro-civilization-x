
import React from 'react';
import { Button } from '@/components/ui/button';
import { useResourceSystem } from '@/hooks/useResourceSystem';
import { useTranslation } from '@/i18n';
import { Brain } from 'lucide-react';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { useGame } from '@/context/hooks/useGame';

const LearnButton: React.FC = () => {
  const { t } = useTranslation();
  const { incrementResource } = useResourceSystem();
  const { state, dispatch } = useGame();
  
  const handleLearnClick = () => {
    // Увеличиваем знания на 1
    incrementResource('knowledge', 1);
    
    // Увеличиваем счетчик нажатий на кнопку "Изучить"
    dispatch({
      type: 'INCREMENT_COUNTER',
      payload: { counterId: 'learnClicks', amount: 1 }
    });
    
    // Отправляем событие о получении знаний
    safeDispatchGameEvent('Изучение: +1 знание', 'success');
    
    // Также установим базовое производство для знаний,
    // если оно ещё не установлено и нет практик (во избежание дублирования)
    const knowledge = state.resources.knowledge;
    const practiceCount = state.buildings.practice?.count || 0;
    
    if ((!knowledge.baseProduction || knowledge.baseProduction <= 0) && practiceCount === 0) {
      // Установим базовое производство в 0.1 знаний/сек после первых нескольких нажатий
      const learnClicks = state.counters.learnClicks?.value || 0;
      
      if (learnClicks >= 5 && learnClicks <= 10) {
        console.log("LearnButton: Устанавливаем базовое производство знаний 0.1/сек после 5 нажатий");
        
        // Обновляем ресурс знания, устанавливая базовое производство
        const updatedKnowledge = {
          ...knowledge,
          baseProduction: 0.1,
          production: (knowledge.production || 0) + 0.1,
          perSecond: (knowledge.perSecond || 0) + 0.1,
        };
        
        // Обновляем ресурсы
        dispatch({
          type: 'FORCE_RESOURCE_UPDATE',
          payload: {
            ...state,
            resources: {
              ...state.resources,
              knowledge: updatedKnowledge
            }
          }
        });
        
        safeDispatchGameEvent('Вы получили базовое производство знаний: +0.1/сек', 'info');
      }
    }
  };
  
  return (
    <Button
      variant="default"
      size="lg"
      onClick={handleLearnClick}
      className="w-full bg-indigo-600 hover:bg-indigo-700 mb-2"
    >
      <Brain className="mr-2 h-5 w-5" />
      {t('actions.learn')}
    </Button>
  );
};

export default LearnButton;
