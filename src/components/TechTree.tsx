
import React, { useEffect } from 'react';
import { researchCategories } from '@/utils/gameConfig';
import TechTreeCategory from './TechTreeCategory';
import { Lightbulb } from 'lucide-react';
import { useGame } from '@/context/hooks/useGame';

interface TechTreeProps {
  onAddEvent: (message: string, type: string) => void;
}

const TechTree: React.FC<TechTreeProps> = ({ onAddEvent }) => {
  const { state } = useGame();

  // ИСПРАВЛЕНО: Улучшение проверки разблокированных исследований
  const hasUnlockedResearch = state.unlocks.research === true || 
    Object.values(state.upgrades).some(u => (u.unlocked || u.purchased) && u.category);
  
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

  console.log("TechTree: исследования разблокированы:", hasUnlockedResearch);
  console.log("TechTree: флаг research в unlocks:", state.unlocks.research);
  console.log("TechTree: активных категорий:", activeCategoriesCount);

  // ИСПРАВЛЕНО: Добавлена проверка разблокировки конкретных исследований
  useEffect(() => {
    if (state.unlocks.research && state.upgrades.blockchain_basics?.unlocked) {
      console.log("TechTree: 'Основы блокчейна' разблокировано:", state.upgrades.blockchain_basics.unlocked);
      console.log("TechTree: upgrade объект:", state.upgrades.blockchain_basics);
    } else {
      console.log("TechTree: 'Основы блокчейна' не разблокировано");
      if (state.upgrades.blockchain_basics) {
        console.log("TechTree: Статус blockchain_basics:", state.upgrades.blockchain_basics.unlocked);
      } else {
        console.log("TechTree: blockchain_basics не существует в state.upgrades");
      }
    }
  }, [state.unlocks.research, state.upgrades.blockchain_basics]);

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
