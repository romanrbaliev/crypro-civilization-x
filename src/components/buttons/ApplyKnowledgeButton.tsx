
import React from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { DollarSign } from 'lucide-react';

const ApplyKnowledgeButton: React.FC = () => {
  const { dispatch, state } = useGame();
  
  const handleApplyKnowledge = () => {
    dispatch({ type: 'APPLY_KNOWLEDGE' });
  };
  
  // Проверяем, есть ли достаточно знаний для обмена (минимум 10)
  const hasEnoughKnowledge = state.resources.knowledge?.value >= 10;
  
  return (
    <Button 
      onClick={handleApplyKnowledge} 
      className="w-full"
      disabled={!hasEnoughKnowledge}
      variant={hasEnoughKnowledge ? "default" : "outline"}
    >
      <DollarSign className="mr-2 h-5 w-5" /> Применить знания
    </Button>
  );
};

export default ApplyKnowledgeButton;
