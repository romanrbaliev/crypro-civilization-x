
import React, { useState, useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bitcoin, Zap, Server, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatNumber } from "@/utils/helpers";
import { calculateCurrentExchangeRate } from "@/context/reducers/cryptoReducer";
import { Progress } from "@/components/ui/progress";

const MiningInfo: React.FC = () => {
  const { state } = useGame();
  const [currentRate, setCurrentRate] = useState<number>(0);
  
  useEffect(() => {
    if (state.resources.btc.unlocked) {
      setCurrentRate(calculateCurrentExchangeRate(state));
    }
  }, [state.gameTime]);
  
  // Если автомайнер не куплен, не показываем компонент
  if (state.buildings.autoMiner.count === 0) {
    return null;
  }
  
  // Расчет показателей майнинга
  const computingPower = state.resources.computingPower.value;
  const btcPerSecond = state.resources.btc.perSecond;
  const btcPerHour = btcPerSecond * 3600;
  const usdtPerHour = btcPerHour * currentRate * (1 - state.miningParams.exchangeCommission);
  
  // Расчет электропотребления от майнинга
  const electricityConsumption = state.miningParams.basePowerConsumption * 
    computingPower * (1 - state.miningParams.energyEfficiency);
  
  // Расчет показателей эффективности
  const efficiency = state.miningParams.miningEfficiency * 100000; // для отображения в удобном формате
  const energyEff = state.miningParams.energyEfficiency * 100; // в процентах
  
  // Расчет процента колебания курса от базового
  const priceFluctuation = ((currentRate / state.miningParams.baseExchangeRate) - 1) * 100;
  const isPriceUp = priceFluctuation >= 0;
  
  return (
    <Card className="w-full mb-4">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Server className="h-4 w-4" />
          Криптомайнинг
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Bitcoin className="h-3 w-3 text-amber-500" />
            <span>Добыча:</span>
          </div>
          <div className="font-medium">{formatNumber(btcPerHour)} BTC/час</div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CreditCard className="h-3 w-3 text-green-500" />
            <span>Прибыль:</span>
          </div>
          <div className="font-medium">{formatNumber(usdtPerHour)} USDT/час</div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-yellow-500" />
            <span>Потребление:</span>
          </div>
          <div className="font-medium">{formatNumber(electricityConsumption)} эл/сек</div>
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div>Эффективность майнинга:</div>
          <div className="font-medium">{formatNumber(efficiency)}</div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>Энергоэффективность:</div>
          <div className="font-medium">{formatNumber(energyEff)}%</div>
        </div>
        
        <Separator />
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Bitcoin className="h-3 w-3 text-amber-500" />
              <span>Курс BTC:</span>
            </div>
            <div className={`font-medium flex items-center ${isPriceUp ? 'text-green-500' : 'text-red-500'}`}>
              {formatNumber(currentRate)} USDT
              <span className="ml-1 text-[9px]">
                ({isPriceUp ? '+' : ''}{priceFluctuation.toFixed(1)}%)
              </span>
            </div>
          </div>
          
          <Progress 
            value={50 + (priceFluctuation / 2)} 
            max={100} 
            className="h-1"
          />
          
          <div className="flex justify-between text-[9px] text-gray-500">
            <div>{formatNumber(state.miningParams.baseExchangeRate * (1 - state.miningParams.volatility))}</div>
            <div>{formatNumber(state.miningParams.baseExchangeRate)}</div>
            <div>{formatNumber(state.miningParams.baseExchangeRate * (1 + state.miningParams.volatility))}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MiningInfo;
