import React, { useCallback, useRef } from "react";
import { useActionButtons } from "@/hooks/useActionButtons";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/hooks/useGame";
import { useTranslation } from "@/i18n"; // Импортируем хук для переводов
import { ensureUnlocksExist } from '@/utils/unlockHelper';

interface ActionButtonsProps {
  onAddEvent: (message: string, type: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddEvent }) => {
  const { state } = useGame();
  const safeState = ensureUnlocksExist(state); // Обеспечиваем наличие структуры unlocks
  const { t } = useTranslation(); // Используем хук для переводов
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
  const canApplyKnowledge = (safeState.resources.knowledge?.value || 0) >= 10;
  const canExchangeBitcoin = (safeState.resources.bitcoin?.value || 0) > 0;
  const bitcoinUnlocked = safeState.resources.bitcoin && safeState.resources.bitcoin.unlocked;
  
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
          className={`py-3 px-4 text-sm h-8 ${!canExchangeBitcoin ? "opacity-50" : ""}`}
          onClick={handleExchangeBitcoin}
          disabled={!canExchangeBitcoin}
        >
          <span className="text-xs">{t('actions.exchangeBitcoin')}</span>
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
          <span className="text-xs">{t('actions.applyKnowledge')}</span>
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
          onTouchStart={handleLearnClick}
          onTouchEnd={() => {}}
        >
          <span className="text-xs">{t('actions.learnCrypto')}</span>
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
