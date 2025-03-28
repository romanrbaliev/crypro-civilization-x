
import React, { useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { ChevronDown, ChevronRight } from 'lucide-react';
import TechTreeNode from './TechTreeNode';
import { Upgrade } from '@/context/types';

interface TechTreeCategoryProps {
  categoryId: string;
  name: string;
  description: string;
  icon: string;
  initialOpen?: boolean;
  onAddEvent: (message: string, type: string) => void;
}

const TechTreeCategory: React.FC<TechTreeCategoryProps> = ({
  categoryId,
  name,
  description,
  icon,
  initialOpen = false,
  onAddEvent
}) => {
  const { state } = useGame();
  const [isOpen, setIsOpen] = useState(initialOpen);

  // Получаем исследования для данной категории с правильным приведением типов
  const getCategoryUpgrades = () => {
    return Object.entries(state.upgrades)
      .filter(([_, upgrade]) => {
        const u = upgrade as Upgrade;
        return u.category === categoryId;
      })
      .map(([_, upgrade]) => upgrade as Upgrade);
  };

  // Группируем исследования по уровням
  const groupByTier = (upgrades: Upgrade[]) => {
    const tierGroups: { [tier: number]: Upgrade[] } = {};
    
    upgrades.forEach(upgrade => {
      const tier = upgrade.tier || 1;
      if (!tierGroups[tier]) {
        tierGroups[tier] = [];
      }
      tierGroups[tier].push(upgrade);
    });
    
    return tierGroups;
  };

  // Группируем по специализации
  const groupBySpecialization = (upgrades: Upgrade[]) => {
    const specializationGroups: { [specialization: string]: Upgrade[] } = {
      general: []
    };
    
    upgrades.forEach(upgrade => {
      if (upgrade.specialization) {
        if (!specializationGroups[upgrade.specialization]) {
          specializationGroups[upgrade.specialization] = [];
        }
        specializationGroups[upgrade.specialization].push(upgrade);
      } else {
        specializationGroups.general.push(upgrade);
      }
    });
    
    return specializationGroups;
  };

  const categoryUpgrades = getCategoryUpgrades();
  
  // Разделяем на активные и неактивные
  const availableUpgrades = categoryUpgrades.filter(upgrade => upgrade.unlocked && !upgrade.purchased);
  const purchasedUpgrades = categoryUpgrades.filter(upgrade => upgrade.purchased);
  const lockedUpgrades = categoryUpgrades.filter(upgrade => !upgrade.unlocked && !upgrade.purchased);

  // Если категория пуста, не показываем её
  if (categoryUpgrades.length === 0) {
    return null;
  }

  // Группируем по уровням
  const tierGroups = groupByTier(categoryUpgrades);

  return (
    <div className="bg-white shadow-sm rounded-md overflow-hidden border">
      <div
        className="p-2 flex items-center cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="mr-2">{icon}</div>
        <div className="flex-1">
          <h3 className="text-sm font-medium">{name}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </div>
      
      {isOpen && (
        <div className="p-2 pt-0">
          {Object.keys(tierGroups).sort((a, b) => Number(a) - Number(b)).map(tier => (
            <div key={tier} className="mt-2">
              <h4 className="text-xs text-gray-500 mb-1">Уровень {tier}</h4>
              <div className="space-y-1">
                {tierGroups[Number(tier)]
                  .sort((a, b) => (a.specialization || 'z').localeCompare(b.specialization || 'z'))
                  .map(upgrade => (
                    <TechTreeNode
                      key={upgrade.id}
                      upgrade={upgrade}
                      onAddEvent={onAddEvent}
                    />
                  ))}
              </div>
            </div>
          ))}
          
          {/* Дополнительная секция для исследований, которые еще не готовы быть показаны */}
          {lockedUpgrades.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 italic text-center">
                Доступны ещё {lockedUpgrades.length} исследований при выполнении требований
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TechTreeCategory;
