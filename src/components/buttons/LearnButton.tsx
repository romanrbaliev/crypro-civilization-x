
import React from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/hooks/useGame';
import { useResourceSystem } from '@/hooks/useResourceSystem';
import { useTranslation } from '@/i18n';
import { Book } from 'lucide-react';

const LearnButton: React.FC = () => {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  
  // Определяем базовое производство знаний
  const baseProduction = 1;
  
  const handleClick = () => {
    console.log('==== КЛИК ПО КНОПКЕ "ИЗУЧИТЬ КРИПТУ" ====');
    
    // Инкрементируем счетчик кликов
    dispatch({
      type: 'INCREMENT_COUNTER',
      payload: {
        counterId: 'knowledgeClicks',
        amount: 1
      }
    });
    
    if (state.resources.knowledge?.unlocked) {
      // Логируем текущее значение перед изменением
      const knowledgeBefore = state.resources.knowledge.value || 0;
      console.log(`LearnButton: Текущее значение знаний перед кликом: ${knowledgeBefore}`);
      
      // Добавляем знания напрямую через диспетчер
      dispatch({
        type: 'INCREMENT_RESOURCE',
        payload: {
          resourceId: 'knowledge',
          amount: baseProduction
        }
      });
      
      // Проверяем, увеличилось ли значение знаний
      setTimeout(() => {
        const knowledgeAfter = state.resources.knowledge?.value || 0;
        console.log(`LearnButton: Значение знаний после клика: ${knowledgeAfter} (изменение: ${knowledgeAfter - knowledgeBefore})`);
      }, 50);
      
      // Открываем монитор производства знаний через событие
      window.dispatchEvent(new CustomEvent('open-knowledge-monitor'));
      
      console.log(`LearnButton: Отправлена команда INCREMENT_RESOURCE, знания +${baseProduction}`);
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
