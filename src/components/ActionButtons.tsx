
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Button } from './ui/button';
import { useUnlockStatus } from '@/systems/unlock/hooks/useUnlockManager';

const ActionButtons: React.FC = () => {
  const { state, dispatch } = useGame();
  
  // Функция для обработки изучения крипты
  const handleLearnCrypto = () => {
    dispatch({ 
      type: 'INCREMENT_RESOURCE', 
      payload: { resourceId: 'knowledge', amount: 1 } 
    });
  };
  
  // Функция для обработки применения знаний
  const handleApplyKnowledge = () => {
    dispatch({ type: 'APPLY_KNOWLEDGE' });
  };
  
  // Функция для обработки майнинга
  const handleMining = () => {
    dispatch({ type: 'MINING_POWER' });
  };
  
  // Функция для обработки обмена Bitcoin
  const handleExchangeBtc = () => {
    dispatch({ type: 'EXCHANGE_BTC' });
  };
  
  // Проверяем разблокировку различных кнопок
  const isApplyKnowledgeUnlocked = state.knowledge >= 3;
  const isMiningUnlocked = useUnlockStatus('bitcoin');
  const isExchangeBtcUnlocked = isMiningUnlocked && state.resources.bitcoin?.value > 0;
  
  return (
    <div className="space-y-3">
      <Button 
        onClick={handleLearnCrypto}
        className="w-full h-12"
        variant="default"
      >
        Изучить крипту
      </Button>
      
      {isApplyKnowledgeUnlocked && (
        <Button 
          onClick={handleApplyKnowledge}
          className="w-full h-12"
          variant="secondary"
          disabled={state.knowledge < 10}
        >
          Применить знания
        </Button>
      )}
      
      {isMiningUnlocked && (
        <Button 
          onClick={handleMining}
          className="w-full h-12"
          variant="outline"
        >
          Майнинг
        </Button>
      )}
      
      {isExchangeBtcUnlocked && (
        <Button 
          onClick={handleExchangeBtc}
          className="w-full h-12"
          variant="outline"
        >
          Обменять Bitcoin
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
