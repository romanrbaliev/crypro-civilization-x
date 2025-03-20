
import React from "react";
import { useGame } from "@/context/hooks/useGame";
import { formatNumber } from "@/utils/helpers";

const ResourceList = () => {
  const { state } = useGame();
  const { resources } = state;
  
  // Получаем текущий курс BTC для отображения
  const getBtcPrice = (): string => {
    const baseRate = state.miningParams.exchangeRate;
    const volatility = state.miningParams.volatility;
    const period = state.miningParams.exchangePeriod;
    const time = state.gameTime;
    
    // Расчет текущего курса с учетом волатильности
    const currentRate = baseRate * (1 + volatility * Math.sin(time / period));
    return currentRate.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };
  
  // Фильтруем только разблокированные ресурсы для отображения
  const unlockedResources = Object.values(resources).filter(resource => resource.unlocked);
  
  return (
    <div className="p-3 space-y-2">
      <h2 className="text-sm font-semibold mb-2">Ресурсы</h2>
      
      {unlockedResources.map(resource => (
        <div key={resource.id} className="flex justify-between items-center text-xs p-2 border rounded bg-white">
          <div className="flex items-center">
            <div className="mr-2">{resource.icon || "📊"}</div>
            <div>
              <div className="font-medium">{resource.name}</div>
              <div className="text-gray-500 text-[10px]">{resource.description}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold">
              {resource.id === 'btc' 
                ? formatNumber(resource.value, 8) 
                : formatNumber(resource.value)}
              {resource.max !== Infinity && (
                <span className="font-normal text-gray-500"> / {formatNumber(resource.max)}</span>
              )}
            </div>
            {resource.perSecond !== 0 && (
              <div className={`text-[10px] ${resource.perSecond > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {resource.perSecond > 0 ? '+' : ''}{formatNumber(resource.perSecond)}/сек
              </div>
            )}
            {resource.id === 'btc' && (
              <div className="text-[10px] text-blue-600">
                Курс: {getBtcPrice()} USDT
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResourceList;
