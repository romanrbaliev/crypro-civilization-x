
import React from 'react';
import { researchCategories } from '@/utils/gameConfig';
import TechTreeCategory from './TechTreeCategory';
import { Lightbulb } from 'lucide-react';
import { useGame } from '@/context/hooks/useGame';

interface TechTreeProps {
  onAddEvent: (message: string, type: string) => void;
}

const TechTree: React.FC<TechTreeProps> = ({ onAddEvent }) => {
  const { state } = useGame();

  // Проверяем, есть ли разблокированные или купленные исследования
  const hasUnlockedResearch = Object.values(state.upgrades).some(u => 
    (u.unlocked || u.purchased) && u.category
  );

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
