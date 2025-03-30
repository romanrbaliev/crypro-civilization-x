
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

  // Проверка доступности кнопки обмена Bitcoin
  useEffect(() => {
    // Проверяем наличие и состояние ресурса Bitcoin
    const bitcoinResource = resources.bitcoin;
    const hasBitcoin = bitcoinResource && bitcoinResource.unlocked && bitcoinResource.value > 0;
    setIsAvailable(hasBitcoin);
  }, [resources]);

  // Обработчик обмена Bitcoin на USDT
  const handleExchange = () => {
    console.log("ExchangeBtcButton: Нажата кнопка обмена Bitcoin");
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
  
  // Если Bitcoin не доступен или равен 0 и нет внешнего управления состоянием, не показываем кнопку
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
          <span className="text-xs font-semibold">Обменять Bitcoin</span>
        </div>
      </Button>
    </div>
  );
};

export default ExchangeBtcButton;
