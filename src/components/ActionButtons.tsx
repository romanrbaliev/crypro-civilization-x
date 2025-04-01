
import React, { useCallback, useRef } from "react";
import { useActionButtons } from "@/hooks/useActionButtons";
import { Button } from "@/components/ui/button";
import { Brain, CreditCard, ChevronsUp } from 'lucide-react';
import { useGame } from "@/context/hooks/useGame";

interface ActionButtonsProps {
  onAddEvent: (message: string, type: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddEvent }) => {
  const { state } = useGame();
  const {
    handleLearnClick, 
    handleApplyAllKnowledge,
    handleExchangeBitcoin,
    currentExchangeRate,
    shouldHideLearnButton,
    applyKnowledgeUnlocked,
  } = useActionButtons({ onAddEvent });
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Визуальная проверка доступности кнопок
  const canApplyKnowledge = (state.resources.knowledge?.value || 0) >= 10;
  const canExchangeBitcoin = (state.resources.bitcoin?.value || 0) > 0;
  const bitcoinUnlocked = state.resources.bitcoin && state.resources.bitcoin.unlocked;
  
  // Обработчик быстрых кликов для кнопки изучения
  const handleLearnMouseDown = useCallback(() => {
    handleLearnClick();
    
    // Запускаем таймер для периодических кликов при удержании
    clickTimerRef.current = setInterval(() => {
      handleLearnClick();
    }, 150); // Интервал между автокликами (150мс)
  }, [handleLearnClick]);
  
  const handleLearnMouseUp = useCallback(() => {
    // Останавливаем автоклики при отпускании кнопки
    if (clickTimerRef.current) {
      clearInterval(clickTimerRef.current);
      clickTimerRef.current = null;
    }
  }, []);

  // Останавливаем автоклики при выходе курсора за пределы кнопки
  const handleLearnMouseLeave = useCallback(() => {
    if (clickTimerRef.current) {
      clearInterval(clickTimerRef.current);
      clickTimerRef.current = null;
    }
  }, []);
  
  // Очистка таймера при размонтировании компонента
  React.useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearInterval(clickTimerRef.current);
        clickTimerRef.current = null;
      }
    };
  }, []);
  
  return (
    <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
      {/* Только показываем кнопку изучения, если генерация знаний не слишком высока */}
      {!shouldHideLearnButton && (
        <Button 
          variant="secondary"
          className="flex items-center justify-center py-6 px-4"
          onMouseDown={handleLearnMouseDown}
          onMouseUp={handleLearnMouseUp}
          onMouseLeave={handleLearnMouseLeave}
          onTouchStart={handleLearnClick} // Для мобильных устройств
          onTouchEnd={() => {}}
        >
          <Brain className="mr-2 h-5 w-5" />
          <span className="text-base">Изучить крипту</span>
        </Button>
      )}
      
      {/* Кнопка применения знаний появляется после разблокировки */}
      {applyKnowledgeUnlocked && (
        <Button 
          variant={canApplyKnowledge ? "default" : "outline"}
          className="flex items-center justify-center py-6 px-4"
          onClick={handleApplyAllKnowledge}
          disabled={!canApplyKnowledge}
        >
          <ChevronsUp className="mr-2 h-5 w-5" />
          <span className="text-base">Применить знания</span>
        </Button>
      )}
      
      {/* Кнопка обмена Bitcoin появляется только если разблокирован Bitcoin */}
      {bitcoinUnlocked && (
        <Button
          variant={canExchangeBitcoin ? "default" : "outline"}
          className={`flex items-center justify-center py-6 px-4 ${
            !canExchangeBitcoin ? "opacity-50" : ""
          }`}
          onClick={handleExchangeBitcoin}
          disabled={!canExchangeBitcoin}
        >
          <CreditCard className="mr-2 h-5 w-5" />
          <span className="text-base">Обменять Bitcoin</span>
          <small className="text-xs ml-2">
            1 BTC = {currentExchangeRate.toLocaleString()} USDT
          </small>
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
