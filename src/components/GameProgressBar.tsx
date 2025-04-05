
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/context/hooks/useGame';

interface GameProgressBarProps {
  className?: string;
}

const GameProgressBar: React.FC<GameProgressBarProps> = ({ className }) => {
  const { state } = useGame();
  
  // Вычисляем прогресс на основе разблокированных зданий и улучшений
  const calculateProgress = () => {
    // Общее количество возможных зданий и улучшений
    const totalBuildings = Object.keys(state.buildings).length;
    const totalUpgrades = Object.keys(state.upgrades).length;
    
    // Количество разблокированных зданий и улучшений
    const unlockedBuildings = Object.values(state.buildings).filter(b => b.unlocked).length;
    const unlockedUpgrades = Object.values(state.upgrades).filter(u => u.unlocked).length;
    
    // Прогресс в процентах
    const buildingProgress = totalBuildings > 0 ? (unlockedBuildings / totalBuildings) * 100 : 0;
    const upgradeProgress = totalUpgrades > 0 ? (unlockedUpgrades / totalUpgrades) * 100 : 0;
    
    // Общий прогресс (среднее значение между зданиями и улучшениями)
    return Math.floor((buildingProgress + upgradeProgress) / 2);
  };
  
  const progress = calculateProgress();
  
  return (
    <div className={`w-full space-y-1 ${className}`}>
      <div className="flex justify-between items-center text-xs">
        <span className="font-medium">Прогресс игры</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default GameProgressBar;
