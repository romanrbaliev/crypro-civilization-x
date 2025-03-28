
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TechTreeNode from './TechTreeNode';
import { useGame } from '@/context/hooks/useGame';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getSpecializationName } from '@/utils/researchUtils';

interface TechTreeCategoryProps {
  categoryId: string;
  name: string;
  description: string;
  icon: string;
  onAddEvent: (message: string, type: string) => void;
  initialOpen?: boolean;
}

const TechTreeCategory: React.FC<TechTreeCategoryProps> = ({ 
  categoryId, 
  name, 
  description, 
  icon,
  onAddEvent,
  initialOpen = true
}) => {
  const { state } = useGame();
  const [isOpen, setIsOpen] = useState(initialOpen);

  // Фильтруем исследования, принадлежащие к данной категории
  const categoryUpgrades = Object.values(state.upgrades)
    .filter(upgrade => upgrade.category === categoryId)
    .sort((a, b) => {
      // Сначала сортируем по tier
      if (a.tier !== b.tier) {
        return a.tier - b.tier;
      }
      // Если tier одинаковый, сортируем по specialization
      // Исследования без специализации идут первыми
      if (!a.specialization && b.specialization) return -1;
      if (a.specialization && !b.specialization) return 1;
      if (a.specialization === b.specialization) return 0;
      return a.specialization < b.specialization ? -1 : 1;
    });

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
  
  // Подсчет разблокированных исследований
  const unlockedResearchCount = categoryUpgrades.filter(u => u.unlocked && !u.purchased).length;
  
  // Подсчет завершенных исследований
  const purchasedResearchCount = categoryUpgrades.filter(u => u.purchased).length;
  
  // Общее количество исследований в категории
  const totalResearchCount = categoryUpgrades.length;
  
  // Процент завершения категории
  const completionPercentage = totalResearchCount > 0 
    ? Math.round((purchasedResearchCount / totalResearchCount) * 100) 
    : 0;
  
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
          <div>
            <h3 className="text-sm font-medium">{name}</h3>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <span>{purchasedResearchCount}/{totalResearchCount} изучено</span>
              {unlockedResearchCount > 0 && (
                <span className="text-blue-500">{unlockedResearchCount} доступно</span>
              )}
            </div>
          </div>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <p className="text-xs text-gray-500 mt-1 mb-3">{description}</p>
        
        {/* Индикатор прогресса категории */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
          <div 
            className="bg-blue-600 h-1.5 rounded-full" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        
        <div className="space-y-4">
          {tiers.map(tier => {
            // Сгруппируем исследования этого уровня по специализациям
            const tierUpgrades = upgradeTiers[tier];
            const specializations = {} as { [key: string]: typeof tierUpgrades };
            
            tierUpgrades.forEach(upgrade => {
              const spec = upgrade.specialization || 'general';
              if (!specializations[spec]) {
                specializations[spec] = [];
              }
              specializations[spec].push(upgrade);
            });
            
            return (
              <div key={tier} className="flex flex-col gap-2">
                <div className="text-[10px] text-gray-500 font-medium">Уровень {tier}</div>
                
                {Object.entries(specializations).map(([spec, upgrades]) => (
                  <div key={spec} className="mb-2">
                    {spec !== 'general' && (
                      <div className="text-[9px] text-purple-600 mb-1 font-medium">
                        Специализация: {getSpecializationName(spec)}
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-2">
                      {upgrades.map(upgrade => (
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
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TechTreeCategory;
