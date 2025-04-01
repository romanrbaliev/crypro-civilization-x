
import React, { useCallback, useRef } from "react";
import { useActionButtons } from "@/hooks/useActionButtons";
import { Button } from "@/components/ui/button";
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
  
  // Создаем массив кнопок в нужном порядке (снизу вверх)
  const renderButtons = () => {
    const buttons = [];
    
    // Кнопка обмена Bitcoin появляется только если разблокирован Bitcoin (Вверху)
    if (bitcoinUnlocked) {
      buttons.push(
        <Button 
          key="exchange-bitcoin"
          variant={canExchangeBitcoin ? "default" : "outline"}
          className={`py-6 px-4 ${!canExchangeBitcoin ? "opacity-50" : ""}`}
          onClick={handleExchangeBitcoin}
          disabled={!canExchangeBitcoin}
        >
          <span className="text-base">Обменять Bitcoin</span>
          <small className="text-xs ml-2">
            1 BTC = {currentExchangeRate.toLocaleString()} USDT
          </small>
        </Button>
      );
    }
    
    // Кнопка применения знаний появляется после разблокировки (В середине)
    if (applyKnowledgeUnlocked) {
      buttons.push(
        <Button 
          key="apply-knowledge"
          variant={canApplyKnowledge ? "default" : "outline"}
          className="py-6 px-4"
          onClick={handleApplyAllKnowledge}
          disabled={!canApplyKnowledge}
        >
          <span className="text-base">Применить знания</span>
        </Button>
      );
    }
    
    // Кнопка "Изучить крипту" всегда внизу, если её показываем
    if (!shouldHideLearnButton) {
      buttons.push(
        <Button 
          key="learn-crypto"
          variant="secondary"
          className="py-6 px-4"
          onMouseDown={handleLearnMouseDown}
          onMouseUp={handleLearnMouseUp}
          onMouseLeave={handleLearnMouseLeave}
          onTouchStart={handleLearnClick}
          onTouchEnd={() => {}}
        >
          <span className="text-base">Изучить крипту</span>
        </Button>
      );
    }
    
    return buttons;
  };
  
  return (
    <div className="p-2 grid grid-cols-1 gap-2 mt-4">
      {renderButtons()}
    </div>
  );
};

export default ActionButtons;
