
import React from "react";
import { Button } from "@/components/ui/button";
import { Bitcoin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGame } from "@/context/hooks/useGame";
import { formatNumber } from "@/utils/helpers";

interface ExchangeBtcButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const ExchangeBtcButton: React.FC<ExchangeBtcButtonProps> = ({ 
  onClick, 
  disabled 
}) => {
  const { state } = useGame();
  const btcValue = state.resources.btc?.value || 0;
  const exchangeRate = calculateCurrentExchangeRate(state);
  const potentialUsdt = btcValue * exchangeRate * (1 - state.miningParams.exchangeCommission);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            className="w-full"
            variant={disabled ? "outline" : "default"}
            size="sm"
            disabled={disabled}
          >
            <Bitcoin className="mr-2 h-4 w-4" />
            Обменять BTC
          </Button>
        </TooltipTrigger>
        {disabled ? (
          <TooltipContent>
            <p>У вас нет BTC для обмена</p>
          </TooltipContent>
        ) : (
          <TooltipContent>
            <p>Курс: 1 BTC = {formatNumber(exchangeRate)} USDT</p>
            <p>Комиссия: {state.miningParams.exchangeCommission * 100}%</p>
            <p>Вы получите: {formatNumber(potentialUsdt)} USDT</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

// Функция для расчета текущего курса обмена
function calculateCurrentExchangeRate(state: any) {
  const { baseExchangeRate, volatility, oscillationPeriod } = state.miningParams;
  const time = state.gameTime;
  
  return baseExchangeRate * (1 + volatility * Math.sin(time / oscillationPeriod));
}

export default ExchangeBtcButton;
