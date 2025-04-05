
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Brain, DollarSign, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    dispatch({ type: 'APPLY_KNOWLEDGE' });
  };

  // Функция обмена BTC
  const handleExchangeBtc = () => {
    dispatch({ type: 'EXCHANGE_BTC' });
  };
  
  return (
    <div className="space-y-2 max-w-md mx-auto">
      {/* Базовые действия снизу вверх */}
      
      {/* Изучить крипту - всегда доступна */}
      <Button 
        variant="default" 
        className="w-full justify-center py-6 text-lg" 
        onClick={handleGetKnowledge}
      >
        <Brain className="mr-2 h-5 w-5" /> Изучить крипту
      </Button>
      
      {/* Применить знания - появляется после разблокировки */}
      {state.counters.knowledgeClicks && state.counters.knowledgeClicks.value >= 3 && (
        <Button 
          variant="default" 
          className="w-full justify-center py-6 text-lg bg-blue-900 hover:bg-blue-800" 
          onClick={handleApplyKnowledge}
        >
          <DollarSign className="mr-2 h-5 w-5" /> Применить знания
        </Button>
      )}
      
      {/* Обменять BTC - появляется после разблокировки майнера */}
      {state.buildingUnlocked.miner && (
        <Button 
          variant="default" 
          className="w-full justify-center py-6 text-lg bg-orange-500 hover:bg-orange-600" 
          onClick={handleExchangeBtc}
          disabled={state.btcBalance <= 0}
        >
          <RefreshCw className="mr-2 h-5 w-5" /> Обменять Bitcoin
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
