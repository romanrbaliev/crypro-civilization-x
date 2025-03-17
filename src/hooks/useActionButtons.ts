
import { useGame } from '@/context/hooks/useGame';

export const useActionButtons = () => {
  const { state, dispatch } = useGame();
  
  // Проверка, разблокирована ли функция "Применить знания"
  const isApplyKnowledgeUnlocked = state.unlocks.applyKnowledge;
  
  // Проверка, разблокирована ли функция "Практика"
  const isPracticeUnlocked = state.unlocks.practice;
  
  // Проверка, разблокирован ли ресурс USDT
  const isUsdtUnlocked = state.resources.usdt.unlocked;
  
  // Проверка, разблокирован ли ресурс "Вычислительная мощность"
  const isComputingPowerUnlocked = state.resources.computingPower.unlocked;
  
  // Проверка, разблокирован ли ресурс BTC
  const isBtcUnlocked = state.resources.btc.unlocked;
  
  // Проверка, есть ли автомайнер
  const hasAutoMiner = state.buildings.autoMiner.count > 0;
  
  // Проверка, куплена ли практика
  const hasPracticeBuilding = state.buildings.practice.count > 0;
  
  // Функция клика на кнопку "Изучить крипту"
  const handleLearnClick = () => {
    dispatch({ 
      type: 'INCREMENT_RESOURCE', 
      payload: { resourceId: 'knowledge' } 
    });
  };
  
  // Функция клика на кнопку "Применить знания"
  const handleApplyKnowledgeClick = () => {
    dispatch({ type: 'APPLY_KNOWLEDGE' });
  };
  
  // Функция клика на кнопку "Практика"
  const handlePracticeClick = () => {
    dispatch({ type: 'PRACTICE_PURCHASE' });
  };
  
  // Функция клика на кнопку "Майнить USDT"
  const handleMineClick = () => {
    dispatch({ type: 'MINE_COMPUTING_POWER' });
  };
  
  // Функция обмена BTC на USDT
  const handleExchangeBtcClick = () => {
    dispatch({ type: 'EXCHANGE_BTC' });
  };
  
  // Проверка, может ли пользователь майнить (достаточно ли вычислительной мощности)
  const canMine = state.resources.computingPower.value >= 50;
  
  // Проверка, может ли пользователь обменять BTC (есть ли BTC для обмена)
  const canExchangeBtc = state.resources.btc.value > 0;
  
  return {
    handleLearnClick,
    handleApplyKnowledgeClick,
    handlePracticeClick,
    handleMineClick,
    handleExchangeBtcClick,
    isApplyKnowledgeUnlocked,
    isPracticeUnlocked,
    isUsdtUnlocked,
    isComputingPowerUnlocked,
    isBtcUnlocked,
    hasAutoMiner,
    hasPracticeBuilding,
    canMine,
    canExchangeBtc
  };
};
