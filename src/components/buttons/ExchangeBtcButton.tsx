
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/hooks/useGame';

interface ExchangeBtcButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  currentRate?: number;
}

const ExchangeBtcButton: React.FC<ExchangeBtcButtonProps> = ({ 
  onClick, 
  disabled: externalDisabled,
  className = "",
  currentRate: externalRate
}) => {
  const { state } = useGame();
  const { resources } = state;
  const [isAvailable, setIsAvailable] = useState(false);

  // Проверка доступности кнопки обмена BTC
  useEffect(() => {
    // Проверяем наличие и состояние ресурса BTC
    const btcResource = resources.btc;
    const hasBtc = btcResource && btcResource.unlocked && btcResource.value > 0;
    setIsAvailable(hasBtc);
  }, [resources]);

  // Обработчик обмена BTC на USDT
  const handleExchange = () => {
    console.log("ExchangeBtcButton: Нажата кнопка обмена BTC");
    // Если предоставлен внешний обработчик onClick, используем его
    if (onClick) {
      onClick();
    } else {
      // Иначе используем локальный обработчик
      // dispatch({ type: "EXCHANGE_BTC" }); // Закомментировано, так как используется внешний обработчик
    }
  };

  // Определяем финальное состояние кнопки (внешнее или внутреннее)
  const isDisabled = externalDisabled !== undefined ? externalDisabled : !isAvailable;
  
  // Если BTC не доступен или равен 0 и нет внешнего управления состоянием, не показываем кнопку
  if (!isAvailable && externalDisabled === undefined) return null;

  return (
    <div className="my-1">
      <Button 
        variant="secondary"
        size="sm"
        className={`w-full border border-orange-300 bg-orange-50 hover:bg-orange-100 ${className}`}
        onClick={handleExchange}
        disabled={isDisabled}
      >
        <div className="flex flex-col items-center w-full">
          <span className="text-xs font-semibold">Обменять BTC</span>
        </div>
      </Button>
    </div>
  );
};

export default ExchangeBtcButton;
