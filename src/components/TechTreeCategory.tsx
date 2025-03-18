
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TechTreeNode from './TechTreeNode';
import { useGame } from '@/context/hooks/useGame';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TechTreeCategoryProps {
  categoryId: string;
  name: string;
  description: string;
  icon: string;
  onAddEvent: (message: string, type: string) => void;
}

const TechTreeCategory: React.FC<TechTreeCategoryProps> = ({ 
  categoryId, 
  name, 
  description, 
  icon,
  onAddEvent
}) => {
  const { state } = useGame();
  const [isOpen, setIsOpen] = useState(true);

  // Фильтруем исследования, принадлежащие к данной категории
  const categoryUpgrades = Object.values(state.upgrades)
    .filter(upgrade => upgrade.category === categoryId)
    .sort((a, b) => a.tier - b.tier);

  // Группируем исследования по уровням (tier)
  const upgradeTiers: { [key: number]: typeof categoryUpgrades } = {};
  categoryUpgrades.forEach(upgrade => {
    if (!upgradeTiers[upgrade.tier]) {
      upgradeTiers[upgrade.tier] = [];
    }
    upgradeTiers[upgrade.tier].push(upgrade);
  });

  // Формируем массив уровней для удобного отображения
  const tiers = Object.keys(upgradeTiers).map(Number).sort((a, b) => a - b);

  // Проверяем, есть ли разблокированные или купленные исследования в этой категории
  const hasUnlockedOrPurchased = categoryUpgrades.some(u => u.unlocked || u.purchased);
  
  // Если в этой категории нет разблокированных или купленных исследований, не показываем категорию
  if (!hasUnlockedOrPurchased) return null;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mb-4 border rounded-lg p-2 bg-white"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="text-sm font-medium">{name}</h3>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <p className="text-xs text-gray-500 mt-1 mb-3">{description}</p>
        
        <div className="space-y-4">
          {tiers.map(tier => (
            <div key={tier} className="flex flex-col gap-2">
              <div className="text-[10px] text-gray-500 font-medium">Уровень {tier}</div>
              <div className="grid grid-cols-1 gap-2">
                {upgradeTiers[tier].map(upgrade => (
                  <TechTreeNode 
                    key={upgrade.id} 
                    upgrade={upgrade}
                    onAddEvent={onAddEvent}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TechTreeCategory;
