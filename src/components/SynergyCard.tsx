
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Puzzle, CheckCircle, Lock } from 'lucide-react';
import { formatEffect } from '@/utils/researchUtils';
import { useGame } from '@/context/hooks/useGame';
import { SpecializationSynergy, Upgrade } from '@/context/types';

interface SynergyCardProps {
  synergy: SpecializationSynergy;
  onActivate: (synergyId: string) => void;
}

const SynergyCard: React.FC<SynergyCardProps> = ({ synergy, onActivate }) => {
  const { state } = useGame();
  
  // Подсчитываем, сколько исследований в каждой категории
  const getCategoryProgress = (category: string) => {
    const total = Object.entries(state.upgrades)
      .filter(([_, u]) => u.purchased && u.category === category)
      .length;
    
    return {
      current: total,
      required: synergy.requiredCount,
      complete: total >= synergy.requiredCount
    };
  };
  
  // Рендеринг прогресса для каждой категории
  const renderCategoryProgress = () => {
    return synergy.requiredCategories.map(category => {
      const progress = getCategoryProgress(category);
      
      // Ищем первое исследование этой категории для получения имени категории
      const categoryUpgrade = Object.entries(state.upgrades)
        .find(([_, u]) => u.category === category);
      
      const categoryName = categoryUpgrade ? categoryUpgrade[1].category : category;
      
      const categoryDisplayName = {
        'blockchain': 'Блокчейн',
        'mining': 'Майнинг',
        'trading': 'Трейдинг',
        'investment': 'Инвестиции',
        'defi': 'DeFi',
        'social': 'Социальное влияние'
      }[categoryName as string] || categoryName;
      
      return (
        <div key={category} className="flex items-center justify-between text-xs mb-1">
          <span>{categoryDisplayName}:</span>
          <div className="flex items-center">
            <span className={progress.complete ? 'text-green-600' : 'text-gray-600'}>
              {progress.current}/{progress.required}
            </span>
            {progress.complete && <CheckCircle className="h-3 w-3 ml-1 text-green-600" />}
          </div>
        </div>
      );
    });
  };
  
  // Рендеринг бонусов
  const renderBonuses = () => {
    return Object.entries(synergy.bonus).map(([effectId, value]) => (
      <div key={effectId} className="text-blue-600 text-xs">
        {formatEffect(effectId, value)}
      </div>
    ));
  };
  
  return (
    <div className={`border ${synergy.active ? 'border-green-200 bg-green-50' : synergy.unlocked ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-100'} rounded-lg p-3 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <Puzzle className={`h-5 w-5 mr-2 ${synergy.active ? 'text-green-600' : synergy.unlocked ? 'text-blue-600' : 'text-gray-400'}`} />
          <h3 className="font-medium text-sm">{synergy.name}</h3>
        </div>
        
        {!synergy.unlocked && <Lock className="h-4 w-4 text-gray-400" />}
        {synergy.active && <CheckCircle className="h-4 w-4 text-green-600" />}
      </div>
      
      <p className="text-xs text-gray-600 mt-1 mb-2">{synergy.description}</p>
      
      <div className="bg-white rounded p-2 mb-2">
        <h4 className="text-xs font-medium mb-1">Требования:</h4>
        {renderCategoryProgress()}
      </div>
      
      <div className="bg-white rounded p-2 mb-3">
        <h4 className="text-xs font-medium mb-1">Бонусы:</h4>
        {renderBonuses()}
      </div>
      
      {synergy.unlocked && !synergy.active && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => onActivate(synergy.id)} 
                size="sm" 
                className="w-full text-xs"
              >
                Активировать синергию
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Активируйте синергию, чтобы получить бонусы</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default SynergyCard;
