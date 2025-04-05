
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGame } from '@/context/hooks/useGame';
import { formatNumber } from '@/utils/helpers';

const GameStats: React.FC = () => {
  const { state } = useGame();
  
  // Получение статистики из состояния игры
  const getTotalBuildings = () => {
    return Object.values(state.buildings).reduce((total, building) => total + building.count, 0);
  };
  
  const getTotalUpgrades = () => {
    return Object.values(state.upgrades).filter(upgrade => upgrade.purchased).length;
  };
  
  const getTotalResourcesProduced = () => {
    // В идеале здесь нужно хранить счетчик всех произведенных ресурсов
    // Но пока можно использовать приблизительные значения
    const knowledgeCount = state.counters.learn?.value || 0;
    const electricityFromGenerators = state.buildings.generator?.count * 100 || 0;
    const computingPowerFromComputers = state.buildings.homeComputer?.count * 50 || 0;
    
    return knowledgeCount + electricityFromGenerators + computingPowerFromComputers;
  };
  
  const getGameTime = () => {
    const seconds = Math.floor(state.gameTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} ч ${minutes % 60} мин`;
    } else if (minutes > 0) {
      return `${minutes} мин ${seconds % 60} сек`;
    } else {
      return `${seconds} сек`;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Статистика игры</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Время игры:</span>
            <span className="font-medium">{getGameTime()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Всего зданий:</span>
            <span className="font-medium">{getTotalBuildings()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Исследования:</span>
            <span className="font-medium">{getTotalUpgrades()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Знаний изучено:</span>
            <span className="font-medium">{formatNumber(state.counters.learn?.value || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Знаний применено:</span>
            <span className="font-medium">{formatNumber(state.counters.applyKnowledge?.value || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Майнинг BTC:</span>
            <span className="font-medium">{formatNumber(state.counters.mining?.value || 0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameStats;
