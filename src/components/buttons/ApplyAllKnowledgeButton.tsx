
import React from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { DollarSign, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ApplyAllKnowledgeButton: React.FC = () => {
  const { dispatch, state } = useGame();
  
  const handleApplyAllKnowledge = () => {
    if (state.resources.knowledge?.value < 10) {
      toast({
        title: "Недостаточно знаний",
        description: "Для обмена нужно минимум 10 знаний",
        variant: "warning",
      });
      return;
    }
    
    dispatch({ type: 'APPLY_ALL_KNOWLEDGE' });
  };
  
  // Проверяем, есть ли достаточно знаний для обмена (минимум 10)
  const hasEnoughKnowledge = state.resources.knowledge?.value >= 10;
  
  // Рассчитываем, сколько USDT можно получить
  const knowledgeAmount = state.resources.knowledge?.value || 0;
  const exchangeableAmount = Math.floor(knowledgeAmount / 10) * 10;
  const usdtToGet = exchangeableAmount / 10;
  
  // Проверяем, разблокирована ли возможность применения всех знаний
  const isUnlocked = state.counters.applyKnowledge?.value >= 3 || 
                    state.unlocks.applyAllKnowledge;
  
  if (!isUnlocked) {
    return null;
  }
  
  return (
    <Button 
      onClick={handleApplyAllKnowledge} 
      className="w-full flex justify-between items-center"
      disabled={!hasEnoughKnowledge}
      variant={hasEnoughKnowledge ? "secondary" : "outline"}
    >
      <span className="flex items-center">
        <Zap className="mr-2 h-5 w-5" /> Применить все знания
      </span>
      {hasEnoughKnowledge && (
        <span className="text-xs bg-secondary-foreground text-secondary px-2 py-1 rounded-full">
          {exchangeableAmount} → {usdtToGet} USDT
        </span>
      )}
    </Button>
  );
};

export default ApplyAllKnowledgeButton;
