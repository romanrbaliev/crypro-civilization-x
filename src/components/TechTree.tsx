
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

  // Проверка разблокировки вкладки исследований
  const isResearchTabUnlocked = state.unlocks.research === true;
  
  // Проверка наличия разблокированных или купленных исследований
  const hasUnlockedResearch = isResearchTabUnlocked || 
    Object.values(state.upgrades).some(u => (u.unlocked || u.purchased) && u.category);
  
  // Получаем список всех исследований и проверяем, какие разблокированы
  const getAllUnlockedResearch = () => {
    return Object.entries(state.upgrades)
      .filter(([_, upgrade]) => upgrade.unlocked || upgrade.purchased)
      .map(([id, upgrade]) => `${id}: ${upgrade.name} (unlocked=${upgrade.unlocked}, purchased=${upgrade.purchased})`);
  };
  
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

  // Подробное логирование для отладки
  useEffect(() => {
    console.log("TechTree: исследования разблокированы:", hasUnlockedResearch);
    console.log("TechTree: флаг research в unlocks:", state.unlocks.research);
    console.log("TechTree: активных категорий:", activeCategoriesCount);
    console.log("TechTree: разблокированные исследования:", getAllUnlockedResearch());
    
    // Проверяем конкретные исследования для отладки
    const basicBlockchain = state.upgrades.basicBlockchain || state.upgrades.blockchain_basics;
    console.log("TechTree: статус 'Основы блокчейна':", 
      basicBlockchain 
        ? `unlocked=${basicBlockchain.unlocked}, purchased=${basicBlockchain.purchased}` 
        : "не найдено");
    
    // Проверяем зависимости для разблокировки "Основы блокчейна"
    console.log("TechTree: количество генераторов:", state.buildings.generator.count);
  }, [state.unlocks.research, state.upgrades, state.buildings.generator.count]);

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
          <p className="text-[10px] mt-1">Первые исследования станут доступны после покупки генератора</p>
        </div>
      )}
    </div>
  );
};

export default TechTree;
