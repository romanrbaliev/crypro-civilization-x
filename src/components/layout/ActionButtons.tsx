
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
        className="w-full justify-center py-4 text-sm" 
        onClick={handleGetKnowledge}
      >
        Изучить крипту
      </Button>
      
      {/* Применить знания - появляется после разблокировки */}
      {state.counters.knowledgeClicks && state.counters.knowledgeClicks.value >= 3 && (
        <Button 
          variant="default" 
          className="w-full justify-center py-4 text-sm bg-blue-900 hover:bg-blue-800" 
          onClick={handleApplyKnowledge}
        >
          Применить знания
        </Button>
      )}
      
      {/* Обменять BTC - появляется после разблокировки майнера */}
      {state.buildingUnlocked.miner && (
        <Button 
          variant="default" 
          className="w-full justify-center py-4 text-sm bg-orange-500 hover:bg-orange-600" 
          onClick={handleExchangeBtc}
        >
          Обменять Bitcoin
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
