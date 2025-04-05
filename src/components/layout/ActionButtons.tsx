
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
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

  // Функция применения всех знаний
  const handleApplyAllKnowledge = () => {
    dispatch({ type: 'APPLY_ALL_KNOWLEDGE' });
  };

  // Функция обмена BTC
  const handleExchangeBtc = () => {
    dispatch({ type: 'EXCHANGE_BTC' });
  };
  
  // Функция для заполнения USDT (служебная)
  const handleFullUsdt = () => {
    if (state.resources.usdt) {
      dispatch({
        type: 'INCREMENT_RESOURCE',
        payload: { resourceId: 'usdt', amount: state.resources.usdt.max - state.resources.usdt.value }
      });
    }
  };
  
  // Проверка, достаточно ли знаний для обмена
  const canApplyKnowledge = state.resources.knowledge?.value >= 10;
  const hasBitcoin = state.resources.bitcoin?.value > 0;
  const applyKnowledgeUnlocked = state.counters.knowledgeClicks?.value >= 3 || state.unlocks.applyKnowledge;
  
  return (
    <div className="space-y-3">
      {/* Обменять Bitcoin - показывается если есть майнер */}
      {state.buildings.miner && state.buildings.miner.unlocked && (
        <Button 
          variant="outline"
          className="w-full justify-center py-4 text-sm"
          disabled={!hasBitcoin}
          onClick={handleExchangeBtc}
        >
          Обменять Bitcoin
        </Button>
      )}
      
      {/* Применить все знания - показывается после разблокировки "Применить знания" */}
      {applyKnowledgeUnlocked && (
        <Button 
          variant="outline"
          className="w-full justify-center py-4 text-sm"
          disabled={!canApplyKnowledge}
          onClick={handleApplyAllKnowledge}
        >
          Применить все знания
        </Button>
      )}
      
      {/* Применить знания */}
      {applyKnowledgeUnlocked && (
        <Button 
          variant="default"
          className="w-full justify-center py-4 text-sm bg-gray-900 hover:bg-gray-800"
          disabled={!canApplyKnowledge}
          onClick={handleApplyKnowledge}
        >
          Применить знания
        </Button>
      )}
      
      {/* Изучить крипту - всегда доступна */}
      <Button 
        variant="outline"
        className="w-full justify-center py-4 text-sm"
        onClick={handleGetKnowledge}
      >
        Изучить крипту
      </Button>
      
      {/* Служебная кнопка для тестирования */}
      <Button 
        variant="outline"
        className="w-full justify-center py-2 text-xs text-gray-500"
        onClick={handleFullUsdt}
      >
        Full USDT
      </Button>
    </div>
  );
};

export default ActionButtons;
