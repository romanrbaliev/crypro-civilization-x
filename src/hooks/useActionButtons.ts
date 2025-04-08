
import { useCallback, useMemo } from "react";
import { useGame } from "@/context/hooks/useGame";

interface UseActionButtonsProps {
  onAddEvent: (message: string, type: string) => void;
}

export const useActionButtons = ({ onAddEvent }: UseActionButtonsProps) => {
  const { state, dispatch } = useGame();
  
  // Обработчик клика на кнопку "Изучить крипту"
  const handleLearnClick = useCallback(() => {
    dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: 1 } });
    dispatch({ type: "INCREMENT_COUNTER", payload: { counterId: "knowledgeClicks", value: 1 } });
  }, [dispatch]);
  
  // Обработчик применения всех знаний
  const handleApplyAllKnowledge = useCallback(() => {
    if ((state.resources.knowledge?.value || 0) < 10) {
      onAddEvent("Недостаточно знаний для применения", "warning");
      return;
    }
    
    dispatch({ type: "APPLY_ALL_KNOWLEDGE" });
    onAddEvent(`Знания успешно применены`, "success");
  }, [dispatch, state.resources.knowledge?.value, onAddEvent]);
  
  // Обработчик обмена биткоина
  const handleExchangeBitcoin = useCallback(() => {
    if (!state.resources.bitcoin || state.resources.bitcoin.value <= 0) {
      onAddEvent("У вас нет Bitcoin для обмена", "warning");
      return;
    }
    
    dispatch({ type: "EXCHANGE_BTC" });
  }, [dispatch, state.resources.bitcoin, onAddEvent]);
  
  // Получаем текущий курс обмена биткоина
  const currentExchangeRate = useMemo(() => {
    return state.miningParams?.exchangeRate || 20000;
  }, [state.miningParams?.exchangeRate]);
  
  // Проверяем разблокировку кнопки применения знаний
  const applyKnowledgeUnlocked = useMemo(() => {
    const knowledgeClickCount = 
      typeof state.counters.knowledgeClicks === 'object' 
        ? state.counters.knowledgeClicks.value 
        : (state.counters.knowledgeClicks || 0);
    
    return knowledgeClickCount >= 3;
  }, [state.counters.knowledgeClicks]);
  
  // Скрываем кнопку изучения когда производство достаточно высокое (50+ знаний/сек)
  const shouldHideLearnButton = useMemo(() => {
    return (state.resources.knowledge?.perSecond || 0) >= 50;
  }, [state.resources.knowledge?.perSecond]);
  
  return {
    handleLearnClick,
    handleApplyAllKnowledge,
    handleExchangeBitcoin,
    currentExchangeRate,
    shouldHideLearnButton,
    applyKnowledgeUnlocked,
  };
};
