
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/hooks/useGame';
import { formatNumber } from '@/utils/helpers';

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
  const { state, dispatch } = useGame();
  const { resources } = state;
  const [isAvailable, setIsAvailable] = useState(false);
  const [btcAmount, setBtcAmount] = useState(0);
  const [usdtReceived, setUsdtReceived] = useState(0);

  // Проверка доступности кнопки обмена BTC
  useEffect(() => {
    // Проверяем наличие и состояние ресурса BTC
    const btcResource = resources.btc;
    const hasBtc = btcResource && btcResource.unlocked && btcResource.value > 0;
    setIsAvailable(hasBtc);
    
    // Обновляем информацию о количестве BTC и USDT, если ресурс доступен
    if (hasBtc) {
      setBtcAmount(btcResource.value);
      
      // Расчет получаемого USDT на основе текущего курса и комиссии
      const btcPrice = externalRate || state.miningParams.exchangeRate || 30000;
      const commission = state.miningParams.exchangeCommission || 0.05;
      
      const usdtAmountBeforeCommission = btcResource.value * btcPrice;
      const commissionAmount = usdtAmountBeforeCommission * commission;
      const finalUsdtAmount = usdtAmountBeforeCommission - commissionAmount;
      
      setUsdtReceived(finalUsdtAmount);
    } else {
      setBtcAmount(0);
      setUsdtReceived(0);
    }
  }, [resources, state.miningParams, externalRate]);

  // Обработчик обмена BTC на USDT
  const handleExchange = () => {
    // Если предоставлен внешний обработчик onClick, используем его
    if (onClick) {
      onClick();
    } else {
      // Иначе используем локальный обработчик
      dispatch({ type: 'EXCHANGE_BTC' });
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
          <span className="text-xs font-medium">Обменять BTC</span>
          <span className="text-[10px] opacity-75">
            {formatNumber(btcAmount)} BTC → {formatNumber(usdtReceived)} USDT
          </span>
        </div>
      </Button>
    </div>
  );
};

export default ExchangeBtcButton;
