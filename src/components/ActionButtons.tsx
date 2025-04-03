
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
  // Добавляем флаг для отслеживания выполненного нажатия
  const touchStartedRef = useRef<boolean>(false);
  
  // Визуальная проверка доступности кнопок
  const canApplyKnowledge = (state.resources.knowledge?.value || 0) >= 10;
  const canExchangeBitcoin = (state.resources.bitcoin?.value || 0) > 0;
  const bitcoinUnlocked = state.resources.bitcoin && state.resources.bitcoin.unlocked;
  
  // Обработчик для мышки - без изменений
  const handleLearnMouseDown = useCallback(() => {
    // Делаем только один клик при нажатии
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
  
  // ИСПРАВЛЕНИЕ: Переработанный обработчик для касаний с проверкой и защитой от двойного срабатывания
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Предотвращаем стандартное поведение браузера
    e.preventDefault();
    
    // Проверяем, не выполняется ли уже нажатие
    if (touchStartedRef.current) return;
    
    // Устанавливаем флаг начала касания
    touchStartedRef.current = true;
    
    // Выполняем клик
    handleLearnClick();
  }, [handleLearnClick]);
  
  const handleTouchEnd = useCallback(() => {
    // Сбрасываем флаг касания
    touchStartedRef.current = false;
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
          className={`py-3 px-4 text-sm h-8 ${!canExchangeBitcoin ? "opacity-50" : ""}`}
          onClick={handleExchangeBitcoin}
          disabled={!canExchangeBitcoin}
        >
          <span className="text-xs">Обменять Bitcoin</span>
        </Button>
      );
    }
    
    // Кнопка применения знаний появляется после разблокировки (В середине)
    if (applyKnowledgeUnlocked) {
      buttons.push(
        <Button 
          key="apply-knowledge"
          variant={canApplyKnowledge ? "default" : "outline"}
          className="py-2 px-4 h-8 text-xs"
          onClick={handleApplyAllKnowledge}
          disabled={!canApplyKnowledge}
        >
          <span className="text-xs">Применить знания</span>
        </Button>
      );
    }
    
    // Кнопка "Изучить крипту" всегда внизу, если её показываем
    if (!shouldHideLearnButton) {
      buttons.push(
        <Button 
          key="learn-crypto"
          variant="secondary"
          className="py-2 px-4 h-8 text-xs"
          onMouseDown={handleLearnMouseDown}
          onMouseUp={handleLearnMouseUp}
          onMouseLeave={handleLearnMouseLeave}
          // ИСПРАВЛЕНИЕ: Обновляем обработчики для сенсорных устройств
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <span className="text-xs">Изучить крипту</span>
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
