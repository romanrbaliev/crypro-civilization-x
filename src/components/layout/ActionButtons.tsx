
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Brain, DollarSign, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const ActionButtons: React.FC = () => {
  const { state, dispatch } = useGame();
  
  // Функция получения знаний
  const handleGetKnowledge = () => {
    dispatch({
      type: 'INCREMENT_RESOURCE',
      payload: { resourceId: 'knowledge', amount: 1 }
    });
    
    // Обновляем счетчик нажатий на кнопку знаний
    dispatch({
      type: 'INCREMENT_COUNTER',
      payload: { counterId: 'knowledgeClicks', amount: 1 }
    });
  };
  
  // Функция применения знаний
  const handleApplyKnowledge = () => {
    // Проверяем, что у нас достаточно знаний для обмена (минимум 10)
    if (state.resources.knowledge?.value < 10) {
      toast({
        title: "Недостаточно знаний",
        description: "Для обмена нужно минимум 10 знаний",
        variant: "destructive",
      });
      return;
    }
    
    dispatch({ type: 'APPLY_KNOWLEDGE' });
    
    // Определяем кол-во знаний для обмена (кратно 10)
    const exchangeAmount = Math.floor(state.resources.knowledge.value / 10) * 10;
    const usdtGained = exchangeAmount / 10;
    
    toast({
      title: "Знания применены",
      description: `Вы обменяли ${exchangeAmount} знаний на ${usdtGained} USDT`,
      variant: "default",
    });
  };

  // Функция обмена BTC
  const handleExchangeBtc = () => {
    if (state.resources.bitcoin?.value <= 0) {
      toast({
        title: "Недостаточно Bitcoin",
        description: "У вас нет Bitcoin для обмена",
        variant: "destructive",
      });
      return;
    }
    
    dispatch({ type: 'EXCHANGE_BTC' });
    
    toast({
      title: "Bitcoin обменян",
      description: "Вы успешно обменяли Bitcoin на USDT",
      variant: "default",
    });
  };
  
  // Проверка, достаточно ли знаний для обмена
  const canApplyKnowledge = state.resources.knowledge?.value >= 10;
  
  return (
    <div className="space-y-3 max-w-md mx-auto">
      {/* Базовые действия снизу вверх */}
      
      {/* Изучить крипту - всегда доступна */}
      <Button 
        variant="outline"
        className="w-full justify-center py-6 text-base"
        onClick={handleGetKnowledge}
      >
        Изучить крипту
      </Button>
      
      {/* Применить знания - появляется после разблокировки */}
      {state.counters.knowledgeClicks && state.counters.knowledgeClicks.value >= 3 && (
        <Button 
          variant="default"
          className="w-full justify-center py-6 text-base bg-gray-900 hover:bg-gray-800"
          disabled={!canApplyKnowledge}
          onClick={handleApplyKnowledge}
        >
          Применить знания
        </Button>
      )}
      
      {/* Обменять BTC - появляется после разблокировки майнера */}
      {state.buildingUnlocked?.miner && (
        <Button 
          variant="default"
          className="w-full justify-center py-6 text-base bg-orange-500 hover:bg-orange-600"
          disabled={state.resources.bitcoin?.value <= 0}
          onClick={handleExchangeBtc}
        >
          Обменять Bitcoin
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
