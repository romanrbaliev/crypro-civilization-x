
import React from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/helpers';
import { BookOpen } from 'lucide-react';

const ApplyKnowledgeButton: React.FC = () => {
  const { state, dispatch } = useGame();
  
  const knowledgeAmount = state.resources.knowledge?.value || 0;
  const minKnowledge = 10; // Минимальное количество знаний для обмена
  
  const handleApplyKnowledge = () => {
    dispatch({ type: 'APPLY_KNOWLEDGE' });
  };
  
  // Рассчитываем, сколько USDT получим
  const calculatedUsdt = Math.floor(knowledgeAmount / 10);
  
  return (
    <Button 
      onClick={handleApplyKnowledge}
      className="w-full py-6 text-lg"
      disabled={knowledgeAmount < minKnowledge}
    >
      <BookOpen className="mr-2 h-5 w-5" /> 
      Применить знания
      {knowledgeAmount >= minKnowledge && 
        <span className="ml-2 text-sm">
          ({formatNumber(Math.floor(knowledgeAmount / 10) * 10, 0)} → {formatNumber(calculatedUsdt, 2)} USDT)
        </span>
      }
    </Button>
  );
};

export default ApplyKnowledgeButton;
