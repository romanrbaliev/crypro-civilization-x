
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Puzzle, CheckCircle } from 'lucide-react';
import { formatEffect } from '@/utils/researchUtils';
import { useGame } from '@/context/hooks/useGame';
import { SpecializationSynergy, Upgrade } from '@/context/types';

interface SynergyCardProps {
  synergy: SpecializationSynergy;
  onActivate: (id: string) => void;
}

const SynergyCard: React.FC<SynergyCardProps> = ({ synergy, onActivate }) => {
  const { state } = useGame();
  
  // Проверяем категории исследований с правильным приведением типов
  const hasRequiredCategories = () => {
    const categoriesCount = Object.entries(state.upgrades)
      .filter(([_, upgrade]) => {
        const u = upgrade as Upgrade;
        return u.purchased && synergy.requiredCategories.includes(u.category || '');
      })
      .reduce((categories, [_, upgrade]) => {
        const u = upgrade as Upgrade;
        if (u.category) {
          return categories.add(u.category);
        }
        return categories;
      }, new Set<string>());
    
    return categoriesCount.size >= synergy.requiredCount;
  };
  
  // Проверяем статус синергии
  const isActive = synergy.active;
  const isMeetingRequirements = hasRequiredCategories();
  
  return (
    <div className={`p-3 rounded-md border ${isActive ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start gap-2">
        <Puzzle className={`h-5 w-5 mt-0.5 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm">{synergy.name}</h4>
            {isActive && <CheckCircle className="h-4 w-4 text-green-500" />}
          </div>
          <p className="text-xs text-gray-600 mt-1">{synergy.description}</p>
          
          <div className="mt-2 space-y-1">
            {Object.entries(synergy.bonus).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-gray-600">{formatEffect(key)}</span>
                <span className="font-medium text-gray-800">+{(value * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
          
          {!isActive && (
            <div className="mt-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        size="sm"
                        className="w-full text-xs"
                        disabled={!isMeetingRequirements}
                        onClick={() => onActivate(synergy.id)}
                      >
                        {isMeetingRequirements ? 'Активировать' : 'Требуются исследования'}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!isMeetingRequirements && (
                    <TooltipContent>
                      <p>Требуется {synergy.requiredCount} исследований из категорий: {synergy.requiredCategories.join(', ')}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SynergyCard;
