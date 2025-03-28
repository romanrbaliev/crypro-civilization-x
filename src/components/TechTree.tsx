
import React, { useEffect } from 'react';
import { researchCategories } from '@/utils/gameConfig';
import TechTreeCategory from './TechTreeCategory';
import { Lightbulb } from 'lucide-react';
import { useGame } from '@/context/hooks/useGame';
import { isBlockchainBasicsUnlocked } from '@/utils/researchUtils';

interface TechTreeProps {
  onAddEvent: (message: string, type: string) => void;
}

const TechTree: React.FC<TechTreeProps> = ({ onAddEvent }) => {
  const { state } = useGame();

  // ИСПРАВЛЕНО: Упрощение проверки разблокированных исследований
  const hasUnlockedResearch = state.unlocks.research === true;
  
  // Получаем количество активных категорий
  const getActiveCategoriesCount = () => {
    return Object.values(researchCategories)
      .filter(category => {
        const categoryUpgrades = Object.values(state.upgrades)
          .filter(u => u.category === category.id);
        
        return categoryUpgrades.some(u => u.unlocked || u.purchased);
      }).length;
  };
  
  // Количество активных категорий
  const activeCategoriesCount = getActiveCategoriesCount();

  // Подробная диагностика для отладки
  useEffect(() => {
    console.log("TechTree: исследования разблокированы:", hasUnlockedResearch);
    console.log("TechTree: флаг research в unlocks:", state.unlocks.research);
    console.log("TechTree: активных категорий:", activeCategoriesCount);
    
    // Проверяем наличие и статус "Основы блокчейна"
    const basicBlockchainExists = state.upgrades.basicBlockchain !== undefined;
    const blockchainBasicsExists = state.upgrades.blockchain_basics !== undefined;
    
    console.log("TechTree: Существует basicBlockchain:", basicBlockchainExists);
    console.log("TechTree: Существует blockchain_basics:", blockchainBasicsExists);
    
    if (basicBlockchainExists) {
      console.log("TechTree: Статус basicBlockchain:", 
        state.upgrades.basicBlockchain.unlocked ? "разблокировано" : "заблокировано", 
        state.upgrades.basicBlockchain.purchased ? "куплено" : "не куплено"
      );
    }
    
    if (blockchainBasicsExists) {
      console.log("TechTree: Статус blockchain_basics:", 
        state.upgrades.blockchain_basics.unlocked ? "разблокировано" : "заблокировано", 
        state.upgrades.blockchain_basics.purchased ? "куплено" : "не куплено"
      );
    }
  }, [state.unlocks.research, state.upgrades]);

  return (
    <div className="p-2 flex flex-col h-full overflow-y-auto">
      <h2 className="text-sm font-semibold mb-2">Древо технологий</h2>
      
      {hasUnlockedResearch ? (
        <div className="space-y-3">
          {Object.values(researchCategories)
            .sort((a, b) => a.order - b.order)
            .map(category => (
              <TechTreeCategory
                key={category.id}
                categoryId={category.id}
                name={category.name}
                description={category.description}
                icon={category.icon}
                onAddEvent={onAddEvent}
                initialOpen={activeCategoriesCount <= 3} // Автоматически открываем категории, если их мало
              />
            ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p className="text-xs">Продолжайте накапливать знания для открытия исследований</p>
          <p className="text-[10px] mt-1">Первые исследования станут доступны после определённого прогресса</p>
        </div>
      )}
    </div>
  );
};

export default TechTree;
