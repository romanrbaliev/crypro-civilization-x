
import { useCallback, useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';

interface UseActionButtonsProps {
  onAddEvent: (message: string, type: string) => void;
}

export const useActionButtons = ({ onAddEvent }: UseActionButtonsProps) => {
  const { state, dispatch } = useGame();
  const [knowledgeClicks, setKnowledgeClicks] = useState(0);
  const [bitcoinExchangeTimer, setBitcoinExchangeTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Расчет эффективности применения знаний
  const getKnowledgeEfficiency = useCallback(() => {
    // Проверяем улучшение "Основы криптовалют"
    const hasCryptoBasics = 
      (state.upgrades.cryptoCurrencyBasics?.purchased === true) ||
      (state.upgrades.cryptoBasics?.purchased === true);
    
    // Базовая эффективность: 10 знаний = 1 USDT
    // +10% от исследования "Основы криптовалют"
    const baseEfficiency = 0.1; // 1/10
    const bonusEfficiency = hasCryptoBasics ? 0.01 : 0; // +10% = +0.01
    
    return baseEfficiency + bonusEfficiency; // Итоговая эффективность
  }, [state.upgrades]);
  
  // Обработчик клика по кнопке "Изучить крипту"
  const handleLearnClick = useCallback(() => {
    dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", value: 1 }});
    
    // Увеличиваем счетчик кликов по кнопке "Изучить крипту"
    dispatch({
      type: "INCREMENT_COUNTER",
      payload: { counterId: "knowledgeClicks", value: 1 }
    });
    
    // Локальный счетчик для отслеживания разблокировок в текущей сессии
    setKnowledgeClicks(prev => prev + 1);
  }, [dispatch]);
  
  // Обменивает знания на USDT (10 знаний = 1 USDT)
  const handleApplyKnowledge = useCallback(() => {
    dispatch({ type: "APPLY_KNOWLEDGE" });
  }, [dispatch]);
  
  // Обрабатывает обмен 10 знаний на 1 USDT (или сколько возможно)
  const handleApplyAllKnowledge = useCallback(() => {
    if (!state.resources.knowledge) return;
    
    const efficiency = getKnowledgeEfficiency();
    const knowledgeValue = state.resources.knowledge.value || 0;
    
    if (knowledgeValue < 10) {
      onAddEvent("Недостаточно знаний для применения (минимум 10)", "error");
      return;
    }
    
    dispatch({ type: "APPLY_ALL_KNOWLEDGE" });
    
    // Рассчитываем результат для уведомления
    // Применяются знания кратно 10
    const knowledgeToApply = Math.floor(knowledgeValue / 10) * 10;
    const gainedUsdt = knowledgeToApply * efficiency;
    
    onAddEvent(`Применено ${knowledgeToApply} знаний. Получено ${gainedUsdt.toFixed(1)} USDT`, "success");
  }, [dispatch, onAddEvent, state.resources.knowledge, getKnowledgeEfficiency]);
  
  // Обрабатывает обмен Bitcoin на USDT
  const handleExchangeBitcoin = useCallback(() => {
    if (bitcoinExchangeTimer) return; // Предотвращаем мультиклик
    
    // Обмениваем Bitcoin на USDT
    try {
      dispatch({ type: "EXCHANGE_BTC" });
      
      setBitcoinExchangeTimer(setTimeout(() => {
        setBitcoinExchangeTimer(null);
      }, 2000)); // Задержка 2 секунды между возможными обменами
      
      onAddEvent(`Bitcoin обменен на USDT по курсу ${currentExchangeRate}`, "success");
    } catch (error) {
      console.error("Ошибка при обмене Bitcoin:", error);
      onAddEvent("Ошибка при обмене Bitcoin", "error");
    }
  }, [dispatch, onAddEvent, currentExchangeRate, bitcoinExchangeTimer]);
  
  // Текущий курс обмена Bitcoin к USDT
  const currentExchangeRate = state.miningParams?.exchangeRate || 20000;
  
  // Флаг скрытия кнопки "Изучить крипту"
  const shouldHideLearnButton = false; // Всегда показываем кнопку
  
  // Разблокирована ли кнопка "Применить знания"
  const applyKnowledgeUnlocked = state.unlocks?.applyKnowledge === true;
  
  return {
    handleLearnClick,
    handleApplyKnowledge,
    handleApplyAllKnowledge,
    handleExchangeBitcoin,
    currentExchangeRate,
    shouldHideLearnButton,
    applyKnowledgeUnlocked,
  };
};
